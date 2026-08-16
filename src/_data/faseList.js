const domains = require("./domains.json");

module.exports = domains.flatMap((d) =>
  d.fase.map((f) => ({
    domainSlug: d.slug,
    domainNama: d.nama,
    domainDeskripsi: d.deskripsiSingkat,
    fase: f,
  }))
);
