// Comparison renderers: feature matrices (yes/no/partial/dots/text) and rating bars.
import { esc } from './highlight.js';

const YES = `<span class="yes" aria-label="yes">✓</span>`, NO = `<span class="no" aria-label="no">—</span>`, PART = `<span class="part" aria-label="partial">◐</span>`;
export function cell(v) {
  if (v === true) return YES;
  if (v === false) return NO;
  if (v && typeof v === 'object') {
    if ('part' in v) return PART + (v.part ? ` <small class="muted">${esc(v.part)}</small>` : '');
    if ('dots' in v) return `<span class="dots" role="img" aria-label="${v.dots} of 5">${[1,2,3,4,5].map(i => `<i class="${i <= v.dots ? 'on' : ''}"></i>`).join('')}</span>`;
    if ('code' in v) return `<code>${esc(v.code)}</code>`;
  }
  return esc(v);
}
export function matrix({ columns, rows, note, title, caption }) {
  const center = (r) => r.slice(1).every(v => v === true || v === false || (v && typeof v === 'object' && ('part' in v || 'dots' in v)));
  return `${title ? `<h3>${esc(title)}</h3>` : ''}<div class="cmp-wrap"><table class="cmp">${caption ? `<caption class="sr-only">${esc(caption)}</caption>` : ''}
    <thead><tr><th scope="col"></th>${columns.map(c => `<th scope="col" class="center">${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${typeof r[0] === 'object' ? cell(r[0]) : esc(r[0])}</th>${r.slice(1).map(v => `<td class="${center(r) ? 'center' : ''}">${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>${note ? `<p class="cmp-note">${note}</p>` : ''}`;
}
export function bars({ title, items, unit = '', max, cls = '' }) {
  const m = max ?? Math.max(...items.map(i => i.value));
  return `${title ? `<h3>${esc(title)}</h3>` : ''}<div class="bars" role="list">${items.map(i => `<div class="bar" role="listitem"><span>${esc(i.label)}</span><div class="track"><div class="fill ${i.cls || cls}" style="--v:${(i.value / m).toFixed(3)}"></div></div><span class="v">${esc(i.text ?? (i.value + unit))}</span></div>`).join('')}</div>`;
}
