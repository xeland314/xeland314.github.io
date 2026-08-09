# figuras — Núcleo del motor de Razonamiento Abstracto

Núcleo compartido por **todos** los subtemas de Razonamiento Abstracto (series
gráficas, analogías, conjuntos, figuras excluidas, matrices) y por algunos de
Atención (rapidez perceptiva, memoria visual, búsqueda de similares).

## Modelo conceptual

Una **figura** es un marco rectangular (por defecto 100×100) que contiene 1..N
*elementos* (`ShapeElement`). Cada elemento tiene un `kind` (forma), posición
`(x, y)`, `rotation`, `scale` y `fill` (patrón de relleno).

Las **primitivas** son funciones puras que reciben una figura y devuelven una
nueva figura transformada (inmutable):

| Función | Efecto |
|---|---|
| `rotate(figure, deg, elementIndex?)` | Rota `deg` grados (normaliza a [0,360)) |
| `scale(figure, factor, elementIndex?)` | Escala por `factor` (>0) |
| `translate(figure, dx, dy, elementIndex?)` | Traslada, clampeando al marco |
| `shade(figure, pattern, elementIndex?)` | Cambia el patrón de relleno |
| `addElement(figure, kind, position?)` | Añade un elemento |
| `removeElement(figure, index?)` | Elimina el último o el índice indicado |
| `applyStep(figure, step)` | Aplica un `TransformationStep` |
| `generateSequence(base, steps, length)` | Aplica los steps cíclicamente |
| `generateDistractor(base, steps, length, errorFactor)` | Produce un distractor "casi correcto" |

## Renderizado

`svg.ts` expone `renderFigure` y `renderSequence` que devuelven strings SVG
auto-contenidos. Útil para:
- Mostrar el ítem en el navegador.
- Exportar a PNG/PDF desde el servidor (sin DOM).
- Generar snapshots en tests.

## Uso típico

```ts
import { createSimpleFigure } from "./figuras";
import { generateSequence } from "./primitivas";
import { renderSequence } from "./svg";

const base = createSimpleFigure("square", "solid");
const seq = generateSequence(base, [{ kind: "rotation", amount: 90 }], 4);
const svg = renderSequence(seq); // 4 cuadrados rotados 0,90,180,270
```

## Por qué está separado de los subtemas

> *"Este mismo motor es la base que reutilizan Analogías, Conjuntos, Figuras
> excluidas y Matrices — conviene construirlo primero y una sola vez."*
> — `docs/08-abstracto-series-secuencias-graficas.md`

Construirlo aparte evita duplicar lógica de primitivas en 5 subtemas distintos
y unifica el comportamiento de los distractores (todos "casi correctos" bajo el
mismo criterio: paso × `errorFactor`), lo que mantienen los ítems coherentes
entre subtemas.

## Tests
`figuras.test.ts` cubre creación de figuras, cada primitiva, generación de
secuencias y renderizado (28 tests).