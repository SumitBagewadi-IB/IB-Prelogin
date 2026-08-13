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

/* ========== MEGA MENU: INLINED FOR GUARANTEED SYNC EXECUTION ========== */
(function () {
  "use strict";

  /* Inject mega-menu CSS */
  if (!document.querySelector("link[href*='mega-menu.css']")) {
    var style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "/mega-menu.css";
    if (document.head) document.head.appendChild(style);
  }

  var MENU_DATA = {
    products: {
      title: "Products",
      icon: "📦",
      items: [
        { label: "Trade Pro", desc: "Advanced widget-based terminal", icon: "⚡", href: "/tradepro-terminal", featured: true, category: "trading" },
        { label: "Web Trading Platform", desc: "Full-featured web trader", icon: "🌐", href: "/web-trading", category: "trading" },
        { label: "Mobile Trading App", desc: "Trade anywhere, anytime", icon: "📱", href: "/mobile-app", category: "mobile" },
        { label: "Trade from Charts", desc: "Execute directly from TradingView", icon: "📈", href: "/trade-from-charts", category: "trading" },
        { label: "TradingView Integration", desc: "Advanced charting & analysis", icon: "🔬", href: "/tradingview", new: true, category: "analysis" }
      ]
    },
    markets: {
      title: "Markets",
      icon: "💹",
      items: [
        { label: "Equities", desc: "Stocks & indices trading", icon: "📊", href: "/equities", category: "markets" },
        { label: "Options", desc: "Options chain & strategies", icon: "🎯", href: "/options", featured: true, category: "derivatives" },
        { label: "Futures & Commodities", desc: "Futures, forex & commodities", icon: "🏗️", href: "/futures", category: "derivatives" },
        { label: "IPO", desc: "Initial public offerings", icon: "🚀", href: "/ipo", new: true, category: "markets" },
        { label: "Mutual Funds", desc: "Invest in funds", icon: "🎁", href: "/mutual-funds", category: "invest" }
      ]
    },
    services: {
      title: "Services",
      icon: "⚙️",
      items: [
        { label: "Advisory", desc: "Expert investment advice", icon: "👨‍💼", href: "/advisory", category: "services" },
        { label: "Algo Trading", desc: "Automated trading strategies", icon: "🤖", href: "/algo-trading", new: true, category: "advanced" },
        { label: "API Access", desc: "XTS, PIB & custom APIs", icon: "🔌", href: "/api", category: "developer" },
        { label: "Portfolio Management", desc: "Manage your investments", icon: "📂", href: "/portfolio", category: "services" },
        { label: "Premium Support", desc: "24/7 dedicated support", icon: "🎧", href: "/support", category: "services" }
      ]
    }
  };

  var PROMO = { title: "Mobile App", desc: "Trade on iOS & Android with our award-winning app", imageUrl: "https://image.indiabullssecurities.com/prelogin/assets/images/downloadqr.jpeg", ctaText: "Download", ctaLink: "#" };

  var activeMenu = null;

  function createMenuHTML(menuData) {
    var content = document.createElement("div");
    content.className = "mega-menu-content";

    var searchBox = document.createElement("div");
    searchBox.className = "mega-menu-search";
    searchBox.innerHTML = '<input type="text" class="mega-menu-search-input" placeholder="Search products & services..." aria-label="Search menu">';
    content.appendChild(searchBox);

    Object.keys(menuData).forEach(function(key) {
      var section = menuData[key];
      var column = document.createElement("div");
      column.className = "mega-menu-column";

      var title = document.createElement("h3");
      title.className = "mega-menu-column-title";
      title.innerHTML = '<span class="mega-menu-column-icon">' + section.icon + '</span>' + section.title;
      column.appendChild(title);

      section.items.forEach(function(item) {
        var itemEl = document.createElement("a");
        itemEl.href = item.href;
        itemEl.className = "mega-menu-item";
        itemEl.tabIndex = 0;
        itemEl.role = "menuitem";
        itemEl.dataset.searchTerms = (item.label + " " + item.desc + " " + item.category).toLowerCase();
        itemEl.dataset.category = item.category;

        var badge = "";
        if (item.featured) badge = '<span class="mega-menu-badge featured">⭐ Featured</span>';
        else if (item.new) badge = '<span class="mega-menu-badge new">✨ New</span>';

        itemEl.innerHTML = '<div class="mega-menu-item-icon">' + item.icon + '</div><div class="mega-menu-item-text"><div class="mega-menu-item-label">' + item.label + '</div><div class="mega-menu-item-description">' + item.desc + '</div></div>' + badge;

        itemEl.addEventListener("click", function(e) { onItemClick(e); });
        itemEl.addEventListener("keydown", function(e) { onItemKeydown(e); });
        column.appendChild(itemEl);
      });

      content.appendChild(column);
    });

    var promo = document.createElement("div");
    promo.className = "mega-menu-promo";
    promo.innerHTML = '<img src="' + PROMO.imageUrl + '" alt="' + PROMO.title + '" class="mega-menu-promo-image"><div class="mega-menu-promo-text"><div class="mega-menu-promo-title">' + PROMO.title + '</div><div class="mega-menu-promo-desc">' + PROMO.desc + '</div><a href="' + PROMO.ctaLink + '" class="mega-menu-promo-cta">' + PROMO.ctaText + ' →</a></div>';
    content.appendChild(promo);

    var hint = document.createElement("div");
    hint.className = "mega-menu-keyboard-hint";
    hint.textContent = "Use ↑↓ arrows to navigate • Esc to close";
    content.appendChild(hint);

    return content;
  }

  function openMenu(trigger) {
    closeAllMenus();
    var menuId = trigger.getAttribute("aria-controls");
    var menuType = menuId.replace("-menu", "");
    var menuData = MENU_DATA[menuType];

    if (!menuData) return;

    var container = document.getElementById(menuId);
    if (!container) {
      container = document.createElement("div");
      container.id = menuId;
      container.className = "mega-menu-container";
      container.role = "menu";
      container.appendChild(createMenuHTML(menuData));
      trigger.parentElement.appendChild(container);

      var searchInput = container.querySelector(".mega-menu-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", function(e) { renderSearchResults(e.target.value); });
        searchInput.addEventListener("keydown", function(e) { if (e.key === "Escape") closeAllMenus(); });
      }
    }

    activeMenu = container;
    trigger.setAttribute("aria-expanded", "true");
    container.classList.add("active");

    setTimeout(function() {
      var firstItem = container.querySelector(".mega-menu-item");
      if (firstItem) firstItem.focus();
    }, 100);
  }

  function closeAllMenus() {
    document.querySelectorAll(".mega-menu-container").forEach(function(m) { m.classList.remove("active"); });
    document.querySelectorAll("[aria-haspopup='true']").forEach(function(t) { t.setAttribute("aria-expanded", "false"); });
    activeMenu = null;
  }

  function onItemClick(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    closeAllMenus();
    window.location.href = e.currentTarget.href;
  }

  function onItemKeydown(e) {
    if (!activeMenu) return;
    var items = [].slice.call(activeMenu.querySelectorAll(".mega-menu-item"));
    var idx = items.indexOf(e.currentTarget);

    if (e.key === "ArrowDown") { e.preventDefault(); if (items[idx + 1]) items[idx + 1].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (items[idx - 1]) items[idx - 1].focus(); }
    else if (e.key === "Enter") { e.preventDefault(); e.currentTarget.click(); }
    else if (e.key === "Escape") { e.preventDefault(); closeAllMenus(); }
  }

  function renderSearchResults(query) {
    if (!activeMenu) return;
    var allItems = activeMenu.querySelectorAll(".mega-menu-item");

    if (!query) {
      allItems.forEach(function(item) { item.style.display = ""; });
      activeMenu.querySelector(".mega-menu-content").classList.remove("search-active");
      return;
    }

    var filtered = [].slice.call(allItems).filter(function(item) {
      return (item.dataset.searchTerms || "").includes(query.toLowerCase());
    });

    if (filtered.length === 0) {
      allItems.forEach(function(item) { item.style.display = "none"; });
      var noResults = document.createElement("div");
      noResults.className = "mega-menu-no-results";
      noResults.innerHTML = '<div class="mega-menu-no-results-text">No results for "<strong>' + query + '</strong>"</div><div class="mega-menu-no-results-hint">Try different keywords</div>';
      var oldNoResults = activeMenu.querySelector(".mega-menu-no-results");
      if (oldNoResults) oldNoResults.remove();
      activeMenu.querySelector(".mega-menu-content").appendChild(noResults);
    } else {
      var oldNoResults = activeMenu.querySelector(".mega-menu-no-results");
      if (oldNoResults) oldNoResults.remove();
      allItems.forEach(function(item) {
        item.style.display = filtered.includes(item) ? "" : "none";
      });
    }
  }

  function init() {
    var triggers = document.querySelectorAll("[aria-controls='products-menu'], [aria-controls='markets-menu'], [aria-controls='more-menu']");

    triggers.forEach(function(trigger) {
      trigger.removeEventListener("click", function(e) { onMenuTriggerClick(e); });
      trigger.addEventListener("click", function(e) {
        if (activeMenu && trigger.getAttribute("aria-expanded") === "true") closeAllMenus();
        else openMenu(trigger);
      });

      trigger.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openMenu(trigger);
        } else if (e.key === "Escape") closeAllMenus();
      });
    });

    document.addEventListener("click", function(e) {
      if (!e.target.closest("[aria-haspopup='true']") && !e.target.closest(".mega-menu-container")) {
        closeAllMenus();
      }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") closeAllMenus();
    });

    console.log("✅ Mega Menu Premium initialized (inlined)");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 100);
  }
})();
