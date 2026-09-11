import { scene } from '../../js/explainer.js';

const anatomyExplainer = {
  hold: 2800,
  code: ['fig, ax = plt.subplots()', 'ax.plot(x, y, label="sales")', 'ax.set(title=..., xlabel=..., ylabel=...)', 'ax.legend(); fig.savefig("out.png")'],
  build() {
    const s = scene(760, 330);
    s.rect('fig', 20, 20, 560, 290, 'panel', undefined, 6);
    s.text('figl', 30, 36, 'Figure', 'lbl sm bold ink-2', undefined, 'start');
    s.rect('axes', 90, 60, 440, 200, 'cell', undefined, 2);
    s.text('title', 310, 50, 'Monthly sales', 'lbl bold');
    // ticks + labels
    [0, 1, 2, 3, 4].forEach(i => { s.line(`xt${i}`, 130 + i * 90, 260, 130 + i * 90, 266, 'arrow'); s.text(`xtl${i}`, 130 + i * 90, 278, ['Jan', 'Feb', 'Mar', 'Apr', 'May'][i], 'lbl sm'); });
    [0, 1, 2].forEach(i => { s.line(`yt${i}`, 84, 240 - i * 80, 90, 240 - i * 80, 'arrow'); s.text(`ytl${i}`, 74, 240 - i * 80, String(i * 50), 'lbl sm', undefined, 'end'); });
    s.text('xlabel', 310, 300, 'month', 'lbl sm');
    const yl = s.text('ylabel', 0, 0, 'units', 'lbl sm'); yl.setAttribute('transform', 'translate(44 160) rotate(-90)');
    s.path('line', 'M130 220 L220 170 L310 190 L400 110 L490 90', 'arrow');
    s.reg.get('line').style.markerEnd = 'none';
    s.path('line2', 'M130 235 L220 225 L310 200 L400 190 L490 150', 'arrow');
    s.reg.get('line2').style.markerEnd = 'none'; s.reg.get('line2').style.strokeDasharray = '4 3';
    s.rect('legend', 400, 70, 120, 44, 'cell', undefined, 4);
    s.line('lg1', 408, 84, 428, 84, 'arrow'); s.reg.get('lg1').style.markerEnd = 'none'; s.text('lgt1', 434, 84, 'sales', 'lbl sm', undefined, 'start');
    s.line('lg2', 408, 100, 428, 100, 'arrow'); s.reg.get('lg2').style.markerEnd = 'none'; s.reg.get('lg2').style.strokeDasharray = '4 3'; s.text('lgt2', 434, 100, 'target', 'lbl sm', undefined, 'start');
    // callout on the right
    s.text('c1', 600, 60, '', 'lbl bold', undefined, 'start');
    s.text('c2', 600, 84, '', 'lbl sm ink-2', undefined, 'start');
    s.text('c3', 600, 104, '', 'lbl sm ink-2', undefined, 'start');
    s.text('c4', 600, 124, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The Figure is the canvas', caption: 'One Figure per image file or window. It owns everything else and knows the size in inches and the DPI.', lines: [0],
      patch: { fig: { cls: 'panel hot' }, c1: { text: 'Figure' }, c2: { text: 'figsize=(8, 4)' }, c3: { text: 'dpi=110' }, c4: { text: 'savefig / show' } } },
    { title: 'An Axes is one plot area', caption: 'Confusingly named: an Axes (plural-looking) is the box with data in it. A figure can hold many. Almost every drawing call is a method on it.', lines: [0, 1],
      patch: { fig: { cls: 'panel' }, axes: { cls: 'cell hot' }, c1: { text: 'Axes' }, c2: { text: 'ax.plot / ax.bar / ax.scatter' }, c3: { text: 'ax.set_xlim, ax.grid' }, c4: { text: 'fig.add_subplot adds more' } } },
    { title: 'Each Axes has two Axis objects', caption: 'The x-axis and y-axis carry ticks, tick labels and an axis label. Formatters and locators live here.', lines: [2],
      patch: { axes: { cls: 'cell' }, xt0: { cls: 'arrow hot' }, xt1: { cls: 'arrow hot' }, xt2: { cls: 'arrow hot' }, xt3: { cls: 'arrow hot' }, xt4: { cls: 'arrow hot' }, yt0: { cls: 'arrow hot' }, yt1: { cls: 'arrow hot' }, yt2: { cls: 'arrow hot' }, xlabel: { cls: 'lbl sm bold' }, ylabel: { cls: 'lbl sm bold' },
        c1: { text: 'Axis (x and y)' }, c2: { text: 'ax.set_xlabel("month")' }, c3: { text: 'ax.set_xticks([...])' }, c4: { text: 'ax.xaxis.set_major_formatter' } } },
    { title: 'Everything drawn is an Artist', caption: 'Lines, bars, text, the legend, even the ticks are Artist objects. Methods like plot() return them so you can restyle later.', lines: [1],
      patch: { xt0: { cls: 'arrow' }, xt1: { cls: 'arrow' }, xt2: { cls: 'arrow' }, xt3: { cls: 'arrow' }, xt4: { cls: 'arrow' }, yt0: { cls: 'arrow' }, yt1: { cls: 'arrow' }, yt2: { cls: 'arrow' }, xlabel: { cls: 'lbl sm' }, ylabel: { cls: 'lbl sm' }, line: { cls: 'arrow hot' }, line2: { cls: 'arrow hot' }, title: { cls: 'lbl bold' },
        c1: { text: 'Artists' }, c2: { text: 'line, = ax.plot(...)' }, c3: { text: 'line.set_linewidth(2)' }, c4: { text: 'ax.set_title(...) → Text' } } },
    { title: 'The legend reads labels off artists', caption: 'ax.legend() collects every artist that was given label=. No label, no entry. Then fig.savefig writes the whole figure.', lines: [3],
      patch: { line: { cls: 'arrow' }, line2: { cls: 'arrow' }, legend: { cls: 'cell hot' }, c1: { text: 'Legend' }, c2: { text: 'ax.plot(x, y, label="sales")' }, c3: { text: 'ax.legend(loc="upper left")' }, c4: { text: 'fig.savefig("out.png", dpi=150)' } } },
  ],
};

const HEAD = `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
`;

export default {
  id: 'matplotlib', name: 'matplotlib', glyph: 'plt', group: 'data', version: '3.9', keywords: 'plot chart figure axes bar line scatter histogram visualization',
  tagline: 'The plotting library everything else wraps. Figures, axes, artists.',
  install: 'pip install matplotlib', docs: 'https://matplotlib.org/stable/', packages: ['matplotlib', 'numpy'],
  overview: {
    what: 'matplotlib draws static charts to screens and files. Its object model (Figure holds Axes, Axes hold Artists) is what pandas .plot, seaborn and many others generate underneath, so learning the OO interface lets you fix any of their output. It is verbose by design: every element is reachable.',
    yes: ['Publication-quality static figures with full control.', 'Fixing or extending a plot that pandas or seaborn produced.', 'Multi-panel layouts, annotations, custom ticks.', 'Saving PNG, SVG, PDF from scripts and notebooks.'],
    no: ['Interactive dashboards in the browser (plotly, bokeh, altair).', 'Statistical plots from tidy data with minimal code (seaborn, then drop to matplotlib to tweak).', 'Very large point clouds without datashading.'],
    note: 'Figures in the sandbox render to PNG automatically; there is no window, so <code>plt.show()</code> is a no-op.',
  },
  cheatsheet: [
    { id: 'basics', title: 'Figure, axes, first plot', snippets: [
      { title: 'The pattern to memorise', code: HEAD + `
x = np.arange(1, 13)
y = np.array([12, 15, 14, 18, 22, 25, 28, 27, 24, 20, 17, 15])

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(x, y, marker="o", label="units")
ax.set(title="Monthly units", xlabel="month", ylabel="units")
ax.grid(alpha=.3)
ax.legend()
fig.tight_layout()`, note: 'Always <code>fig, ax = plt.subplots()</code>, then call methods on <code>ax</code>. It scales from one plot to twenty without changing style.' },
      { title: 'Line, bar, scatter, histogram', code: HEAD + `
rng = np.random.default_rng(3)
fig, axs = plt.subplots(2, 2, figsize=(8, 5.5))
axs = axs.ravel()
axs[0].plot(np.cumsum(rng.normal(size=60))); axs[0].set_title("line")
axs[1].bar(["N", "S", "E", "W"], [42, 31, 27, 19], color="#B7791F"); axs[1].set_title("bar")
axs[2].scatter(rng.random(80), rng.random(80), c=rng.random(80), cmap="viridis", s=30); axs[2].set_title("scatter")
axs[3].hist(rng.normal(size=500), bins=25, edgecolor="white"); axs[3].set_title("hist")
fig.tight_layout()` },
    ] },
    { id: 'style', title: 'Labels, ticks, style', snippets: [
      { title: 'Annotate and format', code: HEAD + `
x = np.linspace(0, 2 * np.pi, 200)
fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(x, np.sin(x), lw=2, color="tab:blue", label="sin")
ax.plot(x, np.cos(x), lw=2, ls="--", color="tab:orange", label="cos")
ax.axhline(0, color="gray", lw=.8)
ax.set_xticks([0, np.pi, 2 * np.pi], ["0", "π", "2π"])
ax.annotate("peak", xy=(np.pi / 2, 1), xytext=(2, 1.25), arrowprops=dict(arrowstyle="->"))
ax.set_ylim(-1.5, 1.5)
ax.legend(loc="lower left", frameon=False)
ax.spines[["top", "right"]].set_visible(False)`, note: 'Named colours <code>tab:blue</code> … come from the default cycle. <code>spines</code> are the four box edges.' },
      { title: 'Styles, sizes, saving', code: HEAD + `
plt.style.use("ggplot")           # try "seaborn-v0_8", "bmh", "dark_background"
fig, ax = plt.subplots(figsize=(6, 3), dpi=100)
ax.bar(range(5), [3, 7, 2, 5, 6])
ax.set_title("saved at 150 dpi")
fig.savefig("/tmp/chart.png", dpi=150, bbox_inches="tight")
import os; print(os.path.getsize("/tmp/chart.png"), "bytes written")
plt.style.use("default")`, note: '<code>bbox_inches="tight"</code> trims whitespace and stops labels being cut off.' },
    ] },
    { id: 'pandas', title: 'With pandas', snippets: [
      { title: 'DataFrame.plot returns an Axes', code: HEAD + `import pandas as pd
df = pd.read_csv("/data/orders.csv", parse_dates=["date"])
df["revenue"] = df.quantity * df.unit_price
monthly = df.set_index("date").resample("ME")["revenue"].sum()

ax = monthly.plot(kind="bar", figsize=(7, 3.2), color="#2457B3", width=.8)
ax.set_xticklabels([d.strftime("%b") for d in monthly.index], rotation=0)
ax.set(ylabel="revenue", xlabel="", title="Revenue by month")
ax.figure.tight_layout()`, packages: ['matplotlib', 'pandas', 'numpy'], note: 'Whatever pandas draws, you get the <code>Axes</code> back and can keep styling with matplotlib.' },
      { title: 'Grouped bars by hand', code: HEAD + `import pandas as pd
df = pd.read_csv("/data/orders.csv")
t = pd.crosstab(df.region, df.status)

fig, ax = plt.subplots(figsize=(7, 3.4))
w = 0.26; xs = np.arange(len(t.index))
for i, col in enumerate(t.columns):
    ax.bar(xs + (i - 1) * w, t[col], width=w, label=col)
ax.set_xticks(xs, t.index)
ax.legend(title="status", ncols=3, frameon=False)
ax.set_title("Orders by region and status")`, packages: ['matplotlib', 'pandas', 'numpy'] },
    ] },
  ],
  concepts: [
    { id: 'anatomy', title: 'Anatomy of a figure', intro: 'Figure, Axes, Axis, Artist. Four words that unlock every matplotlib docstring.', explainer: anatomyExplainer },
  ],
  compare: [
    { title: 'pyplot state machine versus the object interface', columns: ['plt.plot(...) style', 'fig, ax = plt.subplots()'], rows: [
      ['Targets', 'the "current" axes, implicitly', 'the axes you name'],
      ['Multiple panels', { part: 'plt.subplot(2,1,1) juggling' }, true],
      ['Safe inside functions', false, true],
      ['Lines of code for one plot', { dots: 5 }, { dots: 4 }],
      ['Reads clearly a year later', { dots: 2 }, { dots: 5 }],
    ], verdict: 'Use pyplot only for <code>plt.subplots</code>, <code>plt.style</code> and <code>plt.show</code>. Draw on <code>ax</code>.' },
    { title: 'Which chart', columns: ['line', 'bar', 'scatter', 'hist', 'box'], rows: [
      ['Change over ordered x', true, { part: 'few points' }, false, false, false],
      ['Compare categories', false, true, false, false, true],
      ['Relationship of two variables', false, false, true, false, false],
      ['Distribution of one variable', false, false, false, true, true],
      ['Many groups side by side', { part: '' }, true, false, false, true],
    ] },
  ],
  gotchas: [
    { title: 'One argument is y, not x', bad: `ax.plot(x)     # plots x against 0..n-1`, good: `ax.plot(x, y)`, why: 'With a single sequence matplotlib treats it as y values and invents the x positions.' },
    { title: 'No label, no legend entry', bad: `ax.plot(x, y)
ax.legend()    # "No artists with labels found" warning`, good: `ax.plot(x, y, label="units")
ax.legend()`, why: 'The legend reads the <code>label</code> of each artist. Set it at draw time or pass explicit handles and labels.' },
    { title: 'Figures pile up in loops', bad: `for chunk in chunks:
    fig, ax = plt.subplots()
    ...
    fig.savefig(path)   # memory keeps growing`, good: `    fig.savefig(path)
    plt.close(fig)`, why: 'pyplot keeps a reference to every figure so <code>plt.show()</code> can find it. Close what you have saved.' },
    { title: 'tight_layout after everything', bad: `fig.tight_layout()
ax.set_title("a long title that now overlaps")`, good: `ax.set_title("...")
fig.tight_layout()   # or plt.subplots(layout="constrained")`, why: 'Layout is computed from the artists present at the time. <code>layout="constrained"</code> keeps it live.' },
  ],
  presets: [
    { title: 'Revenue by month, bar chart', code: HEAD + `import pandas as pd
df = pd.read_csv("/data/orders.csv", parse_dates=["date"])
df["revenue"] = df.quantity * df.unit_price * (1 - df.discount)
monthly = df.set_index("date").resample("ME")["revenue"].sum()
ax = monthly.plot(kind="bar", figsize=(7, 3.2), color="#B7791F", width=.8)
ax.set_xticklabels([d.strftime("%b") for d in monthly.index], rotation=0)
ax.set(title="Revenue by month", xlabel="", ylabel="USD")
ax.figure.tight_layout()`, packages: ['matplotlib', 'pandas', 'numpy'] },
  ],
};
