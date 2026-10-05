// Desktop-only layout for now: phones and tablets render the page at 1440 px and scale it to fit.
  window.KB_TOUCH = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!window.KB_TOUCH) document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1');
;
window.KB_SITE = true;
;
/* hello, developer */
(function(){try{console.log("%c"+"                     .-'''''''''''''-.\n                 .-'                   '-.\n               .'                         '.\n              /       .-.          .-.      \\\n             /       ( o )        ( o )      \\\n            |         '-'          '-'        |\n            |                                 |\n            |     \\                     /     |\n             \\     '.                 .'     /\n              \\      '-._         _.-'      /\n               '.        '''''''''        .'\n                 '-.                   .-'\n                    '-.._____________..-'\n\n          Thanks for the interest in the code.\n          The animations are great, right?","font:600 13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#F57106");}catch(e){}})();
