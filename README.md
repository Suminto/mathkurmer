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

## Langkah Deploy ke Netlify (proyek baru, dari nol)

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Belajar Matematika"
git branch -M main
git remote add origin <URL_REPO_GITHUB_BARU_ANDA>
git push -u origin main
```

### 2. Hubungkan ke Netlify

1. Login ke [app.netlify.com](https://app.netlify.com)
2. **Add new site → Import an existing project** → pilih repo GitHub yang baru dibuat
3. Build command: `npm run build` (sudah otomatis terbaca dari `netlify.toml`)
4. Publish directory: `_site` (sudah otomatis terbaca dari `netlify.toml`)
5. Klik **Deploy**

### 3. Aktifkan Netlify Identity + Git Gateway (WAJIB untuk admin CMS)

Admin panel (`/admin`) butuh ini supaya Bapak bisa login dan menyimpan perubahan
langsung ke GitHub tanpa perlu buka GitHub manual.

1. Di dashboard site Netlify → **Site configuration → Identity → Enable Identity**
2. Di bagian **Registration**, pilih **Invite only** (supaya orang lain tidak bisa daftar sendiri)
3. Scroll ke **Services → Git Gateway → Enable Git Gateway**
4. Kembali ke tab **Identity → Invite users** → masukkan email Bapak sendiri
5. Cek email undangan → klik link → set password
6. Buka `https://nama-situs-anda.netlify.app/admin/` → login dengan email & password tadi

### 4. Mulai Isi Konten

Setelah login ke `/admin`, Bapak akan melihat daftar 30 slot "Domain — Fase". Klik salah
satu, isi deskripsi fase dan tambahkan Bab (judul, ringkasan materi, dan link ebook
interaktif jika ada). Klik **Publish** — perubahan otomatis ter-commit ke GitHub dan
Netlify akan build ulang situs (biasanya selesai dalam ~1 menit).

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

Setelah itu, jalankan `npm run build` (atau cukup `git push`, Netlify akan build otomatis) —
halaman baru otomatis muncul di sidebar dan siap diisi lewat admin. **Catatan:** kalau
menambah/mengubah domain, `admin/config.yml` juga perlu diupdate manual (tambah entri file
baru) supaya slot barunya muncul di CMS — beri tahu Claude kalau butuh bantuan generate ulang.
