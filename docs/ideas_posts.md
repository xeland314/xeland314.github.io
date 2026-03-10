# Evaluación de Posts y Propuestas de Ideas Futuras

Este documento contiene un análisis de los artículos actualmente publicados y en borrador dentro de `db/posts.ts`, así como una serie de propuestas detalladas para futuros artículos basándonos en la temática, estilo y estructura del contenido existente.

## Análisis del Contenido Actual

Al evaluar la lista en `db/posts.ts` se puede notar una fuerte preferencia por desglosar conceptos técnicos a su nivel más fundamental. Estos son los temas principales que ya se están cubriendo:

1. **"Anatomía" de tecnologías, formatos y conceptos (Deep dives)**:
   - Publicados: URLs, IEEE 754, Git Commits, JWT, Formato PPM, Formato TOON.
   - En borrador: IPv4, Lex (.l), Yacc (.y).
2. **Desarrollo de Software y Arquitectura**:
   - Publicados: Antipatrones, i18n vs l10n, SemVer (x.y.z), variables de entorno.
   - En borrador: Hashing vs Cifrado, Operaciones Bitwise.
3. **Linux, Sistemas y DevOps**:
   - Publicados: Permisos Linux (755 y Extended).
   - En borrador: AWK, Standard Streams, Cron Syntax.
4. **Redes y Protocolos**:
   - Publicados: HTTP Requests.
   - En borrador: HTTP/2 Framing, HTTP/2 Layers, Protocolos OsmAnd.
5. **Lenguajes Específicos**:
   - En borrador: Python (Walrus operator, Métodos Mágicos), HTML (Block vs Inline).

**Tendencia principal**: Explicaciones paso a paso de _cómo funcionan las cosas por debajo_ (Anatomías), guías de buenas prácticas (Antipatrones, i18n) y herramientas de terminal/Linux.

---

## Propuestas de Nuevos Temas (Future Posts)

Basado en el éxito de las categorías anteriores (especialmente el formato "Anatomía" y herramientas Linux/Redes), aquí hay varias ideas para futuros posts clasificados por categoría:

### 1. La Serie "Anatomy" (Desglosando desde cero)

Dado el evidente enfoque en desglosar estructuras (JWT, URLs, Commits), estos encajarían perfectos:

- **Anatomía de un Handshake TLS/SSL**: Cómo funciona la conexión segura antes de enviar el HTTP Request. Complementa "HTTP Request" y "JWT Anatomy".
- **Anatomía de la Resolución DNS**: Qué paso recorre un dominio web para convertirse en una dirección IP. Complementa "IPv4: 192.168.0.1".
- **Anatomía de Base64**: Explicar a nivel de bits cómo funciona Base64 (padding `=`, por qué aumenta el tamaño del archivo un 33%). Complementa "Bitwise Operations".
- **Anatomía de una Imagen SVG**: Explicar la estructura de un archivo XML/SVG puro, paths (`d="M..."`), fill, etc. Complementa "PPM Anatomy" y "Formato TOON".
- **Anatomía de un paquete TCP (vs UDP)**: Analizar la cabecera (header) de TCP, source/destination ports, sequence numbers y banderas (SYN, ACK).
- **Anatomía de un Contenedor / Imagen Docker**: ¿Qué significa exactamente una imagen "basada en capas" y qué es el Dockerfile por dentro?

### 2. Formatos, Estándares e Identificadores

Ya cuentas con posts de SemVer, y `/llms.txt`.

- **UUID vs ULID vs Snowflake ID**: ¿Por qué no usar IDs auto-incrementales? Diferencias anatómicas entre estos identificadores y cuál elegir en bases de datos.
- **YAML vs TOML vs JSON**: Un post comparativo y práctico de ventajas, anatomía y casos de uso en configuración de proyectos. Complementa el artículo de variables de entorno.
- **El estándar Markdown (CommonMark)**: Cómo los lenguajes parsean MD, qué tiene de especial y las distintas "sabores" (Github Flavored Markdown).
- **UTF-8 Anatomy**: Cómo hacemos encajar miles de caracteres (emojis incluidos) en una secuencia de 1 a 4 bytes.

### 3. Sistemas Linux y Herramientas CLI

Complementando los artículos de Cron, Awk, y Permisos.

- **Bash, Regex, Sed y Grep**: Ya cubriste AWK, el siguiente paso lógico es dominar `grep` para búsquedas y `sed` para reemplazar. Ejemplos de procesar logs en la terminal.
- **Señales UNIX (SIGINT, SIGKILL, SIGTERM)**: Cómo se terminan los programas en Linux de forma graciosa vs forzada (kill -9 vs kill -15).
- **SSH Keys: RSA vs Ed25519**: Tipos de criptografía en las llaves, cómo funciona el authorized_keys y permisos de los archivos SSH (complementa el post de permisos linux e Hashing vs Cifrado).

### 4. Git Avanzado

Siguiendo la línea de "Git Commit Anatomy" y la "Cheatsheet".

- **Git Internals (Objetos Git): Blob, Tree, Commit y Tag**: ¿Cómo guarda Git realmente la información en la carpeta `.git/objects`?
- \**Git Rebase vs Git Merge*5\*: Un entendimiento claro, visual, sobre cuándo utilizar qué (y el peligro del rebase en ramas públicas).
- **Git Hooks**: Cómo automatizar `pre-commit` o `pre-push` localmente.

### 5. Arquitectura y Buenas Prácticas

Complementando temas como "5 Antipatrones" e "i18n vs l10n".

- **Los Principios SOLID (con malos y buenos ejemplos)**: Un básico indispensable desglosado de una manera fácil de digerir.
- **REST vs GraphQL vs gRPC**: Cuándo elegir cuál en sistemas modernos.
- **Inyección de Dependencias vs Inversión de Control**: Conceptos a veces confusos que se pueden explicar con ejemplos simples.
- **Estrategias de Caché**: Explicación de LRU (Least Recently Used), TTL, y usos de Redis.

### 6. Algoritmia y Matemáticas en Code

Siguiendo la idea de "Movimiento Browniano".

- **Generación de Números (Pseudo) Aleatorios (PRNG)**: ¿Por qué no son realmente aleatorios? Semillas y el Algoritmo Mersenne Twister.
- **Máquinas de Estado Finito (FSM)**: Qué son y cómo nos ayudan a limpiar código que tiene de otra manera cientos de sentencias `if-else`. (Hace mucha sinergia con la idea de Compiladores Lex/Yacc).
- **Big O Notation (Complejidad Algorítmica)**: De forma visual y práctica, analizar por qué tu bucle anidado está congelando el servidor.

---

## Sugerencias de Organización

- Muchos artículos se encuentran actualmente en estado "no publicado" o "En desarrollo" (IPv4, HTTP/2, Lex, Awk, etc). Finalizar esta cantidad de borradores de altísimo valor debería ser prioridad antes de abarcar temas nuevos.
- Considera agrupar algunos artículos en "Series". Por ejemplo una etiqueta `Serie: Redes` para conectar IPv4 -> TCP -> TLS -> HTTP -> HTTP/2.
