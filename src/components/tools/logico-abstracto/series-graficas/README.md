# series-graficas — Series / secuencias gráficas (subtema 8)

Genera ítems de "razonamiento abstracto clásico": se muestran 3-5 figuras que
cambian progresivamente según una regla y se pide elegir la figura que continúa
entre N opciones. Es el subtema **base** de todo Abstracto.

## Uso

```ts
import { generateSeriesItem } from "./generador";
import { renderSequence, renderFigure } from "../figuras/svg";

const item = generateSeriesItem({
  baseShape: "square",
  pattern: "rotation",
  numVisible: 4,
  numOptions: 4,
  roundSteps: true,
  numRules: 1,
});

// item.shown      → Figure[] (4 figuras visibles)
// item.options    → Figure[] (4 opciones)
// item.correctIndex → índice de la opción correcta
// item.distractors  → índices de los distractores

const svgShown = renderSequence(item.shown);
const svgOptions = item.options.map(renderFigure).join("");
```

## Patrones soportados

| `pattern` | Comportamiento | Figura base recomendada |
|---|---|---|
| `rotation` | Gira `amount` grados en cada paso | `createSimpleFigure(kind)` |
| `scale` | Escala por `factor` en cada paso | `createSimpleFigure(kind)` |
| `fill` | Cambia el patrón de relleno cíclicamente | `createSimpleFigure(kind)` |
| `addition` | Añade un elemento por paso | `createRowFigure(kind, 3)` |
| `removal` | Elimina un elemento por paso | `createRowFigure(kind, 3)` |
| `translation` | Traslada por `(amount, -amount)` | `createSimpleFigure(kind)` |
| `combined` | Combinación de 2 reglas independientes | cualquier |

## Parámetros de dificultad

| Parámetro | Rango | Efecto |
|---|---|---|
| `numVisible` | 3-5 | Menos visibles = menos evidencia = más difícil |
| `numRules` | 1 ó 2 | 2 reglas simultáneas = salto de dificultad marcado |
| `roundSteps` | boolean | Pasos redondos (90°, +1) son más fáciles |
| `numOptions` | 3-5 | Más opciones = más comparaciones |

## Determinismo
El PRNG interno se siembra desde la configuración, así que el mismo
`SeriesConfig` siempre produce el mismo ítem (correctIndex incluido). Esto
permite:
- Tests estables (snapshots).
- "Misma semilla en la UI" → ítem re-generable para revisión.

## Tests
`generador.test.ts` cubre cada patrón, determinismo, dos reglas, validez de
distractores y comparación estructural (12 tests).