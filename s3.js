/* Section 3: the layout gallery.
 *
 * Take 2. The first pass cropped layout-building.png into six separate tiles
 * and laid them out as cards. The brief was to keep the gallery in one piece,
 * so this ships the screenshot uncut -- a single 2438x1134 image, title strip
 * trimmed off the top because the page renders that line as real <h2> text --
 * and moves the "which one is this" job onto a spotlight that irises down onto
 * whichever preset you point at.
 *
 * RECTS are percentages of that image, derived from lit-pixel band edges in
 * imp_s3_spotlight.py (session scratchpad), which re-measures and asserts them
 * on every run. If the screenshot is ever re-captured, re-run that script and
 * paste its RECTS line in here; do not nudge these numbers by eye.
 *
 * Names and panel lists are Vision-OCR reads off the same shot, not invented.
 * See tradepro-shots/SECTION3-SPEC.md.
 */
(function () {
  "use strict";

  var SRC = "/tp/s3/gallery.webp";
  var RATIO_W = 2438, RATIO_H = 1134;

  /* image order: left to right, top row then bottom */
  var RECTS = [
    { x: 3.897, y: 2.734, w: 27.933, h: 43.651 },
    { x: 35.767, y: 2.734, w: 27.933, h: 43.651 },
    { x: 67.637, y: 2.734, w: 27.933, h: 43.651 },
    { x: 3.897, y: 55.115, w: 27.933, h: 43.386 },
    { x: 35.767, y: 55.115, w: 27.933, h: 43.386 },
    { x: 67.637, y: 55.115, w: 27.933, h: 43.386 }
  ];

  var PRESETS = [
    { name: "START FROM SCRATCH",
      what: "An empty grid. Add the panels you want, where you want them.",
      panels: [] },
    { name: "INDIABULLS ORIGINALS",
      what: "The house layout: watchlists, chart and chain across the top, " +
            "positions and running P&L below.",
      panels: ["Watchlist 1 2 3", "Chart", "Option Chain", "Positions"] },
    { name: "WATCHLIST DRIVEN",
      what: "Lists first. Three watchlists up front with a single chart " +
            "alongside.",
      panels: ["Watchlist 1 2 3", "Chart"] },
    { name: "INDIABULLS CHARTS",
      what: "Six charts at once, tiled three across - one screen, six " +
            "instruments.",
      panels: ["Chart 1", "Chart 2", "Chart 3", "Chart 4", "Chart 5", "Chart 6"] },
    { name: "OPTION ANALYSER",
      what: "Built for the options desk: chain and combined OI up top, " +
            "strategy chart and multistrike OI beneath.",
      panels: ["Chart", "Combine OI", "Option Chain", "Strategy Chart",
               "Multistrike OI"] },
    { name: "FUTURE ANALYSER",
      what: "Futures equivalent: buildup and watchlists across the top, " +
            "screeners and long/short below.",
      panels: ["Chart", "Future Buildup", "Watchlist 1 2 3",
               "Future Screeners"] }
  ];

  var IDLE = {
    name: "SIX WAYS TO START",
    what: "Pick a layout to bring it forward. Every one of them is a starting " +
          "point - panels move, resize and swap once you are inside.",
    panels: []
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* The gallery sits directly under the hero. It is the payoff for the h1's
   * promise -- "your terminal, your layout" -- so it reads before the option
   * chain rather than after it. Anchored on the h1, which is the one heading
   * on this page guaranteed to be unique (verified: exactly one h1). */
  function heroSection() {
    var h1 = document.querySelector("h1");
    return h1 ? h1.closest("section") : null;
  }

  function build() {
    if (document.getElementById("s3")) return;
    var hero = heroSection();
    if (!hero || !hero.parentNode) return;

    var section = document.createElement("section");
    section.id = "s3";
    section.className = "w-full bg-[var(--global-bg-2)] py-4 md:py-6";

    var pad = el("div", "px-4 sm:px-6 md:px-12 lg:px-[79px] mx-auto");
    var wrap = el("div", "s3");

    var head = el("div", "s3-head");
    head.appendChild(el("h2",
      "text-[24px] md:text-[40px] lg:text-[48px] font-bold " +
      "text-[var(--global-text-2)] manrope-700 md:manrope-800 leading-tight",
      "Start building your layout"));
    head.appendChild(el("p",
      "s3-lead font-noto text-[14px] md:text-[16px] lg:text-[18px] " +
      "leading-relaxed",
      "Six workspaces are ready the moment you open the terminal, or " +
      "take the empty grid and lay it out yourself."));
    wrap.appendChild(head);

    /* ---- stage: one image, one spotlight, six hit targets ---- */
    var stage = el("div", "s3-stage");
    var scroll = el("div", "s3-scroll");
    var rail = el("div", "s3-rail");

    var gal = document.createElement("img");
    gal.className = "s3-gal";
    gal.src = SRC;
    gal.width = RATIO_W;
    gal.height = RATIO_H;
    gal.loading = "lazy";
    gal.decoding = "async";
    gal.alt = "The Trade Pro layout gallery: " +
      PRESETS.map(function (p) { return p.name.toLowerCase(); }).join(", ") + ".";
    rail.appendChild(gal);

    var spot = el("div", "s3-spot");
    rail.appendChild(spot);

    /* ---- readout ---- */
    var read = el("div", "s3-read");
    read.id = "s3-read";
    read.setAttribute("role", "tabpanel");
    read.setAttribute("aria-live", "polite");

    var top = el("div", "s3-read-top");
    var idx = el("span", "s3-idx");
    var name = el("h3", "s3-read-name");
    top.appendChild(idx);
    top.appendChild(name);
    var what = el("p", "s3-read-what");
    var chips = el("div", "s3-panels");
    read.appendChild(top);
    read.appendChild(what);
    read.appendChild(chips);

    /* ---- state ----
     * Hover previews, click pins. Pinning is not a flourish: on touch there is
     * no hover, so tap-to-pin is the only way in, and on a mouse it stops the
     * spotlight evaporating the moment you move to read the text below. */
    var pinned = -1, hits = [];

    function paint(i) {
      var p = i < 0 ? IDLE : PRESETS[i];
      idx.textContent = i < 0 ? "" : ("0" + (i + 1) + " / 0" + PRESETS.length);
      name.textContent = p.name;
      what.textContent = p.what;
      chips.innerHTML = "";
      p.panels.forEach(function (n) {
        chips.appendChild(el("span", "s3-panel", n));
      });

      if (i < 0) {
        // iris back out to the full frame; the scrim then falls entirely
        // outside the rail's clipped edge, so nothing is dimmed
        rail.style.setProperty("--sx", "0%");
        rail.style.setProperty("--sy", "0%");
        rail.style.setProperty("--sw", "100%");
        rail.style.setProperty("--sh", "100%");
        stage.classList.remove("is-on");
      } else {
        var r = RECTS[i];
        rail.style.setProperty("--sx", r.x + "%");
        rail.style.setProperty("--sy", r.y + "%");
        rail.style.setProperty("--sw", r.w + "%");
        rail.style.setProperty("--sh", r.h + "%");
        stage.classList.add("is-on");
      }

      hits.forEach(function (b, j) {
        b.setAttribute("aria-selected", j === i ? "true" : "false");
      });
    }

    // the rail overflows its scroller below ~900px, so keep the lit cell visible
    function reveal(i) {
      if (i < 0 || scroll.scrollWidth <= scroll.clientWidth + 1) return;
      var b = hits[i];
      var want = b.offsetLeft + b.offsetWidth / 2 - scroll.clientWidth / 2;
      want = Math.max(0, Math.min(want, scroll.scrollWidth - scroll.clientWidth));
      var smooth = !window.matchMedia ||
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (scroll.scrollTo) scroll.scrollTo({ left: want, behavior: smooth ? "smooth" : "auto" });
      else scroll.scrollLeft = want;
    }

    function show(i) { paint(i); }
    function release() { paint(pinned); }

    var strip = el("div", "s3-hits");
    RECTS.forEach(function (r, i) {
      var b = el("button", "s3-hit");
      b.type = "button";
      b.style.setProperty("--x", r.x + "%");
      b.style.setProperty("--y", r.y + "%");
      b.style.setProperty("--w", r.w + "%");
      b.style.setProperty("--h", r.h + "%");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", "false");
      b.setAttribute("aria-controls", "s3-read");
      b.setAttribute("aria-label", PRESETS[i].name + " layout");
      b.tabIndex = i === 0 ? 0 : -1;

      b.addEventListener("mouseenter", function () { show(i); });
      b.addEventListener("focus", function () { show(i); reveal(i); });
      b.addEventListener("click", function () {
        pinned = pinned === i ? -1 : i;
        paint(pinned < 0 ? -1 : i);
        reveal(pinned);
      });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 :
                e.key === "ArrowDown" ? 3 : e.key === "ArrowUp" ? -3 : 0;
        if (d) {
          e.preventDefault();
          var n = (i + d + RECTS.length) % RECTS.length;
          hits.forEach(function (h, j) { h.tabIndex = j === n ? 0 : -1; });
          hits[n].focus();
          return;
        }
        if (e.key === "Escape" && pinned >= 0) { pinned = -1; paint(-1); }
      });

      hits.push(b);
      strip.appendChild(b);
    });
    rail.appendChild(strip);

    rail.addEventListener("mouseleave", release);

    scroll.appendChild(rail);
    stage.appendChild(scroll);
    wrap.appendChild(stage);

    var hint = el("p", "s3-hint s3-hint-scroll",
      "Scroll the gallery sideways to see all six.");
    wrap.appendChild(hint);
    wrap.appendChild(read);

    paint(-1);

    pad.appendChild(wrap);
    section.appendChild(pad);
    hero.parentNode.insertBefore(section, hero.nextSibling);
  }

  function safeBuild() {
    try { build(); } catch (e) { console.warn("s3 failed", e); }
  }

  /* Same timing trap as Section 2: `load` fires late on this page and React
   * can re-render afterwards, so poll for a while and also watch for the
   * anchor being swapped out from under us. */
  function start() {
    safeBuild();
    var tries = 0;
    var iv = setInterval(function () {
      safeBuild();
      if (++tries > 25) clearInterval(iv);
    }, 400);

    if (typeof MutationObserver !== "function") return;
    var pending = 0;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = setTimeout(function () { pending = 0; safeBuild(); }, 120);
    });
    obs.observe(document.querySelector("main") || document.body,
                { childList: true, subtree: true });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
