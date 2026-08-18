const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const PAGES_DIR = path.join(__dirname, "..", "..", "content", "pages");

module.exports = function () {
  const result = {};
  if (!fs.existsSync(PAGES_DIR)) return result;

  for (const entry of fs.readdirSync(PAGES_DIR)) {
    if (!entry.endsWith(".md")) continue;
    const slug = entry.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(PAGES_DIR, entry), "utf8");
    const parsed = matter(raw);
    result[slug] = parsed.data;
  }

  return result;
};
