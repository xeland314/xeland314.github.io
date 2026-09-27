Con tu stack y tu audiencia no-principiante, este formato (metáfora física + panel de código sincronizado) rinde mejor en conceptos que la gente entiende mal por abstracción, no por dificultad. Algunas ideas concretas:

**Control de flujo / fundamentos**
- `for` vs `while` vs `match` — comparativa lado a lado, mismo problema resuelto con las tres
- Recursión con pila visual (llamadas apilándose como fichas de dominó, luego "cayendo" en el retorno)
- Punteros/referencias en C/Zig — dos cajas apuntando a la misma dirección de memoria
- `defer` en Go/Zig — cola de tareas que se ejecuta en reversa al salir de la función

**Concurrencia (fuerte en tu stack Go)**
- Goroutines + channels como una línea de producción con buzones
- Mutex como una llave física que solo puede sostener una goroutine a la vez
- Race condition — dos "manos" escribiendo la misma variable al mismo tiempo, mostrando el resultado corrupto

**Memoria (tu ángulo "compile to use" es perfecto aquí)**
- Stack vs Heap como dos bodegas distintas (una se limpia sola, la otra hay que ordenarla)
- Ownership/lifetimes en Zig — quién es responsable de "botar la basura"
- Comptime en Zig — código que se ejecuta en la fábrica (compilación) vs en la tienda (runtime)

**Estructuras de datos**
- Hash map — casilleros numerados con función hash como "portero" que decide el casillero
- Árbol binario de búsqueda como un organigrama de decisiones sí/no
- Linked list vs array — vagones de tren enganchados vs estantería con espacios fijos

