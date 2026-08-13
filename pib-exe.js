/* Power Indiabulls EXE page improvements, applied after React hydrates.
 *
 * Same layering approach as tradepro-terminal's improve.js/clean.js: found this
 * page has zero custom overlay of its own, and its hero is one flat pre-baked
 * image (power-v2.webp) plus a decorative zigzag.png behind it -- the exact
 * "before" state Trade Pro Terminal started from. Building the same way:
 * locate real DOM by heading/alt text, rebuild in place, never touch the
 * minified Next.js output directly.
 */
(function () {
  "use strict";

  var HERO = "/pib/hero-reports.webp";

  /* Quadrant boundaries as fractions of the source screenshot (1412x757).
     Measured from the actual crop, not guessed: the four panels split close
     to a clean 50/50 grid because the original app windows were tiled evenly. */
  var QUADS = [
    { key: "portfolio", x: 0.000, y: 0.000, w: 0.500, h: 0.500,
      label: "Net Portfolio", note: "live holdings, market price and value" },
    { key: "fo",         x: 0.500, y: 0.000, w: 0.500, h: 0.500,
      label: "F&O Outstanding Orders", note: "every open leg, at a glance" },
    { key: "obligations",x: 0.000, y: 0.500, w: 0.500, h: 0.500,
      label: "Previous Obligations", note: "settlement-wise payables and dates" },
    { key: "intraday",   x: 0.500, y: 0.500, w: 0.500, h: 0.500,
      label: "Intra-Settlement Position", note: "buy/sell exposure by scrip" }
  ];

  function heroHolder() {
    var img = document.querySelector('img[alt="Power Indiabulls EXE"]');
    return img ? img.parentElement : null;
  }

  function heroVisual() {
    var holder = heroHolder();
    if (!holder || holder.dataset.improved) return;

    var img = holder.querySelector('img[alt="Power Indiabulls EXE"]');
    if (img && img.parentNode) img.parentNode.removeChild(img);
    var zig = holder.querySelector('img[src*="zigzag"]');
    if (zig && zig.parentNode) zig.parentNode.removeChild(zig);

    var stage = el("div", "pib-stage");
    var device = el("div", "pib-device");
    var screen = el("div", "pib-screen");
    screen.style.setProperty("--pib-src", "url(" + HERO + ")");

    var tag = el("div", "pib-tag");
    QUADS.forEach(function (q) {
      var w = el("div", "pib-part pib-w pib-" + q.key);
      w.style.left = (q.x * 100) + "%";
      w.style.top = (q.y * 100) + "%";
      w.style.width = (q.w * 100) + "%";
      w.style.height = (q.h * 100) + "%";
      w.addEventListener("mouseenter", function () { focus(q); });
      w.addEventListener("mouseleave", blur);
      screen.appendChild(w);
    });
    screen.appendChild(tag);
    device.appendChild(screen);
    device.appendChild(el("div", "pib-base"));
    stage.appendChild(device);

    var legend = el("div", "pib-legend");
    QUADS.forEach(function (q) {
      var c = el("button", "pib-chip");
      c.type = "button";
      c.textContent = q.label;
      c.addEventListener("mouseenter", function () { focus(q, c); });
      c.addEventListener("mouseleave", blur);
      c.addEventListener("focus", function () { focus(q, c); });
      c.addEventListener("blur", blur);
      legend.appendChild(c);
    });
    stage.appendChild(legend);
    holder.appendChild(stage);

    function focus(q, chip) {
      var w = screen.querySelector(".pib-" + q.key);
      if (!w) return;
      screen.classList.add("pib-dim");
      screen.querySelectorAll(".pib-w").forEach(function (n) { n.classList.remove("pib-on"); });
      w.classList.add("pib-on");
      legend.querySelectorAll(".pib-chip").forEach(function (n) { n.classList.remove("pib-active"); });
      if (chip) chip.classList.add("pib-active");

      tag.innerHTML = "<b>" + q.label + "</b> <span>— " + q.note + "</span>";
      tag.style.left = "0px";
      var sw = screen.clientWidth;
      var half = tag.offsetWidth / 2;
      var want = (q.x + q.w / 2) * sw;
      tag.style.left = Math.round(
        Math.min(Math.max(want, half + 10), sw - half - 10)) + "px";
      tag.classList.add("pib-show");
    }

    function blur() {
      screen.classList.remove("pib-dim");
      screen.querySelectorAll(".pib-w").forEach(function (n) { n.classList.remove("pib-on"); });
      legend.querySelectorAll(".pib-chip").forEach(function (n) { n.classList.remove("pib-active"); });
      tag.classList.remove("pib-show");
    }

    function size() {
      var w = screen.clientWidth;
      if (!w) return;
      var h = w * 757 / 1412;
      screen.querySelectorAll(".pib-part").forEach(function (n) {
        n.style.backgroundSize = w + "px " + h + "px";
      });
      QUADS.forEach(function (q) {
        var n = screen.querySelector(".pib-" + q.key);
        if (n) n.style.backgroundPosition = (-q.x * w) + "px " + (-q.y * h) + "px";
      });
    }
    size();
    window.addEventListener("resize", size);
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(size).observe(screen);
    }

    holder.dataset.improved = "hero";
    requestAnimationFrame(function () {
      screen.classList.add("pib-in");
      setTimeout(function () { screen.classList.add("pib-ready"); }, 900);
    });
  }

  /* Shared product-switcher tab bar (Mobile App / TradePro Terminal / PIB EXE) --
     same XPath already proven in tradepro-terminal's clean.js. Reused verbatim
     rather than factored into a shared file, matching how s1-s5.js are already
     separate per-concern files rather than one shared mega-file. */
  function removeProductTabs() {
    var tabs = document.evaluate(
      "//div[contains(@class, 'flex') and contains(@class, 'justify-center')]" +
      "[.//a[contains(text(), 'Mobile App')] and .//a[contains(text(), 'TradePro Terminal')] and .//a[contains(text(), 'PIB EXE')]]",
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    if (tabs && tabs.parentNode) tabs.parentNode.removeChild(tabs);
  }

  /* --- Key Features: correct the swapped screenshot, don't rebuild the section --
     This section is a real, working, accessible React component: a scroll-linked
     card list (role="button"/aria-pressed) that swaps ONE shared <img> src/alt as
     the active card changes. That already works (keyboard, scroll, click) --
     rebuilding it would throw away real functionality for no reason. It just
     currently swaps in a generic stock image per card. Fix only the mapping: a
     MutationObserver on that single <img> corrects its src to a real screenshot
     the instant React sets a matching alt, and leaves anything without a real
     replacement (Streamlined Interface, Online IPO Tracker, Auto-Update
     Notification) exactly as React set it. */
  var REAL_SHOTS = {
    "Live Market Watch": "/pib/feature-marketwatch.webp",
    "Global Market Overview": "/pib/feature-worldmarket.webp",
    "Insightful Market Data": "/pib/feature-marketstats.webp",
    "Live News Feed": "/pib/feature-livenews.webp",
    "Custom Price Alerts": "/pib/feature-alerts.webp"
  };

  function keyFeaturesSection() {
    var h2 = [].slice.call(document.querySelectorAll("h2"))
      .filter(function (h) { return /Key Features/i.test(h.textContent); })[0];
    return h2 ? h2.closest("section") : null;
  }

  function fixFeatureImage(img) {
    var real = REAL_SHOTS[img.alt];
    if (real && img.dataset.pibSrc !== real) {
      img.dataset.pibSrc = real;
      img.src = real;
    }
  }

  function watchFeatureImage() {
    var section = keyFeaturesSection();
    if (!section || section.dataset.imgWatched) return;
    var img = section.querySelector("img");
    if (!img) return;
    fixFeatureImage(img);
    new MutationObserver(function () { fixFeatureImage(img); })
      .observe(img, { attributes: true, attributeFilter: ["alt", "src"] });
    section.dataset.imgWatched = "1";
  }

  /* One extra card, click-only. It does not hook into the section's own
     scroll-linked IntersectionObserver (that's internal React state this script
     has no access to) -- it only responds to a direct click, same as the seven
     real cards do, just without the auto-highlight-on-scroll extra. Cloning a
     real card's node keeps every Tailwind class exact; only text and behaviour
     change. */
  function addAlertsCard() {
    var section = keyFeaturesSection();
    if (!section || section.dataset.alertsCard) return;
    var cards = section.querySelectorAll('[role="button"][aria-label^="Show details"]');
    if (!cards.length) return;
    var list = cards[0].parentElement;
    var img = section.querySelector("img");
    if (!img) return;

    var card = cards[cards.length - 1].cloneNode(true);
    card.setAttribute("aria-pressed", "false");
    card.setAttribute("aria-label", "Show details for Custom Price Alerts");
    card.classList.remove("card-selected");
    var h3 = card.querySelector("h3");
    if (h3) h3.textContent = "Custom Price Alerts";
    var p = card.querySelector("p");
    if (p) p.textContent = "Set a price trigger on any scrip and get notified the instant your target is hit.";

    card.addEventListener("click", function () {
      section.querySelectorAll('[role="button"][aria-label^="Show details"]').forEach(function (c) {
        c.classList.remove("card-selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("card-selected");
      card.setAttribute("aria-pressed", "true");
      img.dataset.pibSrc = REAL_SHOTS["Custom Price Alerts"];
      img.src = REAL_SHOTS["Custom Price Alerts"];
      img.alt = "Custom Price Alerts";
    });

    list.appendChild(card);
    section.dataset.alertsCard = "1";
  }

  /* "It offers:" is already a clean 5-column grid (grid-cols-1 md:grid-cols-3
     lg:grid-cols-5) -- it only reads as uneven because alternating items carry
     md:mt-12, staggering them into a zigzag with no visual weight of their own.
     Fix: drop the stagger, and reuse table-card-bg/gradient-border -- the site's
     own card-surface classes, already used a few sections down on Key Features
     -- rather than inventing new styling. Reusing them means this needs no
     light/dark branching at all; they already track the site's real theme. */
  function fixItOffers() {
    var h2 = [].slice.call(document.querySelectorAll("h2"))
      .filter(function (h) { return /^It offers/i.test(h.textContent.trim()); })[0];
    if (!h2 || h2.dataset.improved) return;
    var items = [].slice.call(h2.parentElement.querySelectorAll("img"))
      .map(function (img) { return img.closest(".rounded-lg"); })
      .filter(Boolean);
    if (!items.length) return;
    var row = items[0].parentElement.parentElement;
    [].slice.call(row.children).forEach(function (c) { c.classList.remove("md:mt-12"); });
    items.forEach(function (it) {
      it.classList.add("table-card-bg", "gradient-border", "pib-offer-card");
    });
    h2.dataset.improved = "1";
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    n.className = cls;
    return n;
  }

  var STEPS = [heroVisual, removeProductTabs, watchFeatureImage, addAlertsCard, fixItOffers];

  function apply() {
    STEPS.forEach(function (fn) {
      try { fn(); } catch (e) { console.warn("pib-exe step failed", e); }
    });
  }

  function start() {
    apply();
    var tries = 0;
    var iv = setInterval(function () {
      apply();
      if (++tries > 25) clearInterval(iv);
    }, 150);
  }

  if (document.readyState === "complete") apply();
  window.addEventListener("load", start);
})();
