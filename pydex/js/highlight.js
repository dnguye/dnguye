// Tiny Python tokenizer → HTML spans. No dependency; good enough for cheat-sheet code.
const KW = new Set(('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case').split(' '));
const BI = new Set(('print len range enumerate zip map filter sorted reversed sum min max abs round int float str bool list dict set tuple type isinstance hasattr getattr setattr open input any all iter next super object bytes id repr format vars dir slice frozenset property staticmethod classmethod Exception ValueError TypeError KeyError IndexError RuntimeError StopIteration NotImplementedError AttributeError ZeroDivisionError').split(' '));
const RE = /(#[^\n]*)|([rRbBfFuU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(@[A-Za-z_][\w.]*)|(\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?j?\b|\b0[xXoObB][\da-fA-F_]+\b)|(\b(?:def|class)\s+)([A-Za-z_]\w*)|(\b[A-Za-z_]\w*)|([-+*/%=<>!&|^~:]+|\.\.\.)/g;

export function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

export function highlight(code) {
  let out = '', last = 0, m;
  RE.lastIndex = 0;
  while ((m = RE.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = RE.lastIndex;
    if (m[1]) out += `<span class="tk-cm">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tk-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tk-dec">${esc(m[3])}</span>`;
    else if (m[4]) out += `<span class="tk-num">${esc(m[4])}</span>`;
    else if (m[5]) out += `<span class="tk-kw">${esc(m[5])}</span><span class="tk-fn">${esc(m[6])}</span>`;
    else if (m[7]) {
      const w = m[7];
      if (KW.has(w)) out += `<span class="tk-kw">${w}</span>`;
      else if (w === 'self' || w === 'cls') out += `<span class="tk-self">${w}</span>`;
      else if (BI.has(w)) out += `<span class="tk-bi">${w}</span>`;
      else if (code[last] === '(') out += `<span class="tk-fn">${w}</span>`;
      else out += w;
    }
    else if (m[8]) out += `<span class="tk-op">${esc(m[8])}</span>`;
  }
  return out + esc(code.slice(last));
}
