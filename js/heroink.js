/* Known Before Built: the hero ring stays alive.
   The ring paints itself once (circle-paint.webp, ~2 s). After that a WebGL layer takes over with the identical
   final frame (circle-static.webp) and lets it breathe: the wet paint flows a little, a soft light travels round
   the ring, now and then a small hive of glints twinkles on the thick paint, a few orange motes drift past it,
   and a cursor moving over the brush leaves a short trail of brighter glints. Same material as the plasma stream further down.
   Motion fades in over a few seconds, so the switch is invisible. Paused when off screen or in a hidden tab;
   reduced motion and no WebGL keep the plain image. */
(function () {
  if (window.KBHeroInk) return;
  var FS = [
    'precision highp float;',
    'uniform sampler2D tex; uniform vec2 R; uniform float T; uniform float K;',
    'uniform vec4 SP[5]; uniform float SR[5]; uniform vec4 TP[24];',
    'varying vec2 vUv;',
    'float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}',
    'float nz(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),mix(dot(h2(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(h2(i+vec2(1.,1.)),f-vec2(1.,1.)),u.x),u.y);}',
    'void main(){',
    ' vec2 uv=vUv; vec2 C=vec2(.51,.509); vec2 p=uv-C; p.x*=R.x/R.y;',
    ' float r=length(p); float a=atan(p.y,p.x);',
    // slow sway of the whole stroke (about one degree) and wet-paint flow along and across the ring
    ' float sw=.016*sin(T*.13)+.006*sin(T*.31+1.); float ca=cos(sw), sa=sin(sw);',
    ' vec2 q=vec2(ca*p.x-sa*p.y, sa*p.x+ca*p.y);',
    ' vec2 tang=vec2(-sin(a),cos(a)); vec2 rad=vec2(cos(a),sin(a));',
    ' float f1=nz(vec2(a*2.2+T*.11, r*9.-T*.07)); float f2=nz(vec2(a*5.1-T*.17, r*21.+T*.05));',
    ' vec2 d=(tang*(f1*.0085+f2*.0034)+rad*(f2*.0045))*K;',
    ' vec2 s=q+d; s.x*=R.y/R.x; s+=C;',
    ' vec4 c=texture2D(tex,s);',
    // light travelling round the ring (one turn ~7.5 s) plus a second, fainter one the other way
    ' float ph=T*.84; float da=abs(mod(a-ph+3.14159,6.28318)-3.14159); float db=abs(mod(a+ph*.62+1.2+3.14159,6.28318)-3.14159);',
    ' float lit=exp(-da*da/.22)+.45*exp(-db*db/.12);',
    ' float paint=c.a; float lum=dot(c.rgb,vec3(.3,.55,.15))/max(paint,.001);',
    ' float sheen=lit*paint*smoothstep(.25,.9,lum)*(.55+.45*nz(vec2(a*14.-T*.6,r*30.)));',
    ' vec3 col=c.rgb+vec3(1.,.84,.62)*sheen*.62*K;',
    // fine glints in the paint, sparse and short
    ' vec2 g=uv*vec2(R.x,R.y)/7.; vec2 gi=floor(g); float rr=hs(gi); vec2 go=fract(g)-.5-(vec2(hs(gi+3.1),hs(gi+7.3))-.5)*.5;',
    ' float tw=pow(max(0.,sin(T*1.7+rr*60.)),14.)*step(.93,rr); float glint=tw*exp(-dot(go,go)*30.)*paint*K;',
    ' col+=vec3(1.,.93,.82)*glint*.8;',
    // hives of glistening: now and then a small cluster of glints on the thick paint twinkles one after another,
    // a touch brighter and larger than the scattered glints (placed and timed from JS; SR = seed + progress)
    ' float spk=0.;',
    ' for(int i=0;i<5;i++){vec4 S=SP[i]; if(S.w<.002) continue;',
    '  float sd=floor(SR[i]), x=fract(SR[i]); vec2 q=(uv-S.xy)*R; float rp=S.z*R.y, u=R.y/669., h=0.;',
    '  for(int j=0;j<6;j++){float fj=float(j);',
    '   vec2 o=(vec2(hs(vec2(sd,fj+.5)),hs(vec2(fj+.5,sd+1.7)))*2.-1.)*rp;',
    '   float st=hs(vec2(sd+fj,3.3))*.5, lx=clamp((x-st)/.5,0.,1.), b=pow(sin(3.14159*lx),3.);',
    '   float sz=(1.1+.9*hs(vec2(sd,fj+9.1)))*u; vec2 dq=q-o;',
    '   float pt=exp(-dot(dq,dq)/(sz*sz))+.28*(exp(-abs(dq.x)/(sz*2.2))*exp(-dq.y*dq.y/(sz*sz*.12))+exp(-abs(dq.y)/(sz*2.2))*exp(-dq.x*dq.x/(sz*sz*.12)));',
    '   h+=pt*b;}',
    '  spk+=h*S.w;}',
    ' spk*=K*1.45;',
    ' vec3 sc=vec3(1.,.97,.91)*spk*paint; col+=sc; float sA=0.;',
    // cursor trail: where the pointer passes over the brush, a few brighter glints light up and fade (TP: x, y, life, seed)
    ' float tr=0.; vec2 qq=uv*R; float u2=R.y/669.;',
    ' for(int i=0;i<24;i++){vec4 P=TP[i]; if(P.z<=0.) continue; vec2 dc=qq-P.xy*R; if(dot(dc,dc)>900.*u2*u2) continue; float ag=1.-P.z;',
    '  for(int j=0;j<3;j++){float fj=float(j); vec2 o=(vec2(hs(vec2(P.w,fj+.5)),hs(vec2(fj+.5,P.w+1.7)))*2.-1.)*9.*u2;',
    '   float st=hs(vec2(P.w+fj,3.3))*.22, lx=clamp((ag-st)/(1.-st),0.,1.), b=smoothstep(0.,.08,lx)*pow(1.-lx,1.6)*(.8+.2*sin(T*9.+fj*2.1+P.w));',
    '   float sz=(1.1+.9*hs(vec2(P.w,fj+9.1)))*u2; vec2 dq=dc-o;',
    '   tr+=(exp(-dot(dq,dq)/(sz*sz))+.3*(exp(-abs(dq.x)/(sz*2.2))*exp(-dq.y*dq.y/(sz*sz*.12))+exp(-abs(dq.y)/(sz*2.2))*exp(-dq.x*dq.x/(sz*sz*.12))))*b;}}',
    ' col+=vec3(1.,.97,.91)*tr*1.6*K*paint;',
    // motes drifting round the ring
    ' float m=0.;',
    ' for(int i=0;i<22;i++){float fi=float(i); float sp=.035+.05*hs(vec2(fi,1.)); float dir=hs(vec2(fi,2.))>.5?1.:-1.;',
    '  float ang=hs(vec2(fi,3.))*6.2832+T*sp*dir; float rad0=.30+.17*hs(vec2(fi,4.))+.025*sin(T*.21+fi);',
    '  vec2 mp=vec2(cos(ang),sin(ang))*rad0; mp.y+=.012*sin(T*.4+fi*1.7);',
    '  float sz=(.0026+.0034*hs(vec2(fi,5.)));',
    '  float life=.5+.5*sin(T*(.18+.12*hs(vec2(fi,6.)))+fi*2.1);',
    '  vec2 dd=p-mp; m+=exp(-dot(dd,dd)/(sz*sz))*life*life;}',
    ' m*=K*.85;',
    ' vec3 mc=vec3(.98,.55,.16);',
    ' float A=clamp(c.a+m*(1.-c.a),0.,1.); A=clamp(A+sA*(1.-A),0.,1.);',
    ' col=col+mc*m*(1.-c.a);',
    ' gl_FragColor=vec4(min(col,vec3(A)),A);',
    '}'
  ].join('\n');
  var VS = 'attribute vec2 p;varying vec2 vUv;void main(){vUv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';

  function attach(img, staticSrc) {
    if (!img || img.__kbInk) return; img.__kbInk = 1;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uK = gl.getUniformLocation(pr, 'K');
    var uSP = gl.getUniformLocation(pr, 'SP[0]'), uSR = gl.getUniformLocation(pr, 'SR[0]'), uTP = gl.getUniformLocation(pr, 'TP[0]');
    // cursor trail over the brush (mouse and pen only): a point every ~12 px, each glistens for about a second
    var trail = [], tpA = new Float32Array(96), lastP = null, LIFE = 1100;
    function onMove(e) {
      if (!ready || e.pointerType === 'touch') return;
      var r = cv.getBoundingClientRect(); if (!r.width) return;
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, now = performance.now();
      if (x < 0 || x > 1 || y < 0 || y > 1) { lastP = null; return; }
      var add = function (px, py) { trail.push({ x: px, y: py, t: now, seed: 1 + ((Math.random() * 900) | 0) }); if (trail.length > 24) trail.shift(); lastP = { x: px, y: py }; };
      if (!lastP) add(x, y);
      else {
        var dist = Math.hypot((x - lastP.x) * r.width, (y - lastP.y) * r.height), n = Math.min(6, Math.floor(dist / 12));
        for (var k = 1; k <= n; k++) { var f = k / n; add(lastP.x + (x - lastP.x) * f, lastP.y + (y - lastP.y) * f); }
      }
      kick();
    }
    function trailU(now) {
      while (trail.length && now - trail[0].t > LIFE) trail.shift();
      for (var i = 0; i < 24; i++) {
        var P = trail[i];
        tpA[i * 4] = P ? P.x : 0; tpA[i * 4 + 1] = P ? P.y : 0; tpA[i * 4 + 2] = P ? 1 - (now - P.t) / LIFE : 0; tpA[i * 4 + 3] = P ? P.seed : 0;
      }
      gl.uniform4fv(uTP, tpA);
    }
    // sparkles: spots on solid paint, each blooms for about a second, then waits and moves elsewhere
    var spots = [], slots = [], spA = new Float32Array(20), spR = new Float32Array(5);
    function findSpots() {
      try {
        var w = 128, h = Math.round(w * src.naturalHeight / src.naturalWidth), oc = document.createElement('canvas');
        oc.width = w; oc.height = h; var cx = oc.getContext('2d'); cx.drawImage(src, 0, 0, w, h);
        var d = cx.getImageData(0, 0, w, h).data;
        for (var y = 2; y < h - 2; y++) for (var x = 2; x < w - 2; x++) {
          var o = (y * w + x) * 4;
          if (d[o + 3] > 245 && d[o + 3 - 8] > 245 && d[o + 3 + 8] > 245 && d[o + 3 - w * 8] > 245 && d[o + 3 + w * 8] > 245) spots.push([(x + 0.5) / w, (y + 0.5) / h]);
        }
      } catch (_) { spots = []; }
    }
    function respawn(s, t, first) {
      var p = spots[(Math.random() * spots.length) | 0];
      s.x = p[0]; s.y = p[1]; s.dur = 1.3 + Math.random() * 0.9; s.sz = 0.012 + Math.random() * 0.012; s.seed = 1 + ((Math.random() * 900) | 0);
      s.amp = 0.75 + Math.random() * 0.25;
      s.t0 = t + (first ? 0.8 + Math.random() * 3.5 : 0.45 + Math.random() * 2.6);
    }
    function sparkles(t) {
      if (!spots.length) return;
      for (var i = 0; i < 5; i++) {
        var s = slots[i] || (slots[i] = {}); if (s.t0 === undefined) respawn(s, t, true);
        var x = (t - s.t0) / s.dur; if (x > 1) { respawn(s, t, false); x = -1; }
        var env = x < 0 ? 0 : s.amp;
        spA[i * 4] = s.x; spA[i * 4 + 1] = s.y; spA[i * 4 + 2] = s.sz; spA[i * 4 + 3] = env;
        spR[i] = s.seed + Math.min(0.999, Math.max(0, x));
      }
      gl.uniform4fv(uSP, spA); gl.uniform1fv(uSR, spR);
    }
    gl.uniform1i(gl.getUniformLocation(pr, 'tex'), 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var src = new Image(); src.decoding = 'async';
    src.src = staticSrc || img.getAttribute('data-ink-src') || img.src.replace('circle-paint', 'circle-static');
    var ready = false, t0 = 0, raf = 0, last = 0, vis = true, kStart = 0;
    cv.style.cssText = 'position:absolute;pointer-events:none;opacity:0;transition:opacity .9s cubic-bezier(.22,1,.36,1)';
    function place() {
      cv.style.left = img.offsetLeft + 'px'; cv.style.top = img.offsetTop + 'px';
      cv.style.width = img.offsetWidth + 'px'; cv.style.height = img.offsetHeight + 'px';
      var dpr = Math.min(1.5, window.devicePixelRatio || 1);
      var w = Math.max(2, Math.round(img.offsetWidth * dpr)), h = Math.max(2, Math.round(img.offsetHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    function frame(now) {
      raf = 0; if (!vis || document.hidden) return;
      if (now - last >= 32) {           // ~30 fps is plenty for slow motion
        last = now;
        var t = (now - t0) / 1000, k = Math.min(1, Math.max(0, (now - kStart) / 3200)); k = k * k * (3 - 2 * k);
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, t + 40.0); gl.uniform1f(uK, k); sparkles(t); trailU(now);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && ready && vis && !document.hidden) raf = requestAnimationFrame(frame); }
    function start() {
      if (ready) return;
      img.parentNode.insertBefore(cv, img.nextSibling); place();
      var tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      findSpots(); gl.uniform4fv(uSP, spA); gl.uniform1fv(uSR, spR);
      ready = true; t0 = performance.now(); kStart = t0 + 400;
      // first frame (motion still 0) is the same picture as the image: swap, then let the motion fade in
      last = 0; frame(performance.now());
      requestAnimationFrame(function () { cv.style.opacity = '1'; setTimeout(function () { img.style.visibility = 'hidden'; }, 950); });
      if (window.ResizeObserver) new ResizeObserver(place).observe(img); else window.addEventListener('resize', place);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }, { rootMargin: '120px 0px' }).observe(cv);
      document.addEventListener('visibilitychange', kick);
      window.addEventListener('pointermove', onMove, { passive: true });
      kick();
    }
    // wait for the painted ring to finish (59 frames × 34 ms) and for the still frame to decode
    var go = function () { (src.decode ? src.decode() : Promise.resolve()).then(function () { setTimeout(start, 2300); }, function () {}); };
    if (img.complete) go(); else img.addEventListener('load', go, { once: true });
  }
  window.KBHeroInk = { attach: attach };
  var auto = function () { var el = document.querySelector('.top-img-2'); if (el) attach(el); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
