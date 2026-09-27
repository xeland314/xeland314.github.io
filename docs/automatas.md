Aquí están todos los temas importantes del capítulo, ordenados por sección:

---

**1. Tipos de tokens (§3.1)**
La clasificación fundamental de los elementos léxicos de un lenguaje: keywords, identificadores, números, strings, comentarios y espacios en blanco. Es el punto de partida de cualquier compilador, porque antes de entender un programa hay que saber de qué "palabras" está compuesto.

**2. Ambigüedad en la definición informal de tokens (§3.1)**
El capítulo destaca que definir tokens en lenguaje natural es insuficiente y propenso a ambigüedades. Motiva la necesidad de un formalismo matemático (expresiones regulares) para especificarlos sin margen de error.

**3. Scanner hecho a mano (§3.2)**
Se muestra una implementación manual en C con `fgetc`/`ungetc`. Es importante porque ilustra el patrón de *lookahead* y *backtracking* al consumir caracteres: cuando un carácter no encaja en el token actual, se "devuelve" al stream. Este patrón reaparece en todas las etapas del compilador.

**4. Limitaciones del scanner manual (§3.2)**
A medida que crece el número de tokens, el código manual se vuelve inmanejable y difícil de verificar. Esto motiva directamente el uso de herramientas formales y generadores automáticos.

**5. Expresiones regulares — definición formal (§3.3)**
Se define formalmente L(s) como el lenguaje de una expresión regular, con sus tres reglas inductivas: alternación (`|`), concatenación y clausura de Kleene (`*`). Es la base teórica de todo lo que sigue, y la misma formalización usada en herramientas como `grep`, Perl, PCRE, etc.

**6. Operadores extendidos de ER (§3.3)**
Se presentan los azúcares sintácticos útiles en la práctica: `s?` (opcional), `s+` (uno o más), `[a-z]` (rangos), `[^x]` (negación). Son imprescindibles para escribir expresiones compactas y legibles en especificaciones reales.

**7. Propiedades algebraicas de las ER (§3.3)**
Asociatividad, conmutatividad, distributividad e idempotencia. Permiten re-arranjar expresiones para optimizarlas o simplificarlas sin cambiar el lenguaje que describen.

**8. Autómatas finitos — concepto general (§3.4)**
Un FA como máquina abstracta con estados, transiciones etiquetadas, estado inicial y estados de aceptación. Es el modelo computacional subyacente del scanner: toda ER se puede representar como un FA y viceversa.

**9. Autómatas finitos deterministas — DFA (§3.4.1)**
Cada estado tiene como máximo una transición por símbolo, lo que elimina la ambigüedad. Un DFA es directamente implementable como una matriz de transiciones `M[estado, símbolo]`, extremadamente eficiente en software y hardware.

**10. Autómatas finitos no deterministas — NFA (§3.4.2)**
Un NFA permite múltiples transiciones para el mismo símbolo (y transiciones ε). Aunque no es implementable directamente de forma eficiente, es mucho más fácil de construir a partir de una ER. Las dos interpretaciones —*crystal ball* y *many-worlds*— son conceptualmente importantes para entender cómo se convierte a DFA.

**11. Transiciones ε (epsilon) (§3.4.2)**
Transiciones que no consumen ningún símbolo de entrada. Son el mecanismo que permite componer NFAs modulares en la construcción de Thompson, y son la clave para entender el *ε-cierre* de un conjunto de estados.

**12. Conversión de ER a NFA — construcción de Thompson (§3.5.1)**
Un algoritmo inductivo que traduce cualquier ER en un NFA siguiendo la misma estructura inductiva de la definición formal. Es fundamental porque es el primer paso del pipeline RE → NFA → DFA → código.

**13. Conversión de NFA a DFA — construcción de subconjuntos (§3.5.2)**
Cada estado del DFA resultante corresponde a un *conjunto* de estados del NFA. Permite pasar de una representación no determinista (fácil de construir) a una determinista (fácil de ejecutar). Es el algoritmo central del capítulo.

**14. Minimización de DFAs — algoritmo de Hopcroft (§3.5.3)**
La construcción de subconjuntos puede producir DFAs grandes con estados redundantes. Hopcroft agrupa estados equivalentes en super-estados y los divide iterativamente hasta obtener el DFA mínimo. Esto tiene impacto directo en el rendimiento del scanner, ya que un DFA grande puede no caber en caché L1.

**15. Límites de los autómatas finitos (§3.6)**
Los FA no pueden reconocer lenguajes que requieran memoria ilimitada, como el anidamiento arbitrario de paréntesis. Esto establece la frontera natural del scanner y motiva el uso de técnicas de *parsing* (Capítulo 4) para la estructura jerárquica de un programa.

**16. Generadores de scanners — Flex (§3.7)**
Flex transforma una especificación de ER + acciones en C en código C funcional para un scanner. Es la aplicación práctica de toda la teoría anterior. Se cubren la estructura del archivo `.flex`, las clases de caracteres, las reglas y el código auxiliar (`yywrap`, `yytext`, `yyin`, `yylex`).

**17. Consideraciones prácticas (§3.8)**
Temas de ingeniería real que no cubre la teoría pura:
- **Manejo de keywords** que se solapan con identificadores (orden de reglas en Flex, o tabla de búsqueda).
- **Rastreo de número de línea/columna** para mensajes de error útiles.
- **Limpieza de tokens** (e.g. remover comillas de strings, interpretar `\n`).
- **Restricción de longitud** de tokens para evitar desbordamientos.
- **Manejo de errores** con recuperación: devolver un token de error en lugar de abortar, para reportar múltiples errores en una sola pasada.

---

En resumen, el capítulo construye una escalera completa: *problema informal → ER formal → NFA (fácil de construir) → DFA (fácil de ejecutar) → DFA mínimo → código real con Flex*, cerrando con los detalles prácticos que separan la teoría de un compilador funcional.

"Azúcar sintáctico" es la traducción directa de *syntactic sugar*, término acuñado por Peter Landin en 1964. Se refiere a sintaxis que no añade poder expresivo al lenguaje, sino que hace que ciertas cosas sean más cómodas de escribir. Todo lo que expresas con azúcar sintáctico ya lo podías expresar sin él, solo que de forma más verbosa.

En el caso de las ER: `s+` no te permite describir ningún lenguaje que `ss*` no pudiera describir. Es pura comodidad.

Alternativas en español que puedes usar:

- **Notación abreviada** — neutro y preciso, funciona bien en contexto técnico-académico
- **Conveniencia sintáctica** — calco más literal de "syntactic convenience", que es como algunos autores lo dicen en inglés
- **Atajo sintáctico** — más coloquial, pero claro
- **Notación de conveniencia** — común en libros de compiladores traducidos al español

De esas, **notación abreviada** es probablemente la más limpia para una presentación académica: es autoexplicativa sin necesitar traducción de jerga.

# Tokens en la Práctica
## De la teoría al scanner con Flex y Bison

Flex genera el scanner. Bison genera el parser. Juntos forman el núcleo de un compilador real.

---
# El Pipeline Completo
## Cómo encajan las piezas

| Etapa | Herramienta | Entrada | Salida |
| :--- | :---: | :--- | :--- |
| Análisis léxico | **Flex** | texto fuente | tokens |
| Análisis sintáctico | **Bison** | tokens | árbol |
| Generación de código | manual/LLVM | árbol | binario |

Flex y Bison se comunican mediante una función: `yylex()`.

---
# Estructura de un Archivo Flex
## Tres secciones separadas por `%%`

```c
%{
/* Código C que va al inicio del scanner generado */
#include "tokens.h"
%}

%%

/* Reglas: patrón   { acción } */

%%

/* Código C auxiliar */
int yywrap() { return 1; }
```

---
# Definiendo los Seis Tipos de Token
## Un patrón por tipo

```
%%
[ \t\n]+            { /* ignorar espacios */ }
"while"             { return TOKEN_WHILE; }
"class"             { return TOKEN_CLASS; }
[A-Za-z_][A-Za-z0-9_]*  { return TOKEN_ID; }
[0-9]+(\.[0-9]+)?   { return TOKEN_NUM; }
\"([^\"\\]|\\.)*\"  { return TOKEN_STRING; }
\/\/[^\n]*          { /* ignorar comentario */ }
.                   { return TOKEN_ERROR; }
%%
```

---
# Keywords vs Identificadores
## Por qué el orden importa en Flex

Flex aplica la **primera regla que hace match** cuando hay empate de longitud.

```
"while"                  { return TOKEN_WHILE; }   /* ← primero */
[A-Za-z_][A-Za-z0-9_]*  { return TOKEN_ID; }      /* ← después */
```

Si se invierten, `while` siempre sería un identificador.

La alternativa: una sola regla de identificador con tabla de búsqueda en la acción.

---
# Tabla de Búsqueda de Keywords
## Una regla, muchas keywords

```c
typedef struct { char *word; int token; } Keyword;

Keyword keywords[] = {
    {"while", TOKEN_WHILE},
    {"class", TOKEN_CLASS},
    {"true",  TOKEN_TRUE},
    {NULL, 0}
};

int lookup(char *s) {
    for (int i = 0; keywords[i].word; i++)
        if (strcmp(s, keywords[i].word) == 0)
            return keywords[i].token;
    return TOKEN_ID;
}
```

---
# Rastreo de Posición
## Mensajes de error útiles

```c
%{
int yyline = 1;
int yycol  = 1;
%}

%%

\n   { yyline++; yycol = 1; }
.    { yycol += yyleng; return TOKEN_ERROR; }
```

Con esto, el parser puede emitir:

```
error: símbolo desconocido '@' en línea 42, columna 7
```

---
# Limpieza de Tokens
## El valor interno ≠ el texto fuente

El texto que Flex captura en `yytext` para `"hello\n"` es literal: incluye las comillas y la barra invertida.

```c
\"([^\"\\]|\\.)*\"  {
    yytext[yyleng - 1] = '\0'; /* quitar comilla final */
    char *val = unescape(yytext + 1); /* procesar escapes */
    return TOKEN_STRING;
}
```

`unescape` convierte `\n` → newline, `\\` → `\`, `\"` → `"`.

---
# Restricción de Longitud
## Evitar desbordamientos

`YYLMAX` controla el tamaño máximo del buffer de `yytext`.

```c
%{
#define YYLMAX 256
%}
```

Si un identificador supera el límite, Flex trunca silenciosamente. Una validación explícita es mejor:

```c
[A-Za-z_][A-Za-z0-9_]*  {
    if (yyleng > 255) error("identificador demasiado largo");
    return TOKEN_ID;
}
```

---
# Manejo de Errores con Recuperación
## El usuario merece ver todos los errores

La regla comodín captura cualquier carácter no reconocido:

```c
.   { 
    fprintf(stderr, "carácter inválido '%c' en línea %d\n",
            yytext[0], yyline);
    return TOKEN_ERROR;
}
```

El parser recibe `TOKEN_ERROR`, lo registra, y llama `yylex()` de nuevo. El compilador reporta **todos los errores léxicos** en una pasada.

---
# Conexión con Bison
## Cómo el parser consume los tokens

```c
/* En el archivo .y de Bison */
%token TOKEN_WHILE TOKEN_CLASS TOKEN_ID TOKEN_NUM TOKEN_STRING

%%

statement:
    TOKEN_WHILE '(' expr ')' block  { /* acción */ }
  | TOKEN_ID '=' expr ';'           { /* acción */ }
  ;
```

Bison llama a `yylex()` cada vez que necesita el siguiente token. Flex y Bison comparten el tipo `YYSTYPE` para pasar el valor del token.

---
# Resumen
## Del texto fuente al árbol sintáctico

- **Flex** traduce patrones RE en un scanner eficiente — las seis categorías de tokens se vuelven reglas concretas
- El **orden de reglas** resuelve el conflicto keyword vs identificador
- **`yytext`, `yyleng`, `yyline`** son las variables de estado del scanner
- La regla `.` es la red de seguridad: captura errores sin abortar

*Flex hace el trabajo pesado — el compilador real empieza en Bison.*
