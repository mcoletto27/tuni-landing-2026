# Landing Tuni 2026

Prototipo de referencia con las correcciones y mejoras de la landing de Tuni, más el
documento de especificación para quien la va a programar.

**➡️ [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md) — empezá por acá.**

**🔗 Prototipo online: https://mcoletto-creator.github.io/tuni-landing-2026/**

---

## Qué es esto

La landing en producción (tuni.com.ar) es una app React (Create React App) + Bootstrap 5,
y este repo **no** tiene su código fuente. Lo que hay acá es un prototipo estático,
autocontenido, que implementa todos los cambios pedidos: sirve como referencia visual y de
comportamiento para portarlos al proyecto real.

## Verlo

En vivo: **https://mcoletto-creator.github.io/tuni-landing-2026/** (se publica solo con cada push a `main`).

En local:

```bash
python3 -m http.server 4321
```

Y abrir http://localhost:4321. No hay build, ni `npm install`, ni dependencias.

## Estructura

```
index.html                 Todas las secciones, comentadas una por una
assets/css/tokens.css      Colores, tipografías, radios, sombras, escala fluida
assets/css/styles.css      Layout y componentes, en el mismo orden que el HTML
assets/js/main.js          Loader, reveal, menú mobile, tabs, FAQs, marquees
docs/ESPECIFICACION.md     El documento de handoff
```

## Resumen de cambios

| Sección | Qué pasa |
|---|---|
| Transversal | Responsive rehecho mobile-first (era el problema #1 reportado por usuarios) |
| Pre-página | Loader nuevo + reveal por sección |
| Header | Ítems "desmarcados" con hover azul, copy nuevo, "Mi perfil" explícito, botón "Quiero ser profesor", menú hamburguesa en mobile |
| Hero | Copy nuevo, buscador mucho más grande en desktop, "Buscar" → "Reservar" |
| Datos claros | Igual; grilla 2×2 en mobile |
| Modalidades | Igual; tabs con scroll horizontal y snap en mobile |
| Packs de clases | **Sección nueva y optativa** — 3 tiers hasta parcial/final |
| Pain points | Burbujas + tarjeta de cierre |
| Por qué elegirnos | Igual; se reescribe la tarjeta que prometía reseñas |
| Profesores | Sin cantidad de reseñas, puntaje grande, badge de universidad, título nuevo, se ocultan los dados de baja |
| Qué dice la comunidad | **Se elimina** hasta tener un sistema de reviews decente |
| Ser profesor | Igual; ahora es el destino del botón del header |
| En los medios | **Sección nueva** |
| Organizaciones | Listado actualizado a 12 entradas |
| FAQs | Igual |

## Antes de programar

Hay **10 decisiones sin tomar** (precios de los packs, notas de prensa reales, cómo se
muestra el puntaje de los profesores, etc.). Están todas juntas en la sección 17 del
documento. Conviene cerrarlas antes de arrancar.
