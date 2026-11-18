// Phones get their own single-column layout (html.kb-m). Tablets keep the 1440 px design, scaled to fit.
// ?m=1 forces the phone layout on a desktop browser (for checking); ?m=0 forces the desktop layout.
  document.documentElement.classList.add('js');   // CSS keeps the no-JS reading layout unless this is set
  window.KB_TOUCH = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  (function () {
    var q = /[?&]m=([01])/.exec(location.search), sw = Math.min(screen.width || 9999, screen.height || 9999);
    window.KB_M = q ? q[1] === '1' : (window.KB_TOUCH ? sw < 600 : window.innerWidth < 600);
    if (window.KB_M) document.documentElement.classList.add('kb-m');
    if (!window.KB_TOUCH || window.KB_M) document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1');
    // Desktop windows under 1440 px: scale the page now, before the first paint, so it never shows at full size and then jumps.
    if (!window.KB_TOUCH && !window.KB_M) { var z = Math.min(1, document.documentElement.clientWidth / 1440); if (z < 1) document.documentElement.style.setProperty('--kb-zoom', String(z)); }
  })();
;
window.KB_SITE = true;
// Chromium browsers (Chrome, Edge, Opera, Brave) get the liquid glass navigation; everyone else the frosted one (css/book.css)
(function(){var b=navigator.userAgentData&&navigator.userAgentData.brands;if(b&&b.some(function(x){return /Chromium/.test(x.brand)}))document.documentElement.classList.add('ng-cr');})();

/* The navigation follows the reader. It stays through the opening of the page; from "Is this you?" on it slides away while
   scrolling down and comes back on the first scroll up. Once back, it stays for the next half screen (at least 320 px)
   of scrolling down before it leaves again, so reading on a little does not chase it away.
   Sets kb-nav-float once the page has left the very top and kb-nav-off while the bar is tucked away. */
(function () {
  var h = document.documentElement, last = window.scrollY || 0, ticking = false, anchor = null;
  function stay() { return Math.max(320, window.innerHeight * .5); }   /* once back, it stays for half a screen (at least 320 px) of scrolling down */
  function start() {   /* the scroll position where the section begins to pass under the bar */
    var el = document.querySelector('.section-section'), nav = document.querySelector('.nav-nav');
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
})();
;
/* hello, developer */
(function(){try{console.log("%c"+"                     .-'''''''''''''-.\n                 .-'                   '-.\n               .'                         '.\n              /       .-.          .-.      \\\n             /       ( o )        ( o )      \\\n            |         '-'          '-'        |\n            |                                 |\n            |     \\                     /     |\n             \\     '.                 .'     /\n              \\      '-._         _.-'      /\n               '.        '''''''''        .'\n                 '-.                   .-'\n                    '-.._____________..-'\n\n          Thanks for the interest in the code.\n          The animations are great, right?","font:600 13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#F57106");}catch(e){}})();
