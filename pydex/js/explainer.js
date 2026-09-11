// Step-through explainer engine. A concept declares a scene (SVG built once) and
// steps; each step is a patch {elementId: {cls, x, y, o, text, ...}} applied
// cumulatively. CSS transitions animate between states, so scrubbing, stepping
// and autoplay all share one code path. Reduced-motion users get instant steps.

const NS = 'http://www.w3.org/2000/svg';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function svg(tag, attrs = {}, children = []) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') el.textContent = v;
    else if (k === 'cls') el.setAttribute('class', v);
    else if (v !== undefined && v !== null) el.setAttribute(k, v);
  }
  for (const c of children) el.appendChild(c);
  return el;
}

/** Scene helper: creates an SVG with a coordinate system and a registry of ids. */
export function scene(w, h) {
  const root = svg('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-hidden': 'true' });
  root.appendChild(svg('defs', {}, [
    svg('marker', { id: 'arr', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, [
      svg('path', { d: 'M0 0L10 5L0 10z', cls: 'arrow-head' }),
    ]),
  ]));
  const reg = new Map();
  const add = (id, el, parent = root) => { if (id) { el.dataset.id = id; reg.set(id, el); } parent.appendChild(el); return el; };
  const api = {
    root, reg,
    g(id, x = 0, y = 0, cls = '', parent) { const el = svg('g', { cls }); el.style.transform = `translate(${x}px,${y}px)`; return add(id, el, parent); },
    rect(id, x, y, w, h, cls = 'cell', parent, r = 5) { return add(id, svg('rect', { x, y, width: w, height: h, rx: r, cls }), parent); },
    text(id, x, y, t, cls = 'lbl', parent, anchor = 'middle') { return add(id, svg('text', { x, y, text: t, cls, 'text-anchor': anchor, 'dominant-baseline': 'middle' }), parent); },
    arrow(id, x1, y1, x2, y2, cls = 'arrow', parent) { return add(id, svg('path', { d: `M${x1} ${y1} L${x2} ${y2}`, cls }), parent); },
    path(id, d, cls = 'arrow', parent) { return add(id, svg('path', { d, cls }), parent); },
    circle(id, cx, cy, r, cls = 'cell', parent) { return add(id, svg('circle', { cx, cy, r, cls }), parent); },
    line(id, x1, y1, x2, y2, cls = 'arrow', parent) { return add(id, svg('line', { x1, y1, x2, y2, cls }), parent); },
    /** A labelled cell (rect + centered text) in one group. */
    cell(id, x, y, w, h, label, cls = 'cell', parent) {
      // visibility classes (hid/dim) go on the group so a patch on the id reveals the whole cell
      const parts = cls.split(' ').filter(Boolean);
      const gcls = parts.filter(c => c === 'hid' || c === 'dim').join(' ');
      const rcls = parts.filter(c => c !== 'hid' && c !== 'dim').join(' ') || 'cell';
      const g = api.g(id, x, y, gcls, parent);
      api.rect(id + '.r', 0, 0, w, h, rcls, g);
      api.text(id + '.t', w / 2, h / 2, label, 'lbl', g);
      return g;
    },
  };
  return api;
}

/** Apply a patch to the registry. Keys: cls, add, rm, x, y, o, text, d, hidden */
function applyPatch(reg, patch) {
  for (const [id, p] of Object.entries(patch)) {
    const el = reg.get(id);
    if (!el) continue;
    if (p.cls !== undefined) el.setAttribute('class', p.cls);
    if (p.add) for (const c of p.add.split(' ')) el.classList.add(c);
    if (p.rm) for (const c of p.rm.split(' ')) el.classList.remove(c);
    if (p.x !== undefined || p.y !== undefined) {
      const cur = el.dataset.pos ? JSON.parse(el.dataset.pos) : { x: 0, y: 0 };
      const nx = p.x ?? cur.x, ny = p.y ?? cur.y;
      el.dataset.pos = JSON.stringify({ x: nx, y: ny });
      el.style.transform = `translate(${nx}px,${ny}px)`;
    }
    if (p.o !== undefined) el.style.opacity = p.o;
    if (p.text !== undefined) el.textContent = p.text;
    if (p.d !== undefined) el.setAttribute('d', p.d);
    if (p.attr) for (const [k, v] of Object.entries(p.attr)) el.setAttribute(k, v);
  }
}

/**
 * Mount an explainer.
 * def = { build(scene) -> {w,h}, steps: [{title, caption, patch, lines?}], code?: string[] }
 */
export function mountExplainer(host, def, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'explainer';
  wrap.innerHTML = `
    <div class="stage"></div>
    ${def.code ? '<div class="code-track" aria-hidden="true"></div>' : ''}
    <div class="caption" aria-live="polite"><span class="step-no"></span><b></b><p></p></div>
    <div class="controls">
      <button class="icon-btn" data-act="prev" aria-label="Previous step"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="icon-btn" data-act="play" aria-label="Play"><svg class="i-play" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4.5v11l9-5.5z" fill="currentColor"/></svg><svg class="i-pause" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="display:none"><path d="M6 4.5h3v11H6zM11 4.5h3v11h-3z" fill="currentColor"/></svg></button>
      <button class="icon-btn" data-act="next" aria-label="Next step"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="scrub" role="group" aria-label="Steps"></div>
      <button class="icon-btn" data-act="restart" aria-label="Restart"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10a6 6 0 1 0 2-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 3v4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>`;
  host.appendChild(wrap);

  const stage = wrap.querySelector('.stage');
  const sc = def.build();
  stage.appendChild(sc.root);
  const initial = sc.root.cloneNode(true);

  const steps = def.steps;
  const scrub = wrap.querySelector('.scrub');
  steps.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', `Step ${i + 1}: ${s.title}`);
    b.addEventListener('click', () => { stop(); go(i); });
    scrub.appendChild(b);
  });
  const codeTrack = wrap.querySelector('.code-track');
  if (codeTrack) codeTrack.innerHTML = def.code.map((l, i) => `<span class="ln" data-ln="${i}">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join('');

  let idx = -1, timer = null, playing = false;
  const capNo = wrap.querySelector('.step-no'), capT = wrap.querySelector('.caption b'), capP = wrap.querySelector('.caption p');
  const playBtn = wrap.querySelector('[data-act="play"]');

  function reset() {
    // Restore the initial DOM but keep the same registry ids.
    const fresh = initial.cloneNode(true);
    sc.root.replaceWith(fresh); sc.root = fresh;
    sc.reg.clear();
    fresh.querySelectorAll('[data-id]').forEach(el => sc.reg.set(el.dataset.id, el));
  }
  function go(i) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (i < idx || idx === -1) { reset(); for (let k = 0; k <= i; k++) applyPatch(sc.reg, steps[k].patch || {}); }
    else for (let k = idx + 1; k <= i; k++) applyPatch(sc.reg, steps[k].patch || {});
    idx = i;
    const s = steps[i];
    capNo.textContent = `${i + 1} / ${steps.length}`; capT.textContent = s.title; capP.textContent = s.caption;
    scrub.querySelectorAll('button').forEach((b, k) => { b.classList.toggle('done', k < i); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if (codeTrack) codeTrack.querySelectorAll('.ln').forEach((l, k) => l.classList.toggle('on', (s.lines || []).includes(k)));
  }
  function tick() {
    if (idx >= steps.length - 1) { stop(); return; }
    go(idx + 1);
    timer = setTimeout(tick, steps[idx].hold || def.hold || 2600);
  }
  function play() {
    playing = true; playBtn.setAttribute('aria-label', 'Pause');
    playBtn.querySelector('.i-play').style.display = 'none'; playBtn.querySelector('.i-pause').style.display = '';
    if (idx >= steps.length - 1) go(0);
    timer = setTimeout(tick, steps[idx].hold || def.hold || 2600);
  }
  function stop() {
    playing = false; clearTimeout(timer); playBtn.setAttribute('aria-label', 'Play');
    playBtn.querySelector('.i-play').style.display = ''; playBtn.querySelector('.i-pause').style.display = 'none';
  }
  wrap.querySelector('[data-act="prev"]').addEventListener('click', () => { stop(); go(idx - 1); });
  wrap.querySelector('[data-act="next"]').addEventListener('click', () => { stop(); go(idx + 1); });
  wrap.querySelector('[data-act="restart"]').addEventListener('click', () => { stop(); go(0); });
  playBtn.addEventListener('click', () => (playing ? stop() : play()));
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(idx + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(idx - 1); }
    if (e.key === ' ' && e.target === wrap) { e.preventDefault(); playing ? stop() : play(); }
  });
  wrap.tabIndex = 0;
  wrap.setAttribute('aria-label', `${def.title || 'Explainer'} — use arrow keys to step`);
  go(0);

  // Autoplay when it scrolls into view (once), unless reduced motion.
  if (opts.autoplay !== false && !reduced() && 'IntersectionObserver' in window) {
    let done = false;
    const io = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting && !done) { done = true; play(); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(wrap);
  }
  return { go, play, stop, el: wrap };
}
