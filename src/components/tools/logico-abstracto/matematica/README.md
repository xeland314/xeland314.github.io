# matematica — Specs de Razonamiento Matemático (subtemas del banco)

Estos módulos contienen **solo especificación** (`types.ts` + este `README.md`),
sin `generador.ts` todavía. A diferencia del bloque verbal, todos estos
subtemas son **completamente proceduralizables** mediante generadores de
números aleatorios con constraints (seed + mulberry32, igual que el resto de
la suite).

No se incluyen datos del banco real (`examples/*.txt`); los specs definen
estructuras y parámetros, no contenido. Los generadores futuros construirán
los ítems a partir de esos parámetros sin depender de un léxico externo.

## Subtemas

| Carpeta | Subtema | Estado |
|---|---|---|
| `series-numericas/` | Series numéricas (aritméticas, geométricas, codificadas) | Spec |
| `proporciones/` | Proporciones / regla de 3 / trabajo / interés | Spec |
| `polinomios/` | Operaciones algebraicas (grado, simplificar, expandir) | Spec |
| `probabilidad/` | Probabilidad (urnas, dados, eventos compuestos) | Spec |
| `sistemas-ecuaciones/` | Sistemas de ecuaciones 2x2 | Spec |
| `geometria-basica/` | Áreas, perímetros, Pitágoras, ángulos | Spec |

## Estructura común

Todos los ítem matemáticos derivan de `MathItem<T>` definido en `types.ts`:

```ts
interface MathItem<T = string> {
  prompt: string;                     // enunciado (con [MATH]...[/MATH])
  options: MathOption<T>[];           // A/B/C/D…
  correctIndex: number;               // ground truth
  solution: string;                   // paso a paso en [MATH]...[/MATH]
  distractorExplanations: Record<string, string>;  // @D del banco
  difficulty: "Bajo" | "Medio" | "Alto";           // @Q|nivel
  tip: string;                        // @T "consejo pedagógico"
}
```

Formato idéntico al de `verbal/types.ts` (mismas marcas del banco) — solo
difieren en la convención del `solution` (texto matemático en lugar de
justificación textual) y en `prompt` (enunciados con `[MATH]`).

## Convenciones procedurales

- **PRNG determinista** `mulberry32` + `seed` (idéntico al resto de la suite).
- **Numeros enters bonitos**: las magnitudes generadas se eligen para que las
  respuestas sean enteras o fracciones simples (terna pitagórica,
  fracciones tipo 3/13, mcm/mcd triviales). El generador debe *rechazar* y
  reintentar con otra seed si no cumple esta propiedad.
- **Solucionario derivado**: el `correctIndex` se calcula con la fórmula
  matemática, no se asigna arbitrariamente. La fórmula se incluye en `solution`
  como bloque `[MATH]...[/MATH]` (compatible con el formato del banco).
- **Distractores pedagógicos**: cada distractor corresponde a un ERROR
  frecuente documentado en el banco (confundir área con perímetro, aplicar
  inversa en directa, olvidar dividir por 2, etc.). Ver §"distractor típico"
  en el spec de cada subtema.
- **Sin dependencias externas**: la suite no usa `sympy`, `nerdamer` ni
  similares. La simplificación algebraica que requiera `polinomios/` se
  implementará con un mini-motor propio en `polinomios/algebra.ts` (futuro).
  Esto evita inflar `package.json`.

## Por qué specs y no implementación

Los 6 subtemas matemáticos son directamente proceduralizables, pero el
coste de implementarlo bien (con simplificación simbólica, fracciones
ratis, solucionario legible) es mayor que el de los abstractos visuales.
Por eso los specs se separan primero: queda el contrato listo para el
frontend y para any implementación futura — localmente o como parte de un
banco myor.

## Migración a implementación

Cuando un subtema pase de spec a implementado:
1. Crear `<subtema>/generador.ts` (+ `generador.test.ts` vitest).
2. Renovar `IMPLEMENTACION.md`: mover el subtema de "Specs" a "Implementado".
3. Marcar su fila en la tabla de arriba con check (✔) y prefijo
   "(Implementado)".
4. La UI puede empezar a consumir el nuevo `generateItem`.