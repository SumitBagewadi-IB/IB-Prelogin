/* IPO page: behaviour for the blocks added from "IPO Page Wireframe v1".
 *
 * Two things need driving; nothing else on the page is touched:
 *
 *   1. §3 tab row. The mirror ships only the Upcoming dataset, so the other
 *      three tabs render their own empty state. The active tab is mirrored to
 *      ?tab= so the hero CTA can deep-link into it.
 *   2. in-page CTAs carrying data-ipx-tab: activate that tab, then scroll.
 *
 * The §12 FAQ accordion is driven by /assets/site.js, which already binds
 * every [aria-controls^='faq-panel-'] button. Nothing to add here.
 */
(function () {
  "use strict";

  /* ----------------------------------------------------- §3 IPO list tabs */

  var TABS = ["upcoming", "open", "closed", "listed"];

  var PILL = {
    desktop: {
      on: ["bg-[var(--global-bg-3)]", "text-[var(--global-text-1)]", "scale-105"],
      off: ["text-[var(--global-text-4)]", "hover:text-[var(--global-text-2)]", "hover:bg-[var(--global-bg-21)]/50"]
    },
    mobile: {
      on: ["border-[var(--global-bg-3)]", "text-[var(--global-bg-3)]", "shadow-xl"],
      off: ["border-[var(--global-text-4)]", "text-[var(--global-text-4)]", "hover:text-[var(--global-text-2)]"]
    }
  };

  function tabs() {
    var buttons = document.querySelectorAll("[data-ipx-list-tab]");
    var panels = document.querySelectorAll("[data-ipx-panel]");
    if (!buttons.length || !panels.length) return null;

    function setTab(name) {
      if (TABS.indexOf(name) === -1) name = "upcoming";

      buttons.forEach(function (btn) {
        var kind = btn.getAttribute("data-ipx-pill") === "mobile" ? "mobile" : "desktop";
        var on = btn.getAttribute("data-ipx-list-tab") === name;
        var map = PILL[kind];
        btn.classList.remove.apply(btn.classList, on ? map.off : map.on);
        btn.classList.add.apply(btn.classList, on ? map.on : map.off);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });

      panels.forEach(function (p) {
        p.classList.toggle("ipx-hidden", p.getAttribute("data-ipx-panel") !== name);
      });

      try {
        var url = new URL(window.location.href);
        url.searchParams.set("tab", name);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (e) {
        /* older browsers: the tab still switches, the URL just doesn't follow */
      }
      return name;
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setTab(btn.getAttribute("data-ipx-list-tab"));
      });
    });

    var initial = "upcoming";
    try {
      initial = new URL(window.location.href).searchParams.get("tab") || "upcoming";
    } catch (e) {}
    if (initial !== "upcoming") setTab(initial);

    return setTab;
  }

  /* -------------------------------------------------- in-page deep links */

  function deepLinks(setTab) {
    document.querySelectorAll("[data-ipx-tab]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (setTab) setTab(el.getAttribute("data-ipx-tab"));
        var target = document.getElementById("ipo-list");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function start() {
    deepLinks(tabs());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
