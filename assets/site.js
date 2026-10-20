function cssVar(n, d) { try { const v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; } catch (e) { return d; } }
class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(patch) { Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch); if (this.__mounted) this.__render(); }
  forceUpdate() { if (this.__mounted) this.__render(); }
}
class Component extends DCLogic {
  constructor(props) {
    super(props);
    if (!window.__amAnchor) { window.__amAnchor = true;
      document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null; if (!a) return;
        const id = a.getAttribute('href').slice(1); if (!id) return; const el = document.getElementById(id); if (!el) return;
        e.preventDefault();
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const y0 = window.scrollY || document.documentElement.scrollTop; const hd = document.querySelector('.site-head'); const off = hd && getComputedStyle(hd).position === 'sticky' ? hd.offsetHeight : 0; const y1 = y0 + el.getBoundingClientRect().top - off - (parseFloat(el.getAttribute('data-scroll-offset')) || 0);
        const dist = Math.abs(y1 - y0); if (reduce || dist < 2) { window.scrollTo(0, y1); return; }
        const D = Math.min(2000, 900 + dist * 0.3); const t0 = performance.now();
        const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        let stop = false; const cancel = () => { stop = true; };
        window.addEventListener('wheel', cancel, { once: true, passive: true }); window.addEventListener('touchstart', cancel, { once: true, passive: true });
        const step = (n) => { if (stop) return; const k = Math.min(1, (n - t0) / D); window.scrollTo(0, y0 + (y1 - y0) * ease(k)); if (k < 1) requestAnimationFrame(step); else { try { history.replaceState(null, '', '#' + id); } catch (_) {} try { el.focus({ preventScroll: true }); } catch (_) {} } };
        requestAnimationFrame(step);
      });
    }
    this.pairs = [['meeting.', 'testing.'], ['discussing.', 'building.'], ['approving.', 'proving.']];
    this.pool = '∑∫∂πΔ≈±×÷√∞λσμθ≠≤≥01·−';
    const k0 = this.fxStill() ? this.pairs.length - 1 : 0;
    this.state = { k: k0, c1: this.plain(this.pairs[k0][0]), c2: this.plain(this.pairs[k0][1]), struck: k0 === this.pairs.length - 1 };
    this.hlT = 0; this.hlRaf = 0; this.hlRunning = false; this.HOLD = 2600;
    this.replay = () => { if (this.fxStill() || this.hlRunning || this.state.k !== this.pairs.length - 1) return; this.hlRunning = true; this.setState({ struck: false }); this.hlT = setTimeout(() => this.morph(0, () => this.cycle()), 300); };
    this.pathEl = null; this.setPath = (el) => { this.pathEl = el; this.railUpdate(); };
    this.cur = { el: null, x: -100, y: -100, tx: -100, ty: -100, raf: 0, inside: false };
    this.setCur = (el) => { this.cur.el = el; };
    this.topEl = null; this.setTop = (el) => { this.topEl = el; };
    this.belEl = null; this.setBelief = (el) => { this.belEl = el; };
    this.onPtr = (e) => { if (e.pointerType && e.pointerType !== 'mouse') return; const C = this.cur; C.tx = e.clientX; C.ty = e.clientY; this.curCheck(); this.fxPtr = { x: e.clientX, y: e.clientY }; if (this.fxFar && this.fxFar.length && !this.fxPF) this.fxPF = requestAnimationFrame(() => this.fxFrame()); };
    this.onOut = (e) => { if (!e.relatedTarget) { this.fxPtr = { x: -1e5, y: -1e5 }; this.fxFrame(); } };
    this.onScroll = () => { if (this.fxFar && this.fxPtr && !this.fxPF) this.fxPF = requestAnimationFrame(() => this.fxFrame()); if (!this.railRaf) this.railRaf = requestAnimationFrame(() => { this.railRaf = 0; this.railUpdate(); }); };
    this.fxRef = (el) => this.fxAttach(el);
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
      if (!this.fxStill() && Math.abs(B.vel) > 0.3) B.mode = 'inertia'; else { B.mode = 'rest'; this.bReturn(); } this.bKick(); };
    this.bKey = (e) => { const B = this.bk; const step = { ArrowLeft: -20, ArrowRight: 20 }[e.key]; if (step === undefined) return;
      e.preventDefault(); clearTimeout(B.rt); B.mode = 'rest'; B.tgt.ry += step; this.bKick(); this.bReturn(); };
    this.bNear = (e) => { const B = this.bk; if (B.mode !== 'idle' || !B.stage || this.fxStill()) return;
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const r = B.stage.getBoundingClientRect(); if (!r.width) return; const sc = r.width / 300 || 1; const R = 520 * sc;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy);
      let p = Math.max(0, 1 - d / R); p = p * p * (3 - 2 * p);
      const nx = Math.max(-1, Math.min(1, dx / R)), ny = Math.max(-1, Math.min(1, dy / R));
      B.tgt.ry = B.turn + 26 - p * 20 + nx * 16 * p; B.tgt.rx = 4 - ny * 10 * p; B.tgt.lift = p * 28; this.bKick(); };
  }
  initPortraitVid() {
    const w = document.querySelector('.portrait-wrap'), v = w && w.querySelector('.portrait-vid');
    if (!v || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    const FADE = 1300, HOLD_IN = 700, HOLD_OUT = 500, RAMP = 0.7, MIN = 0.3;
    let busy = false, raf = 0;
    const ease = () => { const d = v.duration || 4, t = v.currentTime; v.playbackRate = Math.max(MIN, Math.min(1, t / RAMP, (d - t) / RAMP)); if (!v.paused && !v.ended) raf = requestAnimationFrame(ease); };
    const finish = () => { cancelAnimationFrame(raf); setTimeout(() => { w.classList.remove('vid-on'); setTimeout(() => { try { v.currentTime = 0; } catch (e) {} busy = false; }, FADE + 100); }, HOLD_OUT); };
    const start = () => { w.classList.add('vid-on'); setTimeout(() => { v.playbackRate = MIN; const p = v.play(); if (p && p.catch) p.catch(() => { w.classList.remove('vid-on'); busy = false; }); raf = requestAnimationFrame(ease); }, FADE * 0.6 + HOLD_IN); };
    const play = () => { if (busy) return; busy = true; v.preload = 'auto'; try { v.currentTime = 0; } catch (e) {} if (v.readyState >= 2) start(); else { v.addEventListener('loadeddata', start, { once: true }); v.load(); } };
    v.addEventListener('ended', finish);
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); setTimeout(play, 2000); } }); }, { threshold: 0.5 }); io.observe(w); } else { setTimeout(play, 2000); }
    w.addEventListener('mouseenter', play);
  }
  componentDidMount() {
    this.initMenu(); this.initDots(); this.initPortraitVid();
    document.addEventListener('pointermove', this.bNear, { passive: true }); document.addEventListener('pointermove', this.onPtr, { passive: true }); document.addEventListener('mouseout', this.onOut); window.addEventListener('blur', () => this.onOut({}));
    window.addEventListener('scroll', this.onScroll, { passive: true }); window.addEventListener('resize', this.onScroll, { passive: true });
    this.railUpdate();
    const h1 = document.querySelector('#top h1');
    if (h1 && 'IntersectionObserver' in window) {
      this.hlIO = new IntersectionObserver((ents) => { const vis = ents[0].isIntersecting; this.hlPaused = !vis;
        if (vis && this.hlWaiting) { this.hlWaiting = false; this.cycle(); } }, { threshold: 0.15 });
      this.hlIO.observe(h1);
    }
    if (!this.fxStill()) { this.hlRunning = true; this.hlT = setTimeout(() => { this.setState({ struck: true }); this.hlT = setTimeout(() => this.cycle(), 700 + this.HOLD); }, 1150); }
  }
  componentWillUnmount() { document.removeEventListener('pointermove', this.bNear); document.removeEventListener('pointermove', this.onPtr); window.removeEventListener('scroll', this.onScroll); window.removeEventListener('resize', this.onScroll); clearTimeout(this.hlT); cancelAnimationFrame(this.hlRaf); }
  plain(w) { return Array.from(w).map((t) => ({ t, cls: '' })); }
  glyph() { return this.pool[Math.floor(Math.random() * this.pool.length)]; }
  cycle() {
    if (this.hlPaused) { this.hlWaiting = true; return; }
    const to = (this.state.k + 1) % this.pairs.length;
    this.morph(to, () => { this.hlT = setTimeout(() => this.cycle(), to === this.pairs.length - 1 ? this.HOLD * 1.6 : this.HOLD); });
  }
  morph(to, done) {
    const [o1, o2] = this.pairs[this.state.k], [n1, n2] = this.pairs[to];
    this.setState({ struck: false });
    const OUT = 55 * Math.max(o1.length, o2.length), IN = 100 * Math.max(n1.length, n2.length);
    const t0 = performance.now() + 320; let last = 0;
    const mk = (o, n, t) => {
      if (t < OUT) { const L = o.length, k = Math.ceil(L * t / OUT);
        return Array.from(o).map((ch, i) => i >= L - k ? { t: this.glyph(), cls: 'gl' } : { t: ch, cls: '' }); }
      const L = n.length, per = IN / L, keep = Math.floor((t - OUT) / per);
      return Array.from(n).map((ch, i) => i < keep ? { t: ch, cls: '' } : { t: this.glyph(), cls: 'gl' });
    };
    const step = (now) => {
      const t = now - t0;
      if (t < 0) { this.hlRaf = requestAnimationFrame(step); return; }
      if (t >= OUT + IN) { this.setState({ k: to, c1: this.plain(n1), c2: this.plain(n2) });
        this.hlT = setTimeout(() => { this.setState({ struck: true }); this.hlT = setTimeout(done, 700); }, 160); return; }
      if (now - last >= 66) { last = now; this.setState({ c1: mk(o1, n1, t), c2: mk(o2, n2, t) }); }
      this.hlRaf = requestAnimationFrame(step);
    };
    this.hlRaf = requestAnimationFrame(step);
  }
  railUpdate() {
    if (this.belEl) { const vh0 = window.innerHeight || 800; this.belEl.querySelectorAll('.bdel').forEach((d) => { const b = d.getBoundingClientRect(); if (b.top < vh0 * 0.78 && b.bottom > 0) d.classList.add('on'); else if (b.top > vh0) d.classList.remove('on'); }); } if (this.topEl) this.topEl.style.setProperty('--srot', ((window.scrollY || 0) * 0.12).toFixed(1) + 'deg'); const el = this.pathEl; if (!el) return; const r = el.getBoundingClientRect(); const vh = window.innerHeight || 800;
    const p = Math.max(0, Math.min(1, (vh * 0.45 - r.top) / Math.max(1, r.height - vh * 0.35)));
    el.style.setProperty('--p', p.toFixed(4));
    const inView = r.top < vh * 0.6 && r.bottom > vh * 0.4; el.classList.toggle('tracking', inView);
    const focus = vh * 0.45, span = vh * 0.32;
    el.querySelectorAll('.pgrp').forEach((g) => { const b = g.getBoundingClientRect();
      const d = b.top <= focus && b.bottom >= focus ? 0 : Math.min(Math.abs(b.top - focus), Math.abs(b.bottom - focus));
      const floor = b.bottom < focus ? 0.68 : 0.4; const k = Math.min(1, d / span); const e = k * k * (3 - 2 * k);
      g.style.setProperty('--go', inView ? (1 - (1 - floor) * e).toFixed(3) : '1'); });
    const near = vh * 0.2;
    el.querySelectorAll('.prow').forEach((row) => { const b = row.getBoundingClientRect(); const c = b.top + b.height / 2; const d = Math.abs(c - focus);
      let k = Math.max(0, 1 - d / near); k = k * k * (3 - 2 * k);
      const fill = c < focus ? 1 : k;
      row.style.setProperty('--rc', (inView || r.top < focus ? k : 0).toFixed(3)); row.style.setProperty('--rf', (r.top < focus ? fill : 0).toFixed(3)); });
    this.curCheck(); }
  curCheck() { const C = this.cur, el = this.pathEl; if (!C.el || !el) return;
    const r = el.getBoundingClientRect(); const inside = !this.fxStill() && C.tx >= r.left && C.tx <= r.right && C.ty >= r.top && C.ty <= r.bottom;
    if (inside !== C.inside) { C.inside = inside; C.el.classList.toggle('show', inside); if (inside) C.snap = true; }
    if (!C.raf) C.raf = requestAnimationFrame(() => this.curTick()); }
  curTick() { const C = this.cur, el = this.pathEl; C.raf = 0; if (!C.el || !el) return;
    const r = el.getBoundingClientRect(); const sc = (el.offsetWidth ? r.width / el.offsetWidth : 1) || 1;
    const lx = (C.tx - r.left) / sc, ly = (C.ty - r.top) / sc;
    if (C.snap) { C.x = lx; C.y = ly; C.snap = false; }
    C.x += (lx - C.x) * 0.22; C.y += (ly - C.y) * 0.22;
    C.el.style.transform = 'translate(' + C.x.toFixed(1) + 'px,' + C.y.toFixed(1) + 'px)';
    if (C.inside && (Math.abs(lx - C.x) > 0.3 || Math.abs(ly - C.y) > 0.3)) C.raf = requestAnimationFrame(() => this.curTick()); }
  fxFrame() { this.fxPF = 0; const P0 = this.fxPtr; if (!P0 || !this.fxFar) return; const still = this.fxStill();
    this.fxFar.forEach((G) => { if (!G.el.isConnected) return; const r = G.el.getBoundingClientRect(); const t = getComputedStyle(G.el).translate;
      const m = t && t !== 'none' ? t.split(' ').map(parseFloat) : [0, 0];
      const cx = r.left + r.width / 2 - (m[0] || 0), cy = r.top + r.height / 2 - (m[1] || 0);
      const dx = P0.x - cx, dy = P0.y - cy; const R = Math.max(r.width, r.height) / 2 + (G.mR || 220);
      let p = still ? 0 : Math.max(0, 1 - Math.hypot(dx, dy) / R); p = p * p * (3 - 2 * p);
      const tx = dx * (G.mX || 0.38) * p, ty = dy * (G.mY || 0.5) * p; G.el.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px'; if (G.fol) G.fol.style.translate = (tx * G.folK).toFixed(1) + 'px ' + (ty * G.folK).toFixed(1) + 'px'; }); }
  fxStill() { return (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  fxAttach(el) {
    if (!el || el.__fx) return;
    const kind = el.getAttribute('data-fx') || 'ink';
    const P = { mag: { mag: 0.55 }, magfar: { far: 1 }, big: { fill: cssVar('--accent-rgb', '242,96,12'), from: cssVar('--paper-rgb', '238,235,229'), to: cssVar('--paper-rgb', '238,235,229'), mag: 0 }, link: {}, nav: {} }[kind] || {};
    const F = { el, kind, P, h: 0, hv: 0, ht: 0, s: 1, vs: 0, ts: 1, ox: 0.5, oy: 0.5, raf: 0, last: 0 };
    el.__fx = F;
    F.blob = el.querySelector(':scope > .fxb'); F.sheen = el.querySelector(':scope > .fxs'); F.line = el.querySelector(':scope > .fxl'); F.arrow = el.querySelector('[data-fx-arrow]');
    if (F.blob) F.blob.style.background = 'rgb(' + P.fill + ')';
    if (F.blob) { el.style.transition = 'translate .9s cubic-bezier(.22,1,.36,1)'; }
    if (kind === 'mag' || kind === 'magfar') F.arrow = null;
    if (kind === 'magfar') { F.mR = 220; F.mX = 0.38; F.mY = 0.5; const fk = parseFloat(el.getAttribute('data-fx-k')); if (fk > 0) { F.mX *= fk; F.mY *= fk; } const fr = parseFloat(el.getAttribute('data-fx-r')); if (fr > 0) F.mR = fr; const ft = parseFloat(el.getAttribute('data-fx-t')); if (ft > 0) el.style.transition = 'translate ' + ft + 's cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.3,1.6,.5,1)'; const fw = el.parentElement && el.parentElement.querySelector(':scope > [data-fx-follow]'); if (fw) { F.fol = fw; F.folK = parseFloat(fw.getAttribute('data-fx-follow')) || 0.7; fw.style.transition = 'translate ' + ((ft > 0 ? ft : .7) + .25) + 's cubic-bezier(.22,1,.36,1)'; fw.style.display = 'inline-block'; } (this.fxFar = this.fxFar || []).push(F); el.style.transition = 'translate .7s cubic-bezier(.22,1,.36,1), color .5s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.3,1.6,.5,1)'; }
    const loc = (e) => { const r = el.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1), (e.clientY - r.top) / (r.height || 1)]; };
    el.addEventListener('pointerenter', (e) => { const [x, y] = loc(e); F.ox = x; F.oy = y; F.ht = 1; F.sheenT = performance.now(); this.fxKick(F); });
    if (P.mag) { F.mR = 70; F.mX = 0.2; F.mY = 0.28; (this.fxFar = this.fxFar || []).push(F); }
    el.addEventListener('pointerleave', (e) => { const [x, y] = loc(e); F.ox = x; F.oy = y; F.ht = 0; F.ts = 1; this.fxKick(F); });
    el.addEventListener('pointerdown', (e) => { F.ts = 0.94; if (e.pointerType !== 'mouse') { const [x, y] = loc(e); F.ox = x; F.oy = y; F.ht = 1; F.sheenT = performance.now(); } this.fxKick(F); });
    const up = (e) => { F.ts = 1; F.vs += 1.2; if (e && e.pointerType && e.pointerType !== 'mouse') setTimeout(() => { F.ht = 0; this.fxKick(F); }, 380); this.fxKick(F); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('focus', () => { F.ox = 0.5; F.oy = 0.5; F.ht = 1; this.fxKick(F); });
    el.addEventListener('blur', () => { F.ht = 0; this.fxKick(F); });
  }
  fxKick(F) { if (!F.raf) { F.last = performance.now(); F.raf = requestAnimationFrame((n) => this.fxStep(F, n)); } }
  fxStep(F, now) {
    F.raf = 0; if (!F.el.isConnected) return;
    const dt = Math.min(0.033, Math.max(0.001, (now - F.last) / 1000)); F.last = now;
    const still = this.fxStill();
    const spring = (k, t, v, K, D) => { const a = K * (t - F[k]) - D * F[v]; F[v] += a * dt; F[k] += F[v] * dt; };
    if (still) { F.h = F.ht; F.s = 1; } else { if (F.kind === 'big') spring('h', F.ht, 'hv', F.ht > F.h ? 30 : 44, 9.5); else spring('h', F.ht, 'hv', F.ht > F.h ? 90 : 120, 15); if (F.kind !== 'big') spring('s', F.ts, 'vs', 520, 18); }
    const h = Math.max(0, Math.min(1.08, F.h));
    const el = F.el, W = el.offsetWidth, H = el.offsetHeight;
    if (F.kind !== 'big' && F.kind !== 'nav' && F.kind !== 'link') el.style.scale = F.s.toFixed(4);
    if (F.kind === 'big') {
      const bx = F.ox * W, by = F.oy * H; const far = Math.hypot(Math.max(bx, W - bx), Math.max(by, H - by));
      const wob = still ? 1 : 1 + 0.05 * Math.sin(now / 110) * (1 - Math.min(1, h));
      el.style.setProperty('--bx', bx.toFixed(1) + 'px'); el.style.setProperty('--by', by.toFixed(1) + 'px');
      el.style.setProperty('--br', (far * 1.08 * Math.min(1, h) * wob).toFixed(1) + 'px');
    }
    if (F.blob) {
      const bx = F.ox * W, by = F.oy * H; const far = Math.hypot(Math.max(bx, W - bx), Math.max(by, H - by));
      const sc = (far * 2.5 / 10) * Math.min(1, h);
      const wob = still ? 1 : 1 + 0.06 * Math.sin(now / 90) * (1 - Math.min(1, h));
      F.blob.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px) scale(' + (sc * wob).toFixed(3) + ',' + (sc / wob).toFixed(3) + ')';
      const m = (a, b) => a.split(',').map((v, i) => Math.round(+v + (+b.split(',')[i] - +v) * Math.min(1, h))).join(',');
      el.style.color = 'rgb(' + m(F.P.from, F.P.to) + ')';
    }
    if (F.sheen) {
      const t = F.sheenT ? (now - F.sheenT) / 700 : 2;
      const on = t < 1 && !still; F.sheen.style.opacity = on ? (Math.sin(Math.PI * t) * 0.9).toFixed(3) : '0';
      F.sheen.style.transform = 'translateX(' + (-120 + 420 * Math.min(1, t)).toFixed(1) + '%) skewX(-18deg)';
    }
    if (F.line) F.line.style.transform = 'scaleX(' + Math.min(1, h).toFixed(3) + ')';
    if (F.arrow) { F.arrow.style.display = 'inline-block'; const amp = F.kind === 'big' ? 22 : 5; const ax = amp * h + (still ? 0 : Math.sin(now / 160) * 1.2 * Math.min(1, h)); F.arrow.style.transform = 'translateX(' + ax.toFixed(2) + 'px)'; }
    const moving = (F.kind === 'big' && F.h > 0.002 && F.h < 0.998) || Math.abs(F.ht - F.h) > 0.002 || Math.abs(F.hv) > 0.01 || Math.abs(F.ts - F.s) > 0.001 || Math.abs(F.vs) > 0.01 || (F.sheenT && now - F.sheenT < 720) || (F.arrow && F.h > 0.01);
    if (moving && !still) F.raf = requestAnimationFrame((n) => this.fxStep(F, n));
  }
  bKick() { if (!this.bk.raf) this.bk.raf = requestAnimationFrame(() => this.bTick()); }
  bRender() { const B = this.bk, el = B.book; if (!el) return; const c = B.cur;
    el.style.setProperty('--ry', c.ry.toFixed(2) + 'deg'); el.style.setProperty('--rx', c.rx.toFixed(2) + 'deg'); el.style.setProperty('--lift', c.lift.toFixed(1) + 'px');
    const Lr = -10 * Math.PI / 180, a = c.ry * Math.PI / 180;
    const sh = (off) => (0.34 * (1 - Math.max(-1, Math.min(1, Math.cos(a + off * Math.PI / 180 - Lr))))).toFixed(3);
    el.style.setProperty('--sh-front', sh(0)); el.style.setProperty('--sh-spine', sh(-90)); el.style.setProperty('--sh-fore', sh(90)); el.style.setProperty('--sh-back', sh(180));
    const rel = ((c.ry - 26) % 360 + 540) % 360 - 180;
    el.style.setProperty('--sheen', Math.max(-40, Math.min(110, 30 + rel * 1.4)).toFixed(1) + '%');
    if (B.shadow) { const l = c.lift / 28; B.shadow.style.setProperty('--ss', (1 + l * 0.12).toFixed(3)); B.shadow.style.setProperty('--so', (0.85 - l * 0.3).toFixed(3)); B.shadow.style.setProperty('--sx', (-Math.max(-60, Math.min(60, rel)) * 0.5).toFixed(1) + 'px'); } }
  bReturn() { const B = this.bk; clearTimeout(B.rt);
    B.rt = setTimeout(() => { B.turn = 360 * Math.round((B.cur.ry - 26) / 360); B.tgt.ry = 26 + B.turn; B.tgt.rx = 4; B.tgt.lift = 0; B.mode = 'idle'; this.bKick(); }, 2600); }
  bTick() { const B = this.bk; B.raf = 0;
    if (B.mode === 'inertia') { B.tgt.ry += B.vel; B.vel *= 0.94; if (Math.abs(B.vel) < 0.05) { B.mode = 'rest'; this.bReturn(); } }
    const k = (B.mode === 'drag' || B.mode === 'inertia') ? 0.35 : 0.09; let moving = false;
    for (const key in B.tgt) { B.cur[key] += (B.tgt[key] - B.cur[key]) * k; if (Math.abs(B.tgt[key] - B.cur[key]) > 0.01) moving = true; }
    this.bRender();
    if (moving || B.mode === 'inertia') B.raf = requestAnimationFrame(() => this.bTick()); }
  renderVals() {
    return {
      c1: this.state.c1, c2: this.state.c2, hdelCls: this.state.struck ? 'hdel on' : 'hdel', setPath: this.setPath, setCur: this.setCur, setTop: this.setTop, setBelief: this.setBelief,
      replay: this.replay, fxRef: this.fxRef,
      setStage: this.setStage, setBook3: this.setBook3, setBShadow: this.setBShadow, bDown: this.bDown, bMove: this.bMove, bUp: this.bUp, bKey: this.bKey
    };
  }

  initMenu() {
  const mb = document.querySelector('.menu-btn'), mn = document.getElementById('mnav');
  if (mb && mn) {
    const set = (open) => { document.body.classList.toggle('menu-open', open); mb.setAttribute('aria-expanded', String(open)); mn.setAttribute('aria-hidden', String(!open)); mb.querySelector('.mb-label').textContent = open ? 'Close' : 'Menu'; };
    mb.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    mn.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }
  }
  initDots() {
(function () {
  const sec = document.getElementById('contact'), cv = sec && sec.querySelector('.dotfield'); if (!cv) return;
  const ctx = cv.getContext('2d'); const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, C = 0, R = 0, gap = 12, raf = 0, vis = false, last = 0, t = 0;
  let hA, hB, xs, ys, ds;
  const P = { x: 0, y: 0, px: 0, py: 0, on: false };
  const LV = 14; const paths = new Array(LV);
  const build = () => {
    const r = sec.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gap = W < 760 ? 10 : 12; C = Math.ceil(W / gap) + 2; R = Math.ceil(H / gap) + 2;
    hA = new Float32Array(C * R); hB = new Float32Array(C * R);
    xs = new Float32Array(C); ys = new Float32Array(R); ds = new Float32Array(R);
    for (let i = 0; i < C; i++) xs[i] = (i - 0.5) * gap;
    for (let j = 0; j < R; j++) { const v = j / (R - 1); ys[j] = H * Math.pow(v, 1.18); ds[j] = 0.45 + 0.55 * Math.pow(v, 0.8); }
    frame(performance.now(), true);
  };
  const cell = (x, y) => { const v = Math.pow(Math.max(0, Math.min(1, y / H)), 1 / 1.18); return [Math.round(x / gap + 0.5), Math.round(v * (R - 1))]; };
  const poke = (x, y, amt, rad) => { const [ci, cj] = cell(x, y);
    for (let j = cj - rad; j <= cj + rad; j++) for (let i = ci - rad; i <= ci + rad; i++) {
      if (i < 1 || j < 1 || i >= C - 1 || j >= R - 1) continue; const q = ((i - ci) * (i - ci) + (j - cj) * (j - cj)) / (rad * rad); if (q > 1) continue;
      hA[j * C + i] += amt * (1 - q) * (1 - q); } };
  const step = () => {
    const c2 = 0.16, damp = 0.986;
    for (let j = 1; j < R - 1; j++) { const o = j * C;
      for (let i = 1; i < C - 1; i++) { const k = o + i;
        const lap = hA[k - 1] + hA[k + 1] + hA[k - C] + hA[k + C] - 4 * hA[k];
        hB[k] = (2 * hA[k] - hB[k] + c2 * lap) * damp; } }
    const tmp = hA; hA = hB; hB = tmp;
  };
  const frame = (now, force) => {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now; if (!still) t += dt;
    if (!still && !force) { step(); step(); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    for (let l = 0; l < LV; l++) paths[l] = new Path2D();
    for (let j = 0; j < R; j++) { const o = j * C, y0 = ys[j], dep = ds[j];
      for (let i = 0; i < C; i++) { const x = xs[i];
        const sw = 0.62 * Math.sin(x * 0.0085 + y0 * 0.0042 - t * 0.85) + 0.38 * Math.sin(x * 0.0041 - y0 * 0.011 - t * 0.55 + 1.7) + 0.22 * Math.sin((x + y0) * 0.017 - t * 1.3);
        const hh = sw + hA[o + i] * 1.6;
        const n = Math.max(0, Math.min(1, 0.5 + hh * 0.42));
        const y = y0 - hh * 7.5 * dep;
        const rad = (0.5 + n * 1.45) * dep;
        let l = Math.floor(n * dep * (LV - 1) + 0.5); if (l < 0) l = 0; if (l >= LV) l = LV - 1;
        paths[l].moveTo(x + rad, y); paths[l].arc(x, y, rad, 0, 6.2832); } }
    for (let l = 0; l < LV; l++) { const a = 0.04 + 0.52 * (l / (LV - 1)); ctx.fillStyle = 'rgba(' + cssVar('--paper-rgb', '238,235,229') + ',' + a.toFixed(3) + ')'; ctx.fill(paths[l]); }
  };
  const loop = (now) => { raf = 0; frame(now); if (vis && !still) raf = requestAnimationFrame(loop); };
  const kick = () => { if (!raf && vis && !still) { last = 0; raf = requestAnimationFrame(loop); } };
  const local = (e) => { const r = sec.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  sec.addEventListener('pointermove', (e) => { const [x, y] = local(e);
    if (!P.on) { P.px = x; P.py = y; P.on = true; }
    const sp = Math.min(40, Math.hypot(x - P.px, y - P.py)); P.px = x; P.py = y;
    if (sp > 0.5 && hA) poke(x, y, -0.05 * sp / 10 - 0.02, 3); });
  sec.addEventListener('pointerleave', () => { P.on = false; });
  sec.addEventListener('pointerdown', (e) => { const [x, y] = local(e); if (hA) poke(x, y, -0.9, 4); });
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) kick(); }, { rootMargin: '100px' }).observe(sec); else { vis = true; kick(); }
  if ('ResizeObserver' in window) new ResizeObserver(() => build()).observe(sec); else window.addEventListener('resize', build);
  build();
})();
  }
}
(function () {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const comp = new Component({});
  const els = { c1: document.querySelector('[data-hl="c1"]'), c2: document.querySelector('[data-hl="c2"]'), del: document.querySelector('[data-hl="del"]') };
  const chars = (list) => list.map((c) => '<span' + (c.cls ? ' class="' + c.cls + '"' : '') + '>' + esc(c.t) + '</span>').join('');
  comp.__render = () => { const st = comp.state;
    if (els.c1 && st.c1) els.c1.innerHTML = chars(st.c1);
    if (els.c2 && st.c2) els.c2.innerHTML = chars(st.c2);
    if (els.del) els.del.classList.toggle('on', !!st.struck); };
  document.querySelectorAll('[data-ref]').forEach((el) => { const fn = comp[el.getAttribute('data-ref')]; if (typeof fn === 'function') fn(el); });
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'keydown', 'click', 'pointerenter'].forEach((ev) => {
    document.querySelectorAll('[data-on-' + ev + ']').forEach((el) => { const fn = comp[el.getAttribute('data-on-' + ev)]; if (typeof fn === 'function') el.addEventListener(ev, fn); });
  });
  comp.__mounted = true; comp.__render();
  if (comp.componentDidMount) comp.componentDidMount();
})();
