/*
 * Portrait: shared by index.html (author section) and talks-press.html (intro).
 *
 * 1. Reveal: when the portrait scrolls into view, a drop lands in its centre and the wave rolls outward,
 *    uncovering the photo behind its front, with a little orange light on the crest. The dashed
 *    placeholder ring fades as the wave reaches it. It resets once the portrait has left the screen
 *    completely, so the drop falls again on every return.
 * 2. Interaction: moving over the photo swells it gently towards the pointer and warms it with the
 *    site's orange; a click sends the same wave out from that point.
 * The whole thing is one WebGL shader drawing the photo, so there is no swap between an image and the
 * effect. Without WebGL, or with reduced motion: the plain image fades in, no effect.
 *
 * Usage: KBPortrait.attach(containerWithDashedBorder, img)
 */
(function () {
  'use strict';
  if (window.KBPortrait) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent =
    '.kbp{transition:border-color 1s cubic-bezier(.22,1,.36,1)}' +
    '.kbp.kbp-ring-off{border-color:transparent!important}' +
    '.kbp.kbp-reset,.kbp.kbp-reset *{transition:none!important}' +
    '.kbp .kbp-img{opacity:0}' +
    '.kbp.kbp-on .kbp-img{opacity:1;transition:opacity .9s ease}' +
    '.kbp .kbp-gl{position:absolute;pointer-events:none;border-radius:50%;visibility:hidden}' +
    '.kbp.kbp-gl-on .kbp-gl{visibility:visible}' +
    '.kbp.kbp-gl-on .kbp-img{opacity:0!important}' +
    '.kbp.kbp-done{cursor:crosshair}' +
    '@media (prefers-reduced-motion:reduce){.kbp,.kbp .kbp-img{transition:none!important}}';
  document.head.appendChild(css);

  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;',
    'varying vec2 v;',
    'uniform sampler2D tex;',
    'uniform vec2 mouse;',
    'uniform float hover,time,front,settle;', // front: radius of the reveal wave (0 to .8); settle: 1 while it rolls, fades to 0
    'uniform vec4 rip[3];',                   // click waves: x, y, age (s), alive
    'void main(){',
    '  vec2 uv=v;',
    '  vec2 d=uv-mouse; float r2=dot(d,d);',
    '  vec2 disp=-d*0.075*hover*exp(-r2*16.);',
    '  disp+=hover*0.0028*vec2(sin(uv.y*11.+time*1.3),cos(uv.x*9.-time*1.1));',
    '  float ring=0.;',
    // the reveal: one drop from the centre; crest at the front, smaller ripples trailing behind it
    '  vec2 qc=uv-.5; float dc=length(qc); float x=dc-front;',
    '  float crest=exp(-x*x*420.)*settle;',
    '  float trail=(x<0.?sin(x*70.)*exp(x*7.):0.)*settle;',
    '  disp+=normalize(qc+1e-5)*(crest*0.03+trail*0.006);',
    '  ring+=crest*.9;',
    '  for(int i=0;i<3;i++){',
    '    vec4 R=rip[i]; if(R.w<.5) continue;',
    '    vec2 q=uv-R.xy; float dist=length(q); float rad=R.z*.62;',
    '    float w=exp(-pow((dist-rad)*20.,2.))*max(0.,1.-R.z/1.3);',
    '    disp+=normalize(q+1e-5)*w*0.018; ring+=w;',
    '  }',
    '  vec4 c=texture2D(tex,uv+disp);',
    '  float glow=hover*exp(-r2*9.);',
    '  vec3 warm=c.rgb*vec3(1.,.9,.8)+vec3(.96,.44,.02)*.22;',
    '  c.rgb=mix(c.rgb,warm*c.a,clamp(glow*.38+ring*.4,0.,1.));',
    '  float shown=1.-smoothstep(front-.03,front+.006,dc);', // only what the wave has passed is visible
    '  float e=1.-smoothstep(.494,.5,dc);',
    '  gl_FragColor=c*e*shown;',
    '}'
  ].join('\n');

  function setupGL(box, img) {
    if (reduce) return null;
    var cv = document.createElement('canvas'); cv.className = 'kbp-gl'; cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return null;
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return null;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['mouse', 'hover', 'time', 'front', 'settle', 'rip'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE); });
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    var S = { mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, h: 0, ht: 0, rips: [], raf: 0, t0: performance.now(), size: 0, front: 0, settle: 0, rv: null, live: false };
    function place() {
      cv.style.left = img.offsetLeft + 'px'; cv.style.top = img.offsetTop + 'px';
      cv.style.width = img.offsetWidth + 'px'; cv.style.height = img.offsetHeight + 'px';
      var px = Math.max(2, Math.round(img.offsetWidth * Math.min(2, window.devicePixelRatio || 1)));
      if (px === S.size) return; S.size = px;
      cv.width = cv.height = px; gl.viewport(0, 0, px, px);
      var c2 = document.createElement('canvas'); c2.width = c2.height = px;
      var x = c2.getContext('2d'), iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(px / iw, px / ih);
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, (px - iw * s) / 2, (px - ih * s) / 2, iw * s, ih * s);
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
      draw(performance.now());
    }
    function draw(now) {
      var arr = new Float32Array(12);
      S.rips = S.rips.filter(function (r) { return now - r.t < 1300; }).slice(-3);
      S.rips.forEach(function (r, i) { arr[i * 4] = r.x; arr[i * 4 + 1] = r.y; arr[i * 4 + 2] = (now - r.t) / 1000; arr[i * 4 + 3] = 1; });
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.mouse, S.mx, S.my); gl.uniform1f(U.hover, S.h); gl.uniform1f(U.time, (now - S.t0) / 1000);
      gl.uniform1f(U.front, S.front); gl.uniform1f(U.settle, S.settle); gl.uniform4fv(U.rip, arr);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    /* reveal timeline: the drop lands, its front eases out past the edge, the water then calms down */
    var RD = 2600, CALM = 1000;
    function revealStep(now) {
      var R = S.rv; if (!R) return false;
      var t = (now - R.t0) / RD, k = Math.min(1, t), e = 1 - Math.pow(1 - k, 1.6);
      S.front = 0.02 + e * 0.8;
      S.settle = t < 1 ? 1 : Math.max(0, 1 - (now - R.t0 - RD) / CALM);
      if (!R.half && S.front > 0.36) { R.half = true; if (R.onHalf) R.onHalf(); }
      if (t >= 1 && S.settle <= 0) { S.rv = null; S.front = 1; S.settle = 0; if (R.onDone) R.onDone(); return false; }
      return true;
    }
    function loop(now) {
      S.raf = 0; if (!S.live) return;
      S.mx += (S.tx - S.mx) * 0.6; S.my += (S.ty - S.my) * 0.6;
      S.h += (S.ht - S.h) * (S.ht > S.h ? 0.08 : 0.06);
      var rolling = revealStep(now);
      draw(now);
      if (rolling || Math.abs(S.ht - S.h) > 0.002 || S.h > 0.002 || S.rips.length) S.raf = requestAnimationFrame(loop);
      else { S.h = 0; draw(now); }
    }
    function kick() { if (!S.raf) S.raf = requestAnimationFrame(loop); }
    function uv(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1), (e.clientY - r.top) / (r.height || 1)]; }
    function inside(p) { var dx = p[0] - 0.5, dy = p[1] - 0.5; return dx * dx + dy * dy < 0.25; }
    function ready() { return S.live && !S.rv; }
    box.addEventListener('pointermove', function (e) {
      if (!ready()) return;
      var p = uv(e); S.tx = p[0]; S.ty = p[1]; S.ht = inside(p) && e.pointerType === 'mouse' ? 1 : 0; kick();
    });
    box.addEventListener('pointerleave', function () { S.ht = 0; kick(); });
    box.addEventListener('pointerdown', function (e) {
      if (!ready()) return;
      var p = uv(e); if (!inside(p)) return;
      S.rips.push({ x: p[0], y: p[1], t: performance.now() }); kick();
    });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); S.live = false; box.classList.remove('kbp-gl-on'); box.classList.add('kbp-on'); });
    box.appendChild(cv);
    var listening = false;
    return {
      reveal: function (onHalf, onDone) {
        if (!listening) { window.addEventListener('resize', place); listening = true; }
        place(); S.live = true; S.front = 0; S.settle = 1; S.rips = []; S.h = S.ht = 0;
        S.rv = { t0: performance.now(), onHalf: onHalf, onDone: onDone, half: false };
        draw(performance.now()); kick();
      },
      reset: function () { S.live = false; S.rv = null; S.front = 0; S.settle = 0; S.h = S.ht = 0; S.rips = []; cancelAnimationFrame(S.raf); S.raf = 0; draw(performance.now()); }
    };
  }

  function attach(box, img) {
    if (!box || !img || img.__kbp) return; img.__kbp = true;
    box.classList.add('kbp'); img.classList.add('kbp-img');
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    var shown = false, visible = false, loaded = false, fx, timer = 0;
    function go() {
      if (shown || !visible || !loaded) return; shown = true;
      box.classList.add('has-img');
      if (fx === undefined) { try { fx = setupGL(box, img); } catch (e) { fx = null; } }
      if (fx) {
        box.classList.add('kbp-gl-on');
        fx.reveal(function () { box.classList.add('kbp-ring-off'); }, function () { box.classList.add('kbp-done'); });
      } else {
        /* no WebGL or reduced motion: a plain fade */
        box.classList.add('kbp-on', 'kbp-ring-off');
        timer = setTimeout(function () { box.classList.add('kbp-done'); }, reduce ? 0 : 900);
      }
    }
    /* out of view: back to the unrevealed state, so the drop falls again next time */
    function reset() {
      if (!shown) return; shown = false;
      clearTimeout(timer); if (fx) fx.reset();
      box.classList.add('kbp-reset');
      box.classList.remove('kbp-on', 'kbp-done', 'kbp-ring-off', 'kbp-gl-on');
      void box.offsetWidth; box.classList.remove('kbp-reset');
    }
    function ok() { if (!img.naturalWidth) return; loaded = true; go(); }
    if (img.complete) ok(); else img.addEventListener('load', ok);
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.intersectionRatio >= 0.25) { visible = true; go(); }
          else if (!e.isIntersecting) { visible = false; reset(); }
        });
      }, { threshold: [0, 0.25] });
      io.observe(box);
    } else { visible = true; go(); }
  }

  window.KBPortrait = { attach: attach };

  // Book page: the author portrait is rendered by the page script, so attach once it exists.
  function auto() {
    var img = document.querySelector('.author-img');
    if (img) { attach(img.parentNode, img); return true; }
    return false;
  }
  if (!auto()) { var n = 0, t = setInterval(function () { if (auto() || ++n > 40) clearInterval(t); }, 150); }
})();
