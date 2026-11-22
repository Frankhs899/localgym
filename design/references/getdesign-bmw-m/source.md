# getdesign — BMW M (design.md de referencia)

Material de **entrada**, no entrega. No es `design/system.md`: ese archivo se sincroniza
solo desde las fuentes reales del repo (`frontend/src/index.css`, librería de componentes).

- **Fuente:** https://getdesign.md/bmw-m/design-md
- **Instalador oficial del sitio:** `npx getdesign@latest add bmw-m` — **no ejecutado**
  (baja y corre código de npm; se extrajo el contenido sin ejecutar nada).
- **Método:** el markdown crudo viene embebido en el payload SSR de la página, bajo la
  clave `raw:"…"` dentro del stream `$tsr`. Se decodificó como string literal de JS.
- **Fecha de extracción:** 2026-11-21
- **Tamaño:** 30.467 caracteres, 504 líneas.
- **Secciones:** Overview · Colors · Typography · Layout · Elevation & Depth · Shapes ·
  Components · Do's and Don'ts · Responsive Behavior · Iteration Guide · Known Gaps.

## Aviso legal

El archivo es un análisis independiente de patrones públicamente observables. No está
afiliado ni avalado por BMW M. "BMW M", el tricolor M (#0066b1 / #1c69d4 / #e22718) y el
logo son marcas de su titular: **sirven como criterio de diseño, nunca como tokens de
marca para LocalGym.**

## Cómo usarlo

Citar por sección al discutir decisiones (`DESIGN.md § Typography`), y traducir solo el
criterio a nuestros tokens. Nunca copiar hex de marca ni el canvas #000 puro.
