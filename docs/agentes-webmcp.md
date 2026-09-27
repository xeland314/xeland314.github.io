# Runbook: las 7 auditorías de "Navegación con agentes" (Lighthouse / PageSpeed)

Referencia de cómo se pasa cada auditoría de la categoría **Agentic Browsing**.
Estado del portafolio al cierre: **6/6 puntuables aprobadas** + inventario de herramientas lleno.

> La categoría no usa nota 0–100: es una fracción de auditorías aprobadas sobre aplicables.
> Requiere Chrome 150+ y el origin trial de WebMCP (si no hay origin trial, las 3 de WebMCP salen "No aplicable").

| # | Auditoría | Tipo | Estado |
|---|---|---|---|
| 1 | `llms-txt` | Puntuable | ✅ |
| 2 | `agent-accessibility-tree` | Puntuable | ✅ |
| 3 | `cumulative-layout-shift` | Puntuable | ✅ (0) |
| 4 | `webmcp-form-coverage` | Puntuable | ✅ |
| 5 | `webmcp-schema-validity` | Puntuable (la única que puede FALLAR) | ✅ |
| 6 | ai-catalog.json válido | Puntuable | ✅ |
| 7 | `webmcp-registered-tools` | **Informativa** (inventario, nunca pasa/falla) | 📋 8 tools listadas |

---

## 1. `llms-txt`

Archivo Markdown en `/llms.txt` (200 OK). Validación:

- **H1 obligatorio**: `/^\s*#\s+.+/m` en su propia línea.
- **Al menos 1 enlace Markdown** `[texto](url)` — URLs peladas en texto plano NO cuentan.
- Mínimo **50 caracteres** de contenido.

Implementación: `src/pages/llms.txt.ts` (Content-Type `text/markdown`).

## 2. `agent-accessibility-tree`

El árbol de accesibilidad debe estar bien formado (~38 reglas axe): `button-name`,
`label`, `link-name`, `document-title`, `tabindex`, `autocomplete-valid`, `aria-*`.
Todo elemento interactivo necesita nombre programático. Arreglar esto también es a11y real.

## 3. `cumulative-layout-shift`

CLS 0 — mismo metric que Performance. Dimensiones explícitas en imágenes/videos,
nada que inyecte contenido por encima del viewport inicial.

## 4. `webmcp-form-coverage` (Declarative API)

Todo `<form>` visible debe ser una herramienta declarativa:

```html
<form toolname="accion_con_guiones_bajos"
      tooldescription="Qué hace la herramienta y para qué sirve.">
```

- `toolparamdescription` en cada campo (o que exista un `<label>` asociado) para
  describir el parámetro en el JSON Schema que sintetiza el navegador.
- Campos `required` **siempre con `name`**.
- `toolautosubmit` (opcional): permite al agente enviar sin confirmación humana.
  NO usar si hay reCAPTCHA o el envío tiene costo real.

## 5. `webmcp-schema-validity` — la única que puede FALLAR

Condiciones de fallo:

- Form con `tooldescription` sin `toolname` (o viceversa) — atributos simétricos siempre.
- Campo requerido sin atributo `name`.
- Warning (no fallo): campo opcional sin `toolparamdescription` ni `<label>` asociado.

## 6. ai-catalog.json (ARD)

`/.well-known/ai-catalog.json` en formato ARD: `specVersion: "1.0"`, `host`
(displayName, documentationUrl → llms.txt, logoUrl) y `entries[]` con
`identifier` (`urn:air:dominio:...`), `type` (`application/mcp-server-card+json`
para las tools, `text/markdown; profile="urn:air:agent-skills"` para llms.txt),
`capabilities`, `representativeQueries`, `version`, `updatedAt` y `data.tools[]`
con `name`, `description`, `inputSchema`, `annotations`, `returns`.
Espejo estático de lo que registra `WebMcpTools.astro`.

## 7. `webmcp-registered-tools` — INFORMATIVA

**Nunca aparece como "aprobada"**: es un inventario de las herramientas
registradas en el momento del análisis (imperativas + declarativas). Se "completa"
registrando herramientas; no tiene pass/fail.

- Imperativa: `document.modelContext.registerTool({ name, description, inputSchema, annotations, execute })`.
  Annotations útiles: `readOnlyHint` (solo lectura), `untrustedContentHint`
  (output con datos no confiables), `consequentialHint` (acción irreversible → pide confirmación).
- Declarativa: atributos `tool*` en el `<form>` (ver #4).
- Verificación: `await document.modelContext.getTools()` o la extensión
  "Model Context Tool Inspector".

---

## Origin trial (WebMCP)

- Meta en `BaseLayout.astro`: `<meta http-equiv="origin-trial" content="...">`.
- Token actual activo hasta **16 nov 2026** (feature WebMCP, isSubdomain true).
- **Renovar** en developer.chrome.com/origintrials antes del vencimiento; si
  expira, `document.modelContext` desaparece y las 3 auditorías WebMCP vuelven a N/A.
- Permissions Policy `tools` por defecto `self` — iframes cross-origin no registran
  salvo delegación explícita.
