const domains = require("./domains.json");
const domainDesc = require("./domainDesc.js")();

module.exports = domains.flatMap((d) =>
  d.fase.map((f) => ({
    domainSlug: d.slug,
    domainNama: d.nama,
    domainDeskripsi: (domainDesc[d.slug] && domainDesc[d.slug].deskripsiSingkat) || "",
    fase: f,
  }))
);
