(function () {
  "use strict";

  function injectStyles() {
    var style = document.getElementById("tradepro-cleanup-styles");
    if (style) return;
    style = document.createElement("style");
    style.id = "tradepro-cleanup-styles";
    style.textContent =
      "img[src*='tradepro-baner']," +
      "img[src*='tradepro-image-v3']," +
      "img[src*='zigzag']," +
      "img[src*='blackarrow']" +
      "{display:none!important;visibility:hidden!important;height:0!important;width:0!important;}";
    document.head.appendChild(style);

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/hero-enhance.css";
    document.head.appendChild(link);
  }

  function clean() {
    var tabs = document.evaluate(
      "//div[contains(@class, 'flex') and contains(@class, 'justify-center')]" +
      "[.//a[contains(text(), 'Mobile App')] and .//a[contains(text(), 'TradePro Terminal')] and .//a[contains(text(), 'PIB EXE')]]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (tabs) tabs.parentNode.removeChild(tabs);

    var cta = document.evaluate(
      "//button[contains(text(), 'Open a Trading Account')]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (cta) cta.parentNode.removeChild(cta);

    /* tradepro-baner is deliberately NOT in this list. improve.js locates the whole
       hero through it -- querySelector('img[alt="TradePro Terminal"]') is that same
       image -- and bails out entirely if it has gone. Deleting it here first won the
       race and left the hero completely empty: no screen, no widgets, no buttons.
       It is still hidden the instant it appears, by the injected CSS above and by
       the inline styles below, so nothing is ever visible to the user; it is only
       kept in the DOM long enough to serve as the anchor. improve.js removes it
       itself once it has the reference, and the guarded branch after this loop
       sweeps it up if improve.js never ran. */
    var badSrcs = ["zigzag", "blackarrow", "tradepro-image-v3"];
    var ANCHOR = "tradepro-baner";

    function hide(img) {
      img.style.display = "none";
      img.style.visibility = "hidden";
      img.style.height = "0";
      img.style.width = "0";
    }

    document.querySelectorAll("img").forEach(function (img) {
      var src = img.src || "";
      if (src.includes(ANCHOR)) {
        hide(img);
        return;
      }
      for (var i = 0; i < badSrcs.length; i++) {
        if (src.includes(badSrcs[i])) {
          hide(img);
          if (img.parentNode) {
            try { img.parentNode.removeChild(img); } catch (e) {}
          }
          break;
        }
      }
    });

    /* Safe to drop the anchor only once the hero it anchors actually exists. */
    if (document.querySelector(".tp-stage")) {
      document.querySelectorAll('img[src*="' + ANCHOR + '"]').forEach(function (img) {
        if (img.parentNode) {
          try { img.parentNode.removeChild(img); } catch (e) {}
        }
      });
    }

    var tradeProLinks = document.evaluate(
      "//a[contains(text(), 'Trade Pro')]",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    /* Point in-site "Trade Pro" links at the terminal page -- but ONLY in-site ones.
       This loop matches on link TEXT, and the hero's own "Launch Trade Pro" anchor
       contains that text, so it was having its href rewritten from the login host to
       /tradepro-terminal/: the launch button quietly stopped launching anything and
       just reloaded this page. Anything pointing off-origin is left alone. */
    for (var i = 0; i < tradeProLinks.snapshotLength; i++) {
      var link = tradeProLinks.snapshotItem(i);
      var raw = link.getAttribute("href") || "";

      if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.indexOf("//") === 0) {
        var external = true;
        try { external = new URL(raw, location.href).origin !== location.origin; }
        catch (e) { external = true; }
        if (external) continue;
      }

      if (!link.href.includes("tradepro-terminal")) {
        link.href = "/tradepro-terminal/";
      }
    }
  }

  function start() {
    injectStyles();
    clean();
    var tries = 0;
    var iv = setInterval(function () {
      clean();
      if (++tries > 50) clearInterval(iv);
    }, 150);

    if (typeof MutationObserver !== "function") return;
    var pending = 0;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = setTimeout(function () { pending = 0; clean(); }, 50);
    });
    obs.observe(document.querySelector("main") || document.body,
                { childList: true, subtree: true });
  }

  injectStyles();
  if (document.readyState === "complete") clean();
  window.addEventListener("load", start);

  /* Load Mega Menu Enhancement */
  function loadMegaMenu() {
    if (document.querySelector('link[href*="mega-menu.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/mega-menu.css';
    document.head.appendChild(link);

    if (document.querySelector('script[src*="mega-menu.js"]')) return;
    var script = document.createElement('script');
    script.src = '/mega-menu.js';
    script.async = true;
    document.body.appendChild(script);
  }

  if (document.readyState === "complete") loadMegaMenu();
  window.addEventListener("load", loadMegaMenu);
})();
