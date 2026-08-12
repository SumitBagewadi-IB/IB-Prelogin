/* Section 4: the closing feature marquee, re-pointed at Trade Pro.
 *
 * The block shipped as "Why Indiabulls Securities Web?" with eight generic
 * broker benefits -- instant customer service, super-fast execution, ergonomic
 * design. On a page whose h1 is "Trade Pro: your terminal, your layout" that
 * closed the argument by changing the subject, so the copy is re-pointed at
 * the terminal itself. Every line below is evidenced by the screenshots in
 * tradepro-shots/; nothing here is a claim the shots do not show.
 *
 * ON THE SIXTEEN TILES: the marquee renders the eight-tile list TWICE so the
 * loop has no visible seam -- that is the technique, not a duplication bug.
 * (An earlier note in SECTION3-SPEC.md called it one. It was wrong.) So this
 * walks the nodes modulo the tile count and leaves the doubling alone. Do not
 * "fix" it by deleting the second copy: the marquee will visibly jump.
 *
 * This mutates the page's own markup in place rather than rebuilding it. The
 * animation, the edge gradients, the tile chrome and the CTA are all the
 * page's, and all keep working untouched -- only text and icons change.
 */
(function () {
  "use strict";

  var HEADING = "Why Trade Pro?";
  var LEAD = "One terminal for the whole trade: pick a layout, read the " +
             "chain, and send the order without leaving the chart.";

  /* Lucide 24x24 stroke icons, matching the set the page already uses. */
  var ICONS = {
    "layout-grid":
      '<rect width="7" height="7" x="3" y="3" rx="1"/>' +
      '<rect width="7" height="7" x="14" y="3" rx="1"/>' +
      '<rect width="7" height="7" x="14" y="14" rx="1"/>' +
      '<rect width="7" height="7" x="3" y="14" rx="1"/>',
    "columns-3":
      '<rect width="18" height="18" x="3" y="3" rx="2"/>' +
      '<path d="M9 3v18"/><path d="M15 3v18"/>',
    "candlestick-chart":
      '<path d="M9 5v4"/><rect width="4" height="6" x="7" y="9" rx="1"/>' +
      '<path d="M9 15v2"/><path d="M17 3v2"/>' +
      '<rect width="4" height="8" x="15" y="5" rx="1"/>' +
      '<path d="M17 13v3"/><path d="M3 3v18h18"/>',
    "crosshair":
      '<circle cx="12" cy="12" r="10"/>' +
      '<line x1="22" x2="18" y1="12" y2="12"/>' +
      '<line x1="6" x2="2" y1="12" y2="12"/>' +
      '<line x1="12" x2="12" y1="6" y2="2"/>' +
      '<line x1="12" x2="12" y1="22" y2="18"/>',
    "layout-dashboard":
      '<rect width="7" height="9" x="3" y="3" rx="1"/>' +
      '<rect width="7" height="5" x="14" y="3" rx="1"/>' +
      '<rect width="7" height="9" x="14" y="12" rx="1"/>' +
      '<rect width="7" height="5" x="3" y="16" rx="1"/>',
    "line-chart":
      '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    "trending-up":
      '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>' +
      '<polyline points="16 7 22 7 22 13"/>',
    "list":
      '<line x1="8" x2="21" y1="6" y2="6"/>' +
      '<line x1="8" x2="21" y1="12" y2="12"/>' +
      '<line x1="8" x2="21" y1="18" y2="18"/>' +
      '<line x1="3" x2="3.01" y1="6" y2="6"/>' +
      '<line x1="3" x2="3.01" y1="12" y2="12"/>' +
      '<line x1="3" x2="3.01" y1="18" y2="18"/>'
  };

  /* The <p> is line-clamp-2 inside a 320-400px tile, so descriptions are kept
   * to roughly the length of the ones they replace. */
  var TILES = [
    { icon: "layout-grid", t: "Six starting layouts",
      d: "Open on a ready-made workspace, or take the empty grid." },
    { icon: "columns-3", t: "The chain, four ways",
      d: "Price, Greeks, Straddle and OI over one live tick." },
    { icon: "candlestick-chart", t: "Trade from the chart",
      d: "One toolbar switch turns the chart into the order surface." },
    { icon: "crosshair", t: "The ticket, on the chart",
      d: "Limit, take profit and stop loss staged at the price axis." },
    { icon: "layout-dashboard", t: "Six charts, one screen",
      d: "Tile six instruments, each with the full drawing toolset." },
    { icon: "line-chart", t: "Built for the options desk",
      d: "Combined OI, strategy chart and multistrike OI beside the chain." },
    { icon: "trending-up", t: "Futures analytics",
      d: "Future buildup, screeners and long or short signals." },
    { icon: "list", t: "Watchlists up front",
      d: "Three watchlists, searchable, alongside a live chart." }
  ];

  /* Matches the new heading too, so the section is still findable after the
   * first pass has run and React has not re-rendered it away. */
  function findSection() {
    var hs = document.querySelectorAll("h2");
    for (var i = 0; i < hs.length; i++) {
      if (/Why Indiabulls Securities Web|Why Trade Pro/i.test(hs[i].textContent)) {
        return hs[i].closest("section");
      }
    }
    return null;
  }

  function build() {
    var sec = findSection();
    if (!sec) return;

    var h2 = sec.querySelector("h2");
    var mc = sec.querySelector(".marquee-container");
    if (!h2 || !mc || !mc.children.length) return;

    // cheap early-out; also stops our own mutations re-triggering the observer
    if (sec.dataset.s4 === "on" && h2.textContent === HEADING) return;

    h2.textContent = HEADING;

    if (!sec.querySelector(".s4-lead")) {
      var lead = document.createElement("p");
      lead.className = "s4-lead font-noto text-[14px] md:text-[16px] " +
        "lg:text-[18px] text-[var(--global-text-13)] leading-relaxed " +
        "mt-4 max-w-[760px] mx-auto";
      lead.textContent = LEAD;
      h2.parentNode.insertBefore(lead, h2.nextSibling);
    }

    for (var i = 0; i < mc.children.length; i++) {
      var t = TILES[i % TILES.length];
      var node = mc.children[i];
      var h3 = node.querySelector("h3");
      var p = node.querySelector("p");
      var svg = node.querySelector("svg");
      if (h3) h3.textContent = t.t;
      if (p) p.textContent = t.d;
      if (svg && ICONS[t.icon]) {
        // SVG className is an SVGAnimatedString -- setAttribute, not .className
        svg.setAttribute("class",
          "lucide lucide-" + t.icon + " w-8 h-8 text-[#0091d3]");
        svg.innerHTML = ICONS[t.icon];
      }
    }

    sec.dataset.s4 = "on";
  }

  function safeBuild() {
    try { build(); } catch (e) { console.warn("s4 failed", e); }
  }

  /* Same timing contract as s2 and s3: `load` fires late here and React can
   * re-render afterwards, which would restore the original copy. Poll for a
   * while and keep watching. */
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
