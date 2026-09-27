import fs from "fs";
import path from "path";

const GEOAPIFY_TOKEN = process.env.GEOAPIFY_TOKEN || "d4d5a2e38d934da287b79d360de83e5d";

const zones = [
  { id: "sur-z1-mejia", name: "Sector Sur Zona 1 – Mejía", context: "Mejía, Pichincha, Ecuador", color: "red", icon: "graduation", institutions: ["Colegio Aloasí","Colegio Elia Liut","Colegio Mariano Negrete","Colegio Luis Felipe Borja","Colegio Santa María Marillac","Colegio José Mejía Lequerica","Colegio Machachi","Colegio Británico Los Andes","Colegio 11 de Noviembre","Colegio Alóag","Colegio Ismael Proaño","Colegio Uyumbicho","Colegio Cutulagua","Colegio 2 de Agosto"] },
  { id: "sur-z2-guamani", name: "Sector Sur Zona 2 – Guamaní", context: "Guamaní, Quito, Ecuador", color: "orange", icon: "graduation", institutions: ["Colegio 15 de Diciembre","Colegio Mushuk Kawsay","Colegio Oswaldo Lombeida","Colegio Julio Moreno","Colegio San Juan Bosco","Colegio Juan Guisnet","Colegio Manuela Santa Cruz y Espejo","Colegio Manuela Sáenz","Colegio Ricardo Cornejo","Colegio Celiano Monge","Colegio Nueva Aurora","Colegio Isabel Ruilova"] },
  { id: "sur-z3-beaterio-ibarra", name: "Sector Sur Zona 3 – Beaterio y Ciudadela Ibarra", context: "Beaterio, Quito, Ecuador", color: "amber", icon: "graduation", institutions: ["Colegio Municipal Bicentenario","Colegio Fiscal Bicentenario","Colegio Jean Irwin","Colegio Paul Dirac","Colegio Réplica Mejía","Colegio Isabel Robalino","Colegio Carlos Ponce – Fe y Alegría","Colegio Federico Larco","Colegio Economista Abdón Calderón","Colegio Arturo Borja","Colegio Antonio Nariño","Colegio Primicias de la Cultura de Quito"] },
  { id: "sur-z4-quitumbe-chillogallo", name: "Sector Sur Zona 4 – Quitumbe y Chillogallo", context: "Quitumbe, Quito, Ecuador", color: "emerald", icon: "graduation", institutions: ["Colegio Julio Tobar Donoso","Colegio Juan Pablo II","Colegio Jesús de Nazaret","Colegio Wers","Colegio Emilio Uzcátegui","Colegio Miguel de Santiago","Colegio Municipal Quitumbe","Colegio Rafael Bucheli","Colegio San Andrés Quitumbe","Colegio Aida Gallegos Lara","Colegio Nicolás Guillén"] },
  { id: "sur-z5-solanda", name: "Sector Sur Zona 5 – Solanda", context: "Solanda, Quito, Ecuador", color: "teal", icon: "graduation", institutions: ["Colegio Jorge Icaza","Colegio Réplica 24 de Mayo","Colegio Emaús – Fe y Alegría","Colegio Gonzalo Sandulbide","Colegio Cardenal Espínola","Colegio Consejo Provincial","Colegio Capitán Alfonso Arroyo","Colegio Gonzalo Escudero","Colegio Mazzarello","Colegio Técnico Sucre","Colegio 5 de Junio","Colegio José de la Cuadra","Colegio Liceo Policial","Colegio Andrés F. Córdova"] },
  { id: "sur-z6-magdalena-ferroviaria-recreo", name: "Sector Sur Zona 6 – La Magdalena, Ferroviaria y Recreo", context: "La Magdalena, Quito, Ecuador", color: "blue", icon: "graduation", institutions: ["Colegio Quito Sur","Colegio Ángel Modesto Paredes","Colegio Bethlemitas","Colegio Pablo VI","Colegio Técnico San José","Colegio Doroteas","Colegio Benito Juárez","Colegio Amazonas","Colegio Tarqui","Colegio José María Velaz – Fe y Alegría","Colegio Vicente Rocafuerte"] },
  { id: "sur-z7-villaflora-chimbacalle-recoleta", name: "Sector Sur Zona 7 – Villaflora, Chimbacalle y Recoleta", context: "Villaflora, Quito, Ecuador", color: "violet", icon: "graduation", institutions: ["Colegio Fedbip Pérez Pallares","Colegio Quito","Colegio Montúfar","Colegio Municipal Ricardo Chiriboga","Colegio 13 de Abril","Colegio María de Nazaret","Colegio 10 de Agosto – La Recoleta"] },
  { id: "centro-z1", name: "Sector Centro Zona Centro – Zona 1", context: "Centro Histórico, Quito, Ecuador", color: "pink", icon: "graduation", institutions: ["Colegio Fernández Madrid","Colegio Municipal Sucre","Colegio San Fernando","Colegio Sagrados Corazones","Colegio La Providencia","Colegio San Pedro Pascual","Colegio Borja 1","Colegio San Andrés Centro","Colegio Rafael Larrea","Colegio Darío Guevara"] },
  { id: "centro-z2", name: "Sector Centro Zona Centro – Zona 2", context: "Centro, Quito, Ecuador", color: "red", icon: "graduation", institutions: ["Colegio 10 de Agosto","Colegio Hermano Miguel La Salle","Colegio Cardenal de la Torre","Colegio Liceo Matovelle","Colegio Mejía","Colegio Espejo","Colegio Simón Bolívar","Colegio La Salle Febres Cordero","Colegio La Presentación"] },
  { id: "centro-z3", name: "Sector Centro Zona Centro – Zona 3", context: "La Tola, Quito, Ecuador", color: "orange", icon: "graduation", institutions: ["Colegio Don Bosco La Tola","Colegio Mercedarias","Colegio María Auxiliadora","Colegio Santiago de Guayaquil","Colegio Córdoba Galarza","Colegio Santa Marianita de Jesús","Colegio Manuela Cañizares","Colegio Santo Domingo de Guzmán","Colegio Femenino Spellman"] },
  { id: "centro-z4", name: "Sector Centro Zona Centro – Zona 4", context: "Quito, Ecuador", color: "amber", icon: "graduation", institutions: ["Colegio Juan Montalvo","Colegio Francisco de las Llagas","Colegio Alfonso del Hierro","Colegio Carlos Zambrano Orejuela","Colegio Gran Bretaña","Colegio Lazo Bermeo","Colegio Gran Colombia","Colegio Dillon","Colegio Numa Pompilio Llona","Colegio Lauro Orozco","Colegio La Dolorosa","Colegio Andino","Colegio San Francisco de Sales"] },
  { id: "norte-z1-carolina", name: "Sector Norte Zona Norte 1 – La Carolina", context: "La Carolina, Quito, Ecuador", color: "emerald", icon: "graduation", institutions: ["Colegio Borja 3","Colegio Rumipamba","Colegio República de Bolivia","Colegio Benalcázar","Colegio San Francisco","Colegio Velasco Ibarra","Colegio 24 de Mayo","Colegio Eufrasia","Colegio Central Técnico","Colegio Matta Martínez","Colegio Marista","Colegio Nuestra Señora del Rosario"] },
  { id: "norte-z2-kennedy-inca-carcelen", name: "Sector Norte Zona Norte 2 – La Kennedy, El Inca y Carcelén", context: "La Kennedy, Quito, Ecuador", color: "teal", icon: "graduation", institutions: ["Colegio Rumania","Colegio Camilo Ponce","Colegio Los Shirys","Colegio Don Bosco","Colegio Aviación Civil","Colegio Hipatia Cárdenas","Colegio Julio María Matovelle","Colegio Eloy Alfaro","Colegio Alvernia","Colegio Clan","Colegio La Salle","Colegio Rosario González Murillo","Colegio Liceo Policial"] },
  { id: "norte-z3-cotocollao", name: "Sector Norte Zona Norte 3 – Cotocollao", context: "Cotocollao, Quito, Ecuador", color: "blue", icon: "graduation", institutions: ["Colegio María Angélica Idrobo","Colegio Juan Pablo II","Colegio Andrés Bello","Colegio Patrimonio de la Humanidad","Colegio Amena del Hierro","Colegio La Salle, Alfonso del Hierro","Colegio Flannagan","Colegio Pablo VI, Cotocollao","Colegio Taylor de Chailin","Colegio Casa de la Cultura","Colegio Municipal Cotocollao"] },
  { id: "norte-z4-sanantonio-pomasqui-calderon", name: "Sector Norte Zona Norte 4 – San Antonio, Pomasqui y Calderón", context: "Calderón, Quito, Ecuador", color: "violet", icon: "graduation", institutions: ["Colegio Equinoccio","Colegio Mitad del Mundo","Colegio Von Humboldt","Colegio Municipal Eugenio Espejo","Colegio Réplica Montúfar","Colegio Municipal Calderón","Colegio Alfredo Cisneros","Colegio Muriel Ravier","Colegio Nacional Calderón","Colegio Luxemburgo"] },
];

// Centro aproximado de cada zona para validación y fallback
const zoneCenters = {
  "sur-z1-mejia": { lat: -0.50, lng: -78.57, radiusKm: 30 },
  "sur-z2-guamani": { lat: -0.33, lng: -78.55, radiusKm: 12 },
  "sur-z3-beaterio-ibarra": { lat: -0.31, lng: -78.55, radiusKm: 10 },
  "sur-z4-quitumbe-chillogallo": { lat: -0.28, lng: -78.55, radiusKm: 10 },
  "sur-z5-solanda": { lat: -0.26, lng: -78.53, radiusKm: 8 },
  "sur-z6-magdalena-ferroviaria-recreo": { lat: -0.24, lng: -78.53, radiusKm: 8 },
  "sur-z7-villaflora-chimbacalle-recoleta": { lat: -0.238, lng: -78.51, radiusKm: 6 },
  "centro-z1": { lat: -0.22, lng: -78.51, radiusKm: 6 },
  "centro-z2": { lat: -0.21, lng: -78.505, radiusKm: 6 },
  "centro-z3": { lat: -0.22, lng: -78.50, radiusKm: 6 },
  "centro-z4": { lat: -0.20, lng: -78.50, radiusKm: 8 },
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
  // Quito metro bbox ampliado
  if (lat < -0.60 || lat > 0.35 || lon < -78.80 || lon > -78.30) return false;
  const dist = haversine(lat, lon, c.lat, c.lng);
  if (dist > c.radiusKm) return false;
  // validación sectorial gruesa
  if (zoneId.startsWith("sur-") && lat > -0.18) return false; // sur no puede estar muy al norte
  if (zoneId.startsWith("norte-") && lat < -0.25) return false; // norte no puede estar muy al sur
  if (zoneId.startsWith("centro-") && (lat < -0.24 || lat > -0.14)) return false;
  return true;
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function fetchGeoapify(query){
  try{
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_TOKEN}&filter=countrycode:ec&bias=proximity:${zoneCenters["centro-z1"].lng},${zoneCenters["centro-z1"].lat}&limit=1&format=json`;
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
    // probar Geoapify primero (más rápido y con bias)
    const g = await fetchGeoapify(q);
    if (g){
      if (isValidForZone(g.lat, g.lon, zoneId)){
        const d = haversine(g.lat, g.lon, center.lat, center.lng);
        // penalizar si resulta ser calle genérica en geoapify
        const isStreetFallback = g.raw && g.raw.result_type === "street";
        const penalized = isStreetFallback ? d + 5 : d;
        if (penalized < bestDist){
          best = g; bestDist = penalized;
        }
      } else {
        // invalido por zona, pero guardamos como candidato débil si no hay mejor
        // no guardamos, solo log
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
    // si encontramos candidato muy cercano (<2km) ya no seguimos probando queries más genéricas
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
        markers.push({
          id: generateId(),
          lat: Number(geo.lat.toFixed(6)),
          lng: Number(geo.lon.toFixed(6)),
          title: inst,
          description: `${zone.name} · ${geo.display} [${geo.source}]`,
          icon: zone.icon,
          color: zone.color
        });
        ok++;
      } else {
        console.log(`FAIL - usando fallback zona`);
        const c = zoneCenters[zone.id];
        // fallback distribuido alrededor del centro de la zona
        const offsetLat = ( (i % 5) * 0.002 - 0.004 );
        const offsetLng = ( Math.floor(i/5) * 0.002 - 0.002 );
        markers.push({
          id: generateId(),
          lat: Number((c.lat + offsetLat).toFixed(6)),
          lng: Number((c.lng + offsetLng).toFixed(6)),
          title: inst,
          description: `${zone.name} · (sin geocodificación precisa - revisar) · centro zona ${c.lat},${c.lng}`,
          icon: zone.icon,
          color: zone.color
        });
        fail++;
      }
    }
    const fileName = `${zone.id}.json`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(markers, null, 2), "utf-8");
    console.log(` -> guardado ${filePath} ok:${ok} fail:${fail}`);
    summary.push({zone: zone.id, name: zone.name, file: fileName, ok, fail, total: zone.institutions.length});
  }
  fs.writeFileSync(path.join(outDir, "_resumen.json"), JSON.stringify(summary,null,2),"utf-8");
  console.log("\nResumen:", JSON.stringify(summary,null,2));
  const total = summary.reduce((a,s)=>a+s.total,0);
  const okTotal = summary.reduce((a,s)=>a+s.ok,0);
  console.log(`\nTOTAL instituciones: ${total} | Geocodificadas: ${okTotal} | Fallback: ${total-okTotal}`);
}

main().catch(e=>{console.error(e); process.exit(1)});
