(function () {
  "use strict";

  function remove() {
    var nodes = document.evaluate(
      "//text()[contains(., '₹11 flat per executed order')]",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (var i = nodes.snapshotLength - 1; i >= 0; i--) {
      var node = nodes.snapshotItem(i);
      node.textContent = node.textContent.replace(/₹11 flat per executed order\s*/g, "");
      if (!node.textContent.trim()) node.parentNode.removeChild(node);
    }
  }

  function start() {
    remove();
    var tries = 0;
    var iv = setInterval(function () {
      if (++tries > 25) return clearInterval(iv);
      remove();
    }, 400);

    if (typeof MutationObserver !== "function") return;
    var pending = 0;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = setTimeout(function () { pending = 0; remove(); }, 120);
    });
    obs.observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
