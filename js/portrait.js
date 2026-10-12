/*
 * Portrait: shared by index.html (author section) and talks-press.html (intro).
 *
 * 1. Reveal: once the image file exists and the portrait scrolls into view, it is painted in with the
 *    same conic sweep as the hero circle (.paint in book.css) while the dashed placeholder ring fades out.
 *    It resets when the portrait leaves the screen completely, so it paints in again on every return.
 * 2. Shader (WebGL): the photo sits under a lens of ink. Moving over it bulges the photo gently towards
 *    the pointer and warms it with the site's orange; a click sends an ink ripple ring outwards, like the
 *    chapter list on the book page. At rest the shader draws the plain photo, so nothing changes until
 *    someone interacts. No WebGL, or reduced motion: the plain image, no effect.
 *
 * Usage: KBPortrait.attach(containerWithDashedBorder, img)
 */
(function () {
  'use strict';
  if (window.KBPortrait) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent =
    '@property --kbp{syntax:"<number>";inherits:false;initial-value:1}' +
    '.kbp{transition:border-color 1.1s cubic-bezier(.22,1,.36,1) .35s}' +
    '.kbp.kbp-on{border-color:transparent!important}' +
    '.kbp.kbp-reset,.kbp.kbp-reset *{transition:none!important}' +
    '.kbp .kbp-img{opacity:0;--kbp:0;-webkit-mask:conic-gradient(from 200deg,#000 calc(var(--kbp) * 360deg),transparent 0);mask:conic-gradient(from 200deg,#000 calc(var(--kbp) * 360deg),transparent 0)}' +
    '.kbp.kbp-on .kbp-img{opacity:1;--kbp:1;transition:--kbp 1.6s cubic-bezier(.65,0,.25,1),opacity .35s ease}' +
    '.kbp.kbp-done .kbp-img{-webkit-mask:none;mask:none}' +
    '.kbp .kbp-gl{position:absolute;pointer-events:none;opacity:0;transition:opacity .25s ease;border-radius:50%}' +
    '.kbp.kbp-gl-on .kbp-gl{opacity:1}' +
    '.kbp.kbp-gl-on .kbp-img{visibility:hidden}' +
    '.kbp.kbp-done{cursor:crosshair}' +
    '@media (prefers-reduced-motion:reduce){.kbp,.kbp .kbp-img{transition:none!important}.kbp .kbp-img{-webkit-mask:none;mask:none}}';
  document.head.appendChild(css);

  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;',
    'varying vec2 v;',
    'uniform sampler2D tex;',
    'uniform vec2 mouse;',
    'uniform float hover,time;',
    'uniform vec4 rip[3];', // x, y, age (s), alive
    'void main(){',
    '  vec2 uv=v;',
    '  vec2 d=uv-mouse; float r2=dot(d,d);',
    // lens: the photo swells gently towards the pointer
    '  vec2 disp=-d*0.075*hover*exp(-r2*16.);',
    // ink drift while hovered, very small
    '  disp+=hover*0.0028*vec2(sin(uv.y*11.+time*1.3),cos(uv.x*9.-time*1.1));',
    '  float ring=0.;',
    '  for(int i=0;i<3;i++){',
    '    vec4 R=rip[i]; if(R.w<.5) continue;',
    '    vec2 q=uv-R.xy; float dist=length(q); float rad=R.z*.62;',
    '    float w=exp(-pow((dist-rad)*20.,2.))*max(0.,1.-R.z/1.3);',
    '    disp+=normalize(q+1e-5)*w*0.018; ring+=w;',
    '  }',
    '  vec4 c=texture2D(tex,uv+disp);',
    // warm orange light near the pointer and along the ripple ring (#F57106 = .96,.44,.02)
    '  float glow=hover*exp(-r2*9.);',
    '  vec3 warm=c.rgb*vec3(1.,.9,.8)+vec3(.96,.44,.02)*.22;',
    '  c.rgb=mix(c.rgb,warm*c.a,clamp(glow*.38+ring*.4,0.,1.));',
    // circular edge, soft
    '  float e=1.-smoothstep(.494,.5,length(uv-.5));',
    '  gl_FragColor=c*e;',
    '}'
  ].join('\n');

  function setupGL(box, img) {
    if (reduce) return;
    var cv = document.createElement('canvas'); cv.className = 'kbp-gl'; cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return;
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = { mouse: gl.getUniformLocation(pr, 'mouse'), hover: gl.getUniformLocation(pr, 'hover'), time: gl.getUniformLocation(pr, 'time'), rip: gl.getUniformLocation(pr, 'rip') };
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE); });
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    var S = { mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, h: 0, ht: 0, rips: [], raf: 0, t0: performance.now(), size: 0 };
    function place() {
      // the canvas covers exactly the image's box (same offsets as the <img>)
      cv.style.left = img.offsetLeft + 'px'; cv.style.top = img.offsetTop + 'px';
      cv.style.width = img.offsetWidth + 'px'; cv.style.height = img.offsetHeight + 'px';
      var px = Math.max(2, Math.round(img.offsetWidth * Math.min(2, window.devicePixelRatio || 1)));
      if (px === S.size) return; S.size = px;
      cv.width = cv.height = px; gl.viewport(0, 0, px, px);
      // downsample the (large) photo once, in 2D, to the canvas size: crisp and cheap
      var c2 = document.createElement('canvas'); c2.width = c2.height = px;
      var x = c2.getContext('2d'), iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(px / iw, px / ih);
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, (px - iw * s) / 2, (px - ih * s) / 2, iw * s, ih * s); // object-fit: cover
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
      draw(performance.now());
    }
    function draw(now) {
      var t = (now - S.t0) / 1000, arr = new Float32Array(12);
      S.rips = S.rips.filter(function (r) { return now - r.t < 1300; }).slice(-3);
      S.rips.forEach(function (r, i) { arr[i * 4] = r.x; arr[i * 4 + 1] = r.y; arr[i * 4 + 2] = (now - r.t) / 1000; arr[i * 4 + 3] = 1; });
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.mouse, S.mx, S.my); gl.uniform1f(U.hover, S.h); gl.uniform1f(U.time, t); gl.uniform4fv(U.rip, arr);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function loop(now) {
      S.raf = 0;
      var k = 1 - Math.pow(0.001, 1 / 60); // frame-rate independent enough for a pointer follow
      S.mx += (S.tx - S.mx) * k * 6; S.my += (S.ty - S.my) * k * 6;
      S.h += (S.ht - S.h) * (S.ht > S.h ? 0.08 : 0.06);
      draw(now);
      if (Math.abs(S.ht - S.h) > 0.002 || S.h > 0.002 || S.rips.length) S.raf = requestAnimationFrame(loop);
      else { S.h = 0; draw(now); }
    }
    function kick() { if (!S.raf) S.raf = requestAnimationFrame(loop); }
    function uv(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1), (e.clientY - r.top) / (r.height || 1)]; }
    function inside(p) { var dx = p[0] - 0.5, dy = p[1] - 0.5; return dx * dx + dy * dy < 0.25; }
    box.addEventListener('pointermove', function (e) {
      if (!box.classList.contains('kbp-gl-on')) return;
      var p = uv(e); S.tx = p[0]; S.ty = p[1]; S.ht = inside(p) && e.pointerType === 'mouse' ? 1 : 0; kick();
    });
    box.addEventListener('pointerleave', function () { S.ht = 0; kick(); });
    box.addEventListener('pointerdown', function (e) {
      if (!box.classList.contains('kbp-gl-on')) return;
      var p = uv(e); if (!inside(p)) return;
      S.rips.push({ x: p[0], y: p[1], t: performance.now() }); kick();
    });
    gl.canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); box.classList.remove('kbp-gl-on'); });
    box.appendChild(cv);
    return {
      start: function () { place(); box.classList.add('kbp-gl-on'); window.addEventListener('resize', place); }
    };
  }

  function attach(box, img) {
    if (!box || !img || img.__kbp) return; img.__kbp = true;
    box.classList.add('kbp'); img.classList.add('kbp-img');
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    var shown = false, visible = false, loaded = false, fx, timer = 0, r1 = 0;
    function go() {
      if (shown || !visible || !loaded) return; shown = true;
      box.classList.add('has-img');
      r1 = requestAnimationFrame(function () { r1 = requestAnimationFrame(function () { box.classList.add('kbp-on'); }); });
      timer = setTimeout(function () {
        box.classList.add('kbp-done');
        try {
          if (fx === undefined) { fx = setupGL(box, img) || null; if (fx) fx.start(); }
          else if (fx) box.classList.add('kbp-gl-on');
        } catch (e) { fx = null; /* plain image stays */ }
      }, reduce ? 0 : 1750);
    }
    /* Out of view: put the portrait back to its unpainted state, so it paints in again next time. */
    function reset() {
      if (!shown) return; shown = false;
      clearTimeout(timer); cancelAnimationFrame(r1);
      box.classList.add('kbp-reset');
      box.classList.remove('kbp-on', 'kbp-done', 'kbp-gl-on');
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
