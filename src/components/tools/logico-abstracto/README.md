# Series de letras / símbolos (Atención y Concentración)

## Qué mide
No es razonamiento matemático (eso ya lo cubre Razonamiento Lógico/Numérico). Aquí se evalúa **reconocimiento posicional rápido**: seguir un ciclo de caracteres y detectar en qué punto del ciclo está la serie, sin hacer cálculo aritmético. La dificultad viene de la longitud del ciclo y de la velocidad exigida, no de la lógica.

## Catálogo de patrones encontrados

### 1. Ciclo acumulativo simple
Cada "vuelta" agrega un elemento nuevo al final del bloque que se repite.
```
a,b,a,b,c,a,b,c,d,a,b,c,d,e,...
```
Regla: bloque 1 = [a,b], bloque 2 = [a,b,c], bloque 3 = [a,b,c,d]... Se pide el siguiente carácter tras cortar la serie en cualquier punto.

### 2. Ciclo fijo de longitud N
El alfabeto (o un subconjunto) se repite en bucle sin cambios.
```
m,n,ñ,o,m,n,ñ,o,m,n,ñ,o,...
```
Se pide la posición N del ciclo. Variante de dificultad: usar 3, 4, 5 o 6 caracteres en el ciclo.

### 3. Ciclo con salto fijo
Se avanza k posiciones en el alfabeto en cada paso (equivalente a aritmética modular sobre el alfabeto).
```
a, d, g, j, m, ... (salto de 3 letras)
```

### 4. Alternancia de dos subseries independientes
Dos patrones intercalados en posiciones pares/impares.
```
a,1,b,2,c,3,d,4,... (posición impar = letra en orden; posición par = número en orden)
```

### 5. Espejo / reversión parcial
El bloque avanza y luego retrocede antes de continuar.
```
a,b,c,d,c,b,a,b,c,d,c,b,a,...
```

### 6. Sustitución con distractor
Idéntico a los patrones anteriores, pero se inserta deliberadamente un carácter "intruso" que rompe el ciclo en una posición, y se pide identificarlo (variante tipo "encuentra el error", cercana a discriminación visual).

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `longitud_ciclo` | 2–6 | A mayor longitud, más difícil |
| `tipo_patron` | acumulativo / fijo / salto / alternado / espejo | El acumulativo y el espejo son los más difíciles |
| `alfabeto_base` | letras, letras+números, símbolos no alfabéticos (*,#,%,&) | Símbolos no alfabéticos suben la dificultad (no hay "orden natural" memorizado) |
| `punto_de_corte` | posición donde se trunca la serie mostrada | Cortar a mitad de bloque es más difícil que cortar justo al cierre de un bloque |
| `longitud_visible` | nº de caracteres mostrados antes de preguntar | Menos contexto = más difícil |
| `con_distractor` | booleano | Si es true, generar validador que también verifique la posición del error |

## Requisito de software
Motor puramente combinatorio (no gráfico): una función `generar_serie(tipo, longitud_ciclo, alfabeto, corte) -> (serie_mostrada, respuesta_correcta, distractores)`. Los distractores se generan tomando el carácter correcto y aplicando un offset aleatorio de ±1 o ±2 posiciones en el alfabeto — así el distractor "parece" plausible sin ser trivialmente absurdo. No requiere renderizado de imágenes, solo texto — el más barato de construir de todo el temario.

# Discriminación visual (Atención y Concentración)

## Qué mide
Comparar dos bloques de texto/símbolos casi idénticos y marcar si son **Iguales (I)** o **Diferentes (D)**. Es el tipo de ítem más mecánico de todo el temario: no hay razonamiento, solo velocidad + precisión de comparación carácter por carácter.

## Catálogo de patrones encontrados (con ejemplos reales del banco Precavidos)

### 1. Cadena alfanumérica con símbolos especiales
```
(*>2~FOd'aY-&88W)   vs   (">2~FOd'aY-&83W)
```
Diferencia: un solo carácter cambiado en medio de la cadena (`*`→ nada, `8`→`3`). El truco pedagógico es que el ojo tiende a "autocorregir" cadenas largas y pasar por alto 1-2 caracteres.

### 2. Bloques repetitivos de sílabas/códigos
```
SA-BA-SA-SA-AS-BA-AB-SA-BA-BA   vs   SA-BA-SA-SA-AS-BA-AB-SA-BA-BA
```
Aquí el reto es que las sílabas usan las mismas 2-3 letras en distinto orden (SA/AS/AB/BA), lo que fuerza lectura letra por letra en vez de reconocimiento de "forma de palabra".

### 3. Expresiones algebraicas o numéricas equivalentes en apariencia
```
6+4*a+b-8-9 = -9+4*a+1-b-8
```
Este caso es híbrido con el subtema "verificación de expresiones" (ver archivo aparte) — la variante pura de discriminación visual usa cadenas sin significado matemático, solo comparación de caracteres.

### Marco teórico de referencia (Test Reversal / Ake Edfeldt)
Un test clásico de discriminación visual clasifica los pares de figuras en 3 niveles de dificultad según el tipo de transformación que los distingue:
- **Ítems idénticos o totalmente diversos** → dificultad baja (el ojo detecta la diferencia global rápido).
- **Ítems con simetría doble (espejo horizontal+vertical)** → dificultad media.
- **Ítems con simetría simple izquierda-derecha únicamente** → dificultad alta (es el error más común, porque el cerebro "corrige" mentalmente una imagen en espejo).

Esta misma lógica de "tipo de transformación → nivel de dificultad" es trasladable a texto: cambiar un carácter por otro visualmente similar (l/1, O/0, rn/m) es más difícil de detectar que cambiar un carácter por uno completamente distinto.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `longitud_cadena` | 10–40 caracteres | Más longitud = más difícil y más lento |
| `alfabeto` | letras, letras+dígitos, símbolos especiales mezclados | Símbolos especiales suben dificultad |
| `num_diferencias` | 0 (idéntico) o 1 | Casi siempre se usa 0 o 1, nunca más de 1-2 |
| `tipo_diferencia` | sustitución de carácter / inserción / eliminación / intercambio de posición adyacente | La sustitución por carácter visualmente similar (0↔O, 1↔l, 8↔B) es la más difícil |
| `posicion_diferencia` | inicio / medio / final | El medio es más difícil de detectar que los extremos |
| `formato` | cadena libre, bloque de sílabas repetidas, expresión con paréntesis | El formato de sílabas repetidas es el más engañoso |

## Requisito de software
Motor de texto puro (sin imágenes): `generar_par(longitud, alfabeto, num_diferencias, tipo_diferencia) -> (cadena_A, cadena_B, es_igual, posicion_diferencia)`. Para la variante de "carácter visualmente similar" conviene mantener una tabla de pares confusos (`0-O, 1-l-I, 5-S, 8-B, rn-m, cl-d`) para que la sustitución sea realista y no un cambio aleatorio cualquiera. Igual que Series alfanuméricas, es de los más baratos de construir: cero renderizado gráfico.

# Verificación de igualdad de expresiones (Atención y Concentración)

## Qué mide
Variante de discriminación visual aplicada a **expresiones simbólicas/algebraicas**: comparar dos expresiones casi idénticas y decidir si son iguales, sabiendo que un cambio de signo o de variable altera el resultado aunque la expresión "se vea" parecida. Combina atención visual con una pizca de álgebra elemental (suma/resta de términos), pero el objetivo no es resolver la ecuación — es detectar si ambos lados son la misma expresión reordenada o si hay una alteración real.

## Catálogo de patrones encontrados

### 1. Reordenamiento válido (son iguales aunque se vean distintas)
```
6+4*a+b-8-9   =   -9+4*a+1-b-8+1-1
```
Aquí ambos lados, simplificados, dan el mismo resultado — la trampa es que a simple vista *parecen* distintas por el orden de términos.

### 2. Cambio real de signo o coeficiente (son diferentes)
```
6+4*a+b-8-9   ≠   -9+4*a+1-b-8
```
Diferencia real: `+b` cambió a `-b` (o apareció un `+1` extra), lo que sí altera el valor.

### 3. Cambio de variable o exponente casi imperceptible
```
3x² + 2x - 5   vs   3x² + 2x - 5   (idénticas)
3x² + 2x - 5   vs   3x² + 2x - 6   (diferentes: término independiente)
```

### 4. Paréntesis con signo distribuido incorrectamente
```
2(a+b) - c   vs   2a + 2b - c        (iguales)
2(a+b) - c   vs   2a + b - c         (diferentes: falta distribuir el 2 a b)
```
Este patrón es el más "educativo" porque prueba si el estudiante sabe que `-( )` invierte signos o que un factor se distribuye a todos los términos del paréntesis.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `num_terminos` | 3–7 | Más términos = más difícil de verificar mentalmente |
| `tipo_operacion` | reordenamiento / cambio de signo / cambio de coeficiente / distribución de paréntesis | La distribución de paréntesis exige más pasos de verificación |
| `usa_parentesis` | booleano | Sube la dificultad y añade una dimensión algebraica real |
| `es_igual` | booleano (ground truth) | Define si el generador aplica una transformación válida o inválida |
| `variables_usadas` | 1–3 letras distintas | Más variables = más difícil de rastrear término por término |

## Requisito de software
Este es el único subtema del bloque "Atención" que necesita algo más que comparación de texto: requiere un **motor de simplificación algebraica simbólica** (ya usas `sympy` para tus bancos de álgebra/geometría, así que reutilizas la misma dependencia). El flujo sería:
1. Generar expresión base aleatoria con `sympy`.
2. Generar una segunda expresión aplicando una transformación (válida = reordenar/expandir con `sympy.expand()` y verificar igualdad con `sympy.simplify(expr1 - expr2) == 0`; inválida = alterar un signo o coeficiente a mano).
3. El "ground truth" (Igual/Diferente) se calcula con `sympy`, no se hardcodea — así garantizas que el solucionario nunca se equivoca, algo que le has priorizado en tus bancos anteriores (verificación con sympy).

Esto lo vuelve casi gratis de construir dado que ya tienes esa pieza de infraestructura de tus bancos de álgebra.

# Rapidez y exactitud perceptiva (Atención y Concentración)

## Qué mide
Es el subtema con más respaldo psicométrico formal de todo el temario: se basa directamente en pruebas clásicas de **cancelación/tachado** usadas desde hace más de un siglo en psicología (Toulouse-Piéron 1906, test d2 de Brickenkamp). El objetivo es contar, tachar o localizar un símbolo objetivo dentro de una matriz grande de distractores, bajo presión de tiempo. No hay razonamiento: es resistencia atencional pura ante la monotonía.

## Catálogo de patrones encontrados

### 1. Cancelación simple (modelo Toulouse-Piéron)
Se muestra un símbolo modelo (ej. un cuadrado con una rayita en una posición específica de entre 8 posibles) y el estudiante debe marcar todas las apariciones idénticas dentro de una matriz de cientos de símbolos similares pero con la rayita en otras posiciones.
```
Modelo: ⊐ (rayita arriba)
Matriz:  ⊏ ⊐ ⊑ ⊐ ⊒ ⊐ ⊓ ⊐ ...
```
La dificultad no está en identificar la forma general (todos son "cuadrados con rayita") sino en la posición exacta del detalle distintivo.

### 2. Conteo de ocurrencias de un carácter específico
"¿Cuántas veces aparece la letra E en el siguiente bloque de texto?" — sobre un párrafo o matriz de letras sueltas.

### 3. Búsqueda en matriz sin orden (búsqueda visual, no cancelación en fila)
A diferencia de la cancelación (que se lee en fila, izquierda-derecha, arriba-abajo), esta variante dispersa los símbolos sin orden en toda la página, forzando un escaneo visual bidimensional en vez de lineal.

### 4. Doble criterio simultáneo
Se pide marcar dos símbolos-modelo distintos a la vez (ej. "marca todos los que tengan la rayita arriba O a la derecha"), lo que obliga a mantener dos criterios activos en memoria de trabajo mientras se escanea.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `num_filas` x `num_columnas` | 10x10 hasta 20x30 | Matrices más grandes = más tiempo/fatiga |
| `num_variantes_distractoras` | 4–8 posiciones posibles del detalle distintivo | Más variantes = más difícil distinguir el objetivo |
| `densidad_objetivo` | % de celdas que son el símbolo correcto | Ni muy alta (trivial) ni muy baja (se vuelve búsqueda de aguja) — 15-25% suele ser el punto útil |
| `modo` | cancelación en fila / búsqueda dispersa / conteo | Búsqueda dispersa es más difícil que cancelación en fila |
| `num_criterios_simultaneos` | 1 o 2 | 2 criterios sube bastante la dificultad |
| `tiempo_limite` | parámetro de la prueba, no del ítem | Es la variable de dificultad más importante de todo este subtema — el ítem en sí es simple, lo que lo hace difícil es el reloj |

## Requisito de software
Motor de generación de matrices con primitivas SVG parametrizables (mismo motor que usarías para Series/secuencias gráficas — reutilizable): una función `generar_simbolo(forma_base, posicion_detalle)` que dibuja variantes de un mismo glifo cambiando solo un atributo (posición de una rayita, orientación de un trazo). Luego `generar_matriz(filas, columnas, simbolo_objetivo, densidad, distractores)` coloca las variantes aleatoriamente y devuelve tanto la imagen como el mapa de coordenadas correctas (para autocalificación). A diferencia de Discriminación Visual (que es texto puro), aquí sí conviene generar imágenes reales porque el detalle distintivo suele ser geométrico (posición de una línea), no un carácter tipografiable.

# Percepción de detalle en cadenas largas (Atención y Concentración)

## Qué mide
Es una extensión de Discriminación Visual pero con cadenas mucho más largas (30-60+ caracteres), donde la dificultad no viene de un truco puntual sino del **efecto de fatiga atencional**: entre más larga la cadena, más probable que el ojo "se salte" el carácter alterado por pérdida de foco progresiva, no por diseño del error en sí. Es casi el mismo mecanismo que Discriminación Visual, pero merece parámetros propios de generación porque la variable clave (longitud) cambia la naturaleza del reto.

## Catálogo de patrones encontrados

### 1. Cadena larga con una sola alteración puntual
```
7XkP2mQzL9wRtY6bNjH4vC8sDfG3aE1oU5iK0pW... (48 caracteres)
```
vs. la misma cadena con un carácter cambiado en una posición aleatoria (a menudo cerca del centro, donde estadísticamente el ojo pierde más precisión que en los extremos).

### 2. Repetición de bloques cortos concatenados
En vez de una cadena aleatoria uniforme, se repite un bloque corto (4-6 caracteres) muchas veces, con una sola repetición alterada.
```
XY7B-XY7B-XY7B-XY7B-XY9B-XY7B-XY7B
```
Este patrón es más fácil de generar y más fácil de resolver que la cadena totalmente aleatoria, porque el cerebro reconoce el "ritmo" del bloque repetido y detecta más rápido la anomalía — útil como nivel de dificultad baja/media dentro de este mismo subtema.

### 3. Bloques con separadores visuales (guiones, espacios) vs. sin separadores
La misma cadena partida en grupos de 4-5 caracteres con guiones es sustancialmente más fácil de comparar que la cadena corrida sin separación — es una palanca de dificultad barata de implementar.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `longitud_total` | 20–80 caracteres | Curva de dificultad principal de este subtema |
| `estructura` | aleatoria uniforme / bloque repetido / bloque repetido con separadores | Aleatoria uniforme es la más difícil; bloque con separadores la más fácil |
| `posicion_alteracion` | índice dentro de la cadena | Cerca del centro es estadísticamente más difícil que cerca de los extremos (dato del efecto de fatiga/primacía-recencia) |
| `tipo_alteracion` | sustitución de 1 carácter / sustitución de 2 caracteres no adyacentes | 2 alteraciones no contiguas es más difícil que 1 sola porque rompe el patrón de "buscar 1 solo error" |

## Requisito de software
Mismo motor de texto que Discriminación Visual — de hecho, conviene implementarlos como el mismo módulo con un parámetro `longitud` y `estructura`, en vez de dos generadores separados. La única pieza adicional útil es una función de "puntuación de dificultad estimada" basada en longitud + posición del error, para poder etiquetar automáticamente cada ítem generado como Baja/Media/Alta sin revisión manual.

# Memoria visual (Atención y Concentración)

## Qué mide
A diferencia de todo lo anterior (que es comparación simultánea de dos estímulos visibles a la vez), aquí el estímulo se retira antes de responder: se muestra una figura/patrón durante un tiempo limitado, se oculta, y luego se pregunta por algún detalle. Mide retención a corto plazo de información visual, no solo percepción. Es el subtema con más literatura clínica de respaldo (Test de Rey de copia de figura compleja, tests de estimulación cognitiva con cuadrículas 3x3).

## Catálogo de patrones encontrados

### 1. Reconocimiento simple (¿la viste o no?)
Se muestra una figura X segundos. Luego, entre 4-5 opciones (una es la original, las demás son distractores con alteración mínima), se pide señalar cuál es la que se mostró.

### 2. Memoria de posición en cuadrícula
Se muestra una cuadrícula 3x3 con 9 figuras de formas/colores distintos distribuidas en las celdas. Se oculta y se pregunta: "¿en qué celda estaba la figura X?" — evalúa memoria visoespacial, no solo memoria de forma.

### 3. Reproducción de detalle tras exposición breve (estilo Rey)
Se muestra una figura compuesta (varias formas superpuestas o combinadas) por tiempo limitado; luego se pide reconocerla entre variantes que cambian un solo elemento (por ejemplo, quitar una línea, cambiar la posición relativa de dos elementos).

### 4. Conteo retenido
Se muestra brevemente una escena con N elementos de distintos tipos (ej. 5 círculos, 3 cuadrados, 2 triángulos); se oculta y se pregunta por la cantidad de un tipo específico — combina memoria visual con conteo retenido, no visible durante la respuesta.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `tiempo_exposicion` | 2–8 segundos | Menos tiempo = más difícil (es el parámetro dominante) |
| `num_elementos` | 1 figura simple hasta 9 (cuadrícula 3x3) | Más elementos = más carga de memoria de trabajo |
| `tipo_pregunta` | reconocimiento / posición / conteo retenido | Posición en cuadrícula suele ser la más difícil |
| `similitud_distractores` | baja (formas muy distintas) / alta (cambia solo 1 atributo) | Distractores con alta similitud son mucho más difíciles |
| `complejidad_figura` | simple (1 forma) / compuesta (2-3 formas superpuestas) | Complejidad sube la dificultad de codificación inicial |

## Requisito de software
Esta es la única categoría de todo el temario donde el **tiempo de exposición es parte intrínseca del ítem**, no solo del examen completo — así que el "generador" no basta como imagen estática: necesita ser un componente interactivo (temporizador que oculta la imagen tras N segundos) más que un simple banco de preguntas exportable a PDF/Word. Para tu suite estática en Astro, esto encaja bien como componente cliente en JS/React con `setTimeout` — no requiere backend, solo la generación de la figura (reutilizando el mismo motor de primitivas SVG del resto de Abstracto) y la lógica de mostrar/ocultar en el navegador. Para producir un solucionario en PDF (donde no hay "tiempo"), este subtema se documenta distinto: como instrucción de aplicación ("mostrar 5 segundos, luego cubrir") en vez de pregunta autocontenida.

# Búsqueda de similares / "busco similar" (Atención y Concentración)

## Qué mide
Se muestra una figura modelo y, entre varias opciones muy parecidas entre sí, hay que encontrar la única idéntica al modelo (o, en la variante inversa, encontrar parejas/tríos iguales dentro de un conjunto grande sin modelo dado). Es percepción de forma pura — no hay memoria (el modelo permanece visible) ni razonamiento (no hay patrón que inducir), solo comparación exhaustiva de detalle.

## Catálogo de patrones encontrados

### 1. Modelo fijo + 3-5 opciones, solo una idéntica
```
Modelo: 🦋 (mariposa con alas de cierto patrón de manchas)
Opciones: A) alas asimétricas  B) idéntica al modelo  C) manchas en distinta posición  D) color distinto
```
El resto de opciones alteran exactamente un atributo cada una (posición, color, simetría) — así cada distractor "enseña" qué tipo de error se está entrenando a detectar.

### 2. Buscar parejas/grupos iguales sin modelo explícito
En vez de dar un modelo, se presenta una lámina con 15-20 figuras y se pide encontrar los N grupos de figuras idénticas entre sí (ej. "3 grupos de 5 figuras iguales" o "8 parejas"). La dificultad se gradúa reduciendo la cantidad de colores/formas distintas usadas, lo que aumenta la similitud superficial entre figuras que en realidad son diferentes.

### 3. Progresión de dificultad por reducción de variedad
Un recurso educativo consultado gradúa explícitamente la dificultad así: empezar con muchos colores y formas distintas (fácil, cada figura es visualmente única) y terminar con solo 2-3 colores y formas muy similares entre sí (difícil, exige comparar detalle fino en vez de reconocer "de un vistazo").

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `num_opciones` | 3–5 | Más opciones = más comparaciones necesarias |
| `num_atributos_variables` | forma, color, tamaño, orientación, posición de detalle interno | Cada atributo adicional que varía entre distractores sube la dificultad |
| `num_atributos_alterados_por_distractor` | 1 (solo cambia un atributo) o 2+ | Alterar solo 1 atributo por distractor es lo estándar (permite etiquetar "por qué" cada opción es incorrecta) |
| `paleta_colores` | 3–8 colores | Menos colores disponibles = mayor similitud superficial = más difícil |
| `modo` | modelo+opciones / búsqueda de grupos sin modelo | Búsqueda de grupos sin modelo es más difícil y más lento de resolver |

## Requisito de software
Reutiliza el mismo motor de primitivas SVG parametrizables que Series/secuencias gráficas y Rapidez perceptiva (forma base + función que altera un atributo a la vez: color, rotación, tamaño, posición de un sub-elemento). La pieza específica que este subtema necesita es un **generador de distractores por atributo único**: dado un objetivo, producir N variantes donde cada una difiere del original en exactamente un atributo controlado — eso es directamente reutilizable también en Discriminación Visual y en Conjuntos gráficos (ver archivo aparte), así que vale la pena construirlo como función independiente del motor, no como código específico de este subtema.

# Series / secuencias gráficas (Razonamiento Abstracto)

## Qué mide
Se presenta una sucesión de figuras que cambian progresivamente según una o más reglas; hay que inducir la regla y elegir la figura que continúa la secuencia. Es el subtema "base" de todo Abstracto — Matrices y Analogías son variaciones estructurales de esta misma idea (regla de transformación aplicada de forma sistemática).

## Catálogo de patrones encontrados

Las fuentes consultadas coinciden en que casi todas las transformaciones caen en un set reducido y combinable de operaciones:

### 1. Rotación progresiva
La figura (o un elemento dentro de ella) gira un ángulo fijo en cada paso (ej. 45°, 90°) en sentido horario o antihorario constante.

### 2. Adición/eliminación progresiva de elementos
Cada figura suma o resta un elemento respecto a la anterior (líneas, puntos, lados de un polígono). Ejemplo real encontrado: *"se van eliminando líneas en cada figura"* — cada paso resta exactamente un trazo.

### 3. Traslación / desplazamiento posicional
Un elemento se mueve de una posición a otra dentro de un marco fijo en cada paso (ej. *"el círculo se mueve de derecha a izquierda"*), a veces con movimiento cíclico (rebota en los bordes).

### 4. Cambio de tamaño (escalado progresivo)
Un elemento crece o decrece de forma constante en cada figura de la secuencia.

### 5. Cambio de sombreado/relleno progresivo
Alternancia o progresión en el patrón de relleno (blanco → rayado → sólido, o inversión de qué sección está sombreada).

### 6. Combinación de dos reglas simultáneas
El caso de mayor dificultad: dos transformaciones ocurren a la vez de forma independiente (ej. el cuadrado sombreado gira en sentido horario **y** los segmentos del vértice opuesto aumentan de número en cada figura). Requiere aislar cada regla por separado antes de poder predecir el resultado combinado.

### 7. Secuencia numérica disfrazada de figura
La cantidad de un elemento (lados, puntos, líneas) sigue una progresión aritmética o geométrica normal, solo que expresada visualmente en vez de con números.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `num_figuras_visibles` | 3–5 | Menos figuras visibles = menos evidencia para inducir la regla = más difícil |
| `tipo_transformacion` | rotación / adición-eliminación / traslación / escalado / sombreado | Cada tipo es una "primitiva" del motor |
| `num_reglas_simultaneas` | 1 o 2 | 2 reglas simultáneas es el salto de dificultad más marcado de este subtema |
| `paso_constante` | valor numérico de cambio por figura (ángulo, cantidad, tamaño) | Pasos "redondos" (90°, +1 elemento) son más fáciles que pasos irregulares |
| `orientacion_secuencia` | horizontal / vertical | Es más una variable de presentación que de dificultad real |

## Requisito de software
Núcleo del motor de toda la suite de Abstracto: primitivas SVG parametrizables — `rotar(figura, angulo)`, `escalar(figura, factor)`, `trasladar(figura, dx, dy)`, `sombrear(figura, patron)`, `agregar_elemento(figura, tipo)` — cada una recibe la figura anterior y un parámetro de paso, y devuelve la siguiente. Con esto, `generar_secuencia(figura_base, [transformaciones], num_pasos)` produce la serie completa, y el "distractor correcto por descarte" se genera aplicando una transformación *casi* correcta (paso equivocado, o solo una de las dos reglas si el ítem combina dos). Este mismo motor es la base que reutilizan Analogías, Conjuntos, Figuras excluidas y Matrices — conviene construirlo primero y una sola vez.

# Analogías gráficas (Razonamiento Abstracto)

## Qué mide
Formato "A es a B como C es a ___": se da un par de figuras (A→B) que guardan una relación de transformación entre sí; hay que aplicar esa misma relación a una tercera figura (C) para encontrar D entre las opciones. Es la misma familia de transformaciones que Series/secuencias gráficas, pero aplicada a un solo salto (par) en vez de a una secuencia progresiva de varios pasos.

## Catálogo de patrones encontrados

### 1. Transformación simple de un atributo
A→B aplica una sola operación (rotación fija, cambio de color, cambio de tamaño, inversión de sombreado). Se identifica qué cambió entre A y B, y se aplica exactamente esa misma operación a C.

### 2. Relación de composición (unir dos figuras para formar una tercera)
Patrón encontrado explícitamente en las fuentes: en cada fila se combinan dos formas para crear una tercera, manteniendo constante el contorno externo de una de ellas. La "regla" no es una transformación de una sola figura sino una operación entre dos figuras (unión, superposición, diferencia). Ejemplo: la figura resultante conserva el contorno externo de una de las dos figuras originales, pero incorpora el contenido interno (puntos, sombreado) que resulta de superponer ambas.

### 3. Relación por correspondencia uno a uno entre grupos
En vez de un solo par A→B, se presentan dos *grupos* de 2+ figuras cada uno; hay que encontrar qué figuras del grupo II corresponden en la misma secuencia lógica a las del grupo I, y completar la analogía manteniendo esa correspondencia posicional.

### 4. Rotación + superposición (transparencia)
Variante encontrada: "¿qué figura en transparencia resulta de rotar y superponer el siguiente par?" — se giran dos figuras y se superponen como si fueran transparentes; el resultado combina los trazos de ambas.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `tipo_relacion` | atributo único / composición de 2 figuras / rotación+superposición | Composición y superposición son más difíciles que atributo único |
| `atributo_transformado` | color, tamaño, rotación, sombreado, cantidad de elementos | Cada atributo es una primitiva reutilizada de Series gráficas |
| `num_atributos_simultaneos` | 1 o 2 | 2 atributos a la vez sube bastante la dificultad |
| `grado_similitud_C_con_A` | alto (C es muy parecido a A, fácil de mapear mentalmente) / bajo (C es una figura muy distinta, exige abstraer la regla sin apoyarse en la forma) | Baja similitud es más difícil porque obliga a abstraer la regla en vez de "copiar visualmente" |

## Requisito de software
Reutiliza el motor de primitivas de Series gráficas para el caso de "atributo único". Los casos de composición (unir dos figuras) y superposición por transparencia necesitan una operación adicional en el motor: `combinar(figura_a, figura_b, modo)` con modos tipo unión de trazos, intersección, diferencia (similar a operaciones booleanas de SVG/paths, que librerías como `svgpathtools` o manipulación directa de paths en Python permiten). Vale la pena implementar primero solo la variante de atributo único (barata, reutiliza todo) y dejar composición/superposición para una segunda iteración, dado que son minoría de los ejemplos encontrados frente a la variante simple.

# Conjuntos gráficos (Razonamiento Abstracto)

## Qué mide
Agrupar figuras según un atributo común compartido — es la contraparte "positiva" de Figuras excluidas (ese archivo pide identificar la que NO comparte el patrón; este pide reconocer qué SÍ define al grupo). En la práctica, ambos subtemas comparten el mismo motor de generación: uno construye N figuras con un atributo común deliberado, el otro le agrega un outlier y pregunta al revés.

## Catálogo de patrones encontrados

### 1. Atributo geométrico compartido
Todas las figuras del conjunto comparten número de lados, tipo de simetría, o número de vértices, aunque varíen en color, tamaño u orientación — el criterio de agrupación es exactamente ese atributo geométrico constante.

### 2. Atributo compuesto (más de una condición a la vez)
El conjunto comparte dos condiciones simultáneas (ej. "número par de lados Y con al menos un eje de simetría") — hace que agrupar solo por inspección visual rápida no baste; hay que verificar cada condición por separado.

### 3. Conjuntos por relación funcional/categórica (no geométrica)
En vez de un atributo visual puro, el criterio de agrupación es conceptual (ej. "objetos que se usan para lo mismo", "elementos del mismo dominio"). Esta variante es la menos proceduralizable de todas porque requiere una base de conocimiento semántica, no solo geométrica — normalmente en los bancos de estas pruebas aparece con mucha menor frecuencia que la variante geométrica.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `num_figuras_conjunto` | 4–6 | Más figuras a verificar = más tiempo, no necesariamente más difícil por ítem |
| `atributo_criterio` | número de lados, simetría, cantidad de elementos internos, tipo de relleno | Cada atributo es una función de verificación reutilizada del motor de primitivas |
| `num_criterios_simultaneos` | 1 o 2 | 2 criterios simultáneos es el salto de dificultad principal |
| `variabilidad_atributos_irrelevantes` | baja (todas del mismo color/tamaño, atributo obvio) / alta (color, tamaño y orientación varían libremente, solo el criterio real se mantiene) | Alta variabilidad en lo irrelevante obliga a descartar más "pistas falsas" |

## Requisito de software
Comparte el motor de primitivas de Series/Analogías gráficas. La pieza específica que este subtema necesita es una función `verificar_atributo(figura, tipo_atributo) -> valor` (contador de lados, detector de simetría, contador de elementos internos) que permita, dado un criterio, **filtrar** cuáles figuras generadas cumplen la condición — en vez de generar figura por figura a mano. Con esa función de verificación construida una vez, tanto Conjuntos gráficos como Figuras excluidas (ver archivo aparte) quedan resueltos con la misma pieza de código, solo cambiando si se pide "cuál cumple" o "cuál no cumple".

# Figuras excluidas / término excluido gráfico (Razonamiento Abstracto)

## Qué mide
Se presenta un grupo de figuras donde 4 (o más) comparten una característica común y una no la comparte; hay que identificar el "intruso". A diferencia de Matrices y Series, aquí explícitamente **no hay opciones de respuesta con un patrón que completar** — se trata de descarte puro: encontrar qué elemento rompe la regla que sí cumplen los demás.

## Catálogo de patrones encontrados

### 1. Ruptura de un atributo geométrico único
Las fuentes dan un ejemplo textual claro: en un conjunto donde todas las figuras son simétricas respecto a un eje vertical, el intruso es la única simétrica respecto a un eje diagonal. La regla del grupo es sutil (tipo de eje de simetría), no la forma general de la figura.

### 2. Ruptura por cantidad
El grupo comparte una cantidad constante de algún elemento (lados, puntos, líneas internas) y el intruso tiene una cantidad distinta.

### 3. Ruptura por relación de tamaño/proporción
Todas las figuras guardan una misma proporción entre dos medidas (ej. ancho/alto) salvo una que la rompe, aunque a primera vista parezcan del mismo "tipo" de figura.

### 4. Consejo metodológico recurrente en las fuentes
Un patrón práctico que aparece repetido: si los caracteres del conjunto son números, el orden suele estar trazado por un aumento gradual (progresión); si son símbolos/figuras, el orden suele estar determinado por giros o por aumento de partes de las piezas — es decir, las mismas primitivas que Series gráficas (rotación, adición de elementos) son las que definen la regla que el intruso rompe.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `num_figuras_grupo` | 4–5 (estándar del formato) | El estándar de la mayoría de bancos consultados es 4 o 5 |
| `atributo_regla` | simetría, cantidad de elementos, proporción, tipo de relleno | Reutiliza `verificar_atributo()` del motor de Conjuntos gráficos |
| `sutileza_regla` | regla obvia (forma general distinta) / regla sutil (mismo tipo de figura, un solo atributo fino distinto) | La regla sutil (ej. tipo de eje de simetría) es sustancialmente más difícil que una forma obviamente distinta |
| `num_figuras_similares_al_intruso` | 0 (intruso muy distinto) a 3 (varias figuras "casi" rompen la regla, como distractor de atención) | Incluir 1-2 figuras que "casi" son intrusas pero sí cumplen la regla sube mucho la dificultad real |

## Requisito de software
Es prácticamente el mismo generador que Conjuntos gráficos, invertido: se genera el grupo base cumpliendo `verificar_atributo(figura, criterio) == True` para N-1 figuras, y se inserta una figura que da `False` para ese mismo criterio (pero puede seguir siendo `True` para otros criterios irrelevantes, lo cual es justamente lo que hace un buen distractor). Construir estos dos subtemas (Conjuntos y Figuras excluidas) como una sola pieza de software con un flag `modo="incluir"` vs `modo="excluir"` evita duplicar trabajo.

# Matrices gráficas (Razonamiento Abstracto)

## Qué mide
El subtema de mayor complejidad de todo el temario, según coinciden todas las fuentes consultadas. Una cuadrícula (típicamente 3x3, aunque puede ser NxN) de figuras donde cada elemento se relaciona con los demás según reglas que operan por fila, columna, diagonal, o combinadas. Una celda queda vacía (usualmente la inferior derecha, aunque puede ubicarse en cualquier posición) y hay que deducir qué figura la completa. Es Series gráficas + Analogías gráficas combinadas en dos dimensiones simultáneas en vez de una sola secuencia lineal.

## Catálogo de patrones encontrados

### 1. Matriz por conteo/permutación (el patrón más citado)
Ejemplo textual recurrente: en cada fila y cada columna aparece exactamente un cuadrado, un triángulo y un círculo (nunca se repite un tipo de figura en la misma fila o columna) — es literalmente la misma lógica que un Sudoku aplicado a formas en vez de números. La celda faltante se deduce por eliminación: qué figura falta en esa fila y en esa columna simultáneamente.

### 2. Matriz por secuencia progresiva en una dirección
La regla avanza (rota, escala, suma elementos) de izquierda a derecha en cada fila, y ese mismo patrón de avance se repite en cada fila con un punto de partida distinto — equivalente a aplicar la lógica de Series gráficas a cada fila por separado.

### 3. Matriz por combinación algebraica de fila/columna
Ejemplo encontrado: la ley de formación funciona como una progresión aritmética aplicada a un atributo (ej. "sumar 4 a la cantidad de elementos en cada paso: 3, 7, 11...") — la secuencia numérica disfrazada de figura, pero ahora aplicada dentro de una matriz en vez de una fila simple.

### 4. Matriz combinada (regla de fila distinta a la regla de columna)
El nivel más alto de dificultad: la transformación horizontal (fila) es distinta de la transformación vertical (columna), y la celda faltante debe satisfacer ambas reglas a la vez — es la generalización bidimensional de la "combinación de dos reglas simultáneas" que ya aparece en Series gráficas.

### 5. Metodología de resolución recurrente en las fuentes
Un método de 3 pasos aparece repetido en varias fuentes: (1) Observar — identificar tipos de figura, cantidad y ubicación en cada fila/columna; (2) Analizar/ordenar/relacionar/comparar — centrar el análisis primero en filas, luego en columnas, buscando qué cambia consistentemente; (3) Inducir y deducir — aplicar la regla encontrada a la celda faltante. Este mismo orden de pasos es útil como estructura de la guía de estudio, no solo como criterio de generación.

## Parámetros para generación procedural
| Parámetro | Rango sugerido | Efecto en dificultad |
|---|---|---|
| `dimension_matriz` | 3x3 (estándar casi universal en las fuentes) | Aumentar a 4x4 es posible pero prácticamente no aparece en los bancos consultados |
| `tipo_regla` | conteo/permutación tipo Sudoku / progresión por fila / combinación aritmética / regla combinada fila≠columna | La regla combinada fila≠columna es la de mayor dificultad |
| `posicion_celda_vacia` | esquina inferior derecha (estándar) / cualquier posición | Posición no estándar sube la dificultad porque rompe el hábito de leer "hasta el final" |
| `num_atributos_variables` | 1 (solo forma) / 2+ (forma + color + tamaño simultáneos) | Cada atributo adicional que varía independiente sube la dificultad exponencialmente, no linealmente |

## Requisito de software
Es el subtema de mayor inversión pero también el de mayor prioridad, dado que aparece como el más complejo y frecuente en las fuentes revisadas. Reutiliza el motor de primitivas de Series/Analogías gráficas, pero necesita una capa de **composición de reglas en 2D**: `generar_matriz(regla_fila, regla_columna, dimension) -> grid_de_figuras`, donde cada celda `(i,j)` se calcula aplicando `regla_fila` avanzando en `j` y `regla_columna` avanzando en `i` sobre una figura base. Para la variante tipo Sudoku (permutación sin repetición por fila/columna), conviene generar primero la matriz de asignación de tipos con un algoritmo de Sudoku simplificado (NxN con N tipos de figura) y luego renderizar cada celda — separar la lógica combinatoria del renderizado gráfico facilita reutilizar el mismo generador combinatorio para dificultades distintas.

