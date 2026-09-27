**Procesos y memoria (encajan perfecto con tu motor de "pila" del defer)**
- `fork()` — un proceso que se divide en dos, mostrando el mismo código ejecutándose por duplicado con distinto PID
- Fork bomb `:(){ :|:& };:` — visualización de crecimiento exponencial de procesos (buen gancho de "no lo ejecutes en tu máquina")
- Zombie vs proceso huérfano — tabla de procesos con estados, uno "colgado" esperando que el padre lea su exit status

**Permisos y filesystem (muy visual, poco explicado bien)**
- `chmod 755` bit a bit — los tres grupos (user/group/other) prendiéndose como luces según el número octal
- Symlink vs hardlink — dos flechas apuntando al mismo inodo vs una copia del puntero
- `rm` vs mover a la papelera — por qué en Linux no hay "deshacer" (el inodo se libera, no se mueve)
- Permission denied paso a paso — el kernel recorriendo user→group→other hasta encontrar el primer match (¡es literalmente un switch/match visual!)

**Shell y procesos en pipeline (tu fuerte, conecta con Go concurrency)**
- Pipes `|` — animación de un proceso escribiendo a un buffer que otro lee, con backpressure si el buffer se llena
- Diferencia entre || y &&.
- `&` y jobs en background — la shell no espera, el proceso sigue corriendo aparte
- Señales (`SIGTERM` vs `SIGKILL`) — una es "pídele que se cierre" (puede ignorarla/hacer cleanup, conecta con `defer`), la otra es "el kernel lo mata sin preguntar"
- Redirección `>`, `>>`, `2>&1` — cómo la shell reconecta los file descriptors antes de ejecutar el programa

**🐧 Linux y Sistemas**

* **`SIGTERM` vs `SIGKILL` (Manejo de Señales):**
* **La animación:** Un proceso recibiendo `SIGTERM` (15) que ejecuta su rutina de limpieza (cierra sockets, vacía buffers) antes de salir en verde. Al lado, la misma aplicación recibiendo `SIGKILL` (9), donde el Kernel la aniquila al instante dejándola en rojo sin tiempo de limpiar.

* **Hard Links vs. Soft Links (Inodes):**
* **La animación:** Un bloque central que representa el Inode en disco. Se ve cómo eliminar el archivo original destruye el *Symlink* (flecha rota a una ruta inexistente), mientras que el *Hard Link* conserva los datos intactos porque apunta directo al Inode.

* **Descriptores de Archivo (`stdin`, `stdout`, `stderr`):**
* **La animación:** Tres tuberías saliendo de un proceso (0, 1 y 2). Muestra gráficamente qué ocurre en la terminal al usar `>`, `>>` (anexar al final) o redireccionar errores con `2>&1`.

* **Permisos Binarios y `umask`:**
* **La animación:** La máscara binaria en acción. Muestra cómo `umask 022` le resta bits a los permisos por defecto (`666` para archivos, `777` para directorios) mediante una operación lógica `AND NOT` gráfica.

---

**🌐 Redes y Protocolos**

* **TCP 3-Way Handshake vs. UDP:**
* **La animación:** A la izquierda, TCP intercambiando paquetes `SYN` $\rightarrow$ `SYN-ACK` $\rightarrow$ `ACK` para sincronizar estados. A la derecha, UDP disparando ráfagas continuas de paquetes sin esperar confirmación ni verificar la llegada.
