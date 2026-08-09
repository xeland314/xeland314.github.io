import type {
  SeriesConfig,
  SeriesItem,
  Alphabet,
  SeriesAlfabeticaPattern,
} from "./types";
import { ALPHABETS } from "./types";

/** PRNG determinista (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Ciclo acumulativo simple: cada vuelta añade un elemento al bloque repetido.
 *  bloque1=[a,b], bloque2=[a,b,c], bloque3=[a,b,c,d]...
 */
function genAcumulativo(
  alphabet: string,
  ciclo: number,
  longitudTotal: number,
  rng: () => number,
): string {
  let serie = "";
  const base = alphabet[0];
  bloque: while (serie.length < longitudTotal) {
    for (let n = 2; n <= ciclo + 1 && serie.length < longitudTotal; n++) {
      for (let i = 0; i < n && serie.length < longitudTotal; i++) {
        serie += alphabet[i % alphabet.length];
      }
    }
    if (serie.length < longitudTotal) continue bloque;
  }
  return serie.slice(0, longitudTotal);
}

/** Ciclo fijo de longitud N: el alfabeto se repite en bucle sin cambios. */
function genFijo(alphabet: string, ciclo: number, longitudTotal: number): string {
  const base = alphabet.slice(0, ciclo);
  if (base.length === 0) return "";
  let serie = "";
  while (serie.length < longitudTotal) {
    serie += base;
  }
  return serie.slice(0, longitudTotal);
}

/** Ciclo con salto fijo: avanza k posiciones en cada paso (aritmética modular). */
function genSalto(alphabet: string, salto: number, longitudTotal: number): string {
  if (alphabet.length === 0) return "";
  let serie = "";
  let idx = 0;
  while (serie.length < longitudTotal) {
    serie += alphabet[idx % alphabet.length];
    idx = (idx + salto) % alphabet.length;
  }
  return serie.slice(0, longitudTotal);
}

/** Alternancia de dos subseries independientes (par/impar). */
function genAlternado(
  alphabet: string,
  longitudTotal: number,
): string {
  const nums = "0123456789";
  let serie = "";
  for (let i = 0; i < longitudTotal; i++) {
    const idx = Math.floor(i / 2);
    serie += i % 2 === 0 ? alphabet[idx % alphabet.length] : nums[idx % nums.length];
  }
  return serie;
}

/** Espejo / reversión parcial: avanza y retrocede. */
function genEspejo(
  alphabet: string,
  longitudTotal: number,
): string {
  const base = alphabet.slice(0, 5);
  if (base.length === 0) return "";
  let serie = "";
  let direction = 1;
  let idx = 0;
  while (serie.length < longitudTotal) {
    serie += base[idx];
    idx += direction;
    if (idx >= base.length - 1 || idx <= 0) direction *= -1;
  }
  return serie.slice(0, longitudTotal);
}

/** Intruso: serie normal con un carácter insertado deliberadamente. */
function genIntruso(
  basePattern: string,
  alphabet: string,
  rng: () => number,
): { serie: string; posicionIntruso: number } {
  if (basePattern.length === 0) {
    return { serie: "", posicionIntruso: -1 };
  }
  const posicionIntruso = Math.floor(basePattern.length / 2);
  const candidato = pick(alphabet.split("").filter((c) => c !== basePattern[posicionIntruso]), rng);
  const serie = basePattern.slice(0, posicionIntruso) + candidato + basePattern.slice(posicionIntruso + 1);
  return { serie, posicionIntruso };
}

/**
 * Genera un ítem completo de series alfanuméricas siguiendo la configuración.
 */
export function generateSeriesItem(config: SeriesConfig): SeriesItem {
  const alpha = ALPHABETS[config.alfabeto];
  const ciclo = clamp(config.longitudCiclo, 2, 6);
  const longitudVisible = Math.max(1, config.longitudVisible);
  const longitudTotal = longitudVisible + Math.max(1, config.puntoDeCorte);
  const rng = mulberry32(config.seed ?? 12345);
  const salto = config.salto ?? 3;

  let serieCompleta: string;
  let posicionIntruso = -1;

  switch (config.pattern) {
    case "acumulativo":
      serieCompleta = genAcumulativo(alpha, ciclo, longitudTotal, rng);
      break;
    case "fijo":
      serieCompleta = genFijo(alpha, ciclo, longitudTotal);
      break;
    case "salto":
      serieCompleta = genSalto(alpha, clamp(salto, 1, alpha.length - 1), longitudTotal);
      break;
    case "alternado":
      serieCompleta = genAlternado(alpha, longitudTotal);
      break;
    case "espejo":
      serieCompleta = genEspejo(alpha, longitudTotal);
      break;
    case "intruso": {
      const base = genFijo(alpha, ciclo, longitudTotal);
      const intruso = genIntruso(base, alpha, rng);
      serieCompleta = intruso.serie;
      posicionIntruso = intruso.posicionIntruso;
      break;
    }
    default:
      serieCompleta = genFijo(alpha, ciclo, longitudTotal);
  }

  const shown = serieCompleta.slice(0, longitudVisible);
  const respuesta = serieCompleta.slice(longitudVisible);

  const distractores = generateDistractores(
    respuesta.length,
    alpha,
    respuesta,
    config.numDistractores ?? 3,
    rng,
  );

  return {
    shown,
    respuesta,
    distractores,
    serieCompleta,
    alfabeto: alpha,
    config,
    ...(posicionIntruso >= 0 ? { posicionIntruso } : {}),
  };
}

/**
 * Genera distractores plausibles tomando el carácter correcto y aplicando un
 * offset aleatorio de ±1 o ±2 posiciones en el alfabeto.
 */
export function generateDistractores(
  lengthRespuesta: number,
  alphabet: string,
  respuesta: string,
  count: number,
  rng: () => number,
): string[] {
  if (lengthRespuesta === 0) return [];
  const offsets = [-2, -1, 1, 2];
  const distractores: string[] = [];
  const seen = new Set<string>([respuesta]);
  let attempts = 0;
  while (distractores.length < count && attempts < count * 10) {
    attempts++;
    let alt = "";
    for (const ch of respuesta) {
      const idx = alphabet.indexOf(ch);
      if (idx === -1) {
        alt += ch;
        continue;
      }
      const off = pick(offsets, rng);
      const newIdx = (idx + off + alphabet.length) % alphabet.length;
      alt += alphabet[newIdx];
    }
    if (!seen.has(alt)) {
      seen.add(alt);
      distractores.push(alt);
    }
  }
  while (distractores.length < count) {
    const idx = Math.floor(rng() * alphabet.length);
    distractores.push(alphabet[idx]);
  }
  return distractores;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Lista de patrones disponibles (para selectores de UI). */
export const PATTERNS: SeriesAlfabeticaPattern[] = [
  "acumulativo",
  "fijo",
  "salto",
  "alternado",
  "espejo",
  "intruso",
];

/** Lista de alfabetos disponibles (para selectores de UI). */
export const ALPHABET_NAMES: Alphabet[] = [
  "letras",
  "letras-extendidas",
  "letras-numeros",
  "simbolos",
];