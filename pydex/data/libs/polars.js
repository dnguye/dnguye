import { scene } from '../../js/explainer.js';

const lazyExplainer = {
  hold: 3000,
  code: ['pl.scan_csv("orders.csv")', '  .filter(pl.col("status") == "shipped")', '  .group_by("region").agg(pl.col("qty").sum())', '  .collect()'],
  build() {
    const s = scene(760, 300);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 40, label, cls);
    s.text('plan', 20, 24, 'query plan (nothing has run)', 'lbl bold', undefined, 'start');
    box('scan', 20, 50, 130, 'scan_csv');
    box('filter', 180, 50, 130, 'filter');
    box('group', 340, 50, 150, 'group_by · agg');
    box('collect', 520, 50, 110, 'collect()', 'cell ghost');
    s.arrow('a1', 152, 70, 176, 70); s.arrow('a2', 312, 70, 336, 70); s.arrow('a3', 492, 70, 516, 70);
    s.text('opt', 20, 140, '', 'lbl bold', undefined, 'start');
    box('oscan', 20, 166, 240, 'scan_csv + filter + 3 columns', 'cell hot hid');
    box('ogroup', 300, 166, 150, 'group_by · agg', 'cell hid');
    box('ocollect', 480, 166, 110, 'collect()', 'cell ok hid');
    s.arrow('b1', 262, 186, 296, 186, 'arrow hid'); s.arrow('b2', 452, 186, 476, 186, 'arrow hid');
    s.text('note', 20, 250, '', 'lbl sm ink-2', undefined, 'start');
    s.text('note2', 20, 272, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Build a plan, not a result', caption: 'scan_csv, filter and group_by each return a LazyFrame. No file has been opened; polars only records what you asked for.', lines: [0, 1, 2] },
    { title: 'collect() hands the plan to the optimizer', caption: 'Only now does polars look at the whole chain. It can reorder steps because it knows everything you will need.', lines: [3],
      patch: { collect: { cls: '' }, 'collect.r': { cls: 'cell hot' }, opt: { text: 'optimized plan' } } },
    { title: 'Predicate pushdown', caption: 'The filter moves into the scan. Rows that fail status == "shipped" are dropped while the CSV is being read, never materialised.', lines: [1],
      patch: { oscan: { cls: '' }, ogroup: { cls: '' }, ocollect: { cls: '' }, b1: { cls: 'arrow' }, b2: { cls: 'arrow' }, 'filter.r': { cls: 'cell dim' }, note: { text: 'filter → pushed into the scan' } } },
    { title: 'Projection pushdown', caption: 'Only status, region and qty are referenced downstream, so the reader parses just those three columns and skips the rest.', lines: [2],
      patch: { note2: { text: '9 columns in the file → 3 columns read' } } },
    { title: 'Execute in parallel', caption: 'The optimized plan runs across all cores with streaming where possible. An eager DataFrame comes back. With pandas you would have written the optimizations by hand, in the right order.', lines: [3],
      patch: { b1: { cls: 'arrow hot flow' }, b2: { cls: 'arrow hot flow' }, 'ocollect.r': { cls: 'cell ok' } } },
  ],
};

export default {
  id: 'polars', name: 'polars', glyph: 'pl', group: 'data', version: '1.x', keywords: 'dataframe lazy rust fast arrow expressions',
  tagline: 'DataFrames written in Rust: expressions, lazy plans, all cores.',
  install: 'pip install polars', docs: 'https://docs.pola.rs/', packages: ['polars', 'numpy'],
  overview: {
    what: 'polars is a DataFrame library with a different design from pandas: no index, a strict expression API (pl.col("x") * 2) instead of Python-level column math, and a lazy mode where a query optimizer rewrites your pipeline before running it across every core. It reads and writes the same files pandas does and converts to pandas with one call.',
    yes: ['Data is large or the pipeline is long and you want it fast without tuning.', 'You like explicit, composable expressions over method chains with side effects.', 'You need streaming over files bigger than memory (scan_* + collect(streaming=True)).', 'Strict types and no surprise index behaviour.'],
    no: ['A library you depend on wants pandas objects (convert at the boundary).', 'You rely on pandas-only features: MultiIndex, some time-series resampling niceties, rich plotting glue.', 'The team knows pandas and the data is small; the switch has a cost.'],
  },
  cheatsheet: [
    { id: 'load', title: 'Load and look', snippets: [
      { title: 'Read a CSV eagerly', code: `import polars as pl

df = pl.read_csv("/data/orders.csv", try_parse_dates=True)
print(df.shape, df.schema)
df.head(5)`, note: 'polars prints the dtype under every column name. There is no index column: rows are just positions.' },
      { title: 'Describe and count', code: `import polars as pl
df = pl.read_csv("/data/orders.csv")

print(df.describe())
df["region"].value_counts(sort=True)` },
    ] },
    { id: 'expr', title: 'Select, filter, add columns', blurb: 'Everything is an expression built from <code>pl.col</code>, evaluated by the engine, not by Python.', snippets: [
      { title: 'select and with_columns', code: `import polars as pl
df = pl.read_csv("/data/orders.csv")

out = df.with_columns(
    revenue=pl.col("quantity") * pl.col("unit_price") * (1 - pl.col("discount")),
    big=pl.col("quantity") >= 3,
).select("order_id", "region", "revenue", "big")
out.head()`, note: '<code>select</code> keeps only what you list; <code>with_columns</code> adds or replaces and keeps the rest.' },
      { title: 'filter with expressions', code: `import polars as pl
df = pl.read_csv("/data/orders.csv")

df.filter(
    (pl.col("quantity") >= 3) & (pl.col("status") == "shipped")
).filter(pl.col("region").is_in(["North", "East"])).head()` },
      { title: 'Conditional columns', code: `import polars as pl
df = pl.read_csv("/data/orders.csv")

df.with_columns(
    band=pl.when(pl.col("quantity") == 1).then(pl.lit("one"))
          .when(pl.col("quantity") <= 3).then(pl.lit("few"))
          .otherwise(pl.lit("many"))
).select("quantity", "band").head(6)` },
      { title: 'Strings and dates', code: `import polars as pl
df = pl.read_csv("/data/orders.csv", try_parse_dates=True)

df.select(
    pl.col("rep").str.to_uppercase().alias("REP"),
    pl.col("status").str.starts_with("ship").alias("shipped"),
    pl.col("date").dt.month().alias("month"),
    pl.col("date").dt.strftime("%b %Y").alias("label"),
).head()` },
    ] },
    { id: 'group', title: 'Group, aggregate, join', snippets: [
      { title: 'group_by + agg', code: `import polars as pl
df = pl.read_csv("/data/orders.csv")

(df.group_by("region")
   .agg(
       orders=pl.len(),
       qty=pl.col("quantity").sum(),
       avg_price=pl.col("unit_price").mean().round(2),
       reps=pl.col("rep").n_unique(),
   )
   .sort("qty", descending=True))` },
      { title: 'Window functions with over', code: `import polars as pl
df = pl.read_csv("/data/orders.csv")

df.with_columns(
    region_qty=pl.col("quantity").sum().over("region"),
    rank=pl.col("quantity").rank("dense", descending=True).over("region"),
).select("order_id", "region", "quantity", "region_qty", "rank").head(6)`, note: '<code>over</code> is the equivalent of pandas <code>groupby(...).transform</code>: the group result is broadcast back to every row.' },
      { title: 'join', code: `import polars as pl
import json
orders = pl.read_csv("/data/orders.csv")
products = pl.DataFrame(json.load(open("/data/products.json")))   # pl.read_json needs the json feature

orders.join(products, left_on="product_id", right_on="id", how="left").select(
    "order_id", "name", "category", "quantity"
).head()` },
    ] },
    { id: 'lazy', title: 'Lazy mode', snippets: [
      { title: 'scan, build, collect', code: `import polars as pl

# Outside the browser: pl.scan_csv("/data/orders.csv") streams the file lazily.
# The wasm build is slow to scan files, so here we read eagerly and go lazy from there.
q = (pl.read_csv("/data/orders.csv").lazy()
       .filter(pl.col("status") == "shipped")
       .group_by("region")
       .agg(pl.col("quantity").sum().alias("qty"))
       .sort("qty", descending=True))

print(q.explain())      # the optimized plan, as text
q.collect()`, note: '<code>explain()</code> shows the filter applied before the aggregation. With <code>scan_csv</code> it would also show the projection pushed into the file read.' },
      { title: 'Interop: dicts, numpy, pandas', code: `import polars as pl
df = pl.read_csv("/data/employees.csv")

rows = df.head(2).to_dicts()             # list of dicts
arr = df.select("salary", "id").to_numpy()
back = pl.from_dicts(rows)
print(rows[0]["name"], arr.shape, back.shape)
# df.to_pandas() and pl.from_pandas(pdf) need pyarrow, which the browser build lacks
back`, note: 'Outside the browser, <code>df.to_pandas()</code> and <code>pl.from_pandas()</code> convert in one call (install <code>pyarrow</code>).' },
    ] },
  ],
  concepts: [
    { id: 'lazy', title: 'What collect() actually runs', intro: 'A LazyFrame is a plan. The optimizer rewrites it before a single row is read. This is the main reason polars is fast without effort.', explainer: lazyExplainer },
  ],
  compare: [
    { title: 'pandas → polars phrasebook', columns: ['pandas', 'polars'], rows: [
      ['Read CSV', { code: 'pd.read_csv(p)' }, { code: 'pl.read_csv(p)' }],
      ['New column', { code: 'df["r"] = df.q * df.p' }, { code: 'df.with_columns(r=pl.col("q")*pl.col("p"))' }],
      ['Filter rows', { code: 'df[df.q > 2]' }, { code: 'df.filter(pl.col("q") > 2)' }],
      ['Group + sum', { code: 'df.groupby("k")["v"].sum()' }, { code: 'df.group_by("k").agg(pl.col("v").sum())' }],
      ['Per-group broadcast', { code: 'groupby("k")["v"].transform("sum")' }, { code: 'pl.col("v").sum().over("k")' }],
      ['Rename', { code: 'df.rename(columns={"a": "b"})' }, { code: 'df.rename({"a": "b"})' }],
      ['Sort', { code: 'df.sort_values("v", ascending=False)' }, { code: 'df.sort("v", descending=True)' }],
      ['Missing values', { code: 'df.fillna(0)' }, { code: 'df.fill_null(0)' }],
      ['Row count', { code: 'len(df)' }, { code: 'df.height' }],
    ] },
    { title: 'Eager versus lazy', columns: ['DataFrame (eager)', 'LazyFrame'], rows: [
      ['Entry point', { code: 'pl.read_csv' }, { code: 'pl.scan_csv' }],
      ['Runs when', 'immediately, each call', 'at collect()'],
      ['Query optimization', false, true],
      ['Bigger than memory', false, { part: 'streaming' }],
      ['Easy to inspect midway', true, { part: 'collect() a prefix' }],
    ], verdict: 'Explore eagerly, ship lazily. A lazy pipeline that ends in <code>collect()</code> costs nothing extra and gets the optimizer for free.' },
  ],
  gotchas: [
    { title: 'Bare column names are not expressions', bad: `df.with_columns(total=df["q"] * 2)   # works, but eager and slow in lazy mode
df.filter("q" > 2)                    # TypeError`, good: `df.with_columns(total=pl.col("q") * 2)
df.filter(pl.col("q") > 2)`, why: '<code>df["q"]</code> pulls a Series into Python. <code>pl.col("q")</code> is a symbolic reference the engine evaluates, parallelises and optimises.' },
    { title: 'Nothing mutates in place', bad: `df.with_columns(x=pl.lit(1))
print(df.columns)     # no "x"`, good: `df = df.with_columns(x=pl.lit(1))`, why: 'Every method returns a new DataFrame. There is no <code>inplace=</code> and no <code>df["x"] = ...</code> in the idiomatic API.' },
    { title: 'A scalar expression broadcasts', bad: `df.with_columns(s=pl.col("q").sum())
# s is the same total on every row — often what you want, sometimes not`, good: `df.select(pl.col("q").sum())          # one row
df.with_columns(s=pl.col("q").sum().over("k"))   # per group`, why: 'In <code>with_columns</code> a length-1 result is stretched to the frame length. Use <code>select</code> for a summary or <code>over</code> for a per-group value.' },
  ],
  presets: [
    { title: 'Lazy revenue pipeline', code: `import polars as pl

q = (pl.read_csv("/data/orders.csv").lazy()     # pl.scan_csv(path) outside the browser
       .filter(pl.col("status") == "shipped")
       .with_columns(revenue=pl.col("quantity") * pl.col("unit_price") * (1 - pl.col("discount")))
       .group_by("region", "rep")
       .agg(pl.col("revenue").sum().round(2), pl.len().alias("orders"))
       .sort("revenue", descending=True))
print(q.explain())
q.collect().head(8)` },
  ],
};
