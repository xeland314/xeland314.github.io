// Avisa a Bing (IndexNow) de las URL del sitemap. Uso: node scripts/indexnow.mjs [--dry]
// La clave está en public/77ea8303c91edad55b91f44b08453857.txt (se sirve en la raíz del sitio, requisito de IndexNow).
import fs from "node:fs";
const KEY = "77ea8303c91edad55b91f44b08453857";
const HOST = "xeland314.github.io";
const sitemap = fs.readFileSync("dist/sitemap-0.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(urlList.length + " URL");
if (process.argv.includes("--dry")) process.exit(0);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(res.status, res.statusText);
