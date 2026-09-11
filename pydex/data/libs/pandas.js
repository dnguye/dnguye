import { scene } from '../../js/explainer.js';

const groupbyExplainer = {
  hold: 2800,
  code: ['df.groupby("region")', '  ["revenue"].sum()', '# → one row per group'],
  build() {
    const s = scene(760, 340);
    s.text('t-src', 20, 20, 'orders', 'lbl bold', undefined, 'start');
    s.text('t-key', 20, 300, '', 'lbl sm ink-2', undefined, 'start');
    ['North', 'South', 'East'].forEach((n, i) => {
      const g = s.g(`grp${i}`, 250, 30 + i * 100, 'hid');
      s.rect(`grp${i}.p`, 0, 0, 160, 92, 'panel', g, 8);
      s.text(`grp${i}.t`, 8, -10, n, 'lbl sm bold ink-2', g, 'start');
    });
    const rows = [['North', 120], ['South', 80], ['North', 90], ['East', 50], ['South', 40], ['East', 70]];
    rows.forEach(([r, v], i) => {
      const g = s.g(`r${i}`, 20, 36 + i * 36);
      s.rect(`r${i}.k`, 0, 0, 74, 28, 'cell', g); s.text(`r${i}.kt`, 37, 14, r, 'lbl', g);
      s.rect(`r${i}.v`, 78, 0, 56, 28, 'cell', g); s.text(`r${i}.vt`, 106, 14, String(v), 'lbl', g);
    });
    [['North', 210], ['South', 120], ['East', 120]].forEach(([n, v], i) => {
      const g = s.g(`agg${i}`, 470, 60 + i * 100, 'hid');
      s.rect(`agg${i}.r`, 0, 0, 120, 30, 'cell ok', g); s.text(`agg${i}.t`, 60, 15, `sum = ${v}`, 'lbl', g);
      s.arrow(`arr${i}`, 420, 76 + i * 100, 465, 76 + i * 100, 'arrow ok hid');
    });
    const res = s.g('res', 630, 36, 'hid');
    s.text('res.t', 0, -16, 'result', 'lbl bold', res, 'start');
    [['North', 210], ['South', 120], ['East', 120]].forEach(([n, v], i) => {
      s.rect(`res${i}.k`, 0, i * 36, 60, 28, 'cell', res); s.text(`res${i}.kt`, 30, i * 36 + 14, n, 'lbl sm', res);
      s.rect(`res${i}.v`, 64, i * 36, 50, 28, 'cell ok', res); s.text(`res${i}.vt`, 89, i * 36 + 14, String(v), 'lbl sm', res);
    });
    return s;
  },
  steps: [
    { title: 'Six rows, one key column', caption: 'Each order has a region and a revenue. We want revenue per region.', lines: [] },
    { title: 'Split on the key', caption: 'groupby("region") does not compute anything yet. It builds a mapping from each distinct key to the rows that carry it.', lines: [0],
      patch: { 'r0.k': { cls: 'cell hot' }, 'r1.k': { cls: 'cell hot' }, 'r2.k': { cls: 'cell hot' }, 'r3.k': { cls: 'cell hot' }, 'r4.k': { cls: 'cell hot' }, 'r5.k': { cls: 'cell hot' }, 't-key': { text: 'key = region → 3 groups' } } },
    { title: 'Rows move into their groups', caption: 'Row order inside a group is preserved. Every row lands in exactly one group.', lines: [0],
      patch: { grp0: { cls: '' }, grp1: { cls: '' }, grp2: { cls: '' },
        r0: { x: 262, y: 44 }, r2: { x: 262, y: 80 }, r1: { x: 262, y: 144 }, r4: { x: 262, y: 180 }, r3: { x: 262, y: 244 }, r5: { x: 262, y: 280 } } },
    { title: 'Apply a function to each group', caption: '["revenue"].sum() runs once per group, on that group\'s slice of the column. Any reducer works: mean, count, max, or your own.', lines: [1],
      patch: { agg0: { cls: '' }, agg1: { cls: '' }, agg2: { cls: '' }, arr0: { cls: 'arrow ok' }, arr1: { cls: 'arrow ok' }, arr2: { cls: 'arrow ok' },
        'r0.v': { cls: 'cell hot' }, 'r2.v': { cls: 'cell hot' }, 'r1.v': { cls: 'cell hot' }, 'r4.v': { cls: 'cell hot' }, 'r3.v': { cls: 'cell hot' }, 'r5.v': { cls: 'cell hot' } } },
    { title: 'Combine into a new frame', caption: 'The group keys become the index (or a column with as_index=False). One row per group, in first-seen order unless sort=True (the default) sorts keys.', lines: [2],
      patch: { res: { cls: '' }, agg0: { cls: 'hid' }, agg1: { cls: 'hid' }, agg2: { cls: 'hid' }, arr0: { cls: 'arrow ok hid' }, arr1: { cls: 'arrow ok hid' }, arr2: { cls: 'arrow ok hid' }, grp0: { cls: 'dim' }, grp1: { cls: 'dim' }, grp2: { cls: 'dim' },
        r0: { add: 'dim' }, r1: { add: 'dim' }, r2: { add: 'dim' }, r3: { add: 'dim' }, r4: { add: 'dim' }, r5: { add: 'dim' } } },
  ],
};

const mergeExplainer = {
  hold: 3000,
  code: ['pd.merge(people, cities,', '         on="id", how="inner")', '# how = left | right | outer'],
  build() {
    const s = scene(760, 300);
    const L = [[1, 'Ann'], [2, 'Bo'], [3, 'Cy']], R = [[2, 'Oslo'], [3, 'Lagos'], [4, 'Rome']];
    s.text('lt', 20, 22, 'people (left)', 'lbl bold', undefined, 'start');
    s.text('rt', 250, 22, 'cities (right)', 'lbl bold', undefined, 'start');
    s.text('ot', 500, 22, 'result', 'lbl bold', undefined, 'start');
    s.text('ht', 500, 280, '', 'lbl sm ink-2', undefined, 'start');
    L.forEach(([id, n], i) => { const g = s.g(`l${i}`, 20, 40 + i * 36); s.rect(`l${i}.k`, 0, 0, 40, 28, 'cell', g); s.text(`l${i}.kt`, 20, 14, String(id), 'lbl', g); s.rect(`l${i}.v`, 44, 0, 70, 28, 'cell', g); s.text(`l${i}.vt`, 79, 14, n, 'lbl', g); });
    R.forEach(([id, n], i) => { const g = s.g(`r${i}`, 250, 40 + i * 36); s.rect(`r${i}.k`, 0, 0, 40, 28, 'cell', g); s.text(`r${i}.kt`, 20, 14, String(id), 'lbl', g); s.rect(`r${i}.v`, 44, 0, 70, 28, 'cell', g); s.text(`r${i}.vt`, 79, 14, n, 'lbl', g); });
    // match lines
    s.line('m0', 136, 90, 248, 54, 'arrow hid'); s.line('m1', 136, 126, 248, 90, 'arrow hid');
    const rows = [[1, 'Ann', 'NaN', 'left-only'], [2, 'Bo', 'Oslo', 'both'], [3, 'Cy', 'Lagos', 'both'], [4, 'NaN', 'Rome', 'right-only']];
    rows.forEach(([id, n, c, tag], i) => {
      const g = s.g(`o${i}`, 500, 40 + i * 36, 'hid');
      s.rect(`o${i}.k`, 0, 0, 40, 28, 'cell', g); s.text(`o${i}.kt`, 20, 14, String(id), 'lbl', g);
      s.rect(`o${i}.a`, 44, 0, 64, 28, n === 'NaN' ? 'cell err' : 'cell', g); s.text(`o${i}.at`, 76, 14, n, 'lbl', g);
      s.rect(`o${i}.b`, 112, 0, 70, 28, c === 'NaN' ? 'cell err' : 'cell', g); s.text(`o${i}.bt`, 147, 14, c, 'lbl', g);
      s.text(`o${i}.tag`, 190, 14, tag, 'lbl sm ink-2', g, 'start');
    });
    return s;
  },
  steps: [
    { title: 'Two frames, one shared key', caption: 'people has ids 1, 2, 3. cities has ids 2, 3, 4. Only 2 and 3 appear in both.', lines: [] },
    { title: 'Line up on the key', caption: 'merge pairs rows whose "id" values are equal. Matching is on values, not on position.', lines: [1],
      patch: { m0: { cls: 'arrow hot' }, m1: { cls: 'arrow hot' }, 'l1.k': { cls: 'cell hot' }, 'l2.k': { cls: 'cell hot' }, 'r0.k': { cls: 'cell hot' }, 'r1.k': { cls: 'cell hot' } } },
    { title: 'how="inner" (the default)', caption: 'Keep only keys present on both sides. Ann (1) and Rome (4) are dropped. Two rows come out.', lines: [1],
      patch: { o1: { cls: '' }, o2: { cls: '' }, ht: { text: 'inner → 2 rows' } } },
    { title: 'how="left"', caption: 'Keep every left row. Ann has no city, so the right-hand columns are NaN for her. Three rows.', lines: [2],
      patch: { o0: { cls: '' }, ht: { text: 'left → 3 rows (NaN where the right side is missing)' } } },
    { title: 'how="outer"', caption: 'Keep everything from both sides. Rome appears with a NaN name. Four rows. how="right" would be the mirror of left.', lines: [2],
      patch: { o3: { cls: '' }, ht: { text: 'outer → 4 rows (union of keys)' } } },
    { title: 'Duplicate keys multiply', caption: 'If a key appears twice on one side and three times on the other, you get six rows for it. Pass validate="one_to_one" or "one_to_many" to catch that early.', lines: [1],
      patch: { 'o1.k': { cls: 'cell hot' }, 'o2.k': { cls: 'cell hot' } } },
  ],
};

export default {
  id: 'pandas', name: 'pandas', glyph: 'pd', group: 'data', version: '2.2', keywords: 'dataframe table csv excel groupby merge pivot',
  tagline: 'Tables in memory: load, clean, reshape, aggregate.',
  install: 'pip install pandas', docs: 'https://pandas.pydata.org/docs/', packages: ['pandas'],
  overview: {
    what: 'pandas gives you the DataFrame: a labelled, column-typed table with an index. Most day-to-day data work is a handful of verbs applied to it: select, filter, assign, group, join, reshape. It is built on numpy and plays well with everything that reads or writes tabular data.',
    yes: ['Data fits in memory (up to a few GB).', 'You need quick exploration: describe, value_counts, plot.', 'Reading and writing CSV, Excel, Parquet, SQL, JSON.', 'Time series with resampling and rolling windows.'],
    no: ['Data is bigger than RAM (see polars, DuckDB, Spark).', 'You need the fastest possible single-core throughput (polars).', 'Pure numeric arrays without labels (numpy is lighter).', 'You are building a long pipeline where a query optimizer would help (polars lazy).'],
  },
  cheatsheet: [
    { id: 'load', title: 'Load and look', blurb: 'Read a file, then ask the frame what it contains.', snippets: [
      { title: 'Read a CSV and peek', code: `import pandas as pd

df = pd.read_csv("/data/orders.csv", parse_dates=["date"])
print(df.shape)          # (rows, columns)
print(df.dtypes)         # one dtype per column
df.head()                # last expression is displayed`, note: '<strong>parse_dates</strong> turns the column into datetime64 at read time; doing it later with <code>pd.to_datetime</code> works too.' },
      { title: 'Summary statistics', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")

print(df.describe())               # numeric columns
print(df["region"].value_counts()) # categorical counts
df.info()`, note: '<code>describe(include="all")</code> adds object columns. <code>info()</code> prints memory use and null counts.' },
      { title: 'Build a frame from Python objects', code: `import pandas as pd

people = pd.DataFrame({
    "name": ["Ann", "Bo", "Cy"],
    "age": [31, 45, 28],
})
rows = pd.DataFrame([{"name": "Di", "age": 39}])
pd.concat([people, rows], ignore_index=True)` },
    ] },
    { id: 'select', title: 'Select and filter', blurb: 'Columns by name, rows by label, position, or condition.', snippets: [
      { title: 'Columns and rows', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")

cols = df[["order_id", "region", "quantity"]]  # list → DataFrame
s = df["region"]                                # str  → Series
first = df.iloc[0]                              # by position
by_label = df.loc[5, "region"]                  # by index label + column
print(first)
print(by_label)
cols.head(3)` },
      { title: 'Boolean masks', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")

big = df[(df.quantity >= 3) & (df.status == "shipped")]
not_east = df[~df.region.isin(["East"])]
q = df.query("quantity >= 3 and status == 'shipped'")
print(len(big), len(not_east), len(q))
big.head()`, note: 'Use <code>&amp;</code>, <code>|</code>, <code>~</code> with parentheses around each comparison. Python\'s <code>and</code>/<code>or</code> do not work on Series.' },
      { title: 'Sort and take', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")

top = df.sort_values(["region", "quantity"], ascending=[True, False])
top.groupby("region").head(2)     # first 2 per region after sorting
df.nlargest(3, "unit_price")[["order_id", "unit_price"]]` },
    ] },
    { id: 'transform', title: 'Add and transform columns', snippets: [
      { title: 'Vectorised arithmetic and assign', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv", parse_dates=["date"])

df["revenue"] = df.quantity * df.unit_price * (1 - df.discount)
df = df.assign(
    month=df.date.dt.to_period("M"),
    big=lambda d: d.revenue > 200,   # lambda sees the frame with earlier assigns
)
df[["order_id", "revenue", "month", "big"]].head()`, note: 'Column math runs in C over whole columns. Reach for <code>apply</code> only when there is no vectorised form.' },
      { title: 'map, apply, and where', code: `import pandas as pd
import numpy as np
df = pd.read_csv("/data/orders.csv")

tier = {"North": "A", "South": "A", "East": "B", "West": "B"}
df["tier"] = df.region.map(tier)                     # dict/Series/function on one column
df["label"] = df.status.str.upper().str[:4]          # string accessor
df["flag"] = np.where(df.discount > 0, "promo", "list")
df["qty_band"] = pd.cut(df.quantity, bins=[0, 1, 3, 10], labels=["one", "few", "many"])
df[["region", "tier", "label", "flag", "qty_band"]].head()` },
      { title: 'Dates', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv", parse_dates=["date"])

df["weekday"] = df.date.dt.day_name()
monthly = df.set_index("date").resample("ME")["quantity"].sum()
print(monthly.head())
df["days_since"] = (pd.Timestamp("2026-01-01") - df.date).dt.days
df[["date", "weekday", "days_since"]].head()`, note: 'Offset aliases: <code>"D"</code>, <code>"W"</code>, <code>"ME"</code> (month end), <code>"QE"</code>, <code>"YE"</code>. Older code uses <code>"M"</code>, which is deprecated.' },
    ] },
    { id: 'groupby', title: 'Group and aggregate', blurb: 'Split on keys, apply a function per group, combine the results.', snippets: [
      { title: 'One aggregate per group', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")
df["revenue"] = df.quantity * df.unit_price

df.groupby("region")["revenue"].sum().sort_values(ascending=False)` },
      { title: 'Several aggregates, named', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")
df["revenue"] = df.quantity * df.unit_price

df.groupby(["region", "status"]).agg(
    orders=("order_id", "count"),
    revenue=("revenue", "sum"),
    avg_qty=("quantity", "mean"),
).round(1).reset_index()`, note: 'Named aggregation keeps the output flat. <code>reset_index()</code> turns the group keys back into columns.' },
      { title: 'transform keeps the original shape', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")
df["revenue"] = df.quantity * df.unit_price

df["region_total"] = df.groupby("region")["revenue"].transform("sum")
df["share"] = (df.revenue / df.region_total).round(3)
df[["order_id", "region", "revenue", "region_total", "share"]].head()`, note: '<code>transform</code> broadcasts the per-group result back onto every row, so you can compare each row with its group.' },
    ] },
    { id: 'combine', title: 'Join and reshape', snippets: [
      { title: 'merge on a key', code: `import pandas as pd
orders = pd.read_csv("/data/orders.csv")
products = pd.read_json("/data/products.json")

joined = orders.merge(products, left_on="product_id", right_on="id", how="left", validate="many_to_one")
joined[["order_id", "name", "category", "quantity"]].head()` },
      { title: 'pivot_table', code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")
df["revenue"] = df.quantity * df.unit_price

pd.pivot_table(df, values="revenue", index="region", columns="status", aggfunc="sum", fill_value=0).round(0)`, note: 'The reverse operation is <code>melt</code>: wide → long.' },
      { title: 'concat and melt', code: `import pandas as pd
a = pd.DataFrame({"k": [1, 2], "x": [10, 20]})
b = pd.DataFrame({"k": [3], "x": [30]})
stacked = pd.concat([a, b], ignore_index=True)

wide = pd.DataFrame({"id": [1, 2], "q1": [5, 6], "q2": [7, 8]})
long = wide.melt(id_vars="id", var_name="quarter", value_name="sales")
print(stacked)
long` },
    ] },
    { id: 'clean', title: 'Missing values and duplicates', snippets: [
      { title: 'Find, fill, drop', code: `import pandas as pd
import numpy as np
df = pd.DataFrame({"a": [1, np.nan, 3, 3], "b": ["x", None, "z", "z"]})

print(df.isna().sum())
filled = df.fillna({"a": df.a.mean(), "b": "unknown"})
dropped = df.dropna(subset=["a"])
dedup = df.drop_duplicates()
print(filled)
print(len(dropped), len(dedup))` },
    ] },
    { id: 'io', title: 'Write out', snippets: [
      { title: 'to_csv, to_dict, to_json', code: `import pandas as pd
df = pd.read_csv("/data/employees.csv")

df.to_csv("/tmp/out.csv", index=False)
records = df.head(2).to_dict(orient="records")
print(records)
print(df.head(2).to_json(orient="records", indent=1))` },
    ] },
  ],
  concepts: [
    { id: 'groupby', title: 'Split, apply, combine', intro: 'Every groupby is three moves. Seeing them separately explains why <code>transform</code>, <code>agg</code> and <code>apply</code> return different shapes.', explainer: groupbyExplainer },
    { id: 'merge', title: 'How merge picks rows', intro: 'The <code>how</code> argument decides which keys survive. Missing partners become NaN.', explainer: mergeExplainer },
  ],
  compare: [
    { title: 'Ways to pick rows', columns: ['loc', 'iloc', 'boolean mask', 'query'], rows: [
      ['Selects by', 'index label', 'position (0-based)', 'True/False per row', 'string expression'],
      ['Slice end included', true, false, { part: 'n/a' }, { part: 'n/a' }],
      ['Can set values', true, true, true, false],
      ['Reads well for many conditions', { dots: 3 }, { dots: 2 }, { dots: 3 }, { dots: 5 }],
      ['Speed on large frames', { dots: 4 }, { dots: 5 }, { dots: 4 }, { dots: 4 }],
    ], verdict: 'Masks for logic you will edit, <code>iloc</code> for positions, <code>loc</code> when the index means something, <code>query</code> when a long condition needs to be readable.' },
    { title: 'Applying logic per row', columns: ['column arithmetic', 'Series.map', 'apply(axis=1)', 'itertuples'], rows: [
      ['Runs in', 'C (numpy)', 'C for dicts, Python for functions', 'Python per row', 'Python per row'],
      ['Relative speed', { dots: 5 }, { dots: 4 }, { dots: 1 }, { dots: 2 }],
      ['Sees other columns', true, false, true, true],
      ['Typical use', 'math, comparisons', 'lookups, recoding', 'last resort', 'side effects'],
    ], verdict: 'Try column arithmetic, then <code>np.where</code>/<code>np.select</code>, then <code>map</code>. Row-wise <code>apply</code> is a fallback, not a habit.' },
  ],
  gotchas: [
    { title: 'Chained assignment silently does nothing', bad: `df[df.region == "East"]["quantity"] = 0
# SettingWithCopyWarning; df unchanged`, good: `df.loc[df.region == "East", "quantity"] = 0`, why: 'The first form indexes twice; the second bracket may operate on a temporary copy. One <code>.loc</code> call with both row and column selectors writes in place. pandas 3 turns this into an error with Copy-on-Write.' },
    { title: 'Python and/or do not work on Series', bad: `df[df.quantity > 2 and df.status == "shipped"]
# ValueError: truth value of a Series is ambiguous`, good: `df[(df.quantity > 2) & (df.status == "shipped")]`, why: '<code>and</code> asks the whole Series for a single truth value. <code>&amp;</code> and <code>|</code> are element-wise, and the parentheses matter because <code>&amp;</code> binds tighter than <code>&gt;</code>.' },
    { title: 'inplace=True returns None', bad: `df = df.dropna(inplace=True)
# df is now None`, good: `df = df.dropna()`, why: 'Methods with <code>inplace=True</code> mutate and return <code>None</code>. Reassigning is the same speed in almost every case and composes in chains.' },
    { title: 'axis=0 means "down the rows"', bad: `df.drop("region", axis=0)   # KeyError: no row labelled "region"`, good: `df.drop(columns=["region"])
df.mean(axis=0)   # one value per column
df.mean(axis=1)   # one value per row`, why: 'Read axis as "the axis that gets collapsed or walked". <code>axis=0</code> walks down rows, so a reduction gives one result per column. The keyword forms <code>columns=</code>/<code>index=</code> avoid the question.' },
  ],
  presets: [
    { title: 'Revenue by region', code: `import pandas as pd

orders = pd.read_csv("/data/orders.csv", parse_dates=["date"])
orders["revenue"] = orders.quantity * orders.unit_price * (1 - orders.discount)

(orders[orders.status == "shipped"]
   .groupby("region", as_index=False)["revenue"].sum()
   .sort_values("revenue", ascending=False))` },
    { title: 'Orders joined to products', code: `import pandas as pd

orders = pd.read_csv("/data/orders.csv")
products = pd.read_json("/data/products.json")
joined = orders.merge(products, left_on="product_id", right_on="id", how="left")
joined.groupby("category")["quantity"].sum().sort_values(ascending=False)` },
  ],
};
