# series-alfanumericas — Series de letras/símbolos (subtema 1)

**El subtema más barato de construir** de todo el temario: motor puramente
combinatorio (no gráfico), solo texto. Mide **reconocimiento posicional rápido**,
no razonamiento matemático.

## Uso

```ts
import { generateSeriesItem } from "./generador";

const item = generateSeriesItem({
  pattern: "fijo",
  longitudCiclo: 4,
  alfabeto: "letras",
  puntoDeCorte: 1,
  longitudVisible: 8,
  numDistractores: 3,
  seed: 42,
});

// item.shown        → "abcdabcd"   (serie truncada visible al estudiante)
// item.respuesta    → "a"          (siguiente carácter tras el corte)
// item.distractores → ["b","c","e"] (plausibles, ±1..2 posiciones en el alfabeto)
// item.serieCompleta→ "abcdabcda"  (útil para el solucionario)
```

## Patrones soportados

| `pattern` | Comportamiento | Ejemplo |
|---|---|---|
| `acumulativo` | Cada vuelta añade un elemento al bloque repetido | `a,b,a,b,c,a,b,c,d...` |
| `fijo` | El alfabeto (subconjunto) se repite en bucle | `abcd,abcd,abcd...` |
| `salto` | Avanza k posiciones en el alfabeto en cada paso | `a,d,g,j,m...` (salto=3) |
| `alternado` | Dos subseries intercaladas (par=letra, impar=número) | `a,0,b,1,c,2...` |
| `espejo` | Avanza y retrocede | `abcdedcba...` |
| `intruso` | Serie normal con un carácter insertado (variante "encuentra el error") | `abcX abcabc...` |

## Alfabetos disponibles

| `alfabeto` | Caracteres | Dificultad |
|---|---|---|
| `letras` | `a-z` + `ñ` (27) | Base |
| `letras-extendidas` | añade `áéíóúü` | Media |
| `letras-numeros` | `a1b2c3...` | Media |
| `simbolos` | `*#%&@+=$?¿¡!/\` | **Alta** (no hay "orden natural" memorizado) |

## Generación de distractores

Según el README del subtema:

> *Los distractores se generan tomando el carácter correcto y aplicando un
> offset aleatorio de ±1 o ±2 posiciones en el alfabeto — así el distractor
> "parece" plausible sin ser trivialmente absurdo.*

`generateDistractores(respuesta.length, alphabet, respuesta, count, rng)`
implementa exactamente esto: nunca incluye la respuesta ni duplicados, y rellena
con chars aleatorios si se agotan offsets válidos (caso de alfabetos cortos).

## Determinismo
Cada llamada con el mismo `seed` produce el mismo ítem. Sin `seed`, usa `12345`
por defecto (siempre reproducible).

## Tests
`generador.test.ts` cubre los 6 patrones, determinismo, distractores sin
duplicados, alfabeto de símbolos y la cíclica del salto (13 tests).