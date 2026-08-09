# Implementación de la suite Lógico-Abstracto

Base de código para los generadores de ítems de la suite de pruebas psicotécnicas
descritas en `./README.md` y `./docs/`, con priorización derivada del análisis
del banco real en `./examples/`.

Cada subtema se implementa como un módulo independiente (con su propia carpeta
y tests vitest) para que su alcance quede explícito y no se mezclen
responsabilidades.

> Convención del repositorio: **no se usan** carpetas genéricas como `utils/` o
> `pkg/`. Cada subtema vive bajo `src/components/tools/logico-abstracto/<subtema>/`
> y expone su propia `types.ts` (+ `generador.ts` + `generador.test.ts` cuando
> está implementado, solo `types.ts` + `README.md` cuando es spec).

## Módulos implementados

| Módulo | Subtema | Naturaleza | Tests |
|---|---|---|---|
| `figuras/` | Núcleo compartido de Abstracto | Motor de primitivas SVG | 28 |
| `series-graficas/` | Series/secuencias gráficas | Reutiliza `figuras/` | 12 |
| `series-alfanumericas/` | Series de letras/símbolos | Texto puro | 13 |
| `discriminacion-visual/` | Discriminación visual + cadenas largas | Texto puro | 26 |
| `rotacion-mental/` | "Rote la siguiente figura X°" | Reutiliza `figuras/` | 14 |
| `analogias-graficas/` | Analogía gráfica (A→B como C→D) | Reutiliza `figuras/` | 13 |
| `matrices-graficas/` | Matrices gráficas (3x3, permutación/progresión) | Reutiliza `figuras/` | 14 |
| `proposiciones/` | Lógica proposicional (frase ↔ simbólica) | Texto puro | 21 |
| `domino-secuencia/` | "Encontrar la ficha que continúa" | Capa sobre `dominos/` | 11 |

**Total**: 152 tests en 9 módulos implementados.

## Specs (sin `generador.ts` todavía)

### Verbal (`verbal/README.md`)

| Carpeta | Subtema | Nota |
|---|---|---|
| `verbal/sinonimos-antonimos/` | Sinónimos y antónimos | Requiere léxico externo |
| `verbal/termino-excluido/` | Término excluido / intruso léxico | Requiere léxico categorizado |
| `verbal/analogia-verbal/` | Analogía verbal ("X es a Y como…") | 7 tipos de relación documentados |
| `verbal/conectores/` | Conectores lógicos (oración con huecos) | 12 categorías semánticas |
| `verbal/ordenar-palabras/` | Ordenar palabras / orden sintáctico | Oraciones canónicas + permutación |
| `verbal/comprension-lectora/` | Comprensión lectora (texto + preguntas) | El menos proceduralizable del bloque |

### Matemática (`matematica/README.md`)

| Carpeta | Subtema | Nota |
|---|---|---|
| `matematica/series-numericas/` | Series numéricas (9 tipos) | Procedimentalizable |
| `matematica/proporciones/` | Regla de 3, trabajo, interés compuesto | 8 subtipos |
| `matematica/polinomios/` | Operaciones algebraicas | Necesitará mini-motor de simplificación |
| `matematica/probabilidad/` | Urnas, dados, eventos compuestos | 5 subtipos |
| `matematica/sistemas-ecuaciones/` | Sistemas lineales 2x2 | Procedimentalizable |
| `matematica/geometria-basica/` | Áreas, perímetro, Pitágoras, ángulos | 11 subtipos |

## Módulos aún pendientes (sin spec, sin implementación)

| Módulo | Subtema | Nota |
|---|---|---|
| `verificacion-expresiones/` | 3 — Verificación de igualdad de expresiones | Necesita mini-motor de simplificación algebraica |
| `rapidez-perceptiva/` | 4 — Rapidez y exactitud perceptiva | Reutiliza `figuras/` para matrices de símbolos |
| `memoria-visual/` | 6 — Memoria visual | Componente interactivo con `setTimeout` |
| `busco-similar/` | 7 — Búsqueda de similares | Generador de distractores por atributo único |
| `conjuntos-graficos/` | 10 — Conjuntos gráficos | `verificar_atributo(figura, criterio)` |
| `figuras-excluidas/` | 11 — Figuras excluidas | Mismo motor que conjuntos, flag `modo` |

Los pendientes se documentaron en `./docs/` con el parámetro de software que
cada uno exige, para guiar su implementación cuando se aborde.

## Cómo correr los tests

```bash
npm test                                                       # toda la suite
npm test -- src/components/tools/logico-abstracto/             # solo esta suite
npm test -- src/components/tools/logico-abstracto/verbal/      # specs verbal (sin tests)
npm test -- src/components/tools/logico-abstracto/matematica/  # specs matemática (sin tests)
```

## Convenciones

- Cada generador es **puro**: dada la misma configuración (+ `seed` cuando
  aplique), devuelve el mismo ítem. Esto habilita snapshots y tests estables.
- PRNG propio (`mulberry32`) en cada módulo para no depender de `Math.random()`
  en los tests, y poder fijar la semilla desde la UI.
- Los `types.ts` son el contrato público de cada módulo; el `generador.ts`
  no exporta nada que no esté tipado en `types.ts`.
- Los renderizadores SVG (`<módulo>/svg.ts` solo cuando es necesario) devuelven
  strings auto-contenidos, sin depender del DOM, para facilitar exportación a
  PDF/imagen desde el servidor.
- Los specs (solo `types.ts` + `README.md`) **no** se consideran
  implementados: definen el contrato para futuras iteraciones o para que
  otras fuentes de contenido léxico (verbal) o banca histórica (matemática)
  puedan encajar directamente.

## Origen de la priorización

El orden de implementación se derivó del análisis del banco real en
`./examples/*.txt` (297 preguntas con etiquetas `@Q|dificultad ... @P ... @S/@A
... @R ... @D ... @T ... @Z`):

- Subtemas abstractos más recurrentes → implementados primero
  ("Complete el patrón", "Rote la siguiente figura", "Complete la matriz",
  "Complete la analogía gráfica", "Encontrar la ficha", "Sean las
  proposiciones...").
- Subtemas verbales y matemáticos → quedaron como specs (segunda prioridad)
  porque su implementación depende de léxico/banca curada, no de generación
  combinatoria pura.