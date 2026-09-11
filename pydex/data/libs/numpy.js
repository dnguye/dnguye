import { scene } from '../../js/explainer.js';

const broadcastExplainer = {
  hold: 3000,
  code: ['a.shape == (3, 1)', 'b.shape == (1, 4)', '(a + b).shape == (3, 4)'],
  build() {
    const s = scene(760, 330);
    const C = 44, G = 6;
    s.text('ta', 40, 22, 'a  (3, 1)', 'lbl bold', undefined, 'start');
    s.text('tb', 200, 22, 'b  (1, 4)', 'lbl bold', undefined, 'start');
    s.text('tr', 470, 22, 'a + b', 'lbl bold', undefined, 'start');
    s.text('rule', 40, 300, '', 'lbl sm ink-2', undefined, 'start');
    // a column
    [1, 2, 3].forEach((v, i) => s.cell(`a${i}`, 40, 44 + i * (C + G), C, C, String(v)));
    // ghost copies of a (stretched across 4 cols) drawn at result location
    // b row
    [10, 20, 30, 40].forEach((v, j) => s.cell(`b${j}`, 200 + j * (C + G), 44, C, C, String(v)));
    // result grid
    const rx = 470, ry = 44;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) s.cell(`r${i}${j}`, rx + j * (C + G), ry + i * (C + G), C, C, '', 'cell ghost');
    // shape comparison lines
    s.text('sa', 40, 230, 'a: (3, 1)', 'code', undefined, 'start');
    s.text('sb', 40, 254, 'b: (1, 4)', 'code', undefined, 'start');
    s.text('so', 40, 278, '', 'code', undefined, 'start');
    s.rect('hl1', 92, 244, 20, 20, 'cell ghost hid');   // trailing dim highlight
    s.rect('hl0', 74, 244, 20, 20, 'cell ghost hid');
    // error case
    const ex = 200;
    s.text('errt', ex, 230, '', 'code', undefined, 'start');
    s.text('errt2', ex, 254, '', 'code', undefined, 'start');
    s.text('errt3', ex, 278, '', 'code err-fill', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Two arrays, different shapes', caption: 'a is a column with 3 rows and 1 column. b is a row with 1 row and 4 columns. Adding them element-wise looks impossible.', lines: [0, 1] },
    { title: 'Compare shapes from the right', caption: 'Broadcasting lines the shapes up on their trailing dimension and walks left. Two dimensions are compatible when they are equal, or when one of them is 1.', lines: [0, 1],
      patch: { rule: { text: 'compatible if equal, or one of them is 1' } } },
    { title: 'Stretch b down the rows', caption: 'b has 1 row where a has 3. The single row is reused (virtually, no copy in memory) for every row of the result.', lines: [1],
      patch: { b0: { add: 'hot' }, b1: { add: 'hot' }, b2: { add: 'hot' }, b3: { add: 'hot' }, 'b0.r': { cls: 'cell hot' }, 'b1.r': { cls: 'cell hot' }, 'b2.r': { cls: 'cell hot' }, 'b3.r': { cls: 'cell hot' },
        'r00.t': { text: '10' }, 'r01.t': { text: '20' }, 'r02.t': { text: '30' }, 'r03.t': { text: '40' }, 'r10.t': { text: '10' }, 'r11.t': { text: '20' }, 'r12.t': { text: '30' }, 'r13.t': { text: '40' }, 'r20.t': { text: '10' }, 'r21.t': { text: '20' }, 'r22.t': { text: '30' }, 'r23.t': { text: '40' } } },
    { title: 'Stretch a across the columns', caption: 'a has 1 column where b has 4. Each of its values is reused across a whole row.', lines: [0],
      patch: { 'a0.r': { cls: 'cell hot' }, 'a1.r': { cls: 'cell hot' }, 'a2.r': { cls: 'cell hot' }, 'b0.r': { cls: 'cell' }, 'b1.r': { cls: 'cell' }, 'b2.r': { cls: 'cell' }, 'b3.r': { cls: 'cell' },
        'r00.t': { text: '1+10' }, 'r01.t': { text: '1+20' }, 'r02.t': { text: '1+30' }, 'r03.t': { text: '1+40' }, 'r10.t': { text: '2+10' }, 'r11.t': { text: '2+20' }, 'r12.t': { text: '2+30' }, 'r13.t': { text: '2+40' }, 'r20.t': { text: '3+10' }, 'r21.t': { text: '3+20' }, 'r22.t': { text: '3+30' }, 'r23.t': { text: '3+40' } } },
    { title: 'The result is (3, 4)', caption: 'Each output dimension is the larger of the two. Nothing was copied until the addition itself ran.', lines: [2],
      patch: { so: { text: '→  (3, 4)' }, 'a0.r': { cls: 'cell' }, 'a1.r': { cls: 'cell' }, 'a2.r': { cls: 'cell' },
        ...Object.fromEntries([['r00','11'],['r01','21'],['r02','31'],['r03','41'],['r10','12'],['r11','22'],['r12','32'],['r13','42'],['r20','13'],['r21','23'],['r22','33'],['r23','43']].flatMap(([id, v]) => [[`${id}.t`, { text: v }], [`${id}.r`, { cls: 'cell ok' }]])) } },
    { title: 'When it fails', caption: 'Shapes (3,) and (4,) line up 3 against 4. Neither is 1, so numpy raises "operands could not be broadcast together". Add an axis with a[:, None] to make it (3, 1).', lines: [],
      patch: { errt: { text: 'x: (3,)' }, errt2: { text: 'y: (4,)' }, errt3: { text: '3 ≠ 4 and neither is 1 → ValueError' } } },
  ],
};

const axisExplainer = {
  hold: 2800,
  code: ['m.sum(axis=0)  # collapse rows → (3,)', 'm.sum(axis=1)  # collapse cols → (2,)', 'm.sum()        # everything → scalar'],
  build() {
    const s = scene(760, 300);
    const C = 46, G = 8, x0 = 60, y0 = 60;
    s.text('t', x0, 26, 'm  shape (2, 3)', 'lbl bold', undefined, 'start');
    const vals = [[1, 2, 3], [4, 5, 6]];
    vals.forEach((row, i) => row.forEach((v, j) => s.cell(`m${i}${j}`, x0 + j * (C + G), y0 + i * (C + G), C, C, String(v))));
    s.text('ax0', x0 - 30, y0 + C + G / 2, 'axis 0 ↓', 'lbl sm ink-2 hid', undefined, 'middle');
    s.text('ax1', x0 + 1.5 * (C + G) - 4, y0 - 16, 'axis 1 →', 'lbl sm ink-2 hid', undefined, 'middle');
    // axis 0 result (a row under the matrix)
    [5, 7, 9].forEach((v, j) => { s.arrow(`d${j}`, x0 + j * (C + G) + C / 2, y0 + 2 * (C + G) - 4, x0 + j * (C + G) + C / 2, y0 + 2 * (C + G) + 18, 'arrow hot hid'); s.cell(`s0${j}`, x0 + j * (C + G), y0 + 2 * (C + G) + 22, C, C, String(v), 'cell ok hid'); });
    s.text('s0t', x0 + 3 * (C + G) + 6, y0 + 2 * (C + G) + 22 + C / 2, 'axis=0 → shape (3,)', 'lbl sm ink-2 hid', undefined, 'start');
    // axis 1 result (a column to the right)
    const rx = x0 + 3 * (C + G) + 30;
    [6, 15].forEach((v, i) => { s.arrow(`r${i}`, x0 + 3 * (C + G) - 4, y0 + i * (C + G) + C / 2, rx - 6, y0 + i * (C + G) + C / 2, 'arrow info hid'); s.cell(`s1${i}`, rx, y0 + i * (C + G), C, C, String(v), 'cell info hid'); });
    s.text('s1t', rx + C + 10, y0 + C / 2, 'axis=1 → shape (2,)', 'lbl sm ink-2 hid', undefined, 'start');
    s.cell('all', rx + 170, y0 + (C + G) / 2, 60, C, '21', 'cell hot hid');
    s.text('allt', rx + 170 + 30, y0 + (C + G) / 2 + C + 14, 'no axis → scalar', 'lbl sm ink-2 hid');
    return s;
  },
  steps: [
    { title: 'A 2 × 3 matrix', caption: 'axis 0 runs down the rows, axis 1 runs across the columns. The axis you name is the one that disappears.', lines: [],
      patch: { ax0: { cls: 'lbl sm ink-2' }, ax1: { cls: 'lbl sm ink-2' } } },
    { title: 'axis=0 collapses the rows', caption: 'Each column is summed top to bottom. Three columns in, three numbers out: 1+4, 2+5, 3+6.', lines: [0],
      patch: { d0: { cls: 'arrow hot' }, d1: { cls: 'arrow hot' }, d2: { cls: 'arrow hot' }, s00: { cls: '' }, s01: { cls: '' }, s02: { cls: '' }, s0t: { cls: 'lbl sm ink-2' } } },
    { title: 'axis=1 collapses the columns', caption: 'Each row is summed left to right. Two rows in, two numbers out: 1+2+3 and 4+5+6.', lines: [1],
      patch: { r0: { cls: 'arrow info' }, r1: { cls: 'arrow info' }, s10: { cls: '' }, s11: { cls: '' }, s1t: { cls: 'lbl sm ink-2' } } },
    { title: 'No axis collapses everything', caption: 'sum(), mean(), max() with no axis reduce the whole array to one value. keepdims=True keeps the collapsed axis as length 1 so the result still broadcasts.', lines: [2],
      patch: { all: { cls: '' }, allt: { cls: 'lbl sm ink-2' } } },
  ],
};

export default {
  id: 'numpy', name: 'numpy', glyph: 'np', group: 'data', version: '2.x', keywords: 'array ndarray vector matrix linear algebra broadcasting',
  tagline: 'Fast n-dimensional arrays and the math that runs on them.',
  install: 'pip install numpy', docs: 'https://numpy.org/doc/stable/', packages: ['numpy'],
  overview: {
    what: 'numpy stores numbers in contiguous, typed memory and runs loops in C. Almost every scientific and data library in Python (pandas, scikit-learn, matplotlib, scipy) accepts and returns its ndarray, so the mental model here carries everywhere: shapes, dtypes, broadcasting, and axis.',
    yes: ['Element-wise math on many numbers at once.', 'Linear algebra, random numbers, FFTs, statistics.', 'Image, audio and signal data as arrays.', 'Any loop over numbers that feels slow in pure Python.'],
    no: ['Labelled, heterogeneous tables (pandas or polars).', 'Ragged data where rows differ in length.', 'GPU or autodiff work (PyTorch, JAX).', 'Tiny inputs where the array overhead is the cost.'],
  },
  cheatsheet: [
    { id: 'create', title: 'Create arrays', snippets: [
      { title: 'From lists, ranges and generators', code: `import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])       # 2-D from nested lists
r = np.arange(0, 10, 2)                      # 0 2 4 6 8
l = np.linspace(0.0, 1.0, 5)                 # 5 evenly spaced incl. ends
z = np.zeros((2, 3)); o = np.ones(4); e = np.eye(3)
rng = np.random.default_rng(seed=7)         # the modern random API
noise = rng.normal(loc=0, scale=1, size=(2, 3))
print(a.shape, a.dtype, r, l, sep="\\n")
noise.round(2)`, note: 'Use <code>default_rng</code> rather than <code>np.random.seed</code>; it is faster and every draw is reproducible from the seed.' },
      { title: 'Shape, dtype, reshape', code: `import numpy as np
a = np.arange(12)

m = a.reshape(3, 4)          # view, no copy
print(m.shape, m.ndim, m.size, m.dtype)
print(m.T.shape)             # transpose is a view too
flat = m.ravel()             # view when possible; flatten() always copies
col = a[:, np.newaxis]       # (12,) → (12, 1)
f = a.astype(np.float32)     # explicit cast copies
print(col.shape, f.dtype)
m`, note: '<code>reshape(-1, 4)</code> infers the missing dimension. Shapes are tuples; a 1-D array has shape <code>(n,)</code>, not <code>(n, 1)</code>.' },
    ] },
    { id: 'index', title: 'Index and slice', snippets: [
      { title: 'Basic, boolean and fancy indexing', code: `import numpy as np
m = np.arange(1, 13).reshape(3, 4)

print(m[1, 2])            # single element (row 1, col 2)
print(m[0])               # first row
print(m[:, -1])           # last column
print(m[::2, 1:3])        # every other row, cols 1-2
mask = m % 3 == 0
print(m[mask])            # 1-D result of the True positions
print(m[[0, 2], [1, 3]])  # pairs: (0,1) and (2,3)
m[m > 10] = 0             # assignment through a mask
m`, note: 'Slices are <strong>views</strong>: editing <code>m[0]</code> edits <code>m</code>. Boolean and fancy indexing return copies.' },
      { title: 'where, argmax, sort, unique', code: `import numpy as np
x = np.array([3, 9, 1, 9, 4])

print(np.where(x > 3, "hi", "lo"))     # vectorised if/else
print(np.argmax(x), np.argsort(x))     # positions
print(np.sort(x), x[np.argsort(x)])
vals, counts = np.unique(x, return_counts=True)
print(dict(zip(vals, counts)))
print(np.clip(x, 2, 5))` },
    ] },
    { id: 'math', title: 'Math and reductions', snippets: [
      { title: 'ufuncs and axis', code: `import numpy as np
m = np.array([[1., 2., 3.], [4., 5., 6.]])

print(m * 2 + 1)                 # element-wise, no loops
print(np.sqrt(m).round(2))
print(m.sum(), m.sum(axis=0), m.sum(axis=1))
print(m.mean(axis=1, keepdims=True).shape)   # (2, 1) stays broadcastable
print(m.max(), m.argmax())      # argmax on the flattened array
print(np.cumsum(m, axis=1))`, note: '<code>axis=0</code> collapses rows (one result per column); <code>axis=1</code> collapses columns. See the animation below.' },
      { title: 'Broadcasting', code: `import numpy as np
scores = np.array([[80, 90, 70], [60, 85, 95]])   # (2, 3)
weights = np.array([0.2, 0.5, 0.3])                # (3,) → stretched to (2, 3)
bonus = np.array([[5], [10]])                       # (2, 1) → stretched to (2, 3)

weighted = scores * weights
print(weighted.sum(axis=1))
print((scores + bonus))
# column-wise z-score: subtract a (3,) mean and divide by a (3,) std
z = (scores - scores.mean(axis=0)) / scores.std(axis=0)
z.round(2)` },
      { title: 'Linear algebra', code: `import numpy as np
A = np.array([[2., 1.], [1., 3.]])
b = np.array([3., 5.])

x = np.linalg.solve(A, b)         # prefer solve over inv(A) @ b
print(x, A @ x)                   # @ is matrix multiply
print(np.linalg.det(A), np.linalg.norm(b))
w, v = np.linalg.eig(A)
print(w.round(3))
print(np.dot(b, b), np.outer(b, b))` },
    ] },
    { id: 'combine', title: 'Combine and split', snippets: [
      { title: 'Stack, concatenate, split', code: `import numpy as np
a = np.array([1, 2]); b = np.array([3, 4])

print(np.concatenate([a, b]))          # (4,)
print(np.stack([a, b]))                # new axis → (2, 2)
print(np.vstack([a, b]), np.hstack([a, b]))
print(np.column_stack([a, b]))         # (2, 2) with a, b as columns
left, right = np.split(np.arange(6), [4])
print(left, right)` },
    ] },
    { id: 'perf', title: 'Vectorise instead of looping', snippets: [
      { title: 'A loop versus the array form', code: `import numpy as np, time
rng = np.random.default_rng(1)
x = rng.random(200_000)

t = time.perf_counter()
total = 0.0
for v in x:
    if v > 0.5:
        total += v * v
loop_ms = (time.perf_counter() - t) * 1000

t = time.perf_counter()
vec = (x[x > 0.5] ** 2).sum()
vec_ms = (time.perf_counter() - t) * 1000
print(f"loop {loop_ms:.1f} ms  vs  numpy {vec_ms:.2f} ms  (same result: {abs(total - vec) < 1e-6})")` },
    ] },
  ],
  concepts: [
    { id: 'broadcast', title: 'Broadcasting', intro: 'How numpy combines arrays of different shapes without copying, and the one rule that decides whether it works.', explainer: broadcastExplainer },
    { id: 'axis', title: 'What axis means', intro: 'The axis you pass is the one that gets collapsed. Once that clicks, <code>sum</code>, <code>mean</code>, <code>argmax</code> and <code>concatenate</code> all read the same way.', explainer: axisExplainer },
  ],
  compare: [
    { title: 'Views versus copies', columns: ['Returns a view', 'Returns a copy'], rows: [
      ['Basic slicing m[1:3], m[:, 0]', true, false],
      ['reshape / ravel / .T', { part: 'when memory allows' }, false],
      ['Boolean mask m[m > 0]', false, true],
      ['Fancy index m[[0, 2]]', false, true],
      ['astype, flatten, np.copy', false, true],
      ['Arithmetic m * 2', false, true],
    ], note: 'A view shares memory with the original: cheap, but edits flow both ways. <code>m.base is not None</code> tells you an array is a view.' },
    { title: 'Python lists versus arrays', columns: ['list', 'ndarray'], rows: [
      ['Element types', 'anything, mixed', 'one dtype'],
      ['Memory per number', '~28 B + pointer', '8 B (float64)'],
      ['Element-wise math', 'explicit loop', 'one expression, C speed'],
      ['Multi-dimensional', 'nested lists', 'native shape'],
      ['Growing one item at a time', { dots: 5 }, { dots: 1 }],
      ['Bulk numeric work', { dots: 1 }, { dots: 5 }],
    ], verdict: 'Collect in a list, convert once with <code>np.array</code>. Do not <code>np.append</code> in a loop; it copies every time.' },
  ],
  gotchas: [
    { title: 'Slices are views', bad: `a = np.arange(5)
b = a[1:3]
b[0] = 99      # a is now [0, 99, 2, 3, 4]`, good: `b = a[1:3].copy()`, why: 'Slicing returns a window on the same memory. That is the feature that makes numpy fast, so copy explicitly when you need independence.' },
    { title: 'Integer dtypes wrap around', bad: `x = np.array([200], dtype=np.uint8)
x + 100        # array([44], dtype=uint8)`, good: `x.astype(np.int64) + 100`, why: 'Fixed-width integers overflow silently in arithmetic. Pick a wide enough dtype before doing math, especially on images (uint8).' },
    { title: 'An array has no single truth value', bad: `if a == b:        # ValueError: ambiguous
    ...`, good: `if np.array_equal(a, b):
    ...
if (a > 0).all():
    ...`, why: '<code>a == b</code> is an element-wise array. Use <code>.all()</code>, <code>.any()</code>, or <code>np.allclose</code> for floats.' },
    { title: 'np.append in a loop is quadratic', bad: `out = np.array([])
for v in values:
    out = np.append(out, f(v))`, good: `out = np.array([f(v) for v in values])
# or preallocate: out = np.empty(n); out[i] = ...`, why: 'Arrays are fixed-size; <code>append</code> allocates and copies the whole thing every call.' },
  ],
  presets: [
    { title: 'Broadcasting z-scores', code: `import numpy as np
rng = np.random.default_rng(0)
scores = rng.integers(50, 100, size=(5, 3))
z = (scores - scores.mean(axis=0)) / scores.std(axis=0)
print(scores)
z.round(2)` },
  ],
};
