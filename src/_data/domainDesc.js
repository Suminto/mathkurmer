const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const DIR = path.join(__dirname, "..", "..", "content", "domain-desc");

module.exports = function () {
  const result = {};
  if (!fs.existsSync(DIR)) return result;

  for (const entry of fs.readdirSync(DIR)) {
    if (!entry.endsWith(".md")) continue;
    const slug = entry.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(DIR, entry), "utf8");
    const parsed = matter(raw);
    result[slug] = parsed.data;
  }

  return result;
};
