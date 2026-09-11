import { scene } from '../../js/explainer.js';

const facetExplainer = {
  hold: 3200,
  code: ['g = sns.relplot(data=orders, x="unit_price", y="quantity",', '                hue="status", col="region", kind="scatter")', '# axes-level equivalent, one panel:', 'ax = sns.scatterplot(data=orders, x=..., y=..., hue="status", ax=ax)'],
  build() {
    const s = scene(760, 320);
    // long-form table on the left
    s.text('t-src', 20, 22, 'orders (long form)', 'lbl bold', undefined, 'start');
    s.text('h-k', 50, 46, 'region', 'lbl sm ink-2'); s.text('h-v', 122, 46, 'status', 'lbl sm ink-2');
    const rows = [['North', 'shipped'], ['South', 'returned'], ['East', 'shipped'], ['North', 'returned'], ['South', 'shipped'], ['East', 'shipped']];
    rows.forEach(([r, v], i) => {
      const g = s.g(`row${i}`, 20, 60 + i * 32);
      s.rect(`row${i}.k`, 0, 0, 60, 26, 'cell', g); s.text(`row${i}.kt`, 30, 13, r, 'lbl sm', g);
      s.rect(`row${i}.v`, 64, 0, 76, 26, 'cell', g); s.text(`row${i}.vt`, 102, 13, v, 'lbl sm', g);
    });
    s.arrow('a1', 168, 160, 232, 160, 'arrow hid');
    // the FacetGrid
    s.rect('grid', 240, 40, 360, 250, 'panel hid', undefined, 8);
    s.text('gridl', 248, 52, 'FacetGrid', 'lbl sm bold ink-2', undefined, 'start');
    const regions = ['North', 'South', 'East'];
    regions.forEach((r, j) => {
      s.text(`ttl${j}`, 250 + j * 116 + 52, 70, `region = ${r}`, 'lbl sm bold hid');
      s.cell(`ax${j}`, 250 + j * 116, 82, 104, 160, '', 'cell hid');
    });
    const seen = {};
    rows.forEach(([r, v], i) => {
      const j = regions.indexOf(r); const k = seen[r] = (seen[r] ?? -1) + 1;
      s.circle(`p${i}`, 250 + j * 116 + 28 + k * 44, 118 + k * 46 + (i % 3) * 12, 7, 'cell hid');
    });
    // legend drawn once, outside the axes
    const leg = s.g('leg', 620, 82, 'hid');
    s.rect('leg.r', 0, 0, 120, 72, 'cell ghost', leg);
    s.text('leg.t', 60, 15, 'status', 'lbl sm bold', leg);
    s.circle('leg.c1', 16, 38, 5, 'cell hot', leg); s.text('leg.t1', 28, 38, 'shipped', 'lbl sm', leg, 'start');
    s.circle('leg.c2', 16, 58, 5, 'cell info', leg); s.text('leg.t2', 28, 58, 'returned', 'lbl sm', leg, 'start');
    // notes on the right
    s.text('n0', 620, 190, '', 'lbl bold', undefined, 'start');
    s.text('n1', 620, 212, '', 'lbl sm ink-2', undefined, 'start');
    s.text('n2', 620, 232, '', 'lbl sm ink-2', undefined, 'start');
    s.text('n3', 620, 252, '', 'lbl sm ink-2', undefined, 'start');
    s.text('foot', 240, 306, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Long-form data goes in', caption: 'One row per observation, one column per variable. Every seaborn function reads the same shape and the column names become plot roles: x, y, hue, col, row, size, style.', lines: [0],
      patch: { foot: { text: 'columns → roles: x, y, hue, col' }, n0: { text: 'data=orders' }, n1: { text: 'x="unit_price"' }, n2: { text: 'y="quantity"' } } },
    { title: 'col= splits the rows into facets', caption: 'A figure-level function starts by building a FacetGrid: one Axes per distinct value of col (and row). Nothing is drawn yet; the grid just owns a figure and an array of empty axes.', lines: [1],
      patch: { grid: { cls: 'panel' }, ttl0: { cls: 'lbl sm bold' }, ttl1: { cls: 'lbl sm bold' }, ttl2: { cls: 'lbl sm bold' }, ax0: { cls: '' }, ax1: { cls: '' }, ax2: { cls: '' }, a1: { cls: 'arrow hot' },
        'row0.k': { cls: 'cell hot' }, 'row1.k': { cls: 'cell hot' }, 'row2.k': { cls: 'cell hot' }, 'row3.k': { cls: 'cell hot' }, 'row4.k': { cls: 'cell hot' }, 'row5.k': { cls: 'cell hot' },
        n0: { text: 'FacetGrid' }, n1: { text: 'g.axes.shape == (1, 3)' }, n2: { text: 'height=3, aspect=1 per facet' }, n3: { text: 'col_wrap=2 wraps the row' }, foot: { text: 'relplot → FacetGrid(data, col="region") → 3 empty Axes' } } },
    { title: 'The axes-level function draws each subset', caption: 'For every facet, relplot calls the plain axes-level function (here scatterplot) with that facet\'s slice of the data and ax= set to that panel. Figure-level functions are wrappers, not different renderers.', lines: [1, 3],
      patch: { 'row0.k': { cls: 'cell' }, 'row1.k': { cls: 'cell' }, 'row2.k': { cls: 'cell' }, 'row3.k': { cls: 'cell' }, 'row4.k': { cls: 'cell' }, 'row5.k': { cls: 'cell' }, a1: { cls: 'arrow' },
        p0: { cls: 'cell' }, p1: { cls: 'cell' }, p2: { cls: 'cell' }, p3: { cls: 'cell' }, p4: { cls: 'cell' }, p5: { cls: 'cell' },
        'ax0.r': { cls: 'cell hot' }, 'ax1.r': { cls: 'cell hot' }, 'ax2.r': { cls: 'cell hot' },
        n0: { text: 'per facet:' }, n1: { text: 'sub = orders[region == r]' }, n2: { text: 'scatterplot(sub, ax=axes[r])' }, n3: { text: '' }, foot: { text: 'kind="scatter" | "line" picks the axes-level function' } } },
    { title: 'hue= maps a column to colour, once', caption: 'The status → colour mapping is computed on the whole dataset before splitting, so "shipped" is the same colour in every panel. Because the grid owns the mapping, it draws a single legend outside the axes.', lines: [1],
      patch: { 'ax0.r': { cls: 'cell' }, 'ax1.r': { cls: 'cell' }, 'ax2.r': { cls: 'cell' },
        p0: { cls: 'cell hot' }, p2: { cls: 'cell hot' }, p4: { cls: 'cell hot' }, p5: { cls: 'cell hot' }, p1: { cls: 'cell info' }, p3: { cls: 'cell info' },
        'row0.v': { cls: 'cell hot' }, 'row2.v': { cls: 'cell hot' }, 'row4.v': { cls: 'cell hot' }, 'row5.v': { cls: 'cell hot' }, 'row1.v': { cls: 'cell info' }, 'row3.v': { cls: 'cell info' },
        leg: { cls: '' }, n0: { text: 'shared semantics' }, n1: { text: 'hue, size, style' }, n2: { text: 'palette="deep"' }, n3: { text: 'legend drawn by the grid' }, foot: { text: 'one mapping for all facets → one legend, outside' } } },
    { title: 'You get a FacetGrid back, not an Axes', caption: 'g.figure is the matplotlib Figure, g.axes the array of Axes. Size is set per facet with height and aspect; figsize and ax= are not accepted because the function creates its own figure.', lines: [0, 1],
      patch: { 'row0.v': { cls: 'cell' }, 'row1.v': { cls: 'cell' }, 'row2.v': { cls: 'cell' }, 'row3.v': { cls: 'cell' }, 'row4.v': { cls: 'cell' }, 'row5.v': { cls: 'cell' }, grid: { cls: 'panel hot' },
        n0: { text: 'g: FacetGrid' }, n1: { text: 'g.set_titles("{col_name}")' }, n2: { text: 'g.set_axis_labels(...)' }, n3: { text: 'g.figure.savefig(...)' }, foot: { text: 'no ax=, no figsize=; use height= and aspect=' } } },
    { title: 'Axes-level: one panel, your Axes', caption: 'scatterplot draws into whatever Axes you hand it (or the current one) and returns it. The legend goes inside that Axes, and you can stack other plots on the same panel. Facets are your job with plt.subplots.', lines: [3],
      patch: { grid: { cls: 'panel dim' }, ttl1: { cls: 'lbl sm bold dim' }, ttl2: { cls: 'lbl sm bold dim' }, ax1: { cls: 'dim' }, ax2: { cls: 'dim' }, p1: { add: 'dim' }, p2: { add: 'dim' }, p4: { add: 'dim' }, p5: { add: 'dim' },
        ttl0: { text: 'ax (from plt.subplots)' }, 'ax0.r': { cls: 'cell hot' }, leg: { cls: '', x: 256, y: 90 }, 'leg.r': { cls: 'cell' },
        n0: { text: 'ax: Axes' }, n1: { text: 'sns.scatterplot(..., ax=ax)' }, n2: { text: 'ax.set(title=...)' }, n3: { text: 'legend inside the axes' }, foot: { text: 'axes-level = draws on an Axes and returns it' } } },
  ],
};

const HEAD = `import matplotlib
matplotlib.use("Agg")
import seaborn as sns
import pandas as pd
`;
const ORDERS = `orders = pd.read_csv("/data/orders.csv", parse_dates=["date"])
orders["revenue"] = orders.quantity * orders.unit_price * (1 - orders.discount)
`;

export default {
  id: 'seaborn', name: 'seaborn', glyph: 'sns', group: 'data', version: '0.13', keywords: 'statistical plot histogram scatter facet hue heatmap pairplot boxplot',
  tagline: 'Statistical charts from tidy DataFrames, drawn with matplotlib.',
  install: 'pip install seaborn', docs: 'https://seaborn.pydata.org/', packages: ['pip:seaborn', 'matplotlib', 'pandas', 'numpy'], runnable: true,
  overview: {
    what: 'seaborn maps the columns of a long-form DataFrame onto plot roles (x, y, hue, size, style, col, row) and does the statistics for you: binning, kernel densities, bootstrapped confidence bands, per-group estimates. Every plot is ordinary matplotlib underneath, so you can finish it with the matplotlib API you already know.',
    yes: ['Exploring a tidy DataFrame: distributions, relationships, group comparisons.', 'Small multiples from a categorical column with one keyword (col=, row=).', 'Error bars and confidence bands you would otherwise compute by hand.', 'A consistent, decent-looking theme with one call.'],
    no: ['Interactive charts in the browser (plotly, altair, bokeh).', 'Charts that are not statistical: pie charts, gantt, maps, custom shapes (plain matplotlib).', 'Data that is wide and must stay wide; seaborn wants one column per variable (melt first).', 'Very large point clouds where you need datashading.'],
    note: 'Figures render to PNG automatically in the sandbox. <code>sns.load_dataset(...)</code> downloads from GitHub and is blocked here; the snippets use <code>/data/orders.csv</code> and <code>/data/employees.csv</code> instead. The first run installs seaborn from PyPI (about 15 s).',
  },
  cheatsheet: [
    { id: 'first', title: 'Theme and first plot', blurb: 'One call for the look, then a function per chart type. Each returns a matplotlib Axes.', snippets: [
      { title: 'set_theme, then a histogram', code: HEAD + `
sns.set_theme(style="whitegrid")        # fonts, grid, palette in one call
` + ORDERS + `
ax = sns.histplot(data=orders, x="revenue", bins=20, kde=True)
ax.set(title="Order revenue", xlabel="revenue (USD)")
print(type(ax).__name__)   # a plain matplotlib Axes`, note: '<code>set_theme()</code> changes matplotlib\'s global rcParams, so it also restyles plots made with pandas or matplotlib afterwards. Styles: <code>darkgrid</code>, <code>whitegrid</code>, <code>dark</code>, <code>white</code>, <code>ticks</code>.' },
      { title: 'Long-form data is the input', code: HEAD + `
emp = pd.read_csv("/data/employees.csv")
print(emp[["name", "team", "salary"]].head(3))   # one row per person, one column per variable

ax = sns.barplot(data=emp, x="team", y="salary", errorbar=None)
ax.set(title="Mean salary by team", ylabel="salary (USD)")
ax.figure.tight_layout()`, note: 'Column names go to <code>x</code>, <code>y</code>, <code>hue</code>. If you pass a wide frame with no <code>x</code>/<code>y</code>, seaborn plots every numeric column as its own series, which is rarely what you want; <code>df.melt()</code> first.' },
    ] },
    { id: 'relational', title: 'Relationships', blurb: 'scatterplot and lineplot, plus the semantic mappings hue, size and style.', snippets: [
      { title: 'scatterplot with hue, size and style', code: HEAD + `
sns.set_theme(style="ticks")
orders = pd.read_csv("/data/orders.csv")

ax = sns.scatterplot(data=orders, x="unit_price", y="quantity",
                     hue="region", size="discount", style="status",
                     sizes=(20, 160), alpha=.7)
sns.move_legend(ax, "upper left", bbox_to_anchor=(1, 1))   # legend outside the axes
ax.set(title="Price vs quantity", xlabel="unit price")
ax.figure.tight_layout()`, note: 'Every mapping gets its own legend section. <code>sns.move_legend</code> repositions it without redrawing.' },
      { title: 'lineplot aggregates for you', code: HEAD + ORDERS + `orders["month"] = orders.date.dt.to_period("M").dt.to_timestamp()

ax = sns.lineplot(data=orders, x="month", y="revenue", hue="region",
                  estimator="sum", errorbar=None, marker="o")
ax.set(title="Monthly revenue by region", ylabel="revenue (USD)", xlabel="")
ax.tick_params(axis="x", rotation=45)
ax.figure.tight_layout()`, note: 'With several rows per x value the default is <code>estimator="mean"</code> plus a 95% bootstrapped confidence band. <code>errorbar="sd"</code> is much faster; <code>errorbar=None</code> drops the band.' },
      { title: 'regplot fits a line', code: HEAD + `
orders = pd.read_csv("/data/orders.csv")
ax = sns.regplot(data=orders, x="unit_price", y="quantity", ci=None,
                 x_jitter=2, scatter_kws={"alpha": .35, "s": 18}, line_kws={"color": "C3"})
ax.set(title="Linear fit, no confidence band")
ax.figure.tight_layout()`, note: '<code>ci=None</code> skips the bootstrap. <code>order=2</code> fits a polynomial, <code>logistic=True</code> a logit (needs statsmodels). <code>lmplot</code> is the figure-level version with facets.' },
    ] },
    { id: 'distributions', title: 'Distributions', snippets: [
      { title: 'histplot and kdeplot by group', code: HEAD + `import matplotlib.pyplot as plt
` + ORDERS + `
fig, axs = plt.subplots(1, 2, figsize=(9, 3.4))
sns.histplot(data=orders, x="revenue", hue="status", multiple="stack", bins=20, ax=axs[0])
sns.kdeplot(data=orders, x="revenue", hue="region", fill=True, common_norm=False, alpha=.3, ax=axs[1])
axs[0].set_title("stacked counts"); axs[1].set_title("density per region")
fig.tight_layout()`, note: '<code>multiple</code>: <code>layer</code> (default), <code>stack</code>, <code>dodge</code>, <code>fill</code>. <code>common_norm=False</code> normalises each group\'s density on its own, so a small group is not squashed.' },
      { title: 'box, violin and the raw points', code: HEAD + `import matplotlib.pyplot as plt
` + ORDERS + `
fig, axs = plt.subplots(1, 2, figsize=(9, 3.4), sharey=True)
sns.boxplot(data=orders, x="region", y="revenue", hue="status", ax=axs[0])
sns.violinplot(data=orders, x="region", y="revenue", inner="quart", cut=0, color=".85", ax=axs[1])
sns.stripplot(data=orders, x="region", y="revenue", color=".25", size=2.5, alpha=.5, ax=axs[1])
axs[0].legend(loc="upper right", fontsize=8)
fig.tight_layout()`, note: 'Layering works because every axes-level call draws on the same <code>ax</code>. <code>cut=0</code> stops the violin extending past the data.' },
    ] },
    { id: 'categorical', title: 'Categorical estimates', snippets: [
      { title: 'barplot with an estimator and labels', code: HEAD + ORDERS + `
ax = sns.barplot(data=orders, x="region", y="revenue", hue="status",
                 estimator="sum", errorbar=None,
                 order=["North", "South", "East", "West"])
for bars in ax.containers:                       # one container per hue level
    ax.bar_label(bars, fmt="%.0f", fontsize=7, padding=2)
ax.set(title="Revenue by region and status", ylabel="revenue (USD)")
ax.figure.tight_layout()`, note: 'The default estimator is the mean with a bootstrapped 95% CI. <code>order</code> and <code>hue_order</code> pin category order; otherwise it is first-seen order.' },
      { title: 'countplot and pointplot', code: HEAD + `import matplotlib.pyplot as plt
orders = pd.read_csv("/data/orders.csv")

fig, axs = plt.subplots(1, 2, figsize=(9, 3.4))
sns.countplot(data=orders, x="rep", hue="status", ax=axs[0])
sns.pointplot(data=orders, x="region", y="quantity", hue="status",
              errorbar="se", dodge=.3, capsize=.1, ax=axs[1])
axs[0].set_title("orders per rep"); axs[1].set_title("mean quantity ± s.e.")
fig.tight_layout()`, note: '<code>countplot</code> needs only <code>x</code>; it counts rows. <code>pointplot</code> is a barplot drawn as points and lines, better for comparing hue levels across categories.' },
    ] },
    { id: 'facets', title: 'Figure-level functions and facets', blurb: 'relplot, displot and catplot build a FacetGrid, then call the axes-level function once per panel.', snippets: [
      { title: 'relplot with col= and col_wrap', code: HEAD + `
orders = pd.read_csv("/data/orders.csv")
g = sns.relplot(data=orders, x="unit_price", y="quantity", hue="status",
                col="region", col_wrap=2, kind="scatter", height=2.6, aspect=1.3)
g.set_titles("{col_name}")
g.set_axis_labels("unit price", "quantity")
print(type(g).__name__, g.axes.shape)   # FacetGrid, not Axes`, note: 'Size is per facet: <code>height</code> in inches and <code>aspect</code> = width/height. There is no <code>figsize</code> and no <code>ax=</code>.' },
      { title: 'catplot and displot switch kind', code: HEAD + ORDERS + `
g = sns.catplot(data=orders, x="status", y="revenue", col="region",
                kind="box", height=2.6, aspect=.9)
g.set_titles("{col_name}")

g2 = sns.displot(data=orders, x="revenue", col="status", kind="kde",
                 fill=True, common_norm=False, height=2.6, aspect=1.2)
g2.set_axis_labels("revenue (USD)", "density")
g2.figure.suptitle("kind switches the axes-level function", y=1.04)
g2.figure.tight_layout()`, note: 'catplot kinds: <code>strip</code> (default), <code>swarm</code>, <code>box</code>, <code>violin</code>, <code>boxen</code>, <code>point</code>, <code>bar</code>, <code>count</code>. displot kinds: <code>hist</code>, <code>kde</code>, <code>ecdf</code>.' },
      { title: 'FacetGrid.map_dataframe for anything else', code: HEAD + `
orders = pd.read_csv("/data/orders.csv")
g = sns.FacetGrid(orders, col="region", hue="status", height=2.6, aspect=1.1)
g.map_dataframe(sns.scatterplot, x="unit_price", y="quantity", alpha=.7)
g.map_dataframe(sns.rugplot, x="unit_price", height=.05)
g.add_legend()
g.set_axis_labels("unit price", "quantity")
g.figure.tight_layout()`, note: '<code>map_dataframe</code> passes each facet\'s slice as <code>data=</code>, so any function with the seaborn signature (or your own <code>def f(data, **kws)</code>) works.' },
    ] },
    { id: 'matrix', title: 'Matrices and pairs', snippets: [
      { title: 'heatmap from a pivot table', code: HEAD + ORDERS + `
pivot = orders.pivot_table(values="revenue", index="region", columns="status",
                           aggfunc="sum", fill_value=0)
ax = sns.heatmap(pivot, annot=True, fmt=".0f", cmap="Blues", linewidths=.5,
                 cbar_kws={"label": "revenue (USD)"})
ax.set(title="Revenue by region and status", xlabel="", ylabel="")
ax.figure.tight_layout()`, note: 'heatmap wants a rectangular (wide) frame: row labels as the index, column labels as columns. Build it with <code>pivot_table</code> or <code>df.corr()</code>.' },
      { title: 'pairplot for every numeric pair', code: HEAD + ORDERS + `
sub = orders[["quantity", "unit_price", "discount", "revenue", "region"]]
g = sns.pairplot(sub, hue="region", corner=True, height=1.8,
                 plot_kws={"s": 12, "alpha": .6})
g.figure.suptitle("pairwise relationships", y=1.02)
print(g.axes.shape)`, note: '<code>corner=True</code> drops the mirrored upper triangle. For full control build a <code>PairGrid</code> and <code>map_upper</code>/<code>map_lower</code>/<code>map_diag</code>.' },
    ] },
    { id: 'style', title: 'Palettes, style and the matplotlib handoff', snippets: [
      { title: 'Palettes, temporary styles, despine, save', code: HEAD + `import matplotlib.pyplot as plt
orders = pd.read_csv("/data/orders.csv")

print(sns.color_palette("deep").as_hex()[:4])          # the default palette
sns.set_theme(style="ticks", palette="colorblind")
with sns.axes_style("darkgrid"):                       # style only inside the block
    ax = sns.countplot(data=orders, x="region", hue="region", palette="viridis", legend=False)
sns.despine(ax=ax)                                     # drop the top and right spines
ax.axhline(orders.region.value_counts().mean(), ls="--", color=".4")   # plain matplotlib from here
ax.annotate("mean", xy=(3.4, orders.region.value_counts().mean()), fontsize=8)
ax.figure.savefig("/tmp/regions.png", dpi=150, bbox_inches="tight")
ax.figure.tight_layout()`, note: 'Named palettes: <code>deep</code>, <code>muted</code>, <code>pastel</code>, <code>colorblind</code>, any matplotlib colormap (<code>viridis</code>), or <code>husl</code>/<code>hls</code>. A palette only applies to a plot with <code>hue</code>; for a single categorical colouring set <code>hue=x</code> and <code>legend=False</code>.' },
    ] },
  ],
  concepts: [
    { id: 'facets', title: 'Figure-level vs axes-level, and how hue/col become a FacetGrid', intro: 'seaborn has two kinds of function. Axes-level ones (<code>scatterplot</code>, <code>histplot</code>, <code>boxplot</code>) draw on one Axes. Figure-level ones (<code>relplot</code>, <code>displot</code>, <code>catplot</code>) build a grid of Axes from <code>col</code>/<code>row</code>, then call the axes-level function on each panel. Watch one <code>relplot</code> call unfold.', explainer: facetExplainer },
  ],
  compare: [
    { title: 'Figure-level or axes-level?', columns: ['relplot / displot / catplot', 'scatterplot / histplot / boxplot …'], rows: [
      ['Returns', 'FacetGrid (g.figure, g.axes)', 'matplotlib Axes'],
      ['Facets from col= / row=', true, false],
      ['Draw into an existing Axes (ax=)', false, true],
      ['Size control', 'height, aspect (per facet)', 'plt.subplots(figsize=...)'],
      ['Legend', 'outside the axes, drawn once', 'inside the axes'],
      ['Layer several plots on one panel', { part: 'via g.map_dataframe' }, true],
      ['Switch chart type', 'kind="line" / "kde" / "violin"', 'call a different function'],
    ], verdict: 'Start figure-level while exploring: facets and legends are free. Switch to axes-level the moment you need to compose a figure by hand with <code>plt.subplots</code>.' },
    { title: 'Showing a distribution', columns: ['histplot', 'kdeplot', 'ecdfplot', 'boxplot', 'violinplot'], rows: [
      ['Shows', 'binned counts', 'smoothed density', 'cumulative share', 'quartiles + outliers', 'density per category'],
      ['Needs a bin/bandwidth choice', true, true, false, false, true],
      ['Compares many groups side by side', { dots: 2 }, { dots: 3 }, { dots: 3 }, { dots: 5 }, { dots: 4 }],
      ['Shows multimodality', { dots: 4 }, { dots: 5 }, { dots: 2 }, { dots: 1 }, { dots: 4 }],
      ['Honest with tiny samples', { dots: 3 }, { dots: 2 }, { dots: 5 }, { dots: 3 }, { dots: 1 }],
    ], note: 'Ratings are judgement calls, not measurements.', verdict: '<code>ecdfplot</code> when you must not lie about small samples, <code>histplot</code> by default, box or violin to compare many categories, and a <code>stripplot</code> layered on top when n is small.' },
  ],
  gotchas: [
    { title: 'figsize is not a figure-level argument', bad: `sns.relplot(data=df, x="a", y="b", col="c", figsize=(10, 4))
# TypeError: unexpected keyword argument 'figsize'`, good: `sns.relplot(data=df, x="a", y="b", col="c", height=3, aspect=1.4)
# or after the fact: g.figure.set_size_inches(10, 4)`, why: 'Figure-level functions create their own figure and size it per facet: <code>height</code> inches tall, <code>aspect</code> times that wide.' },
    { title: 'ax= is ignored by figure-level functions', bad: `fig, ax = plt.subplots()
sns.catplot(data=df, x="a", y="b", kind="box", ax=ax)
# UserWarning: catplot is a figure-level function and does not accept target axes`, good: `fig, ax = plt.subplots()
sns.boxplot(data=df, x="a", y="b", ax=ax)`, why: 'Only axes-level functions draw into an Axes you own. For a panel inside your own layout, use the axes-level name (<code>boxplot</code>, <code>scatterplot</code>, <code>histplot</code>).' },
    { title: 'Wide data plots every column', bad: `wide = df.pivot(index="month", columns="region", values="revenue")
sns.lineplot(data=wide)   # one line per column, legend of column names,
                          # no way to add hue or facets`, good: `long = wide.reset_index().melt(id_vars="month", var_name="region", value_name="revenue")
sns.lineplot(data=long, x="month", y="revenue", hue="region")`, why: 'seaborn\'s wide-form mode is a convenience for quick looks. All the semantic mappings (<code>hue</code>, <code>size</code>, <code>col</code>) need a long frame where the grouping is a column, not a header.' },
    { title: 'palette= without hue= is deprecated', bad: `sns.barplot(data=df, x="region", y="revenue", palette="viridis")
# FutureWarning: Passing palette without assigning hue is deprecated`, good: `sns.barplot(data=df, x="region", y="revenue", hue="region", palette="viridis", legend=False)`, why: 'Since 0.13 colour is always a mapping from a variable. Assign the same column to <code>hue</code> and hide the redundant legend; a single <code>color=</code> still works for one colour.' },
  ],
  presets: [
    { title: 'Monthly revenue, faceted by status', code: HEAD + ORDERS + `orders["month"] = orders.date.dt.to_period("M").dt.to_timestamp()
sns.set_theme(style="whitegrid")

g = sns.relplot(data=orders, x="month", y="revenue", hue="region", col="status",
                kind="line", estimator="sum", errorbar=None, marker="o",
                height=3, aspect=1.2, facet_kws={"sharey": False})
g.set_titles("{col_name}").set_axis_labels("", "revenue (USD)")
g.tick_params(axis="x", rotation=45)
g.figure.tight_layout()` },
  ],
};
