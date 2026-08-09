# verbal — Specs de Razonamiento Verbal (subtemas del banco)

Estos módulos contienen **solo especificación** (`types.ts` + este `README.md`),
sin `generador.ts` todavía. Son el contrato para el frontend y para las
implementaciones futuras.

No se incluyen datos del banco real (`examples/*.txt`); los specs definen
estructuras y parámetros, no contenido léxico. Los generadores futuros
recibirán un léxico externo (provisto por el módulo llamador o por una
integración con la base de datos `db/posts.ts`).

## Subtemas

| Carpeta | Subtema | Estado |
|---|---|---|
| `sinonimos-antonimos/` | Sinónimos y antónimos | Spec |
| `termino-excluido/` | Término excluido / palabra intrusa | Spec |
| `analogia-verbal/` | Analogía verbal ("X es a Y como…") | Spec |
| `conectores/` | Conectores lógicos (oración con huecos) | Spec |
| `ordenar-palabras/` | Ordenar palabras / orden sintáctico | Spec |
| `comprension-lectora/` | Comprensión lectora (texto + preguntas) | Spec |

## Estructura común

Todos los ítem verbales derivan de `VerbalItem<T>` definido en `types.ts`:

```ts
interface VerbalItem<T = string> {
  prompt: string;                    // enunciado
  options: MCQOption<T>[];           // A/B/C/D…
  correctIndex: number;              // ground truth
  rationale: string;                 // @R del banco
  distractorExplanations: Record<string, string>; // @D
  difficulty: "Bajo" | "Medio" | "Alto";  // @Q|nivel
  tip: string;                       // @T "consejo pedagógico"
}
```

Esto mapea directamente el formato del banco (`@P`, `@S/@A`, `@R`, `@D`, `@Q`,
`@T`) y permite que el futuro serializador de preguntas produzca el formato
real del banco a partir de cualquier `VerbalItem`.

## Convenciones procedurales

- **PRNG determinista**: todos los generadores (cuando se implementen)
  aceptarán `seed` y usarán `mulberry32`, igual que el resto de la suite.
- **Cero DOM**: los generadores son puras funciones, renderizables a
  HTML/SVG/PDF desde una capa UI aparte.
- **Solucionario derivado**: el `correctIndex` siempre se deriva de la
  estructura semántica del ítem, nunca se hardcodea. Eso garantiza que el
  solucionario nunca se contradiga con el propio ítem.
- **Léxico externo**: los generadores no incluyen listas de
  sinónimos/antónimos/oraciones dentro del `.ts`; reciben un léxico
  tipado como parámetro, para que el contenido viva en `db/` o enediciones
  curadas separadas de la lógica.

## Por qué specs y no implementación

El subtema verbal de mayor valor (sinónimos/antónimos/analogías) depende casi
por completo de un léxico previamente curado, no de generación procedural pura.
Por eso, contrary al bloque abstracto (donde la generación geométrica es
trivial), aquí el cuello de botella es curar el léxico — no programar la
lógica de mezcla. Estos specs-blocking dejan la lógica lista para encajar con
cualquier fuente léxica futura.