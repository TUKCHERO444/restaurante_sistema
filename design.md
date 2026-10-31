# Diseño e Identidad Visual — Sistema de Gestión para Restaurante

Documento único de referencia para la identidad visual, el sistema de tokens y
las reglas de interfaz del panel de administración. Toda decisión estética o de
componente debe partir de aquí; ninguna vista debe introducir colores, fuentes o
estilos fuera de este sistema.

- **Producto:** Sistema de Gestión para Restaurante (nombre neutro, sin marca comercial).
- **Frontend:** React 19 + TypeScript + Vite, Tailwind CSS v4, shadcn/ui.
- **Inspiración de layout:** plantilla **AdminLTE** (sidebar + navbar + content + footer).
- **Estado del panel:** claro / oscuro conmutable en caliente, sin recargar la página.

---

## 1. Principios de diseño

1. **Profesional y sobrio.** Interfaz de herramienta de trabajo: densidad
   informativa, jerarquía clara y cero ornamentos innecesarios.
2. **Sin colores saturados ni extremos.** La paleta es desaturada y armónica;
   nunca se usan tonos neón, puros (`#ff0000`, `#00ff00`) ni contrastes agresivos.
3. **Componentes reutilizables.** Botones, tarjetas, badges, tablas y formularios
   provienen de una sola fuente (`components/ui`). Si un componente se recicla,
   su **funcionalidad y sus colores se reciclan** con él. Prohibido duplicar estilos.
4. **Tokens como única verdad.** Los colores y medidas se consumen vía variables
   CSS (Tailwind v4 `@theme`). El código nunca escribe valores hexadecimales sueltos.
5. **Tema conmutable en caliente.** Claro/oscuro se resuelve con estado de React
   (clase `dark` en `<html>`), sin recargar ni perder estado de la aplicación.
6. **Iconografía consistente.** Todos los iconos provienen de `lucide-react`.
   **No se usan emojis en ninguna parte de la interfaz.**
7. **Accesibilidad por defecto.** Contraste AA, foco visible, áreas táctiles ≥ 36px
   y estados de carga/vacío/error siempre presentes.

---

## 2. La identidad en una frase

> Un panel de administración formal y sereno, con base de papel neutro frío,
> un **azul corporativo apagado** como único acento de acción, tipografía
> **Inter** para la interfaz y **Plus Jakarta Sans** para los títulos, y una
> estructura AdminLTE de sidebar sobre navbar.

---

## 3. Sistema de color

### 3.1 Dirección

- Acento primario: **azul corporativo sobrio** (acero desaturado, tipo AdminLTE
  atenuado). Transmite orden, confianza y formalidad sin resultar llamativo.
- Neutros: escala fría de grises/media pizarra para fondos, bordes y texto.
- Semánticos: estados (éxito, advertencia, error, información) presentes pero
  **desaturados**; se reservan para comunicar significado, nunca para decorar.
- Se usan espacios de color **OKLCH** por su uniformidad perceptual (permite
  derivar variantes claro/oscuro manteniendo el mismo nivel de contraste).

### 3.2 Tokens semánticos — Tema claro

| Token | Valor (OKLCH) | Uso |
| --- | --- | --- |
| `--background` | `oklch(0.985 0.002 250)` | Fondo general del panel |
| `--foreground` | `oklch(0.29 0.020 255)` | Texto principal |
| `--card` | `oklch(1 0 0)` | Superficie de tarjetas y tablas |
| `--card-foreground` | `oklch(0.29 0.020 255)` | Texto sobre tarjetas |
| `--popover` | `oklch(1 0 0)` | Superficie de menús/desplegables |
| `--popover-foreground` | `oklch(0.29 0.020 255)` | Texto en menús |
| `--primary` | `oklch(0.52 0.100 242)` | Acción principal, enlaces, item activo |
| `--primary-foreground` | `oklch(0.99 0.005 250)` | Texto sobre primario |
| `--secondary` | `oklch(0.950 0.006 245)` | Botones y superficies secundarias |
| `--secondary-foreground` | `oklch(0.35 0.020 255)` | Texto sobre secundario |
| `--muted` | `oklch(0.960 0.004 245)` | Fondos sutiles, encabezados de tabla |
| `--muted-foreground` | `oklch(0.54 0.015 252)` | Texto secundario, ayudas |
| `--accent` | `oklch(0.930 0.015 242)` | Hover de menús e items |
| `--accent-foreground` | `oklch(0.38 0.050 245)` | Texto sobre acento |
| `--destructive` | `oklch(0.55 0.160 27)` | Errores y acciones destructivas |
| `--destructive-foreground` | `oklch(0.99 0 0)` | Texto sobre destructivo |
| `--success` | `oklch(0.58 0.090 155)` | Éxito / estado positivo |
| `--warning` | `oklch(0.72 0.110 75)` | Advertencia |
| `--info` | `oklch(0.60 0.080 232)` | Información neutral |
| `--border` | `oklch(0.900 0.006 245)` | Bordes y separadores |
| `--input` | `oklch(0.900 0.006 245)` | Borde de campos |
| `--ring` | `oklch(0.52 0.100 242 / 35%)` | Anillo de foco |

### 3.3 Tokens semánticos — Tema oscuro

| Token | Valor (OKLCH) | Uso |
| --- | --- | --- |
| `--background` | `oklch(0.200 0.012 250)` | Fondo general (base AdminLTE oscuro) |
| `--foreground` | `oklch(0.920 0.008 245)` | Texto principal |
| `--card` | `oklch(0.240 0.012 250)` | Superficie de tarjetas y tablas |
| `--card-foreground` | `oklch(0.920 0.008 245)` | Texto sobre tarjetas |
| `--popover` | `oklch(0.240 0.012 250)` | Superficie de menús |
| `--popover-foreground` | `oklch(0.920 0.008 245)` | Texto en menús |
| `--primary` | `oklch(0.680 0.095 240)` | Acción principal (más luminoso) |
| `--primary-foreground` | `oklch(0.180 0.012 250)` | Texto sobre primario |
| `--secondary` | `oklch(0.310 0.012 250)` | Botones y superficies secundarias |
| `--secondary-foreground` | `oklch(0.920 0.008 245)` | Texto sobre secundario |
| `--muted` | `oklch(0.290 0.010 250)` | Fondos sutiles |
| `--muted-foreground` | `oklch(0.720 0.012 245)` | Texto secundario |
| `--accent` | `oklch(0.340 0.020 248)` | Hover de menús e items |
| `--accent-foreground` | `oklch(0.940 0.010 245)` | Texto sobre acento |
| `--destructive` | `oklch(0.610 0.150 27)` | Errores y acciones destructivas |
| `--destructive-foreground` | `oklch(0.99 0 0)` | Texto sobre destructivo |
| `--success` | `oklch(0.660 0.090 155)` | Éxito |
| `--warning` | `oklch(0.760 0.110 78)` | Advertencia |
| `--info` | `oklch(0.680 0.080 232)` | Información |
| `--border` | `oklch(0.340 0.012 250)` | Bordes y separadores |
| `--input` | `oklch(0.340 0.012 250)` | Borde de campos |
| `--ring` | `oklch(0.680 0.095 240 / 45%)` | Anillo de foco |

### 3.4 Tokens de layout (estructura AdminLTE)

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--sidebar` | `oklch(0.280 0.018 250)` | `oklch(0.220 0.014 250)` | Fondo de la barra lateral |
| `--sidebar-foreground` | `oklch(0.860 0.010 245)` | `oklch(0.820 0.010 245)` | Texto de la barra lateral |
| `--sidebar-accent` | `oklch(0.520 0.100 242)` | `oklch(0.680 0.095 240)` | Item activo / hover fuerte |
| `--sidebar-border` | `oklch(0.340 0.015 250)` | `oklch(0.280 0.014 250)` | Separadores internos |
| `--navbar` | `oklch(1 0 0)` | `oklch(0.240 0.012 250)` | Fondo de la barra superior |
| `--navbar-foreground` | `oklch(0.29 0.020 255)` | `oklch(0.920 0.008 245)` | Texto de la barra superior |
| `--footer` | `oklch(0.960 0.004 245)` | `oklch(0.220 0.012 250)` | Fondo del pie |

> **Regla:** el sidebar mantiene fondo oscuro en ambos temas (identidad AdminLTE).
> En tema claro solo cambia el contenido, no la estructura lateral.

### 3.5 Reglas de uso del color

- El azul primario es **el único acento de acción**. No se emplea para decorar
  textos largos, fondos amplios ni múltiples elementos a la vez.
- Máximo **un** color primario dominante por vista; los semánticos solo aparecen
  asociados a su significado (un badge, un borde de alerta, un icono de estado).
- Prohibido hardcodear colores. Siempre `bg-primary`, `text-muted-foreground`,
  `border-border`, etc., o `var(--token)`.
- Estados de badge/estado → semánticos; estados de interacción → neutros + ring.

---

## 4. Tipografía

### 4.1 Familias

| Rol | Familia | Fallbacks |
| --- | --- | --- |
| Interfaz (cuerpo, tablas, formularios) | **Inter** | `system-ui, "Segoe UI", Roboto, sans-serif` |
| Títulos (h1–h3, títulos de tarjeta y sección) | **Plus Jakarta Sans** | `Inter, system-ui, sans-serif` |
| Numérico / código | fuente monoespaciada | `ui-monospace, "Cascadia Code", Consolas, monospace` |

- Carga de fuentes vía `@fontsource` o autoalojadas; **evitar** dependencias de red
  externas en producción. Si no hay acceso, se degrada a los fallbacks del sistema
  sin romper el layout.
- Inter no se usa para títulos grandes: Plus Jakarta Sans aporta el carácter
  profesional sin recurrir a serifas ni decoraciones.

### 4.2 Escala tipográfica

| Nivel | Tamaño / Interlineado | Peso | Familia | Uso |
| --- | --- | --- | --- | --- |
| Display | 30px / 1.2 | 700 | Plus Jakarta Sans | Título de página |
| H1 | 24px / 1.25 | 700 | Plus Jakarta Sans | Encabezado principal de módulo |
| H2 | 20px / 1.3 | 600 | Plus Jakarta Sans | Subsección |
| H3 | 18px / 1.35 | 600 | Plus Jakarta Sans | Título de tarjeta/panel |
| Body | 14px / 1.55 | 400 | Inter | Texto general del panel |
| Body strong | 14px / 1.55 | 600 | Inter | Énfasis, celdas clave |
| Small | 13px / 1.5 | 400 | Inter | Ayudas, metadatos |
| Caption | 12px / 1.4 | 500 | Inter | Etiquetas, encabezados de tabla (mayúsculas suaves) |
| Numeric | según contexto | 500–600 | monoespaciada | Importes, cantidades, códigos |

- Base del panel: **14px** (densidad tipo AdminLTE), no 16px, para tablas de datos.
- Interlineado de lectura amplio en párrafos; compacto en tablas.
- El leve cambio de familia entre títulos (Plus Jakarta Sans) y cuerpo (Inter)
  debe reservarse a **secciones que lo ameriten** (páginas de módulo, paneles de
  resumen); dentro de tablas y formularios se mantiene Inter para máxima legibilidad.
- Sin cursivas decorativas ni versalitas forzadas. No abusar de negritas.

---

## 5. Iconografía

- Librería oficial: **`lucide-react`** (ya instalada). Única fuente de iconos.
- **Prohibido el uso de emojis** en la interfaz, en cadenas de texto o en datos.
  Donde antes hubiera un emoji, se usa el icono Lucide correspondiente.
- Trazo coherente: tamaño por defecto `size-4` (16px) en controles y `size-5`
  (20px) en encabezados o navegación.
- El icono hereda color del texto (`currentColor`); nunca color propio aislado,
  salvo iconos de estado que toman el token semántico correspondiente.
- Todo icono interactivo debe ir acompañado de `aria-label` o texto visible.
- Convención: importar iconos con nombres semánticos (`import { Users } from 'lucide-react'`).

---

## 6. Espaciado, radios, bordes y elevación

### 6.1 Escala de espaciado (base 4px)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`
(Uso típico: 16px padding de tarjeta, 12px gap de controles, 24px entre secciones.)

### 6.2 Radios

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius` | `0.625rem` (10px) | Base del sistema |
| `--radius-sm` | `calc(var(--radius) - 4px)` | Badges, chips |
| `--radius-md` | `calc(var(--radius) - 2px)` | Botones, inputs |
| `--radius-lg` | `var(--radius)` | Tarjetas, modales |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Contenedores grandes |

Radios contenidos y uniformes: aportan formalidad sin volverse "burbuja".
No mezclar radios distintos en un mismo componente.

### 6.3 Bordes

- Grosor estándar: **1px** (`border-border`).
- Los separadores usan `--border`, más tenue que el texto.
- Nunca usar bordes de más de 1px como recurso decorativo.

### 6.4 Elevación (sombras)

| Nivel | Uso |
| --- | --- |
| `none` | Tablas, filas, elementos planos |
| `sm` | Tarjetas y paneles en reposo |
| `md` | Elementos elevados (dropdown, popover) |
| `lg` | Modales y diálogos |

- Sombras **sutiles y difusas**, en tono neutro frío; jamás sombras de color.
- En tema oscuro, reducir la intensidad de sombra y apoyarse en el contraste de
  superficie (`--card` sobre `--background`).

---

## 7. Arquitectura de layout (AdminLTE)

```text
┌───────────────────────────────────────────────────────────┐
│  Navbar (logo/marca · breadcrumb · búsqueda · acciones ·  │
│          toggle de tema · perfil)                         │
├──────────────┬────────────────────────────────────────────┤
│              │  Header de página (título + acciones)      │
│  Sidebar     │ ┌────────────────────────────────────────┐ │
│  (fijo,      │ │  Content: tarjetas, tablas, forms     │ │
│   colapsable)│ └────────────────────────────────────────┘ │
│              │  Footer                                    │
└──────────────┴────────────────────────────────────────────┘
```

- **Sidebar:** navegación principal, con marca arriba, grupos colapsables y
  item activo resaltado con `--sidebar-accent`. Colapsable a modo icono en
  escritorio; en móvil se abre como cajón superpuesto.
- **Navbar:** fija en la parte superior; contiene breadcrumb, búsqueda global,
  notificaciones, el **conmutador de tema** y el menú de perfil.
- **Breadcrumb:** obligatorio en páginas internas (Inicio / Módulo / Acción).
- **Contenido:** ancho fluido con padding de 16–24px; se compone de tarjetas.
- **Footer:** discreto, con copyright y versión; nunca compite visualmente.
- **Responsive:** en pantallas < 768px el sidebar es cajón; la navbar reduce
  acciones a un menú "más". Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`.

---

## 8. Componentes reutilizables (catálogo)

Todos los componentes viven en `components/ui` y se consumen por su API pública.
**Regla de oro:** si un componente ya existe, se reutiliza y, si necesita variar,
se extiende con `class-variance-authority` (variantes), nunca con estilos locales.

| Componente | Variantes / props clave | Reutilización |
| --- | --- | --- |
| `Button` | `default·destructive·outline·secondary·ghost·link`; `sm·default·lg·icon` | Único botón de la app. Toda acción nueva usa estas variantes. |
| `Card` | Header / Title / Description / Content / Footer | Contenedor base de todo bloque de contenido. |
| `Badge` | `default·secondary·outline·success·warning·destructive·info` | Estados y etiquetas; usa tokens semánticos. |
| `Input` / `Textarea` | estado `invalid`, `disabled`, `readonly` | Campos de formularios. |
| `Label` | asociación con control | Siempre presente en formularios. |
| `Select` | nativo o Radix | Filtros y formularios. |
| `Table` | Header / Body / Row / Cell / Caption | Tablas de datos reutilizables. |
| `Dialog`/`Modal` | `sm·default·lg·full` | Confirmaciones y formularios. |
| `DropdownMenu` | acciones contextuales | Menús de fila, perfil, opciones. |
| `Tabs` | navegación interna de módulo | Vistas alternas dentro de una página. |
| `Tooltip` | ayuda breve | Explicaciones de iconos y datos. |
| `Pagination` | cliente/servidor | Listados paginados. |
| `Toast` | `success·error·info·warning` | Notificaciones no bloqueantes. |
| `Skeleton` | `Skeleton`, `SkeletonTable`, `SkeletonCard` | Estados de carga consistentes. |
| `EmptyState` | icono + título + acción | Listados sin datos. |

**Reutilización funcional:** cuando un componente replique lógica (p. ej. una
tabla con paginación, orden y búsqueda, o un modal de confirmación), esa
funcionalidad se extrae a un hook o componente compartido y se reutiliza junto
con sus estilos. No se reimplementa dos veces.

---

## 9. Tablas y formularios

### 9.1 Tablas de datos

- Encabezado con fondo `--muted`, texto `Caption` en mayúsculas suaves.
- Filas con separador `--border`; hover con `--accent` tenue.
- Alineación: texto a la izquierda, números/importes a la derecha (monoespaciada).
- Acciones de fila en un `DropdownMenu` al extremo derecho (evitar saturar de botones).
- Incluir siempre: búsqueda, ordenamiento por columna, paginación y estado vacío.
- Densidad compacta (14px base), con padding vertical 10–12px por celda.
- Números negativos/estados usan tokens semánticos, nunca rojo saturado.

### 9.2 Formularios

- Estructura: `Label` + control + mensaje de ayuda/error, en columna y con gap 8–12px.
- Campos inválidos: borde `--destructive`, sin cambiar el fondo.
- Foco: anillo `--ring` visible y consistente en todos los controles.
- Agrupar campos relacionados en filas de 2 columnas en escritorio.
- Textos de botón en verbo + objeto ("Guardar producto", "Cancelar").
- Validación con esquemas (p. ej. Zod, ya disponible) y mensajes claros y breves.

---

## 10. Cambio de tema claro/oscuro (sin recargar)

**Requisito:** alternar tema sin refrescar la página, conservando el estado de la app.

Implementación de referencia (ya presente en el proyecto y a mantener):

- Clase `dark` aplicada a `document.documentElement` (`<html>`), leída por el
  variant de Tailwind `@custom-variant dark (&:is(.dark *))`.
- Estado gestionado con React (`useTheme`): persiste en `localStorage`
  (clave `restaurante-tema`) y respeta `prefers-color-scheme` como valor inicial.
- El **conmutador** es un `Button` con iconos `Sun`/`Moon` de Lucide
  (ver `components/ThemeToggle.tsx`), con `aria-label` y `title` descriptivos.
- El cambio es **instantáneo y global**: todos los componentes leen tokens CSS,
  por lo que el tema se refleja sin re-render de lógica ni recarga.
- Reglas para nuevos componentes: usar exclusivamente tokens (`bg-card`,
  `text-foreground`, …); nunca fijar un color claro u oscuro en el código.
- Evitar `transition` de color en el nodo raíz para prevenir parpadeos; animar
  solo propiedades de componentes puntuales.
- Todo nuevo par claro/oscuro debe declararse en **ambos** bloques (`:root` y `.dark`)
  antes de usarse.

---

## 11. UI/UX, microcopy y accesibilidad

- **Contraste:** texto normal ≥ 4.5:1; texto grande e iconos ≥ 3:1 (AA).
- **Foco:** todo elemento interactivo muestra anillo `--ring`; nunca `outline: none`
  sin reemplazo.
- **Estados por vista:** cargando (`Skeleton`), vacío (`EmptyState`), error
  (mensaje + acción de reintento), éxito (`Toast`).
- **Confirmaciones:** acciones destructivas exigen `Dialog` de confirmación y
  usan la variante `destructive`.
- **Microcopy:** directo, en el idioma de la interfaz, sin signos de exclamación
  excesivos ni emojis. Botones en verbo + objeto; etiquetas en sustantivo.
- **Área táctil:** mínimo 36px en controles de escritorio, 44px en móvil.
- **Números y fechas:** formato local (es), moneda según configuración del sistema.
- **Consistencia:** misma acción = mismo componente, mismo color y misma etiqueta
  en todo el panel.

---

## 12. Resumen de tokens CSS (referencia)

Bloque base que consolida la identidad. Debe residir en `src/index.css` (o su
sucesor) y ser la única fuente de verdad de color, radio y tipografía.

```css
:root {
  --radius: 0.625rem;

  --background: oklch(0.985 0.002 250);
  --foreground: oklch(0.29 0.02 255);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.29 0.02 255);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.29 0.02 255);
  --primary: oklch(0.52 0.10 242);
  --primary-foreground: oklch(0.99 0.005 250);
  --secondary: oklch(0.95 0.006 245);
  --secondary-foreground: oklch(0.35 0.02 255);
  --muted: oklch(0.96 0.004 245);
  --muted-foreground: oklch(0.54 0.015 252);
  --accent: oklch(0.93 0.015 242);
  --accent-foreground: oklch(0.38 0.05 245);
  --destructive: oklch(0.55 0.16 27);
  --destructive-foreground: oklch(0.99 0 0);
  --success: oklch(0.58 0.09 155);
  --warning: oklch(0.72 0.11 75);
  --info: oklch(0.60 0.08 232);
  --border: oklch(0.90 0.006 245);
  --input: oklch(0.90 0.006 245);
  --ring: oklch(0.52 0.10 242 / 35%);

  --sidebar: oklch(0.28 0.018 250);
  --sidebar-foreground: oklch(0.86 0.01 245);
  --sidebar-accent: oklch(0.52 0.10 242);
  --sidebar-border: oklch(0.34 0.015 250);
  --navbar: oklch(1 0 0);
  --navbar-foreground: oklch(0.29 0.02 255);
  --footer: oklch(0.96 0.004 245);
}

.dark {
  --background: oklch(0.20 0.012 250);
  --foreground: oklch(0.92 0.008 245);
  --card: oklch(0.24 0.012 250);
  --card-foreground: oklch(0.92 0.008 245);
  --popover: oklch(0.24 0.012 250);
  --popover-foreground: oklch(0.92 0.008 245);
  --primary: oklch(0.68 0.095 240);
  --primary-foreground: oklch(0.18 0.012 250);
  --secondary: oklch(0.31 0.012 250);
  --secondary-foreground: oklch(0.92 0.008 245);
  --muted: oklch(0.29 0.01 250);
  --muted-foreground: oklch(0.72 0.012 245);
  --accent: oklch(0.34 0.02 248);
  --accent-foreground: oklch(0.94 0.01 245);
  --destructive: oklch(0.61 0.15 27);
  --destructive-foreground: oklch(0.99 0 0);
  --success: oklch(0.66 0.09 155);
  --warning: oklch(0.76 0.11 78);
  --info: oklch(0.68 0.08 232);
  --border: oklch(0.34 0.012 250);
  --input: oklch(0.34 0.012 250);
  --ring: oklch(0.68 0.095 240 / 45%);

  --sidebar: oklch(0.22 0.014 250);
  --sidebar-foreground: oklch(0.82 0.01 245);
  --sidebar-accent: oklch(0.68 0.095 240);
  --sidebar-border: oklch(0.28 0.014 250);
  --navbar: oklch(0.24 0.012 250);
  --navbar-foreground: oklch(0.92 0.008 245);
  --footer: oklch(0.22 0.012 250);
}

@theme inline {
  --font-sans: "Inter", system-ui, "Segoe UI", Roboto, sans-serif;
  --font-heading: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", Consolas, monospace;
}
```

---

## 13. Reglas rápidas (checklist)

- [ ] ¿Usé solo tokens (`bg-primary`, `text-muted-foreground`, `border-border`)?
- [ ] ¿Reutilicé un componente existente antes de crear uno nuevo?
- [ ] ¿El color es sobrio, sin saturación ni extremos?
- [ ] ¿Los títulos usan Plus Jakarta Sans y el cuerpo Inter?
- [ ] ¿Los iconos son de `lucide-react` y **cero emojis**?
- [ ] ¿Funciona igual en tema claro y oscuro sin recargar?
- [ ] ¿Hay estados de carga/vacío/error y foco visible?
- [ ] ¿Contraste AA y áreas táctiles ≥ 36px?

---

> Este documento es la fuente única de la identidad visual. Cualquier cambio de
> color, tipografía, componente o layout debe reflejarse aquí **antes** de
> llevarse al código.
