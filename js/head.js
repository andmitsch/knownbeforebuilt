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

/* The navigation follows the reader: it slides away while scrolling down and comes back on the first scroll up.
   Sets two classes on <html>: kb-nav-float once the page has left the very top, kb-nav-off while it is tucked away. */
(function () {
  var h = document.documentElement, last = window.scrollY || 0, ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || 0, d = y - last;
    if (y <= 8) { h.classList.remove('kb-nav-off', 'kb-nav-float'); last = y; return; }
    h.classList.add('kb-nav-float');
    if (d > 6 && y > 140) { h.classList.add('kb-nav-off'); last = y; }
    else if (d < -6) { h.classList.remove('kb-nav-off'); last = y; }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
})();
;
/* hello, developer */
(function(){try{console.log("%c"+"                     .-'''''''''''''-.\n                 .-'                   '-.\n               .'                         '.\n              /       .-.          .-.      \\\n             /       ( o )        ( o )      \\\n            |         '-'          '-'        |\n            |                                 |\n            |     \\                     /     |\n             \\     '.                 .'     /\n              \\      '-._         _.-'      /\n               '.        '''''''''        .'\n                 '-.                   .-'\n                    '-.._____________..-'\n\n          Thanks for the interest in the code.\n          The animations are great, right?","font:600 13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#F57106");}catch(e){}})();
