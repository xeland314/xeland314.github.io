# discriminacion-visual — Discriminación visual + Cadenas largas (subtemas 2 y 5)

Genera pares de cadenas casi idénticas y decide si son **Iguales (I)** o
**Diferentes (D)**. Combina en un solo módulo los subtemas 2 (Discriminación
visual, cadenas 10-40) y 5 (Percepción de detalle en cadenas largas, 20-80)
porque, según el README:

> *Conviene implementarlos como el mismo módulo con un parámetro `longitud` y
> `estructura`, en vez de dos generadores separados.*

Texto puro — cero renderizado gráfico, junto con `series-alfanumericas` es de
lo más barato de la suite.

## Uso

```ts
import { generateItem } from "./generador";

// Subtema 2 — Discriminación visual clásica
const item = generateItem({
  length: 20,
  alphabet: "letters-special",
  numDifferences: 1,
  differenceType: "substitution",
  position: "middle",
  seed: 5,
});

// item.cadenaA  → "(*>2~FOd'aY-&88W)"
// item.cadenaB  → "(*>2~FOd'aY-&83W)"   ← sustitución en el medio
// item.esIgual  → false
// item.posicionDiferencia → [15]

// Subtema 5 — Cadenas largas (20-80) con estructura de bloque repetido
const largo = generateItem({
  length: 56,
  alphabet: "letters-digits",
  numDifferences: 1,
  differenceType: "substitution",
  position: "middle",
  structure: "repeated-block-separated",
  blockSize: 4,
  separator: "-",
  seed: 7,
});
```

## Tipos de diferencia

| `differenceType` | Efecto | Dificultad típica |
|---|---|---|
| `substitution` | Cambia 1 char por otro aleatorio | Base |
| `insertion` | Añade 1 char | Realza detección por desplazamiento |
| `deletion` | Quita 1 char | Igual que inserción |
| `swap-adjacent` | Intercambia 2 chars adyacentes | Media |
| `confusable` | Sustituye por un par visualmente similar | **Alta** |

## Tabla de pares confusos (`CONFUSABLE_PAIRS`)

> *Conviene mantener una tabla de pares confusos (`0-O, 1-l-I, 5-S, 8-B, rn-m,
> cl-d`) para que la sustitución sea realista y no un cambio aleatorio cualquiera.*

Definida en `types.ts` y usada por `differenceType: "confusable"`:

```ts
const CONFUSABLE_PAIRS = [
  ["0","O"], ["1","l"], ["1","I"], ["5","S"], ["8","B"],
  ["2","Z"], ["rn","m"], ["cl","d"], ["vv","w"],
];
```

`findConfusable(original, rng)` devuelve el "gemelo confuso" o `null`.

## Estructuras (subtema 5)

| `structure` | Comportamiento | Dificultad |
|---|---|---|
| `random` | Cadena uniformemente aleatoria | **Más difícil** |
| `repeated-block` | Bloque de `blockSize` chars repetido | Media (ritmo reconocible) |
| `repeated-block-separated` | Igual + `separator` visual (`-`) entre bloques | Más fácil |

`estimateDifficulty(length, position)` etiqueta automáticamente cada ítem como
`baja` / `media` / `alta` según longitud y cercanía al centro (efecto de
fatiga atencional, ver README del subtema 5).

## Verificación / solucionario

`findDifferences(a, b)` calcula las diferencias reales entre dos cadenas — útil
para autocalificar respuestas del estudiante sin hardcodear el ground truth.

## Tests
`generador.test.ts` cubre par idéntico, sustitución/inserción/eliminación/swap,
confusable, estructuras repetidas y separadas, `findDifferences`,
`estimateDifficulty` y la tabla de pares confusos (26 tests).