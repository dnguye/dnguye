import { scene } from '../../js/explainer.js';

const treeExplainer = {
  hold: 3200,
  code: ['fig = px.scatter(df, x="unit_price", y="quantity", color="region")', 'fig.update_traces(marker_size=12, selector=dict(name="North"))', 'fig.update_layout(xaxis_title="unit price", template="plotly_white")', 'fig.add_trace(go.Scatter(...)); fig.to_json()'],
  build() {
    const s = scene(760, 330);
    s.cell('fig', 20, 150, 110, 36, 'Figure', 'cell hid');
    s.cell('data', 170, 70, 120, 36, 'data: [ … ]', 'cell hid');
    s.cell('layout', 170, 230, 120, 36, 'layout: { … }', 'cell hid');
    s.arrow('f-d', 132, 162, 166, 96, 'arrow hid'); s.arrow('f-l', 132, 174, 166, 240, 'arrow hid');
    const traces = ['0: scatter "North"', '1: scatter "South"', '2: scatter "East"'];
    traces.forEach((t, i) => { s.cell(`tr${i}`, 330, 30 + i * 42, 160, 30, t, 'cell hid'); s.arrow(`d-t${i}`, 292, 88, 326, 45 + i * 42, 'arrow hid'); });
    const lay = ['title', 'xaxis / yaxis', 'legend', 'template'];
    lay.forEach((t, i) => { s.cell(`ly${i}`, 330, 178 + i * 36, 160, 28, t, 'cell hid'); s.arrow(`l-y${i}`, 292, 248, 326, 192 + i * 36, 'arrow hid'); });
    // property inspector on the right
    const pr = s.g('pr', 520, 24, 'hid');
    s.rect('pr.r', 0, 0, 220, 150, 'cell ghost', pr);
    s.text('pr.h', 10, 16, '', 'lbl sm bold', pr, 'start');
    [0, 1, 2, 3, 4].forEach(i => s.text(`pr.l${i}`, 10, 40 + i * 22, '', 'lbl sm ink-2', pr, 'start'));
    s.text('n0', 520, 200, '', 'lbl bold', undefined, 'start');
    s.text('n1', 520, 222, '', 'lbl sm ink-2', undefined, 'start');
    s.text('n2', 520, 242, '', 'lbl sm ink-2', undefined, 'start');
    s.text('n3', 520, 262, '', 'lbl sm ink-2', undefined, 'start');
    s.text('foot', 20, 314, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'A Figure is a tree of two branches', caption: 'px.scatter returns a go.Figure: a validated Python object that mirrors a JSON document with exactly two top-level keys, data (a list of traces) and layout (everything else). Nothing is drawn until plotly.js reads that document.', lines: [0],
      patch: { fig: { cls: '' }, data: { cls: '' }, layout: { cls: '' }, 'f-d': { cls: 'arrow' }, 'f-l': { cls: 'arrow' }, 'fig.r': { cls: 'cell hot' },
        n0: { text: 'go.Figure' }, n1: { text: 'fig.data   → tuple of traces' }, n2: { text: 'fig.layout → go.Layout' }, n3: { text: 'fig.to_dict() shows both' }, foot: { text: 'px builds the same object you would build by hand with graph_objects' } } },
    { title: 'data[]: one trace per colour group', caption: 'color="region" makes px split the frame by region and append one scatter trace per level. Each trace carries its own x, y arrays, a name (used by the legend) and marker style. That is why the legend and the colours come for free.', lines: [0],
      patch: { 'fig.r': { cls: 'cell' }, 'data.r': { cls: 'cell hot' }, tr0: { cls: '' }, tr1: { cls: '' }, tr2: { cls: '' }, 'd-t0': { cls: 'arrow hot' }, 'd-t1': { cls: 'arrow hot' }, 'd-t2': { cls: 'arrow hot' },
        pr: { cls: '' }, 'pr.h': { text: 'fig.data[0]' }, 'pr.l0': { text: 'type: "scatter", mode: "markers"' }, 'pr.l1': { text: 'x: [79, 129, …]  y: [1, 5, …]' }, 'pr.l2': { text: 'name: "North", legendgroup: "North"' }, 'pr.l3': { text: 'marker: {color: "#636efa", size: 6}' }, 'pr.l4': { text: 'hovertemplate: "region=North<br>…"' },
        n0: { text: 'trace = one series' }, n1: { text: 'go.Scatter, go.Bar, go.Heatmap …' }, n2: { text: 'facet_col adds xaxis2, yaxis2 …' }, n3: { text: 'and points traces at them' }, foot: { text: 'color= splits rows into traces; a numeric color column gives ONE trace with a colour scale instead' } } },
    { title: 'layout: everything that is not data', caption: 'Titles, axes (range, type, tick format), the legend, margins, annotations and shapes, and the template that supplies defaults. Axes are objects too: xaxis, xaxis2 and so on, each with its own domain when there are subplots.', lines: [0],
      patch: { 'data.r': { cls: 'cell' }, 'd-t0': { cls: 'arrow' }, 'd-t1': { cls: 'arrow' }, 'd-t2': { cls: 'arrow' }, 'layout.r': { cls: 'cell hot' }, ly0: { cls: '' }, ly1: { cls: '' }, ly2: { cls: '' }, ly3: { cls: '' }, 'l-y0': { cls: 'arrow hot' }, 'l-y1': { cls: 'arrow hot' }, 'l-y2': { cls: 'arrow hot' }, 'l-y3': { cls: 'arrow hot' },
        'pr.h': { text: 'fig.layout' }, 'pr.l0': { text: 'title: {text: ""}' }, 'pr.l1': { text: 'xaxis: {title: {text: "unit_price"}}' }, 'pr.l2': { text: 'legend: {title: {text: "region"}}' }, 'pr.l3': { text: 'template: {…}   ← "plotly"' }, 'pr.l4': { text: 'margin, height, hovermode …' },
        n0: { text: 'nested objects' }, n1: { text: 'fig.layout.xaxis.title.text' }, n2: { text: 'fig.layout.xaxis2 (subplots)' }, n3: { text: 'annotations: [ ], shapes: [ ]' }, foot: { text: 'the template is a layout + per-trace-type defaults merged underneath yours' } } },
    { title: 'update_traces walks data[]', caption: 'update_traces applies the same property change to every trace, or to the ones that match selector=. Magic underscores flatten the path: marker_size=12 means trace.marker.size = 12. Existing properties are merged, not replaced.', lines: [1],
      patch: { 'layout.r': { cls: 'cell' }, 'l-y0': { cls: 'arrow' }, 'l-y1': { cls: 'arrow' }, 'l-y2': { cls: 'arrow' }, 'l-y3': { cls: 'arrow' }, 'tr0.r': { cls: 'cell hot' }, 'tr1.r': { cls: 'cell ghost' }, 'tr2.r': { cls: 'cell ghost' },
        'pr.h': { text: 'fig.data[0]  (selector matched)' }, 'pr.l0': { text: 'marker.size: 6 → 12' }, 'pr.l1': { text: 'marker.color unchanged' }, 'pr.l2': { text: '' }, 'pr.l3': { text: 'data[1], data[2]: untouched' }, 'pr.l4': { text: 'no selector → all three change' },
        n0: { text: 'selector=' }, n1: { text: 'dict(type="bar")' }, n2: { text: 'dict(name="North")' }, n3: { text: 'a function trace → bool' }, foot: { text: 'update_xaxes / update_yaxes do the same walk over layout.xaxis, xaxis2, …' } } },
    { title: 'update_layout merges into layout', caption: 'update_layout(xaxis_title="unit price") reaches into layout.xaxis.title.text and sets only that. Assigning fig.layout.xaxis = {...} instead replaces the whole axis object and drops what was there.', lines: [2],
      patch: { 'tr0.r': { cls: 'cell' }, 'tr1.r': { cls: 'cell' }, 'tr2.r': { cls: 'cell' }, 'ly1.r': { cls: 'cell hot' }, 'ly3.r': { cls: 'cell hot' },
        'pr.h': { text: 'fig.layout after update_layout' }, 'pr.l0': { text: 'xaxis.title.text: "unit price"' }, 'pr.l1': { text: 'xaxis.range: still whatever it was' }, 'pr.l2': { text: 'template: "plotly_white"' }, 'pr.l3': { text: '' }, 'pr.l4': { text: 'magic underscore = nested path' },
        n0: { text: 'merge, not replace' }, n1: { text: 'update_layout(xaxis_title=…)' }, n2: { text: 'fig.layout.xaxis.title.text = …' }, n3: { text: 'fig.layout.xaxis = {…}  replaces' }, foot: { text: 'update_* calls return fig, so they chain' } } },
    { title: 'add_trace appends; to_json is the whole tree', caption: 'add_trace pushes another trace onto data[] (optionally at a subplot row/col). to_json serialises data and layout; write_html wraps that JSON with plotly.js; fig.show() hands the same JSON to a renderer. The browser rebuilds the picture from the document every time.', lines: [3],
      patch: { 'ly1.r': { cls: 'cell' }, 'ly3.r': { cls: 'cell' }, 'fig.r': { cls: 'cell ok' }, 'data.r': { cls: 'cell ok' }, 'layout.r': { cls: 'cell ok' }, 'tr0.r': { cls: 'cell ok' }, 'tr1.r': { cls: 'cell ok' }, 'tr2.r': { cls: 'cell ok' },
        'pr.h': { text: 'fig.to_json()' }, 'pr.l0': { text: '{"data": [{"type": "scatter", …},' }, 'pr.l1': { text: '          {…}, {…}, {"type": "scatter"…}],' }, 'pr.l2': { text: ' "layout": {"xaxis": {…}, "template": {…}}}' }, 'pr.l3': { text: '' }, 'pr.l4': { text: 'numpy arrays → JSON lists' },
        n0: { text: 'outputs' }, n1: { text: 'write_html(include_plotlyjs="cdn")' }, n2: { text: 'to_json() / to_dict()' }, n3: { text: 'write_image() needs kaleido' }, foot: { text: 'in the sandbox the last expression\'s to_json() is handed to plotly.js and drawn' } } },
  ],
};

const ORDERS = `import pandas as pd
orders = pd.read_csv("/data/orders.csv", parse_dates=["date"])
orders["revenue"] = orders.quantity * orders.unit_price * (1 - orders.discount)
`;

export default {
  id: 'plotly', name: 'plotly', glyph: 'px', group: 'data', version: '6.1', keywords: 'interactive chart express graph_objects subplots hover dashboard html',
  tagline: 'Interactive charts as a JSON figure, rendered by plotly.js.',
  install: 'pip install plotly', docs: 'https://plotly.com/python/', packages: ['pip:plotly', 'narwhals', 'pandas'], runnable: true,
  overview: {
    what: 'plotly builds a figure as a JSON-like tree (a list of traces plus a layout) and hands it to plotly.js to draw in a browser: hover tooltips, zoom, pan, legend toggling and export come free. plotly.express turns a DataFrame into that tree in one call; graph_objects lets you build or edit any part of the tree by hand. The same figure object drives notebooks, Dash apps, standalone HTML files and static images.',
    yes: ['Charts people will hover over, zoom into, or toggle series on: notebooks, reports, dashboards (Dash).', 'A DataFrame with a colour/facet column and you want the chart in one line.', 'Maps, 3-D, sunburst, treemap, sankey, animations.', 'Sharing a self-contained HTML file.'],
    no: ['Print or paper figures with fine typographic control (matplotlib).', 'Millions of points without WebGL (use scattergl, or datashader).', 'Statistical fits and CI bands built in (seaborn).', 'An environment with no browser at all: static export needs kaleido.'],
    note: 'In the sandbox a figure renders when it is the <strong>last expression</strong> of the snippet: end with <code>fig</code>, not <code>fig.show()</code>. <code>write_html</code> and <code>to_json</code> work here; <code>write_image</code> needs kaleido and a browser engine, so it is copy-only.',
  },
  cheatsheet: [
    { id: 'express', title: 'plotly.express: a chart from a DataFrame', blurb: 'Column names become roles: x, y, color, size, symbol, facet_col, hover_data.', snippets: [
      { title: 'Bar chart with color and hover_data', code: ORDERS + `import plotly.express as px

by_region = (orders.groupby(["region", "status"], as_index=False)
             .agg(revenue=("revenue", "sum"), orders=("order_id", "count")))
fig = px.bar(by_region, x="region", y="revenue", color="status",
             hover_data={"orders": True, "revenue": ":.0f"},
             text_auto=".2s", title="Revenue by region")
fig                        # last expression → rendered`, note: 'Bars with the same x are <em>stacked</em> by default; <code>barmode="group"</code> puts them side by side. <code>text_auto</code> formats a label on each bar with a d3 format string.' },
      { title: 'Scatter with size, symbol and a trendline-free layout', code: ORDERS + `import plotly.express as px

fig = px.scatter(orders, x="unit_price", y="quantity", color="region", symbol="status",
                 size="revenue", size_max=18, opacity=.75,
                 hover_name="rep", hover_data=["order_id", "date"],
                 labels={"unit_price": "unit price (USD)"}, height=420)
fig.update_layout(legend_title_text="region / status")
fig`, note: '<code>labels</code> renames axis titles, legend titles and hover labels in one place. <code>trendline="ols"</code> adds a fit but needs statsmodels.' },
      { title: 'Line over time', code: ORDERS + `import plotly.express as px

monthly = (orders.assign(month=orders.date.dt.to_period("M").dt.to_timestamp())
           .groupby(["month", "region"], as_index=False)["revenue"].sum())
fig = px.line(monthly, x="month", y="revenue", color="region", markers=True,
              title="Monthly revenue", line_shape="spline")
fig.update_xaxes(dtick="M1", tickformat="%b\\n%Y")
fig.update_yaxes(tickprefix="$", separatethousands=True)
fig`, note: 'Sort by x before <code>px.line</code>; it connects points in row order. Datetime columns get a date axis with range slider support (<code>fig.update_xaxes(rangeslider_visible=True)</code>).' },
    ] },
    { id: 'express-more', title: 'Distributions, facets, hierarchies', snippets: [
      { title: 'Histogram and box, faceted', code: ORDERS + `import plotly.express as px

fig = px.histogram(orders, x="revenue", color="status", nbins=20, barmode="overlay",
                   facet_col="region", facet_col_wrap=2, opacity=.7, height=480,
                   marginal="box", title="Revenue distribution per region")
fig.for_each_annotation(lambda a: a.update(text=a.text.split("=")[-1]))   # "region=North" → "North"
fig`, note: '<code>marginal</code> adds a box/violin/rug strip above each facet. Facet titles are annotations; edit them with <code>for_each_annotation</code>.' },
      { title: 'Sunburst and treemap from a path', code: ORDERS + `import plotly.express as px
products = pd.read_json("/data/products.json")
joined = orders.merge(products, left_on="product_id", right_on="id")

fig = px.sunburst(joined, path=["category", "name"], values="revenue",
                  color="category", title="Revenue by category and product")
fig.update_traces(textinfo="label+percent parent")
fig`, note: 'Swap <code>px.sunburst</code> for <code>px.treemap</code> with the same arguments. <code>path</code> builds the hierarchy from left to right; <code>values</code> are summed up the tree.' },
      { title: 'Pie and box side by side (two figures)', code: ORDERS + `import plotly.express as px

by_status = orders.groupby("status", as_index=False)["revenue"].sum()
pie = px.pie(by_status, names="status", values="revenue", hole=.4)
print(len(pie.data), "trace of type", pie.data[0].type)

box = px.box(orders, x="region", y="revenue", color="status", points="outliers",
             category_orders={"region": ["North", "South", "East", "West"]})
box.update_layout(boxmode="group", height=380)
box`, note: 'Only the last expression renders in the sandbox; the pie figure is built but not shown. <code>category_orders</code> fixes category order for axes, legend and facets.' },
    ] },
    { id: 'go', title: 'graph_objects: build the tree by hand', blurb: 'go.Figure holds traces; each trace type (Scatter, Bar, Heatmap…) is a class with validated attributes.', snippets: [
      { title: 'go.Figure with several traces', code: ORDERS + `import plotly.graph_objects as go

pivot = orders.pivot_table(values="revenue", index="region", columns="status", aggfunc="sum", fill_value=0)
fig = go.Figure()
for status in pivot.columns:
    fig.add_trace(go.Bar(name=status, x=pivot.index, y=pivot[status],
                         text=pivot[status].round(0), textposition="auto"))
fig.add_trace(go.Scatter(name="total", x=pivot.index, y=pivot.sum(axis=1),
                         mode="lines+markers", line=dict(color="black", dash="dot")))
fig.update_layout(barmode="stack", title="Revenue by region", yaxis_title="USD", height=400)
print(len(fig.data), "traces:", [t.type for t in fig.data])
fig`, note: 'Each <code>add_trace</code> appends to <code>fig.data</code>. Traces of different types share the axes, which is how you overlay a line on bars.' },
      { title: 'Heatmap and text annotations', code: ORDERS + `import plotly.graph_objects as go

pivot = orders.pivot_table(values="quantity", index="rep", columns="region", aggfunc="sum", fill_value=0)
fig = go.Figure(go.Heatmap(z=pivot.values, x=pivot.columns, y=pivot.index,
                           colorscale="Blues", text=pivot.values, texttemplate="%{text}",
                           hovertemplate="%{y} / %{x}: %{z} units<extra></extra>",
                           colorbar_title="units"))
fig.update_layout(title="Units sold per rep and region", height=380)
fig`, note: '<code>texttemplate</code> and <code>hovertemplate</code> use <code>%{field}</code> placeholders with d3 formats, e.g. <code>%{z:,.0f}</code>. <code>&lt;extra&gt;&lt;/extra&gt;</code> removes the trace-name box beside the tooltip.' },
      { title: 'update_traces with a selector', code: ORDERS + `import plotly.express as px

fig = px.scatter(orders, x="unit_price", y="quantity", color="region", height=380)
fig.update_traces(marker=dict(size=9, line=dict(width=1, color="white")))   # every trace
fig.update_traces(marker_symbol="diamond", marker_size=14, selector=dict(name="West"))
fig.update_traces(visible="legendonly", selector=lambda t: t.name in ("South", "East"))
print([ (t.name, t.marker.size, t.visible) for t in fig.data ])
fig`, note: 'Magic underscores: <code>marker_size=14</code> is <code>marker=dict(size=14)</code>. A selector can be a dict of matching attributes or a function of the trace.' },
    ] },
    { id: 'subplots', title: 'Subplots', snippets: [
      { title: 'make_subplots grid', code: ORDERS + `import plotly.graph_objects as go
from plotly.subplots import make_subplots

by_region = orders.groupby("region")["revenue"].sum()
by_status = orders.groupby("status")["order_id"].count()
fig = make_subplots(rows=1, cols=2, subplot_titles=("revenue by region", "orders by status"),
                    column_widths=[.6, .4], specs=[[{"type": "xy"}, {"type": "domain"}]])
fig.add_trace(go.Bar(x=by_region.index, y=by_region.values, name="revenue"), row=1, col=1)
fig.add_trace(go.Pie(labels=by_status.index, values=by_status.values, name="orders", hole=.5), row=1, col=2)
fig.update_layout(height=380, showlegend=False)
fig.update_yaxes(title_text="USD", row=1, col=1)
fig`, note: 'Cells are <code>xy</code> by default. Pie, sunburst and other "domain" traces need their cell declared with <code>specs=[[..., {"type": "domain"}]]</code>, or add_trace raises. Each xy cell gets its own <code>xaxisN</code>/<code>yaxisN</code> in the layout.' },
      { title: 'Secondary y-axis', code: ORDERS + `import plotly.graph_objects as go
from plotly.subplots import make_subplots

m = orders.assign(month=orders.date.dt.to_period("M").dt.to_timestamp()).groupby("month").agg(
    revenue=("revenue", "sum"), orders=("order_id", "count")).reset_index()
fig = make_subplots(specs=[[{"secondary_y": True}]])
fig.add_trace(go.Bar(x=m.month, y=m.revenue, name="revenue", opacity=.6), secondary_y=False)
fig.add_trace(go.Scatter(x=m.month, y=m.orders, name="orders", mode="lines+markers"), secondary_y=True)
fig.update_yaxes(title_text="USD", secondary_y=False)
fig.update_yaxes(title_text="order count", secondary_y=True, showgrid=False)
fig.update_layout(height=380, legend=dict(orientation="h", y=1.1))
fig` },
    ] },
    { id: 'layout', title: 'Layout, hover and templates', snippets: [
      { title: 'Titles, margins, legend, axes', code: ORDERS + `import plotly.express as px

fig = px.scatter(orders, x="date", y="revenue", color="region", height=400)
fig.update_layout(
    title=dict(text="Orders over time", x=.02),
    template="plotly_white", margin=dict(l=40, r=20, t=50, b=40),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, x=1, xanchor="right", title=None),
    hovermode="x unified",
)
fig.update_xaxes(title=None, showgrid=False, rangeslider_visible=True)
fig.update_yaxes(title="revenue (USD)", tickprefix="$", zeroline=False)
fig`, note: 'Templates: <code>plotly</code>, <code>plotly_white</code>, <code>plotly_dark</code>, <code>simple_white</code>, <code>ggplot2</code>, <code>seaborn</code>, <code>presentation</code>. Set one globally with <code>plotly.io.templates.default = "plotly_white"</code>.' },
      { title: 'hovertemplate, reference lines, annotations', code: ORDERS + `import plotly.express as px

fig = px.scatter(orders, x="unit_price", y="quantity", color="status", custom_data=["order_id", "rep"], height=400)
fig.update_traces(hovertemplate="order %{customdata[0]} by %{customdata[1]}<br>"
                                "price %{x:$,.2f}, qty %{y}<extra>%{fullData.name}</extra>")
fig.add_vline(x=orders.unit_price.mean(), line_dash="dash", line_color="gray",
              annotation_text="mean price", annotation_position="top left")
fig.add_hrect(y0=4, y1=orders.quantity.max() + .5, fillcolor="orange", opacity=.12, line_width=0)
fig.add_annotation(x=orders.unit_price.max(), y=orders.quantity.max(), text="bulk + premium",
                   showarrow=True, arrowhead=2, ax=-60, ay=30)
fig`, note: '<code>custom_data</code> rides along in each trace so the tooltip can show columns that are not plotted. Shapes (<code>add_vline</code>, <code>add_hrect</code>, <code>add_shape</code>) and annotations live in the layout.' },
    ] },
    { id: 'export', title: 'Export: HTML, JSON, images', snippets: [
      { title: 'write_html and to_json', code: ORDERS + `import plotly.express as px, json, os

fig = px.bar(orders.groupby("region", as_index=False)["revenue"].sum(), x="region", y="revenue")
fig.write_html("/tmp/chart.html", include_plotlyjs="cdn", full_html=True)
print("html:", os.path.getsize("/tmp/chart.html") // 1024, "KB with plotly.js from a CDN")

doc = json.loads(fig.to_json())
print(list(doc), "| traces:", len(doc["data"]), "| type:", doc["data"][0]["type"])
snippet = fig.to_html(full_html=False, include_plotlyjs=False)   # a <div> to embed in your own page
print(snippet[:60], "...")
fig`, note: '<code>include_plotlyjs=True</code> (the default) embeds about 3.5 MB of plotly.js in every file. <code>"cdn"</code> keeps files tiny; <code>"directory"</code> writes one shared <code>plotly.min.js</code> next to them. <code>plotly.io.from_json</code> rebuilds a figure from the JSON.' },
      { title: 'Static images need kaleido', run: false, code: `# pip install -U kaleido     (v1 bundles a Chromium download: run kaleido.get_chrome() once)
import plotly.express as px
import plotly.io as pio

fig = px.line(x=[1, 2, 3], y=[2, 5, 4], title="static")
fig.write_image("chart.png", width=900, height=450, scale=2)   # png, svg, pdf, webp by extension
png_bytes = fig.to_image(format="png")                          # bytes, for an HTTP response

pio.templates.default = "plotly_white"       # affects every figure created after this
pio.renderers.default = "browser"            # fig.show() in a plain script opens a tab`, note: 'Rendering to pixels needs a browser engine, so it cannot run in this sandbox. Prefer <code>write_html</code> whenever the consumer has a browser.' },
    ] },
  ],
  concepts: [
    { id: 'tree', title: 'The figure is a JSON tree: data[] and layout', intro: 'Every plotly method is an edit to one document. Once you can picture <code>fig.data</code> as a list of trace dicts and <code>fig.layout</code> as a nested dict, <code>update_traces</code>, <code>update_layout</code>, magic underscores and <code>to_json</code> all become the same operation.', explainer: treeExplainer },
  ],
  compare: [
    { title: 'plotly.express or graph_objects?', columns: ['plotly.express (px)', 'graph_objects (go)'], rows: [
      ['Input', 'a tidy DataFrame (or dict/lists)', 'arrays per trace'],
      ['One chart from a colour column', true, { part: 'loop and add_trace' }],
      ['Facets, animation_frame, marginals', true, false],
      ['Mixed trace types on one axes', { part: 'add_trace afterwards' }, true],
      ['Subplot grids', { part: 'facets only' }, 'make_subplots'],
      ['Control over every trace attribute', { part: 'update_traces afterwards' }, true],
      ['Typical lines of code', { dots: 5 }, { dots: 2 }],
    ], note: 'Both return the same go.Figure; px is a builder for it.', verdict: 'Start with <code>px</code>, then <code>update_traces</code>/<code>update_layout</code>/<code>add_trace</code> the result. Reach for pure <code>go</code> when the chart has no DataFrame behind it or needs a subplot grid.' },
    { title: 'Getting a figure out', columns: ['fig.show()', 'write_html', 'to_html(full_html=False)', 'to_json', 'write_image'], rows: [
      ['Produces', 'a renderer call', 'a standalone .html', 'a <div> string', 'JSON text', 'png / svg / pdf'],
      ['Interactive', true, true, true, { part: 'when re-rendered' }, false],
      ['Extra dependency', 'a browser or notebook', false, false, false, 'kaleido + Chromium'],
      ['File size', 'n/a', 'tiny with include_plotlyjs="cdn"', 'tiny', 'tiny', 'small'],
      ['Use for', 'notebooks, scripts', 'reports to share', 'your own web page', 'APIs, storage, Dash', 'slides, papers, e-mail'],
    ] },
  ],
  gotchas: [
    { title: 'px.bar stacks repeated x values', bad: `px.bar(orders, x="region", y="revenue")
# every order is its own bar segment, stacked: hover shows 60 pieces
# per region and the total is right only by accident`, good: `totals = orders.groupby("region", as_index=False)["revenue"].sum()
px.bar(totals, x="region", y="revenue")
# or let plotly aggregate:
px.histogram(orders, x="region", y="revenue", histfunc="sum")`, why: 'px.bar draws one bar per row and stacks bars that share an x value. Aggregate first, or use <code>px.histogram</code> with <code>histfunc</code>, which aggregates in the browser.' },
    { title: 'A numeric colour column becomes a continuous scale', bad: `px.scatter(df, x="a", y="b", color="cluster")   # cluster is int
# one trace, a colour bar from 0 to 3, no legend to toggle`, good: `px.scatter(df, x="a", y="b", color=df.cluster.astype(str))
# or: color="cluster", color_discrete_map={...} after casting`, why: 'px decides discrete vs continuous by dtype. Integers and floats get one trace with a colour scale; strings and categoricals get one trace per level and a legend.' },
    { title: 'Assigning a layout sub-object replaces it', bad: `fig.update_xaxes(range=[0, 200], tickprefix="$")
fig.layout.xaxis = dict(title="price")   # range and tickprefix are gone`, good: `fig.update_layout(xaxis_title="price")        # merges
fig.layout.xaxis.title.text = "price"          # sets one leaf`, why: 'update_* merges into the tree. Attribute assignment on a compound object constructs a new one from the dict you gave and drops everything else.' },
    { title: 'Every write_html embeds 3.5 MB of JavaScript', bad: `for name, fig in figs.items():
    fig.write_html(f"{name}.html")     # each file ~3.5 MB`, good: `for name, fig in figs.items():
    fig.write_html(f"{name}.html", include_plotlyjs="cdn")
# or "directory" to write one shared plotly.min.js`, why: 'The default <code>include_plotlyjs=True</code> makes the file work offline at the price of the whole library per file. Use <code>"cdn"</code> for anything shared over the network.' },
  ],
  presets: [
    { title: 'Revenue by region, stacked by status', code: ORDERS + `import plotly.express as px

by_region = (orders.groupby(["region", "status"], as_index=False)["revenue"].sum())
fig = px.bar(by_region, x="region", y="revenue", color="status", text_auto=".3s",
             category_orders={"region": ["North", "South", "East", "West"]},
             template="plotly_white", title="Revenue by region and status")
fig.update_layout(legend=dict(orientation="h", y=1.1, title=None), yaxis_tickprefix="$")
fig` },
  ],
};
