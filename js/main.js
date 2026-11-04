/* =========================================================
   MARIO LUQUIS · ABOGADO
   ========================================================= */

/* ---------- 1. DATOS DE CONTACTO (editá solo acá) ---------- */
const CONTACTO = {
  whatsapp: "5491141742767",   // código de país + área + número, sin + ni espacios
  telefono: "+541141742767",  // formato internacional
  mensaje: "Hola Dr. Luquis, quisiera hacer una consulta.",

  // Lo que se MUESTRA en la sección Contacto. Si dejás uno vacío (""), esa fila se oculta sola.
  telefonoTexto: "+54 11 4174-2767",
  horarios:      "",                  // ej: "Lunes a viernes de 9 a 18 h"
  email:         "",                  // ej: "contacto@marioluquis.com"
};

document.documentElement.classList.add("js");

document.querySelectorAll("[data-wa]").forEach((el) => {
  const msg = el.dataset.area
    ? `Hola Dr. Luquis, quisiera hacer una consulta sobre ${el.dataset.area}.`
    : CONTACTO.mensaje;
  el.href = `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(msg)}`;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

document.querySelectorAll("[data-tel]").forEach((el) => {
  el.href = `tel:${CONTACTO.telefono}`;
});

/* Datos visibles en Contacto (las filas vacías se ocultan) */
document.querySelectorAll("[data-contact]").forEach((el) => {
  const valor = CONTACTO[el.dataset.contact];
  if (!valor) { el.closest(".contact__row")?.remove(); return; }
  if (el.dataset.contact === "email") {
    const a = document.createElement("a");
    a.href = `mailto:${valor}`; a.textContent = valor;
    el.appendChild(a);
  } else {
    el.textContent = valor;
  }
});
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- CARRUSEL: fotos del estudio ---------- */
const studioCarousel = document.querySelector("[data-studio-carousel]");
if (studioCarousel) {
  const slides = [...studioCarousel.querySelectorAll(".studio-carousel__slide")];
  const count = studioCarousel.querySelector("[data-carousel-count]");
  const nextButton = studioCarousel.querySelector("[data-carousel-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0;
  let timer;
  let hovered = false;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.setAttribute("aria-label", `${i + 1} de ${slides.length}`);
    });
    count.textContent = `${current + 1} / ${slides.length}`;
    nextButton.setAttribute("aria-label", `Ver siguiente foto: ${slides[(current + 1) % slides.length].querySelector("img").alt}`);
  }

  function startRotation() {
    clearTimeout(timer);
    if (reduceMotion || hovered || studioCarousel.contains(document.activeElement) || document.hidden) return;
    timer = setTimeout(() => {
      showSlide(current + 1);
      startRotation();
    }, 5500);
  }

  nextButton.addEventListener("click", () => { showSlide(current + 1); startRotation(); });
  studioCarousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    hovered = true;
    clearTimeout(timer);
  });
  studioCarousel.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    hovered = false;
    startRotation();
  });
  studioCarousel.addEventListener("focusin", () => clearTimeout(timer));
  studioCarousel.addEventListener("focusout", () => setTimeout(startRotation, 0));
  document.addEventListener("visibilitychange", startRotation);
  startRotation();
}

/* ---------- 2. NAVBAR: sombra y tamaño al hacer scroll ---------- */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- 3. MENÚ MÓVIL ---------- */
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("navMenu");

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- 4. SECCIÓN ACTIVA EN EL MENÚ ---------- */
const links = [...menu.querySelectorAll("a")];
const sections = links
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) =>
        a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));

/* ---------- 5. APARICIÓN SUAVE AL HACER SCROLL ---------- */
const reveal = new IntersectionObserver(
  (entries, obs) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
  }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

/* ---------- 6. CÓMO TRABAJO: la línea se enciende paso a paso ---------- */
const how = document.querySelector(".how__steps");
if (how) {
  const steps = [...how.querySelectorAll(".how__step")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Posición del nodo de cada paso (en horizontal: X; en vertical: Y)
  const isVertical = () => steps[1].offsetTop > steps[0].offsetTop;
  const dotPos = (s) => (isVertical() ? s.offsetTop + 15.5 : s.offsetLeft + 7.5);
  const last = steps[steps.length - 1];

  // La línea mide justo hasta el último nodo
  const setRail = () => how.style.setProperty("--rail", dotPos(last) + "px");
  // Qué parte de esa línea hay que iluminar para llegar al nodo de cada paso
  const progressAt = (s) => dotPos(s) / dotPos(last);

  async function run() {
    setRail();
    if (reduce) {
      steps.forEach((s) => s.classList.add("is-lit"));
      how.style.setProperty("--p", 1);
      return;
    }
    steps[0].classList.add("is-lit");
    for (let i = 1; i < steps.length; i++) {
      await wait(500);                                        // pausa en el paso actual
      how.style.setProperty("--p", progressAt(steps[i]));     // la línea avanza
      await wait(750);                                        // tiempo que tarda en llegar
      steps[i].classList.add("is-lit");                       // se enciende el siguiente
    }
  }

  setRail();
  window.addEventListener("resize", setRail);

  new IntersectionObserver(
    (entries, obs) => entries.forEach((en) => {
      if (en.isIntersecting) { obs.unobserve(en.target); run(); }
    }),
    { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
  ).observe(how);
}

/* ---------- 7. PREGUNTAS FRECUENTES: acordeón (una abierta a la vez) ---------- */
const faqItems = [...document.querySelectorAll(".faq__item")];
faqItems.forEach((item) => {
  const btn = item.querySelector(".faq__q");
  btn.addEventListener("click", () => {
    const wasOpen = item.classList.contains("is-open");
    faqItems.forEach((i) => {
      i.classList.remove("is-open");
      i.querySelector(".faq__q").setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});
