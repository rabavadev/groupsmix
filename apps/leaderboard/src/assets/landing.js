// A11Y-103: hamburger nav toggle for mobile
const navToggle = document.querySelector(".nav-toggle"), navLinks = document.querySelector("nav.top .links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) { navLinks.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); }
  });
}

const yrEl = document.getElementById("yr");
if (yrEl) yrEl.textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// L4: scroll-reveal for steps / pricing / testimonial (skipped under reduced motion)
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealEls = document.querySelectorAll(".step, .price-card, .lifetime-banner, .testimonial .quote, .proof-metric");
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  revealEls.forEach((el) => io.observe(el));
}

// M-3/§3: hide the sticky mobile CTA while the pricing section (own CTAs) is on screen
const pricingSec = document.getElementById("pricing");
if (pricingSec && "IntersectionObserver" in window) {
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => document.body.classList.toggle("hide-sticky-cta", e.isIntersecting));
  }, { threshold: 0.15 });
  io2.observe(pricingSec);
}
