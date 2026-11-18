/* The navigation bar, shared by the book page and Talks & press. Loaded in the page head; the looks (glass, motion) are
   in css/book.css, the lens is built by js/navlens.js.

   1. Chromium browsers (Chrome, Edge, Opera, Brave) get the liquid glass (html.ng-cr), everyone else the frosted one.
      Set here, before the first paint, so neither ever shows the other's glass.
   2. The bar follows the reader. It stays through the opening of the page; from the section marked data-nav-hide
      ("Is this you?", on Talks & press the keynotes) it slides away while scrolling down and comes back on the first
      scroll up. Once back, it stays for the next half screen (at least 320 px) of scrolling down before it leaves
      again, so reading on a little does not chase it away.
      Sets kb-nav-float once the page has left the very top and kb-nav-off while the bar is tucked away.
   3. Talks & press: --navh carries the header's height, so the page starts below the fixed bar. */
(function () {
  var h = document.documentElement;
  var b = navigator.userAgentData && navigator.userAgentData.brands;
  if (b && b.some(function (x) { return /Chromium/.test(x.brand); })) h.classList.add('ng-cr');

  var last = window.scrollY || 0, ticking = false, anchor = null;
  function bar() { return document.querySelector('.nav-nav, body>header.wrap'); }
  function stay() { return Math.max(320, window.innerHeight * .5); }
  function start() {   /* the scroll position where the marked section begins to pass under the bar */
    var el = document.querySelector('[data-nav-hide]'), nav = bar();
    if (!el) return 140;
    return el.getBoundingClientRect().top + (window.scrollY || 0) - (nav ? nav.getBoundingClientRect().height : 0);
  }
  function update() {
    ticking = false;
    var y = window.scrollY || 0;
    h.classList.toggle('kb-nav-float', y > 8);
    if (y <= start()) { h.classList.remove('kb-nav-off'); anchor = null; last = y; return; }
    if (h.classList.contains('kb-nav-off')) {                 /* away: back on 6 px of scrolling up */
      if (y > last) last = y; else if (last - y > 6) { h.classList.remove('kb-nav-off'); anchor = y; last = y; }
      return;
    }
    if (anchor === null) { if (y > last) h.classList.add('kb-nav-off'); last = y; return; }   /* reaching the section: leave */
    anchor = Math.min(anchor, y);                              /* back in view: stay for a while when scrolling down again */
    if (y - anchor > stay()) { h.classList.add('kb-nav-off'); anchor = null; }
    last = y;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });

  function navh() { var hd = document.querySelector('body>header.wrap'); if (hd) h.style.setProperty('--navh', hd.offsetHeight + 'px'); }
  document.addEventListener('DOMContentLoaded', navh);
  window.addEventListener('resize', navh);
})();
