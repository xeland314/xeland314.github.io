import type {
  Atom,
  Application,
  Proposition,
  Connector,
  PropositionalConfig,
  PropositionalItem,
  SymbolOption,
  TranslationMode,
  ConnectorDict,
} from "./types";

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

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const VARIABLE_NAMES = ["p", "q", "r", "s", "t", "u", "v"];

const DEFAULT_PROPOSITIONS: Record<string, string> = {
  p: "El sistema está actualizado",
  q: "El programa se ejecuta correctamente",
  r: "Se genera el reporte final",
  s: "Tengo tiempo",
  t: "Está nevando",
  u: "Iré a la ciudad",
  v: "Hay luz eléctrica",
};

const CONNECTORS: Record<Connector, ConnectorDict> = {
  "&": {
    symbol: "&",
    phrases: ["y", "además", "pero", "sin embargo"],
    template: (a, b) => `${a} y ${b}`,
  },
  "|": {
    symbol: "|",
    phrases: ["o"],
    template: (a, b) => `${a} o ${b}`,
  },
  "^": {
    symbol: "^",
    phrases: ["o... o", "pero no ambos"],
    template: (a, b) => `o ${a} o ${b}, pero no ambos`,
  },
  "->": {
    symbol: "->",
    phrases: ["entonces", "solo si"],
    template: (a, b) => `Si ${a}, entonces ${b}`,
  },
  "<->": {
    symbol: "<->",
    phrases: ["si y solo si"],
    template: (a, b) => `${a} si y solo si ${b}`,
  },
  "~": {
    symbol: "~",
    phrases: ["no"],
    template: (a) => `no ${a}`,
  },
};

const ALL_CONNECTORS: Connector[] = ["&", "|", "^", "->", "<->", "~"];

function isAtom(p: Proposition): p is Atom {
  return p.type === "atom";
}

/** Convierte una proposición a su forma simbólica. */
export function toSymbol(p: Proposition): string {
  if (isAtom(p)) return p.variable;
  const { connector, operands } = p;
  if (connector === "~") {
    return `~${toSymbol(operands[0])}`;
  }
  const a = toSymbol(operands[0]);
  const b = toSymbol(operands[1]);
  return `(${a} ${connector} ${b})`;
}

/** Convierte una proposición a su forma en español. */
export function toPhrase(
  p: Proposition,
  dict: Record<string, string> = DEFAULT_PROPOSITIONS,
): string {
  if (isAtom(p)) return dict[p.variable] ?? p.variable;
  if (p.connector === "~") {
    return `no ${toPhrase(p.operands[0], dict)}`;
  }
  const a = toPhrase(p.operands[0], dict);
  const b = toPhrase(p.operands[1], dict);
  return CONNECTORS[p.connector].template(capitalize(a), b);
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Genera un átomo aleatorio. */
function randomAtom(rng: () => number, allowed: string[]): Atom {
  return { type: "atom", variable: pick(allowed, rng) };
}

/** Genera un AST aleatorio de profundidad `depth`. */
function randomProposition(
  rng: () => number,
  allowedVars: string[],
  allowedConnectors: Connector[],
  depth: number,
): Proposition {
  if (depth <= 0 || allowedConnectors.length === 0) {
    return randomAtom(rng, allowedVars);
  }
  if (rng() < 0.25) {
    return randomAtom(rng, allowedVars);
  }
  const connector = pick(allowedConnectors, rng);
  if (connector === "~") {
    return {
      type: "application",
      connector,
      operands: [randomProposition(rng, allowedVars, allowedConnectors, depth - 1)],
    };
  }
  return {
    type: "application",
    connector,
    operands: [
      randomProposition(rng, allowedVars, allowedConnectors, depth - 1),
      randomProposition(rng, allowedVars, allowedConnectors, depth - 1),
    ],
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Genera un distractores simbólico alterando el AST del correcto: cambia un
 * conector por otro, o niega un sub-árbol. Nunca debe ser estructuralmente
 * idéntico al correcto.
 */
function makeDistractor(
  truth: Proposition,
  rng: () => number,
  allowedConnectors: Connector[],
): Proposition {
  const clone: Proposition = JSON.parse(JSON.stringify(truth));
  return mutateProposition(clone, rng, allowedConnectors);
}

function mutateProposition(
  p: Proposition,
  rng: () => number,
  allowedConnectors: Connector[],
): Proposition {
  if (isAtom(p)) {
    // 50% de las veces niega
    if (rng() < 0.5) {
      return {
        type: "application",
        connector: "~",
        operands: [p],
      };
    }
    return p;
  }
  if (p.connector === "~") {
    return p.operands[0];
  }
  // cambia el conector binario por otro distinto
  const others = allowedConnectors.filter((c) => c !== "~" && c !== p.connector);
  return {
    ...p,
    connector: others.length > 0 ? pick(others, rng) : p.connector,
  };
}

/**
 * Genera un ítem de lógica proposicional completo.
 * `mode="to-symbol"` produce un enunciado en español y opciones simbólicas.
 * `mode="to-phrase"` produce un enunciado simbólico y opciones en español.
 */
export function generateItem(config: PropositionalConfig): PropositionalItem {
  const numVars = Math.max(1, Math.min(3, config.numVars ?? 2));
  const depth = Math.max(1, Math.min(3, config.depth ?? 1));
  const allowedConnectors = config.connectors ?? ALL_CONNECTORS;
  const numOptions = config.numOptions ?? 4;
  const rng = mulberry32(
    config.seed ??
      seedFromString(`${config.mode}-${numVars}-${depth}-${allowedConnectors.join("")}`),
  );

  const allowedVars = VARIABLE_NAMES.slice(0, numVars);
  const truth = randomProposition(rng, allowedVars, allowedConnectors, depth);

  let prompt: string;
  if (config.mode === "to-symbol") {
    prompt = toPhrase(truth);
  } else {
    prompt = toSymbol(truth);
  }

  const correctOption: SymbolOption = {
    phrase: toPhrase(truth),
    symbol: toSymbol(truth),
  };

  const options: SymbolOption[] = [correctOption];
  const seenKeys = new Set<string>([optionKey(correctOption)]);
  let attempts = 0;
  while (options.length < numOptions && attempts < 60) {
    attempts++;
    const distractorTruth = makeDistractor(truth, rng, allowedConnectors);
    const opt: SymbolOption = {
      phrase: toPhrase(distractorTruth),
      symbol: toSymbol(distractorTruth),
    };
    const key = optionKey(opt);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      options.push(opt);
    }
  }
  // Relleno final añadiendo variantes con doble mutación + sufijo único
  while (options.length < numOptions) {
    let variant = truth;
    for (let k = 0; k < 2; k++) {
      variant = makeDistractor(variant, rng, allowedConnectors);
    }
    const opt: SymbolOption = {
      phrase: toPhrase(variant),
      symbol: toSymbol(variant) + (options.length + 1),
    };
    seenKeys.add(optionKey(opt));
    options.push(opt);
  }

  const correctIndex = shuffleKeepingTrack(options, correctOption, rng);

  return {
    prompt,
    options,
    correctIndex,
    truth,
    config,
  };
}

function shuffleKeepingTrack<T>(
  arr: T[],
  keepRef: T,
  rng: () => number,
): number {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.indexOf(keepRef);
}

function optionKey(o: SymbolOption): string {
  return `${o.symbol}||${o.phrase}`;
}

/** Lista de conectores para selectores de UI. */
export const ALL_CONNECTOR_LIST: Connector[] = ALL_CONNECTORS;

export const MODES: TranslationMode[] = ["to-symbol", "to-phrase"];