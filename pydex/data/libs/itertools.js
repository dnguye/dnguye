import { scene } from '../../js/explainer.js';

// groupby walks the input once and only compares each key with the previous one.
const IT_X = i => 20 + i * 76;
const groupbyExplainer = {
  hold: 3000,
  code: ['for key, run in groupby(orders, key=region):', '    print(key, list(run))', '# groupby never sorts: it compares each key', '# with the previous one, so a key that comes', '# back later starts a new run', 'sorted(orders, key=region)   # do this first'],
  build() {
    const s = scene(760, 330);
    const keys = ['North', 'North', 'South', 'South', 'North', 'East', 'East'];
    s.text('t-in', 20, 22, 'input, in file order', 'lbl bold', undefined, 'start');
    keys.forEach((k, i) => { s.cell(`it${i}`, IT_X(i), 36, 68, 30, k); s.text(`id${i}`, IT_X(i) + 34, 80, `#${i + 1}`, 'lbl sm ink-2'); });
    s.text('t-out', 20, 108, 'yielded (key, run) pairs', 'lbl bold', undefined, 'start');
    [['North', 20], ['South', 200], ['North', 380], ['East', 560]].forEach(([k, x], i) => s.cell(`g${i}`, x, 122, 170, 30, k, 'cell hid'));
    s.text('t-sorted', 20, 200, 'after sorted(orders, key=region)', 'lbl bold hid', undefined, 'start');
    ['North', 'North', 'North', 'South', 'South', 'East', 'East'].forEach((k, i) => s.cell(`st${i}`, IT_X(i), 214, 68, 30, k, 'cell hid'));
    [['North: [#1, #2, #5]', 20], ['South: [#3, #4]', 200], ['East: [#6, #7]', 380]].forEach(([k, x], i) => s.cell(`sg${i}`, x, 268, 170, 30, k, 'cell ok hid'));
    s.text('note', 580, 240, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'Seven orders, key = region', caption: 'groupby takes any iterable and a key function. It reads the input once, lazily, and never sorts or buffers it. The question it asks at each item is only: is this key equal to the previous one?', lines: [0] },
    { title: 'The first item opens a run', caption: 'Item #1 has key "North". groupby yields the pair ("North", run) immediately. The run is a sub-iterator that will keep handing out items for as long as their key stays "North".', lines: [0, 1],
      patch: { 'it0.r': { cls: 'cell hot' }, g0: { cls: '' }, 'g0.r': { cls: 'cell hot' }, 'g0.t': { text: 'North: [#1]' } } },
    { title: 'Same key, same run', caption: 'Item #2 is also "North", so it belongs to the current run. groupby peeks one item ahead: when the run is exhausted it has already read the item that ended it.', lines: [1],
      patch: { 'it0.r': { cls: 'cell ok' }, 'it1.r': { cls: 'cell hot' }, 'g0.t': { text: 'North: [#1, #2]' } } },
    { title: 'The key changes: a new run starts', caption: 'Item #3 is "South". The North run ends, and a fresh ("South", run) pair is yielded. Items #3 and #4 go into it.', lines: [1],
      patch: { 'it1.r': { cls: 'cell ok' }, 'g0.r': { cls: 'cell ok' }, 'it2.r': { cls: 'cell hot' }, 'it3.r': { cls: 'cell hot' }, g1: { cls: '' }, 'g1.r': { cls: 'cell hot' }, 'g1.t': { text: 'South: [#3, #4]' } } },
    { title: 'North again: a second North run', caption: 'Item #5 is "North" but the previous key was "South", so groupby starts another run. Unsorted input gives you one run per change of key, not one group per distinct key. This is the surprise.', lines: [2, 3, 4],
      patch: { 'it2.r': { cls: 'cell ok' }, 'it3.r': { cls: 'cell ok' }, 'g1.r': { cls: 'cell ok' }, 'it4.r': { cls: 'cell err' }, g2: { cls: '' }, 'g2.r': { cls: 'cell err' }, 'g2.t': { text: 'North: [#5]  ← again' },
        'it5.r': { cls: 'cell ok' }, 'it6.r': { cls: 'cell ok' }, g3: { cls: '' }, 'g3.r': { cls: 'cell ok' }, 'g3.t': { text: 'East: [#6, #7]' } } },
    { title: 'Sort on the same key first', caption: 'sorted() with the same key function puts equal keys next to each other, so each key forms exactly one run. Python\'s sort is stable, so within a run the original order (#1, #2, #5) is preserved.', lines: [5],
      patch: { 't-sorted': { cls: 'lbl bold' }, st0: { cls: '' }, st1: { cls: '' }, st2: { cls: '' }, st3: { cls: '' }, st4: { cls: '' }, st5: { cls: '' }, st6: { cls: '' },
        sg0: { cls: '' }, sg1: { cls: '' }, sg2: { cls: '' }, note: { text: '3 runs = 3 distinct keys' },
        it0: { cls: 'dim' }, it1: { cls: 'dim' }, it2: { cls: 'dim' }, it3: { cls: 'dim' }, it4: { cls: 'dim' }, it5: { cls: 'dim' }, it6: { cls: 'dim' }, g0: { cls: 'dim' }, g1: { cls: 'dim' }, g2: { cls: 'dim' }, g3: { cls: 'dim' } } },
  ],
};

// A lazy pipeline: nothing runs until something pulls, and each pull travels the whole chain.
const lazyExplainer = {
  hold: 3000,
  code: ['pipe = islice(map(f, chain(a, b)), 3)', '# nothing has run yet', 'next(pipe)      # one pull travels the chain', 'list(pipe)      # 2 more, then islice stops', '# b was never touched; f ran 3 times'],
  build() {
    const s = scene(760, 300);
    s.cell('cons', 20, 60, 110, 38, 'next()');
    s.cell('isl', 170, 60, 130, 38, 'islice(…, 3)');
    s.cell('map', 340, 60, 110, 38, 'map(f, …)');
    s.cell('chn', 490, 60, 110, 38, 'chain(a, b)');
    s.cell('a', 640, 30, 100, 38, 'a = [1, 2, 3]');
    s.cell('b', 640, 100, 100, 38, 'b = [4, 5]', 'cell ghost');
    // pull arrows (right-going requests)
    s.arrow('p1', 132, 72, 166, 72, 'arrow hid'); s.arrow('p2', 302, 72, 336, 72, 'arrow hid');
    s.arrow('p3', 452, 72, 486, 72, 'arrow hid'); s.arrow('p4', 602, 66, 636, 52, 'arrow hid');
    // value arrows (left-going results)
    s.arrow('v4', 636, 62, 602, 82, 'arrow hid'); s.arrow('v3', 486, 88, 452, 88, 'arrow hid');
    s.arrow('v2', 336, 88, 302, 88, 'arrow hid'); s.arrow('v1', 166, 88, 132, 88, 'arrow hid');
    s.arrow('pb', 602, 84, 636, 118, 'arrow ghost hid');
    s.text('l-cons', 75, 130, '', 'lbl sm ink-2');
    s.text('l-isl', 235, 130, '', 'lbl sm ink-2');
    s.text('l-map', 395, 130, '', 'lbl sm ink-2');
    s.text('l-chn', 545, 130, '', 'lbl sm ink-2');
    s.text('l-b', 690, 160, '', 'lbl sm ink-2');
    s.text('t-pull', 380, 24, '', 'lbl sm ink-2');
    s.text('out', 20, 200, 'output: []', 'lbl bold', undefined, 'start');
    s.text('calls', 20, 230, 'f called: 0 times', 'lbl sm ink-2', undefined, 'start');
    s.text('state', 20, 260, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Building the pipeline runs nothing', caption: 'chain, map and islice each return an iterator object that remembers its inputs. No element of a has been read, f has not been called. This costs O(1) memory however long a and b are.', lines: [0, 1],
      patch: { state: { text: 'three iterator objects exist; a and b are untouched' } } },
    { title: 'One next() is one pull through every stage', caption: 'next(pipe) asks islice for an item. islice has no items of its own, so it asks map, which asks chain, which asks a. Each stage forwards the request; none of them has a buffer.', lines: [2],
      patch: { 'cons.r': { cls: 'cell hot' }, p1: { cls: 'arrow hot' }, 'isl.r': { cls: 'cell hot' }, p2: { cls: 'arrow hot' }, 'map.r': { cls: 'cell hot' }, p3: { cls: 'arrow hot' }, 'chn.r': { cls: 'cell hot' }, p4: { cls: 'arrow hot' }, 'a.r': { cls: 'cell hot' },
        't-pull': { text: 'pull →' }, 'l-isl': { text: 'taken: 0 of 3' }, 'l-chn': { text: 'on a' }, state: { text: '' } } },
    { title: 'The value flows back, transformed on the way', caption: 'a yields 1. chain passes it through unchanged, map applies f to it (the first and only call so far), islice counts it as 1 of 3, and next() returns f(1). One item, one call of f.', lines: [2],
      patch: { v4: { cls: 'arrow ok flow' }, v3: { cls: 'arrow ok flow' }, v2: { cls: 'arrow ok flow' }, v1: { cls: 'arrow ok flow' },
        'map.r': { cls: 'cell ok' }, 'l-map': { text: 'f(1)' }, 'l-isl': { text: 'taken: 1 of 3' }, out: { text: 'output: [f(1)]' }, calls: { text: 'f called: 1 time' } } },
    { title: 'list() keeps pulling until islice says stop', caption: 'The second and third pulls repeat the same route and return f(2), f(3). On the fourth, islice has reached its limit and raises StopIteration itself, without asking map or chain for anything.', lines: [3],
      patch: { 'l-isl': { text: 'taken: 3 of 3 → StopIteration' }, 'l-map': { text: 'f(1), f(2), f(3)' }, out: { text: 'output: [f(1), f(2), f(3)]' }, calls: { text: 'f called: 3 times' },
        'isl.r': { cls: 'cell ok' }, 'cons.r': { cls: 'cell ok' }, p2: { cls: 'arrow ghost' }, p3: { cls: 'arrow ghost' }, p4: { cls: 'arrow ghost' }, v4: { cls: 'arrow ghost' }, v3: { cls: 'arrow ghost' }, v2: { cls: 'arrow ghost' } } },
    { title: 'b was never touched, and the pipe is spent', caption: 'chain would have moved on to b only after a ran out; it never got there. Also: the iterator is now exhausted, so a second list(pipe) returns []. Rebuild the pipeline (or use tee) if you need the items again.', lines: [4],
      patch: { pb: { cls: 'arrow ghost' }, 'b.r': { cls: 'cell ghost' }, 'l-b': { text: 'never iterated' }, 'l-chn': { text: 'still on a' }, 'chn.r': { cls: 'cell' }, 'a.r': { cls: 'cell' }, 't-pull': { text: '' },
        state: { text: 'list(pipe) again → []   (exhausted, not re-run)' } } },
  ],
};

export default {
  id: 'itertools', name: 'itertools', glyph: 'it', group: 'essentials', version: '3.12', keywords: 'iterator lazy chain islice groupby product permutations combinations accumulate batched pairwise tee',
  tagline: 'Lazy building blocks for loops: chain, slice, group, combine.',
  install: 'standard library', docs: 'https://docs.python.org/3/library/itertools.html', packages: [], runnable: true,
  overview: {
    what: 'itertools is a set of fast, memory-light iterator functions written in C. Each one takes iterables and returns a lazy iterator, so they compose into pipelines that process one item at a time: chain sequences, slice them, group consecutive runs, walk a sliding window, or enumerate combinations without building any intermediate list. The docs\' recipes section (and the more-itertools package) build the rest from these.',
    yes: ['Loops that would otherwise need index bookkeeping: pairs, windows, chunks.', 'Working through data too large or too slow to materialise as a list.', 'Cartesian products, permutations and combinations without nested loops.', 'Running totals, run-length grouping, round-robin merging.'],
    no: ['Tabular aggregation with many columns (pandas or polars are clearer).', 'You need to look at an item twice or index into results: make a list first.', 'Parallel processing (concurrent.futures, multiprocessing).', 'Grouping by key on unsorted data: use a dict or defaultdict.'],
  },
  cheatsheet: [
    { id: 'infinite', title: 'Infinite iterators', blurb: 'count, cycle and repeat never stop on their own. Pair them with islice, zip or a break.', snippets: [
      { title: 'count, cycle, repeat', code: `from itertools import count, cycle, repeat, islice

# ids that never run out
ids = count(start=1000, step=1)
print(next(ids), next(ids), next(ids))

# label rows round-robin
labels = cycle(["odd", "even"])
print(list(zip(range(5), labels)))     # zip stops at the finite side

# a constant stream, or a fixed number of them
print(list(repeat("x", 3)))
print(list(map(pow, range(5), repeat(2))))   # repeat as the 2nd argument

# float steps are fine too
print(list(islice(count(0.5, 0.25), 4)))`, note: '<code>list(count())</code> never returns. Always cap an infinite iterator with <code>islice</code>, <code>zip</code>, <code>takewhile</code> or <code>break</code>.' },
    ] },
    { id: 'slice', title: 'Slice, chain, window', blurb: 'The iterator equivalents of list slicing and concatenation.', snippets: [
      { title: 'chain and islice', code: `from itertools import chain, islice

a, b = [1, 2, 3], (x * 10 for x in range(3))
print(list(chain(a, b)))                       # one stream, no copy
print(list(chain.from_iterable([[1, 2], [3], []])))   # flatten one level

# islice(iterable, stop) / (start, stop[, step]) — no negative indices
letters = iter("abcdefgh")
print(list(islice(letters, 3)))       # first 3
print(list(islice(letters, 1, None, 2)))   # then every other one of the rest

# skip a header line without reading the whole file
with open("/data/orders.csv") as f:
    for line in islice(f, 1, 4):
        print(line.rstrip())` },
      { title: 'pairwise and batched', code: `from itertools import pairwise, batched   # 3.10 / 3.12

temps = [20, 22, 21, 25, 24]
print(list(pairwise(temps)))                       # overlapping pairs
print([b - a for a, b in pairwise(temps)])         # deltas

ids = range(1, 11)
print(list(batched(ids, 4)))    # tuples of 4; the last one is shorter

# batched is how you page work in fixed-size groups
for chunk in batched(["a", "b", "c", "d", "e"], 2):
    print("insert", chunk)`, note: 'Before 3.12, <code>batched</code> is the recipe <code>iter(lambda: tuple(islice(it, n)), ())</code>.' },
    ] },
    { id: 'group', title: 'groupby', blurb: 'Consecutive runs of equal keys. Sort first if you want one group per key.', snippets: [
      { title: 'Group sorted orders by region', code: `import csv
from itertools import groupby
from operator import itemgetter

with open("/data/orders.csv") as f:
    orders = list(csv.DictReader(f))

key = itemgetter("region")
for region, run in groupby(sorted(orders, key=key), key=key):
    run = list(run)                    # materialise before the next iteration
    units = sum(int(o["quantity"]) for o in run)
    print(f"{region:<6} orders={len(run):<3} units={units}")`, note: 'Each <code>run</code> is a view over the same underlying iterator; convert it to a list before advancing to the next group.' },
      { title: 'Run-length encoding and the unsorted surprise', code: `from itertools import groupby

# runs of equal characters
s = "aaabccdddd"
print([(ch, len(list(run))) for ch, run in groupby(s)])

# unsorted input → one run per change of key, not per distinct key
regions = ["N", "N", "S", "N", "S", "S"]
print([(k, len(list(g))) for k, g in groupby(regions)])
print([(k, len(list(g))) for k, g in groupby(sorted(regions))])

# key function: group by first letter
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
print({k: list(g) for k, g in groupby(words, key=lambda w: w[0])})` },
    ] },
    { id: 'filter', title: 'Filter and cut', blurb: 'Predicates that stop, skip, invert or mask.', snippets: [
      { title: 'takewhile, dropwhile, filterfalse, compress', code: `from itertools import takewhile, dropwhile, filterfalse, compress

prices = [5, 8, 12, 3, 20, 1]
print(list(takewhile(lambda p: p < 10, prices)))   # stops at the first 12
print(list(dropwhile(lambda p: p < 10, prices)))   # starts at the first 12
print(list(filterfalse(lambda p: p < 10, prices))) # complement of filter()

names = ["Ann", "Bo", "Cy", "Di"]
mask = [1, 0, 1, 0]
print(list(compress(names, mask)))                 # keep where mask is truthy

# a log tail: skip until the marker, then read to the next blank line
lines = ["boot", "---", "err 1", "err 2", "", "later"]
body = takewhile(bool, dropwhile(lambda l: l != "---", lines))
print(list(body)[1:])`, note: '<code>takewhile</code>/<code>dropwhile</code> test until the predicate first flips, then stop testing. They are not filters over the whole sequence.' },
    ] },
    { id: 'running', title: 'Running totals and zips', snippets: [
      { title: 'accumulate', code: `import csv
import operator
from itertools import accumulate

with open("/data/orders.csv") as f:
    qty = [int(o["quantity"]) for o in csv.DictReader(f)]

print(list(accumulate(qty[:6])))                       # running sum
print(list(accumulate(qty[:6], max)))                  # running max
print(list(accumulate([1, 2, 3, 4], operator.mul)))    # factorials
print(list(accumulate([10, 20], initial=100)))         # seed with a start value

# a balance that must not go negative
txns = [50, -30, -40, 60]
print(list(accumulate(txns, lambda bal, t: max(0, bal + t), initial=0)))` },
      { title: 'starmap and zip_longest', code: `from itertools import starmap, zip_longest

pairs = [(2, 3), (4, 2), (10, 1)]
print(list(starmap(pow, pairs)))          # pow(*pair) for each
print(list(map(pow, [2, 4, 10], [3, 2, 1])))   # same thing when you have columns

a, b = [1, 2, 3], ["x"]
print(list(zip(a, b)))                    # stops at the shortest
print(list(zip_longest(a, b, fillvalue="-")))

# transpose ragged rows into padded columns
rows = [[1, 2, 3], [4, 5], [6]]
print(list(zip_longest(*rows, fillvalue=0)))` },
    ] },
    { id: 'combinatoric', title: 'Combinatorics', blurb: 'Products, orderings and subsets, produced lazily in lexicographic order.', snippets: [
      { title: 'product, permutations, combinations', code: `from itertools import product, permutations, combinations, combinations_with_replacement

print(list(product("ab", [1, 2])))          # every pair, like nested loops
print(list(product([0, 1], repeat=3))[:4])  # bit patterns

print(list(permutations("abc", 2)))         # order matters, no repeats
print(list(combinations("abc", 2)))         # order ignored, no repeats
print(list(combinations_with_replacement("abc", 2)))

# grid search without four nested loops
grid = {"lr": [0.1, 0.01], "depth": [2, 4], "l2": [0, 0.5]}
for combo in product(*grid.values()):
    params = dict(zip(grid, combo))
    print(params)`, note: 'Positions matter, values do not: <code>permutations("aa", 2)</code> yields <code>("a", "a")</code> twice.' },
      { title: 'Find product bundles under a budget', code: `import json
from itertools import combinations

with open("/data/products.json") as f:
    products = json.load(f)

kitchen = [p for p in products if p["category"] == "kitchen"]
print(len(kitchen), "kitchen products")

bundles = []
for pair in combinations(kitchen, 2):
    total = sum(p["price"] for p in pair)
    if total <= 100:
        bundles.append((total, [p["name"] for p in pair]))

for total, names in sorted(bundles):
    print(f"{total:6.2f}  {names}")` },
    ] },
    { id: 'tee', title: 'tee and recipes', blurb: 'Split one iterator into several, and the small helpers the docs build from these parts.', snippets: [
      { title: 'tee: read one stream twice', code: `from itertools import tee
from statistics import mean

def readings():
    for i in range(6):
        print(f"  producing {i}")       # runs once, not twice
        yield i * i

a, b = tee(readings(), 2)
print("mean", mean(a))                  # consumes a; tee buffers for b
print("max ", max(b))                   # served from the buffer

# the buffer grows with the gap between consumers: keep them close
x, y = tee(range(3))
print(next(x), next(x), next(y))`, note: 'After <code>tee</code>, do not touch the original iterator. Anything it yields is missed by all the copies.' },
      { title: 'Recipes: sliding window and round-robin', code: `from collections import deque
from itertools import islice, cycle, chain

def sliding_window(iterable, n):
    it = iter(iterable)
    window = deque(islice(it, n - 1), maxlen=n)
    for x in it:
        window.append(x)
        yield tuple(window)

def roundrobin(*iterables):
    "roundrobin('ABC', 'D', 'EF') → A D E B F C"
    iterators = map(iter, iterables)
    for num_active in range(len(iterables), 0, -1):
        iterators = cycle(islice(iterators, num_active))
        yield from map(next, iterators)

print(list(sliding_window([1, 2, 3, 4, 5], 3)))
print("".join(roundrobin("ABC", "D", "EF")))`, note: 'These and about thirty more live in the docs\' <em>Itertools Recipes</em>; <code>pip install more-itertools</code> ships them tested.' },
    ] },
  ],
  concepts: [
    { id: 'groupby', title: 'How groupby walks runs', intro: 'groupby is a run-length tool that people use as a group-by tool. Watching it move through unsorted input shows why the same key can come out twice, and why <code>sorted()</code> with the same key fixes it.', explainer: groupbyExplainer },
    { id: 'lazy', title: 'A pull-driven pipeline', intro: 'Every itertools function returns an iterator that does nothing until asked. Following one <code>next()</code> through <code>islice(map(f, chain(a, b)), 3)</code> shows where work happens, why it stops early, and why the result can only be read once.', explainer: lazyExplainer },
  ],
  compare: [
    { title: 'The four combinatoric functions', columns: ['product', 'permutations', 'combinations', 'combinations_with_replacement'], rows: [
      ['Order matters', true, true, false, false],
      ['An element may repeat in one tuple', true, false, false, true],
      ['Draws from', 'several iterables (or repeat=n)', 'one iterable', 'one iterable', 'one iterable'],
      ['Size for "abc", r=2', '9 (with repeat=2)', '6', '3', '6'],
      ['Typical use', 'grid search, nested loops', 'orderings, anagrams', 'pairs, subsets', 'multisets, dice sums'],
    ], verdict: 'Ask two questions: does order matter, and can the same element appear twice? The answers pick the function. All four emit tuples in the order of the input, never sorted by value.' },
    { title: 'Ways to cut an iterable into pieces', columns: ['islice', 'batched', 'pairwise', 'zip(*[it]*n)'], rows: [
      ['Produces', 'one sub-range', 'tuples of n', 'overlapping pairs', 'tuples of n'],
      ['Overlap between pieces', false, false, true, false],
      ['Keeps a short final piece', { part: 'n/a' }, true, { part: 'n/a' }, false],
      ['Negative or open-ended indices', { part: 'stop=None only' }, false, false, false],
      ['Available since', 'always', '3.12', '3.10', 'always'],
    ], note: 'The <code>zip(*[iter(x)]*n)</code> idiom is the pre-3.12 chunker; it silently drops the remainder, which is sometimes what you want.', verdict: '<code>batched</code> for chunks, <code>pairwise</code> for deltas and adjacent comparisons, <code>islice</code> for "the first n" or "skip the header". The recipe <code>sliding_window</code> covers overlapping windows wider than 2.' },
  ],
  gotchas: [
    { title: 'groupby without sorting gives one group per run', bad: `orders = [("N", 1), ("S", 2), ("N", 3)]
{k: list(g) for k, g in groupby(orders, key=lambda o: o[0])}
# {'N': [('N', 3)], 'S': [('S', 2)]}  ← the first N was overwritten`, good: `key = lambda o: o[0]
{k: list(g) for k, g in groupby(sorted(orders, key=key), key=key)}
# {'N': [('N', 1), ('N', 3)], 'S': [('S', 2)]}`, why: '<code>groupby</code> only compares each key with the one before it. Equal keys that are not adjacent become separate groups, and a dict comprehension keeps only the last.' },
    { title: 'Group iterators die when you advance past them', bad: `groups = [g for k, g in groupby("aabbc")]
[list(g) for g in groups]
# [[], [], ['c']]  ← only the last one survives`, good: `groups = [list(g) for k, g in groupby("aabbc")]
# [['a', 'a'], ['b', 'b'], ['c']]`, why: 'All the group iterators share the single underlying stream. Moving groupby to the next key consumes the rest of the current run, so an earlier group you saved is already empty.' },
    { title: 'islice skips by consuming', bad: `it = iter(range(10))
first = list(islice(it, 3))      # [0, 1, 2]
again = list(islice(it, 3))      # [3, 4, 5], not [0, 1, 2]
peek = list(islice(it, 8, 9))    # [] — it walked and discarded 6..9`, good: `data = list(range(10))
data[:3], data[:3], data[8:9]    # lists support real slicing
# or, to look ahead without losing items:
from itertools import tee
head, rest = tee(it)`, why: '<code>islice</code> has no way to jump: reaching index 8 means pulling and throwing away everything before it, and those items are gone from the source iterator too.' },
    { title: 'Using the original after tee loses items', bad: `src = iter([1, 2, 3, 4])
a, b = tee(src)
next(src)              # 1 is consumed directly
list(a), list(b)       # [2, 3, 4] twice: 1 was never buffered`, good: `a, b = tee(iter([1, 2, 3, 4]))
list(a), list(b)       # [1, 2, 3, 4] twice
# and keep a and b close together: the buffer holds the gap`, why: '<code>tee</code> buffers only what passes through its own copies. Anything pulled from the source directly bypasses the buffer. The buffer is also unbounded, so a copy left far behind holds every skipped item in memory.' },
  ],
  presets: [
    { title: 'Orders: group, window, chunk', code: `import csv
from itertools import groupby, pairwise, batched, islice, accumulate
from operator import itemgetter

with open("/data/orders.csv") as f:
    orders = sorted(csv.DictReader(f), key=itemgetter("region"))

for region, run in groupby(orders, key=itemgetter("region")):
    qty = [int(o["quantity"]) for o in run]
    running = list(accumulate(qty))
    jumps = sum(1 for a, b in pairwise(qty) if b > a)
    print(f"{region:<6} orders={len(qty):<3} total={running[-1]:<4} upticks={jumps}")

print([len(b) for b in batched(islice(orders, 10), 4)])   # chunk sizes` },
  ],
};
