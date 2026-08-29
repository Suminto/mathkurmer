const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIR = path.join(__dirname, "..", "..", "content", "bilangan-aljabar-dst");

// Folder domain yang valid (harus sinkron dengan slug di domains.json)
const DOMAIN_DIR = path.join(__dirname, "..", "..", "content");
const VALID_DOMAIN_FOLDERS = [
  "bilangan",
  "aljabar",
  "pengukuran",
  "geometri",
  "analisis-data-peluang",
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

module.exports = function () {
  const files = [];
  for (const domainFolder of VALID_DOMAIN_FOLDERS) {
    const dir = path.join(DOMAIN_DIR, domainFolder);
    for (const filePath of walk(dir)) {
      const fileName = path.basename(filePath); // contoh: fase-a.md
      const match = fileName.match(/^fase-([a-f])\.md$/i);
      if (!match) continue; // lewati file yang bukan pola fase-x.md

      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);

      files.push({
        data: parsed.data,
        // domain & fase DIAMBIL DARI PATH FILE, bukan dari isi front matter,
        // supaya tidak bergantung pada field tersembunyi yang kadang tidak
        // ikut tersimpan saat file baru dibuat lewat Decap CMS.
        domain: domainFolder,
        fase: match[1].toUpperCase(),
        filePath,
      });
    }
  }
  return files;
};
