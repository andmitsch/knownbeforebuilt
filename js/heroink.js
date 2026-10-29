/* Known Before Built: the hero ring stays alive.
   The ring paints itself once (circle-paint.webp, ~2 s). After that a WebGL layer takes over with the identical
   final frame (circle-static.webp) and lets it breathe: the wet paint flows a little, a soft light travels round
   the ring, now and then a small hive of glints twinkles on the thick paint, a few orange motes drift past it,
   and a cursor moving over the brush sets off a few brighter glints scattered around it. Same material as the plasma stream further down.
   The swap is a single frame onto an identical picture, then the motion eases in over a few seconds. Paused when off screen or in a hidden tab;
   reduced motion and no WebGL keep the plain image.
   data-ink-mode="glisten" (the brush beside the author's note): no paint-in, no flow; the motes drift past a still brush
   with quieter glints, hives and light (data-ink-glisten), set up once it comes near the viewport.
   Optional watercolor intro (data-ink-intro="watercolor" on the image, which then starts hidden and should show the
   still): instead of the painted animation the ring is laid down in watercolor - eight translucent brush strokes run
   clockwise round it at different radii, with brush pressure, dry-brush streaks, pigment gathering at the wet edges
   and paper granulation; then the thick paint settles on top along the original brush path and the washes dry away
   (data-ink-halo="0..1" keeps a faint wash behind the ring). Ends on the identical still, then the glistening starts. */
(function () {
  if (window.KBHeroInk) return;
  var FS = [
    'precision highp float;',
    'uniform sampler2D tex; uniform vec2 R; uniform float T; uniform float K;',
    'uniform vec4 SP[5]; uniform float SR[5]; uniform vec4 TP[24];',
    'uniform vec2 CC; uniform float FL; uniform float GA; uniform float UR; uniform float MS; uniform float MF;',
    'uniform float W; uniform float HL; uniform vec3 BG; uniform sampler2D BT; uniform vec4 ST[8]; uniform vec4 SU[8];',
    'varying vec2 vUv;',
    'float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}',
    'float nz(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),mix(dot(h2(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(h2(i+vec2(1.,1.)),f-vec2(1.,1.)),u.x),u.y);}',
    'void main(){',
    ' vec2 uv=vUv; vec2 C=CC; vec2 p=uv-C; p.x*=R.x/R.y;',
    ' float r=length(p); float a=atan(p.y,p.x);',
    // slow sway of the whole stroke (about one degree) and wet-paint flow along and across the ring
    ' float sw=(.016*sin(T*.13)+.006*sin(T*.31+1.))*K*FL; float ca=cos(sw), sa=sin(sw);',
    ' vec2 q=vec2(ca*p.x-sa*p.y, sa*p.x+ca*p.y);',
    ' vec2 tang=vec2(-sin(a),cos(a)); vec2 rad=vec2(cos(a),sin(a));',
    ' float f1=nz(vec2(a*2.2+T*.11, r*9.-T*.07)); float f2=nz(vec2(a*5.1-T*.17, r*21.+T*.05));',
    ' vec2 d=(tang*(f1*.0085+f2*.0034)+rad*(f2*.0045))*K*FL;',
    ' vec2 s=q+d; s.x*=R.y/R.x; s+=C;',
    ' vec4 c=texture2D(tex,s);',
    // light travelling round the ring (one turn ~7.5 s) plus a second, fainter one the other way
    ' float ph=T*.84; float da=abs(mod(a-ph+3.14159,6.28318)-3.14159); float db=abs(mod(a+ph*.62+1.2+3.14159,6.28318)-3.14159);',
    ' float lit=exp(-da*da/.22)+.45*exp(-db*db/.12);',
    ' float paint=c.a; float lum=dot(c.rgb,vec3(.3,.55,.15))/max(paint,.001);',
    ' float sheen=lit*paint*smoothstep(.25,.9,lum)*(.55+.45*nz(vec2(a*14.-T*.6,r*30.)));',
    ' vec3 col=c.rgb+vec3(1.,.84,.62)*sheen*.62*K*GA;',
    // fine glints in the paint, sparse and short
    ' vec2 g=uv*vec2(R.x,R.y)/7.; vec2 gi=floor(g); float rr=hs(gi); vec2 go=fract(g)-.5-(vec2(hs(gi+3.1),hs(gi+7.3))-.5)*.5;',
    ' float tw=pow(max(0.,sin(T*1.7+rr*60.)),14.)*step(.93,rr); float glint=tw*exp(-dot(go,go)*30.)*paint*K;',
    ' col+=vec3(1.,.93,.82)*glint*.8*GA;',
    // hives of glistening: now and then a small cluster of glints on the thick paint twinkles one after another,
    // a touch brighter and larger than the scattered glints (placed and timed from JS; SR = seed + progress)
    ' float spk=0.;',
    ' for(int i=0;i<5;i++){vec4 S=SP[i]; if(S.w<.002) continue;',
    '  float sd=floor(SR[i]), x=fract(SR[i]); vec2 q=(uv-S.xy)*R; float rp=S.z*R.y, u=R.y/UR, h=0.;',
    '  for(int j=0;j<6;j++){float fj=float(j);',
    '   vec2 o=(vec2(hs(vec2(sd,fj+.5)),hs(vec2(fj+.5,sd+1.7)))*2.-1.)*rp;',
    '   float st=hs(vec2(sd+fj,3.3))*.5, lx=clamp((x-st)/.5,0.,1.), b=pow(sin(3.14159*lx),3.);',
    '   float sz=(1.1+.9*hs(vec2(sd,fj+9.1)))*u; vec2 dq=q-o;',
    '   float pt=exp(-dot(dq,dq)/(sz*sz))+.28*(exp(-abs(dq.x)/(sz*2.2))*exp(-dq.y*dq.y/(sz*sz*.12))+exp(-abs(dq.y)/(sz*2.2))*exp(-dq.x*dq.x/(sz*sz*.12)));',
    '   h+=pt*b;}',
    '  spk+=h*S.w;}',
    ' spk*=K*1.45*GA;',
    ' vec3 sc=vec3(1.,.97,.91)*spk*paint; col+=sc; float sA=0.;',
    // cursor trail: where the pointer passes over the brush, a few brighter glints light up and fade (TP: x, y, life, seed)
    ' float tr=0.; vec2 qq=uv*R; float u2=R.y/UR;',
    ' for(int i=0;i<24;i++){vec4 P=TP[i]; if(P.z<=0.) continue; vec2 dq=qq-P.xy*R; if(dot(dq,dq)>144.*u2*u2) continue; float ag=1.-P.z;',
    '  float st=hs(vec2(P.w,3.3))*.3, lx=clamp((ag-st)/(1.-st),0.,1.), b=smoothstep(0.,.15,lx)*pow(1.-lx,1.4)*(.8+.2*sin(T*7.+P.w));',
    '  float sz=(1.1+.8*hs(vec2(P.w,9.1)))*u2;',
    '  tr+=(exp(-dot(dq,dq)/(sz*sz))+.28*(exp(-abs(dq.x)/(sz*2.2))*exp(-dq.y*dq.y/(sz*sz*.12))+exp(-abs(dq.y)/(sz*2.2))*exp(-dq.x*dq.x/(sz*sz*.12))))*b;}',
    ' col+=vec3(1.,.97,.91)*tr*1.3*K*GA*paint;',
    // motes drifting round the ring. A share of them (MF) float in front of the paint: larger, softer, paler and a little
    // faster, like specks out of focus near the lens; the rest pass behind it. The two layers give the brush depth.
    ' float m=0., mf=0.;',
    ' for(int i=0;i<22;i++){float fi=float(i); float sp=.035+.05*hs(vec2(fi,1.)); float dir=hs(vec2(fi,2.))>.5?1.:-1.;',
    '  float fr=step(hs(vec2(fi,7.)),MF);',
    '  float ang=hs(vec2(fi,3.))*6.2832+T*sp*dir*(1.+.6*fr); float rad0=.30+.17*hs(vec2(fi,4.))+.025*sin(T*.21+fi);',
    '  vec2 mp=vec2(cos(ang),sin(ang))*rad0; mp.y+=.012*sin(T*.4+fi*1.7);',
    '  float sz=(.0026+.0034*hs(vec2(fi,5.)))*MS*(1.+.8*fr);',
    '  float life=.5+.5*sin(T*(.18+.12*hs(vec2(fi,6.)))+fi*2.1);',
    '  vec2 dd=p-mp; float g=exp(-dot(dd,dd)/(sz*sz))*life*life; m+=g*(1.-fr); mf+=g*fr;}',
    ' m*=K*.85; mf=min(mf*K*.55,1.);',
    ' vec3 mc=vec3(.98,.55,.16);',
    ' float A=clamp(c.a+m*(1.-c.a),0.,1.); A=clamp(A+sA*(1.-A),0.,1.);',
    ' col=col+mc*m*(1.-c.a);',
    ' col=col*(1.-mf)+vec3(1.,.8,.56)*mf; A=A+mf*(1.-A);',
    // watercolor intro (W = seconds since it began; < 0 = off). Stroke order follows the original brush: it starts just
    // left of 12 o'clock and runs clockwise. BT holds the ring's alpha blurred at three radii (r small, b medium, g large).
    ' if(W>=0.){',
    '  float px=R.y/669.;',
    '  float au=fract((a+1.955)/6.28318);',                                     // 0 at the brush start, clockwise
    '  vec4 bm=texture2D(BT,uv);',
    '  float near=.35+.65*smoothstep(.04,.45,bm.b);',                            // strokes sit where the final ring is
    '  float gr=.8+.3*nz(uv*R/(2.6*px))+.25*nz(uv*R/(13.*px));',              // paper granulation
    '  float dn=0., hu=0., hw=0.;',
    '  for(int i=0;i<8;i++){vec4 G=ST[i]; vec4 U=SU[i]; if(U.z<=0.) continue;',
    '   float sq=fract(au-G.z); if(sq>G.w) continue; float q=sq/G.w;',          // position along this stroke 0..1
    '   float lay=(W-U.x)/U.y-q; if(lay<=0.) continue;',                          // the brush has not reached here yet
    '   float rc=G.x+.022*nz(vec2(q*5.,U.w))+.007*nz(vec2(q*21.,U.w+4.));',
    '   float pr=smoothstep(0.,.09,q)*(1.-smoothstep(.82,1.,q));',               // pressure: tapered start and lift-off
    '   float wd=G.y*(.65+.5*(nz(vec2(q*4.,U.w+9.))*.5+.5))*mix(.35,1.,pr);',
    '   float dd=abs(r-rc)+.006*nz(uv*R/(6.*px)+U.w)+.004*nz(uv*R/(2.5*px));',     // ragged edge
    '   float hd=.0015+.006*smoothstep(-.2,.6,nz(vec2(q*7.,U.w+2.)));',            // edge hardness varies (wet-in-wet vs dry)
    '   float ins=1.-smoothstep(wd-hd,wd+hd,dd); if(ins<=0.) continue;',
    '   float rim=ins*smoothstep(wd*.55,wd,dd)*(1.4-60.*hd);',                     // pigment gathers at the wet edge
    '   float str=.55+.45*smoothstep(-.35,.35,nz(vec2(q*9.,(r-rc)/max(wd,.001)*3.+U.w)));',   // dry-brush streaks along the stroke
    '   float fr=smoothstep(0.,.05,lay);',                                         // soft wet front where the brush is
    '   float dl=(ins*str*(.75+.5*(nz(uv*6.+U.w)*.5+.5))+.45*rim+.6*ins*exp(-lay/.035))*U.z*fr;',   // + pigment pooling at the brush
    '   dn+=dl; hu+=dl*(fract(U.w*.37)-.5); hw+=dl;}',
    '  dn*=gr*near;',
    '  float ag=max(0.,W-1.6); dn*=1.+.15*exp(-ag/.8);',                           // wet reads darker, dries lighter
    '  dn*=mix(1.,HL,smoothstep(2.75,3.45,W));',                                  // washes dry away (or stay faintly: HL)
    '  float h=hu/max(hw,.001)*1.1+.35*nz(uv*3.5+2.2);',                              // each stroke a slightly different orange
    '  vec3 Tr=exp(-vec3(.015+.05*max(h,0.),.78+.2*h,2.9-.45*h)*dn); float wa=clamp(dn*7.,0.,1.);',
    '  float f4=(W-1.05)/1.65; float v4=smoothstep(0.,.08,f4-au*.97-.06*nz(vec2(r*12.,a*3.))-.03*nz(uv*R/(20.*px)));',
    '  col*=v4; A*=v4;',                                                         // the thick paint settles along the same path
    '  col+=BG*Tr*wa*(1.-A); A+=wa*(1.-A);',
    ' }',
    ' gl_FragColor=vec4(min(col,vec3(A)),A);',
    '}'
  ].join('\n');
  var VS = 'attribute vec2 p;varying vec2 vUv;void main(){vUv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';

  function attach(img, staticSrc) {
    if (!img || img.__kbInk) return; img.__kbInk = 1;
    var WC = img.getAttribute('data-ink-intro') === 'watercolor', WDUR = 3.45;
    var bail = function () { if (WC) img.style.visibility = 'visible'; };   // the watercolor variant starts with the image hidden
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return bail();
    var cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return bail();
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return bail();
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return bail();
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uK = gl.getUniformLocation(pr, 'K');
    var uSP = gl.getUniformLocation(pr, 'SP[0]'), uSR = gl.getUniformLocation(pr, 'SR[0]'), uTP = gl.getUniformLocation(pr, 'TP[0]');
    var uW = gl.getUniformLocation(pr, 'W'), uHL = gl.getUniformLocation(pr, 'HL'), uBG = gl.getUniformLocation(pr, 'BG'), uST = gl.getUniformLocation(pr, 'ST[0]'), uSU = gl.getUniformLocation(pr, 'SU[0]');
    gl.uniform1f(uW, -1);
    // data-ink-mode="glisten" (the brush beside the author's note): no paint-in and no wet flow - the glints, the hives,
    // the light travelling round, the cursor glints and the motes. data-ink-center="x y" is the ring's centre in that image
    // (fractions), data-ink-ref the height in CSS px at which the glints have their hero size (they scale with the ring),
    // data-ink-glisten 0..1 how strongly the glints, hives and light show (1 = as on the hero), data-ink-motes the motes' size,
    // data-ink-front 0..1 the share of motes in front of the paint.
    var GLI = img.getAttribute('data-ink-mode') === 'glisten';
    var cc = (img.getAttribute('data-ink-center') || '.51 .509').split(/[\s,]+/).map(parseFloat);
    gl.uniform2f(gl.getUniformLocation(pr, 'CC'), cc[0], cc[1]);
    gl.uniform1f(gl.getUniformLocation(pr, 'FL'), GLI ? 0 : 1);
    gl.uniform1f(gl.getUniformLocation(pr, 'MS'), parseFloat(img.getAttribute('data-ink-motes')) || 1);
    gl.uniform1f(gl.getUniformLocation(pr, 'MF'), parseFloat(img.getAttribute('data-ink-front')) || 0);
    var ga = parseFloat(img.getAttribute('data-ink-glisten')); gl.uniform1f(gl.getUniformLocation(pr, 'GA'), ga >= 0 ? Math.min(1, ga) : 1);
    gl.uniform1f(gl.getUniformLocation(pr, 'UR'), parseFloat(img.getAttribute('data-ink-ref')) || 669);
    // cursor over the brush (mouse and pen only): every ~22 px of movement one or two single glints light up
    // somewhere within ~50 px around the cursor, only where there is paint; each glistens for about 1.3 s
    var trail = [], tpA = new Float32Array(96), lastP = null, LIFE = 1300, amap = null, aw = 0, ah = 0;
    function onPaint(x, y) { if (!amap) return true; var i = Math.min(aw - 1, Math.max(0, (x * aw) | 0)), j = Math.min(ah - 1, Math.max(0, (y * ah) | 0)); return amap[j * aw + i] > 200; }
    function onMove(e) {
      if (!ready || e.pointerType === 'touch') return;
      var r = cv.getBoundingClientRect(); if (!r.width) return;
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, now = performance.now();
      if (x < 0 || x > 1 || y < 0 || y > 1) { lastP = null; return; }
      var spray = function () {
        var m = Math.random() < 0.35 ? 2 : 1;
        for (var k = 0; k < m; k++) for (var tries = 0; tries < 5; tries++) {
          var ang = Math.random() * 6.2832, rad = 50 * Math.sqrt(Math.random());
          var px = x + Math.cos(ang) * rad / r.width, py = y + Math.sin(ang) * rad / r.height;
          if (onPaint(px, py)) { trail.push({ x: px, y: py, t: now, seed: 1 + ((Math.random() * 900) | 0) }); if (trail.length > 24) trail.shift(); break; }
        }
      };
      if (!lastP) { lastP = { x: x, y: y }; spray(); }
      else if (Math.hypot((x - lastP.x) * r.width, (y - lastP.y) * r.height) > 22) { lastP = { x: x, y: y }; spray(); }
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
        aw = w; ah = h; amap = new Uint8Array(w * h); for (var q = 0; q < w * h; q++) amap[q] = d[q * 4 + 3];
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
      s.t0 = t + (first ? 0.15 + slots.indexOf(s) * 0.45 + Math.random() * 0.5 : 0.45 + Math.random() * 2.6);
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
    // watercolor: the ring's alpha blurred at three radii (one texture: r small, b medium, g large), the strokes, paper colour
    var wStart = 0, replayKey = null;
    function blurMaps() {
      var w = 160, h = Math.round(w * src.naturalHeight / src.naturalWidth), oc = document.createElement('canvas');
      oc.width = w; oc.height = h; var cx = oc.getContext('2d'); cx.drawImage(src, 0, 0, w, h);
      var d = cx.getImageData(0, 0, w, h).data, a = new Float32Array(w * h), i;
      for (i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] / 255;
      var box = function (s, r) {   // three separable box passes ~ gaussian
        var o = new Float32Array(s), tmp = new Float32Array(s.length), x, y, k, acc;
        o.set(s);
        for (var pass = 0; pass < 3; pass++) {
          for (y = 0; y < h; y++) for (x = 0; x < w; x++) { acc = 0; for (k = -r; k <= r; k++) acc += o[y * w + Math.min(w - 1, Math.max(0, x + k))]; tmp[y * w + x] = acc / (2 * r + 1); }
          for (y = 0; y < h; y++) for (x = 0; x < w; x++) { acc = 0; for (k = -r; k <= r; k++) acc += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x]; o[y * w + x] = acc / (2 * r + 1); }
        }
        return o;
      };
      var dil = function (s, r) {   // max filter: thin strands get as much wash as the thick band
        var o = new Float32Array(s.length), tmp = new Float32Array(s.length), x, y, k, m;
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) { m = 0; for (k = -r; k <= r; k++) m = Math.max(m, s[y * w + Math.min(w - 1, Math.max(0, x + k))]); tmp[y * w + x] = m; }
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) { m = 0; for (k = -r; k <= r; k++) m = Math.max(m, tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x]); o[y * w + x] = m; }
        return o;
      };
      var bin = new Float32Array(w * h); for (i = 0; i < w * h; i++) bin[i] = a[i] > 0.12 ? 1 : 0;
      var dl = dil(bin, 2);
      var sm = box(a, 1), md = box(dl, 3), lg = box(dl, 5), px = new Uint8Array(w * h * 4);
      for (i = 0; i < w * h; i++) { px[i * 4] = Math.min(255, sm[i] * 255); px[i * 4 + 1] = Math.min(255, lg[i] * 255); px[i * 4 + 2] = Math.min(255, md[i] * 255); px[i * 4 + 3] = 255; }
      var bt = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bt);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(pr, 'BT'), 1); gl.activeTexture(gl.TEXTURE0);
    }
    // the watercolor strokes: radius, half width, start (fraction of a turn from the brush start), length (turns) | start s, duration s, density
    var STROKES = [
      [0.335, 0.075, 0.00, 1.03, 0.00, 1.40, 0.22],   // the wide pale first wash, all the way round
      [0.372, 0.040, 0.04, 0.92, 0.22, 1.30, 0.30],
      [0.300, 0.030, 0.50, 0.70, 0.45, 1.05, 0.30],   // inner, left side
      [0.405, 0.022, 0.08, 0.55, 0.60, 0.85, 0.38],   // outer, right side
      [0.340, 0.048, 0.07, 0.58, 0.72, 1.00, 0.50],   // the deep one under the thick band
      [0.268, 0.016, 0.28, 0.50, 0.90, 0.80, 0.38],
      [0.432, 0.012, 0.58, 0.48, 1.00, 0.75, 0.34],
      [0.318, 0.020, 0.80, 0.38, 1.10, 0.60, 0.36]    // closing the circle top left
    ];
    function strokes() {
      var a = new Float32Array(32), b = new Float32Array(32);
      STROKES.forEach(function (S, i) {
        a[i * 4] = S[0]; a[i * 4 + 1] = S[1]; a[i * 4 + 2] = S[2]; a[i * 4 + 3] = S[3];
        b[i * 4] = S[4]; b[i * 4 + 1] = S[5]; b[i * 4 + 2] = S[6]; b[i * 4 + 3] = 1 + Math.random() * 50;
      });
      gl.uniform4fv(uST, a); gl.uniform4fv(uSU, b);
    }
    function paper() {
      for (var el = img.parentNode; el && el.nodeType === 1; el = el.parentNode) {
        var m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (m && (m.length < 4 || +m[3] > 0.5)) return [m[0] / 255, m[1] / 255, m[2] / 255];
      }
      return [236 / 255, 232 / 255, 229 / 255];
    }
    function halo() { var v = parseFloat(img.getAttribute('data-ink-halo')); return v > 0 ? Math.min(1, v) : 0; }
    gl.uniform1i(gl.getUniformLocation(pr, 'tex'), 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var src = new Image(); src.decoding = 'async';
    src.src = staticSrc || img.getAttribute('data-ink-src') || (GLI ? img.currentSrc || img.src : img.src.replace('circle-paint', 'circle-static'));
    var ready = false, t0 = 0, raf = 0, last = 0, vis = true, kStart = 0;
    cv.style.cssText = 'position:absolute;pointer-events:none;opacity:0';
    function place() {
      cv.style.left = img.offsetLeft + 'px'; cv.style.top = img.offsetTop + 'px';
      cv.style.width = img.offsetWidth + 'px'; cv.style.height = img.offsetHeight + 'px';
      // render at the ring's real on-screen pixel size (page zoom and Retina included), as sharp as the image it replaces
      // (measured on the parent: a breathing image's own box includes its momentary scale)
      var dpr = Math.min(2, window.devicePixelRatio || 1), pe = img.parentNode, pr0 = pe.getBoundingClientRect(), z = pe.offsetWidth ? pr0.width / pe.offsetWidth : 1;
      var w = Math.max(2, Math.round(img.offsetWidth * z * dpr)), h = Math.max(2, Math.round(img.offsetHeight * z * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); if (tx) upload(); }
    }
    // the ring as a texture. A source much larger than the canvas is first shrunk by the browser's own resampling, so
    // the first frame matches the <img> it replaces (a straight GPU minification would alias and look grainier)
    var tx = null, upW = 0, upH = 0;
    function upload() {
      var s = src, w = cv.width, h = cv.height;
      if (src.naturalWidth > w * 1.25) {
        if (upW === w && upH === h) return;
        var oc = document.createElement('canvas'); oc.width = w; oc.height = h; var cx = oc.getContext('2d');
        cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.drawImage(src, 0, 0, w, h); s = oc; upW = w; upH = h;
      } else if (tx) return;
      if (!tx) tx = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    // a breathing image (.breathe): the canvas breathes with it, in step
    function breath() { try { var a = img.getAnimations && img.getAnimations()[0], b = cv.getAnimations && cv.getAnimations()[0]; if (a && b) b.currentTime = a.currentTime; } catch (_) {} }
    function frame(now) {
      raf = 0; if (!vis || document.hidden) return;
      if (now - last >= 29.3) {         // capped at 30 fps; the 4 ms slack keeps timing jitter from dropping frames (a tight 32 ms cap stuttered)
        last = now;
        if (WC) {
          var rk = img.getAttribute('data-ink-replay');
          if (replayKey !== null && rk !== replayKey) { wStart = now; kStart = now + WDUR * 1000; strokes(); }
          replayKey = rk;
          var w = (now - wStart) / 1000, hl = halo();
          gl.uniform1f(uW, w < WDUR ? w : (hl > 0 ? 99 : -1)); gl.uniform1f(uHL, hl);
        }
        var t = (now - t0) / 1000, k = Math.min(1, Math.max(0, (now - kStart) / 1200)); k = 1 - (1 - k) * (1 - k);   // eases in fast: glistening shows within a few hundred ms
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, t + 40.0); gl.uniform1f(uK, k); sparkles(t); trailU(now);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && ready && vis && !document.hidden) raf = requestAnimationFrame(frame); }
    function start() {
      if (ready) return;
      if (img.classList.contains('breathe')) cv.className = 'breathe';
      var zi = getComputedStyle(img).zIndex; if (zi !== 'auto') cv.style.zIndex = zi;
      img.parentNode.insertBefore(cv, img.nextSibling); place(); upload();
      findSpots(); gl.uniform4fv(uSP, spA); gl.uniform1fv(uSR, spR);
      ready = true; t0 = performance.now(); kStart = t0;
      if (WC) {
        blurMaps(); strokes(); var bg = paper(); gl.uniform3f(uBG, bg[0], bg[1], bg[2]);
        wStart = t0; kStart = t0 + WDUR * 1000; replayKey = img.getAttribute('data-ink-replay');
        img.style.visibility = 'hidden'; cv.style.opacity = '1';
      }
      // the first frames (motion still 0) are pixel for pixel the image's last frame: swap in one step, no crossfade
      // (a fade between two layers reads as a blurry double image), then let the motion ease in
      last = 0; frame(performance.now());
      if (!WC) requestAnimationFrame(function () { requestAnimationFrame(function () { breath(); cv.style.opacity = '1'; img.style.visibility = 'hidden'; }); });
      if (window.ResizeObserver) new ResizeObserver(place).observe(img); else window.addEventListener('resize', place);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }, { rootMargin: '120px 0px' }).observe(cv);
      document.addEventListener('visibilitychange', kick);
      window.addEventListener('pointermove', onMove, { passive: true });
      kick();
    }
    // The paint-in plays from the moment the image is first painted. If that happened before this script ran, find
    // that moment: element timing (Chromium) gives it exactly; otherwise the later of image arrival and first paint.
    var loadedAt = 0;
    function shownAt(cb) {
      if (loadedAt) return cb(loadedAt);
      var seen = 0, po = null;   // earliest paint of this image (it can be reported again later; the first one is when the animation starts)
      try {
        po = new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { var t = e.renderTime || e.loadTime; if (e.element === img && t && (!seen || t < seen)) seen = t; }); });
        po.observe({ type: 'element', buffered: true });
      } catch (_) {}
      setTimeout(function () {
        try { if (po) po.disconnect(); } catch (_) {}
        if (seen) return cb(seen);
        var t = 0;
        try { var pe = performance.getEntriesByName(img.currentSrc || img.src)[0]; if (pe) t = pe.responseEnd; } catch (_) {}
        try { performance.getEntriesByType('paint').forEach(function (e) { if (e.name === 'first-paint' || e.name === 'first-contentful-paint') t = Math.max(t, e.startTime); }); } catch (_) {}
        cb(t || performance.now());
      }, 300);
    }
    var go = function () {
      if (GLI) {   // nothing to wait for; the GL layer is set up once the brush comes near the viewport
        var begin = function () { (src.decode ? src.decode() : Promise.resolve()).then(start, function () {}); };
        if (!('IntersectionObserver' in window)) return begin();
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); begin(); } }, { rootMargin: '600px 0px' });
        return io.observe(img);
      }
      if (WC) return (src.decode ? src.decode() : Promise.resolve()).then(start, bail);
      shownAt(function (base) {
        var end = base + 2200;   // 60 frames x 34 ms, plus a small margin
        (src.decode ? src.decode() : Promise.resolve()).then(function () { setTimeout(start, Math.max(0, end - performance.now())); }, function () {});
      });
    };
    if (img.complete) go(); else img.addEventListener('load', function () { loadedAt = performance.now(); go(); }, { once: true });
  }
  window.KBHeroInk = { attach: attach };
  var auto = function () { document.querySelectorAll('.top-img-2, img[data-ink-mode]').forEach(function (el) { attach(el); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
