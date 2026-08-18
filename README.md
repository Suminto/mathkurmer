# Belajar Matematika — Kurikulum Merdeka

Website pembelajaran matematika dengan struktur **Domain → Fase → Bab**, dibangun dengan
[Eleventy](https://www.11ty.dev/) (static site generator) + [Decap CMS](https://decapcms.org/)
untuk pengisian konten via admin panel.

Dibangun oleh Suminto with Claude.

---

## Struktur Proyek

```
src/                    ← input Eleventy
  _data/domains.json    ← daftar Domain & Fase (menu sidebar + tab fase)
  _includes/layouts/     ← layout dasar (sidebar 2 kolom)
  _includes/partials/    ← sidebar & isi konten fase
  fase-pages.njk         ← generator otomatis halaman /domain/fase-x/
  domain-index.njk       ← generator otomatis halaman /domain/
  index.njk               ← Home
  about.njk                ← About
  assets/                  ← CSS & JS
  ebooks/                   ← file ebook interaktif (HTML tunggal, upload manual)
  images/                   ← gambar yang diupload lewat CMS

content/                 ← isi materi per Domain/Fase (diisi lewat admin CMS)
  bilangan/fase-d.md      ← contoh: sudah berisi Bab 1 (Bilangan Bulat) & Bab 2

admin/                    ← Decap CMS
  index.html
  config.yml               ← definisi 30 slot (5 Domain x 6 Fase)

netlify.toml
eleventy.config.js
```

## Cara Kerja Halaman Fase

Setiap kombinasi Domain × Fase (30 total) otomatis punya halaman sendiri, walau file
kontennya belum dibuat — akan tampil pesan "materi belum tersedia" sampai diisi lewat admin.
Tidak perlu bikin file HTML manual satu-satu; cukup edit `src/_data/domains.json` kalau mau
tambah/ubah Domain, semua halaman ikut ter-generate otomatis.

---

## Menjalankan di Komputer Sendiri

```bash
npm install
npm run serve
```

Buka `http://localhost:8080`.

## Build untuk Produksi

```bash
npm run build
```

Hasil ada di folder `_site/`.

---

## Langkah Deploy ke Cloudflare Pages

Situs ini dulu disiapkan untuk Netlify, sekarang dipindah ke **Cloudflare Pages**
(bandwidth unlimited, cocok untuk situs sekolah tanpa khawatir kena limit bulanan).
Karena Cloudflare tidak punya "Identity + Git Gateway" seperti Netlify, login admin CMS
memakai metode **GitHub OAuth** — perlu 2 setup tambahan (GitHub OAuth App + 1 Cloudflare
Worker kecil), tapi setelah selesai, cara pakai admin CMS-nya sama saja seperti biasa.

### 1. Deploy situs utama ke Cloudflare Pages

1. Login ke [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**
2. Pilih repo `suminto65/mathkurmer`
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `_site`
4. Klik **Save and Deploy**

Situs akan muncul di `https://mathkurmer.pages.dev` (atau nama sesuai project Cloudflare Bapak).

### 2. Buat GitHub OAuth App (untuk login admin)

1. Di GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Isi:
   - **Application name**: bebas, misal "Mathkurmer CMS"
   - **Homepage URL**: `https://mathkurmer.pages.dev` (URL Cloudflare Pages Bapak)
   - **Authorization callback URL**: `https://mathkurmer-oauth-proxy.SUBDOMAIN.workers.dev/callback`
     (isi sementara dulu, nanti disesuaikan setelah Worker ter-deploy di langkah 3 dan
     tahu subdomain aslinya — boleh diedit lagi setelahnya)
3. Klik **Register application**
4. Catat **Client ID**, lalu klik **Generate a new client secret** dan catat **Client Secret**
   (secret hanya muncul sekali)

### 3. Deploy Cloudflare Worker (jembatan OAuth)

Folder `oauth-worker/` di proyek ini adalah Worker terpisah, di-deploy sendiri (bukan
bagian dari build situs utama).

```bash
cd oauth-worker
npm install -g wrangler   # sekali saja, kalau belum ada
wrangler login
wrangler deploy
```

Setelah deploy, wrangler akan menampilkan URL Worker, contoh:
`https://mathkurmer-oauth-proxy.pasuminto.workers.dev`

Lalu set 2 secret (client ID & secret dari langkah 2):

```bash
wrangler secret put GITHUB_OAUTH_CLIENT_ID
wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
```

(akan diminta paste value masing-masing, tempel lalu Enter)

**Kembali ke GitHub OAuth App** (langkah 2) → update **Authorization callback URL** jadi
URL Worker yang asli + `/callback`, contoh:
`https://mathkurmer-oauth-proxy.pasuminto.workers.dev/callback`

### 4. Sambungkan URL Worker ke `admin/config.yml`

Buka `admin/config.yml`, cari baris `base_url`, ganti dengan URL Worker asli:

```yaml
backend:
  name: github
  repo: suminto65/mathkurmer
  branch: main
  base_url: https://mathkurmer-oauth-proxy.pasuminto.workers.dev
  auth_endpoint: auth
```

Commit & push perubahan ini ke GitHub — Cloudflare Pages akan otomatis build ulang.

### 5. Login ke Admin

Buka `https://mathkurmer.pages.dev/admin/` → klik **Login with GitHub** → akan muncul
popup GitHub → izinkan akses → otomatis masuk ke dashboard CMS.

**Catatan:** karena backend `github` langsung terhubung ke repo (bukan lewat Git Gateway),
siapa pun yang login harus punya akses **push** ke repo `suminto65/mathkurmer` di GitHub
(collaborator). Kalau nanti mau kasih akses admin ke orang lain, tambahkan sebagai
collaborator repo di GitHub, bukan lewat undangan CMS seperti dulu di Netlify Identity.

---

## (Arsip) Deploy ke Netlify

File `netlify.toml` masih tersimpan di proyek ini kalau suatu saat mau kembali ke Netlify
(misal setelah limit bulan berikutnya reset). Kalau kembali ke Netlify, backend
`admin/config.yml` perlu diganti balik ke:

```yaml
backend:
  name: git-gateway
  branch: main
```

dan Netlify Identity + Git Gateway diaktifkan lagi lewat dashboard Netlify (lihat riwayat
percakapan sebelumnya untuk detail langkahnya).

---

## Mengisi Konten Lewat Admin

Setelah login ke `/admin`, Bapak akan melihat daftar 30 slot "Domain — Fase". Klik salah
satu, isi deskripsi fase dan tambahkan Bab (judul, ringkasan materi, dan link ebook
interaktif jika ada). Klik **Publish** — perubahan otomatis ter-commit ke GitHub dan
Cloudflare Pages akan build ulang situs (biasanya selesai dalam 1-2 menit).

**Menambahkan ebook interaktif baru:**
1. Upload file HTML ebook ke folder `src/ebooks/` di GitHub (lewat web GitHub: buka folder →
   Add file → Upload files), atau tambahkan lewat `git push` dari komputer.
2. Di admin CMS, isi field **Link Ebook Interaktif** dengan `/ebooks/nama-file.html`

**Menulis rumus matematika di CMS:**
Cukup ketik seperti biasa — tidak perlu backslash ganda:
- Rumus di tengah kalimat: `\(3x + 5 = 20\)`
- Rumus berdiri sendiri: `\[x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}\]`

---

## Menambah / Mengubah Domain atau Fase

Edit `src/_data/domains.json`. Contoh menambah domain baru:

```json
{
  "slug": "slug-baru",
  "nama": "Nama Domain Baru",
  "deskripsiSingkat": "Deskripsi singkat.",
  "fase": ["A", "B", "C", "D", "E", "F"]
}
```

Setelah itu, jalankan `npm run build` (atau cukup `git push`, Cloudflare Pages akan build
otomatis) — halaman baru otomatis muncul di sidebar dan siap diisi lewat admin. **Catatan:**
kalau menambah/mengubah domain, `admin/config.yml` juga perlu diupdate manual (tambah entri
file baru) supaya slot barunya muncul di CMS — beri tahu Claude kalau butuh bantuan generate
ulang.
