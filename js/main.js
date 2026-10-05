(window.KBB = window.KBB || {})["main"] = (function () {
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
    this.state = { glOk: false };
    this.ctxs = []; this.raf = 0; this.t0 = performance.now();
    this.cvMain = null; this.cvBranch = null;
    this.diamond = null;
    this.parts = { items: [] };
    this.setParts = (el) => { if (!el || el === this.parts.el) return; this.parts.el = el;
      this.parts.items = Array.from(el.children).map((s, i) => ({ s, html: s.innerHTML, len: Math.max(1, s.textContent.length), ph: i * 1.7 + Math.random() * 3, next: 1 + Math.random() * 6, start: -9, lastSwap: 0 })); };
    this.berg = { y: 0, v: 0, lastY: null };
    this.setBerg = (el) => { this.berg.el = el; }; this.setBergTip = (el) => { this.berg.tip = el; };
    this.berg.x = 0; this.berg.vx = 0; this.berg.drag = null; this.berg.mx = 0; this.berg.my = 0; this.berg.magW = 1; this.berg.dropT = -1e9;
    this.bergPtr = null;
    this.bergPM = (e) => { if (e.pointerType && e.pointerType !== 'mouse') return; this.bergPtr = { x: e.clientX, y: e.clientY }; };
    document.addEventListener('pointermove', this.bergPM, { passive: true }); document.addEventListener('mousemove', this.bergPM, { passive: true });
    this.bergDown = (e) => { const B = this.berg; if (e.button !== undefined && e.button !== 0) return; e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect(); B.sc = (r.width / 640) || 1;
      B.drag = { x0: e.clientX, y0: e.clientY, id: e.pointerId, tx: 0, ty: 0, t0: performance.now(), moved: 0, type: e.pointerType };
      document.documentElement.classList.add('kbgrabbing');
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} };
    this.bergMove = (e) => { const B = this.berg; if (!B.drag || e.pointerId !== B.drag.id) return;
      const rub = (d) => d * 0.55 / (1 + Math.abs(d) / 260);
      const ddx = (e.clientX - B.drag.x0) / B.sc, ddy = (e.clientY - B.drag.y0) / B.sc; B.drag.moved = Math.max(B.drag.moved, Math.hypot(ddx, ddy));
      B.drag.tx = rub(ddx); B.drag.ty = rub(ddy); };
    this.bergUp = (e) => { const B = this.berg; if (!B.drag) return;
      const tap = e && e.type !== 'pointercancel' && B.drag.moved < 8 && performance.now() - B.drag.t0 < 350;
      if (tap) { B.v += 260; B.vx += (Math.random() - 0.5) * 120; }
      B.drag = null; B.dropT = performance.now(); B.magW = 0; B.mx = 0; B.my = 0; document.documentElement.classList.remove('kbgrabbing'); };
    this.bk = { cur: { ry: 26, rx: 4, lift: 0 }, tgt: { ry: 26, rx: 4, lift: 0 }, turn: 0, mode: 'idle', vel: 0, drag: null, raf: 0, rt: 0 };
    this.setStage = (el) => { this.bk.stage = el; }; this.setBook3 = (el) => { this.bk.book = el; if (el) this.bRender(); }; this.setBShadow = (el) => { this.bk.shadow = el; };
    this.bDown = (e) => { const B = this.bk; if (e.button !== undefined && e.button !== 0) return; if (e.pointerType === 'mouse') e.preventDefault();
      clearTimeout(B.rt); B.mode = 'drag'; B.vel = 0; B.drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, type: e.pointerType };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      if (B.stage) { B.stage.classList.add('dragging'); B.stage.classList.add('touched'); } B.tgt.lift = 18; this.bKick(); };
    this.bMove = (e) => { const B = this.bk; if (B.mode !== 'drag' || !B.drag || e.pointerId !== B.drag.id) return;
      const now = performance.now(), dx = e.clientX - B.drag.x, dy = e.clientY - B.drag.y, dt = Math.max(1, now - B.drag.t);
      B.tgt.ry += dx * 0.55; if (B.drag.type !== 'touch') B.tgt.rx = Math.max(-28, Math.min(28, B.tgt.rx - dy * 0.3));
      B.vel = B.vel * 0.5 + (dx * 0.55) / dt * 16 * 0.5; B.drag.x = e.clientX; B.drag.y = e.clientY; B.drag.t = now; this.bKick(); };
    this.bUp = (e) => { const B = this.bk; if (B.mode !== 'drag' || !B.drag || (e && e.pointerId !== B.drag.id)) return;
      if (B.stage) B.stage.classList.remove('dragging'); B.drag = null; B.tgt.lift = 0;
      if (!this.isStill() && Math.abs(B.vel) > 0.3) B.mode = 'inertia'; else { B.mode = 'rest'; this.bReturn(); } this.bKick(); };
    this.bKey = (e) => { const B = this.bk; const step = { ArrowLeft: -20, ArrowRight: 20 }[e.key]; if (step === undefined) return;
      e.preventDefault(); clearTimeout(B.rt); B.mode = 'rest'; B.tgt.ry += step; this.bKick(); this.bReturn(); };
    this.bNear = (e) => { const B = this.bk; if (B.mode !== 'idle' || !B.stage || this.isStill()) return;
      const r = B.stage.getBoundingClientRect(); const sc = r.width / 300 || 1; const R = 520 * sc;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy);
      let p = Math.max(0, 1 - d / R); p = p * p * (3 - 2 * p);
      const nx = Math.max(-1, Math.min(1, dx / R)), ny = Math.max(-1, Math.min(1, dy / R));
      B.tgt.ry = B.turn + 26 - p * 20 + nx * 16 * p; B.tgt.rx = 4 - ny * 10 * p; B.tgt.lift = p * 28; this.bKick(); };
    this.bFar = () => { const B = this.bk; if (B.mode !== 'idle') return; B.tgt.ry = B.turn + 26; B.tgt.rx = 4; B.tgt.lift = 0; this.bKick(); };
    this.mouse = null;
    this.onMove = (e) => { const cv = this.cvMain; if (!cv) return; const r = cv.getBoundingClientRect(); if (!r.width) return;
      this.mouse = { x: (e.clientX - r.left) / r.width * 1440, y: (e.clientY - r.top) / r.height * 620 }; };
    this.onLeave = () => { this.mouse = null; };
    this.sys = { nodes: {} }; this.setOutLine = (el) => { this.sys.outLine = el; }; this.setSpark = (el) => { this.sys.spark = el; }; this.setMotes = (el) => { this.sys.motes = el; }; this.setSparkCore = (el) => { this.sys.sparkCore = el; }; this.setBuild = (el) => { this.sys.build = el; }; this.glowLv = { AV: 0, G1: 0, P: 0, INV: 0 }; this.curCyc = -1; this.routeLen = 0;
    const S = this.sys;
    this.setRoute = (el) => { S.route = el; }; this.setTrail = (el) => { S.trail = el; }; this.setTrailGlow = (el) => { S.trailGlow = el; };
    this.setHead = (el) => { S.head = el; }; this.setHeadGlow = (el) => { S.headGlow = el; };
    this.setNAV = (el) => { S.nodes.AV = el; }; this.setNG1 = (el) => { S.nodes.G1 = el; }; this.setNP = (el) => { S.nodes.P = el; }; this.setNINV = (el) => { S.nodes.INV = el; };
    this.setDiamond = (el) => { this.diamond = el; };
    this.setCanvas = (el) => { if (el && el !== this.cvMain) { this.cvMain = el; this.addGL(el, 1440, 620, this.mainFS(), true); } };
    this.waves = {};
    this.setW1 = (el) => { this.waves.w1 = el; };
    this.setW2 = (el) => { this.waves.w2 = el; };
    this.setW3 = (el) => { this.waves.w3 = el; };
    this.setW4 = (el) => { this.waves.w4 = el; };
    this.setBerg2 = (el) => { this.berg2 = el; };
    this.fsg = { els: [], hov: 0, hovT: 0, off: 0, boff: 0, last: 0 };
    this.setFS = (el) => { if (!el) return; const k = +el.getAttribute('data-k'); this.fsg.els[k] = el;
      const host = el.parentNode && el.parentNode.parentNode; if (host && !host.__fs) { host.__fs = 1; host.style.cursor = 'default';
        host.addEventListener('mouseenter', () => { this.fsg.hovT = 1; }); host.addEventListener('mouseleave', () => { this.fsg.hovT = 0; }); } };
    this.setBergDash = (el) => { this.fsg.bd = el; };
    this.wt0 = 0; this.wraf = 0;
  }
  componentDidMount() { this.wt0 = performance.now(); this.waveFrame(this.wt0); this.tiltInit(); }
  tiltInit() {
    const B = this.berg; B.tilt = 0; B.tiltY = 0;
    this.tiltH = (e) => {
      if (e.gamma == null) return;
      const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      let g = e.gamma, b = (e.beta || 0) - 40;
      if (ang === 90) { g = -(e.beta || 0); b = e.gamma; } else if (ang === -90 || ang === 270) { g = e.beta || 0; b = -e.gamma; }
      B.tilt = Math.max(-1, Math.min(1, g / 30)); B.tiltY = Math.max(-1, Math.min(1, b / 40));
    };
    const start = () => { window.addEventListener('deviceorientation', this.tiltH); };
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      const ask = () => { document.removeEventListener('touchend', ask); DOE.requestPermission().then((r) => { if (r === 'granted') start(); }).catch(() => {}); };
      document.addEventListener('touchend', ask, { once: true });
    } else if (DOE) start();
  }
  componentWillUnmount() { if (this.visIO) this.visIO.disconnect(); if (this.bergPM) { document.removeEventListener('pointermove', this.bergPM); document.removeEventListener('mousemove', this.bergPM); } if (this.fxDoc) { document.removeEventListener('pointermove', this.fxDoc); document.removeEventListener('mousemove', this.fxDoc); } if (this.tiltH) window.removeEventListener('deviceorientation', this.tiltH); cancelAnimationFrame(this.raf); this.raf = 0; cancelAnimationFrame(this.wraf); this.wraf = 0; }
  componentDidUpdate() { if (this.ctxs.length && !this.raf) this.frame(performance.now()); if (!this.wraf) this.waveFrame(performance.now()); }
  isStill() {
    return (this.props.motion ?? true) === false ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  wavePath(y0, a1, l1, s1, a2, l2, s2, t, W) {
    let d = ''; const WW = W || 1440;
    for (let x = 0; x <= WW; x += 8) {
      const y = y0 + a1 * Math.sin((x / l1) * 6.2832 - t * s1) + a2 * Math.sin((x / l2) * 6.2832 - t * s2 + 1.3);
      d += (x === 0 ? 'M' : ' L') + x + ' ' + y.toFixed(2);
    }
    return d;
  }
  fsStep(now, t, still) {
    const G = this.fsg; if (!G) return;
    const dt = Math.min(0.05, Math.max(0, (now - (G.last || now)) / 1000)); G.last = now;
    G.hov += (G.hovT - G.hov) * Math.min(1, dt * 4);
    if (!still) { G.off += dt * (5 + 9 * G.hov); G.boff += dt * 22 * G.hov; }
    // travelling pulse every 6.5s (faster loop while hovered): Failures stopped -> F_s -> p·d·C_b -> iceberg hull
    const per = 6.5 - 3 * G.hov; G.ph = ((G.ph || 0) + dt / per) % 1; const ph = still ? -1 : G.ph * per;
    const pulse = (i) => { const d = (ph - 0.35 - i * 0.38) / 0.2; return Math.exp(-d * d); };
    G.els.forEach((el, i) => { if (!el) return;
      const g = Math.max(pulse(i), 0.35 * G.hov);
      el.setAttribute('stroke-dashoffset', (-G.off).toFixed(2));
      el.setAttribute('stroke-width', (2 + 1.3 * g).toFixed(2));
      el.style.filter = g > 0.03 ? 'drop-shadow(0 0 ' + (5 * g).toFixed(1) + 'px rgba(245,113,6,' + (0.85 * g).toFixed(2) + '))' : 'none'; });
    if (G.bd) { const g = Math.max(pulse(2), 0.4 * G.hov);
      G.bd.setAttribute('stroke-dashoffset', (-G.boff).toFixed(2));
      G.bd.setAttribute('stroke-width', (4 + 2.5 * g).toFixed(2));
      G.bd.style.filter = g > 0.03 ? 'drop-shadow(0 0 ' + (4 * g).toFixed(1) + 'px rgba(245,113,6,' + (0.8 * g).toFixed(2) + '))' : 'none'; }
  }
  onScreen(el) {
    if (!window.KB_SITE || !el || !('IntersectionObserver' in window)) return true;
    const V = this.visMap || (this.visMap = new WeakMap());
    if (!this.visIO) this.visIO = new IntersectionObserver((es) => {
      let any = false; for (const e of es) { V.set(e.target, e.isIntersecting); if (e.isIntersecting) any = true; }
      if (any) { if (this.ctxs.length && !this.raf) this.frame(performance.now()); if (!this.wraf) this.waveFrame(performance.now()); }
    }, { rootMargin: '300px 0px' });
    if (!V.has(el)) { V.set(el, true); this.visIO.observe(el); }
    return V.get(el);
  }
  waveFrame(now) {
    const still = this.isStill();
    const t = still ? 0 : (now - this.wt0) / 1000;
    const W = this.waves;
    const vHero = this.onScreen(W.w1), vMath = this.onScreen(this.parts.el), vBerg = this.onScreen(this.berg.el), vPds = this.onScreen(W.w2);
    if (!(vHero || vMath || vBerg || vPds)) { this.wraf = 0; return; }
    if (vMath) this.fsStep(now, t, still);
    if (W.w1 && vHero) W.w1.setAttribute('d', this.wavePath(15, 4.5, 820, 0.55, 2.2, 430, 0.8, t));
    if (W.w2 && vPds) { W.w2.setAttribute('d', this.wavePath(20, 8, 900, 0.32, 3, 520, 0.22, t)); W.w2.setAttribute('stroke-dashoffset', (-t * 6).toFixed(1)); }
    if (W.w3 && vPds) { W.w3.setAttribute('d', this.wavePath(20, 8, 1000, 0.26, 3, 610, 0.18, t + 7)); W.w3.setAttribute('stroke-dashoffset', (-t * 5).toFixed(1)); }
    const P = this.parts;
    if (P.items.length && vMath) {
      const pool = '∑∫∂πΔ≈±×÷√∞λσμθ∈∀∃≠≤≥01·−';
      for (const it of P.items) {
        const s = it.s; const ph = it.ph;
        const dx = still ? 0 : 10 * Math.sin(t * 0.22 + ph), dy = still ? 0 : 12 * Math.cos(t * 0.17 + ph * 1.3), rot = still ? 0 : 8 * Math.sin(t * 0.13 + ph * 0.7);
        s.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
        if (still) continue;
        if (t > it.next) { it.start = t; it.next = t + 5 + Math.random() * 9; }
        const age = t - it.start;
        if (age >= 0 && age < 0.9) {
          if (t - it.lastSwap > 0.07) { it.lastSwap = t; let str = ''; const keep = Math.floor(it.len * (age / 0.9));
            const plain = s.dataset.plain || (s.dataset.plain = s.textContent);
            for (let k = 0; k < it.len; k++) str += k < keep ? plain[k] : pool[Math.floor(Math.random() * pool.length)];
            s.textContent = str; }
        } else if (s.dataset.plain) { s.innerHTML = it.html; delete s.dataset.plain; }
      }
    }
    if (W.w4 && vMath) W.w4.setAttribute('d', this.wavePath(6, 2.6, 300, 0.6, 1.2, 170, 0.9, t + 3, 440));
    if (this.berg2 && vMath) {
      const b2 = still ? 0 : 3 * Math.sin(t * 0.95 + 2) + 1.1 * Math.sin(t * 2.3);
      const r2 = still ? 0 : 0.7 * Math.sin(t * 0.55 + 1.1);
      this.berg2.style.transform = 'translateY(' + b2.toFixed(2) + 'px) rotate(' + r2.toFixed(3) + 'deg)';
    }
    const Bg = this.berg;
    if (Bg.el && vBerg) {
      const now2 = performance.now(); const dt = Math.min(0.033, Math.max(0.001, (now2 - (Bg.last || now2)) / 1000)); Bg.last = now2;
      Bg.tl = (Bg.tl || 0) + (((still ? 0 : Bg.tilt || 0)) - (Bg.tl || 0)) * Math.min(1, dt * 1.6);
      Bg.tlY = (Bg.tlY || 0) + (((still ? 0 : Bg.tiltY || 0)) - (Bg.tlY || 0)) * Math.min(1, dt * 1.6);
      let mtx = 0, mty = 0;
      if (!Bg.drag && !still && this.bergPtr) {
        const r = Bg.el.getBoundingClientRect(); const sc = (r.width / 640) || 1;
        const cx = r.left + r.width / 2 - Bg.x * sc, cy = r.top + r.height * 0.42 - Bg.y * sc;
        const dx = (this.bergPtr.x - cx) / sc, dy = (this.bergPtr.y - cy) / sc; const d = Math.hypot(dx, dy);
        let p = Math.max(0, 1 - d / 520); p = p * p * (3 - 2 * p);
        mtx = Math.max(-22, Math.min(22, dx * 0.06)) * p; mty = Math.max(-14, Math.min(14, dy * 0.04)) * p;
      }
      if (!Bg.drag && now2 - Bg.dropT > 1500) Bg.magW = Math.min(1, Bg.magW + dt / 1.2);
      Bg.mx += (mtx * Bg.magW - Bg.mx) * Math.min(1, dt * 1.3); Bg.my += (mty * Bg.magW - Bg.my) * Math.min(1, dt * 1.3);
      const tx = Bg.drag ? Bg.drag.tx : Bg.tl * 46 + Bg.mx, ty = Bg.drag ? Bg.drag.ty : Bg.tlY * 10 + Bg.my;
      const k = Bg.drag ? 60 : 38, c = Bg.drag ? 11 : 2.6;
      Bg.vx += ((tx - Bg.x) * k - Bg.vx * c) * dt; Bg.v += ((ty - Bg.y) * k - Bg.v * c) * dt;
      Bg.x += Bg.vx * dt; Bg.y += Bg.v * dt;
      const bob = still ? 0 : 4 * Math.sin(t * 0.9) + 1.5 * Math.sin(t * 2.1 + 1);
      const sway = still ? 0 : 0.5 * Math.sin(t * 0.6 + 0.4);
      const rot = sway + Math.max(-6, Math.min(6, Bg.x * 0.03 + Bg.vx * 0.006));
      const tr = 'translate(' + Bg.x.toFixed(2) + 'px,' + (bob + Bg.y).toFixed(2) + 'px) rotate(' + rot.toFixed(3) + 'deg)';
      Bg.el.style.transform = tr;
      if (Bg.tip) Bg.tip.style.transform = 'translate(' + Bg.x.toFixed(2) + 'px,' + (bob + Bg.y).toFixed(2) + 'px)';
    }
    this.wraf = still ? 0 : requestAnimationFrame((n) => this.waveFrame(n));
  }
  common() {
    return `precision highp float;uniform vec2 R;uniform float T;uniform vec4 G;uniform vec4 F;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),mix(dot(h2(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(h2(i+vec2(1.,1.)),f-vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*nz(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
const vec3 ORANGE=vec3(.961,.443,.024),HOT=vec3(1.,.72,.40),WHITE=vec3(1.,.98,.95),SILVER=vec3(.86,.89,.94);
`;
  }
  mainFS() {
    return this.common() + `
float cyf(float u){return 403.+7.*sin(u*.0045+T*.35)+4.*sin(u*.011-T*.6);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
vec2 bz(float t){float s=1.-t;return s*s*s*vec2(262.,406.)+3.*s*s*t*vec2(190.,392.)+3.*s*t*t*vec2(110.,292.)+t*t*t*vec2(135.,122.);}
vec2 bp(float t){return bz(t)+vec2(5.*sin(t*8.-T*1.1)*sin(t*3.1416),0.);}
void main(){
 float u=gl_FragCoord.x/R.x*1440.; float v=(R.y-gl_FragCoord.y)/R.y*620.; vec2 P=vec2(u,v);
 float cy=cyf(u);
 float best=1e5; float bt=0.;
 if(u<340.&&v<440.){vec2 prev=bp(0.);
  for(int i=1;i<=22;i++){float t=float(i)/22.;vec2 p=bp(t);vec2 pa=P-prev,ba=p-prev;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
   float dd=length(pa-ba*hh);if(dd<best){best=dd;bt=(float(i)-1.+hh)/22.;}prev=p;}}
 float ip=fract(T*.16); float ipe=smoothstep(0.,.1,ip)*smoothstep(1.,.85,ip);
 float bw=mix(9.,3.5,bt)+16.*exp(-bt*10.)+5.*exp(-pow((bt-ip)/.05,2.))*ipe+1.2*sin(bt*18.-T*2.4);
 float into=smoothstep(.78,1.,bt);
 bw+=into*3.;
 float Db=best-bw;
 float h=14.+5.*fbm(vec2(u*.004-T*.2,T*.07));
 for(int k=0;k<3;k++){float fk=float(k);float pos=mod(T*(55.+20.*fk)+fk*560.,1760.)-160.;h+=(4.+2.*fk)*exp(-pow((u-pos)/(60.+12.*fk),2.));}
 float idea=0.;
 for(int k=0;k<2;k++){float fk=float(k);float per=24.+9.*fk;float ph=mod(T+fk*13.,per)/per;float pos=-120.+ph*1700.;
  float env=smoothstep(0.,.08,ph)*smoothstep(1.,.9,ph);idea+=exp(-pow((u-pos)/40.,2.))*env*(1.+.12*sin(T*3.+fk*2.));}
 h+=15.*idea;
 float Ds=abs(v-cy)-h; float D=smin(Ds,Db,30.); D=smin(D,length((P-vec2(250.,cyf(250.)))*vec2(.45,1.))-15.,26.); float bhl=0.;
 for(int i=0;i<5;i++){float fi=float(i);float per=5.+1.7*fi;float life=3.2+.6*fi;float cyc=floor((T+fi*2.3)/per);float age=mod(T+fi*2.3,per);
  if(age<life){float a=age/life;float x=hs(vec2(fi,cyc))*1300.+70.+55.*age;float side=hs(vec2(cyc,fi+4.))>.5?1.:-1.;
   float r=11.*sin(3.1416*min(a*1.3,1.))*(1.-a*.45);float off=16.+a*40.;vec2 c=vec2(x,cyf(x)+side*off);
   if(r>.4){D=smin(D,length(P-c)-r,9.);vec2 hl=c+vec2(-.3,-.35)*r;bhl+=exp(-dot(P-hl,P-hl)/(.07*r*r+.4));}}}
 if(G.w>.01){vec2 GA=vec2(G.z,cyf(G.z));vec2 GB=G.xy;vec2 pa=P-GA,ba=GB-GA;float bl=max(dot(ba,ba),1e-3);float hh=clamp(dot(pa,ba)/bl,0.,1.);
  float st=clamp(sqrt(bl)/190.,0.,1.);float rr=mix(30.,13.,pow(hh,.55))*(1.-.25*st)*G.w;
  D=smin(D,length((P-GA)*vec2(.55,1.))-16.*G.w,24.);D=smin(D,length(pa-ba*hh)-rr,26.);D=smin(D,length(P-GB)-(17.+2.*sin(T*4.))*G.w,14.);}
 if(F.z>.5){D=smin(D,length(P-F.xy)-F.z,26.);}
 if(D>120.&&abs(v-cy)>95.&&length(P-vec2(135.,120.))>90.){gl_FragColor=vec4(0.);return;}
 float fadeTip=1.-into*.75*step(Db,Ds);
 float m=smoothstep(1.4,-1.4,D)*fadeTip; float ms=smoothstep(1.2,-1.2,Ds); float mb=smoothstep(1.2,-1.2,Db)*(1.-ms);
 float hl2=mix(h,bw,mb);
 float dn=clamp(-D/hl2,0.,1.); float depth=sqrt(dn*(2.-dn));
 float s=clamp((v-cy)/h,-1.3,1.3);
 vec2 q=vec2(u*.006,s*1.1);
 vec2 wq=vec2(fbm(q*1.3+vec2(T*.14,-T*.06)),fbm(q*1.1+vec2(-T*.1,T*.08)));
 vec2 cq=mix(vec2(u*.013-T*.7,s*2.),vec2(bt*16.-T*2.2,best*.25),mb);
 vec3 cau;
 cau.r=pow(1.-abs(nz(cq+1.4*wq+vec2(.03,0.))),16.);
 cau.g=pow(1.-abs(nz(cq+1.4*wq)),16.);
 cau.b=pow(1.-abs(nz(cq+1.4*wq-vec2(.03,0.))),16.);
 cau*=m*(.35+.65*smoothstep(.0,.3,nz(vec2(u*.004,T*.35))));
 vec3 tint=mix(ORANGE,HOT,depth*.5);
 float ab=m*(.24+.26*depth);
 float gloss=ms*exp(-pow((s+.62)/.16,2.))*(.55+.45*nz(vec2(u*.012-T*.9,1.)));
 float refl=ms*exp(-pow((s-.7)/.14,2.))*.35;
 float rim=m*(1.-depth)*.3;
 float ly=cy+1.5*sin(u*.021-T*2.6); float fl=.7+.3*nz(vec2(u*.03-T*7.,T*.5));
 float lc=exp(-pow((v-ly)/1.1,2.))*fl*ms; float lb=exp(-abs(v-ly)/7.)*.75*fl*ms;
 float flb=.7+.3*nz(vec2(bt*30.-T*6.,1.));
 lc+=exp(-best*best/.5)*flb*(1.-into)*(1.-ms); lb+=exp(-best/4.5)*.55*flb*(1.-ms)*(1.-into*.6);
 float og=exp(-max(D,0.)/18.)*(1.-m)*.55;
 float halo=exp(-max(D,0.)/42.)*(1.-m)*.2;
 float E=idea*exp(-pow((v-cy)/(h*.55),2.))*(.8+.2*sin(T*4.));
 E+=exp(-pow((bt-ip)/.05,2.))*ipe*exp(-best*best/(bw*bw*.3))*(1.-ms);
 vec2 dc=(P-vec2(135.,120.))*vec2(1.,1.6); float arrive=exp(-pow((ip-.97)/.04,2.));
 float melt=exp(-dot(dc,dc)/(260.+320.*arrive))*(.10+.22*arrive);
 vec3 C=tint*ab; float A=ab;
 C+=SILVER*(cau*.9); A+=max(cau.r,max(cau.g,cau.b))*.7;
 C+=WHITE*gloss*.9; A+=gloss*.8;
 C+=HOT*refl; A+=refl*.6;
 C+=ORANGE*rim; A+=rim*.8;
 C+=WHITE*bhl*.9*m; A+=bhl*.8*m;
 C+=vec3(1.,.62,.22)*lb; A+=lb*.8;
 C+=WHITE*lc; A+=lc;
 C+=mix(HOT,WHITE,.4)*E*.9; A+=E*.7;
 C+=vec3(1.,.6,.25)*og; A+=og;
 C+=vec3(1.,.55,.18)*halo; A+=halo;
 C+=vec3(1.,.66,.32)*melt; A+=melt*.9;
 vec2 gp=vec2((u-T*55.)/18.,v/18.); vec2 cl=floor(gp); vec2 f=fract(gp)-.5;
 float r0=hs(cl); vec2 o=(vec2(hs(cl+3.1),hs(cl+7.3))-.5)*.6; vec2 dp=(f-o)*18.;
 float tw=pow(max(0.,sin(T*2.6+r0*60.)),10.)*step(.84,r0);
 float star=exp(-dot(dp,dp)/1.2)+.45*(exp(-abs(dp.x)/.4)*exp(-abs(dp.y)/5.)+exp(-abs(dp.y)/.4)*exp(-abs(dp.x)/5.));
 float glint=tw*star*smoothstep(4.,-2.,D);
 C+=SILVER*glint*1.2; A+=glint;
 float sk=0.;
 for(int L=0;L<2;L++){for(int n=-2;n<=1;n++){
  float cw=90.;float c=floor(u/cw)+float(n);float key=c+float(L)*97.;
  float r1=hs(vec2(key,1.)),r2=hs(vec2(key,2.)),r3=hs(vec2(key,3.));
  float per=4.+5.*r1;float age=mod(T+r2*per,per);float lf=.7+.5*r3;
  if(age<lf&&r3>.45){float x0=c*cw+cw*r2;vec2 vel=vec2(70.+110.*r3,(r1-.5)*120.);
   vec2 p0=vec2(x0,cyf(x0))+vel*age+vec2(0.,40.*age*age*sign(vel.y));vec2 p1=p0-vel*.07;float b=pow(1.-age/lf,2.);
   float dd=seg(P,p1,p0);sk+=b*(exp(-dd*dd/.9)+.35*exp(-dd/3.));}}}
 C+=vec3(1.,.86,.62)*sk; A+=sk;
 A=clamp(A,0.,1.); C=min(C,vec3(A));
 gl_FragColor=vec4(C,A);}`;
  }
  addGL(cv, w, h, fs, isMain) {
    const dpr = window.KB_SITE ? 1 : Math.min(window.devicePixelRatio || 1, 2);   // website: one canvas pixel per CSS pixel (4× fewer than retina), sharp enough for the laser core
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return;
    const pr = gl.createProgram(); gl.attachShader(pr, a); gl.attachShader(pr, b); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, cv.width, cv.height);
    this.ctxs.push({ gl, cv, uR: gl.getUniformLocation(pr, 'R'), uT: gl.getUniformLocation(pr, 'T'), uG: gl.getUniformLocation(pr, 'G'), uF: gl.getUniformLocation(pr, 'F') });
    if (isMain) this.setState({ glOk: true });
    if (!this.raf) this.frame(performance.now());
  }
  moteStart(t) {
    const S = this.sys; if (!S.motes) return;
    const cols = ['#FFF6EC', '#FFD2A0', '#FFB36B', '#F57106', '#E6EAF2'];
    this.motes = { t0: t, ps: Array.from(S.motes.children).map((el, i) => {
      el.setAttribute('fill', cols[i % cols.length]);
      const x0 = i < 8 ? 1240 + Math.random() * 12 : 1248 + Math.random() * 96;
      return { el, x0, y0: 352 + (Math.random() - 0.5) * 10, delay: (i / 34) * 1.0 + Math.random() * 0.2, rise: 45 + Math.pow(Math.random(), 0.9) * 70, sway: 4 + Math.random() * 9, ph: Math.random() * 6.28, r: 0.8 + Math.random() * 1.6, life: 1.8 + Math.random() * 1.2 };
    }) };
  }
  moteStep(t) {
    const M = this.motes; if (!M) return; const age = t - M.t0; let live = false;
    for (const q of M.ps) {
      const a = age - q.delay; if (a < 0) { q.el.setAttribute('opacity', '0'); live = true; continue; }
      const k = a / q.life; if (k >= 1) { q.el.setAttribute('opacity', '0'); continue; } live = true;
      const e = 1 - Math.pow(1 - k, 2);
      const x = q.x0 + Math.sin(a * 3 + q.ph) * q.sway * k, y = q.y0 - q.rise * e;
      const fade = Math.min(1, k / 0.12) * (1 - k);
      q.el.setAttribute('cx', x.toFixed(1)); q.el.setAttribute('cy', y.toFixed(1));
      q.el.setAttribute('r', (q.r * (1 - 0.4 * k)).toFixed(2)); q.el.setAttribute('opacity', (fade * (0.65 + 0.35 * Math.sin(a * 14 + q.ph))).toFixed(3));
    }
    if (!live) this.motes = null;
  }
  sparkStart(x, y, t) {
    const S = this.sys; if (!S.spark) return;
    const cols = ['#FFF6EC', '#FFB36B', '#F57106', '#DDE4F0'];
    this.sparks = { t0: t, x, y, ps: Array.from(S.spark.children).map((el, i) => {
      const ang = Math.random() * Math.PI * 2, sp = 18 + Math.pow(Math.random(), 1.6) * 52;
      el.setAttribute('fill', cols[i % cols.length]);
      return { el, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.7 - 12, r: 0.9 + Math.random() * 1.7, life: 1.1 + Math.random() * 0.8, tw: Math.random() * 6.28 };
    }) };
  }
  sparkStep(t) {
    const P = this.sparks; if (!P) return; const age = t - P.t0; let live = false;
    for (const q of P.ps) {
      const k = age / q.life; if (k >= 1) { q.el.setAttribute('opacity', '0'); continue; } live = true;
      const d = 1 - Math.exp(-age * 1.8);
      const x = P.x + q.vx * d * 1.1, y = P.y + q.vy * d * 1.1 + 9 * age * age;
      const tw = 0.6 + 0.4 * Math.sin(age * 20 + q.tw);
      q.el.setAttribute('cx', x.toFixed(1)); q.el.setAttribute('cy', y.toFixed(1));
      q.el.setAttribute('r', (q.r * (1 - k * 0.6)).toFixed(2)); q.el.setAttribute('opacity', ((1 - k) * tw).toFixed(3));
    }
    if (this.sys.sparkCore) { const c = Math.max(0, 1 - age / 0.6); this.sys.sparkCore.setAttribute('cx', P.x.toFixed(1)); this.sys.sparkCore.setAttribute('cy', P.y.toFixed(1)); this.sys.sparkCore.setAttribute('r', (3 + 9 * (1 - c)).toFixed(1)); this.sys.sparkCore.setAttribute('opacity', (0.8 * c).toFixed(3)); }
    if (!live && age > 0.7) this.sparks = null;
  }
  systemLight(t, still) {
    const S = this.sys; if (!S.route || !S.head) return;
    const H = 'M135 352 L340 352 L545 352', FWD = ' L750 352 L1045 352';
    const G1AV = ' L530 388 A 85 72 0 0 1 360 390 L340 352 L545 352';
    const G2P = ' L1010 388 A 120 80 0 0 1 770 390 L750 352 L1045 352';
    const G2AV = ' L1070 388 A 375 185 0 0 1 320 390 L340 352 L545 352 L750 352 L1045 352';
    const OUT = ' L1200 352 L1246 352';
    const routes = [
      { d: H + FWD + OUT, w: 0.6, win: true },
      { d: H + G1AV + FWD + OUT, w: 0.9, win: true },
      { d: H + FWD + G2P + OUT, w: 0.9, win: true },
      { d: H + FWD + G2AV + OUT, w: 0.6, win: true },
      { d: H, w: 1.5 },
      { d: H + FWD, w: 1.5 },
      { d: H + G1AV, w: 1.2 },
      { d: H + G1AV + FWD, w: 1.4 },
      { d: H + FWD + G2P, w: 1.4 }
    ];
    const V = 340, EXIT = 46, EXD = 1.1;
    if (this.runT0 === undefined || t - this.runT0 > this.runDur) {
      let r = Math.random(); let first = false;
      if (!this.pdsSeen) {
        const sv = S.route.ownerSVGElement; const rc = sv ? sv.getBoundingClientRect() : null; const vh = window.innerHeight || 800;
        const inView = !rc || (rc.top + rc.height * 0.4 < vh && rc.top + rc.height * 0.7 > 0);
        if (inView) { this.pdsSeen = true; first = true; }
        else { this.runT0 = t; this.runDur = 0.4; this.routeLen = 0; return; }
      }
      const tot = routes.reduce((q, x) => q + x.w, 0); let acc = 0, pick = routes[0];
      for (const x of routes) { acc += x.w / tot; if (r <= acc) { pick = x; break; } }
      if (first) pick = routes[1];
      for (const el of [S.route, S.trail, S.trailGlow]) if (el) el.setAttribute('d', pick.d);
      this.routeLen = S.route.getTotalLength ? S.route.getTotalLength() : 0;
      this.routeWin = !!pick.win; this.winHit = false; this.stopHit = false; this.runT0 = t;
      this.runDur = (this.routeWin ? (this.routeLen - EXIT) / V + EXD + 1.4 : this.routeLen / V + 1.6);
    }
    const since = t - this.runT0;
    const len = this.routeLen; if (!len) return;
    let Ls;
    if (still) Ls = -1;
    else if (this.routeWin) { const t1 = (len - EXIT) / V; if (since <= t1) Ls = since * V; else { const k = Math.min(1, (since - t1) / EXD); Ls = len - EXIT + EXIT * (1 - Math.pow(1 - k, 2)) + (since - t1 > EXD ? (since - t1 - EXD) * 400 : 0); } }
    else Ls = since * V;
    const tail = 120;
    let a = Ls < 0 ? 0 : Math.min(1, Ls / 30) * Math.max(0, Math.min(1, (len - Ls) / (this.routeWin ? 16 : 70) + 0.001));
    if (Ls > len) a = 0;
    const L = Math.max(0, Math.min(Ls, len));
    const p = S.route.getPointAtLength(L);
    const boxes = { AV: [230, 450], G1: [480, 610], P: [640, 860], INV: [890, 1200] };
    let inside = false;
    for (const k in boxes) {
      const b = boxes[k]; const hit = a > 0 && p.y > 318 && p.y < 386 && p.x > b[0] && p.x < b[1];
      if (hit) inside = true;
      this.glowLv[k] = Math.max(this.glowLv[k] * 0.955, hit ? 1 : 0);
      const n = S.nodes[k]; const g = this.glowLv[k];
      if (n) {
        n.style.boxShadow = g > 0.02 ? '0 0 ' + (6 + 20 * g).toFixed(1) + 'px rgba(245,113,6,' + (0.6 * g).toFixed(3) + ')' : 'none';
        if (k === 'AV' || k === 'P') n.style.borderColor = g > 0.05 ? 'rgb(' + Math.round(17 + 200 * g) + ',' + Math.round(17 + 80 * g) + ',17)' : '#111111';
      }
    }
    if (this.routeWin && !this.winHit && Ls >= len - 3 && Ls < len + 200) { this.winHit = true; this.winT = t; this.moteStart(t); }
    this.moteStep(t);
    if (!this.routeWin && !this.stopHit && Ls >= len && Ls < len + 200) { this.stopHit = true; const q = S.route.getPointAtLength(len); this.sparkStart(q.x, q.y, t); }
    this.sparkStep(t);
    const wg = this.winT !== undefined ? Math.max(0, (t - this.winT) < 0.25 ? (t - this.winT) / 0.25 : Math.exp(-(t - this.winT - 0.25) / 1.4)) : 0;
    const exitLv = p.x > 1195 && a > 0 ? a : 0; const og = Math.max(wg, exitLv);
    if (S.build) {
      const c = (a0, b0) => Math.round(a0 + (b0 - a0) * wg);
      S.build.style.color = 'rgb(' + c(111, 17) + ',' + c(106, 17) + ',' + c(100, 17) + ')';
      S.build.style.textShadow = wg > 0.02 ? '0 0 ' + (4 + 14 * wg).toFixed(1) + 'px rgba(245,113,6,' + (0.7 * wg).toFixed(3) + ')' : 'none';
    }
    if (S.outLine) {
      S.outLine.style.borderTopColor = og > 0.05 ? 'rgb(' + Math.round(142 + 103 * og) + ',' + Math.round(137 - 24 * og) + ',' + Math.round(132 - 126 * og) + ')' : '#8E8984';
      S.outLine.style.boxShadow = og > 0.05 ? '0 0 ' + (8 * og).toFixed(1) + 'px rgba(245,113,6,' + (0.6 * og).toFixed(3) + ')' : 'none';
    }
    S.head.setAttribute('cx', p.x.toFixed(1)); S.head.setAttribute('cy', p.y.toFixed(1)); S.head.setAttribute('opacity', (a * (inside ? 0 : 1)).toFixed(3));
    if (S.headGlow) { S.headGlow.setAttribute('cx', p.x.toFixed(1)); S.headGlow.setAttribute('cy', p.y.toFixed(1)); S.headGlow.setAttribute('opacity', (a * (inside ? 0.2 : 0.9)).toFixed(3)); }
    const segLen = Math.min(tail, L);
    for (const el of [S.trail, S.trailGlow]) {
      if (!el) continue;
      el.setAttribute('stroke-dasharray', segLen.toFixed(1) + ' 100000');
      el.setAttribute('stroke-dashoffset', (-(L - segLen)).toFixed(1));
      el.setAttribute('opacity', (a * (el === S.trail ? 0.95 : 0.55)).toFixed(3));
    }
  }
  gooStep(t) {
    const now = performance.now(); const dt = Math.min(0.033, Math.max(0.001, (now - (this.gLast || now)) / 1000)); this.gLast = now;
    const cyf = (x) => 403 + 7 * Math.sin(x * 0.0045 + t * 0.35) + 4 * Math.sin(x * 0.011 - t * 0.6);
    const G = this.goo || (this.goo = { px: 0, py: 0, vx: 0, vy: 0, ax: 0, grab: false, s: 0 });
    const m = this.mouse;
    if (m && !G.grab && Math.abs(m.y - cyf(m.x)) < 26 && m.x > 20 && m.x < 1420) {
      G.grab = true; G.ax = m.x; if (G.s < 0.05) { G.px = m.x; G.py = cyf(m.x); G.vx = 0; G.vy = 0; }
    }
    if (G.grab) {
      if (!m) G.grab = false;
      else {
        G.ax += (m.x - G.ax) * Math.min(1, dt * 0.3);
        const ay = cyf(G.ax);
        if (Math.hypot(G.px - G.ax, G.py - ay) > 190) {
          G.grab = false;
          const dl = Math.hypot(G.px - G.ax, G.py - ay) || 1;
          this.ball = { x: G.px, y: G.py, vx: G.vx * 0.3 + (G.px - G.ax) / dl * 38, vy: G.vy * 0.3 + (G.py - ay) / dl * 38, r0: 18, r: 18, age: 0, life: 4.5, back: Math.random() < 0.5, merge: 0 };
          G.px = G.ax + (G.px - G.ax) * 0.4; G.py = ay + (G.py - ay) * 0.4; G.vx *= -0.3; G.vy *= -0.3;
        }
      }
    }
    const tx = G.grab ? m.x : G.ax, ty = G.grab ? m.y : cyf(G.ax);
    const k = G.grab ? 13 : 18, c = G.grab ? 7 : 3.2;
    G.vx += ((tx - G.px) * k - G.vx * c) * dt; G.vy += ((ty - G.py) * k - G.vy * c) * dt;
    G.px += G.vx * dt; G.py += G.vy * dt;
    const away = Math.hypot(G.px - G.ax, G.py - cyf(G.ax)); const speed = Math.hypot(G.vx, G.vy);
    const target = G.grab || away > 2 || speed > 15 ? 1 : 0;
    G.s += (target - G.s) * Math.min(1, dt * 4);
    const B = this.ball;
    if (B) {
      B.age += dt; const dr = Math.exp(-dt * 2.4); B.vx *= dr; B.vy *= dr;
      const dy = cyf(B.x) - B.y; const g = B.back ? 2.2 : 0.35;
      B.vy += dy * g * dt; B.vx += 8 * dt;
      B.x += B.vx * dt; B.y += B.vy * dt;
      if (B.back) {
        if (Math.abs(dy) < 16) B.merge += dt;
        B.r = B.r0 * Math.max(0, 1 - B.merge / 0.9);
        if (B.merge > 0.9 || B.age > 12) this.ball = null;
      } else {
        const f = Math.max(0, 1 - B.age / B.life); B.r = B.r0 * Math.pow(f, 0.5);
        if (B.age > B.life) this.ball = null;
      }
    }
    return G;
  }
  bKick() { if (!this.bk.raf) this.bk.raf = requestAnimationFrame(() => this.bTick()); }
  bReturn() { const B = this.bk; clearTimeout(B.rt);
    B.rt = setTimeout(() => { B.turn = 360 * Math.round((B.cur.ry - 26) / 360); B.tgt.ry = 26 + B.turn; B.tgt.rx = 4; B.tgt.lift = 0; B.mode = 'idle'; this.bKick(); }, 2600); }
  bTick() { const B = this.bk; B.raf = 0;
    if (B.mode === 'inertia') { B.tgt.ry += B.vel; B.vel *= 0.94; if (Math.abs(B.vel) < 0.05) { B.mode = 'rest'; this.bReturn(); } }
    const k = (B.mode === 'drag' || B.mode === 'inertia') ? 0.35 : 0.09; let moving = false;
    for (const key in B.tgt) { B.cur[key] += (B.tgt[key] - B.cur[key]) * k; if (Math.abs(B.tgt[key] - B.cur[key]) > 0.01) moving = true; }
    this.bRender();
    if (moving || B.mode === 'inertia') B.raf = requestAnimationFrame(() => this.bTick()); }
  bRender() { const B = this.bk, el = B.book; if (!el) return; const c = B.cur;
    el.style.setProperty('--ry', c.ry.toFixed(2) + 'deg'); el.style.setProperty('--rx', c.rx.toFixed(2) + 'deg'); el.style.setProperty('--lift', c.lift.toFixed(1) + 'px');
    const Lr = -10 * Math.PI / 180, a = c.ry * Math.PI / 180;
    const sh = (off) => (0.34 * (1 - Math.max(-1, Math.min(1, Math.cos(a + off * Math.PI / 180 - Lr))))).toFixed(3);
    el.style.setProperty('--sh-front', sh(0)); el.style.setProperty('--sh-spine', sh(-90)); el.style.setProperty('--sh-fore', sh(90)); el.style.setProperty('--sh-back', sh(180));
    const rel = ((c.ry - 26) % 360 + 540) % 360 - 180;
    el.style.setProperty('--sheen', Math.max(-40, Math.min(110, 30 + rel * 1.4)).toFixed(1) + '%');
    if (B.shadow) { const l = c.lift / 28; B.shadow.style.setProperty('--ss', (1 + l * 0.12).toFixed(3)); B.shadow.style.setProperty('--so', (0.85 - l * 0.3).toFixed(3)); B.shadow.style.setProperty('--sx', (-Math.max(-60, Math.min(60, rel)) * 0.5).toFixed(1) + 'px'); } }
  frame(now) {
    if (this.cvMain && !this.onScreen(this.cvMain)) { this.raf = 0; return; }   // website: stream sleeps off-screen
    if (window.KB_SITE && this.lastGL && now - this.lastGL < 30) { this.raf = requestAnimationFrame((n) => this.frame(n)); return; }   // website: ~30 fps is plenty for the slow stream
    this.lastGL = now;
    const still = this.isStill();
    const t = still ? 12.0 : (now - this.t0) / 1000 + 12.0;
    for (const c of this.ctxs) {
      c.gl.clearColor(0, 0, 0, 0); c.gl.clear(c.gl.COLOR_BUFFER_BIT);
      c.gl.uniform2f(c.uR, c.cv.width, c.cv.height); c.gl.uniform1f(c.uT, t);
      if (c.uG) { const G = still ? { px: 0, py: 0, ax: 0, s: 0 } : this.gooStep(t); c.gl.uniform4f(c.uG, G.px, G.py, G.ax, G.s);
        const B = still ? null : this.ball; c.gl.uniform4f(c.uF, B ? B.x : 0, B ? B.y : 0, B ? B.r : 0, 1); }
      c.gl.drawArrays(c.gl.TRIANGLES, 0, 6);
    }
    if (this.diamond) {
      const ip = (t * 0.16) % 1; let dd = Math.abs(ip - 0.985); dd = Math.min(dd, 1 - dd);
      const k = Math.exp(-Math.pow(dd / 0.035, 2));
      this.diamond.style.boxShadow = '0 0 ' + (14 + 16 * k).toFixed(1) + 'px rgba(245,113,6,' + (0.22 + 0.4 * k).toFixed(3) + ')';
      this.diamond.style.borderColor = k > 0.05 ? 'rgb(' + Math.round(17 + 200 * k) + ',' + Math.round(17 + 80 * k) + ',17)' : '#111111';
    }
    this.systemLight(t, still);
    this.raf = still ? 0 : requestAnimationFrame((n) => this.frame(n));
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
      if (kind === 'nav') { u.style.left = '-6px'; u.style.right = '-6px'; u.style.bottom = '-7px'; u.style.height = '1.5px'; u.style.background = '#111111'; u.style.transformOrigin = '50% 50%'; u.style.borderRadius = '1px'; el.appendChild(u); }
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
    const s = this.state || {};
    return { fxRef: this.fxRef,
      rootClass: [ph ? "" : "hide-ph", motion ? "" : "still"].join(" ").trim(),
      motionOn: motion, motionOff: !motion,
      setCanvas: this.setCanvas, setDiamond: this.setDiamond, setParts: this.setParts, setBerg: this.setBerg, setBergTip: this.setBergTip, bergDown: this.bergDown, bergMove: this.bergMove, bergUp: this.bergUp, setStage: this.setStage, setBook3: this.setBook3, setBShadow: this.setBShadow, bDown: this.bDown, bMove: this.bMove, bUp: this.bUp, bKey: this.bKey, bNear: this.bNear, bFar: this.bFar, onMove: this.onMove, onLeave: this.onLeave, setRoute: this.setRoute, setTrail: this.setTrail, setTrailGlow: this.setTrailGlow, setHead: this.setHead, setHeadGlow: this.setHeadGlow, setNAV: this.setNAV, setNG1: this.setNG1, setNP: this.setNP, setNINV: this.setNINV, setOutLine: this.setOutLine, setSpark: this.setSpark, setMotes: this.setMotes, setSparkCore: this.setSparkCore, setBuild: this.setBuild, glOff: !s.glOk,
      setW1: this.setW1, setW2: this.setW2, setW3: this.setW3, setW4: this.setW4, setBerg2: this.setBerg2, setFS: this.setFS, setBergDash: this.setBergDash
    };
  }
}
return Component;
})();
window.KBB["main"].defaults = {"showPlaceholders": true, "motion": true};
