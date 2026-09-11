import { scene } from '../../js/explainer.js';

// Slot geometry shared by the deque explainer: five slots, 80 px apart.
const SLOT_X = i => 200 + i * 80;
const SLOT_Y = 110;

const dequeExplainer = {
  hold: 3000,
  code: ['d = deque([1, 2, 3, 4, 5], maxlen=5)', 'd.append(6)       # 1 falls off the left', 'd.appendleft(0)   # 6 falls off the right', 'd.rotate(1)       # last item moves to the front', 'd.rotate(-2)      # first two move to the back', 'd.popleft(), d.pop()   # both ends are O(1)'],
  build() {
    const s = scene(760, 300);
    s.text('title', 20, 24, 'deque(maxlen=5)', 'lbl bold', undefined, 'start');
    s.text('state', 20, 276, 'deque([1, 2, 3, 4, 5], maxlen=5)', 'lbl sm ink-2', undefined, 'start');
    s.text('lblL', SLOT_X(0) + 35, 88, 'left', 'lbl sm ink-2');
    s.text('lblR', SLOT_X(4) + 35, 88, 'right', 'lbl sm ink-2');
    // fixed slots
    for (let i = 0; i < 5; i++) s.rect(`slot${i}`, SLOT_X(i), SLOT_Y, 70, 36, 'panel', undefined, 6);
    // items 1..5 sit in the slots; 0 and 6 wait off-stage
    for (let v = 1; v <= 5; v++) s.cell(`it${v}`, SLOT_X(v - 1), SLOT_Y, 70, 36, String(v));
    s.cell('it6', 680, 180, 70, 36, '6', 'cell info hid');
    s.cell('it0', 20, 180, 70, 36, '0', 'cell info hid');
    s.text('drop', 380, 200, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'Five slots, five items', caption: 'maxlen=5 fixes the capacity. The deque is a ring of blocks under the hood, so "left" and "right" are just two pointers, not the start and end of an array.', lines: [0] },
    { title: 'append(6) on a full deque', caption: 'There is no room, so the item at the opposite end (1) is discarded silently. No exception, no return value: the oldest element simply goes.', lines: [1],
      patch: { it6: { cls: '', x: SLOT_X(4), y: SLOT_Y }, it1: { x: 20, y: 180 }, 'it1.r': { cls: 'cell err' },
        it2: { x: SLOT_X(0) }, it3: { x: SLOT_X(1) }, it4: { x: SLOT_X(2) }, it5: { x: SLOT_X(3) },
        state: { text: 'deque([2, 3, 4, 5, 6], maxlen=5)' }, drop: { text: 'dropped from the left' } } },
    { title: 'appendleft(0) drops from the right', caption: 'The mirror image: the new item enters on the left and 6, the most recent right-hand item, is the one discarded. maxlen always evicts from the end you are not writing to.', lines: [2],
      patch: { it1: { cls: 'hid' }, it0: { cls: '', x: SLOT_X(0), y: SLOT_Y }, it6: { x: 680, y: 180 }, 'it6.r': { cls: 'cell err' },
        it2: { x: SLOT_X(1) }, it3: { x: SLOT_X(2) }, it4: { x: SLOT_X(3) }, it5: { x: SLOT_X(4) },
        state: { text: 'deque([0, 2, 3, 4, 5], maxlen=5)' }, drop: { text: 'dropped from the right' } } },
    { title: 'rotate(1): the last item wraps to the front', caption: 'A positive n takes n items off the right and puts them on the left. Nothing is copied: the ring pointers move. rotate(1) on a full deque is one step around the ring.', lines: [3],
      patch: { it6: { cls: 'hid' }, drop: { text: '' }, 'it5.r': { cls: 'cell hot' },
        it5: { x: SLOT_X(0) }, it0: { x: SLOT_X(1) }, it2: { x: SLOT_X(2) }, it3: { x: SLOT_X(3) }, it4: { x: SLOT_X(4) },
        state: { text: 'deque([5, 0, 2, 3, 4], maxlen=5)' } } },
    { title: 'rotate(-2): the first two wrap to the back', caption: 'Negative n goes the other way. This is how you implement a circular schedule, a round-robin, or "move item i to the front" in constant memory.', lines: [4],
      patch: { 'it5.r': { cls: 'cell' }, 'it0.r': { cls: 'cell hot' }, 'it2.r': { cls: 'cell hot' },
        it2: { x: SLOT_X(0) }, it3: { x: SLOT_X(1) }, it4: { x: SLOT_X(2) }, it5: { x: SLOT_X(3) }, it0: { x: SLOT_X(4) },
        state: { text: 'deque([2, 3, 4, 5, 0], maxlen=5)' } } },
    { title: 'Both ends are O(1); the middle is not', caption: 'popleft() and pop() only touch the end blocks. Indexing d[i] near the middle walks the ring, so a deque is a queue or a window, not a random-access list.', lines: [5],
      patch: { 'it0.r': { cls: 'cell ok' }, 'it2.r': { cls: 'cell ok' }, 'it3.r': { cls: 'cell' }, 'it4.r': { cls: 'cell' }, 'it5.r': { cls: 'cell' },
        drop: { text: 'popleft() → 2      pop() → 0      d[2] walks from an end' } } },
  ],
};

const missingExplainer = {
  hold: 3000,
  code: ['by_region = defaultdict(list)', 'by_region["North"].append(order)', '# __getitem__ misses → __missing__("North")', '#   → default_factory() → []  stored under the key', 'by_region["North"]   # second time: a plain hit'],
  build() {
    const s = scene(760, 300);
    s.cell('call', 20, 40, 190, 38, 'by_region["North"]');
    s.cell('get', 260, 40, 170, 38, 'dict.__getitem__');
    s.cell('hit', 480, 40, 120, 38, 'hit → value', 'cell hid');
    s.cell('miss', 260, 120, 170, 38, '__missing__(key)', 'cell hid');
    s.cell('fact', 480, 120, 170, 38, 'default_factory()', 'cell hid');
    s.cell('val', 480, 200, 170, 38, '[]  (new list)', 'cell hid');
    s.cell('store', 260, 200, 170, 38, 'self[key] = value', 'cell hid');
    s.arrow('a1', 212, 59, 256, 59);
    s.arrow('a2', 432, 59, 476, 59, 'arrow hid');
    s.arrow('a3', 345, 80, 345, 116, 'arrow hid');
    s.arrow('a4', 432, 139, 476, 139, 'arrow hid');
    s.arrow('a5', 565, 160, 565, 196, 'arrow hid');
    s.arrow('a6', 476, 219, 432, 219, 'arrow hid');
    s.arrow('a7', 345, 196, 345, 160, 'arrow hid');
    s.arrow('a8', 256, 219, 115, 219, 'arrow hid');
    s.text('ret', 115, 245, '', 'lbl sm ink-2');
    s.text('note', 380, 275, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'A lookup on a defaultdict', caption: 'defaultdict is a dict subclass. Subscripting calls the ordinary dict.__getitem__ first, exactly as it would on a plain dict.', lines: [0, 1],
      patch: { 'call.r': { cls: 'cell hot' }, a1: { cls: 'arrow hot' }, 'get.r': { cls: 'cell hot' } } },
    { title: 'The key is not there', caption: 'A plain dict would raise KeyError here. Instead, dict.__getitem__ checks whether the class defines __missing__ and calls it with the key. defaultdict does; plain dict does not.', lines: [2],
      patch: { a3: { cls: 'arrow hot' }, miss: { cls: '' }, 'miss.r': { cls: 'cell hot' } } },
    { title: '__missing__ calls the factory', caption: 'default_factory is called with no arguments. list() gives an empty list; int() gives 0; any zero-argument callable works, including a lambda. If default_factory is None, __missing__ raises KeyError.', lines: [3],
      patch: { a4: { cls: 'arrow hot' }, fact: { cls: '' }, 'fact.r': { cls: 'cell hot' }, a5: { cls: 'arrow hot' }, val: { cls: '' }, 'val.r': { cls: 'cell ok' } } },
    { title: 'Stored, then returned', caption: 'The fresh value is inserted under the key and then returned to the caller. That insertion is the important side effect: the key now exists, and .append(order) mutates the stored list.', lines: [3],
      patch: { a6: { cls: 'arrow ok' }, store: { cls: '' }, 'store.r': { cls: 'cell ok' }, a7: { cls: 'arrow ok' }, a8: { cls: 'arrow ok' }, ret: { text: 'returns the stored list' }, note: { text: 'by_region == {"North": []}  before .append runs' } } },
    { title: 'Next time it is a plain hit', caption: 'The second by_region["North"] finds the key, so __missing__ never runs. Only subscripting triggers it: .get() and "in" do not, which is why testing membership with d[k] silently creates keys.', lines: [4],
      patch: { 'miss.r': { cls: 'cell' }, 'fact.r': { cls: 'cell' }, 'store.r': { cls: 'cell' }, 'val.r': { cls: 'cell' }, miss: { cls: 'dim' }, fact: { cls: 'dim' }, val: { cls: 'dim' }, store: { cls: 'dim' },
        a3: { cls: 'arrow ghost' }, a4: { cls: 'arrow ghost' }, a5: { cls: 'arrow ghost' }, a6: { cls: 'arrow ghost' }, a7: { cls: 'arrow ghost' }, a8: { cls: 'arrow ghost' },
        hit: { cls: '' }, 'hit.r': { cls: 'cell ok' }, a2: { cls: 'arrow ok' }, ret: { text: '' }, note: { text: 'd.get("West") → None, and no key is created' } } },
  ],
};

export default {
  id: 'collections', name: 'collections', glyph: 'col', group: 'essentials', version: '3.12', keywords: 'Counter defaultdict deque namedtuple OrderedDict ChainMap UserDict counting queue',
  tagline: 'Specialised containers: counting, grouping, queues, named records.',
  install: 'standard library', docs: 'https://docs.python.org/3/library/collections.html', packages: [], runnable: true,
  overview: {
    what: 'collections is the standard library\'s box of purpose-built containers. Counter counts hashable things, defaultdict fills in missing keys, deque is a double-ended queue with O(1) ends and an optional fixed length, namedtuple gives tuples field names, and ChainMap layers several mappings into one view. Each replaces a small pattern you would otherwise write by hand, and usually replaces it faster and with fewer bugs.',
    yes: ['Tallying or ranking values: word counts, status counts, top-N.', 'Grouping records by key without checking whether the key exists yet.', 'A queue, a sliding window, or "keep the last N" with constant-time ends.', 'Small immutable records where a tuple is too anonymous and a class too heavy.'],
    no: ['Records that need validation, defaults per field or mutation (dataclasses, attrs, pydantic).', 'Priority queues (heapq) or sorted containers (sortedcontainers).', 'Numeric arrays or tables (numpy, pandas).', 'Thread-safe producer/consumer queues (queue.Queue); deque is thread-safe for append/pop only.'],
  },
  cheatsheet: [
    { id: 'counter', title: 'Counter', blurb: 'A dict subclass whose values are counts. Missing keys read as 0.', snippets: [
      { title: 'Count and rank', code: `import csv
from collections import Counter

with open("/data/orders.csv") as f:
    orders = list(csv.DictReader(f))

by_region = Counter(o["region"] for o in orders)
print(by_region)
print(by_region.most_common(2))        # top 2 as (key, count)
print(by_region["Antarctica"])         # missing → 0, no KeyError
print(by_region.total())               # 3.10+

# weighted count: units sold per product
units = Counter()
for o in orders:
    units[o["product_id"]] += int(o["quantity"])
print(units.most_common(3))`, note: '<code>most_common()</code> with no argument returns every entry, highest first. Ties keep first-seen order.' },
      { title: 'Counter arithmetic', code: `from collections import Counter

stock = Counter(apple=5, pear=2, fig=1)
sold = Counter(apple=3, fig=4)

print(stock + sold)      # add counts
print(stock - sold)      # subtract, dropping ≤0 results
print(stock & sold)      # min of each (intersection)
print(stock | sold)      # max of each (union)

stock.subtract(sold)     # in place, keeps negatives
print(stock)
print(+stock)            # unary + drops non-positive counts
print(sorted(Counter("mississippi").elements()))`, note: 'Binary operators drop zero and negative counts; <code>subtract()</code> and <code>update()</code> keep them. Use <code>+c</code> to clean up.' },
    ] },
    { id: 'defaultdict', title: 'defaultdict', blurb: 'A dict that builds a value for a missing key on first access.', snippets: [
      { title: 'Group records by key', code: `import csv
from collections import defaultdict

with open("/data/orders.csv") as f:
    orders = list(csv.DictReader(f))

by_region = defaultdict(list)
for o in orders:
    by_region[o["region"]].append(o["order_id"])

for region, ids in sorted(by_region.items()):
    print(region, len(ids), ids[:3])

# convert to a plain dict before handing it on
print(type(dict(by_region)))`, note: 'Any zero-argument callable is a valid factory: <code>list</code>, <code>int</code>, <code>set</code>, <code>lambda: "n/a"</code>.' },
      { title: 'Nested counts with set and int', code: `import csv
from collections import defaultdict

with open("/data/orders.csv") as f:
    orders = list(csv.DictReader(f))

# region -> set of reps who sold there
reps = defaultdict(set)
# (region, status) -> number of orders
tally = defaultdict(int)
# region -> status -> count (two levels deep)
nested = defaultdict(lambda: defaultdict(int))

for o in orders:
    reps[o["region"]].add(o["rep"])
    tally[o["region"], o["status"]] += 1
    nested[o["region"]][o["status"]] += 1

print(sorted(reps["North"]))
print(tally["West", "cancelled"])
print({k: dict(v) for k, v in nested.items()})` },
    ] },
    { id: 'deque', title: 'deque', blurb: 'Double-ended queue: O(1) append and pop at both ends, optional maxlen.', snippets: [
      { title: 'Queue, stack and rotation', code: `from collections import deque

q = deque(["a", "b", "c"])
q.append("d")          # right end
q.appendleft("z")      # left end
print(q)
print(q.popleft(), q.pop())   # FIFO from the left, LIFO from the right
print(q)

q.rotate(1)            # last item to the front
print(q)
q.rotate(-1)           # and back
q.extendleft([1, 2])   # note: reversed order on the left
print(q)`, note: '<code>list.pop(0)</code> is O(n) because every element shifts. <code>deque.popleft()</code> is O(1).' },
      { title: 'Sliding window and "keep the last N"', code: `import csv
from collections import deque
from statistics import mean

with open("/data/orders.csv") as f:
    qty = [int(o["quantity"]) for o in csv.DictReader(f)]

window = deque(maxlen=5)
smoothed = []
for q in qty:
    window.append(q)             # 6th append silently drops the oldest
    smoothed.append(round(mean(window), 2))
print(smoothed[:8])

# tail: the last 3 lines of a file, without reading it into a list
with open("/data/orders.csv") as f:
    print([line.rstrip() for line in deque(f, maxlen=3)])`, note: 'A full <code>maxlen</code> deque evicts from the opposite end on every append: a ring buffer in one line.' },
      { title: 'Breadth-first search', code: `from collections import deque

graph = {"a": ["b", "c"], "b": ["d"], "c": ["d", "e"], "d": ["f"], "e": ["f"], "f": []}

def bfs(start):
    seen, order = {start}, []
    todo = deque([start])
    while todo:
        node = todo.popleft()          # FIFO gives level-by-level order
        order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                todo.append(nxt)
    return order

print(bfs("a"))` },
    ] },
    { id: 'namedtuple', title: 'namedtuple', blurb: 'A tuple subclass with named, read-only fields and a helpful repr.', snippets: [
      { title: 'Define, build, replace', code: `from collections import namedtuple

Point = namedtuple("Point", ["x", "y", "z"], defaults=[0])   # defaults apply from the right
p = Point(1, 2)
print(p, p.x, p[1], p._fields)

q = p._replace(z=9)          # tuples are immutable → new object
print(q, p == (1, 2, 0))     # still a tuple: compares by value
print(q._asdict())

x, y, z = q                  # unpacks like any tuple
print(Point._make([7, 8, 9]))   # from any iterable
print(Point(*[1, 2, 3]), Point(**{"x": 1, "y": 2, "z": 3}))`, note: 'For type hints and methods, subclass <code>typing.NamedTuple</code> instead; it produces the same kind of class.' },
      { title: 'Typed rows from a CSV', code: `import csv
from collections import namedtuple

with open("/data/employees.csv") as f:
    reader = csv.reader(f)
    Employee = namedtuple("Employee", next(reader))   # header row → field names
    staff = [Employee(*row) for row in reader]

print(staff[0])
print(staff[0].name, staff[0].city)
top = max(staff, key=lambda e: int(e.salary))
print(top.name, top.salary)

# rename=True replaces invalid names (keywords, duplicates) with _0, _1, …
Row = namedtuple("Row", ["id", "class", "id"], rename=True)
print(Row._fields)` },
    ] },
    { id: 'chainmap', title: 'ChainMap', blurb: 'One view over several dicts; lookups go front to back, writes hit the first.', snippets: [
      { title: 'Layered configuration', code: `from collections import ChainMap

defaults = {"host": "localhost", "port": 8000, "debug": False}
env = {"port": 9000}
cli = {"debug": True}

cfg = ChainMap(cli, env, defaults)     # first match wins
print(cfg["host"], cfg["port"], cfg["debug"])
print(dict(cfg))                       # flattened view

cfg["port"] = 1234                     # writes go to the first map (cli)
print(cli, env["port"])

child = cfg.new_child({"host": "0.0.0.0"})   # push a scope
print(child["host"], child.parents["host"])
print(cfg.maps[-1] is defaults)`, note: 'ChainMap is a live view: change <code>defaults</code> later and <code>cfg</code> sees it. <code>{**defaults, **env, **cli}</code> is a one-time snapshot with the same precedence.' },
    ] },
    { id: 'ordered', title: 'OrderedDict and the User* bases', blurb: 'Plain dicts keep insertion order since 3.7; OrderedDict adds reordering. UserDict makes subclassing safe.', snippets: [
      { title: 'LRU cache with move_to_end', code: `from collections import OrderedDict

class LRU:
    def __init__(self, capacity):
        self.capacity, self.data = capacity, OrderedDict()

    def get(self, key):
        if key not in self.data:
            return None
        self.data.move_to_end(key)           # most recently used → last
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)    # evict the oldest (first)

c = LRU(2)
c.put("a", 1); c.put("b", 2); c.get("a"); c.put("c", 3)
print(list(c.data))                          # "b" was evicted`, note: 'For a function cache, <code>functools.lru_cache</code> already does this. Write your own only when you need <code>get</code>/<code>put</code> as data.' },
      { title: 'Subclass UserDict, not dict', code: `from collections import UserDict

class LowerDict(UserDict):
    """Keys are case-insensitive."""
    def __setitem__(self, key, value):
        super().__setitem__(key.lower(), value)
    def __getitem__(self, key):
        return super().__getitem__(key.lower())
    def __contains__(self, key):
        return key.lower() in self.data

h = LowerDict({"Content-Type": "text/html"})   # goes through __setitem__
h.update(Accept="*/*")                          # so does update()
print(h["CONTENT-TYPE"], "accept" in h)
print(h.data)                                   # the real dict underneath`, note: 'On a real <code>dict</code> subclass, <code>__init__</code>, <code>update</code> and <code>setdefault</code> bypass your <code>__setitem__</code>. <code>UserDict</code> routes everything through the methods you override.' },
    ] },
  ],
  concepts: [
    { id: 'deque', title: 'How a bounded deque rotates', intro: 'A deque is a doubly linked ring of fixed-size blocks. That structure is why both ends are cheap, why <code>maxlen</code> evictions cost nothing, and why <code>rotate</code> moves items without copying them.', explainer: dequeExplainer },
    { id: 'missing', title: 'What defaultdict does on a miss', intro: 'The whole trick is one hook: <code>dict.__getitem__</code> calls <code>__missing__</code> when a key is absent. Seeing where the factory runs explains why reading a key creates it, and why <code>.get()</code> does not.', explainer: missingExplainer },
  ],
  compare: [
    { title: 'Small records: namedtuple, dataclass, dict', columns: ['namedtuple', 'typing.NamedTuple', '@dataclass', 'dict'], rows: [
      ['Field access', 'attribute + index', 'attribute + index', 'attribute', 'd["key"]'],
      ['Immutable', true, true, { part: 'frozen=True' }, false],
      ['Type hints', false, true, true, { part: 'TypedDict' }],
      ['Default values', { part: 'defaults=' }, true, true, { part: 'n/a' }],
      ['Methods and properties', { part: 'subclass' }, true, true, false],
      ['Hashable by default', true, true, false, false],
      ['Memory per instance', { dots: 5 }, { dots: 5 }, { dots: 3 }, { dots: 2 }],
      ['Unpacks like a tuple', true, true, false, false],
    ], note: 'Memory dots are a judgement: tuples store fields in one block; a dataclass needs <code>slots=True</code> to get close.', verdict: 'Reach for <code>typing.NamedTuple</code> when the record is a value that should unpack and compare like a tuple; <code>@dataclass</code> when it will grow methods or need mutation; a <code>dict</code> only for data that is genuinely dynamic.' },
    { title: 'Ways to count', columns: ['Counter', 'defaultdict(int)', 'dict.get(k, 0)', 'dict.setdefault'], rows: [
      ['Missing key reads as', '0', '0 (and is inserted)', 'default you pass', 'default you pass'],
      ['most_common / ranking', true, false, false, false],
      ['Arithmetic between tallies', true, false, false, false],
      ['Result is a plain dict', false, false, true, true],
      ['Lines of code to tally', { dots: 5 }, { dots: 4 }, { dots: 3 }, { dots: 3 }],
    ], verdict: '<code>Counter</code> for anything you will rank or combine; <code>defaultdict(int)</code> when the counts are a by-product inside a bigger loop and you will convert to <code>dict</code> at the end.' },
  ],
  gotchas: [
    { title: 'Reading a defaultdict key creates it', bad: `d = defaultdict(list)
if d["x"]:            # inserts "x": [] as a side effect
    ...
print(len(d))         # 1`, good: `if "x" in d and d["x"]:
    ...
# or read without inserting:
d.get("x")`, why: 'Only subscripting triggers <code>__missing__</code>; <code>in</code> and <code>.get()</code> do not. This bites hardest when you serialise the dict later and find phantom empty entries.' },
    { title: 'Counter arithmetic drops zeros and negatives', bad: `c = Counter(a=2)
c = c - Counter(a=2, b=1)
print(c["a"], "a" in c)   # 0 False: "a" is gone
print(c["b"])             # 0, the -1 was discarded`, good: `c = Counter(a=2)
c.subtract(Counter(a=2, b=1))
print(c)                  # Counter({'a': 0, 'b': -1})`, why: 'The binary operators (<code>+ - &amp; |</code>) return only positive counts by design. <code>subtract()</code> and <code>update()</code> mutate in place and keep every value, including negatives.' },
    { title: 'deque is not a list: no slicing, slow middle access', bad: `d = deque(range(100_000))
first_ten = d[:10]     # TypeError: sequence index must be integer
middle = d[50_000]     # works, but O(n)`, good: `from itertools import islice
first_ten = list(islice(d, 10))
# need random access? use a list
xs = list(d)`, why: 'A deque is a linked ring of blocks. Indexing walks from the nearest end, and slices are not supported at all. Use it for ends and windows; convert when you need positions.' },
    { title: 'Subclassing dict skips your __setitem__', bad: `class Lower(dict):
    def __setitem__(self, k, v):
        super().__setitem__(k.lower(), v)

h = Lower({"KEY": 1})      # bypasses __setitem__
h.update(OTHER=2)          # so does update()
print(h)                   # {'KEY': 1, 'OTHER': 2}`, good: `from collections import UserDict

class Lower(UserDict):
    def __setitem__(self, k, v):
        super().__setitem__(k.lower(), v)

print(Lower({"KEY": 1}))   # {'key': 1}`, why: 'The C implementation of <code>dict</code> calls its own internals from <code>__init__</code>, <code>update</code> and <code>setdefault</code>, never your Python override. <code>UserDict</code> wraps a real dict and routes every write through <code>__setitem__</code>.' },
  ],
  presets: [
    { title: 'Orders by region and rep', code: `import csv
from collections import Counter, defaultdict, namedtuple

with open("/data/orders.csv") as f:
    reader = csv.reader(f)
    Order = namedtuple("Order", next(reader))
    orders = [Order(*row) for row in reader]

regions = Counter(o.region for o in orders)
revenue = defaultdict(float)
for o in orders:
    if o.status == "shipped":
        revenue[o.rep] += int(o.quantity) * float(o.unit_price) * (1 - float(o.discount))

print(regions.most_common())
for rep, total in sorted(revenue.items(), key=lambda kv: -kv[1])[:3]:
    print(f"{rep:<6} {total:>10,.2f}")` },
  ],
};
