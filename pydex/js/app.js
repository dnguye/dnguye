import { LIBS, GROUPS } from '../data/libs/index.js';
import { COMPARISONS } from '../data/comparisons.js';
import { renderHome, renderLib, renderCompare, renderSandbox, renderNotFound } from './pages.js';
import { sandbox } from './sandbox.js';

const $ = (s, r = document) => r.querySelector(s);
const main = $('#main'), rail = $('#rail'), toc = $('#toc');

/* ---------- theme ---------- */
const themeBtn = $('#theme-btn');
function currentTheme() {
  const t = document.documentElement.dataset.theme;
  if (t) return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function syncThemeLabel() { themeBtn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
themeBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('pydex.theme', next); } catch (e) {}
  syncThemeLabel();
});
syncThemeLabel();

/* ---------- toast ---------- */
export function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 1800);
}
window.pydexToast = toast;

/* ---------- rail ---------- */
function renderRail() {
  const byGroup = {};
  for (const l of LIBS) (byGroup[l.group] ||= []).push(l);
  $('#rail-list').innerHTML = GROUPS.map(g => `
    <div class="rail-group">
      <div class="eyebrow">${g.label}</div>
      ${(byGroup[g.id] || []).map(l => `<a href="#/lib/${l.id}" data-lib="${l.id}"><span class="glyph" data-g="${l.group}" aria-hidden="true">${l.glyph}</span>${l.name}</a>`).join('')}
    </div>`).join('') + `
    <div class="rail-group"><div class="eyebrow">More</div>
      <a href="#/compare" data-nav="compare"><span class="glyph" data-g="correct" aria-hidden="true" style="background:var(--ink-3)">vs</span>Compare</a>
      <a href="#/sandbox" data-nav="sandbox"><span class="glyph" aria-hidden="true" style="background:var(--accent);color:var(--accent-ink)">&gt;_</span>Sandbox</a>
    </div>`;
}
const railToggle = $('#rail-toggle'), scrim = $('#rail-scrim');
function setRail(open) { rail.classList.toggle('open', open); scrim.hidden = !open; railToggle.setAttribute('aria-expanded', String(open)); }
railToggle.addEventListener('click', () => setRail(!rail.classList.contains('open')));
scrim.addEventListener('click', () => setRail(false));
rail.addEventListener('click', e => { if (e.target.closest('a')) setRail(false); });

/* ---------- router ---------- */
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, frag] = h.split('#');
  const parts = path.split('/').filter(Boolean);
  return { parts, frag };
}
let currentPage = null;
function route() {
  const { parts, frag } = parseHash();
  const key = parts.join('/') || 'home';
  if (currentPage !== key) {
    main.innerHTML = '';
    toc.innerHTML = '';
    if (parts.length === 0) renderHome(main, { LIBS, GROUPS, COMPARISONS });
    else if (parts[0] === 'lib' && parts[1]) {
      const lib = LIBS.find(l => l.id === parts[1]);
      if (lib) { renderLib(main, lib, { COMPARISONS }); document.title = `${lib.name} · Pydex`; }
      else renderNotFound(main);
    }
    else if (parts[0] === 'compare') { renderCompare(main, { COMPARISONS, LIBS }); document.title = 'Compare · Pydex'; }
    else if (parts[0] === 'sandbox') { renderSandbox(main, { LIBS }); document.title = 'Sandbox · Pydex'; }
    else renderNotFound(main);
    if (parts.length === 0) document.title = 'Pydex';
    currentPage = key;
    buildToc();
    if (!frag) window.scrollTo({ top: 0, behavior: 'instant' });
  }
  // active states
  document.querySelectorAll('[data-lib]').forEach(a => a.toggleAttribute('aria-current', false));
  document.querySelectorAll('[data-nav]').forEach(a => a.removeAttribute('aria-current'));
  if (parts[0] === 'lib') document.querySelectorAll(`[data-lib="${parts[1]}"]`).forEach(a => a.setAttribute('aria-current', 'page'));
  if (parts[0] === 'compare' || parts[0] === 'sandbox') document.querySelectorAll(`[data-nav="${parts[0]}"]`).forEach(a => a.setAttribute('aria-current', 'page'));
  if (frag) requestAnimationFrame(() => { const el = document.getElementById(frag); if (el) { el.scrollIntoView({ block: 'start' }); } });
}
window.addEventListener('hashchange', route);

/* ---------- in-page nav ---------- */
let spy = null;
function buildToc() {
  if (spy) { spy.disconnect(); spy = null; }
  const heads = [...main.querySelectorAll('h2[id], h3[id]')];
  if (heads.length < 3) { toc.innerHTML = ''; return; }
  const base = location.hash.split('#').slice(0, 2).join('#').replace(/#$/, '') || '#/';
  toc.innerHTML = `<div class="eyebrow">On this page</div>` + heads.map(h => `<a href="${base.split('#')[0]}#${base.replace(/^#/, '')}#${h.id}" class="${h.tagName === 'H3' ? 'sub' : ''}" data-for="${h.id}">${h.dataset.toc || h.textContent.replace(/^\d+\s*/, '')}</a>`).join('');
  const links = new Map([...toc.querySelectorAll('a')].map(a => [a.dataset.for, a]));
  const visible = new Set();
  spy = new IntersectionObserver(es => {
    for (const e of es) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
    let active = null;
    for (const h of heads) if (visible.has(h.id)) { active = h.id; break; }
    if (!active) { for (const h of heads) if (h.getBoundingClientRect().top < 120) active = h.id; }
    links.forEach((a, id) => a.classList.toggle('active', id === active));
  }, { rootMargin: '-56px 0px -60% 0px' });
  heads.forEach(h => spy.observe(h));
}

/* ---------- command palette ---------- */
const palette = $('#palette'), pInput = $('#palette-input'), pResults = $('#palette-results');
const INDEX = [];
for (const l of LIBS) {
  INDEX.push({ kind: 'library', title: l.name, sub: l.tagline, href: `#/lib/${l.id}`, k: `${l.name} ${l.tagline} ${l.keywords || ''}` });
  for (const g of l.cheatsheet) {
    INDEX.push({ kind: 'section', title: `${l.name} · ${g.title}`, sub: g.blurb || '', href: `#/lib/${l.id}#${l.id}-${g.id}`, k: `${l.name} ${g.title} ${g.blurb || ''}` });
    for (const s of g.snippets) INDEX.push({ kind: 'snippet', title: s.title, sub: `${l.name} · ${g.title}`, href: `#/lib/${l.id}#${l.id}-${g.id}`, k: `${l.name} ${s.title} ${s.code.slice(0, 200)}` });
  }
  for (const c of l.concepts || []) INDEX.push({ kind: 'concept', title: c.title, sub: `${l.name} · animated`, href: `#/lib/${l.id}#${l.id}-concept-${c.id}`, k: `${l.name} ${c.title} ${c.intro}` });
  for (const g of l.gotchas || []) INDEX.push({ kind: 'gotcha', title: g.title, sub: `${l.name} · gotcha`, href: `#/lib/${l.id}#${l.id}-gotchas`, k: `${l.name} gotcha ${g.title}` });
}
for (const c of COMPARISONS) INDEX.push({ kind: 'compare', title: c.title, sub: c.lede, href: `#/compare#${c.id}`, k: `compare ${c.title} ${c.lede} ${c.columns.join(' ')}` });
INDEX.push({ kind: 'page', title: 'Sandbox', sub: 'Run Python in the browser with mock data', href: '#/sandbox', k: 'sandbox run python try' });

function search(q) {
  q = q.trim().toLowerCase();
  if (!q) return INDEX.filter(i => i.kind === 'library' || i.kind === 'page').slice(0, 14);
  const terms = q.split(/\s+/);
  return INDEX.map(i => {
    const hay = i.k.toLowerCase(), t = i.title.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t === term) score += 40; else if (t.startsWith(term)) score += 20; else if (t.includes(term)) score += 12; else if (hay.includes(term)) score += 4; else return null;
    }
    if (i.kind === 'library') score += 6;
    return { i, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 14).map(x => x.i);
}
let sel = 0, results = [];
function renderResults() {
  results = search(pInput.value);
  sel = Math.min(sel, Math.max(0, results.length - 1));
  pResults.innerHTML = results.length ? results.map((r, i) => `<li role="option" id="pr-${i}" aria-selected="${i === sel}" data-i="${i}"><span class="kind">${r.kind}</span><span><b>${esc(r.title)}</b><small>${esc(r.sub)}</small></span><span></span></li>`).join('') : `<li class="empty">No matches. Try a library name, a function, or a concept.</li>`;
  pInput.setAttribute('aria-activedescendant', results.length ? `pr-${sel}` : '');
  pResults.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
let lastFocus = null;
function openPalette() { lastFocus = document.activeElement; palette.hidden = false; pInput.value = ''; sel = 0; renderResults(); pInput.focus(); }
function closePalette() { palette.hidden = true; lastFocus?.focus?.(); }
function choose(i) { const r = results[i]; if (!r) return; closePalette(); location.hash = r.href; }
$('#search-btn').addEventListener('click', openPalette);
palette.addEventListener('click', e => { if (e.target === palette) closePalette(); });
pInput.addEventListener('input', () => { sel = 0; renderResults(); });
pInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); renderResults(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); renderResults(); }
  else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
  else if (e.key === 'Escape') { closePalette(); }
});
pResults.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) choose(+li.dataset.i); });
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : closePalette(); }
  else if (e.key === '/' && !palette.hidden === false && !/input|textarea/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); openPalette(); }
  else if (e.key === 'Escape' && !palette.hidden) closePalette();
});

/* ---------- boot ---------- */
renderRail();
route();
// Warm the Python runtime after the page settles, but only on fast-ish connections.
if (!navigator.connection || !navigator.connection.saveData) setTimeout(() => sandbox.warm(), 4000);
