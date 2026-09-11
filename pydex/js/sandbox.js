// Client for the Pyodide worker + output rendering shared by inline snippets and the sandbox page.
import { esc } from './highlight.js';

class Sandbox {
  constructor() { this.worker = null; this.pending = new Map(); this.seq = 0; this.stage = 'idle'; this.listeners = new Set(); }
  onStatus(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  ensure() {
    if (this.worker) return;
    let cdn = '';
    try { cdn = localStorage.getItem('pydex.pyodide') || ''; } catch (e) {}
    const url = new URL('./sandbox-worker.js', import.meta.url);
    if (cdn) url.searchParams.set('cdn', cdn);
    this.worker = new Worker(url);
    this.worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'status') { this.stage = m.stage; this.listeners.forEach(f => f(m)); const p = m.id && this.pending.get(m.id); p?.onStatus?.(m); return; }
      const p = this.pending.get(m.id); if (!p) return;
      if (m.type === 'stdout') p.onStdout?.(m.text);
      if (m.type === 'stderr') p.onStderr?.(m.text);
      if (m.type === 'result') { this.pending.delete(m.id); this.stage = 'ready'; this.listeners.forEach(f => f({ stage: 'ready', text: 'Python ready' })); p.resolve(m); }
    };
    this.worker.onerror = (e) => { this.stage = 'error'; this.listeners.forEach(f => f({ stage: 'error', text: e.message })); for (const p of this.pending.values()) p.resolve({ error: 'Worker failed: ' + e.message, figures: [], result: null, ms: 0 }); this.pending.clear(); };
  }
  warm() { this.ensure(); this.worker.postMessage({ type: 'init' }); }
  run(code, { packages = [], fresh = true, onStatus, onStdout, onStderr } = {}) {
    this.ensure();
    const id = ++this.seq;
    return new Promise(resolve => {
      this.pending.set(id, { resolve, onStatus, onStdout, onStderr });
      this.worker.postMessage({ type: 'run', id, code, packages, fresh });
    });
  }
  reset() { if (this.worker) { this.worker.terminate(); this.worker = null; } this.pending.clear(); this.stage = 'idle'; this.listeners.forEach(f => f({ stage: 'idle', text: 'Python not started' })); }
}
export const sandbox = new Sandbox();

const STATUS_ICON = `<span class="spinner" aria-hidden="true"></span>`;

/** Run code and stream the output into `outEl` (a .out container). */
export async function runInto(outEl, code, packages = [], { fresh = true } = {}) {
  outEl.hidden = false;
  outEl.innerHTML = `<div class="out-head">Output <span class="ms"></span></div><div class="out-body"><div class="status">${STATUS_ICON}<span>Starting Python…</span><div class="progress"><i></i></div></div></div>`;
  const body = outEl.querySelector('.out-body'), status = outEl.querySelector('.status span');
  let stdoutEl = null;
  let raw = '';
  const append = (text, cls) => {
    if (!stdoutEl || stdoutEl.className !== cls) { stdoutEl = document.createElement('pre'); stdoutEl.className = cls; body.appendChild(stdoutEl); raw = ''; }
    raw += text;
    if (raw.includes('\x1b[')) stdoutEl.innerHTML = ansiToHtml(raw); else stdoutEl.textContent = raw;
  };
  const res = await sandbox.run(code, {
    packages, fresh,
    onStatus: (m) => { if (status) status.textContent = m.text; },
    onStdout: (t) => { outEl.querySelector('.status')?.remove(); append(t, 'stdout'); },
    onStderr: (t) => { outEl.querySelector('.status')?.remove(); append(t, 'warn'); },
  });
  outEl.querySelector('.status')?.remove();
  renderResult(body, res);
  outEl.querySelector('.ms').textContent = res.ms ? `${res.ms} ms` : '';
  if (!body.children.length) body.innerHTML = `<pre class="stdout muted">(no output — the code ran without printing or returning a value)</pre>`;
  return res;
}

// Minimal ANSI SGR → HTML (16 colours, 256-colour approximations, bold/dim/italic/underline).
const ANSI16 = ['#171C23', '#B8382C', '#1F7A50', '#8F5E12', '#2457B3', '#8B2F8F', '#0E7490', '#A7B0BC', '#6E7886', '#F07C71', '#4FC08D', '#E8A93A', '#6FA1F2', '#D58CE0', '#6FD3E0', '#E6EAF0'];
function ansi256(n) { if (n < 16) return ANSI16[n]; if (n >= 232) { const v = 8 + (n - 232) * 10; return `rgb(${v},${v},${v})`; } n -= 16; const b = n % 6, g = Math.floor(n / 6) % 6, r = Math.floor(n / 36); const c = x => x ? 55 + x * 40 : 0; return `rgb(${c(r)},${c(g)},${c(b)})`; }
export function ansiToHtml(text) {
  let out = '', open = false, st = {};
  const style = () => { const s = []; if (st.fg) s.push(`color:${st.fg}`); if (st.bg) s.push(`background:${st.bg}`); if (st.b) s.push('font-weight:700'); if (st.d) s.push('opacity:.6'); if (st.i) s.push('font-style:italic'); if (st.u) s.push('text-decoration:underline'); return s.join(';'); };
  const parts = text.split(/(\x1b\[[0-9;]*m)/);
  for (const p of parts) {
    if (p.startsWith('\x1b[')) {
      const codes = p.slice(2, -1).split(';').map(Number); let i = 0;
      while (i < codes.length) { const c = codes[i]; if (c === 0 || isNaN(c)) st = {}; else if (c === 1) st.b = 1; else if (c === 2) st.d = 1; else if (c === 3) st.i = 1; else if (c === 4) st.u = 1; else if (c === 22) { st.b = 0; st.d = 0; } else if (c === 23) st.i = 0; else if (c === 24) st.u = 0; else if (c === 39) st.fg = ''; else if (c === 49) st.bg = ''; else if (c >= 30 && c <= 37) st.fg = ANSI16[c - 30]; else if (c >= 90 && c <= 97) st.fg = ANSI16[c - 90 + 8]; else if (c >= 40 && c <= 47) st.bg = ANSI16[c - 40]; else if (c >= 100 && c <= 107) st.bg = ANSI16[c - 100 + 8]; else if ((c === 38 || c === 48) && codes[i + 1] === 5) { const col = ansi256(codes[i + 2]); if (c === 38) st.fg = col; else st.bg = col; i += 2; } else if ((c === 38 || c === 48) && codes[i + 1] === 2) { const col = `rgb(${codes[i + 2]},${codes[i + 3]},${codes[i + 4]})`; if (c === 38) st.fg = col; else st.bg = col; i += 4; } i++; }
      if (open) { out += '</span>'; open = false; }
      const css = style(); if (css) { out += `<span style="${css}">`; open = true; }
    } else out += esc(p);
  }
  return out + (open ? '</span>' : '');
}
let plotlyLoading = null;
function loadPlotly() { return plotlyLoading ||= new Promise((res, rej) => { if (window.Plotly) return res(); const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js'; s.onload = res; s.onerror = () => rej(new Error('plotly.js failed to load')); document.head.appendChild(s); }); }
export function renderResult(body, res) {
  if (res.result) {
    if (res.result.kind === 'plotly') {
      const d = document.createElement('div'); d.className = 'plotly-host'; body.appendChild(d);
      const fig = JSON.parse(res.result.json);
      const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
      loadPlotly().then(() => window.Plotly.newPlot(d, fig.data, { ...fig.layout, autosize: true, height: fig.layout?.height || 380, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { ...(fig.layout?.font || {}), color: dark ? '#E6EAF0' : '#171C23' } }, { responsive: true, displaylogo: false })).catch(e => { const p = document.createElement('pre'); p.className = 'warn'; p.textContent = e.message; body.appendChild(p); });
    }
    else if (res.result.kind === 'html') { const d = document.createElement('div'); d.className = 'df'; d.innerHTML = sanitize(res.result.html); body.appendChild(d); }
    else { const p = document.createElement('pre'); p.className = 'result'; p.textContent = res.result.text; body.appendChild(p); }
  }
  for (const f of res.figures || []) { const img = document.createElement('img'); img.alt = 'matplotlib figure'; img.src = 'data:image/png;base64,' + f; body.appendChild(img); }
  if (res.error) { const p = document.createElement('pre'); p.className = 'error'; p.textContent = res.error; body.appendChild(p); }
}

// pandas emits a <style> + <table>; keep the table, drop scripts/styles.
function sanitize(html) {
  const t = document.createElement('template'); t.innerHTML = html;
  t.content.querySelectorAll('script, style, link').forEach(n => n.remove());
  t.content.querySelectorAll('*').forEach(n => { for (const a of [...n.attributes]) if (/^on/i.test(a.name) || a.name === 'style') n.removeAttribute(a.name); });
  return t.innerHTML;
}

/** Stash code for the sandbox page and navigate there. */
export function openInSandbox(code, packages = []) {
  try { sessionStorage.setItem('pydex.handoff', JSON.stringify({ code, packages })); } catch (e) {}
  location.hash = '#/sandbox';
}
export function takeHandoff() {
  try { const v = sessionStorage.getItem('pydex.handoff'); if (v) { sessionStorage.removeItem('pydex.handoff'); return JSON.parse(v); } } catch (e) {}
  return null;
}
