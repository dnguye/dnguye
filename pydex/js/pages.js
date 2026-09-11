import { highlight, esc } from './highlight.js';
import { mountExplainer } from './explainer.js';
import { matrix, bars } from './compare.js';
import { sandbox, runInto, openInSandbox, takeHandoff } from './sandbox.js';

const ICONS = {
  play: `<svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4.5v11l9-5.5z" fill="currentColor"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 13V5a1 1 0 0 1 1-1h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  open: `<svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M11 3h6v6M17 3l-8 8M15 11v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  info: `<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 9v5M10 6.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  warn: `<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3 18 17H2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 8v4M10 14.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  ext: `<svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true"><path d="M11 3h6v6M17 3l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  sheet: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 9h18M9 9v11" stroke="currentColor" stroke-width="1.7"/></svg>`,
  motion: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 8.5v7l5-3.5z" fill="currentColor"/></svg>`,
  scale: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16M6 18V9M12 18V5M18 18v-8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  term: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7 9l3 3-3 3M12 15h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
const toast = (m) => window.pydexToast?.(m);
async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Copied'); } catch (e) { toast('Copy failed — select the code and copy it'); } }

/* ---------- snippet ---------- */
export function snippetHTML(s, lib, i) {
  const runnable = s.run !== false && (lib?.runnable !== false);
  return `<article class="snippet" data-snippet="${i}">
    <div class="snippet-head"><h4>${esc(s.title)}</h4><div class="tools">
      ${runnable ? `<button class="btn sm ghost" data-act="run" aria-label="Run ${esc(s.title)}">${ICONS.play} Run</button>` : ''}
      <button class="btn sm ghost" data-act="copy" aria-label="Copy code for ${esc(s.title)}">${ICONS.copy} Copy</button>
      <button class="btn sm ghost" data-act="open" aria-label="Open ${esc(s.title)} in sandbox">${ICONS.open}<span class="sr-only">Open in sandbox</span></button>
    </div></div>
    <pre tabindex="0"><code>${highlight(s.code)}</code></pre>
    ${s.note ? `<div class="note">${s.note}</div>` : ''}
    <div class="out" hidden></div>
  </article>`;
}
function wireSnippets(root, lib, lookup) {
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]'); if (!btn) return;
    const art = btn.closest('.snippet'); if (!art) return;
    const s = lookup(art);
    if (btn.dataset.act === 'copy') copy(s.code);
    if (btn.dataset.act === 'open') openInSandbox(s.code, s.packages || lib?.packages || []);
    if (btn.dataset.act === 'run') {
      btn.disabled = true;
      await runInto(art.querySelector('.out'), s.code, s.packages || lib?.packages || []);
      btn.disabled = false;
    }
  });
}

/* ---------- home ---------- */
export function renderHome(main, { LIBS, GROUPS, COMPARISONS }) {
  const byGroup = {}; for (const l of LIBS) (byGroup[l.group] ||= []).push(l);
  const demo = LIBS.find(l => l.id === 'pandas');
  const demoSnippet = demo?.cheatsheet[0]?.snippets[0];
  main.innerHTML = `<div class="page">
    <section class="hero">
      <div class="eyebrow">Interactive reference · ${LIBS.length} libraries</div>
      <h1>The Python libraries you actually use, runnable on the page.</h1>
      <p class="lede">Cheat sheets with a Run button, the hard ideas animated step by step, honest comparison tables, and a sandbox loaded with mock data. No install, no account.</p>
      <div class="hero-row"><a class="btn primary" href="#/lib/pandas">Start with pandas</a><a class="btn" href="#/sandbox">Open the sandbox</a><span class="muted" style="font-size:.9rem">Python runs in your browser via Pyodide.</span></div>
      ${demoSnippet ? `<div class="hero-demo" id="hero-demo"></div>` : ''}
    </section>

    <section class="section" id="libraries">
      <div class="section-head"><h2>Libraries</h2><p>Grouped by the job they do. Each page follows the same shape: overview, cheat sheet, animated concepts, comparisons, gotchas.</p></div>
      ${GROUPS.map(g => `<div class="group"><h3>${g.label}</h3><p class="blurb">${g.blurb}</p><div class="lib-grid">${(byGroup[g.id] || []).map(l => `<a class="lib-card" href="#/lib/${l.id}"><span class="glyph" data-g="${l.group}" aria-hidden="true">${l.glyph}</span><b>${l.name}</b><span>${esc(l.tagline)}</span></a>`).join('')}</div></div>`).join('')}
    </section>

    <section class="section" id="how">
      <div class="section-head"><h2>What's on every page</h2></div>
      <div class="feature-row">
        <div class="feature">${ICONS.sheet}<b>Cheat sheet</b><p>Short snippets grouped by task. Run them inline, copy them, or send them to the sandbox.</p></div>
        <div class="feature">${ICONS.motion}<b>Concepts, animated</b><p>Broadcasting, split-apply-combine, the event loop: step through with play, pause and scrub.</p></div>
        <div class="feature">${ICONS.scale}<b>Comparisons</b><p>Feature matrices and ratings, inside a library and across rivals, with a plain verdict.</p></div>
        <div class="feature">${ICONS.term}<b>Sandbox with data</b><p>CSV, JSON, HTML, a SQLite database and a mock HTTP API are mounted and ready.</p></div>
      </div>
    </section>

    <section class="section" id="compare-home">
      <div class="section-head"><h2>Which one should I use?</h2><a href="#/compare">All comparisons →</a></div>
      <div class="lib-grid">${COMPARISONS.map(c => `<a class="lib-card" href="#/compare#${c.id}"><span class="glyph" aria-hidden="true" style="background:var(--ink-3)">vs</span><b>${esc(c.title)}</b><span>${esc(c.lede)}</span></a>`).join('')}</div>
    </section>

    <section class="section" id="keys">
      <div class="section-head"><h2>Keyboard</h2></div>
      <ul class="key-list">
        <li><code>⌘ K</code><span>Search everything</span></li>
        <li><code>/</code><span>Search everything</span></li>
        <li><code>← →</code><span>Step an explainer when it has focus</span></li>
        <li><code>⌘ ↵</code><span>Run in the sandbox editor</span></li>
      </ul>
    </section>
    <footer class="foot"><span>Pydex</span><span>Mock data only; nothing leaves your browser.</span><span>Python via <a href="https://pyodide.org" rel="noopener">Pyodide</a>.</span></footer>
  </div>`;
  if (demoSnippet) {
    const host = main.querySelector('#hero-demo');
    host.innerHTML = snippetHTML({ ...demoSnippet, title: `Try it: ${demoSnippet.title}` }, demo, 0).replace('class="snippet"', 'class="snippet" style="margin:0;border:0;box-shadow:none"');
    wireSnippets(host, demo, () => demoSnippet);
  }
}

/* ---------- library page ---------- */
export function renderLib(main, lib, { COMPARISONS }) {
  const related = COMPARISONS.filter(c => (c.libs || []).includes(lib.id));
  const parts = [];
  parts.push(`<header class="lib-head">
    <div class="title-row"><span class="glyph" data-g="${lib.group}" aria-hidden="true">${lib.glyph}</span><h1>${esc(lib.name)}</h1><span class="pill" data-g="${lib.group}">${lib.groupLabel}</span>${lib.version ? `<span class="pill">v${esc(lib.version)}</span>` : ''}</div>
    <p class="tagline">${esc(lib.tagline)}</p>
    <div class="meta">
      <span class="install"><span>${esc(lib.install)}</span><button class="btn sm ghost" data-copy="${esc(lib.install)}" aria-label="Copy install command">${ICONS.copy}</button></span>
      <a class="pill" href="${lib.docs}" target="_blank" rel="noopener">Official docs ${ICONS.ext}</a>
      ${lib.runnable === false ? `<span class="pill">Not runnable in the browser</span>` : `<span class="pill ok">Runnable</span>`}
    </div>
  </header>`);

  // 1 overview
  parts.push(`<section class="part" id="${lib.id}-overview"><h2 id="${lib.id}-h-overview" data-toc="Overview"><span class="part-num">01</span>Overview</h2>
    <p class="lede">${lib.overview.what}</p>
    <div class="when"><div class="yes"><div class="eyebrow">Reach for it when</div><ul>${lib.overview.yes.map(x => `<li>${x}</li>`).join('')}</ul></div><div class="no"><div class="eyebrow">Look elsewhere when</div><ul>${lib.overview.no.map(x => `<li>${x}</li>`).join('')}</ul></div></div>
    ${lib.overview.note ? `<div class="callout">${ICONS.info}<div>${lib.overview.note}</div></div>` : ''}
  </section>`);

  // 2 cheat sheet
  parts.push(`<section class="part" id="${lib.id}-cheatsheet"><h2 id="${lib.id}-h-cheatsheet" data-toc="Cheat sheet"><span class="part-num">02</span>Cheat sheet</h2>
    <p class="lede">${lib.runnable === false ? 'Snippets are copyable; this library needs a server process, so they do not run in the browser.' : 'Every snippet runs against the mock data in your browser. Press Run, then edit and run again in the sandbox.'}</p>
    ${lib.cheatsheet.map((g, gi) => `<div class="group" id="${lib.id}-${g.id}"><h3 id="${lib.id}-h-${g.id}">${esc(g.title)}</h3>${g.blurb ? `<p class="blurb">${g.blurb}</p>` : ''}${g.snippets.map((s, si) => snippetHTML(s, lib, `${gi}.${si}`)).join('')}</div>`).join('')}
  </section>`);

  // 3 concepts
  if (lib.concepts?.length) parts.push(`<section class="part" id="${lib.id}-concepts"><h2 id="${lib.id}-h-concepts" data-toc="Concepts, animated"><span class="part-num">03</span>Concepts, animated</h2>
    <p class="lede">Play, pause, or scrub. Arrow keys step when the explainer has focus.</p>
    ${lib.concepts.map(c => `<div class="group" id="${lib.id}-concept-${c.id}"><h3 id="${lib.id}-h-concept-${c.id}">${esc(c.title)}</h3><p class="concept-intro">${c.intro}</p><div data-explainer="${c.id}"></div></div>`).join('')}
  </section>`);

  // 4 compare
  if (lib.compare?.length || related.length) parts.push(`<section class="part" id="${lib.id}-compare"><h2 id="${lib.id}-h-compare" data-toc="Compare"><span class="part-num">04</span>Compare</h2>
    ${(lib.compare || []).map(c => `<div class="group">${matrix(c)}${c.verdict ? `<div class="verdict"><b>Verdict.</b> ${c.verdict}</div>` : ''}</div>`).join('')}
    ${related.length ? `<div class="group"><h3>Against the alternatives</h3><div class="lib-grid">${related.map(c => `<a class="lib-card" href="#/compare#${c.id}"><span class="glyph" aria-hidden="true" style="background:var(--ink-3)">vs</span><b>${esc(c.title)}</b><span>${esc(c.lede)}</span></a>`).join('')}</div></div>` : ''}
  </section>`);

  // 5 gotchas
  if (lib.gotchas?.length) parts.push(`<section class="part" id="${lib.id}-gotchas"><h2 id="${lib.id}-h-gotchas" data-toc="Gotchas"><span class="part-num">05</span>Gotchas</h2>
    ${lib.gotchas.map(g => `<div class="gotcha"><h4>${esc(g.title)}</h4><div class="pair"><div class="bad"><div class="tag">Surprising</div><pre><code>${highlight(g.bad)}</code></pre></div><div class="good"><div class="tag">Do this</div><pre><code>${highlight(g.good)}</code></pre></div></div><div class="why">${g.why}</div></div>`).join('')}
  </section>`);

  parts.push(`<footer class="foot"><span>${esc(lib.name)} · Pydex</span><a href="#/sandbox">Open the sandbox</a><a href="#/compare">All comparisons</a></footer>`);
  main.innerHTML = `<div class="page">${parts.join('')}</div>`;

  // wire
  main.querySelector('[data-copy]')?.addEventListener('click', e => copy(e.currentTarget.dataset.copy));
  const all = []; lib.cheatsheet.forEach((g, gi) => g.snippets.forEach((s, si) => all.push([`${gi}.${si}`, s])));
  const map = new Map(all);
  wireSnippets(main.querySelector('.page'), lib, art => map.get(art.dataset.snippet));
  for (const c of lib.concepts || []) mountExplainer(main.querySelector(`[data-explainer="${c.id}"]`), { title: c.title, ...c.explainer });
  requestAnimationFrame(() => main.querySelectorAll('.bar .fill').forEach(f => f.style.transform = `scaleX(${f.style.getPropertyValue('--v')})`));
}

/* ---------- compare page ---------- */
export function renderCompare(main, { COMPARISONS }) {
  main.innerHTML = `<div class="page">
    <header class="lib-head"><div class="title-row"><h1>Compare</h1></div><p class="tagline">Side-by-side matrices and ratings, with a verdict you can disagree with. Ratings are judgement calls (1–5), not benchmarks.</p></header>
    ${COMPARISONS.map(c => `<section class="cmp-section" id="${c.id}"><h2 id="${c.id}-h" data-toc="${esc(c.title)}">${esc(c.title)}</h2><p class="lede">${c.lede}</p>
      ${matrix({ columns: c.columns, rows: c.rows, caption: c.title })}
      ${c.bars ? bars(c.bars) : ''}
      ${c.verdict ? `<div class="verdict"><b>Verdict.</b> ${c.verdict}</div>` : ''}
      ${c.snippets ? `<div class="group"><h3>Same task, ${c.snippets.length} ways</h3>${bars({ items: c.snippets.map(sn => ({ label: sn.title, value: sn.code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length })), unit: ' lines', cls: 'info' })}<div class="two-col" style="margin-top:.5rem">${c.snippets.map((sn, i) => snippetHTML(sn, { packages: sn.packages || [] }, `${c.id}.${i}`)).join('')}</div></div>` : ''}
    </section>`).join('')}
    <footer class="foot"><span>Compare · Pydex</span></footer>
  </div>`;
  const map = new Map();
  for (const c of COMPARISONS) (c.snippets || []).forEach((sn, i) => map.set(`${c.id}.${i}`, sn));
  wireSnippets(main.querySelector('.page'), null, art => map.get(art.dataset.snippet));
  requestAnimationFrame(() => main.querySelectorAll('.bar .fill').forEach(f => f.style.transform = `scaleX(${f.style.getPropertyValue('--v')})`));
}

/* ---------- sandbox page ---------- */
const DEFAULT_CODE = `import pandas as pd

orders = pd.read_csv("/data/orders.csv", parse_dates=["date"])
orders["revenue"] = orders.quantity * orders.unit_price * (1 - orders.discount)

(orders[orders.status == "shipped"]
   .groupby("region", as_index=False)["revenue"].sum()
   .sort_values("revenue", ascending=False))
`;
export function renderSandbox(main, { LIBS }) {
  const handoff = takeHandoff();
  const presets = [];
  for (const l of LIBS) for (const p of (l.presets || [])) presets.push({ lib: l, ...p });
  main.innerHTML = `<div class="sandbox">
    <div>
      <header class="lib-head" style="margin-bottom:1rem;padding-bottom:1rem"><div class="title-row"><h1>Sandbox</h1><span class="pill accent">Python ${''}in the browser</span></div><p class="tagline">Real CPython via Pyodide. Variables persist between runs, like a notebook. Reset to start clean.</p></header>
      <div class="editor-card">
        <div class="editor-bar">
          <button class="btn primary" id="sb-run">${ICONS.play} Run <kbd style="margin-left:.2rem">⌘↵</kbd></button>
          <button class="btn" id="sb-copy">${ICONS.copy} Copy</button>
          <button class="btn ghost" id="sb-reset">Reset runtime</button>
          <span class="grow"></span>
          <span class="status-line"><span class="status-dot" id="sb-dot"></span><span id="sb-status">Python not started</span></span>
        </div>
        <div class="editor"><div class="editor-scroll" id="sb-scroll"><div class="layer"><div class="gutter" id="sb-gutter" aria-hidden="true"></div><pre aria-hidden="true"><code id="sb-hl"></code></pre><textarea id="sb-code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python code"></textarea></div></div></div>
        <div class="out" id="sb-out" hidden></div>
      </div>
    </div>
    <aside>
      <div class="side-card"><h3>Mock data at <code>/data</code></h3><ul>
        <li><code>orders.csv</code><span class="pill">240 rows</span></li>
        <li><code>employees.csv</code><span class="pill">10 rows</span></li>
        <li><code>products.json</code><span class="pill">12 items</span></li>
        <li><code>page.html</code><span class="pill">catalogue</span></li>
        <li><code>shop.sqlite</code><span class="pill">3 tables</span></li>
      </ul><p style="margin-top:.5rem"><code>https://api.pydex.local</code> answers <code>requests</code> and <code>httpx</code> calls from the same data: <code>/products</code>, <code>/orders?region=</code>, <code>/employees</code>, <code>/echo</code>, <code>/status/404</code>.</p></div>
      <div class="side-card"><h3>Presets</h3><div class="preset-list" id="sb-presets">${presets.map((p, i) => `<button type="button" data-i="${i}"><span class="glyph" data-g="${p.lib.group}" aria-hidden="true">${p.lib.glyph}</span>${esc(p.title)}</button>`).join('')}</div></div>
      <div class="side-card"><h3>Notes</h3><p>Packages load on first import (pandas takes a few seconds the first time). <code>asyncio.run(...)</code> is awaited on the browser's event loop. Network calls other than the mock API fail on purpose.</p></div>
    </aside>
  </div>`;
  const ta = main.querySelector('#sb-code'), hl = main.querySelector('#sb-hl'), gutter = main.querySelector('#sb-gutter'), out = main.querySelector('#sb-out');
  const status = main.querySelector('#sb-status'), dot = main.querySelector('#sb-dot'), runBtn = main.querySelector('#sb-run');
  let packages = handoff?.packages || ['pandas'];
  function paint() {
    const v = ta.value; hl.innerHTML = highlight(v) + '\n';
    const n = v.split('\n').length; gutter.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>');
  }
  ta.value = handoff?.code || DEFAULT_CODE; paint();
  ta.addEventListener('input', paint);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart, en = ta.selectionEnd; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en); ta.selectionStart = ta.selectionEnd = s + 4; paint(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  });
  async function run() {
    runBtn.disabled = true; dot.className = 'status-dot busy';
    const pk = [...new Set([...packages, ...detectPackages(ta.value)])];
    await runInto(out, ta.value, pk, { fresh: false });
    runBtn.disabled = false; dot.className = 'status-dot ok';
  }
  runBtn.addEventListener('click', run);
  main.querySelector('#sb-copy').addEventListener('click', () => copy(ta.value));
  main.querySelector('#sb-reset').addEventListener('click', () => { sandbox.reset(); out.hidden = true; out.innerHTML = ''; toast('Runtime reset'); });
  main.querySelector('#sb-presets').addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b) return; const p = presets[+b.dataset.i]; ta.value = p.code; packages = p.packages || p.lib.packages || []; paint(); ta.focus(); });
  const unsub = sandbox.onStatus(m => { status.textContent = m.text || m.stage; dot.className = 'status-dot ' + (m.stage === 'ready' ? 'ok' : m.stage === 'idle' ? '' : 'busy'); });
  if (sandbox.stage === 'ready') { status.textContent = 'Python ready'; dot.className = 'status-dot ok'; }
  window.addEventListener('hashchange', () => unsub(), { once: true });
}
const PKG_MAP = { numpy: 'numpy', pandas: 'pandas', polars: 'polars', matplotlib: 'matplotlib', sklearn: 'scikit-learn', requests: 'requests', bs4: 'beautifulsoup4', pydantic: 'pydantic', sqlalchemy: 'sqlalchemy', pytest: 'pytest', httpx: 'httpx', scipy: 'scipy', yaml: 'pyyaml', PIL: 'pillow', networkx: 'networkx', lxml: 'lxml' };
function detectPackages(code) {
  const out = new Set();
  for (const m of code.matchAll(/^\s*(?:from|import)\s+([A-Za-z_][\w]*)/gm)) if (PKG_MAP[m[1]]) out.add(PKG_MAP[m[1]]);
  return [...out];
}

export function renderNotFound(main) {
  main.innerHTML = `<div class="page"><div class="not-found"><h2>Nothing here</h2><p>That page does not exist. <a href="#/">Back to the library list</a>.</p></div></div>`;
}
