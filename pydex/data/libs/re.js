import { scene } from '../../js/explainer.js';

// How the backtracking engine walks `<.+>` versus `<.+?>` over "<b>bold</b> <i>it</i>".
const SUBJECT = '<b>bold</b> <i>it</i>';
const backtrackExplainer = {
  hold: 3200,
  code: [
    's = "<b>bold</b> <i>it</i>"',
    're.findall(r"<.+>", s)      # greedy',
    're.findall(r"<.+?>", s)     # lazy',
    're.findall(r"<[^>]+>", s)   # negated class',
  ],
  build() {
    const s = scene(760, 320);
    s.text('h0', 20, 22, 'subject, one cell per character', 'lbl bold', undefined, 'start');
    const CW = 32;
    SUBJECT.split('').forEach((ch, i) => {
      const g = s.g(`c${i}`, 20 + i * CW, 40);
      s.rect(`c${i}.r`, 0, 0, CW - 3, 34, 'cell', g);
      s.text(`c${i}.t`, (CW - 3) / 2, 17, ch === ' ' ? '␣' : ch, 'mono', g);
      s.text(`c${i}.i`, (CW - 3) / 2, 86 - 40, String(i), 'sm ink-3', g);
    });
    s.text('h1', 20, 120, 'pattern', 'lbl bold', undefined, 'start');
    s.cell('p0', 20, 138, 44, 32, '<', 'cell');
    s.cell('p1', 72, 138, 64, 32, '.+', 'cell');
    s.cell('p2', 144, 138, 44, 32, '>', 'cell');
    s.text('cur', 210, 154, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l1', 20, 200, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l2', 20, 222, '', 'lbl sm ink-2', undefined, 'start');
    s.text('res', 20, 262, '', 'lbl bold', undefined, 'start');
    s.text('res2', 20, 286, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: (() => {
    const all = (cls, from = 0, to = SUBJECT.length - 1) => { const p = {}; for (let i = from; i <= to; i++) p[`c${i}.r`] = { cls }; return p; };
    return [
      { title: 'The engine tries the pattern at position 0', caption: 'Matching starts at the leftmost position and only moves the start forward when every path from here has failed. "<" matches character 0, so the cursor advances to 1 and the next token gets a turn.', lines: [1],
        patch: { ...all('cell'), 'c0.r': { cls: 'cell ok' }, 'p0.r': { cls: 'cell ok' }, cur: { text: 'cursor at 1' }, l1: { text: '"<" consumed 1 character' } } },
      { title: 'Greedy .+ takes everything it can', caption: '"." matches any character except a newline and "+" is greedy, so it swallows characters 1 to 20, the whole rest of the string. Only then does the engine try the next token.', lines: [1],
        patch: { ...all('cell hot', 1, 20), 'p0.r': { cls: 'cell' }, 'p1.r': { cls: 'cell hot' }, cur: { text: 'cursor at 21 (end of string)' }, l1: { text: '".+" consumed 20 characters' }, l2: { text: '">" now needs a character, but there is none' } } },
      { title: 'Backtrack: give one back and retry', caption: 'The engine returns to the last choice point and makes .+ give up one character. Character 20 is ">", so ">" matches and the whole string is the match. Had there been no ">" at all, it would have shrunk 20 times, then moved the start to 1 and done it all again.', lines: [1],
        patch: { 'c20.r': { cls: 'cell ok' }, 'p1.r': { cls: 'cell' }, 'p2.r': { cls: 'cell ok' }, cur: { text: 'cursor at 21 after 1 backtrack' }, l1: { text: '".+" gave back 1 character (19 kept)' }, l2: { text: '">" matched at 20' }, res: { text: 'match: <b>bold</b> <i>it</i>   (one result)' }, res2: { text: 'greedy quantifiers match the longest span first' } } },
      { title: 'Lazy .+? takes the least and grows', caption: 'With "?" the quantifier starts by matching one character and hands over to ">". Character 2 is ">", so the match ends there: "<b>". Lazy still backtracks, but in the other direction: it expands one character at a time while the rest of the pattern fails.', lines: [2],
        patch: { ...all('cell', 1, 20), 'c0.r': { cls: 'cell ok' }, 'c1.r': { cls: 'cell hot' }, 'c2.r': { cls: 'cell ok' }, 'p1.t': { text: '.+?' }, 'p1.r': { cls: 'cell hot' }, cur: { text: 'cursor at 3' }, l1: { text: '".+?" tried 1 character, then ">" matched at 2' }, l2: { text: '' }, res: { text: 'match: <b>' }, res2: { text: 'lazy quantifiers match the shortest span first' } } },
      { title: 'findall resumes where the last match ended', caption: 'Each later match starts at the end of the previous one, never overlapping. The lazy pattern yields four tags; the greedy one yielded a single match that ate them all.', lines: [2],
        patch: { ...all('cell ok', 7, 10), ...all('cell info', 12, 14), ...all('cell ok', 17, 20), 'c1.r': { cls: 'cell ok' }, 'p1.r': { cls: 'cell' }, cur: { text: '' }, l1: { text: 'matches start at 0, 7, 12, 17' }, res: { text: "['<b>', '</b>', '<i>', '</i>']" }, res2: { text: 'empty matches advance the cursor by one so the loop always ends' } } },
      { title: 'A negated class never needs to backtrack', caption: '"[^>]+" cannot cross a ">", so it stops exactly where ">" must match: no over-shoot, no give-back. It reads as intent ("anything but the closer") and is the fastest of the three. Possessive "[^>]++" (3.11+) additionally forbids giving back.', lines: [3],
        patch: { 'p1.t': { text: '[^>]+' }, 'p1.r': { cls: 'cell ok' }, 'p2.r': { cls: 'cell ok' }, 'p0.r': { cls: 'cell ok' }, l1: { text: 'each match: scan to the first ">", done' }, l2: { text: '0 backtracks' }, res2: { text: 'prefer a negated class when the stop character is known' } } },
    ];
  })(),
};

export default {
  id: 're', name: 're', glyph: 're', group: 'essentials', version: '3.12, standard library', keywords: 'regex regular expression search match findall sub split compile groups lookahead',
  tagline: 'Regular expressions: search, extract, replace, split.',
  install: 'built in — import re', docs: 'https://docs.python.org/3/library/re.html', packages: [],
  overview: {
    what: 're is a backtracking regular-expression engine. You describe a pattern once, then search for it, pull out groups, replace it or split on it. Patterns are strings (write them raw: r"..."), and compiled Pattern objects carry the same methods as the module. Most bugs come from three things: forgetting that match() is anchored, forgetting that "." skips newlines, and writing greedy quantifiers where a negated class was meant.',
    yes: ['Validating and extracting structured text: ids, dates, prices, log lines.', 'Search-and-replace with backreferences or a function per match.', 'Tokenising small languages with named alternatives.', 'Splitting on anything more complex than a single string.'],
    no: ['Parsing HTML, JSON or CSV: use a real parser (bs4, json, csv).', 'Plain substring tests: str.startswith, in, str.split are faster and clearer.', 'Unicode-heavy or very large patterns where the third-party regex module adds features and speed.'],
  },
  cheatsheet: [
    { id: 'find', title: 'Find', blurb: 'search looks anywhere, match anchors at the start, fullmatch requires the whole string.', snippets: [
      { title: 'search, match, fullmatch', code: `import re

line = "1003,2025-02-14,West,Farah,107,4,129.0,0,shipped"
print(re.search(r"\\d{4}-\\d{2}-\\d{2}", line))            # anywhere in the string
print(re.match(r"\\d{4}-\\d{2}", line))                   # only at position 0: None
print(re.match(r"\\d+", line).group())                    # "1003"
print(re.fullmatch(r"[^,]+(,[^,]+){8}", line) is not None) # whole string, 9 fields

m = re.search(r"(West|East),(\\w+)", line)
print(m.group(0), "|", m.group(1), "|", m.group(2), m.span())
print(m[2], m.start(2), line[m.start(2):m.end(2)])`, note: 'A failed search returns <code>None</code>, so test the result before calling <code>.group()</code>. The walrus helps: <code>if m := re.search(...):</code>.' },
      { title: 'findall and finditer', code: `import re

html = open("/data/page.html").read()
prices = re.findall(r"\\$(\\d+\\.\\d{2})", html)       # one group -> list of strings
print(len(prices), prices[:4], sum(map(float, prices)))

for m in re.finditer(r'data-id="(\\d+)"', html):
    print(m.group(1), "at offset", m.start())
    if m.group(1) == "103":
        break
print(re.findall(r'<span class="(\\w+)">', html)[:3])`, note: '<code>findall</code> returns strings (or tuples when there are several groups). <code>finditer</code> yields Match objects lazily, with positions.' },
    ] },
    { id: 'groups', title: 'Groups', snippets: [
      { title: 'Named groups over CSV lines', code: `import re

ORDER = re.compile(r"""
    ^(?P<id>\\d+),(?P<date>\\d{4}-\\d{2}-\\d{2}),(?P<region>\\w+),
    (?P<rep>\\w+),(?P<product>\\d+),(?P<qty>\\d+),(?P<price>[\\d.]+),
    (?P<discount>[\\d.]+),(?P<status>\\w+)$
""", re.VERBOSE)

with open("/data/orders.csv") as f:
    next(f)                                  # skip the header
    rows = [ORDER.match(line.rstrip("\\n")).groupdict() for line in f]
print(len(rows), rows[0])
print("shipped units:", sum(int(r["qty"]) for r in rows if r["status"] == "shipped"))`, note: '<code>re.VERBOSE</code> ignores whitespace and <code>#</code> comments inside the pattern, so a long pattern can be laid out and annotated. Use <code>csv</code> for real CSV; this is for line formats without a parser.' },
      { title: 'Optional groups and alternation', code: `import re

qty = re.compile(r"(?P<n>[\\d.]+)\\s*(?P<unit>kg|g|L|cm)?")
for s in ["16 kg", "1.7 L", "20cm", "42"]:
    m = qty.search(s)
    print(f"{s!r:8} ->", m.group("n"), m.group("unit"), m.groupdict())

name = re.compile(r"(?P<first>\\w+)(?:\\s+(?P<middle>\\w+))?\\s+(?P<last>\\w+)")
print(name.fullmatch("Amara Okafor").groupdict())
print(name.fullmatch("Chen Wei Lu").groupdict())
print(name.groupindex)`, note: 'An unmatched optional group gives <code>None</code>, not an empty string. <code>(?:...)</code> groups without capturing, which keeps <code>findall</code> and numbering clean.' },
    ] },
    { id: 'flags', title: 'Compile and flags', snippets: [
      { title: 'IGNORECASE, MULTILINE, DOTALL', code: `import re

text = "Region: North\\nregion: south\\nREGION: East"
print(re.findall(r"^region: (\\w+)$", text, flags=re.IGNORECASE | re.MULTILINE))
print(re.findall(r"^region", text))                # no MULTILINE: ^ is only the start
print(re.findall(r"(?im)^region: (\\w+)", text))    # same flags, inline

html = "<p>one\\ntwo</p>"
print(re.search(r"<p>(.*)</p>", html))             # None: . stops at newline
print(re.search(r"<p>(.*)</p>", html, re.DOTALL).group(1))
print(re.search(r"(?s)<p>(.*)</p>", html).group(1))`, note: '<code>re.M</code>, <code>re.I</code>, <code>re.S</code>, <code>re.X</code> are the short names. Inline flags must appear at the very start of the pattern.' },
      { title: 'Compile once, reuse everywhere', code: `import re

EMAIL = re.compile(r"^[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+$")
for s in ["ann@example.com", "bo.lind+x@mail.co.uk", "bad@", "@nope.com", "a@b.c"]:
    print(f"{s:<24} {bool(EMAIL.match(s))}")

print(EMAIL.pattern)
print(EMAIL.groups, EMAIL.flags & re.IGNORECASE)
print(EMAIL.search("contact: ann@example.com") is None)   # anchored, so no`, note: 'The module functions cache the last 512 compiled patterns, so compiling is about a name and a place for the pattern, not speed. Rough email checks like this are for forms, not for correctness.' },
    ] },
    { id: 'sub', title: 'Replace and split', snippets: [
      { title: 'sub with backreferences', code: `import re

print(re.sub(r"(\\d{4})-(\\d{2})-(\\d{2})", r"\\3/\\2/\\1", "due 2026-09-11, paid 2026-09-30"))
print(re.sub(r"(?P<y>\\d{4})-(?P<m>\\d{2})", r"\\g<m>/\\g<y>", "2026-09"))
print(re.sub(r"\\s+", " ", "too   many\\n\\tspaces"))
print(re.sub(r"a", "x", "banana", count=2))
print(re.subn(r"[aeiou]", "", "banana"))            # (result, replacements)
print(re.sub(r"\\$(\\d+)", r"\\1 USD", "costs $39 or $64"))`, note: 'The replacement string is processed for backslash escapes: <code>\\1</code>, <code>\\g&lt;name&gt;</code>, <code>\\n</code>. Use <code>\\g&lt;1&gt;0</code> when a digit follows a group reference.' },
      { title: 'A function as the replacement', code: `import re

text = "Kettle $39.00, Desk lamp $29.90, Rain shell $159.00"
def with_tax(m: re.Match) -> str:
    return f"\${float(m.group(1)) * 1.2:.2f}"
print(re.sub(r"\\$(\\d+\\.\\d\\d)", with_tax, text))

print(re.sub(r"\\b(\\w)(\\w*)", lambda m: m.group(1).upper() + m.group(2), "chef knife 20 cm"))

counter = iter(range(1, 100))
print(re.sub(r"\\?", lambda m: f":p{next(counter)}", "select * from t where a=? and b=?"))`, note: 'The function receives the Match and returns the replacement text verbatim: no escape processing, so a literal backslash or dollar sign is safe.' },
      { title: 'split', code: `import re

print(re.split(r"\\s*[,;]\\s*", "a, b;c ,  d"))
print(re.split(r"(\\d+)", "ab12cd3e"))           # a capturing group keeps the separators
print(re.split(r"\\s+", "  leading and trailing  ".strip()))
print(re.split(r"\\n\\s*\\n", "para one\\nstill one\\n\\npara two"))
print(re.split(r",", "a,b,c", maxsplit=1))
print(re.split(r"\\b", "hi there"))              # zero-width splits are allowed (3.7+)` },
    ] },
    { id: 'quant', title: 'Quantifiers and lookarounds', snippets: [
      { title: 'Greedy, lazy, possessive', code: `import re

s = "<b>bold</b> <i>it</i>"
print(re.findall(r"<.+>", s))       # greedy: one match, the whole string
print(re.findall(r"<.+?>", s))      # lazy: four tags
print(re.findall(r"<[^>]+>", s))    # negated class: four tags, no backtracking

print(re.search(r"\\d+\\.", "12345"))       # None, after trying 5 shorter \\d+ spans
print(re.search(r"\\d++\\.", "12345"))      # possessive (3.11+): fails immediately
print(re.search(r"(?>\\d+)\\.", "123.4"))   # atomic group: the same idea
print(re.findall(r"a{2,3}", "a aa aaa aaaa"))`, note: 'Every backtracking quantifier is a potential performance cliff on non-matching input. Prefer a negated class when you know the stop character.' },
      { title: 'Lookahead and lookbehind', code: `import re

print(re.findall(r"\\d+(?= kg)", "16 kg and 20 cm and 5 kg"))       # followed by " kg"
print(re.findall(r"(?<=\\$)\\d+\\.\\d\\d", "cost $39.00, was $64.00"))  # preceded by $
print(re.sub(r"(?<=\\d)(?=(?:\\d{3})+$)", ",", "1234567"))              # thousands separators

password = "Kettle2026!"
strong = re.fullmatch(r"(?=.*\\d)(?=.*[A-Z])(?=.*[^\\w\\s]).{8,}", password)
print(bool(strong))
print(re.findall(r"\\b\\w+\\b(?![,.])", "one, two three."))             # not before , or .`, note: 'Lookarounds match a position, not text, so the outer match does not include them. Lookbehind must have a fixed width in <code>re</code>.' },
    ] },
    { id: 'recipes', title: 'Recipes', snippets: [
      { title: 'Tokenise with named alternatives', code: `import re

TOKEN = re.compile(r"""
    (?P<NUM>\\d+(?:\\.\\d+)?) | (?P<ID>[A-Za-z_]\\w*) | (?P<OP>[-+*/=()])
  | (?P<WS>\\s+)              | (?P<ERR>.)
""", re.VERBOSE)

def tokens(src: str):
    for m in TOKEN.finditer(src):
        if m.lastgroup != "WS":
            yield m.lastgroup, m.group()

print(list(tokens("price = qty * 39.0 + 2")))
print(list(tokens("x = 1 $")))                     # ERR catches what nothing else does`, note: '<code>m.lastgroup</code> names the alternative that matched. Order matters: earlier alternatives win, so put the catch-all last.' },
      { title: 'Escape input and build patterns', code: `import re

words = ["C++", "a.b", "x*y"]
pat = re.compile("|".join(re.escape(w) for w in sorted(words, key=len, reverse=True)))
print(pat.findall("learn C++ or a.b, never x*y"))
print(re.escape("price: $39.00 (sale?)"))

region = "West"
line_re = re.compile(rf"^(\\d+),([^,]+),{re.escape(region)},", re.MULTILINE)
with open("/data/orders.csv") as f:
    text = f.read()
print(line_re.findall(text)[:3], "of", len(line_re.findall(text)))`, note: 'Never interpolate raw user text into a pattern; <code>re.escape</code> neutralises every metacharacter. Longest alternatives first avoids a short word winning over a longer one.' },
    ] },
  ],
  concepts: [
    { id: 'backtracking', title: 'How the engine walks a pattern', intro: 'The same pattern with a greedy, lazy or negated-class middle produces different matches and does very different amounts of work. Watch the cursor and the give-backs.', explainer: backtrackExplainer },
  ],
  compare: [
    { title: 'The five ways to look', columns: ['match', 'search', 'fullmatch', 'findall', 'finditer'], rows: [
      ['Anchored', 'start only', false, 'start and end', false, false],
      ['Returns', 'Match or None', 'Match or None', 'Match or None', 'list of str/tuple', 'iterator of Match'],
      ['All occurrences', false, false, false, true, true],
      ['Gives positions', true, true, true, false, true],
      ['Typical use', 'validate a prefix', 'find one thing', 'validate a whole string', 'quick extraction', 'extraction with spans'],
    ], verdict: '<code>search</code> when you are looking, <code>fullmatch</code> when you are validating, <code>finditer</code> when you need more than the text of each hit. <code>match</code> is rarely what you meant.' },
    { title: 'Matching "up to the closer"', columns: ['<.+>', '<.+?>', '<[^>]+>', '<[^>]++>'], rows: [
      ['Stops at the first >', false, true, true, true],
      ['Backtracks', 'a lot', 'a little', false, false],
      ['Can span a newline', false, false, true, true],
      ['Speed on non-matching input', { dots: 1 }, { dots: 2 }, { dots: 4 }, { dots: 5 }],
      ['Readability', { dots: 3 }, { dots: 3 }, { dots: 4 }, { dots: 3 }],
    ], note: 'Ratings are judgement calls. Possessive quantifiers need Python 3.11+.', verdict: 'Reach for the negated class first. Lazy quantifiers are right when the stop token is more than one character, such as <code>-->&gt;</code> or <code>&lt;/p&gt;</code>.' },
  ],
  gotchas: [
    { title: 'match only looks at the start', bad: `re.match(r"\\d{4}-\\d{2}-\\d{2}", "due 2026-09-11")
# None`, good: `re.search(r"\\d{4}-\\d{2}-\\d{2}", "due 2026-09-11")
# <re.Match ... '2026-09-11'>`, why: '<code>match</code> is implicitly anchored at position 0 (but not at the end; that is <code>fullmatch</code>). Use <code>search</code> to find a pattern anywhere.' },
    { title: 'Patterns must be raw strings', bad: `re.findall("\\bcat\\b", "cat catalog")
# [] : "\\b" in a normal string is a backspace character`, good: `re.findall(r"\\bcat\\b", "cat catalog")
# ['cat']`, why: 'Python processes backslash escapes before <code>re</code> sees the pattern. <code>r"..."</code> keeps <code>\\b</code>, <code>\\d</code> and friends intact, and the same applies to replacement strings.' },
    { title: 'findall returns only the groups', bad: `re.findall(r"(\\d+) (kg|cm)", "16 kg, 20 cm")
# [('16', 'kg'), ('20', 'cm')]  -- the whole match is gone`, good: `[m.group() for m in re.finditer(r"(\\d+) (kg|cm)", "16 kg, 20 cm")]
# ['16 kg', '20 cm']
# or make the groups non-capturing: r"\\d+ (?:kg|cm)"`, why: 'With one group <code>findall</code> gives that group, with several it gives tuples, and only with none does it give whole matches. <code>finditer</code> always gives Match objects.' },
    { title: 'Backslashes in the replacement are processed', bad: `re.sub(r"dir", "C:\\\\new\\\\dir", "the dir")
# re.error: bad escape \\d  (and \\n would have become a newline)`, good: `re.sub(r"dir", lambda m: "C:\\\\new\\\\dir", "the dir")
# or escape: re.sub(r"dir", r"C:\\new\\dir".replace("\\\\", "\\\\\\\\"), s)`, why: '<code>sub</code> interprets <code>\\1</code>, <code>\\g&lt;x&gt;</code> and standard escapes in a string replacement. A function replacement returns its text untouched, which is the safest way to insert arbitrary content.' },
  ],
  presets: [
    { title: 'Tally shipped orders per region', code: `import re
from collections import Counter

LINE = re.compile(r"^(?P<id>\\d+),(?P<date>[\\d-]+),(?P<region>\\w+),(?P<rep>\\w+),\\d+,(?P<qty>\\d+),[\\d.]+,[\\d.]+,(?P<status>\\w+)$", re.M)

with open("/data/orders.csv") as f:
    text = f.read()
units = Counter()
for m in LINE.finditer(text):
    if m["status"] == "shipped":
        units[m["region"]] += int(m["qty"])
for region, n in units.most_common():
    print(f"{region:<6} {n:>4} units {'#' * (n // 10)}")` },
  ],
};
