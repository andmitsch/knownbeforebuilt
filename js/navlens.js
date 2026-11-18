/* Liquid glass for the navigation bar (see the CSS above .nav-glass): builds the SVG filter that bends what is behind
   the bar, and switches it on with html.ng-lens. Only Chromium browsers (Chrome, Edge, Opera, Brave) can use an SVG
   filter as a backdrop-filter; everywhere else this does nothing and the bar is frosted glass instead (see the CSS).
   The lens reads its numbers from the bar's custom properties (--lq-thick, --lq-refr, --lq-mag, --lq-ca, --lq-clar),
   so they are tuned in one place, the stylesheet. */
(function () {
  if (!document.documentElement.classList.contains('ng-cr')) return;   /* set in the page head for Chromium browsers */
  var layer, bar, NS = 'http://www.w3.org/2000/svg', svg = null, last = '', queued = false;
  function num(name) { return parseFloat(getComputedStyle(bar).getPropertyValue(name)) || 0; }

  /* one displacement value per pixel row of the layer (the bar plus the hidden strip below it the rim reaches into):
     towards the middle for the magnification, and inside the bottom bevel a curved pull from below for the refraction */
  function map(H, reach, thick, refr, mag) {
    var rows = Math.max(2, Math.round(H + reach)), barH = Math.round(H), dy = [], max = 0, c = (barH - 1) / 2, e = Math.max(1, thick);
    for (var y = 0; y < rows; y++) {
      var d = 0;
      if (y < barH) {
        d = -(y - c) * (mag / 100);
        var db = barH - 1 - y;
        if (db < e) { var t = 1 - db / e; d += refr * (1 - Math.sqrt(1 - t * t)); }
      }
      dy.push(d); max = Math.max(max, Math.abs(d));
    }
    var S = 2 * max + 2, cv = document.createElement('canvas'); cv.width = 1; cv.height = rows;
    var g = cv.getContext('2d'), img = g.createImageData(1, rows);
    for (var i = 0; i < rows; i++) { img.data[i * 4] = 128; img.data[i * 4 + 1] = Math.round(255 * (.5 + dy[i] / S)); img.data[i * 4 + 2] = 128; img.data[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0);
    return { url: cv.toDataURL('image/png'), S: S, rows: rows };
  }

  function build() {
    queued = false;
    layer = document.querySelector('.nav-glass'); if (!layer) return; bar = layer.parentNode;   /* looked up each time: the page may re-render the bar */
    var W = layer.offsetWidth, H = layer.offsetHeight; if (!W || !H) return;
    var thick = num('--lq-thick'), refr = num('--lq-refr'), mag = num('--lq-mag'), ca = num('--lq-ca') * .06, soft = num('--lq-clar');
    var key = [W, H, thick, refr, mag, ca, soft].join(); if (key === last) return; last = key;
    var m = map(H, refr + 2, thick, refr, mag);
    if (!svg) {
      svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; document.body.appendChild(svg);
    }
    /* the map is the same in every column, so it is laid three window widths wide: wherever the browser puts the
       filter's origin, no column is left without it (a column without the map would shift sideways) */
    /* red, green and blue are displaced by slightly different amounts: the color fringes */
    function disp(scale, res) { return '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + scale.toFixed(2) + '" xChannelSelector="R" yChannelSelector="G" result="' + res + '"/>'; }
    function keep(src, row, res) { return '<feColorMatrix in="' + src + '" type="matrix" values="' + row + '" result="' + res + '"/>'; }
    /* switch the lens on only once the map image has decoded: a filter whose map is still loading bends everything by
       half its range (the ghosting this avoids) */
    var img = new Image(), id = key;
    img.onload = function () {
      if (id !== last) return;   /* a newer build has started */
      svg.innerHTML = '<filter id="ng-lens" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">' +
        '<feImage href="' + m.url + '" x="' + (-W) + '" y="0" width="' + 3 * W + '" height="' + m.rows + '" preserveAspectRatio="none" result="map"/>' +
        disp(m.S * (1 + ca), 'dr') + keep('dr', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'r') +
        disp(m.S, 'dg') + keep('dg', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'g') +
        disp(m.S * (1 - ca), 'db') + keep('db', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'b') +
        '<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen" result="rgb"/>' +
        '<feGaussianBlur in="rgb" stdDeviation="' + soft + '"/></filter>';
      document.documentElement.classList.add('ng-lens');
    };
    img.src = m.url;
  }
  function later() { if (!queued) { queued = true; requestAnimationFrame(build); } }
  build();
  window.addEventListener('resize', later);
  window.addEventListener('load', function () { last = ''; later(); });   /* once more when everything has loaded */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
})();
