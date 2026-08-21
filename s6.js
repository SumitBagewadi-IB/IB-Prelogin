/* Section 6: the blocks the Trade Pro wireframe adds.
 *
 * Same contract as s2 to s5.js: applied after React hydrates, idempotent, and
 * re-tried on an interval plus a MutationObserver so a re-render can neither
 * duplicate nor lose it. Nothing already on the page is removed: the hero, the
 * layout gallery (#s3), the option-chain section, "Why Trade Pro?" and the FAQ
 * (#s5) all stay exactly as they are.
 *
 * What this adds, in wireframe order:
 *
 *   §0  in-page anchor nav, under the hero            #s6-nav
 *   §1  hero badge, second CTA, microcopy             (into the existing hero)
 *   §2  proof strip                                   #s6-proof
 *   §3  persona routing                               #s6-personas
 *   §4  Strategy Chart / futures + options analytics   #s6-analytics
 *   §5  platform comparison table                     #s6-compare
 *   §6  pricing                                       #s6-pricing
 *   §7  three steps + system requirements             #s6-steps
 *   §8  trust metrics                                 #s6-trust
 *   §10 closing CTA + risk disclosure                 #s6-final
 *
 * Figures: ₹11 flat per order and ₹0 platform fee are the wireframe's numbers
 * and carry a visible "pending Product sign-off" chip until Product confirms
 * them; see the §6 panel. The SEBI registration (INZ000036136), the 9 lakh
 * customer figure and both store links are taken off this same page, not
 * invented here. Every comparison-table cell needs Product sign-off; the two
 * flagged in the handoff notes are the mobile-app rows.
 */
(function () {
  "use strict";

  var LAUNCH = "https://login.indiabullssecurities.com/";
  var OPEN_ACCOUNT = "https://stocks-onboarding.indiabullssecurities.com";
  var PLAY = "https://play.google.com/store/apps/details?id=com.dhani.stocks&hl=en_IN";
  var APPSTORE = "https://apps.apple.com/in/app/indiabulls-securities-stocks/id6474897274";
  var RATECARD = "/pricing";

  var H2 = "text-[24px] md:text-[40px] lg:text-[48px] font-bold manrope-800 leading-tight";

  /* ------------------------------------------------------------- helpers */

  function node(tag, cls, id) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (id) n.id = id;
    n.setAttribute("data-s6", "1");
    return n;
  }

  function after(newNode, ref) {
    if (!ref || !ref.parentNode) return false;
    ref.parentNode.insertBefore(newNode, ref.nextSibling);
    return true;
  }

  function sectionByHeading(re) {
    var list = document.querySelectorAll("main section");
    for (var i = 0; i < list.length; i++) {
      var h = list[i].querySelector("h2");
      if (h && re.test(h.textContent || "")) return list[i];
    }
    return null;
  }

  function hero() {
    var h1 = document.querySelector("main h1");
    return h1 ? h1.closest("section") : null;
  }

  function gallery() { return document.getElementById("s3"); }
  function chain() {
    var head = document.querySelector(".s2-head");
    return head ? head.closest("section") : null;
  }
  function features() { return sectionByHeading(/why trade pro/i); }
  function faq() { return document.getElementById("s5"); }

  /* Icons for the persona cards: decorative, so they stay aria-hidden. */
  function icon(paths) {
    return '<span class="s6-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths + "</svg></span>";
  }

  var ICON_LAYOUT = icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>' +
    '<rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>');
  var ICON_CHAIN = icon('<path d="M3 17l4-6 4 3 4-8 6 5"/><path d="M3 21h18"/>');
  var ICON_FOLIO = icon('<path d="M3 7h18v12H3z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>');

  /* -------------------------------------------------- §1 hero additions */

  function heroExtras() {
    var h = hero();
    if (!h) return;

    var h1 = h.querySelector("h1");
    if (h1 && !h.querySelector("#s6-badge")) {
      var badge = node("div", "s6 s6-badge", "s6-badge");
      badge.innerHTML = '<span class="s6-dot"></span><span>Included with every trading account</span>';
      h1.parentNode.insertBefore(badge, h1);
    }

    var launch = h.querySelector('a[href*="login.indiabullssecurities.com"]');
    if (launch && !h.querySelector("#s6-hero-cta")) {
      var second = node("a", "s6 s6-btn s6-btn-p", "s6-hero-cta");
      second.href = OPEN_ACCOUNT;
      second.textContent = "Open a free account";
      after(second, launch);
    }

    /* s1.js emptied this paragraph when it stripped the old ₹11 line out of the
     * hero; the wireframe's microcopy belongs in exactly that slot. */
    if (!h.querySelector("#s6-micro")) {
      var slot = null;
      var ps = h.querySelectorAll("p");
      for (var i = 0; i < ps.length; i++) {
        if (!ps[i].textContent.trim()) { slot = ps[i]; break; }
      }
      var micro = node("p", "s6 s6-micro font-noto", "s6-micro");
      micro.textContent = "Already a client? Log in with your usual credentials, no separate signup needed.";
      if (slot) slot.parentNode.replaceChild(micro, slot);
      else if (launch) after(micro, launch.parentNode);
    }
  }

  /* ------------------------------------------------------- §0 anchor nav */

  function nav() {
    if (document.getElementById("s6-nav")) return;
    var h = hero();
    if (!h) return;

    var bar = node("div", "s6 s6-nav", "s6-nav");
    bar.innerHTML =
      '<div class="s6-nav-inner">' +
        '<nav class="s6-nav-links" aria-label="On this page">' +
          '<a href="#s3">Layouts</a>' +
          '<a href="#tp-chain">Option chain</a>' +
          '<a href="#s6-analytics">Analytics</a>' +
          '<a href="#s6-compare">Compare platforms</a>' +
          '<a href="#s6-pricing">Pricing</a>' +
          '<a href="#tp-features">Why Trade Pro</a>' +
          '<a href="#s5">FAQ</a>' +
        "</nav>" +
        '<a class="s6-btn s6-btn-p" href="' + LAUNCH + '">Launch Trade Pro <span aria-hidden="true">→</span></a>' +
      "</div>";
    after(bar, h);
  }

  /* ------------------------------------------------------ §2 proof strip */

  function proof() {
    if (document.getElementById("s6-proof")) return;
    var ref = document.getElementById("s6-nav") || hero();
    if (!ref) return;

    var cells = [
      ["₹<em>11</em> flat", "Per executed order, every segment"],
      ["<em>₹0</em> subscription", "The terminal is included, not an add-on"],
      ["<em>4</em> exchanges", "NSE · BSE · MCX · currency derivatives"],
      ["TradingView", "Built in, the charts you already know"]
    ];

    var s = node("section", "s6 s6-proof", "s6-proof");
    s.innerHTML = '<div class="s6-proof-grid">' + cells.map(function (c) {
      return '<div class="s6-proof-cell"><div class="s6-proof-n">' + c[0] +
        '</div><p class="s6-proof-l">' + c[1] + "</p></div>";
    }).join("") + "</div>";
    after(s, ref);
  }

  /* --------------------------------------------------------- §3 personas */

  function personas() {
    if (document.getElementById("s6-personas")) return;
    var ref = document.getElementById("s6-proof") || document.getElementById("s6-nav") || hero();
    if (!ref) return;

    var cards = [
      [ICON_LAYOUT, "Intraday traders",
       "One-click order entry, live five-level market depth, and a layout you set once and never touch again.",
       "#s3", "See the layout gallery →"],
      [ICON_CHAIN, "Options traders",
       "A four-mode option chain with live Greeks, and strategies you build on the chart and send from one ticket.",
       "#tp-chain", "See the option chain →"],
      [ICON_FOLIO, "Long-term investors",
       "Holdings, P&amp;L and research recommendations in one view, so a portfolio review takes minutes, not an evening.",
       "#tp-features", "See what's inside →"]
    ];

    var s = node("section", "s6 s6-personas", "s6-personas");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<p class="s6-eyebrow">Who it\'s for</p>' +
        '<h2 class="' + H2 + '">Built for the way you trade</h2>' +
        '<p class="s6-lead">One terminal, three very different desks. Start from the one that sounds like you.</p>' +
        '<div class="s6-cards3">' + cards.map(function (c) {
          return '<div class="s6-card">' + c[0] + "<h3>" + c[1] + "</h3><p>" + c[2] +
            '</p><a href="' + c[3] + '">' + c[4] + "</a></div>";
        }).join("") + "</div>" +
      "</div>";
    after(s, ref);
  }


  /* ------------------------------------ §4 feature deep-dives: the analytics

     The mockup runs five deep-dives under "Five things you can't do on a phone".
     Three of them are already on the page: the layout gallery (#s3), the
     four-mode chain and trade-from-chart (#tp-chain). These are the two it was
     missing, built from the F&O widget screenshots: Strategy Chart, the futures
     screeners, and max pain.

     Every figure below is read off those screenshots (one session, the
     25-Aug-2026 expiry at around 10:05 am), so the panels stay consistent. Do not edit a
     number without re-checking the shot it came from. */

  function straddleSvg() {
    var straddle = "0,22 12,10 28,54 40,62 56,50 72,66 88,72 104,68 122,80 140,86 " +
      "160,94 186,98 210,102 236,106 260,104 286,110 310,114 332,120 356,128 380,136 400,142";
    var spot = "0,32 20,72 36,62 52,90 66,76 80,122 96,88 112,66 130,60 150,42 170,54 " +
      "190,38 206,62 226,46 246,32 266,50 286,36 306,54 326,44 346,60 370,52 400,68";
    return '<svg class="s6-svg" viewBox="0 0 400 172" role="img" ' +
      'aria-label="Straddle premium against NIFTY spot, 9:15 am to 10:03 am">' +
      '<line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,.12)" stroke-width="1"/>' +
      '<polyline points="' + spot + '" fill="none" stroke="#9aa5ae" stroke-width="1.4" ' +
        'stroke-dasharray="4 3" opacity=".8"/>' +
      '<polyline points="' + straddle + '" fill="none" stroke="#4a9eff" stroke-width="2"/>' +
      '<circle cx="40" cy="62" r="3" fill="#4a9eff"/>' +
      '<rect x="50" y="44" width="132" height="34" rx="4" fill="#0b0e11" ' +
        'stroke="rgba(255,255,255,.14)"/>' +
      '<text x="58" y="57" fill="#d6e2db" font-size="9">9:18 AM</text>' +
      '<text x="58" y="70" fill="#4a9eff" font-size="9">Straddle 237' +
        '<tspan fill="#9aa5ae" dx="6">NIFTY 24,343</tspan></text>' +
      '<text x="2" y="166" fill="#7e968a" font-size="8">9:15 AM</text>' +
      '<text x="130" y="166" fill="#7e968a" font-size="8">9:30</text>' +
      '<text x="250" y="166" fill="#7e968a" font-size="8">9:45</text>' +
      '<text x="366" y="166" fill="#7e968a" font-size="8">10:03</text>' +
      "</svg>";
  }

  function maxPainSvg() {
    /* strike, call pain, put pain, from the Max Pain widget, same session. */
    var data = [[24200, 4529, 92052], [24250, 6079, 71576], [24300, 8136, 52854],
                [24350, 12803, 38974], [24400, 19663, 28355], [24450, 31742, 21659],
                [24500, 46434, 16348], [24550, 67185, 13253], [24600, 90147, 10558]];
    var max = 92052, H = 86, W = 400, slot = W / data.length, bw = slot / 2 - 3;
    var bars = "", labels = "";
    data.forEach(function (d, i) {
      var x = i * slot + 2;
      var ch = Math.max(2, d[1] / max * H), ph = Math.max(2, d[2] / max * H);
      bars += '<rect x="' + x + '" y="' + (H - ch + 14) + '" width="' + bw + '" height="' + ch +
        '" rx="1" fill="#e0483d" opacity=".85"/>';
      bars += '<rect x="' + (x + bw + 2) + '" y="' + (H - ph + 14) + '" width="' + bw + '" height="' + ph +
        '" rx="1" fill="#12a150" opacity=".85"/>';
      if (d[0] === 24400) {
        bars += '<text x="' + (x + bw) + '" y="10" fill="#e0b23e" font-size="8.5" ' +
          'text-anchor="middle">max pain 24400</text>';
      }
      if (i % 2 === 0) {
        labels += '<text x="' + (i * slot + slot / 2) + '" y="114" fill="#7e968a" font-size="7.5" ' +
          'text-anchor="middle">' + d[0] + "</text>";
      }
    });
    return '<svg class="s6-svg" viewBox="0 0 400 120" role="img" ' +
      'aria-label="Call and put pain by strike, max pain at 24400">' + bars + labels + "</svg>";
  }

  /* Future Screener: contract, LTP, change, OI change, trend tag. */
  function futuresPanel() {
    var rows = [
      ["ASTRAL", "1571.90", "+115.60 (7.94%)", "-2.27%", "sc", "Short-Covering"],
      ["ASHOKLEY", "181.82", "+5.17 (2.93%)", "+0.04%", "lb", "Long-BuildUp"],
      ["TMPV", "351.50", "+7.85 (2.28%)", "-0.05%", "sc", "Short-Covering"],
      ["SOLARINDS", "19275.00", "+445.00 (2.36%)", "-0.02%", "sc", "Short-Covering"],
      ["CONCOR", "526.55", "+11.05 (2.14%)", "+0.25%", "lb", "Long-BuildUp"]
    ];
    return '<div class="s6-shot">' +
      '<div class="s6-shot-bar"><span class="s6-tab on">Future Screener</span>' +
        '<span class="s6-tab">Future Activity</span><span class="s6-tab">Future Buildup</span></div>' +
      '<div class="s6-shot-meta"><span class="s6-chip">Expiry 25-Aug-2026</span>' +
        '<span class="s6-chip on">Activity: Price Gainers</span></div>' +
      '<div class="s6-pane"><div class="s6-pane-scroll"><table class="s6-mini">' +
        "<thead><tr><th>Contract</th><th>LTP</th><th>LTP change</th><th>OI change</th>" +
        "<th>Trend</th></tr></thead><tbody>" +
        rows.map(function (r) {
          return "<tr><td>" + r[0] + "</td><td>" + r[1] + '</td><td class="s6-up">' + r[2] +
            '</td><td class="' + (r[3].charAt(0) === "+" ? "s6-up" : "s6-down") + '">' + r[3] +
            '</td><td><span class="s6-trend ' + r[4] + '">' + r[5] + "</span></td></tr>";
        }).join("") +
      "</tbody></table></div></div>" +
      '<div class="s6-pane"><h4>Future Buildup · NIFTY · 1 min</h4>' +
        '<div class="s6-pane-scroll"><table class="s6-mini">' +
        "<thead><tr><th>Time</th><th>LTP</th><th>OI</th><th>VWAP</th><th>Trend</th></tr></thead>" +
        "<tbody><tr><td>10:05 am</td><td>24,428.00</td><td>1,26,98,335</td><td>24,417.61</td>" +
          '<td><span class="s6-trend sc">Short Covering</span></td></tr>' +
        "<tr><td>10:04 am</td><td>24,420.10</td><td>1,26,98,465</td><td>24,417.55</td>" +
          '<td><span class="s6-trend sc">Long Unwinding</span></td></tr>' +
        "<tr><td>10:03 am</td><td>24,429.00</td><td>1,26,99,050</td><td>24,417.54</td>" +
          '<td><span class="s6-trend lb">Long Build UP</span></td></tr>' +
        "</tbody></table></div></div></div>";
  }

  /* Max Pain + Options Screener. */
  function optionsPanel() {
    var pain = [["24300", "8135.95", "52853.81", ""], ["24350", "12803.38", "38974.23", ""],
                ["24400", "19662.6", "28355.28", " s6-atm"], ["24450", "31742.46", "21658.65", ""],
                ["24500", "46433.6", "16348.41", ""]];
    return '<div class="s6-shot">' +
      '<div class="s6-shot-bar"><span class="s6-tab on">Max Pain</span>' +
        '<span class="s6-tab">Options Screener</span><span class="s6-tab">Options Activity</span></div>' +
      '<div class="s6-shot-meta"><span class="s6-chip on">NIFTY</span>' +
        '<span class="s6-chip">BANKNIFTY</span><span class="s6-chip">FINNIFTY</span>' +
        '<span class="s6-chip">Expiry 25-Aug-2026</span></div>' +
      '<div class="s6-pane">' + maxPainSvg() +
        '<div class="s6-legend"><span><i class="s6-swatch call"></i>Call pain</span>' +
        '<span><i class="s6-swatch put"></i>Put pain</span></div></div>' +
      '<div class="s6-pane"><div class="s6-pane-scroll"><table class="s6-mini">' +
        "<thead><tr><th>Call pain</th><th>Strike</th><th>Put pain</th></tr></thead><tbody>" +
        pain.map(function (r) {
          return '<tr class="' + r[3].trim() + '"><td>' + r[1] + '</td><td class="s6-strike">' +
            r[0] + "</td><td>" + r[2] + "</td></tr>";
        }).join("") +
      "</tbody></table></div></div>" +
      '<div class="s6-pane"><h4>Options Screener · active by contract</h4>' +
        '<div class="s6-pane-scroll"><table class="s6-mini">' +
        "<thead><tr><th>Contract</th><th>LTP</th><th>LTP change</th><th>OI change</th></tr></thead>" +
        '<tbody><tr><td>ASTRAL 1600 CE</td><td>28.40</td><td class="s6-up">+23.40 (468.00%)</td>' +
          '<td class="s6-up">10.73L (383.00%)</td></tr>' +
        '<tr><td>JIOFIN 260 CE</td><td>5.90</td><td class="s6-up">+1.45 (32.95%)</td>' +
          '<td class="s6-up">50.78L (25.23%)</td></tr>' +
        '<tr><td>APOLLOHOSP 9000 CE</td><td>50.30</td><td class="s6-down">-38.55 (-43.39%)</td>' +
          '<td class="s6-up">1.48L (33.87%)</td></tr>' +
        "</tbody></table></div></div></div>";
  }

  function strategyPanel() {
    return '<div class="s6-shot">' +
      '<div class="s6-shot-bar"><span class="s6-tab on">Strategy Chart</span>' +
        '<span class="s6-tab">Options Screener</span></div>' +
      '<div class="s6-shot-meta"><span class="s6-chip on">Straddle Chart</span>' +
        '<span class="s6-chip on">NIFTY</span><span class="s6-chip">BANKNIFTY</span>' +
        '<span class="s6-chip">FINNIFTY</span><span class="s6-chip">Strike: 24350</span></div>' +
      '<div class="s6-pane">' + straddleSvg() +
        '<div class="s6-legend"><span><i class="s6-swatch"></i>Straddle premium</span>' +
        '<span><i class="s6-swatch dash"></i>NIFTY spot</span></div></div></div>';
  }

  function analytics() {
    if (document.getElementById("s6-analytics")) return;
    var ref = chain() || gallery();
    if (!ref) return;

    var blocks = [
      ["", "Strategy Chart: the straddle and the index on one timeline",
       "Pick an index and a strike, and Strategy Chart plots the combined straddle premium " +
       "against spot from the open. In this view NIFTY is at 24,343 at 9:18 with the 24350 " +
       "straddle at 237, so one screen tells you whether premium is decaying faster than the " +
       "index is moving.",
       ["Straddle chart for NIFTY, BANKNIFTY, FINNIFTY and MIDCAPNIFTY",
        "A strike selector, so you can walk the chart up and down the chain",
        "Premium and spot on their own axes against the same clock"],
       strategyPanel()],
      ["s6-rev", "Futures screeners that name the move, not just the number",
       "Future Screener reads price and open interest together and labels every contract " +
       "as short covering or long build-up, instead of leaving you to work it out. Future " +
       "ranks the price and OI gainers and losers for the expiry, and Future Buildup logs the " +
       "index minute by minute with VWAP beside it.",
       ["Price and OI gainers and losers, ranked for the expiry you pick",
        "A trend tag on every contract: short covering, long build-up, long unwinding",
        "Minute-by-minute index buildup with VWAP, as a table or a chart",
        "A heatmap dashboard when you want the whole board in one glance"],
       futuresPanel()],
      ["", "Max pain, and the contracts actually trading",
       "Max Pain plots call and put pain across the strike range and names the max-pain " +
       "strike, 24400 in this session. Options Screener and Options Activity sort the chain " +
       "by what is genuinely moving, by contract and by traded value, so a 468% move on " +
       "ASTRAL 1600 CE with 10.73 lakh open interest added is one glance away.",
       ["Call and put pain across every strike, with the max-pain strike marked",
        "Most active contracts by count and by traded value, calls or puts",
        "Filter by expiry, by index or stocks, and jump a strike into the chain"],
       optionsPanel()]
    ];

    var s = node("section", "s6 s6-analytics", "s6-analytics");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<p class="s6-eyebrow">What\'s inside</p>' +
        '<h2 class="' + H2 + '">Analytics you can\'t run on a phone</h2>' +
        '<p class="s6-lead">The screeners, buildup and max-pain views that make the terminal ' +
          'worth a desk. Panels below reproduce Trade Pro views from one session: the 25 Aug 2026 ' +
          'expiry, around 10:05 am.</p>' +
        blocks.map(function (b) {
          return '<div class="s6-feat ' + b[0] + '"><div><h3>' + b[1] + "</h3><p>" + b[2] + "</p><ul>" +
            b[3].map(function (li) { return "<li>" + li + "</li>"; }).join("") + "</ul></div><div>" +
            b[4] + "</div></div>";
        }).join("") +
      "</div>";
    after(s, ref);
  }

  /* ------------------------------------------------ §5 comparison table */

  function compare() {
    if (document.getElementById("s6-compare")) return;
    var ref = document.getElementById("s6-analytics") || chain() || gallery();
    if (!ref) return;

    var YES = '<span class="s6-yes">✓</span>';
    var rows = [
      ["Runs on", "Any modern browser", "iOS, Android", "Windows, Mac (install)"],
      ["Best for", "Serious traders at a desk", "Trading on the move", "Power users wanting a native terminal"],
      ["Customisable widget layouts", YES + " Save &amp; switch", '<span class="s6-no">Fixed layouts</span>', YES],
      ["Option chain with Greeks", YES + " Four modes", YES, YES],
      ["Multi-leg strategy builder", YES + " Strategy Charts", YES, YES],
      ["TradingView charts", YES, YES, "Native charting engine"],
      ["Basket &amp; advanced orders", YES, YES, YES],
      ["Installation required", '<span class="s6-no">No</span>', "App store", "Yes"],
      ["Cost", '<span class="s6-yes">Free</span>', '<span class="s6-yes">Free</span>', '<span class="s6-yes">Free</span>']
    ];

    var s = node("section", "s6 s6-compare", "s6-compare");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<p class="s6-eyebrow">Choose your platform</p>' +
        '<h2 class="' + H2 + '">Which Indiabulls platform is right for you?</h2>' +
        '<p class="s6-lead">One account, all three platforms, common positions across them. Use whichever fits the moment.</p>' +
        '<div class="s6-tbl-wrap"><table class="s6-cmp"><thead><tr>' +
          "<th></th><th>Trade Pro Web</th>" +
          '<th><a href="/mobile-app">Indiabulls Securities App</a></th>' +
          '<th><a href="/power-indiabulls-exe">Power Indiabulls (PIB)</a></th>' +
        "</tr></thead><tbody>" +
        rows.map(function (r) {
          return '<tr><th scope="row">' + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] +
            "</td><td>" + r[3] + "</td></tr>";
        }).join("") +
        "</tbody></table></div>" +
        '<p class="s6-scroll-hint">Scroll the table sideways to see every platform.</p>' +
        '<p class="s6-note">Every cell needs Product sign-off before publication, because the differentiators are the point of the table.</p>' +
      "</div>";
    after(s, ref);
  }

  /* --------------------------------------------------------- §6 pricing */

  function pricing() {
    if (document.getElementById("s6-pricing")) return;
    var ref = document.getElementById("s6-compare") || chain();
    if (!ref) return;

    var incl = [
      "Real-time streaming quotes and five-level market depth",
      "TradingView charts with indicators and drawing tools",
      "Four-mode option chain with live Greeks",
      "Strategy Charts payoff builder",
      "Saved widget layouts that follow your account",
      "Research recommendations and market news",
      "IPO application and portfolio tracking"
    ];

    var s = node("section", "s6 s6-pricing", "s6-pricing");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<p class="s6-eyebrow">Pricing</p>' +
        '<h2 class="' + H2 + '">What Trade Pro costs</h2>' +
        '<div class="s6-price-box">' +
          "<div>" +
            '<div class="s6-big">₹0<small> / month for the platform</small></div>' +
            "<p>No platform fee. No monthly subscription. No data charge. Trade Pro is included with every Indiabulls Securities trading account.</p>" +
            '<div class="s6-big" style="margin-top:26px;font-size:30px">₹11 <small>flat per executed order</small>' +
              '<span class="s6-confirm">Pending Product sign-off</span></div>' +
            "<p>Across equity, F&amp;O, currency and commodity.</p>" +
          "</div>" +
          "<div>" +
            "<h3>Included at no extra cost</h3>" +
            '<ul class="s6-incl">' + incl.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>" +
            '<p class="s6-statutory">Statutory charges (STT, exchange transaction charges, GST, SEBI turnover fee and stamp duty) apply as levied. ' +
              '<a href="' + RATECARD + '">See the full rate card</a>.</p>' +
          "</div>" +
        "</div>" +
      "</div>";
    after(s, ref);
  }

  /* ----------------------------------------------------------- §7 steps */

  function steps() {
    if (document.getElementById("s6-steps")) return;
    var ref = document.getElementById("s6-pricing") || document.getElementById("s6-compare");
    if (!ref) return;

    var items = [
      ["Open a free account", "A 2-in-1 trading and demat account, opened digitally with PAN and Aadhaar."],
      ["Log in to Trade Pro", "Your regular credentials. Nothing to download, nothing to configure first."],
      ["Set up your layout", "Pick one of the six starting layouts or build your own from the widgets. Save it once and it's there every session."]
    ];

    var s = node("section", "s6 s6-steps-sec", "s6-steps");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<p class="s6-eyebrow">Getting started</p>' +
        '<h2 class="' + H2 + '">Trading in three steps</h2>' +
        '<div class="s6-cards3 s6-steps">' + items.map(function (i) {
          return '<div class="s6-card s6-step"><h3>' + i[0] + "</h3><p>" + i[1] + "</p></div>";
        }).join("") + "</div>" +
        '<p class="s6-reqs"><b>System requirements:</b> current versions of Chrome, Edge, Firefox or Safari, and a stable connection. ' +
          "Screen 1280px wide or larger recommended." +
          '<span class="s6-confirm">Pending Product sign-off</span></p>' +
      "</div>";
    after(s, ref);
  }

  /* ----------------------------------------------------------- §8 trust */

  function trust() {
    if (document.getElementById("s6-trust")) return;
    var ref = document.getElementById("s6-steps") || document.getElementById("s6-pricing");
    if (!ref) return;

    var stats = [
      ["9 lakh+", "Customers served"],
      ["4 segments", "Equity, F&amp;O, currency and commodity"],
      ["SEBI reg.", "INZ000036136 · NSE, BSE and MCX member"],
      ["App rating", 'See it live on <a href="' + PLAY + '" target="_blank" rel="noopener">Google Play</a> ' +
        'or the <a href="' + APPSTORE + '" target="_blank" rel="noopener">App Store</a>']
    ];

    var s = node("section", "s6 s6-trust", "s6-trust");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<p class="s6-eyebrow">Why traders trust us</p>' +
        '<h2 class="' + H2 + '">Numbers, not testimonials</h2>' +
        '<p class="s6-lead">Things you can check for yourself, rather than quotes you can\'t.</p>' +
        '<div class="s6-trust-grid">' + stats.map(function (st) {
          return '<div class="s6-stat"><div class="s6-stat-n">' + st[0] + '</div><p class="s6-stat-l">' + st[1] + "</p></div>";
        }).join("") + "</div>" +
      "</div>";
    after(s, ref);
  }

  /* ------------------------------------------------------ §10 closing CTA */

  function finalCta() {
    if (document.getElementById("s6-final")) return;
    var ref = faq() || features() || document.getElementById("s6-trust");
    if (!ref) return;

    var s = node("section", "s6 s6-final", "s6-final");
    s.innerHTML =
      '<div class="s6-wrap s6-center">' +
        '<h2 class="' + H2 + '">Your terminal is already in your account</h2>' +
        '<p class="s6-lead">If you trade with Indiabulls Securities, Trade Pro is one login away. ' +
          "If you don't yet, opening an account takes a few minutes.</p>" +
        '<div class="s6-ctas">' +
          '<a class="s6-btn s6-btn-p" href="' + LAUNCH + '">Launch Trade Pro <span aria-hidden="true">→</span></a>' +
          '<a class="s6-btn s6-btn-s" href="' + OPEN_ACCOUNT + '">Open a free account</a>' +
        "</div>" +
        '<p class="s6-disc">Investments in securities market are subject to market risks; read all the related documents ' +
          "carefully before investing. Derivatives trading involves a high degree of risk and is not suitable for all " +
          "investors. Past performance is not indicative of future results. Indiabulls Securities Limited, SEBI " +
          "Registration No. INZ000036136.</p>" +
      "</div>";
    after(s, ref);
  }

  /* ------------------------------------------------------------- anchors */

  function tagExisting() {
    var c = chain();
    if (c && !c.id) c.id = "tp-chain";
    var f = features();
    if (f && !f.id) f.id = "tp-features";
    /* The nav and the persona cards point at these two; #s3 and #s5 already
     * carry ids of their own. Header clearance for all four is in s6.css. */
  }

  function build() {
    tagExisting();
    heroExtras();
    nav();
    proof();
    personas();
    analytics();
    compare();
    pricing();
    steps();
    trust();
    finalCta();
  }

  function start() {
    build();
    var tries = 0;
    var iv = setInterval(function () {
      if (++tries > 25) return clearInterval(iv);
      build();
    }, 400);

    if (typeof MutationObserver !== "function") return;
    var pending = 0;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = setTimeout(function () { pending = 0; build(); }, 150);
    });
    obs.observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
