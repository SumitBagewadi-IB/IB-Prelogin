/* Static-mirror runtime.
 *
 * The source site is a Next.js app; this mirror ships no React. Everything the
 * original hydrated on the client has to be re-driven here. Three behaviours
 * matter for browsing the mirror:
 *
 *   1. mega-menu panels  (Products / Markets / More)
 *   2. FAQ accordions    (answers are injected at build time, hidden by default)
 *   3. mobile drawer
 *
 * The theme toggle is intentionally inert — the mirror is captured in the dark
 * theme the site serves by default.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------ mega menu */
  var TRIGGERS = { "products-trigger": "products", "markets-trigger": "markets", "more-trigger": "more" };
  var closeTimer = null;

  function panelFor(id) {
    return document.getElementById("ibx-panel-" + id);
  }

  function closeAll() {
    document.querySelectorAll(".ibx-panel.is-open").forEach(function (p) {
      p.classList.remove("is-open");
      p.setAttribute("aria-hidden", "true");
    });
    Object.keys(TRIGGERS).forEach(function (t) {
      var el = document.getElementById(t);
      if (el) el.setAttribute("aria-expanded", "false");
    });
  }

  function open(id, trigger) {
    var panel = panelFor(id);
    if (!panel) return;
    closeAll();
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }

  Object.keys(TRIGGERS).forEach(function (triggerId) {
    var trigger = document.getElementById(triggerId);
    var id = TRIGGERS[triggerId];
    if (!trigger) return;

    trigger.addEventListener("mouseenter", function () {
      clearTimeout(closeTimer);
      open(id, trigger);
    });
    trigger.addEventListener("mouseleave", function () {
      closeTimer = setTimeout(closeAll, 150);
    });
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var panel = panelFor(id);
      if (panel && panel.classList.contains("is-open")) closeAll();
      else open(id, trigger);
    });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(id, trigger);
      }
    });

    var panel = panelFor(id);
    if (panel) {
      panel.addEventListener("mouseenter", function () { clearTimeout(closeTimer); });
      panel.addEventListener("mouseleave", function () { closeTimer = setTimeout(closeAll, 150); });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".ibx-menus") && !e.target.closest("[id$='-trigger']")) closeAll();
  });

  /* ------------------------------------------------------- FAQ accordions */
  document.querySelectorAll("[aria-controls^='faq-panel-']").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;

    // Build output marks collapsed answers with `hidden`; the one the server
    // rendered open has no `hidden` attribute, so state is already correct.
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      panel.hidden = isOpen;
      var chev = btn.querySelector("svg");
      if (chev) chev.classList.toggle("rotate-180", !isOpen);
    });
  });

  /* ---------------------------------------------------------- mobile menu */
  var drawer = document.getElementById("ibx-drawer");
  if (drawer) {
    document.querySelectorAll("[aria-label='Open menu']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
      });
    });
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer || e.target.closest(".ibx-drawer-close")) {
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
      }
    });
    drawer.querySelectorAll(".ibx-acc-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var body = btn.nextElementSibling;
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
        if (body) body.hidden = isOpen;
      });
    });
  }
})();
