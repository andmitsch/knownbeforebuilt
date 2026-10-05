window.KBB_PROPS = { showPlaceholders: false };
;
(function () {
  // The design is drawn at 1440 px. Wider screens centre it; narrower ones scale it down.
  var page = document.getElementById('kb-page');
  function fit() {
    var z = window.KB_TOUCH ? 1 : Math.min(1, document.documentElement.clientWidth / 1440);
    page.style.zoom = z === 1 ? '' : String(z);
  }
  fit(); window.addEventListener('resize', fit);
  var cfg = window.KBB_PROPS || {};
  function props(k) { var d = window.KBB[k].defaults || {}, o = {}; for (var p in d) o[p] = d[p]; for (var q in cfg) o[q] = cfg[q]; return o; }
  kbbMount(window.KBB.main, 'tpl-main', document.getElementById('kb-main'), props('main'));
  kbbMount(window.KBB.main2, 'tpl-main2', document.getElementById('kb-main2'), props('main2'));
})();
