(window.KBB = window.KBB || {})["main2"] = (function () {
class Component extends DCLogic {
  constructor(props) {
    super(props);
    if (!window.__kbAnchor) { window.__kbAnchor = true;
      document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null; if (!a) return;
        const id = a.getAttribute('href').slice(1); if (!id) return; const el = document.getElementById(id); if (!el) return;
        e.preventDefault();
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const y0 = window.scrollY || document.documentElement.scrollTop; const y1 = y0 + el.getBoundingClientRect().top;
        const dist = Math.abs(y1 - y0); if (reduce || dist < 2) { window.scrollTo(0, y1); return; }
        const D = Math.min(2200, 1000 + dist * 0.35); const t0 = performance.now();
        const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        let stop = false; const cancel = () => { stop = true; };
        window.addEventListener('wheel', cancel, { once: true, passive: true }); window.addEventListener('touchstart', cancel, { once: true, passive: true });
        const step = (n) => { if (stop) return; const k = Math.min(1, (n - t0) / D); window.scrollTo(0, y0 + (y1 - y0) * ease(k)); if (k < 1) requestAnimationFrame(step); else { try { history.replaceState(null, '', '#' + id); } catch (_) {} try { el.focus({ preventScroll: true }); } catch (_) {} } };
        requestAnimationFrame(step);
      });
    }
    this.fxRef = (el) => this.fxAttach(el);
    this.setPortrait = (el) => { if (!el || el.__pw) return; el.__pw = 1; const hide = () => { el.style.visibility = 'hidden'; };
      const show = () => { el.style.visibility = ''; }; el.addEventListener('error', hide); el.addEventListener('load', show);
      if (el.complete && !el.naturalWidth) hide(); };
    this.al = {};
    this.setCirc = (el) => { this.al.c = el; this.alignCirc(); };
    this.setQuote = (el) => { this.al.q = el; this.alignCirc(); };
    this.setWays = (el) => { this.al.w = el; this.alignCirc(); };
    this.setMailRow = (el) => { this.al.m = el; this.alignCirc(); if (el && document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.alignCirc()); if (el) setTimeout(() => this.alignCirc(), 600); };
    this.state = { open: false, ch: 3 };
    this.acc = { bodies: [], bars: [], h: [], from: [], to: [], t0: 0, raf: 0, el: null, prevCh: 3 };
    this.bodySet = []; this.barSet = []; this.glowSet = []; this.glow = [];
    for (let i = 0; i < 9; i++) {
      this.bodySet[i] = (el) => { this.acc.bodies[i] = el; if (el && this.acc.h[i] === undefined) { const h = i === 3 ? el.scrollHeight : 0; this.acc.h[i] = h; el.style.height = h + 'px'; } };
      this.glowSet[i] = (el) => { const G = this.glow[i] || (this.glow[i] = { lv: 0, t0: -1e9, x: 60, y: 38, want: 0 }); G.el = el; if (el && i === 3 && G.want === 0) { G.want = 1; G.lv = 1; G.t0 = -1e9; this.glowPaint(i, performance.now()); } };
      this.barSet[i] = (el) => { this.acc.bars[i] = el; if (el) el.setAttribute('transform', i === 3 ? 'rotate(90)' : 'rotate(0)'); };
    }
    this.setAcc = (el) => { this.acc.el = el; };
    this.rip = { els: [], n: 0, live: [] };
    this.setRipCv = (el) => { if (el && el !== this.rip.cv) { this.rip.cv = el; this.ripGL(el); } };
    this.sp = { x: 0, y: 0, rx: 0, ry: 0, s: 1, vx: 0, vy: 0, vrx: 0, vry: 0, vs: 0, t: { x: 0, y: 0, rx: 0, ry: 0, s: 1 }, raf: 0, last: 0 };
    this.setSpread = (el) => { this.sp.el = el; };
    this.setSpreadShadow = (el) => { this.sp.sh = el; };
    this.zm = { raf: 0, closing: false };
    this.setZoom = (el) => { this.zm.ov = el; if (el) { try { el.focus({ preventScroll: true }); } catch (_) {} this.tryOpen(); } };
    this.setBig = (el) => { this.zm.big = el; if (el) { el.style.opacity = '0'; this.tryOpen(); } };
    this.openSpread = () => { this.setState({ open: true }); };
    this.closeSpread = (e) => { if (e) e.stopPropagation(); this.zoomAnim(false); };
    this.zoomKey = (e) => { if (e.key === 'Escape') this.zoomAnim(false); };
    this.spNear = (e) => {
      const S = this.sp; if (!S.el || this.still() || (this.state && this.state.open)) return;
      const r = S.el.getBoundingClientRect(); const sc = r.width / 460 || 1; const R = 420 * sc;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy);
      let p = Math.max(0, 1 - d / R); p = p * p * (3 - 2 * p);
      S.t = { x: dx / sc * 0.12 * p, y: dy / sc * 0.12 * p, ry: Math.max(-1, Math.min(1, dx / R)) * 12 * p, rx: -Math.max(-1, Math.min(1, dy / R)) * 9 * p, s: 1 + 0.04 * p };
      this.kick();
    };
    this.spFar = () => { this.sp.t = { x: 0, y: 0, rx: 0, ry: 0, s: 1 }; this.kick(); };
  }
  still() { return (this.props.motion ?? true) === false || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  tryOpen() {
    const Z = this.zm; if (!Z.big || !Z.ov || Z.started === Z.big) return; Z.started = Z.big;
    Z.ov.style.background = 'rgba(236,232,229,0)';
    requestAnimationFrame(() => { if (Z.big) { Z.big.style.opacity = ''; this.zoomAnim(true); } });
  }
  step(now) {
    const S = this.sp; S.raf = 0; if (!S.el) return;
    const dt = Math.min(0.033, (now - S.last) / 1000 || 0.016); S.last = now;
    const K = 140, Dm = 16; let moving = false;
    for (const k of ['x', 'y', 'rx', 'ry', 's']) {
      const vk = 'v' + k; const a = K * (S.t[k] - S[k]) - Dm * S[vk];
      S[vk] += a * dt; S[k] += S[vk] * dt;
      if (Math.abs(S.t[k] - S[k]) > (k === 's' ? 0.0005 : 0.02) || Math.abs(S[vk]) > 0.02) moving = true;
    }
    S.el.style.transform = 'translate(' + S.x.toFixed(2) + 'px,' + S.y.toFixed(2) + 'px) rotateX(' + S.rx.toFixed(2) + 'deg) rotateY(' + S.ry.toFixed(2) + 'deg) scale(' + S.s.toFixed(4) + ')';
    if (S.sh) { const lift = (S.s - 1) / 0.04; S.sh.style.transform = 'translateX(' + (S.x * 0.6).toFixed(2) + 'px) scale(' + (1 - 0.08 * lift).toFixed(3) + ')'; S.sh.style.opacity = (1 - 0.3 * lift).toFixed(3); }
    if (moving) S.raf = requestAnimationFrame((n) => this.step(n));
  }
  kick() { if (!this.sp.raf) { this.sp.last = performance.now(); this.sp.raf = requestAnimationFrame((n) => this.step(n)); } }
  componentWillUnmount() { if (this.fxDoc) { document.removeEventListener('pointermove', this.fxDoc); document.removeEventListener('mousemove', this.fxDoc); } cancelAnimationFrame(this.sp.raf); cancelAnimationFrame(this.acc.raf); cancelAnimationFrame(this.rip.raf); }
  componentDidUpdate() {
    const A = this.acc; const cur = this.state && this.state.ch !== undefined ? this.state.ch : 3;
    if (cur === A.prevCh) return; A.prevCh = cur;
    for (let i = 0; i < 9; i++) { const b = A.bodies[i]; if (!b) continue; A.from[i] = A.h[i] || 0; A.to[i] = i === cur ? b.scrollHeight : 0; }
    if (this.still()) { for (let i = 0; i < 9; i++) this.accApply(i, 1); return; }
    A.t0 = performance.now(); cancelAnimationFrame(A.raf); A.raf = requestAnimationFrame((n) => this.accStep(n));
  }
  accApply(i, k) {
    const A = this.acc; const b = A.bodies[i]; if (!b) return;
    const h = A.from[i] + (A.to[i] - A.from[i]) * k; A.h[i] = h; b.style.height = h.toFixed(2) + 'px';
    const full = Math.max(1, b.scrollHeight); const vis = h / full; b.style.opacity = Math.min(1, vis * 1.3).toFixed(3);
    const bar = A.bars[i]; if (bar) bar.setAttribute('transform', 'rotate(' + (90 * Math.min(1, vis)).toFixed(1) + ')');
  }
  accStep(now) {
    const A = this.acc; const d = 560; const x = Math.min(1, (now - A.t0) / d);
    const k = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    for (let i = 0; i < 9; i++) this.accApply(i, k);
    A.raf = x < 1 ? requestAnimationFrame((n) => this.accStep(n)) : 0;
  }
  zoomAnim(opening) {
    const Z = this.zm; const big = Z.big, ov = Z.ov, small = this.sp.el;
    if (!big || !ov) { if (!opening) this.setState({ open: false }); return; }
    if (!opening && Z.closing) return; Z.closing = !opening;
    const br = big.getBoundingClientRect(); const sr = small ? small.getBoundingClientRect() : null;
    const cur = big.style.transform; big.style.transform = 'none'; const nat = big.getBoundingClientRect(); big.style.transform = cur;
    let dx = 0, dy = 0, s = 0.35;
    if (sr && sr.width) { dx = (sr.left + sr.width / 2) - (nat.left + nat.width / 2); dy = (sr.top + sr.height / 2) - (nat.top + nat.height / 2); s = sr.width / nat.width; }
    else { dx = window.innerWidth * 0.3; dy = window.innerHeight * 0.3; }
    if (this.still()) { if (opening) { big.style.transform = 'none'; ov.style.background = 'rgba(236,232,229,.96)'; if (small) small.style.opacity = '0'; } else { if (small) small.style.opacity = ''; Z.started = null; this.setState({ open: false }); Z.closing = false; } return; }
    if (small && opening) small.style.opacity = '0';
    const t0 = performance.now(); const D = opening ? 820 : 620;
    const easeO = (x) => 1 - Math.pow(1 - x, 4) * (1 - 0.0 * x);
    const easeIO = (x) => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    cancelAnimationFrame(Z.raf);
    const step = (now) => {
      const x = Math.min(1, (now - t0) / D);
      const k = opening ? easeO(x) : 1 - easeIO(x);
      const arc = Math.sin(Math.PI * k) * 40 * (opening ? 1 : 0.6);
      const tx = dx * (1 - k), ty = dy * (1 - k) - arc, sc = s + (1 - s) * k;
      const rx = (1 - k) * 10, ry = (1 - k) * -14, rz = (1 - k) * 4;
      big.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(4) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
      big.style.setProperty('--ang', (3 + 6 * (1 - k)).toFixed(2) + 'deg');
      big.style.boxShadow = '0 ' + (30 * k).toFixed(0) + 'px ' + (80 * k).toFixed(0) + 'px -20px rgba(46,33,24,' + (0.35 * k).toFixed(3) + ')';
      ov.style.background = 'rgba(236,232,229,' + (0.96 * Math.min(1, k * 1.2)).toFixed(3) + ')';
      if (x < 1) Z.raf = requestAnimationFrame(step);
      else { Z.raf = 0; if (!opening) { if (small) small.style.opacity = ''; Z.closing = false; Z.started = null; Z.big = null; Z.ov = null; this.setState({ open: false }); } }
    };
    step(t0);
  }
  ripGL(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = 740 * dpr; cv.height = 820 * dpr;
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true }); if (!gl) return;
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision highp float;uniform vec2 R;uniform vec4 P[3];
float hs(float n){return fract(sin(n)*43758.5453);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
void main(){
 vec2 X=vec2(gl_FragCoord.x/R.x*740.,(R.y-gl_FragCoord.y)/R.y*820.);
 vec3 C=vec3(0.); float A=0.;
 for(int j=0;j<3;j++){
  vec4 Q=P[j]; float a=Q.z; if(a<0.||a>1.3) continue;
  vec2 c=Q.xy; float sd=Q.w;
  if(length(X-c)>90.) continue;
  float wob=1.+.18*sin(a*26.)*exp(-a*4.5);
  float rc=11.*(1.-exp(-a*12.))*(1.-smoothstep(.35,1.05,a))*wob;
  vec2 dv=X-c; dv.y*=1.+.12*sin(a*20.)*exp(-a*5.);
  float D=length(dv)-rc;
  for(int k=0;k<5;k++){float fk=float(k);float h=hs(sd*7.13+fk*3.7);
   float ang=sd*6.2831+fk*1.2566+.5*(h-.5);
   float dist=(18.+14.*h)*(1.-exp(-a*4.2));
   vec2 pk=c+vec2(cos(ang),sin(ang))*dist;
   float rd=(3.2+2.6*h)*(1.-smoothstep(.15,.95,a));
   D=smin(D,length(X-pk)-rd,9.);}
  float fade=1.-smoothstep(.75,1.25,a);
  float m=smoothstep(1.2,-1.2,D)*fade;
  float dn=clamp(-D/max(rc,4.),0.,1.); float depth=sqrt(dn*(2.-dn));
  vec3 org=vec3(.961,.443,.024),hot=vec3(1.,.74,.42),wht=vec3(1.,.97,.92),sil=vec3(.86,.89,.94);
  vec3 col=mix(org,hot,depth*.6);
  float core=exp(-dot(X-c,X-c)/(rc*rc*.18+1.))*(1.-smoothstep(.2,.8,a));
  float rim=m*(1.-depth)*.5;
  float glow=exp(-max(D,0.)/7.)*(1.-m)*.45*fade;
  float body=m*(.16+.22*depth);
  vec2 sp=X-(c+vec2(-.35,-.4)*max(rc,3.)); float spec=exp(-dot(sp,sp)/(rc*rc*.05+.8))*m*(1.-smoothstep(.4,1.,a));
  float fres=m*pow(1.-depth,2.)*.85;
  C+=col*body+wht*core*m*.7+sil*fres*.8+org*rim*.4+vec3(1.,.6,.25)*glow+wht*spec;
  A+=body+core*m*.5+fres*.55+rim*.25+glow*.8+spec*.9;
 }
 A=clamp(A,0.,1.); C=min(C,vec3(A)); gl_FragColor=vec4(C,A);}`;
    const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs); if (!a || !b) return;
    const pr = gl.createProgram(); gl.attachShader(pr, a); gl.attachShader(pr, b); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr); const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, cv.width, cv.height);
    this.rip.gl = gl; this.rip.uR = gl.getUniformLocation(pr, 'R'); this.rip.uP = gl.getUniformLocation(pr, 'P');
  }
  glowGo(i, e) {
    const was = this.state && this.state.ch !== undefined ? this.state.ch : 3; const now = performance.now();
    for (let j = 0; j < 9; j++) {
      const G = this.glow[j] || (this.glow[j] = { lv: 0, t0: -1e9, x: 60, y: 38, want: 0 });
      if (j === i && was !== i) {
        G.want = 1; G.t0 = now;
        if (G.el && e) { const r = G.el.getBoundingClientRect(); const sc = (G.el.offsetWidth ? r.width / G.el.offsetWidth : 1) || 1; G.x = (e.clientX - r.left) / sc; G.y = (e.clientY - r.top) / sc; }
      } else if (G.want) { G.want = 0; G.from = G.lv; G.t0 = now; }
    }
    if (this.fxStill()) { for (let j = 0; j < 9; j++) { const G = this.glow[j]; if (G) { G.lv = G.want; G.t0 = -1e9; this.glowPaint(j, now); } } return; }
    if (!this.glowRaf) this.glowRaf = requestAnimationFrame((n) => this.glowStep(n));
  }
  glowStep(now) {
    this.glowRaf = 0; let live = false;
    for (let j = 0; j < 9; j++) {
      const G = this.glow[j]; if (!G) continue;
      const age = (now - G.t0) / 1000;
      if (G.want) { G.lv = 1; if (age < 1.6) live = true; }
      else { const k = Math.min(1, age / 0.45); G.lv = (G.from || 0) * (1 - k * k); if (k < 1) live = true; }
      this.glowPaint(j, now);
    }
    if (live) this.glowRaf = requestAnimationFrame((n) => this.glowStep(n));
  }
  glowPaint(j, now) {
    const G = this.glow[j]; if (!G || !G.el) return;
    if (G.lv <= 0.001) { G.el.style.background = 'none'; return; }
    const W = G.el.offsetWidth || 740; const age = (now - G.t0) / 1000;
    const x = G.x.toFixed(0) + 'px ' + G.y.toFixed(0) + 'px';
    const rest = 'linear-gradient(90deg, rgba(245,113,6,' + (0.10 * G.lv).toFixed(3) + ') 0, rgba(245,113,6,' + (0.04 * G.lv).toFixed(3) + ') 45%, rgba(245,113,6,0) 85%)';
    let layers = [];
    if (G.want && age >= 0 && age < 1.6) {
      const k = Math.min(1, age / 1.6); const e = 1 - Math.pow(1 - k, 3);
      const R = 24 + e * W * 1.05; const f = Math.pow(1 - k, 1.4);
      const bloom = 'radial-gradient(' + (R * 0.55).toFixed(0) + 'px ' + (R * 0.28).toFixed(0) + 'px at ' + x + ', rgba(255,196,140,' + (0.32 * f).toFixed(3) + ') 0, rgba(245,113,6,' + (0.12 * f).toFixed(3) + ') 50%, rgba(245,113,6,0) 100%)';
      const ring = 'radial-gradient(circle at ' + x + ', rgba(245,113,6,0) ' + Math.max(0, R - 46).toFixed(0) + 'px, rgba(245,113,6,' + (0.26 * f).toFixed(3) + ') ' + Math.max(1, R - 12).toFixed(0) + 'px, rgba(210,220,236,' + (0.35 * f).toFixed(3) + ') ' + R.toFixed(0) + 'px, rgba(245,113,6,0) ' + (R + 14).toFixed(0) + 'px)';
      layers = [bloom];
      G.el.style.background = layers.concat(['linear-gradient(90deg, rgba(245,113,6,' + (0.10 * e).toFixed(3) + ') 0, rgba(245,113,6,' + (0.04 * e).toFixed(3) + ') 45%, rgba(245,113,6,0) 85%)']).join(',');
      return;
    }
    G.el.style.background = rest;
  }
  ripple(e) {
    const R = this.rip, A = this.acc; if (!A.el || !e || this.still() || !R.gl) return;
    const r = A.el.getBoundingClientRect(); const sc = r.width / 740 || 1;
    R.list = (R.list || []).filter((q) => performance.now() - q.t0 < 1300).slice(-2);
    R.list.push({ x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc, t0: performance.now(), sd: Math.random() });
    if (!R.raf) R.raf = requestAnimationFrame((n) => this.ripStep(n));
  }
  ripStep(now) {
    const R = this.rip; R.raf = 0; const gl = R.gl; if (!gl) return;
    const arr = new Float32Array(12); let live = false;
    for (let j = 0; j < 3; j++) {
      const q = R.list[j]; if (!q) { arr[j * 4 + 2] = -1; continue; }
      const age = (now - q.t0) / 1000; if (age <= 1.3) live = true;
      arr[j * 4] = q.x; arr[j * 4 + 1] = q.y; arr[j * 4 + 2] = age; arr[j * 4 + 3] = q.sd;
    }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(R.uR, gl.canvas.width, gl.canvas.height); gl.uniform4fv(R.uP, arr); gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (live) R.raf = requestAnimationFrame((n) => this.ripStep(n)); else { R.list = []; gl.clear(gl.COLOR_BUFFER_BIT); }
  }
  fxAttach(el) {
    if (!el || el.__fx) return;
    const kind = el.getAttribute('data-fx') || 'orange';
    const P = { orange: { fill: '17,17,17', from: '255,255,255', to: '255,255,255', mag: 0 }, ink: { fill: '245,113,6', from: '236,232,229', to: '17,17,17', mag: 0 }, outline: { fill: '17,17,17', from: '17,17,17', to: '236,232,229', mag: 0.6 }, card: { fill: '17,17,17', from: '17,17,17', to: '236,232,229', mag: 0 }, link: { fill: '', from: '', to: '', mag: 0 }, nav: { fill: '', from: '', to: '', mag: 0 } }[kind] || {};
    const F = { el, kind, P, h: 0, hv: 0, ht: 0, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, s: 1, vs: 0, ts: 1, ox: 0.5, oy: 0.5, raf: 0, last: 0 };
    el.__fx = F; (this.fxList = this.fxList || []).push(F);
    el.style.willChange = 'translate, scale'; el.style.backfaceVisibility = 'hidden'; el.style.transition = kind === 'outline' ? 'translate 1.6s cubic-bezier(.22,1,.36,1)' : 'translate .9s cubic-bezier(.22,1,.36,1)';
    if (kind !== 'link' && kind !== 'nav') {
      el.style.position = el.style.position || 'relative'; el.style.overflow = 'hidden'; el.style.isolation = 'isolate';
      const b = document.createElement('span'); b.setAttribute('aria-hidden', 'true');
      b.style.cssText = 'position:absolute;left:0;top:0;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;pointer-events:none;z-index:-1;transform:scale(0);background:rgb(' + P.fill + ')';
      el.insertBefore(b, el.firstChild); F.blob = b;
      const sh = document.createElement('span'); sh.setAttribute('aria-hidden', 'true');
      sh.style.cssText = 'position:absolute;top:-20%;bottom:-20%;left:0;width:36%;pointer-events:none;z-index:1;opacity:0;background:linear-gradient(100deg,rgba(255,255,255,0) 0,rgba(255,255,255,.38) 50%,rgba(255,255,255,0) 100%);transform:translateX(-120%) skewX(-18deg)';
      if (kind === 'orange' || kind === 'ink') { el.appendChild(sh); F.sheen = sh; }
    } else {
      el.style.textDecoration = 'none'; el.style.position = 'relative'; el.style.display = el.style.display || 'inline-block';
      const u = document.createElement('span'); u.setAttribute('aria-hidden', 'true');
      u.style.cssText = 'position:absolute;left:0;right:0;bottom:-3px;height:2px;background:#F57106;transform-origin:0 50%;transform:scaleX(0);pointer-events:none';
      const u0 = document.createElement('span'); u0.setAttribute('aria-hidden', 'true');
      u0.style.cssText = 'position:absolute;left:0;right:0;bottom:-3px;height:1px;background:rgba(17,17,17,.35);pointer-events:none';
      if (kind === 'nav') { u.style.left = '-4px'; u.style.right = '-4px'; u.style.bottom = '-6px'; u.style.height = '1.5px'; u.style.background = '#111111'; u.style.transformOrigin = '50% 50%'; u.style.borderRadius = '1px'; el.appendChild(u); }
      else { el.appendChild(u0); el.appendChild(u); }
      F.line = u;
    }
    F.arrow = el.querySelector('[data-fx-arrow]');
    const loc = (e) => { const r = el.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1), (e.clientY - r.top) / (r.height || 1)]; };
    el.addEventListener('pointerenter', (e) => { const [x, y] = loc(e); F.ox = x; F.oy = y; F.ht = 1; F.sheenT = performance.now(); this.fxKick(F); });
    if (kind === 'orange' || kind === 'ink') {
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || this.fxStill()) return;
        const r = el.getBoundingClientRect(); const t = getComputedStyle(el).translate;
        const m = t && t !== 'none' ? t.split(' ').map(parseFloat) : [0, 0];
        const sc = (el.offsetWidth ? r.width / (el.offsetWidth * (F.s || 1)) : 1) || 1;
        const dx = (e.clientX - (r.left + r.width / 2 - (m[0] || 0) * sc)) / sc, dy = (e.clientY - (r.top + r.height / 2 - (m[1] || 0) * sc)) / sc;
        el.style.translate = (dx * 0.22).toFixed(1) + 'px ' + (dy * 0.3).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', () => { el.style.translate = '0px 0px'; });
    }
    el.addEventListener('pointerleave', (e) => { const [x, y] = loc(e); F.ox = x; F.oy = y; F.ht = 0; F.ts = 1; this.fxKick(F); });
    el.addEventListener('pointerdown', (e) => { F.ts = 0.94; if (e.pointerType !== 'mouse') { const [x, y] = loc(e); F.ox = x; F.oy = y; F.ht = 1; F.sheenT = performance.now(); } this.fxKick(F); });
    const up = (e) => { F.ts = 1; F.vs += 1.2; if (e && e.pointerType && e.pointerType !== 'mouse') setTimeout(() => { F.ht = 0; this.fxKick(F); }, 380); this.fxKick(F); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('focus', () => { F.ox = 0.5; F.oy = 0.5; F.ht = 1; this.fxKick(F); });
    el.addEventListener('blur', () => { F.ht = 0; this.fxKick(F); });
    if (!this.fxDoc) {
      this.fxDoc = (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        this.fxPtr = { x: e.clientX, y: e.clientY };
        if (!this.fxPF) this.fxPF = requestAnimationFrame(() => this.fxFrame());
      };
      document.addEventListener('pointermove', this.fxDoc, { passive: true });
      document.addEventListener('mousemove', this.fxDoc, { passive: true });
    }
  }
  fxFrame() {
    this.fxPF = 0; const P0 = this.fxPtr; if (!P0) return; const still = this.fxStill();
    const rd = this.fxList.map((G) => {
      if (!G.P.mag || !G.el.isConnected) return null;
      const r = G.el.getBoundingClientRect(); const t = getComputedStyle(G.el).translate;
      const m = t && t !== 'none' ? t.split(' ').map(parseFloat) : [0, 0];
      return { r, ox: m[0] || 0, oy: m[1] || 0 };
    });
    this.fxList.forEach((G, i) => {
      const q = rd[i]; if (!q) return; const r = q.r;
      const sc = (G.el.offsetWidth ? r.width / (G.el.offsetWidth * (G.s || 1)) : 1) || 1;
      const cx = r.left + r.width / 2 - q.ox * sc, cy = r.top + r.height / 2 - q.oy * sc;
      const dx = (P0.x - cx) / sc, dy = (P0.y - cy) / sc;
      const R = Math.max(G.el.offsetWidth, G.el.offsetHeight) / 2 + 110;
      let p = still ? 0 : Math.max(0, 1 - Math.hypot(dx, dy) / R); p = p * p * p * (p * (6 * p - 15) + 10);
      const ntx = p ? dx * 0.32 * p * G.P.mag : 0, nty = p ? dy * 0.42 * p * G.P.mag : 0;
      if (Math.abs(ntx - G.tx) > 0.75 || Math.abs(nty - G.ty) > 0.75 || (!p && (G.tx || G.ty))) {
        G.tx = ntx; G.ty = nty; G.el.style.translate = ntx.toFixed(1) + 'px ' + nty.toFixed(1) + 'px';
      }
    });
  }
  alignCirc() {
    const A = this.al; if (!A.c || !A.q || !A.w || !A.c.firstElementChild) return;   // circle is now placed by hand in the canvas
    const par = A.c.offsetParent; if (!par) return;
    const top = (el) => { let y = 0, n = el; while (n && n !== par) { y += n.offsetTop; n = n.offsetParent; } return y; };
    const sig = par.querySelector('a[href="signal.html"]');
    const band0 = sig ? top(sig) + sig.offsetHeight + 36 : top(A.q) - 40, band1 = top(A.w) - 28;   // below the Signal card to just above "Other ways"
    const left0 = 860, right = 1400;                               // right of the quote column to the page's right edge
    let h = band1 - band0, w = h * 1100 / 1175;
    if (w > right - left0) { w = right - left0; h = w * 1175 / 1100; }
    const y = band1 - h;                                            // sit on the band's bottom so it never touches "Other ways"
    A.c.style.top = y.toFixed(0) + 'px'; A.c.style.height = h.toFixed(0) + 'px'; A.c.style.width = w.toFixed(0) + 'px';
    A.c.style.left = (right - w).toFixed(0) + 'px';
  }
  fxStill() { return (this.props.motion ?? true) === false || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  fxKick(F) { if (!F.raf) { F.last = performance.now(); F.raf = requestAnimationFrame((n) => this.fxStep(F, n)); } }
  fxStep(F, now) {
    F.raf = 0; if (!F.el.isConnected) return;
    const dt = Math.min(0.033, Math.max(0.001, (now - F.last) / 1000)); F.last = now;
    const still = this.fxStill();
    const spring = (k, t, v, K, D) => { const a = K * (t - F[k]) - D * F[v]; F[v] += a * dt; F[k] += F[v] * dt; };
    if (still) { F.h = F.ht; F.s = 1; } else {
      spring('h', F.ht, 'hv', F.ht > F.h ? 90 : 120, 15);
      
      spring('s', F.ts, 'vs', 520, 18);
    }
    const h = Math.max(0, Math.min(1.08, F.h));
    const el = F.el, W = el.offsetWidth, H = el.offsetHeight;
    el.style.scale = F.s.toFixed(4);
    if (F.blob) {
      const bx = F.ox * W, by = F.oy * H; const far = Math.hypot(Math.max(bx, W - bx), Math.max(by, H - by));
      const sc = (far * 2.5 / 10) * Math.min(1, h);
      const wob = still ? 1 : 1 + 0.06 * Math.sin(now / 90) * (1 - Math.min(1, h));
      F.blob.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px) scale(' + (sc * wob).toFixed(3) + ',' + (sc / wob).toFixed(3) + ')';
      const m = (a, b) => a.split(',').map((v, i) => Math.round(+v + (+b.split(',')[i] - +v) * Math.min(1, h))).join(',');
      el.style.color = 'rgb(' + m(F.P.from, F.P.to) + ')';
      if (F.kind === 'outline' || F.kind === 'card') el.style.borderColor = '#111111';
    }
    if (F.sheen) {
      const t = F.sheenT ? (now - F.sheenT) / 700 : 2;
      const on = t < 1 && !still; F.sheen.style.opacity = on ? (Math.sin(Math.PI * t) * 0.9).toFixed(3) : '0';
      F.sheen.style.transform = 'translateX(' + (-120 + 420 * Math.min(1, t)).toFixed(1) + '%) skewX(-18deg)';
    }
    if (F.line) F.line.style.transform = 'scaleX(' + Math.min(1, h).toFixed(3) + ')';
    if (F.arrow) { F.arrow.style.display = 'inline-block'; const ax = F.arrow.getAttribute('data-fx-arrow') === 'down' ? 0 : 5 * h + (still ? 0 : Math.sin(now / 160) * 1.2 * Math.min(1, h)); const ay = F.arrow.getAttribute('data-fx-arrow') === 'down' ? 4 * h + (still ? 0 : Math.sin(now / 160) * 1.2 * Math.min(1, h)) : 0; F.arrow.style.transform = 'translate(' + ax.toFixed(2) + 'px,' + ay.toFixed(2) + 'px)'; }
    const moving = Math.abs(F.ht - F.h) > 0.002 || Math.abs(F.hv) > 0.01 || Math.abs(F.ts - F.s) > 0.001 || Math.abs(F.vs) > 0.01 || (F.sheenT && now - F.sheenT < 720) || (F.arrow && F.h > 0.01);
    if (moving && !still) F.raf = requestAnimationFrame((n) => this.fxStep(F, n));
  }
  renderVals() {
    const ph = this.props.showPlaceholders ?? true;
    const motion = this.props.motion ?? true;
    const open = !!(this.state && this.state.open);
    const cur = this.state && this.state.ch !== undefined ? this.state.ch : 3;
    const C = [
      ['I', 'Trapped Capital', 'Does your company know more than it can see?', 'Where the expertise, institutional knowledge, internal tools and IP that could become products are hiding inside your organisation - be it product-led sales, self-serve or service-embedded.'],
      ['II', 'The Cost of Building Wrong', 'What lacking product thinking costs you.', 'Why the build is the smallest part of what a blindly shipped decision costs: the cost iceberg. And why a backlog-driven culture naturally pushes out a de-risking, outcome-driven one.'],
      ['III', 'The AI Productivity Fallacy', 'What happens to the cost of building wrong, when building gets cheaper and faster?', 'Why “speed at all costs” multiplies bad decisions as readily as good ones. Why AI is the answer to delivery speed, not outcome quality. And the pain–gain ratio: how much value your product must deliver before it can even replace pen and paper.'],
      ['IV', 'The Product Decision System', 'Find decisions that convert to value.', 'An overview of how everything fits together.'],
      ['V', 'Continuous Opportunity Discovery', 'The permanent layer that makes the invisible visible.', 'Discovery doesn’t stop and become a hand-off. It runs continuously.'],
      ['VI', 'Assumption Validation', 'When observation becomes testing.', 'Turning a hypothesis into lean, fast tests that can fail, before pilot resources are committed.'],
      ['VII', 'Pilot Validation', 'Where informed decisions are found.', 'Proving value is real, repeatable and commercially viable, ideally without your people in the room.'],
      ['VIII', 'Get Things Done and Drive Impact', 'From here, you lead.', 'Putting the system to work inside your organisation, and keeping it running.'],
      ['App.', 'Appendix', 'The Signal Verification System.', 'The scoring method for internal inbound patterns: a seven-question, natural pattern-mining tool that is less intimidating than a ticket form.']
    ];
    const chapters = C.map((c, i) => ({ num: c[0], title: c[1], sub: c[2], body: c[3], open: i === cur, expanded: i === cur ? 'true' : 'false', sign: i === cur ? '−' : '+',
      setBody: this.bodySet[i], setBar: this.barSet[i], link: i === 8,
      setGlow: this.glowSet[i],
      toggle: (e) => { this.ripple(e); this.glowGo(i, e); this.setState({ ch: (this.state && this.state.ch) === i ? -1 : i }); } }));
    return { fxRef: this.fxRef,
      rootClass: [ph ? "" : "hide-ph", motion ? "" : "still"].join(" ").trim(),
      chapters, setAcc: this.setAcc, setPortrait: this.setPortrait, setCirc: this.setCirc, setQuote: this.setQuote, setMailRow: this.setMailRow, setWays: this.setWays, setRipCv: this.setRipCv, setBig: this.setBig, spreadOpen: open, setSpread: this.setSpread, setSpreadShadow: this.setSpreadShadow, setZoom: this.setZoom,
      openSpread: this.openSpread, closeSpread: this.closeSpread, zoomKey: this.zoomKey, spNear: this.spNear, spFar: this.spFar
    };
  }
}
return Component;
})();
window.KBB["main2"].defaults = {"showPlaceholders": true, "motion": true};
