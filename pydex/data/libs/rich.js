import { scene } from '../../js/explainer.js';

const renderExplainer = {
  hold: 3200,
  code: ['console = Console(width=80)', 'console.print("[bold red]Error:[/] disk at [green]91%[/]")', '# markup → Text(spans) → Segments → wrap → ANSI → stdout'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 30, label, cls);
    s.text('l0', 20, 28, 'markup string', 'lbl sm bold ink-2', undefined, 'start');
    box('src', 20, 40, 540, '"[bold red]Error:[/] disk at [green]91%[/]"');
    s.text('l1', 20, 98, 'Text with spans', 'lbl sm bold ink-2 hid', undefined, 'start');
    box('sp0', 20, 110, 80, 'Error:', 'cell hid'); box('sp1', 110, 110, 100, ' disk at ', 'cell hid'); box('sp2', 220, 110, 60, '91%', 'cell hid');
    s.text('sl0', 60, 156, 'Span(0, 6, "bold red")', 'lbl sm ink-2 hid'); s.text('sl1', 160, 156, 'no span', 'lbl sm ink-2 hid'); s.text('sl2', 250, 156, 'Span(15, 18, "green")', 'lbl sm ink-2 hid');
    s.text('l2', 20, 182, 'Segments', 'lbl sm bold ink-2 hid', undefined, 'start');
    box('sg0', 20, 194, 230, 'Segment("Error:", Style(bold, red))', 'cell hid');
    box('sg1', 260, 194, 140, 'Segment(" disk at ")', 'cell hid');
    box('sg2', 410, 194, 150, 'Segment("91%", green)', 'cell hid');
    s.text('wrap', 20, 240, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l3', 20, 262, 'bytes written to stdout', 'lbl sm bold ink-2 hid', undefined, 'start');
    box('ansi', 20, 274, 540, 'ESC[1;31mError:ESC[0m disk at ESC[32m91%ESC[0m', 'cell hid');
    s.arrow('a1', 290, 72, 290, 106, 'arrow hid'); s.arrow('a2', 290, 142, 290, 190, 'arrow hid'); s.arrow('a3', 290, 226, 290, 270, 'arrow hid');
    // console panel
    s.rect('panel', 590, 40, 150, 200, 'panel', undefined, 8);
    s.text('pt', 665, 56, 'Console', 'lbl bold');
    box('c0', 600, 72, 130, 'width = 80', 'cell');
    box('c1', 600, 112, 130, 'color_system', 'cell');
    s.text('c1v', 665, 158, '"standard"', 'lbl sm ink-2');
    box('c2', 600, 176, 130, 'is_terminal', 'cell');
    s.text('c2v', 665, 222, 'True', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'A string with markup tags', caption: 'Tags look like BBCode: [style] opens, [/] closes the most recent tag, [/style] closes a named one. Anything that is not a valid tag is ordinary text.', lines: [1],
      patch: { 'src.r': { cls: 'cell hot' } } },
    { title: 'Markup is parsed into Text with spans', caption: 'render_markup strips the tags and records Span(start, end, style) over the plain characters. The style is still a string here; an unknown name gives a null style, which is why a stray [word] simply disappears.', lines: [1],
      patch: { 'src.r': { cls: 'cell' }, a1: { cls: 'arrow hot' }, l1: { cls: 'lbl sm bold ink-2' }, sp0: { cls: '' }, sp1: { cls: '' }, sp2: { cls: '' }, 'sp0.r': { cls: 'cell hot' }, 'sp2.r': { cls: 'cell ok' }, sl0: { cls: 'lbl sm ink-2' }, sl1: { cls: 'lbl sm ink-2' }, sl2: { cls: 'lbl sm ink-2' } } },
    { title: 'Text renders to Segments', caption: 'Every renderable (Text, Table, Panel, Tree) ends up as a flat list of Segment(text, Style). Style strings are parsed once and cached: "bold red" becomes Style(bold=True, color=Color.parse("red")).', lines: [2],
      patch: { a2: { cls: 'arrow hot' }, l2: { cls: 'lbl sm bold ink-2' }, sg0: { cls: '' }, sg1: { cls: '' }, sg2: { cls: '' }, 'sg0.r': { cls: 'cell hot' }, 'sg2.r': { cls: 'cell ok' } } },
    { title: 'Segments are wrapped to the console width', caption: 'The console asks the terminal for its size (or uses width=). Segment.split_and_crop_lines breaks the stream at word boundaries so nothing exceeds 80 cells; tables and panels measure their children with the same rule.', lines: [0],
      patch: { 'c0.r': { cls: 'cell hot' }, wrap: { text: '18 cells wide, fits on one line → a newline Segment is appended' } } },
    { title: 'Each Style is encoded as ANSI', caption: 'Style.render wraps the text in SGR escape codes: 1 for bold, 31 for red, 32 for green, 0 to reset. color_system decides the form: "standard" uses 30–37, "256" uses 38;5;n, "truecolor" uses 38;2;r;g;b.', lines: [2],
      patch: { 'c0.r': { cls: 'cell' }, 'c1.r': { cls: 'cell hot' }, a3: { cls: 'arrow hot' }, l3: { cls: 'lbl sm bold ink-2' }, ansi: { cls: '' }, 'ansi.r': { cls: 'cell hot' } } },
    { title: 'No terminal, no codes', caption: 'When stdout is a pipe or a file, Console detects it, sets color_system to None and Style.render returns plain text. force_terminal=True overrides the detection; record=True keeps the styles for export_html.', lines: [0],
      patch: { 'c1.r': { cls: 'cell' }, 'c2.r': { cls: 'cell err' }, c2v: { text: 'False (piped)' }, c1v: { text: 'None' }, 'ansi.t': { text: 'Error: disk at 91%' }, 'ansi.r': { cls: 'cell' }, a3: { cls: 'arrow' } } },
  ],
};

const CONSOLE = 'console = Console(force_terminal=True, color_system="standard", width=80)';

export default {
  id: 'rich', name: 'rich', glyph: 'ri', group: 'automation', version: '15.0', keywords: 'terminal colour color table panel progress bar markup logging pretty print traceback console',
  tagline: 'Colour, tables, progress bars and pretty output in the terminal.',
  install: 'pip install rich', docs: 'https://rich.readthedocs.io/', packages: ['pip:rich>=13.8'],
  overview: {
    what: 'rich renders styled text and structured layouts to the terminal. A Console prints strings with BBCode-like markup, and renderables such as Table, Panel, Tree, Syntax and Markdown compose into any layout. Progress bars, a logging handler, pretty-printed data structures and readable tracebacks come in the same package. It detects terminal capabilities and degrades cleanly when output is piped.',
    yes: ['CLI tools that need readable tables, colour and progress.', 'Debug output: pretty-printed dicts, inspect(), rich tracebacks.', 'Logging that is easy to scan during development.', 'Rendering Markdown or highlighted code in a terminal.'],
    no: ['Full-screen interactive apps with widgets and input (Textual, built on rich).', 'Plain log files or machine-readable output (styles are noise there).', 'Line-by-line prompts and menus (questionary, prompt_toolkit).'],
    note: 'The sandbox captures stdout without a TTY, so every snippet builds <code>Console(force_terminal=True, color_system="standard", width=80)</code> and prints through it; ANSI colours render in the output panel. Locally, plain <code>Console()</code> detects your terminal. Live displays (Progress, Status, Live) need a refresh thread, which the browser lacks; those snippets render frames explicitly.',
  },
  cheatsheet: [
    { id: 'console', title: 'Console and markup', snippets: [
      { title: 'Print with markup and styles', code: `from rich.console import Console

${CONSOLE}
console.print("[bold red]Error:[/] disk at [green]91%[/green] :warning:")
console.print("[u]underline[/u], [i]italic[/i], [dim]dim[/dim], [reverse] reverse [/reverse]")
console.print("[on blue] background [/] and [#ff8800]hex colours[/] (approximated in 16-colour mode)")
console.print("whole line styled", style="bold magenta")
console.print("numbers 42, strings 'x' and paths /data/orders.csv get highlighted")
console.print("the same line, unhighlighted: 42 'x' /data/orders.csv", highlight=False)`, note: 'Tags nest and <code>[/]</code> closes the last open one. Automatic highlighting colours numbers, strings, URLs and paths; turn it off per call with <code>highlight=False</code>.' },
      { title: 'Text objects, Rule, Align and escaping', code: `from rich.console import Console
from rich.text import Text
from rich.rule import Rule
from rich.markup import escape

${CONSOLE}
console.print(Rule("[bold]orders report[/]"))
t = Text("build it piece by piece ")
t.append("ok", style="bold green")
t.append(" / ")
t.append("failed", style="bold red")
t.stylize("underline", 0, 5)             # style a character range
console.print(t)
console.print(Text.assemble(("Total: ", "bold"), ("1,204", "cyan")), justify="center")
user_input = "[bold] is data, not markup"
console.print(escape(user_input))         # or console.print(user_input, markup=False)
console.print(Rule(style="dim"))` },
      { title: 'print, log, capture and export', code: `from rich.console import Console
from rich import print as rprint
import sys

${CONSOLE}
rprint("[bold]rich.print[/] uses a default console: markup and pretty repr for", {"a": [1, 2]})
console.log("log() adds the time and the call site", log_locals=False)
err = Console(stderr=True, force_terminal=True, width=80)   # a console for stderr
err.print("[red]this goes to stderr[/]")

rec = Console(record=True, width=40, force_terminal=True, color_system="standard")
rec.print("[green]captured[/] and [bold]recorded[/]")
print(rec.export_text(styles=False).strip())     # plain
print(rec.export_html(inline_styles=True)[:120], "...")   # HTML with inline CSS
with console.capture() as cap:
    console.print("[blue]not printed yet[/]")
print(repr(cap.get()))`, note: '<code>record=True</code> keeps every render so you can <code>export_text</code>, <code>export_html</code> or <code>export_svg</code> afterwards.' },
    ] },
    { id: 'layout', title: 'Tables, panels, trees', snippets: [
      { title: 'A Table from CSV rows', code: `import csv
from rich.console import Console
from rich.table import Table

${CONSOLE}
rows = list(csv.DictReader(open("/data/orders.csv")))[:6]
table = Table(title="Recent orders", caption="6 of 240 rows", show_lines=False)
table.add_column("id", style="dim", no_wrap=True)
table.add_column("region")
table.add_column("qty", justify="right")
table.add_column("unit price", justify="right", style="cyan")
table.add_column("status")
for r in rows:
    colour = {"shipped": "green", "returned": "red"}.get(r["status"], "yellow")
    table.add_row(r["order_id"], r["region"], r["quantity"], f"{float(r['unit_price']):.2f}", f"[{colour}]{r['status']}[/]")
console.print(table)`, note: 'Cells must be strings or renderables, not numbers: format them first. <code>box=box.SIMPLE</code>, <code>box=None</code> and <code>Table.grid()</code> give lighter layouts.' },
      { title: 'Panel, Columns and box styles', code: `from rich.console import Console
from rich.panel import Panel
from rich.columns import Columns
from rich import box

${CONSOLE}
console.print(Panel("Deploy finished in [bold]42 s[/]", title="[green]ok[/]", subtitle="prod", expand=False))
console.print(Panel.fit("rounded is the default; try box.DOUBLE, HEAVY, SIMPLE", box=box.DOUBLE, border_style="blue"))
cards = [Panel(f"[bold]{name}[/]\\n{price}", width=18, box=box.SQUARE) for name, price in
         [("Kettle", "$39"), ("Lamp", "$24"), ("Mug", "$9"), ("Chair", "$120"), ("Rug", "$75")]]
console.print(Columns(cards, equal=True, expand=False))`, note: '<code>expand=False</code> shrinks a panel to its content. Columns flows any renderables left to right and wraps them to the console width.' },
      { title: 'Tree for hierarchies', code: `import json
from rich.console import Console
from rich.tree import Tree

${CONSOLE}
products = json.load(open("/data/products.json"))
tree = Tree(":package: catalogue", guide_style="dim")
by_cat = {}
for p in products:
    by_cat.setdefault(p["category"], []).append(p)
for cat, items in sorted(by_cat.items()):
    branch = tree.add(f"[bold]{cat}[/] [dim]({len(items)})[/]")
    for p in items[:3]:
        branch.add(f"{p['name']} [cyan]\${p['price']:.2f}[/]")
console.print(tree)` },
    ] },
    { id: 'text', title: 'Code, Markdown and data', snippets: [
      { title: 'Syntax highlighting', code: `from rich.console import Console
from rich.syntax import Syntax

${CONSOLE}
code = '''def revenue(rows):
    total = 0.0
    for r in rows:
        total += r["quantity"] * r["unit_price"] * (1 - r["discount"])
    return round(total, 2)
'''
console.print(Syntax(code, "python", theme="ansi_dark", line_numbers=True, highlight_lines={4}))
console.print(Syntax('{"id": 101, "name": "Kettle"}', "json", theme="ansi_light"))
console.print(Syntax.from_path("/data/orders.csv", line_range=(1, 3)))`, note: 'Any Pygments lexer name works. The <code>ansi_*</code> themes use the terminal palette; <code>"monokai"</code> and friends need 256 or truecolor.' },
      { title: 'Markdown', code: `from rich.console import Console
from rich.markdown import Markdown

${CONSOLE}
md = """# Release 1.4

Ships **two** fixes and a *new* \`--dry-run\` flag.

- Faster CSV import
- Fix for [issue 42](https://example.com/42)

\`\`\`python
orders sync --dry-run
\`\`\`
> Upgrade with \`pip install -U orders\`.
"""
console.print(Markdown(md, hyperlinks=False))   # hyperlinks=True emits OSC-8 links for terminals that support them`, note: 'Headings, lists, block quotes, code fences and tables are rendered; links show as underlined text (with the URL in terminals that support hyperlinks).' },
      { title: 'Pretty print and inspect', code: `from dataclasses import dataclass
from rich.console import Console
from rich.pretty import pprint, Pretty
from rich import inspect

${CONSOLE}
data = {"order": 1201, "items": [{"sku": "K-1", "qty": 2}, {"sku": "L-7", "qty": 1}], "tags": {"rush", "gift"}, "note": None}
pprint(data, console=console, expand_all=True)        # every container on its own lines
pprint(list(range(40)), console=console, max_length=8)  # truncates long containers

@dataclass
class Order:
    id: int
    total: float
    def is_big(self): return self.total > 100

console.print(Pretty(Order(7, 250.0)))
inspect(Order(7, 250.0), methods=True, console=console)   # attributes, methods, docstrings`, note: '<code>inspect(obj, help=True)</code> adds the full docstring; <code>all=True</code> shows dunder methods. <code>rich.pretty.install()</code> makes the REPL use this formatting for every result.' },
    ] },
    { id: 'progress', title: 'Progress', snippets: [
      { title: 'Progress bars, rendered frame by frame', code: `from rich.console import Console
from rich.progress import Progress, BarColumn, TextColumn, MofNCompleteColumn

${CONSOLE}
progress = Progress(
    TextColumn("[bold]{task.description}"), BarColumn(bar_width=30),
    TextColumn("{task.percentage:>3.0f}%"), MofNCompleteColumn(),
    console=console, auto_refresh=False,          # no refresh thread: we render on demand
)
download = progress.add_task("download", total=400)
parse = progress.add_task("parse", total=4)
for chunk in range(4):
    progress.update(download, advance=100)
    progress.advance(parse)
    console.print(progress)                        # one snapshot of both bars
console.print("[green]done[/]")`, note: 'Normally you write <code>with progress:</code> and rich redraws in place from a background thread. The browser has no threads, so this snippet prints a snapshot after each step; the bar itself is the same renderable.' },
      { title: 'track, Progress and Status in a real terminal', run: false, code: `import time
from rich.progress import track, Progress, SpinnerColumn, TimeElapsedColumn
from rich.console import Console

console = Console()
for row in track(range(100), description="Importing"):    # one line for a simple loop
    time.sleep(0.01)

with Progress(SpinnerColumn(), *Progress.get_default_columns(), TimeElapsedColumn(), console=console, transient=True) as progress:
    files = progress.add_task("files", total=3)
    bytes_ = progress.add_task("bytes", total=3000)
    for _ in range(3):
        time.sleep(0.3)
        progress.advance(files); progress.advance(bytes_, 1000)
        progress.console.print("  finished one file")          # prints above the bars

with console.status("Contacting server...", spinner="dots"):
    time.sleep(1)
console.print("[green]done[/]")`, note: '<code>transient=True</code> removes the bars when finished. Inside a Progress block, print through <code>progress.console</code> so output lands above the live display instead of corrupting it.' },
    ] },
    { id: 'logging', title: 'Logging and tracebacks', snippets: [
      { title: 'RichHandler for the logging module', code: `import logging
from rich.console import Console
from rich.logging import RichHandler

${CONSOLE}
logging.basicConfig(
    level="DEBUG", format="%(message)s", datefmt="[%X]", force=True,
    handlers=[RichHandler(console=console, markup=True, show_path=False, rich_tracebacks=True)],
)
log = logging.getLogger("orders")
log.debug("connecting to %s", "/data/shop.sqlite")
log.info("loaded [bold]240[/] orders in 12 ms")
log.warning("disk at 91%")
try:
    {}["missing"]
except KeyError:
    log.exception("lookup failed")`, note: 'Level names are coloured, the time is a column, and <code>rich_tracebacks=True</code> renders exceptions with code context. Use <code>show_path=True</code> (the default) to see file:line links.' },
      { title: 'Readable tracebacks everywhere', run: false, code: `from rich.traceback import install
install(show_locals=True, width=120, suppress=[])   # once, at program start

# from now on any uncaught exception prints a rich traceback:
def parse(row):
    return int(row["qty"]) * float(row["price"])

parse({"qty": "2", "price": "n/a"})    # ValueError with locals shown per frame

# print a caught exception the same way:
from rich.console import Console
console = Console()
try:
    parse({"qty": "x"})
except Exception:
    console.print_exception(max_frames=5)`, note: '<code>suppress=[click, typer]</code> hides frames from those libraries. In the sandbox the harness already formats exceptions, so this snippet is copy-only.' },
    ] },
    { id: 'input', title: 'Prompts', snippets: [
      { title: 'Prompt.ask, Confirm.ask, IntPrompt', code: `import io
from rich.console import Console
from rich.prompt import Prompt, Confirm, IntPrompt

${CONSOLE}
answers = io.StringIO("Ann\\nWest\\nNorth\\n7\\ny\\n")      # stands in for the keyboard
name = Prompt.ask("[bold]Name[/]", default="anonymous", console=console, stream=answers)
region = Prompt.ask("Region", choices=["North", "South"], console=console, stream=answers)   # "West" is rejected, re-asked
qty = IntPrompt.ask("Quantity", console=console, stream=answers)
ok = Confirm.ask(f"Order {qty} for {name} in {region}?", console=console, stream=answers)
console.print(f"{name=} {region=} {qty=} {ok=}")`, note: 'Drop <code>stream=</code> to read from the real keyboard. <code>password=True</code> hides input; <code>choices=</code> re-prompts until the answer matches.' },
    ] },
  ],
  concepts: [
    { id: 'render', title: 'From markup to ANSI', intro: 'Every <code>console.print</code> goes through the same pipeline. Knowing where the tags disappear, where width is applied and where colour codes are (or are not) written explains most rich surprises.', explainer: renderExplainer },
  ],
  compare: [
    { title: 'Ways to style text', columns: ['markup string', 'Text object', 'style= argument', 'Style()'], rows: [
      ['Looks like', '"[bold red]x[/]"', 'Text("x", style=...)', 'print("x", style="bold")', 'Style(bold=True, color="red")'],
      ['Nested styles', true, true, false, false],
      ['Safe for untrusted data', { part: 'escape() first' }, true, true, true],
      ['Style character ranges', false, true, false, false],
      ['Reusable, composable', false, { part: 'append/assemble' }, false, true],
    ], verdict: 'Markup for literals you type, <code>Text</code> when the content comes from data, <code>Style</code> objects when the same look is reused (they add with <code>+</code>).' },
    { title: 'Progress and live helpers', columns: ['track()', 'Progress', 'console.status()', 'Live'], rows: [
      ['Several tasks', false, true, false, { part: 'any renderable' }],
      ['Custom columns', false, true, false, { part: 'you draw it' }],
      ['Prints above the display', { part: 'via console' }, true, true, true],
      ['Needs a refresh thread', true, { part: 'unless auto_refresh=False' }, true, { part: 'unless auto_refresh=False' }],
      ['Typical use', 'one loop', 'downloads, pipelines', 'a spinner while waiting', 'a table that updates in place'],
    ] },
  ],
  gotchas: [
    { title: 'Square brackets in data vanish as markup', bad: `console.print("[warning] disk at 91%")   # prints " disk at 91%"
console.print(f"tags: {tags}")             # a list like ['x'] is fine, but "[x]" is not`, good: `from rich.markup import escape
console.print(escape("[warning] disk at 91%"))
console.print("[warning] disk at 91%", markup=False)`, why: 'Anything that parses as a tag (<code>[word]</code>, <code>[/]</code>) is treated as a style and stripped, even when the name is unknown. Escape user-provided text or pass <code>markup=False</code>.' },
    { title: 'Table cells must be strings or renderables', bad: `table.add_row(order["id"], order["quantity"])
# NotRenderableError: unable to render 1201; A str, Segment or object with __rich_console__ method is required`, good: `table.add_row(str(order["id"]), f"{order['quantity']:>3}")`, why: '<code>add_row</code> takes renderables; an <code>int</code> is not one. Formatting first also lets you control alignment and precision.' },
    { title: 'print() during a live display corrupts it', bad: `with Progress() as progress:
    task = progress.add_task("work", total=10)
    for i in range(10):
        print("step", i)          # interleaves with the bar
        progress.advance(task)`, good: `with Progress() as progress:
    task = progress.add_task("work", total=10)
    for i in range(10):
        progress.console.print("step", i)   # rendered above the bar
        progress.advance(task)`, why: 'Progress and Live redraw a region at the bottom of the screen. Output through their console is inserted above that region; raw <code>print</code> writes into it.' },
    { title: 'Colours disappear when output is piped or captured', bad: `python report.py > out.txt      # plain text, no ANSI
console = Console(); console.print("[red]x[/]")   # in CI: no colour`, good: `console = Console(force_terminal=True)          # or FORCE_COLOR=1 in the environment
console = Console(record=True); ...; console.save_html("out.html")`, why: 'Console checks <code>isatty()</code> and disables colour for pipes and files, which is what you want for logs. Force it only when the consumer understands ANSI, or record and export HTML/SVG instead.' },
  ],
  presets: [
    { title: 'Product table in a panel', code: `import json
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console(force_terminal=True, color_system="standard", width=80)
products = json.load(open("/data/products.json"))
table = Table(box=None, expand=True)
table.add_column("name", style="bold"); table.add_column("category", style="dim"); table.add_column("price", justify="right")
for p in sorted(products, key=lambda p: -p["price"])[:6]:
    table.add_row(p["name"], p["category"], f"[green]\${p['price']:.2f}[/]")
console.print(Panel(table, title="Top 6 by price", border_style="blue"))` },
  ],
};
