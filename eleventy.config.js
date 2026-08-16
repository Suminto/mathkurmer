const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Salin aset statis apa adanya
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/ebooks");
  eleventyConfig.addPassthroughCopy({ admin: "admin" });
  eleventyConfig.addPassthroughCopy("src/images");

  const md = markdownIt({ html: true, breaks: false });
  eleventyConfig.setLibrary("md", md);

  // PENTING (lihat skill ebook-interaktif-html): markdown-it mengikuti aturan CommonMark
  // yang menganggap backslash sebelum tanda baca ASCII ( ) [ ] sebagai karakter escape,
  // sehingga "\(" ditulis penulis akan berubah jadi "(" saja di output — delimiter MathJax
  // rusak tanpa gejala visual yang jelas. Solusi: "lindungi" backslash delimiter MathJax
  // sebelum masuk ke markdown-it (ganti jadi placeholder aman), lalu kembalikan setelah
  // render. Dengan begini penulis konten di CMS cukup mengetik "\(...\)" secara alami.
  const MATH_BACKSLASH_PLACEHOLDER = "\uE000";
  function protectMathBackslashes(str) {
    return String(str).replace(/\\([()[\]])/g, MATH_BACKSLASH_PLACEHOLDER + "$1");
  }
  function restoreMathBackslashes(str) {
    return str.split(MATH_BACKSLASH_PLACEHOLDER).join("\\");
  }

  // Filter untuk merender string markdown (dipakai untuk field deskripsi & ringkasan bab)
  eleventyConfig.addFilter("markdown", (content) => {
    if (!content) return "";
    return restoreMathBackslashes(md.render(protectMathBackslashes(content)));
  });
  eleventyConfig.addFilter("markdownInline", (content) => {
    if (!content) return "";
    return restoreMathBackslashes(md.renderInline(protectMathBackslashes(content)));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
