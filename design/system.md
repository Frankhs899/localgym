# Sistema de diseño — LocalGym

Fuente de la verdad del sistema visual del POS administrativo. Lo que está acá es lo que
se implementa en `frontend/src/index.css` (`@theme` de Tailwind v4) y lo que cualquier
artboard tiene que respetar.

**Estado: tokens implementados (T7 slice 1, `f4d52f6`); superficie pendiente.** Los 43
tokens de acá son ya producción: viven en el bloque `@theme static` de
`frontend/src/index.css`, con las tres familias self-hosted desde `/fonts/...`. Lo que
todavía no está pintado es la capa base — fondo del canvas, color de texto, anillo de foco
global, `color-scheme: dark` — porque aplicarla mientras las pantallas siguen claras volvía
invisible el texto tipeado en Login y Mi perfil (hallazgo del verificador independiente,
L34 en `odd/tasks/design-system.md`). Esa capa aterriza con el App Shell (slice 2), que
repinta todas las pantallas sobre las superficies del sistema. Hasta entonces este
documento describe la superficie con exactitud pero no la pinta.

- **Artboard de referencia:** `design/design-system/02-neutral-signal.html`
- **Decisión de croma:** una sola croma accionable (lima); el resto es escalera neutra.
- **Tema:** oscuro único. No hay toggle (S7).
- **Tipografías:** Playfair Display (display), Inter (UI), JetBrains Mono (números y meta).
  Self-hosted: `woff2` variable, subset latin, con su `OFL.txt` en `frontend/public/fonts/`
  (T9). Ningún artboard hace ya un request a Google Fonts.

## Superficies y elevación

La escalera es geométrica en luminancia: cada escalón rinde ~1.6× el anterior. **Un borde
es siempre el escalón siguiente**, nunca un gris inventado aparte.

| Token | Valor | Uso | Fuente |
|---|---|---|---|
| `--bg` | `#080A0C` | lienzo de la app, fondo de tabla y de la barra de comandos | `design/design-system/02-neutral-signal.html` |
| `--shell` | `#0B0E11` | fondo del sidebar (escalón 1) | `design/design-system/02-neutral-signal.html` |
| `--panel` | `#101317` | topbar, inputs, hover de fila, hover del nav (escalón 2) | `design/design-system/02-neutral-signal.html` |
| `--panel-2` | `#171A1F` | superficie elevada dentro de un panel (escalón 3) | `design/design-system/02-neutral-signal.html` |
| `--line` | `#22262C` | separador de filas y bordes de bajo contraste (escalón 4) | `design/design-system/02-neutral-signal.html` |
| `--line-strong` | `#2E333A` | borde de input, botón fantasma, tarjeta y hairline del sidebar (escalón 5) | `design/design-system/02-neutral-signal.html` |
| `--surface-invert` | `#FFFFFF` | superficie invertida: bloque de la marca e ítem activo del nav | `design/design-system/02-neutral-signal.html` |
| `--scrim` | `rgba(4,6,9,.55)` | velo de overlays móviles; única transparencia de superficie | `design/design-system/02-neutral-signal.html` |

Ratios de luminancia medidos: `bg` → `shell` ×1.44 → `panel` ×1.50 → `panel-2` ×1.60 →
`line` ×1.87 → `line-strong` ×1.71.

## Texto

Cuatro niveles, cada uno con un trabajo. No se inventan niveles intermedios.

| Token | Valor | Uso | Fuente |
|---|---|---|---|
| `--text` | `#F3F5F7` | primario: nombres, valores de celda, títulos, botones | `design/design-system/02-neutral-signal.html` |
| `--text-2` | `#C6CBD4` | datos secundarios y controles quietos: email del socio, tipo de documento, rol, cerrar sesión, segmentos inactivos, copia del estado vacío | `design/design-system/02-neutral-signal.html` |
| `--muted` | `#A0A6AF` | etiquetas y metadatos únicamente: `th`, labels de campo, contadores, pistas, paginador | `design/design-system/02-neutral-signal.html` |
| `--faint` | `#7C828D` | solo lo que no es contenido: placeholder | `design/design-system/02-neutral-signal.html` |

Contraste medido (AA exige 4.5:1 para texto normal): `--text` 17.04:1 sobre `--panel`,
`--text-2` 11.44:1, `--muted` 7.60:1, `--faint` 4.82:1. Ningún nivel baja de AA.

## Croma y estado

Una sola croma accionable. El lima señala **la acción primaria y el foco**; nunca rellena
una fila, una celda, un badge ni un panel.

| Token | Valor | Uso | Fuente |
|---|---|---|---|
| `--accent` | `#EFFF00` | relleno del botón primario, anillo de foco, texto del segmento presionado | `design/design-system/02-neutral-signal.html` |
| `--accent-hover` | `#DCEB00` | hover del botón primario (derivado, no un naranja ni un gris) | `design/design-system/02-neutral-signal.html` |
| `--accent-soft` | `rgba(239,255,0,.12)` | tinte de estado presionado (segmento activo, botón de demo) | `design/design-system/02-neutral-signal.html` |
| `--accent-ink` | `#0A0C11` | tinta sobre el lima y sobre la superficie invertida | `design/design-system/02-neutral-signal.html` |
| `--ok-bg` | `#0E2A22` | fondo del chip "Activo" | `design/design-system/02-neutral-signal.html` |
| `--ok-line` | `#2B5C4A` | borde del chip "Activo" | `design/design-system/02-neutral-signal.html` |
| `--ok-text` | `#6FD3A0` | texto del chip "Activo" (8.38:1 sobre su fondo) | `design/design-system/02-neutral-signal.html` |
| `--off-bg` | `#191C21` | fondo del chip "Inactivo" | `design/design-system/02-neutral-signal.html` |
| `--off-line` | `#2E333A` | borde del chip "Inactivo" | `design/design-system/02-neutral-signal.html` |
| `--off-text` | `#C3C8D0` | texto del chip "Inactivo" (10.16:1 sobre su fondo) | `design/design-system/02-neutral-signal.html` |
| `--danger` | `#FF7A6E` | texto y borde de acciones destructivas (7.80:1 sobre el lienzo) | `design/design-system/02-neutral-signal.html` |

## Tipografía

| Token | Valor | Trabajo | Fuente |
|---|---|---|---|
| `--fs-label` | `11px` | etiquetas en mayúsculas con tracking: `th`, label de campo, grupo del nav | `design/design-system/02-neutral-signal.html` |
| `--fs-meta` | `12px` | metadatos: contadores, pistas, rol, pie, acciones chicas | `design/design-system/02-neutral-signal.html` |
| `--fs-body` | `14px` | cuerpo: tabla, controles, nav, inputs, segmentado | `design/design-system/02-neutral-signal.html` |
| `--fs-head` | `16px` | encabezados de bloque y marca | `design/design-system/02-neutral-signal.html` |
| `--fs-title` | `20px` | título de página | `design/design-system/02-neutral-signal.html` |

Familias: `"Playfair Display", Georgia, serif` para display; `"Inter", system-ui,
-apple-system, "Segoe UI", Roboto, sans-serif` para UI; `"JetBrains Mono", ui-monospace,
Consolas, monospace` para números, documentos y meta monoespaciada.

Pesos usados: 400 cuerpo, 600 énfasis en UI (botones, `th`, chips, nombre del socio),
700 display y marca. No hay 300 ni 500: el par de pesos es 400/600/700.

Reglas: las etiquetas de `--fs-label` van en mayúsculas con `letter-spacing` entre `.05em` y
`.08em`. Los números (montos, documentos, contadores) van en mono con
`font-variant-numeric: tabular-nums`. Nunca se usa medio píxel.

## Radios

| Token | Valor | Uso | Fuente |
|---|---|---|---|
| `--radius-control` | `4px` | botones, inputs, segmentado, ítems del nav, paginador, chip de tipo | `design/design-system/02-neutral-signal.html` |
| `--radius-panel` | `10px` | paneles de estado vacío, tarjetas móviles | `design/design-system/02-neutral-signal.html` |
| `--radius-pill` | `999px` | chips de estado, avatar, botones de demo | `design/design-system/02-neutral-signal.html` |

Tres valores y nada en el medio. La esquina interna de un control compuesto se deriva:
`calc(var(--radius-control) - 1px)` para el segmentado, nunca un `5px` suelto.

## Espaciado

**Sistema: base 4, elegida por trabajo.** Ratificado y aplicado al artboard (barrido del
2026-11-21). Toda separación sale de siete pasos y de un token de rol, nunca de un número
suelto:

`4 / 8 / 12 / 16 / 24 / 32 / 48`

| token | valor | trabajo |
| --- | --- | --- |
| `--space-tight` | `4px` | inline: chip, badge, ícono+etiqueta |
| `--space-inset` | `8px` | padding de celda de tabla y de control |
| `--space-stack` | `12px` | hermanos dentro de un grupo, padding de tarjeta |
| `--space-group` | `16px` | bloques dentro de un panel |
| `--space-section` | `24px` | secciones de pantalla, gutter de página |
| `--space-page` | `32px` | ritmo de página |
| `--space-hero` | `48px` | cabeceras de board y separaciones mayores |

Los 19 valores anteriores (`1 2 3 4 5 6 7 8 9 10 12 14 16 18 20 22 24 26`) no sobreviven en
ninguna declaración de `padding`, `margin`, `gap`, `row-gap` ni `column-gap`. Lo que conserva
su número propio es la geometría, no el ritmo: los `1px` ópticos de `th .cellmail` y de
`.errline svg`, el `-1px` del `.sr-only`, y el `right:6px` que ancla el control "Mostrar"
dentro del campo en `.reveal`. Mover esos valores rompe una alineación, no un sistema.

Un componente elige el rol, no el número: si un trabajo no entra en ningún paso, el
componente está mal definido, no falta un paso.

El alto de un control no se compra con padding: se declara con `min-height:36px`. Por eso
el botón puede tener `--space-tight` en el eje vertical y seguir midiendo 36px.

Medido con `node design/tools/probe.mjs <artboard> <ancho>` — Chrome headless, herramienta
versionada para que el número se reproduzca en lugar de creerle a la sesión que lo midió:

| medida | valor | base | límite S8 |
| --- | --- | --- | --- |
| fila de tabla @1440 | `52.8px` | `50.8px` | +4px → **+2.0px, cumple** |
| fila de tabla @768 | `57.09px` | `71.09px` | la tabla reacomodó; no es una regresión de densidad |
| `thead` | `32.44px` | igual | — |
| control (input, `.btn`) | `36px` | igual | debe quedar en 36px |
| `.btn-sm` (acción de fila) | `27.39px` | `25.39px` | bajo 36px a propósito: es la densidad de la tabla |
| overflow horizontal | ninguno | ninguno | ninguno en 1440 / 768 / 500 |

## Componentes

Reglas heredadas del artboard; cualquier implementación nueva las respeta.

- **Botón primario** — relleno `--accent`, tinta `--accent-ink`, `--radius-control`, alto
  mínimo 36px, peso 600. Es el único relleno sólido de lima permitido por vista. Hover
  `--accent-hover`; deshabilitado `opacity:.45`.
- **Botón fantasma** — transparente, borde `--line-strong`, texto `--text`. Hover
  `--panel-2`.
- **Chip de estado** — `--radius-pill`, borde y fondo semánticos (`--ok-*` / `--off-*`),
  texto siempre `--fs-meta` con peso 600. Nunca relleno de lima: el estado no es una acción.
- **Input** — fondo `--panel`, borde `--line-strong`, `--radius-control`, alto mínimo 36px,
  texto `--fs-body`, placeholder `--faint`. Foco: anillo `--accent` de 2px.
- **Segmentado** — contenedor `--radius-control` con borde `--line-strong`; el botón
  presionado usa `--accent-soft` + texto `--accent`; el foco interno se ancla con
  `outline-offset:-2px` y conserva el radio derivado.
- **Fila de tabla** — separador inferior `--line`, hover `--panel`, alto ~51px a 14px.
  El nombre va `--text` peso 600 y el email como segunda línea en `--text-2` (nunca
  `--muted`: el email es un dato). En móvil la fila se vuelve tarjeta con etiqueta encima
  del valor, salvo el estado, que queda etiqueta a la izquierda y chip a la derecha.
- **Ítem del nav** — alto de línea con padding `var(--space-inset)` (8 px uniforme), `--radius-control`; hover
  `--panel` (un escalón, no un blanco translúcido); ítem activo sobre `--surface-invert`
  con tinta `--accent-ink`.
- **Estado vacío** — panel `--radius-panel` con borde `1px dashed --line-strong`, icono en
  un bloque `--panel-2` de 34px y copia en `--text-2`. La copia dice la regla aplicada, no
  "no hay datos".
- **Foco (global)** — `outline: 2px solid var(--accent)` con `offset: 2px`. Nunca mutar el
  radio del control desde la regla de foco: el outline sigue el radio propio del elemento.

## Do's y Don'ts

**Do**
- Usar los tokens; ningún hex literal fuera del bloque `:root`.
- Expresar profundidad subiendo un escalón de superficie, no con sombras.
- Reservar el lima para la acción primaria y el foco.
- Poner el dato secundario en `--text-2`; `--muted` es para etiquetas.
- Derivar esquinas compuestas con `calc(var(--radius-control) - 1px)`.
- Medir en navegador antes de declarar que un cambio está bien.

**Don't**
- No introducir una segunda croma ni tintes que compitan con el lima.
- No usar `box-shadow` en superficies de contenido (los overlays usan `--scrim`).
- No inventar niveles intermedios de texto, tamaños con medio píxel ni radios sueltos.
- No rellenar filas, celdas, badges ni paneles con `--accent`.
- No usar blanco translúcido como hover; es un escalón de superficie.

## Known Gaps

- **Excepciones de geometría** — `th .cellmail` (nombre→email), `.errline svg`, el `-1px` del
  `.sr-only` y el `right:6px` del `.reveal`: fuera de la escala a propósito, porque son
  posición y no ritmo; moverlas rompe la alineación y, en la celda, saca la fila del límite.
- **Self-hosting de tipografías:** resuelto en T9 — las tres familias viven en
  `frontend/public/fonts/` como `woff2` variable con subset latin y su `OFL.txt`, sin
  ningún request externo. Lo que sigue abierto no es la decisión sino el peso: el subset
  latin cubre lo que el producto escribe (español), no otros alfabetos.
- **Tema claro:** no existe ni se prevé. El sistema es oscuro único (S7).
- **Estados no documentados:** error de validación por campo, carga/skeleton, deshabilitado
  más allá de `opacity:.45`, y el modal de baja (backdrop e `inert`) no están extraídos acá.
  El artboard no los muestra.
- **Densidad:** medidas a 1440 (fila 52.8px) y tablet (57.09px); no se midió a 1920 ni en
  pantalla de recepción real.
- **Drawer del nav fuera de pantalla pero vivo:** en tablet y móvil el sidebar se esconde con
  `translateX(-105%)` y sigue en el árbol de foco y de accesibilidad. El artboard solo devuelve
  el foco con Escape; la implementación real necesita `inert` (o `display:none`) sobre el
  drawer cerrado y `inert` sobre el contenido cuando está abierto.
- **Objetivos de toque chicos:** los controles secundarios heredados están por debajo de 36px
  ("Mostrar" del login quedó en 32px, "Cerrar sesión" 29px, acciones de fila 25px). A mouse
  está bien; en táctil el artboard solo sube a 44px las acciones de la tarjeta móvil, así que
  falta una regla general para pantalla táctil.
- **Impresión:** no se cubre. El sistema es para pantalla.
- **Componentes ausentes del artboard:** Login, Perfil, formulario de alta de socio y
  cualquier pantalla de membresías/pagos. Su diseño visual se deriva de estas tokens, pero
  no están ratificados en un artboard todavía.
- **Tokens no usados por el artboard y sin veredicto:** ninguna. El `:root` del artboard es
  exactamente el conjunto de la tabla, sin residuos.

## Handoff a implementación (T7)

Mapeo implementado en `frontend/src/index.css` (`@theme static`, Tailwind v4):

| Sistema | Namespace | Utilidad |
| --- | --- | --- |
| superficies, texto, croma, estado | `--color-*` | `bg-panel`, `text-muted`, `border-line-strong` |
| escala tipográfica | `--text-*` | `text-label`, `text-title` |
| familias | `--font-display`, `--font-ui`, `--font-mono`, y `--font-sans: var(--font-ui)` | `font-ui`, `font-mono` |
| radios | `--radius-*` | `rounded-control`, `rounded-pill` |
| espaciado por rol | `--spacing-*`, derivados de `--spacing-unit` con `calc` | `p-inset`, `gap-stack`, `py-hero` |

Sin pares `line-height` por paso a propósito: el artboard declara `1.45` una sola vez en el
body, así que los tokens de tamaño siguen siendo tamaños y el interlineado se declara donde
se pinta. `static` no es decorativo: Tailwind v4 descarta las variables de tema que ninguna
utilidad usa, y el CSS de componentes escrito a mano las lee directamente. La fuente de los
valores sigue siendo el `:root` del artboard; cualquier cambio se hace ahí primero y acá
después.
