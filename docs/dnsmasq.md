---

## Versiones del post

Hay dos formas de abordar este tema, dependiendo del formato y plataforma:

---

### Versión larga (LinkedIn / blog / hilo)

**Título:** `dnsmasq` hace DNS, DHCP y PXE. Y cabe en un solo proceso.

---

Antes de conocer `dnsmasq`, tenía tres herramientas distintas para manejar red local: un servidor DNS, un DHCP externo, y algo para PXE boot. Tres configs, tres servicios, tres puntos de fallo.

`dnsmasq` reemplaza todo eso. Un binario, un archivo de configuración, y ya está corriendo.

**Lo que hace que la mayoría ignora:**

*DNS local con overrides* — puedes resolver dominios propios sin tocar `/etc/hosts` en cada máquina. `address=/miapp.local/192.168.1.10` y listo.

*DHCP con leases estáticas* — asignas IPs fijas por MAC address sin levantar un servidor aparte. Útil cuando necesitas que una máquina siempre tenga la misma IP para conectarte.

*PXE boot* — sirve el archivo de arranque por red junto al DHCP. Un solo demonio bootea máquinas sin disco. Lo usé para levantar TinyCore Linux en una Pentium 4 sin tocar un USB.

*DNS spoofing controlado* — interceptas dominios específicos y los redirigís a donde quieras. Esto lo uso en Catsplash, un portal cautivo escrito en Go: todo el tráfico de una red WiFi apunta al portal antes de autenticar. `dnsmasq` es quien intercepta las consultas DNS y redirige al captive portal.

**La config mínima que uso para un portal cautivo:**

```
interface=wlan0
dhcp-range=10.0.0.10,10.0.0.100,12h
dhcp-option=3,10.0.0.1
address=/#/10.0.0.1
```

Cuatro líneas. DHCP activo, gateway configurado, y todos los dominios resuelven a `10.0.0.1` — donde corre el portal.

No necesité nginx como proxy, no necesité iptables complicado para el redirect inicial. El DNS hace el trabajo sucio.

**Por qué me gusta:**
- Se instala con un paquete en cualquier distro
- El binario tiene ~500KB
- La documentación del `man` es completa y directa
- Se puede restringir a una sola interfaz sin configuración extra

Si administrás red local, homelabs, o construís herramientas que necesitan control de red, `dnsmasq` debería estar en tu stack antes que cualquier alternativa más pesada.

---

### Versión corta (TikTok / Reels / post rápido)

**Hook visual sugerido:** terminal mostrando `dnsmasq` arrancando, con tres líneas de log: `dnsmasq[PID]: started, version X`, `dnsmasq-dhcp: DHCP, IP range ...`, `dnsmasq: reading /etc/dnsmasq.conf`.

---

Un demonio. DNS local, DHCP, y PXE boot.

`dnsmasq` es la herramienta de red más subestimada de Linux. La mayoría la usa sin saber que la tiene —`NetworkManager` la llama internamente para DNS.

Yo la uso explícitamente en un portal cautivo escrito en Go. Intercepta todas las consultas DNS antes de autenticar al usuario y las manda al portal. No hay forma más limpia de hacerlo.

`address=/#/10.0.0.1` — una línea. Todos los dominios resuelven a tu IP.

---

## Ángulos adicionales que podés explorar

Si querés hacer una serie, esto escala bien:

- **Parte 1** — DNS local con `dnsmasq` (overrides, split-horizon)
- **Parte 2** — DHCP + leases estáticas
- **Parte 3** — PXE boot + TinyCore (la Pentium 4, caso real)
- **Parte 4** — DNS spoofing para captive portals (Catsplash como caso de uso)

Esa última entrega es la más técnica y la que más diferencia tu contenido —no hay muchos posts en español que expliquen cómo funciona el DNS redirect en un captive portal desde adentro.
