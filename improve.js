/* Trade Pro improvements, applied after React hydrates.
 *
 * Deliberately layered on top rather than compiled in: patching minified JSX to
 * add elements is fragile, and this stays trivially reversible. Text edits that
 * must survive hydration live in the HTML *and* the route chunk instead.
 *
 * Every step is idempotent, so a re-render cannot duplicate anything.
 */
(function () {
  "use strict";

  var style = document.createElement("style");
  style.textContent =
    "img[src*='tradepro-baner']," +
    "img[src*='tradepro-image-v3']," +
    "img[src*='zigzag']," +
    "img[src*='blackarrow']" +
    "{display:none!important;visibility:hidden!important;height:0!important;width:0!important;}";
  if (document.head) document.head.appendChild(style);
  else document.body.appendChild(style);

  var CANVAS = "/tp/canvas.png";
  var FRAME = "/tp/frame.png";

  /* Widget boundaries as fractions of the canvas width. */
  var PARTS = [
    { key: "watchlist",    a: 0.000, b: 0.118, label: "Watchlist",
      note: "9 scrips across 5 lists" },
    { key: "chart",        a: 0.118, b: 0.541, label: "Strategy Chart",
      note: "draw on it, trade from it" },
    { key: "optionchain",  a: 0.541, b: 0.812, label: "Option Chain",
      note: "4 modes · OI, PCR, DTE" },
    { key: "contributors", a: 0.812, b: 1.000, label: "Index Contributors",
      note: "what is moving the index" }
  ];

  function heroRow() {
    var h1 = document.querySelector("h1");
    if (!h1 || !/Trade Pro/i.test(h1.textContent)) return null;
    var wrap = h1.parentElement;
    return wrap ? wrap.querySelector("div.flex.flex-row") : null;
  }

  /* --- Section 1: secondary CTA + proof line ------------------------------ */
  function section1() {
    var row = heroRow();
    if (!row || row.dataset.improved) return;

    /* An anchor, not a button. This navigates, so it has to BE a link: a button
       with a click handler cannot be middle-clicked, cannot be opened in a new tab
       from the context menu, gives assistive tech the wrong role, and is invisible
       to crawlers. The href does the navigating -- no JS handler needed. */
    var launch = document.createElement("a");
    launch.href = "https://login.indiabullssecurities.com/";
    launch.className =
      "font-noto border border-[var(--global-text-2)]/35 hover:border-[var(--global-text-2)]/70 " +
      "text-[var(--global-text-2)] px-4 md:px-5 lg:px-6 py-3 cursor-pointer rounded-full " +
      "text-sm font-medium transition flex justify-center items-center gap-2 bg-transparent tp-nowrap";
    launch.textContent = "Launch Trade Pro";
    var arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    launch.appendChild(arrow);
    row.appendChild(launch);

    row.querySelectorAll("button").forEach(function (b) {
      b.style.whiteSpace = "nowrap";
    });

    var proof = document.createElement("p");
    proof.className =
      "font-noto text-xs md:text-sm text-[var(--global-text-13)] mt-1 opacity-80 w-full " +
      "text-center sm:text-left";
    proof.textContent = "₹11 flat per executed order";
    row.parentElement.insertBefore(proof, row.nextSibling);

    row.dataset.improved = "s1";
  }

  /* --- Section 1b: the workspace, inside the monitor ---------------------- */
  function heroVisual() {
    var h1 = document.querySelector("h1");
    if (!h1 || !/Trade Pro/i.test(h1.textContent)) return;
    var img = document.querySelector('img[alt="TradePro Terminal"]');
    if (!img) return;
    var holder = img.parentElement;
    if (!holder || holder.dataset.improved) return;

    // the bleed must be clipped by the hero row, not by a scrollable ancestor
    var row = holder.closest("div.flex");
    while (row && !/flex-row/.test(row.className) && row.parentElement) {
      row = row.parentElement.closest("div.flex");
    }
    if (row) row.classList.add("tp-clip");

    if (img.parentNode) img.parentNode.removeChild(img);
    var zig = holder.querySelector('img[src*="zigzag"]');
    if (zig && zig.parentNode) zig.parentNode.removeChild(zig);
    var baner = holder.querySelector('img[src*="tradepro-image-v3"]');
    if (baner && baner.parentNode) baner.parentNode.removeChild(baner);

    var stage = el("div", "tp-stage");
    var device = el("div", "tp-device");
    var screen = el("div", "tp-screen");
    screen.style.setProperty("--tp-src", "url(" + CANVAS + ")");

    screen.appendChild(el("div", "tp-part tp-chrome"));

    var tag = el("div", "tp-tag");
    PARTS.forEach(function (p) {
      var w = el("div", "tp-part tp-w tp-" + p.key);
      w.style.left = (p.a * 100) + "%";
      w.style.width = ((p.b - p.a) * 100) + "%";
      w.addEventListener("mouseenter", function () { focus(p); });
      w.addEventListener("mouseleave", blur);
      screen.appendChild(w);
    });
    screen.appendChild(tag);

    // The curved bezel, back on top of the glass. aria-hidden and pointer-events
    // none in CSS: it is pure decoration and must never eat a widget hover.
    var frame = new Image();
    frame.src = FRAME;
    frame.alt = "";
    frame.className = "tp-frame";
    frame.setAttribute("aria-hidden", "true");

    device.appendChild(screen);
    device.appendChild(frame);
    stage.appendChild(device);

    var legend = el("div", "tp-legend");
    PARTS.forEach(function (p) {
      var c = el("button", "tp-chip");
      c.type = "button";
      c.textContent = p.label;
      c.addEventListener("mouseenter", function () { focus(p, c); });
      c.addEventListener("mouseleave", blur);
      c.addEventListener("focus", function () { focus(p, c); });
      c.addEventListener("blur", blur);
      legend.appendChild(c);
    });
    stage.appendChild(legend);
    holder.appendChild(stage);

    function focus(p, chip) {
      var w = screen.querySelector(".tp-" + p.key);
      if (!w) return;
      screen.classList.add("tp-dim");
      screen.querySelectorAll(".tp-w").forEach(function (n) { n.classList.remove("tp-on"); });
      w.classList.add("tp-on");
      legend.querySelectorAll(".tp-chip").forEach(function (n) { n.classList.remove("tp-active"); });
      if (chip) chip.classList.add("tp-active");

      tag.innerHTML = "<b>" + p.label + "</b> <span>— " + p.note + "</span>";
      tag.style.top = "calc(10.8% + 12px)";
      // Clamp against the pill's measured width, not a guessed fraction — the
      // labels differ in length, so a fixed clamp clips the long ones.
      tag.style.left = "0px";
      var sw = screen.clientWidth;
      var half = tag.offsetWidth / 2;
      var want = ((p.a + p.b) / 2) * sw;
      tag.style.left = Math.round(
        Math.min(Math.max(want, half + 10), sw - half - 10)) + "px";
      tag.classList.add("tp-show");
    }

    function blur() {
      screen.classList.remove("tp-dim");
      screen.querySelectorAll(".tp-w").forEach(function (n) { n.classList.remove("tp-on"); });
      legend.querySelectorAll(".tp-chip").forEach(function (n) { n.classList.remove("tp-active"); });
      tag.classList.remove("tp-show");
    }

    function size() {
      var w = screen.clientWidth;
      if (!w) return;
      var h = w * 829 / 1910;
      screen.querySelectorAll(".tp-part").forEach(function (n) {
        n.style.backgroundSize = w + "px " + h + "px";
      });
      PARTS.forEach(function (p) {
        var n = screen.querySelector(".tp-" + p.key);
        if (n) n.style.backgroundPosition = (-p.a * w) + "px " + (-0.108 * h) + "px";
      });
    }
    size();
    window.addEventListener("resize", size);

    // size() writes background-size in PIXELS off one clientWidth reading, so any
    // later change to the screen box leaves the slices scaled to a stale width and
    // each one repeats a sliver of its neighbour -- that is the doubled lettering
    // ("Option Chution Chain"). A window resize was the only thing that recomputed
    // it, and none fires when the box changes for other reasons: hero-enhance.css
    // arrives by injection after this runs, and dropping the bezel just widened the
    // screen from 95.5% to 100%. Observe the element itself so cause does not
    // matter.
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(size).observe(screen);
    }

    holder.dataset.improved = "s1b";
    requestAnimationFrame(function () {
      screen.classList.add("tp-in");
      // Hand over to the hover styles only once the entry run is done, so the
      // stagger delays can never apply to a hover.
      setTimeout(function () { screen.classList.add("tp-ready"); }, 1150);
    });
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    n.className = cls;
    return n;
  }

  var STEPS = [section1, heroVisual];

  function apply() {
    STEPS.forEach(function (fn) {
      try { fn(); } catch (e) { console.warn("improve step failed", e); }
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
