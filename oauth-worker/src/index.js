/**
 * OAuth proxy untuk Decap CMS (backend "github").
 * Menggantikan fungsi Netlify Identity + Git Gateway saat deploy di luar Netlify.
 *
 * Alur:
 *  1. Admin CMS (di /admin) buka popup ke /auth
 *  2. /auth redirect ke halaman login GitHub (OAuth App)
 *  3. GitHub redirect balik ke /callback dengan "code"
 *  4. /callback tukar "code" jadi access token via GitHub API
 *  5. Token dikirim balik ke jendela admin CMS lewat postMessage
 *
 * Env var yang WAJIB diisi di Cloudflare Worker (Settings > Variables > Secrets):
 *  - GITHUB_OAUTH_CLIENT_ID
 *  - GITHUB_OAUTH_CLIENT_SECRET
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }

    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }

    return new Response(
      "Decap CMS GitHub OAuth proxy aktif. Endpoint: /auth dan /callback.",
      { status: 200 }
    );
  },
};

function handleAuth(url, env) {
  if (!env.GITHUB_OAUTH_CLIENT_ID) {
    return new Response(
      "GITHUB_OAUTH_CLIENT_ID belum diset di environment variable Worker.",
      { status: 500 }
    );
  }

  const redirectUri = `${url.origin}/callback`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);

  return Response.redirect(authorizeUrl.toString(), 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Parameter 'code' tidak ditemukan dari GitHub.", { status: 400 });
  }

  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) {
    return new Response(
      "GITHUB_OAUTH_CLIENT_ID / GITHUB_OAUTH_CLIENT_SECRET belum diset di environment variable Worker.",
      { status: 500 }
    );
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(
      `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`,
      { status: 400 }
    );
  }

  const payload = { token: tokenData.access_token, provider: "github" };
  const payloadJson = JSON.stringify(payload).replace(/</g, "\\u003c");

  // Halaman kecil ini "mengirim" token ke jendela admin CMS yang membuka popup ini,
  // mengikuti protokol handshake postMessage yang dipakai Decap CMS.
  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Autentikasi Berhasil</title></head>
<body>
  <p>Autentikasi berhasil. Jendela ini akan tertutup otomatis...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:github:success:${payloadJson}',
          e.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
