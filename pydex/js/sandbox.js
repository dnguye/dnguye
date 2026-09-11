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
  const append = (text, cls) => {
    if (!stdoutEl || stdoutEl.className !== cls) { stdoutEl = document.createElement('pre'); stdoutEl.className = cls; body.appendChild(stdoutEl); }
    stdoutEl.textContent += text;
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

export function renderResult(body, res) {
  if (res.result) {
    if (res.result.kind === 'html') { const d = document.createElement('div'); d.className = 'df'; d.innerHTML = sanitize(res.result.html); body.appendChild(d); }
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
