import fs from "fs";
import path from "path";
const GEOAPIFY_TOKEN = "d4d5a2e38d934da287b79d360de83e5d";
const zones = [
  { id: "norte-z1-carolina", name: "Sector Norte Zona Norte 1 – La Carolina", context: "La Carolina, Quito, Ecuador", color: "emerald", icon: "graduation", institutions: ["Colegio Borja 3","Colegio Rumipamba","Colegio República de Bolivia","Colegio Benalcázar","Colegio San Francisco","Colegio Velasco Ibarra","Colegio 24 de Mayo","Colegio Eufrasia","Colegio Central Técnico","Colegio Matta Martínez","Colegio Marista","Colegio Nuestra Señora del Rosario"] },
  { id: "norte-z2-kennedy-inca-carcelen", name: "Sector Norte Zona Norte 2 – La Kennedy, El Inca y Carcelén", context: "La Kennedy, Quito, Ecuador", color: "teal", icon: "graduation", institutions: ["Colegio Rumania","Colegio Camilo Ponce","Colegio Los Shirys","Colegio Don Bosco","Colegio Aviación Civil","Colegio Hipatia Cárdenas","Colegio Julio María Matovelle","Colegio Eloy Alfaro","Colegio Alvernia","Colegio Clan","Colegio La Salle","Colegio Rosario González Murillo","Colegio Liceo Policial"] },
  { id: "norte-z3-cotocollao", name: "Sector Norte Zona Norte 3 – Cotocollao", context: "Cotocollao, Quito, Ecuador", color: "blue", icon: "graduation", institutions: ["Colegio María Angélica Idrobo","Colegio Juan Pablo II","Colegio Andrés Bello","Colegio Patrimonio de la Humanidad","Colegio Amena del Hierro","Colegio La Salle, Alfonso del Hierro","Colegio Flannagan","Colegio Pablo VI, Cotocollao","Colegio Taylor de Chailin","Colegio Casa de la Cultura","Colegio Municipal Cotocollao"] },
  { id: "norte-z4-sanantonio-pomasqui-calderon", name: "Sector Norte Zona Norte 4 – San Antonio, Pomasqui y Calderón", context: "Calderón, Quito, Ecuador", color: "violet", icon: "graduation", institutions: ["Colegio Equinoccio","Colegio Mitad del Mundo","Colegio Von Humboldt","Colegio Municipal Eugenio Espejo","Colegio Réplica Montúfar","Colegio Municipal Calderón","Colegio Alfredo Cisneros","Colegio Muriel Ravier","Colegio Nacional Calderón","Colegio Luxemburgo"] },
];
const zoneCenters = {
  "norte-z1-carolina": { lat: -0.18, lng: -78.48, radiusKm: 8 },
  "norte-z2-kennedy-inca-carcelen": { lat: -0.12, lng: -78.47, radiusKm: 12 },
  "norte-z3-cotocollao": { lat: -0.08, lng: -78.49, radiusKm: 10 },
  "norte-z4-sanantonio-pomasqui-calderon": { lat: -0.02, lng: -78.45, radiusKm: 15 },
};
function haversine(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function isValidForZone(lat, lon, zoneId){
  const c = zoneCenters[zoneId];
  if (!c) return false;
  if (lat < -0.60 || lat > 0.35 || lon < -78.80 || lon > -78.30) return false;
  const dist = haversine(lat, lon, c.lat, c.lng);
  if (dist > c.radiusKm) return false;
  if (zoneId.startsWith("norte-") && lat < -0.25) return false;
  return true;
}
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
async function fetchGeoapify(query){
  try{
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_TOKEN}&filter=countrycode:ec&bias=proximity:-78.48,-0.18&limit=1&format=json`;
    const res = await fetch(url, { headers: { "Accept": "application/json", "User-Agent": "xeland314-map-generator/1.0" }});
    if (!res.ok) { await sleep(300); return null; }
    const data = await res.json();
    await sleep(300);
    if (data && data.results && data.results.length>0){
      const r = data.results[0];
      return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), display: r.formatted || r.address_line1, query, source: "geoapify", raw: r };
    }
  }catch(e){ await sleep(300); }
  return null;
}
async function fetchNominatim(query){
  try{
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=ec&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "Accept": "application/json", "User-Agent": "xeland314-map-generator/1.0" }});
    if (!res.ok) { await sleep(1100); return null; }
    const data = await res.json();
    await sleep(1100);
    if (data && data.length>0){
      const r = data[0];
      return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), display: r.display_name, query, source: "nominatim", raw: r };
    }
  }catch(e){ await sleep(1100); }
  return null;
}
async function geocode(name, context, zoneId){
  const queries = [
    `${name}, ${context}`,
    `${name}, Quito, Ecuador`,
    `${name}, Ecuador`,
  ];
  let best = null;
  let bestDist = Infinity;
  const center = zoneCenters[zoneId];
  for (const q of queries){
    const g = await fetchGeoapify(q);
    if (g){
      if (isValidForZone(g.lat, g.lon, zoneId)){
        const d = haversine(g.lat, g.lon, center.lat, center.lng);
        const isStreetFallback = g.raw && g.raw.result_type === "street";
        const penalized = isStreetFallback ? d + 5 : d;
        if (penalized < bestDist){
          best = g; bestDist = penalized;
        }
      }
    }
    const n = await fetchNominatim(q);
    if (n){
      if (isValidForZone(n.lat, n.lon, zoneId)){
        const d = haversine(n.lat, n.lon, center.lat, center.lng);
        if (d < bestDist){
          best = n; bestDist = d;
        }
      }
    }
    if (best && bestDist < 2) break;
  }
  return best;
}
function generateId(){ return Math.random().toString(36).slice(2,9); }
async function main(){
  const outDir = path.join(process.cwd(), "rutas_json");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});
  const summary = [];
  for (const zone of zones){
    console.log(`\n=== ${zone.name} (${zone.institutions.length}) ===`);
    const markers = [];
    let ok=0, fail=0;
    for (let i=0;i<zone.institutions.length;i++){
      const inst = zone.institutions[i];
      process.stdout.write(`  ${i+1}/${zone.institutions.length} ${inst} ... `);
      const geo = await geocode(inst, zone.context, zone.id);
      if (geo){
        const c = zoneCenters[zone.id];
        const dist = haversine(geo.lat, geo.lon, c.lat, c.lng).toFixed(1);
        console.log(`ok ${geo.lat},${geo.lon} (${geo.source}:${geo.query}) dist:${dist}km`);
        markers.push({ id: generateId(), lat: Number(geo.lat.toFixed(6)), lng: Number(geo.lon.toFixed(6)), title: inst, description: `${zone.name} · ${geo.display} [${geo.source}]`, icon: zone.icon, color: zone.color });
        ok++;
      } else {
        console.log(`FAIL - usando fallback zona`);
        const c = zoneCenters[zone.id];
        const offsetLat = ( (i % 5) * 0.002 - 0.004 );
        const offsetLng = ( Math.floor(i/5) * 0.002 - 0.002 );
        markers.push({ id: generateId(), lat: Number((c.lat + offsetLat).toFixed(6)), lng: Number((c.lng + offsetLng).toFixed(6)), title: inst, description: `${zone.name} · (sin geocodificación precisa - revisar) · centro zona ${c.lat},${c.lng}`, icon: zone.icon, color: zone.color });
        fail++;
      }
    }
    const fileName = `${zone.id}.json`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(markers, null, 2), "utf-8");
    console.log(` -> guardado ${filePath} ok:${ok} fail:${fail}`);
    summary.push({zone: zone.id, name: zone.name, file: fileName, ok, fail, total: zone.institutions.length});
  }
  console.log("\nResumen:", JSON.stringify(summary,null,2));
}
main().catch(e=>{console.error(e); process.exit(1)});
