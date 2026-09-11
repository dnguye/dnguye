import { scene } from '../../js/explainer.js';

// What json.dumps does as it walks a nested object and meets a type it does not know.
const dumpsExplainer = {
  hold: 3200,
  code: [
    'record = {"id": 101, "name": "Kettle", "tags": ["kitchen", "sale"],',
    '          "price": Decimal("39.0"), "added": date(2026, 9, 11)}',
    'json.dumps(record)                     # TypeError at Decimal',
    'json.dumps(record, default=to_json)    # default(o) is called for unknown types',
  ],
  build() {
    const s = scene(760, 330);
    s.text('h0', 20, 22, 'the object tree', 'lbl bold', undefined, 'start');
    s.cell('root', 20, 40, 120, 32, 'dict', 'cell');
    const kids = [['k0', '"id": 101'], ['k1', '"name": "Kettle"'], ['k2', '"tags": [...]'], ['k3', '"price": Decimal'], ['k4', '"added": date']];
    kids.forEach(([id, l], i) => { s.cell(id, 60, 84 + i * 40, 200, 32, l, 'cell'); s.line(`${id}.l`, 40, 72, 40, 100 + i * 40, 'arrow'); s.reg.get(`${id}.l`).style.markerEnd = 'none'; });
    s.cell('k2a', 280, 164, 130, 32, '"kitchen", "sale"', 'cell');
    s.line('k2a.l', 262, 180, 278, 180, 'arrow'); s.reg.get('k2a.l').style.markerEnd = 'none';
    // output panel
    s.rect('out', 440, 40, 300, 150, 'panel', undefined, 8);
    s.text('oh', 452, 56, 'output so far', 'lbl sm bold ink-2', undefined, 'start');
    const lines = ['', '', '', '', '', ''];
    lines.forEach((t, i) => s.text(`o${i}`, 452, 78 + i * 18, t, 'sm', undefined, 'start'));
    // default box
    s.rect('def', 440, 210, 300, 96, 'panel hid', undefined, 8);
    s.text('def.t', 452, 228, 'default(o)', 'lbl sm bold ink-2', undefined, 'start');
    s.text('def.1', 452, 250, '', 'lbl sm', undefined, 'start');
    s.text('def.2', 452, 268, '', 'lbl sm', undefined, 'start');
    s.text('def.3', 452, 286, '', 'lbl sm', undefined, 'start');
    for (const id of ['def.t', 'def.1', 'def.2', 'def.3']) s.reg.get(id).classList.add('hid');
    s.text('foot', 20, 300, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The encoder walks the tree top-down', caption: 'dumps hands the object to a JSONEncoder, which looks at its type. A dict opens a "{" and then visits each key/value pair in insertion order (or sorted, with sort_keys=True).', lines: [2],
      patch: { 'root.r': { cls: 'cell hot' }, o0: { text: '{' } } },
    { title: 'Known types are written immediately', caption: 'str, int, float, bool and None have fixed encodings: strings are quoted and escaped, True becomes true. Keys must be one of these too, and non-string keys are coerced to strings.', lines: [2],
      patch: { 'root.r': { cls: 'cell' }, 'k0.r': { cls: 'cell ok' }, 'k1.r': { cls: 'cell ok' }, o1: { text: '"id": 101, "name": "Kettle",' } } },
    { title: 'Lists and dicts recurse', caption: 'A list opens "[" and encodes each element the same way, so nesting is handled by the same walk. Tuples are treated as lists here, which is why they come back as lists.', lines: [2],
      patch: { 'k2.r': { cls: 'cell ok' }, 'k2a.r': { cls: 'cell ok' }, o2: { text: '"tags": ["kitchen", "sale"],' } } },
    { title: 'An unknown type stops the walk', caption: 'Decimal is not in the table. The encoder calls self.default(o). The stock default raises TypeError: Object of type Decimal is not JSON serializable, and nothing has been written to the file yet if you used dump().', lines: [2],
      patch: { 'k3.r': { cls: 'cell err' }, def: { cls: 'panel hot' }, 'def.t': { cls: 'lbl sm bold ink-2' }, 'def.1': { cls: 'lbl sm', text: 'called only for types the table lacks' }, 'def.2': { cls: 'lbl sm', text: 'stock version: raise TypeError' }, o3: { text: '"price": ???' }, foot: { text: 'TypeError: Object of type Decimal is not JSON serializable' } } },
    { title: 'default= returns something encodable', caption: 'Your default(o) returns a replacement: str(o), o.isoformat(), a dict. The encoder encodes that return value with the same walk, so returning a dict that itself contains a date works: default is simply called again.', lines: [3],
      patch: { 'k3.r': { cls: 'cell ok' }, 'def.2': { cls: 'lbl sm', text: 'yours: return str(o) / o.isoformat() / a dict' }, 'def.3': { cls: 'lbl sm', text: 'the return value is encoded recursively' }, o3: { text: '"price": "39.0",' }, foot: { text: '' } } },
    { title: 'Same again for date, then close', caption: 'date is not known either, so default runs a second time and returns "2026-09-11". The closing "}" is written and the string is returned. Note: default never sees str or int, so it cannot change how those are written; use a JSONEncoder subclass or pre-convert for that.', lines: [3],
      patch: { 'k4.r': { cls: 'cell ok' }, o4: { text: '"added": "2026-09-11"' }, o5: { text: '}' }, def: { cls: 'panel' }, 'out': { cls: 'panel hot' } } },
  ],
};

export default {
  id: 'json', name: 'json', glyph: 'js', group: 'essentials', version: '3.12, standard library', keywords: 'json dumps loads dump load serialize deserialize encoder decoder default object_hook jsonl',
  tagline: 'Serialise Python data to JSON text and back, with hooks for the rest.',
  install: 'built in — import json', docs: 'https://docs.python.org/3/library/json.html', packages: [],
  overview: {
    what: 'json converts between JSON text and the Python types that map onto it: dict, list, str, int, float, bool and None. Four functions cover almost everything: dumps/loads for strings, dump/load for files. When your data has a type JSON does not know (datetime, Decimal, dataclass), you tell the encoder what to do with it through default= or a JSONEncoder subclass; on the way back, object_hook rebuilds objects from dicts.',
    yes: ['Config files, API payloads, fixtures and caches.', 'JSON Lines logs: one object per line, appended and streamed.', 'Anything you exchange with JavaScript or a REST service.'],
    no: ['Speed-critical parsing of huge documents (orjson, msgspec, ijson for streaming).', 'Data with rich types you want back automatically (pydantic, msgspec, pickle for Python-only).', 'Human-edited config with comments (TOML via tomllib, YAML).'],
  },
  cheatsheet: [
    { id: 'io', title: 'Load and dump', blurb: 'load/dump take file objects; loads/dumps take strings.', snippets: [
      { title: 'Read a file, filter, write a file', code: `import json

with open("/data/products.json", encoding="utf-8") as f:
    products = json.load(f)
print(type(products).__name__, len(products), products[0])

cheap = [p for p in products if p["price"] < 40]
with open("/tmp/cheap.json", "w", encoding="utf-8") as f:
    json.dump(cheap, f, indent=2)
print(open("/tmp/cheap.json").read()[:90])`, note: '<code>load</code> wants an open file, not a path. Writing with <code>indent</code> costs bytes; drop it for machine-only files.' },
      { title: 'Strings: loads and dumps', code: `import json

text = '{"id": 7, "tags": ["a", "b"], "price": 9.5, "gift": null, "ok": true}'
obj = json.loads(text)
print(obj["gift"], obj["ok"], type(obj["price"]).__name__)

print(json.dumps(obj))
print(json.dumps(obj, indent=2, sort_keys=True))
print(json.dumps(obj, separators=(",", ":")))       # compact: no spaces at all
print(len(json.dumps(obj)), len(json.dumps(obj, separators=(",", ":"))))`, note: 'Default separators are <code>(", ", ": ")</code>; with <code>indent</code> the item separator drops its trailing space automatically.' },
    ] },
    { id: 'types', title: 'Type mapping', snippets: [
      { title: 'What becomes what', code: `import json

out = json.dumps({"t": (1, 2), "n": None, "b": True, "big": 10**20,
                  "f": 1.0, "s": "caf\\u00e9 \\u2713", 3: "int key"})
print(out)
back = json.loads(out)
print(back)                              # tuple -> list, 3 -> "3"
print(json.dumps("caf\\u00e9", ensure_ascii=False))   # keep UTF-8 as is
try:
    json.dumps({"s": {1, 2}})
except TypeError as e:
    print("TypeError:", e)`, note: 'Round trips are lossy for tuples, sets, non-string keys and anything outside the seven JSON types. Decide the mapping explicitly when it matters.' },
      { title: 'Precision: parse_float, Decimal, NaN', code: `import json
from decimal import Decimal

raw = '{"total": 0.1, "big": 12345678901234567890.5}'
print(json.loads(raw))
exact = json.loads(raw, parse_float=Decimal)
print(exact, type(exact["total"]).__name__)

print(json.dumps({"x": float("nan"), "y": float("inf")}))   # NaN, Infinity: not real JSON
try:
    json.dumps({"x": float("nan")}, allow_nan=False)
except ValueError as e:
    print("ValueError:", e)
print(json.dumps(Decimal("39.90"), default=str))`, note: '<code>parse_float</code> and <code>parse_int</code> receive the raw digits as a string, so nothing is rounded before you see it.' },
    ] },
    { id: 'custom', title: 'Types JSON does not know', blurb: 'default= for one-offs, a JSONEncoder subclass to reuse, object_hook on the way back.', snippets: [
      { title: 'default= for one-off conversions', code: `import json
from datetime import datetime, date, UTC
from decimal import Decimal
from pathlib import Path

record = {"when": datetime(2026, 9, 11, 14, 30, tzinfo=UTC), "day": date(2026, 9, 11),
          "price": Decimal("39.90"), "tags": {"sale", "new"}, "file": Path("/data/orders.csv")}

def to_json(o):
    if isinstance(o, (datetime, date)): return o.isoformat()
    if isinstance(o, Decimal): return str(o)
    if isinstance(o, set): return sorted(o)
    if isinstance(o, Path): return str(o)
    raise TypeError(f"not serialisable: {type(o).__name__}")

print(json.dumps(record, default=to_json, indent=1))`, note: 'Raise <code>TypeError</code> for anything you did not expect. Returning <code>str(o)</code> for everything hides bugs.' },
      { title: 'A JSONEncoder subclass you can reuse', code: `import json
from dataclasses import dataclass, asdict, is_dataclass
from datetime import date

@dataclass
class Order:
    id: int
    day: date
    lines: list[str]

class AppEncoder(json.JSONEncoder):
    def default(self, o):
        if is_dataclass(o): return asdict(o)      # a dict that still holds a date
        if isinstance(o, date): return o.isoformat()
        return super().default(o)                 # the standard TypeError

print(json.dumps(Order(1, date(2026, 9, 11), ["kettle"]), cls=AppEncoder))
print(json.dumps({"orders": [Order(2, date(2026, 1, 1), [])]}, cls=AppEncoder, indent=1))`, note: 'The value returned by <code>default</code> is encoded recursively, so <code>asdict</code> can return a dict containing dates and <code>default</code> runs again for them.' },
      { title: 'object_hook and object_pairs_hook when loading', code: `import json
from datetime import date

def revive(d):
    if d.keys() == {"id", "day", "lines"}:
        return {**d, "day": date.fromisoformat(d["day"])}
    return d

text = '{"orders": [{"id": 1, "day": "2026-09-11", "lines": ["kettle"]}]}'
data = json.loads(text, object_hook=revive)
first = data["orders"][0]
print(first["day"], type(first["day"]).__name__)

pairs = json.loads('{"a": 1, "a": 2}', object_pairs_hook=lambda p: p)
print(pairs)                                   # duplicates preserved as a list
print(json.loads('{"a": 1, "a": 2}'))          # plain loads: last one wins`, note: '<code>object_hook</code> is called bottom-up for every JSON object. Keep it cheap and make it return the dict unchanged when it does not recognise the shape.' },
    ] },
    { id: 'errors', title: 'Errors and validation', snippets: [
      { title: 'JSONDecodeError tells you where', code: `import json

bad = '{"id": 1, "name": "Kettle",}'
try:
    json.loads(bad)
except json.JSONDecodeError as e:
    print(e.msg, "| line", e.lineno, "col", e.colno, "| pos", e.pos)
    print(bad[:e.pos] + " <-- here")

for text in ["42", '"str"', "[1, 2]", "nul", "{'a': 1}", ""]:
    try:
        print(repr(text), "->", json.loads(text))
    except json.JSONDecodeError as e:
        print(repr(text), "-> error:", e.msg)`, note: '<code>JSONDecodeError</code> subclasses <code>ValueError</code>. A top-level number or string is valid JSON; single quotes and trailing commas are not.' },
      { title: 'Check the shape after loading', code: `import json

with open("/data/products.json") as f:
    products = json.load(f)

def valid(p) -> bool:
    match p:
        case {"id": int(), "name": str(), "category": str(), "price": int() | float()}:
            return True
    return False

print(all(valid(p) for p in products), "of", len(products))
print(valid({"id": "101", "name": "x", "category": "y", "price": 1}))
print(valid({"id": 101, "name": "x"}))`, note: 'Structural pattern matching is a lightweight validator. For real schemas with error messages use pydantic or jsonschema.' },
    ] },
    { id: 'lines', title: 'JSON Lines and streams', snippets: [
      { title: 'Write and read JSON Lines', code: `import csv, json

with open("/data/orders.csv", newline="") as f:
    rows = list(csv.DictReader(f))

with open("/tmp/orders.jsonl", "w", encoding="utf-8") as out:
    for r in rows[:5]:
        rec = {"id": int(r["order_id"]), "region": r["region"], "qty": int(r["quantity"])}
        out.write(json.dumps(rec) + "\\n")

with open("/tmp/orders.jsonl", encoding="utf-8") as f:
    for line in f:
        print(json.loads(line))`, note: 'One document per line means you can append, tail, grep and stream without loading the whole file. Keep <code>indent=None</code> so a record never spans lines.' },
      { title: 'raw_decode for concatenated documents', code: `import json

stream = '{"a": 1} {"b": [2, 3]}\\n{"c": null}  trailing junk'
dec = json.JSONDecoder()
pos = 0
while pos < len(stream):
    while pos < len(stream) and stream[pos].isspace():
        pos += 1
    try:
        obj, pos = dec.raw_decode(stream, pos)
    except json.JSONDecodeError:
        print("stopped at", pos, "->", repr(stream[pos:]))
        break
    print(obj)`, note: '<code>raw_decode</code> parses one value and returns where it ended, ignoring what follows. It is the primitive under <code>loads</code>, which then insists the rest is whitespace.' },
    ] },
    { id: 'nested', title: 'Working with nested data', snippets: [
      { title: 'Group, sort, pretty-print', code: `import json
from collections import defaultdict

with open("/data/products.json") as f:
    products = json.load(f)

by_cat = defaultdict(list)
for p in products:
    by_cat[p["category"]].append(p["name"])
summary = {cat: {"count": len(names), "items": sorted(names)}
           for cat, names in sorted(by_cat.items())}
print(json.dumps(summary, indent=2, ensure_ascii=False))` },
      { title: 'Deep merge and dotted lookup', code: `import json

cfg = json.loads('{"db": {"host": "localhost", "port": 5432}, "debug": false}')
override = json.loads('{"db": {"port": 6543}, "log": "info"}')

def deep_merge(a: dict, b: dict) -> dict:
    out = dict(a)
    for k, v in b.items():
        out[k] = deep_merge(out[k], v) if isinstance(out.get(k), dict) and isinstance(v, dict) else v
    return out

def get(d, path, default=None):
    for key in path.split("."):
        if not isinstance(d, dict) or key not in d:
            return default
        d = d[key]
    return d

merged = deep_merge(cfg, override)
print(json.dumps(merged))
print(get(merged, "db.port"), get(merged, "db.user", "n/a"))` },
      { title: 'json.tool from the shell', run: false, code: `python -m json.tool /data/products.json            # pretty-print to stdout
python -m json.tool --compact --sort-keys in.json out.json
echo '{"b":1,"a":[1,2]}' | python -m json.tool --indent 1
python -m json.tool --json-lines events.jsonl        # one document per line`, note: 'Handy for eyeballing an API response: <code>curl ... | python -m json.tool</code>.' },
    ] },
  ],
  concepts: [
    { id: 'dumps', title: 'What dumps does with an object it cannot serialise', intro: 'The encoder is a recursive walk with a small type table. Everything about <code>default=</code>, <code>cls=</code> and the TypeError you get falls out of how that walk treats a type it has never seen.', explainer: dumpsExplainer },
  ],
  compare: [
    { title: 'Handling a type JSON does not know', columns: ['default=', 'cls=JSONEncoder subclass', 'convert before dumps', 'pydantic / msgspec'], rows: [
      ['Where the rule lives', 'a function per call', 'a class you import everywhere', 'at the call site', 'on the model'],
      ['Can change str/int/float output', false, { part: 'by overriding iterencode' }, true, true],
      ['Round-trips back to objects', false, false, { part: 'you write the reverse' }, true],
      ['Ceremony', { dots: 1 }, { dots: 2 }, { dots: 2 }, { dots: 3 }],
      ['Speed', { dots: 3 }, { dots: 3 }, { dots: 3 }, { dots: 5 }],
    ], note: 'Ratings are judgement calls. msgspec and orjson are compiled and skip most of the Python-level walk.', verdict: '<code>default=</code> for a script, a shared <code>JSONEncoder</code> subclass for an app, and a model library once you also need validation on the way in.' },
    { title: 'Ways to read JSON', columns: ['load(file)', 'loads(text)', 'raw_decode', 'JSON Lines loop'], rows: [
      ['Input', 'open file', 'str or bytes', 'str + start index', 'file of one-per-line docs'],
      ['Needs the whole document in memory', true, true, true, { part: 'one line at a time' }],
      ['Accepts trailing data', false, false, true, { part: 'per line' }],
      ['Use for', 'config, fixtures', 'API responses', 'concatenated or streamed values', 'logs, exports, bulk feeds'],
    ], verdict: '<code>loads</code> for payloads, <code>load</code> for files, JSON Lines as soon as a file is appended to or bigger than you want in RAM.' },
  ],
  gotchas: [
    { title: 'Non-string keys come back as strings', bad: `counts = {1: "one", 2: "two"}
json.loads(json.dumps(counts))
# {'1': 'one', '2': 'two'}`, good: `json.loads(json.dumps(counts), object_hook=lambda d: {int(k): v for k, v in d.items()})
# or keep the data as a list of pairs`, why: 'JSON object keys are always strings, so int, float, bool and None keys are coerced on the way out and not restored on the way in. Tuple keys raise TypeError.' },
    { title: 'load takes a file object, not a path', bad: `json.load("/data/products.json")
# AttributeError: 'str' object has no attribute 'read'`, good: `with open("/data/products.json", encoding="utf-8") as f:
    data = json.load(f)
# or: json.loads(Path("/data/products.json").read_text())`, why: '<code>load</code> calls <code>.read()</code> on whatever you give it. The s in <code>loads</code> stands for string.' },
    { title: 'NaN and Infinity are written by default', bad: `json.dumps({"mean": float("nan")})
# '{"mean": NaN}'  -> JavaScript JSON.parse throws`, good: `json.dumps({"mean": None if math.isnan(x) else x})
# and json.dumps(..., allow_nan=False) to fail loudly`, why: '<code>NaN</code> and <code>Infinity</code> are Python extensions to JSON. Most other parsers reject them, and the failure happens on the consumer side, far from the code that wrote the file.' },
    { title: 'ensure_ascii escapes every non-ASCII character', bad: `json.dumps({"city": "São Paulo"})
# '{"city": "S\\\\u00e3o Paulo"}'`, good: `json.dumps({"city": "São Paulo"}, ensure_ascii=False)
# '{"city": "São Paulo"}'  (write the file with encoding="utf-8")`, why: 'The default produces pure ASCII for safety with old transports. It is valid JSON and parses back correctly, but it is bigger and unreadable in a diff.' },
  ],
  presets: [
    { title: 'Catalogue by category', code: `import json
from collections import defaultdict
from decimal import Decimal

with open("/data/products.json") as f:
    products = json.load(f, parse_float=Decimal)

groups = defaultdict(list)
for p in products:
    groups[p["category"]].append(p)
report = {cat: {"n": len(items), "avg_price": sum(p["price"] for p in items) / len(items),
                "cheapest": min(items, key=lambda p: p["price"])["name"]}
          for cat, items in sorted(groups.items())}
print(json.dumps(report, indent=2, default=lambda o: round(float(o), 2)))` },
  ],
};
