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

  /* Carousel of six SEPARATE, FULL, uncropped screenshots -- the same technique
     as Trade Pro Terminal's option-chain carousel (s2.js: a rail of stacked,
     cross-faded <img>, a tablist of mode buttons, auto-advance every 3s, pause
     on user interaction). Every file here is the complete original screen, title
     bar and all -- object-fit:contain in the CSS, never fill or cover, so none
     of the six is ever cropped regardless of its exact source dimensions. */
  var MODES = [
    { key: "welcome", file: "full-welcome.webp", label: "Dashboard",
      note: "World market summary, news room and market watch on login." },
    { key: "marketwatch", file: "full-marketwatch.webp", label: "Market Watch",
      note: "Multiple watchlists tracked side by side, live." },
    { key: "realtime", file: "full-realtime.webp", label: "Realtime Reports",
      note: "Net portfolio, F&O orders, obligations and intra-settlement position." },
    { key: "marketstats", file: "full-marketstats.webp", label: "Market Statistics",
      note: "Top gainers, losers, only buyers or sellers, volume toppers, most volatile." },
    { key: "livenews", file: "full-livenews.webp", label: "Live News",
      note: "A continuously updated News Room for market-moving disclosures." },
    { key: "alerts", file: "full-alerts.webp", label: "Price Alerts",
      note: "Set a trigger on any scrip and get notified the instant it's hit." }
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
    var rail = el("div", "pib-rail");

    MODES.forEach(function (m, i) {
      var shot = document.createElement("img");
      shot.src = "/pib/" + m.file;
      shot.alt = "Power Indiabulls EXE, " + m.label;
      shot.decoding = "async";
      if (i !== 0) shot.loading = "lazy";
      shot.className = "pib-shot" + (i === 0 ? " pib-on" : "");
      shot.id = "pib-shot-" + m.key;
      rail.appendChild(shot);
    });

    screen.appendChild(rail);
    device.appendChild(screen);
    device.appendChild(el("div", "pib-base"));
    stage.appendChild(device);

    var tabs = el("div", "pib-legend");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Power Indiabulls EXE screen");
    var note = el("div", "pib-note");

    var current = 0;
    var autoTimer = null;

    function select(i, focusTab) {
      current = i;
      MODES.forEach(function (m, j) {
        var on = i === j;
        rail.children[j].classList.toggle("pib-on", on);
        var tab = tabs.children[j];
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });
      note.innerHTML = "";
      note.appendChild(el("b", null, MODES[i].label));
      note.appendChild(document.createTextNode(" — " + MODES[i].note));
    }

    function startAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        select((current + 1) % MODES.length);
      }, 3000);
    }

    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    }

    MODES.forEach(function (m, i) {
      var tab = el("button", "pib-chip");
      tab.type = "button";
      tab.textContent = m.label;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.setAttribute("aria-controls", "pib-shot-" + m.key);
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener("click", function () { stopAuto(); select(i); });
      tab.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        stopAuto();
        select((i + d + MODES.length) % MODES.length, true);
      });
      tabs.appendChild(tab);
    });

    stage.appendChild(tabs);
    stage.appendChild(note);
    holder.appendChild(stage);
    select(0);

    holder.dataset.improved = "hero";
    requestAnimationFrame(function () {
      screen.classList.add("pib-in");
    });
    setTimeout(startAuto, 1000);
  }

  function el(tagOrText, cls, text) {
    var n = document.createElement(tagOrText);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
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

  /* Key Features: same carousel as hero, using the same 6 full screenshots.
     Removes the scroll-linked card grid and replaces it with a full-screen
     carousel in laptop frame mockup. Same interaction as hero: tab buttons,
     auto-advance every 3s, pause on user interaction, keyboard nav. */
  function keyFeaturesCarousel() {
    var h2 = [].slice.call(document.querySelectorAll("h2"))
      .filter(function (h) { return /Key Features/i.test(h.textContent); })[0];
    var section = h2 ? h2.closest("section") : null;
    if (!section || section.dataset.carouselImproved) return;

    var children = [].slice.call(section.children);
    children.forEach(function (child) {
      if (child !== h2) section.removeChild(child);
    });

    var stage = el("div", "pib-stage pib-features-stage");
    var device = el("div", "pib-device");
    var screen = el("div", "pib-screen");
    var rail = el("div", "pib-rail");

    MODES.forEach(function (m, i) {
      var shot = document.createElement("img");
      shot.src = "/pib/" + m.file;
      shot.alt = "Power Indiabulls EXE, " + m.label;
      shot.decoding = "async";
      if (i !== 0) shot.loading = "lazy";
      shot.className = "pib-shot" + (i === 0 ? " pib-on" : "");
      shot.id = "pib-features-shot-" + m.key;
      rail.appendChild(shot);
    });

    screen.appendChild(rail);
    device.appendChild(screen);
    device.appendChild(el("div", "pib-base"));
    stage.appendChild(device);

    var tabs = el("div", "pib-legend pib-features-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Key Features showcase");
    var note = el("div", "pib-note pib-features-note");

    var current = 0;
    var autoTimer = null;

    function select(i, focusTab) {
      current = i;
      MODES.forEach(function (m, j) {
        var on = i === j;
        rail.children[j].classList.toggle("pib-on", on);
        var tab = tabs.children[j];
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });
      note.innerHTML = "";
      note.appendChild(el("b", null, MODES[i].label));
      note.appendChild(document.createTextNode(" — " + MODES[i].note));
    }

    function startAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        select((current + 1) % MODES.length);
      }, 3000);
    }

    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    }

    MODES.forEach(function (m, i) {
      var tab = el("button", "pib-chip");
      tab.type = "button";
      tab.textContent = m.label;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.setAttribute("aria-controls", "pib-features-shot-" + m.key);
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener("click", function () { stopAuto(); select(i); });
      tab.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        stopAuto();
        select((i + d + MODES.length) % MODES.length, true);
      });
      tabs.appendChild(tab);
    });

    stage.appendChild(tabs);
    stage.appendChild(note);
    section.appendChild(stage);
    select(0);

    section.dataset.carouselImproved = "features";
    requestAnimationFrame(function () {
      screen.classList.add("pib-in");
    });
    setTimeout(startAuto, 1000);
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

  var STEPS = [heroVisual, removeProductTabs, keyFeaturesCarousel, fixItOffers];

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
