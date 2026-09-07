# Landing Tuni 2026 — Especificación de cambios

**Para:** la persona que va a programar la landing
**Origen:** documento *Landing Page Improvements 2026*
**Referencia visual:** el prototipo de este repo (`index.html`), que ya implementa todo lo de acá

---

## 0. Cómo leer este documento

Cada sección de la landing tiene su propio bloque con tres partes:

| Parte | Qué te dice |
|---|---|
| **Hoy** | Cómo está en producción (tuni.com.ar) |
| **Cambio** | Qué hay que hacer, en concreto |
| **Listo cuando** | El criterio para dar la tarea por terminada |

Cuando algo dice **⚠️ A definir**, es una decisión que todavía no está tomada: no la inventes, preguntá.

El prototipo de este repo no es la implementación final. Es la referencia de comportamiento y layout:
abrilo al lado del código real y copiá de ahí las medidas, los estados y el copy exacto.

```bash
python3 -m http.server 4321
# abrir http://localhost:4321
```

No tiene build ni dependencias: HTML + CSS + un JS de ~150 líneas.

- `assets/css/tokens.css` — colores, tipografías, radios, sombras, breakpoints
- `assets/css/styles.css` — layout y componentes, comentado por sección
- `assets/js/main.js` — loader, reveal, menú mobile, tabs, FAQs, marquees

---

## 1. Lo transversal (esto es lo más importante del pedido)

> *"En general falta el responsive mobile bien hecho. Muchos usuarios me dijeron que no se les hace tan intuitivo y no se ve bien."*

Es el problema #1 y no se arregla sección por sección: es un cambio de método.

### 1.1 Mobile-first, no "desktop achicado"

La landing actual está pensada en desktop y comprimida hacia abajo. Hay que darla vuelta:
escribir el CSS para 375 px y usar `min-width` para ir agregando complejidad.

```css
/* ✅ así */
.tabs { display: flex; overflow-x: auto; }
@media (min-width: 768px) { .tabs { display: grid; grid-template-columns: repeat(3, 1fr); } }

/* ❌ no así */
.tabs { display: grid; grid-template-columns: repeat(3, 1fr); }
@media (max-width: 767px) { .tabs { display: flex; overflow-x: auto; } }
```

**Breakpoints del prototipo** (los mismos en todo el archivo, sin excepciones):

| Nombre | Ancho | Qué cambia |
|---|---|---|
| base | 0–639 | Una columna. Menú hamburguesa. Tabs con scroll horizontal. |
| sm | ≥ 640 | Grillas de 2 columnas. Burbujas más anchas. |
| md | ≥ 768 | Tabs en grilla de 3. Panel de modalidad en 2 columnas. |
| lg | ≥ 992 | Nav completo en el header. Buscador en barra horizontal. CTA fija se oculta. |
| xl | ≥ 1024 | Profesores en 4 columnas. |

### 1.2 Reglas no negociables

1. **Nada desborda horizontalmente.** El único elemento que puede ser más ancho que la pantalla es el track de un marquee, y siempre dentro de un contenedor con `overflow: hidden`.
   Test: en 320 px, `document.documentElement.scrollWidth === clientWidth`.
2. **Ningún target táctil por debajo de 44 × 44 px.** En el prototipo todos los `.btn` tienen `min-height: 48px` y el `.faq__q` 60 px.
3. **Tipografía fluida con `clamp()`**, no saltos por breakpoint. El h1 va de 32 px (mobile) a 68 px (desktop) sin escalones. Ver `--fs-*` en `tokens.css`.
4. **Nada de `overflow-x: hidden` en `body`.** Convierte al body en contenedor de scroll y rompe `position: sticky` y los eventos de scroll de `window`. Si necesitás recortar, usá `overflow-x: clip` en `html` (así está en el prototipo).
5. **`viewport-fit=cover` + `env(safe-area-inset-bottom)`** en todo lo fijo abajo, para que no quede tapado por la barra de gestos del iPhone.
6. **`prefers-reduced-motion`** desactiva loader animado, reveal y marquees.

### 1.3 Accesibilidad mínima

- Todo lo interactivo con `:focus-visible` visible (ya está resuelto de forma global en `styles.css`).
- Tabs con el patrón ARIA completo: `role="tablist"` / `role="tab"` / `aria-selected` / `role="tabpanel"`, y flechas ←/→ para moverse.
- FAQs con `aria-expanded` + `aria-controls`.
- El burger con `aria-expanded` y `aria-label` que cambia entre "Abrir menú" y "Cerrar menú".
- El puntaje del profesor lleva texto para lectores de pantalla ("10 sobre 10"), porque el ícono de estrella solo no lo comunica.

---

## 2. Loader + reveal de entrada

**Cambio:** agregar una pantalla de carga previa a la landing, y que cada sección aparezca al entrar en viewport.

Cómo está resuelto en el prototipo (`main.js`, bloque 1):

- El loader ocupa toda la pantalla, con el logo y una barra indeterminada.
- Se va con el evento `load`, **con un tope duro de 2 segundos**. Esto último importa: si un asset queda colgado, nadie se queda mirando una pantalla en blanco.
- Mientras está el loader, el body queda con scroll bloqueado.
- El reveal usa `IntersectionObserver` con `rootMargin: 0px 0px -12% 0px`. Cada sección se observa una sola vez y después se desuscribe.
- Con `prefers-reduced-motion`, el loader se saltea y todas las secciones arrancan visibles.

**Listo cuando:** en una recarga con caché fría el loader no dura más de 2 s, y con JS deshabilitado la página igual se ve completa (el reveal nunca debe dejar contenido invisible).

> **⚠️ A definir:** el documento original linkea una conversación de ChatGPT como referencia del loader. No pude acceder al link, así que el prototipo propone una versión sobria (logo + barra). Si había una animación específica pensada, pasala y se reemplaza.

---

## 3. Header / navegación

**Hoy:** tres botones azules sólidos (Combinador, Reservar, Dashboard, Dashboard Admin) todos con el mismo peso visual, más un avatar circular sin etiqueta. En mobile los botones se apilan y el logo desaparece.

**Cambio:**

1. **Estados de los ítems.** Por defecto, cada ítem va "desmarcado": mismo color de texto que el resto, con `opacity: .55`. En hover / focus / activo pasa a `opacity: 1` + azul de marca + fondo azul suave. Hoy están todos gritando al mismo tiempo y no se lee jerarquía.
2. **Copy:**
   - "Reservar" → **"Reservar mi clase"**
   - "Combinador" → **"Combinador de horarios"**
3. **Perfil:** el avatar solo no se entiende. Va avatar + la etiqueta **"Mi perfil"** al lado (y en el drawer mobile, como ítem de texto).
4. **Botón nuevo: "Quiero ser profesor"**, con estilo secundario (borde, sin relleno), que ancla a la sección `#ser-profesor`.
5. **Mobile:** menú hamburguesa. Nada de botones apilados.
   - El drawer abre a pantalla completa por debajo del header, bloquea el scroll del body, cierra con Escape, con tap en un link, y automáticamente al pasar a ≥ 992 px.
   - El logo se ve siempre.

**Listo cuando:** en 375 px el header es logo + hamburguesa y nada más; el drawer abre y cierra; y en desktop se distingue a simple vista cuál ítem está activo.

> **⚠️ A definir:** "Dashboard Admin" aparece en el screenshot del header. Asumo que es interno y no va para el alumno: en el prototipo no está. Confirmar.

---

## 4. Hero / introducción

**Hoy:** h1 gigante (80 px fijos, se rompe en mobile), y un buscador chato de ~50 px de alto con labels de 13 px que se pierde en la sección.

**Cambio:**

1. **Copy del subtítulo**, textual:
   > Clases virtuales en vivo de 1 hora y media. Aprendé gracias a alumnos más avanzados de tu misma carrera y universidad.
2. **El buscador tiene que pesar mucho más en desktop.** Números del prototipo:

   | | Hoy (aprox.) | Nuevo |
   |---|---|---|
   | Alto de cada campo | 50 px | **88 px** |
   | Tamaño del label | 13 px | **16 px** |
   | Tamaño del valor | 15 px | **18 px** |
   | Ancho máximo | ~600 px | **1020 px** |
   | Alto del botón | 40 px | **68 px** |

3. **"Buscar" → "Reservar"**, con la flecha a la derecha.
4. **Mobile:** los tres campos se apilan a ancho completo, cada uno de 64 px, y el botón abajo a todo el ancho. Los tres campos tienen que estar visibles — hoy en mobile Carrera y Materia directamente no aparecen.
5. El h1 pasa a `clamp(2rem, 1.15rem + 3.6vw, 4.25rem)`.

**Listo cuando:** en 375 px se ven Universidad, Carrera, Materia y el botón sin scroll horizontal; y en 1440 px el buscador ocupa visiblemente el centro de la sección.

---

## 5. Datos claros

**Cambio:** se mantiene el diseño (banda oscura, 4 tarjetas). Solo el responsive: **2 × 2 en mobile**, 4 en línea a partir de 900 px. Hoy en mobile quedan cuatro tarjetas apiladas y la sección se hace larguísima.

**Listo cuando:** en 375 px la sección entra en una pantalla y media, no en tres.

---

## 6. Modalidades de clase

**Cambio:** se mantiene el diseño de las tres pestañas (Individual / Grupal / Talleres troncales) con el panel de detalle debajo. Los ajustes son de comportamiento:

1. **Mobile:** las pestañas van en un carril con scroll horizontal y `scroll-snap`, no apiladas. Cada tarjeta ocupa 78 % del ancho, así se ve que hay más a la derecha.
2. Al elegir una pestaña, esa tarjeta se centra sola en el carril.
3. El panel pasa de 2 columnas (desktop) a 1 columna con el bloque de CTA abajo (mobile).
4. Teclado: flechas ←/→ recorren las pestañas.
5. El copy, los badges y los CTAs de cada panel están textuales en el prototipo (incluido el botón verde de Talleres, que va a WhatsApp).

**Listo cuando:** en mobile se puede pasar de una modalidad a otra deslizando, y el panel de detalle nunca desborda.

---

## 7. Packs de clases — **sección OPTATIVA**

Sección nueva, marcada como optativa en el documento original. En el prototipo está con `data-optional="true"` para que se pueda sacar de una sin tocar nada más.

**Contenido:** tres tiers, todos "hasta parcial / final":

| Tier | Frecuencia |
|---|---|
| 1 | 1 clase semanal |
| 2 | 2 clases semanales (destacado como el más elegido) |
| 3 | 4 clases semanales |

Al pie, dos aclaraciones que sí o sí van:
- (*) Los packs se abonan al contado.
- (*) Disponibles para materias core en esta primera etapa.

> **⚠️ A definir, antes de programarla:**
> - **Precios.** El documento no los trae. El prototipo directamente no muestra precio.
> - **Qué es una "materia core"** y cuáles entran.
> - **Cómo se compra.** ¿Va al mismo checkout que una clase suelta, o es un contacto por WhatsApp como los talleres? Hoy el prototipo lleva al buscador, que es un placeholder.
> - Los títulos de cada tier ("Ritmo constante", "Preparación intensiva", "Acompañamiento total") los propuse yo. Si hay nombres comerciales definidos, reemplazar.

---

## 8. Pain points del alumno

**Cambio:** sección de burbujas tipo chat, alternadas izquierda/derecha, con las 8 frases textuales del documento, y abajo la tarjeta de cierre con el CTA "Reservar mi clase particular".

Responsive: en mobile las burbujas llegan al 92 % del ancho; en ≥ 768 px al 66 %, para que se lea la alternancia.

---

## 9. ¿Por qué elegirnos?

**Cambio:** se mantiene igual. Cinco tarjetas: Garantía de devolución, Reprogramá sin costo, Profesores verificados, Pago seguro y garantizado, Calidad asegurada.

Un solo ajuste: la quinta tarjeta hoy dice *"Reseñas y valoraciones transparentes de alumnos reales…"*. Como se saca la sección de reseñas (punto 11), esa promesa queda sin respaldo. El prototipo la reemplaza por: *"Cada clase se evalúa internamente para sostener el nivel académico que prometemos."*

Responsive: 1 columna → 2 (≥ 640) → 5 (≥ 992).

---

## 10. Equipo de profesores

**El diseño se mantiene exactamente igual.** Son cuatro correcciones puntuales:

| # | Cambio | Detalle |
|---|---|---|
| a | **Sacar la cantidad de reseñas y las estrellitas por review** | No tiene que verse desde la landing cuántas reviews tiene cada profesor. Varios no tienen ninguna y queda mal. |
| b | **Puntaje 10 por defecto, más grande** | Ver la nota de abajo. |
| c | **Ocultar profesores que ya no están en Tuni** | Hoy se siguen mostrando. **Esto se filtra en el backend / la query, no ocultando nodos en el DOM.** El prototipo usa `data-active="false"` solo para dejar la regla explícita. |
| d | **Cambiar el título y agregar el badge de universidad** | "Mentores con trayectoria y resultados comprobados" → **"Alumnos avanzados de tu misma carrera y universidad"**. Y al lado del nombre de cada profesor, el badge con su universidad. |

> **⚠️ A definir (punto b).** El texto original dice *"Pondría por default que tengan 10 estrellas. Así aparece algo. Las haría más grandes al comment de las estrellas."*
> Lo interpreté como: **mostrar un puntaje sobre 10 — con 10 como valor por defecto cuando el profesor todavía no tiene calificaciones — con una sola estrella como ícono, en tamaño grande.** Así siempre aparece algo y no se filtra cuántas reseñas hay.
> La otra lectura posible es renderizar diez estrellas dibujadas. No la implementé porque en mobile diez estrellas no entran bien y se choca con el punto (a).
> **Confirmar antes de programar.** Y ojo con lo obvio: mostrar 10/10 fijo a todo el mundo es una nota que hay que poder sostener.

---

## 11. Qué dice nuestra comunidad — **ELIMINAR**

**Cambio:** se saca la sección completa.

Motivo del documento: el sistema de reseñas actual es muy pobre y todos los testimonios son de UdeSA. Vuelve cuando haya un sistema de reviews que lo sostenga.

**Listo cuando:** no queda ni la sección ni su entrada en la navegación ni el CSS asociado. Si se puede, dejarla detrás de un feature flag apagado en vez de borrar el código.

---

## 12. Quiero ser profesor en Tuni

**Cambio:** se mantiene. Los cinco beneficios, textuales, y el CTA "Postularme".

Lo único nuevo: ahora es el destino del botón **"Quiero ser profesor"** del header (`#ser-profesor`).

> **⚠️ A definir:** a dónde apunta "Postularme" — ¿formulario propio, Typeform, WhatsApp?

---

## 13. En los medios — **SECCIÓN NUEVA**

**Cambio:** sección nueva de prensa. La referencia de diseño del documento es la sección equivalente de mob.ar: a la izquierda una nota destacada con la cita grande y el medio; a la derecha una lista de notas, cada una con medio, titular y un link "Leer ↗".

Estructura del prototipo:
- Título: **"Tuni en los medios"**, con "Tuni" en azul.
- Destacado: barra azul vertical a la izquierda, nombre del medio, cita en tipografía display grande con las comillas en azul, y abajo "Leer nota completa ↗ | fecha".
- Lista: 4 notas, separadas por línea.
- Responsive: en mobile el destacado va arriba y la lista abajo, todo en una columna.

> **⚠️ A definir:** **el contenido real.** El prototipo tiene una cita y titulares de relleno. Hacen falta, por cada nota: medio, titular, URL y fecha. Y los logos de los medios, si se quieren usar en vez de texto (en el prototipo van como texto, que además escala mejor).

---

## 14. Educación validada por organizaciones líderes

**Cambio:** actualizar el listado del carrusel. Esta es la lista completa y definitiva:

1. Harvard Aspire Institute
2. Ingreso Ingeniería UdeSA
3. Sparklab UdeSA
4. Centro de Entrepreneurship UdeSA
5. Desarrollo Profesional UdeSA
6. Desarrollo Profesional UCEMA
7. Club de Emprendedores UdeSA
8. Club de Finanzas UdeSA
9. Politeia UdeSA
10. XPLORA UCEMA
11. Di Tella Finance Club
12. Club de Neurociencias UTDT

Ojo con dos cosas:
- **"Start Global" está en la landing actual y no está en la lista nueva.** Sale.
- Hay **seis entradas nuevas** respecto de la landing actual: Desarrollo Profesional UCEMA, Club de Finanzas UdeSA, Politeia UdeSA, XPLORA UCEMA, Di Tella Finance Club y Club de Neurociencias UTDT.

**Detalle técnico del marquee:** el CSS anima el track hasta `-50%`, así que el contenido tiene que estar **exactamente dos veces** en el DOM para que el loop no salte. El JS lo duplica solo y marca la copia con `aria-hidden="true"` para que no se lea dos veces. Si agregás o sacás organizaciones, no toques ese balance.

> **⚠️ A definir:** ¿van los logos o alcanza con los nombres? El prototipo usa nombres. Si van logos, hacen falta en SVG y en una sola versión monocromática, si no el carrusel se ve sucio.

---

## 15. FAQs

**Cambio:** ninguno de contenido. Se mantiene igual.

Solo dos ajustes de interacción: cada pregunta es un `<button>` de 60 px de alto (target táctil), y el ícono `+` rota 45° al abrirse.

---

## 16. Checklist de QA antes de publicar

**Responsive**
- [ ] 320, 375, 414, 768, 1024, 1440 px: sin scroll horizontal en ninguno
- [ ] iPhone real, Safari: la CTA fija no queda tapada por la barra de gestos
- [ ] Rotar a landscape en mobile: no se rompe nada
- [ ] Zoom del navegador al 200 %: se sigue pudiendo usar

**Interacción**
- [ ] Drawer: abre, cierra con Escape, cierra al tocar un link, cierra al pasar a desktop
- [ ] Tabs: click, flechas ←/→, y la pestaña elegida se centra en mobile
- [ ] FAQs: abren y cierran, `aria-expanded` acompaña
- [ ] Buscador: los tres selects funcionan en iOS y Android

**Contenido**
- [ ] Copy del hero, del header y del título de profesores, textual
- [ ] Sección "Qué dice nuestra comunidad" eliminada
- [ ] Lista de organizaciones actualizada (12 entradas, sin Start Global)
- [ ] Ningún profesor dado de baja visible
- [ ] Sin cantidad de reseñas a la vista

**Técnico**
- [ ] Loader se va siempre, incluso con un asset caído
- [ ] Con JS deshabilitado la página se ve completa
- [ ] `prefers-reduced-motion` respetado
- [ ] Lighthouse mobile: performance y accesibilidad ≥ 90

---

## 17. Resumen de decisiones pendientes

| # | Tema | Sección |
|---|---|---|
| 1 | Referencia del loader (link de ChatGPT inaccesible) | 2 |
| 2 | ¿"Dashboard Admin" va en el header público? | 3 |
| 3 | Precios de los packs | 7 |
| 4 | Definición y listado de "materias core" | 7 |
| 5 | Flujo de compra de un pack | 7 |
| 6 | Nombres comerciales de los tiers | 7 |
| 7 | "10 estrellas": ¿puntaje sobre 10 o diez estrellas dibujadas? | 10 |
| 8 | Destino del botón "Postularme" | 12 |
| 9 | Notas de prensa reales: medio, titular, URL, fecha | 13 |
| 10 | Organizaciones: ¿logos o nombres? | 14 |
