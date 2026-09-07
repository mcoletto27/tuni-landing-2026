/* =========================================================
   Tuni · Landing 2026 — comportamiento
   Vanilla JS, sin dependencias. Cada bloque es portable 1:1
   a un hook o componente de React.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Loader + reveal pre-page ----------
     El loader se va cuando termina de cargar la página (o a los 2 s
     como máximo, para no dejar a nadie mirando una pantalla en blanco
     si un asset tarda). Al salir, dispara el reveal de la primera pantalla. */
  var loader = document.getElementById("loader");
  var loaderDone = false;

  function hideLoader() {
    if (loaderDone || !loader) return;
    loaderDone = true;
    loader.classList.add("is-out");
    document.body.classList.remove("is-locked");
    window.setTimeout(function () { loader.hidden = true; }, 520);
  }

  document.body.classList.add("is-locked");
  if (reduceMotion) {
    hideLoader();
  } else {
    window.addEventListener("load", function () { window.setTimeout(hideLoader, 350); });
    window.setTimeout(hideLoader, 2000); // tope duro
  }

  /* Reveal por sección al entrar en viewport */
  var revealables = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. Header: sombra al scrollear ---------- */
  var header = document.getElementById("header");
  var stickyCta = document.getElementById("stickyCta");
  var hero = document.querySelector(".hero");

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-stuck", y > 8);
    // La CTA fija de mobile aparece recién cuando el buscador del hero salió de pantalla
    if (stickyCta && hero) {
      stickyCta.classList.toggle("is-visible", y > hero.offsetHeight * 0.85);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Menú mobile ---------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    drawer.hidden = false;
    drawer.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    if (!open) window.setTimeout(function () { if (!drawer.classList.contains("is-open")) drawer.hidden = true; }, 300);
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setDrawer(burger.getAttribute("aria-expanded") !== "true");
    });
  }
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setDrawer(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
  });
  // Al pasar a desktop el drawer no debe quedar montado ni el scroll bloqueado
  window.matchMedia("(min-width: 992px)").addEventListener("change", function (e) {
    if (e.matches) setDrawer(false);
  });

  /* ---------- 4. Tabs de modalidades ----------
     Teclado: flechas ←/→ recorren las pestañas, como manda el patrón ARIA. */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.setAttribute("tabindex", selected ? "0" : "-1");
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.classList.toggle("is-active", selected);
        panel.hidden = !selected;
      }
    });
    // En mobile los tabs scrollean: centrá el elegido
    if (tab.scrollIntoView) tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }

  tabs.forEach(function (tab, i) {
    tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1");
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ---------- 5. FAQs (acordeón) ---------- */
  document.querySelectorAll(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var answer = document.getElementById(btn.getAttribute("aria-controls"));
      if (answer) answer.classList.toggle("is-open", !open);
    });
  });

  /* ---------- 6. Marquees ----------
     Se duplica el contenido para que el loop sea continuo. Ojo: el CSS
     anima hasta -50%, así que el track SIEMPRE debe tener el contenido
     exactamente dos veces. */
  document.querySelectorAll("[data-marquee]").forEach(function (track) {
    track.innerHTML += track.innerHTML;
    Array.prototype.slice.call(track.children).slice(track.children.length / 2)
      .forEach(function (el) { el.setAttribute("aria-hidden", "true"); });
  });

  /* ---------- 7. Profesores dados de baja ----------
     Regla de negocio: un profesor que ya no está en Tuni no se muestra.
     En el proyecto real esto se filtra en la query/endpoint, no en el DOM. */
  document.querySelectorAll('.teacher[data-active="false"]').forEach(function (el) { el.remove(); });

  /* ---------- 8. Buscador (demo) ---------- */
  var form = document.getElementById("buscador");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      console.log("Reservar →", Object.fromEntries(data.entries()));
      alert("Prototipo: acá el buscador redirige al listado de profesores con estos filtros.");
    });
  }
})();
