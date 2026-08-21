/* Section 5: FAQ - Frequently Asked Questions about Trade Pro.
 *
 * Inserted at the end, after Section 4 (Why Trade Pro?). Accordion-style
 * expandable questions and answers.
 */
(function () {
  "use strict";

  var FAQS = [
    {
      q: "What is Trade Pro?",
      a: "Trade Pro is a powerful web-based trading terminal that lets you manage your portfolio, analyze charts, trade options, and execute orders all from one place with minimal clicks."
    },
    {
      q: "Is Trade Pro free?",
      a: "Yes. Trade Pro is included with every Indiabulls Securities trading account. There is no platform fee, no monthly subscription and no data charge. You pay brokerage on the orders you place, plus statutory charges as levied."
    },
    {
      q: "Do I need to install anything?",
      a: "No. Trade Pro runs in any modern browser: Chrome, Edge, Firefox or Safari. Your layouts are saved to your account, so any machine you log in from looks the same."
    },
    {
      q: "Can I customize my workspace layout?",
      a: "Yes. You can choose from six ready-made layouts or create your own by dragging and resizing panels. Every workspace you design is saved for instant access on your next login."
    },
    {
      q: "Can I save multiple watchlists and manage them easily?",
      a: "Yes. Create unlimited watchlists for different trading strategies and asset classes. Switch between them instantly, and each watchlist remembers your column preferences, sorting, and layout settings automatically."
    },
    {
      q: "Can I trade directly from the chart?",
      a: "Yes. Flip the Trade on Charts toolbar switch and the chart becomes your order surface. Buy and sell tags pin to the price axis, and the ticket stages your limit, take profit, and stop loss beside them."
    },
    {
      q: "Is Trade Pro available on mobile?",
      a: "Trade Pro is a web platform optimized for desktop and tablet. For mobile trading, download our Mobile Trading App from the App Store or Google Play."
    },
    {
      q: "What instruments can I trade?",
      a: "Equities, F&O (futures and options), commodities, currencies, and more. Trade Pro supports all instruments available on the Indiabulls Securities platform."
    },
    {
      q: "Can I place multi-leg option strategies?",
      a: "Yes. Build the position in Strategy Charts, check the payoff and the margin it needs, then send every leg from a single ticket instead of one order at a time."
    },
    {
      q: "Are the charts real TradingView charts?",
      a: "Yes. The TradingView charting engine is built into the terminal, with its indicators and drawing tools. No separate TradingView subscription is needed."
    },
    {
      q: "Can I use Trade Pro alongside Power Indiabulls?",
      a: "Yes. One account works across all our platforms and your positions are common between them, so you can start an order on one and manage it on another."
    },
    {
      q: "What if I get stuck?",
      a: "Support is reachable from inside the terminal, or on 022-61446300 during market hours. The FAQ and help centre cover the common setup questions."
    }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function anchorSection() {
    // Anchor after the last section (Why Trade Pro?)
    var sections = document.querySelectorAll("section");
    return sections[sections.length - 1];
  }

  function build() {
    if (document.getElementById("s5")) return;
    var anchor = anchorSection();
    if (!anchor) return;

    var section = document.createElement("section");
    section.id = "s5";
    section.className = "s5-section";

    var pad = el("div", "s5-pad");
    var wrap = el("div", "s5");

    var head = el("div", "s5-head");
    var h2 = el("h2", null, "Frequently Asked Questions");
    h2.className = "manrope-800 manrope-700 leading-tight";
    head.appendChild(h2);
    wrap.appendChild(head);

    var list = el("div", "s5-list");
    FAQS.forEach(function (faq, i) {
      var item = el("div", "s5-item");
      var trigger = el("button", "s5-trigger");
      trigger.type = "button";
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", "s5-ans-" + i);

      var q = el("span", "s5-q", faq.q);
      trigger.appendChild(q);

      var iconWrapper = el("div", "flex-shrink-0");
      var iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      iconSvg.setAttribute("width", "24");
      iconSvg.setAttribute("height", "24");
      iconSvg.setAttribute("viewBox", "0 0 24 24");
      iconSvg.setAttribute("fill", "none");
      iconSvg.setAttribute("stroke", "currentColor");
      iconSvg.setAttribute("stroke-width", "2");
      iconSvg.setAttribute("stroke-linecap", "round");
      iconSvg.setAttribute("stroke-linejoin", "round");
      iconSvg.setAttribute("class", "s5-icon");
      iconSvg.setAttribute("aria-hidden", "true");
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "m6 9 6 6 6-6");
      iconSvg.appendChild(path);
      iconWrapper.appendChild(iconSvg);
      trigger.appendChild(iconWrapper);

      var ans = el("div", "s5-ans");
      ans.id = "s5-ans-" + i;
      ans.setAttribute("role", "region");
      ans.appendChild(el("p", "s5-a", faq.a));

      item.appendChild(trigger);
      item.appendChild(ans);

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", !isOpen);
        item.classList.toggle("is-open", !isOpen);
      });

      list.appendChild(item);
    });

    wrap.appendChild(list);
    pad.appendChild(wrap);
    section.appendChild(pad);
    anchor.parentNode.insertBefore(section, anchor.nextSibling);
  }

  function safeBuild() {
    try { build(); } catch (e) { console.warn("s5 failed", e); }
  }

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
