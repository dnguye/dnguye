import { scene } from '../../js/explainer.js';

const pipelineExplainer = {
  hold: 3200,
  code: ['@click.command()', '@click.argument("name")', '@click.option("--shout", is_flag=True)', '@click.option("-c", "--count", type=int, default=1)', 'def cli(name, shout, count): ...', 'cli(["Ann", "--shout", "-c", "2"])'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 30, label, cls);
    s.text('h1', 20, 22, 'source', 'lbl sm bold ink-2', undefined, 'start');
    s.text('h2', 300, 22, 'Command object', 'lbl sm bold ink-2', undefined, 'start');
    s.text('h3', 560, 22, 'argv', 'lbl sm bold ink-2', undefined, 'start');
    box('d0', 20, 36, 240, '@click.command()', 'cell ghost');
    box('d1', 20, 74, 240, '@argument("name")', 'cell ghost');
    box('d2', 20, 112, 240, '@option("--shout", is_flag=True)', 'cell ghost');
    box('d3', 20, 150, 240, '@option("-c", "--count", type=int)', 'cell ghost');
    box('d4', 20, 188, 240, 'def cli(name, shout, count)', 'cell ghost');
    box('cmd', 300, 36, 220, 'Command "cli"', 'cell hid');
    box('p0', 300, 74, 220, 'Argument name · STRING', 'cell hid');
    box('p1', 300, 112, 220, 'Option --shout · flag', 'cell hid');
    box('p2', 300, 150, 220, 'Option -c/--count · INT', 'cell hid');
    box('t0', 560, 74, 70, '"Ann"', 'cell hid');
    box('t1', 560, 112, 90, '"--shout"', 'cell hid');
    box('t2', 560, 150, 50, '"-c"', 'cell hid');
    box('t3', 620, 150, 50, '"2"', 'cell hid');
    s.arrow('a0', 556, 89, 524, 89, 'arrow hid'); s.arrow('a1', 556, 127, 524, 127, 'arrow hid'); s.arrow('a2', 556, 165, 524, 165, 'arrow hid');
    s.arrow('m0', 264, 89, 296, 89, 'arrow hid'); s.arrow('m1', 264, 127, 296, 127, 'arrow hid'); s.arrow('m2', 264, 165, 296, 165, 'arrow hid');
    s.text('conv', 300, 200, '', 'lbl sm ink-2', undefined, 'start');
    box('params', 300, 222, 380, 'ctx.params = {"name": "Ann", "shout": True, "count": 2}', 'cell hid');
    s.arrow('ap', 410, 254, 410, 274, 'arrow hid');
    box('call', 300, 278, 380, 'cli(name="Ann", shout=True, count=2)', 'cell ok hid');
    box('err', 20, 278, 240, 'exit 2: not a valid integer', 'cell err hid');
    return s;
  },
  steps: [
    { title: 'Decorators attach Parameter objects', caption: 'Decorators apply bottom-up. Each @option and @argument builds an Option or Argument and appends it to a hidden list on the function (__click_params__). Nothing is parsed yet.', lines: [1, 2, 3],
      patch: { 'd1.r': { cls: 'cell hot' }, 'd2.r': { cls: 'cell hot' }, 'd3.r': { cls: 'cell hot' } } },
    { title: '@click.command wraps it in a Command', caption: 'The outermost decorator replaces the function with a Command that holds the callback and the parameter list, in declaration order. The docstring becomes the help text.', lines: [0],
      patch: { 'd0.r': { cls: 'cell hot' }, 'd1.r': { cls: 'cell ghost' }, 'd2.r': { cls: 'cell ghost' }, 'd3.r': { cls: 'cell ghost' }, cmd: { cls: '' }, p0: { cls: '' }, p1: { cls: '' }, p2: { cls: '' }, m0: { cls: 'arrow' }, m1: { cls: 'arrow' }, m2: { cls: 'arrow' } } },
    { title: 'Calling cli() parses argv', caption: 'cli() reads sys.argv[1:] (or the list you pass). Options are matched by name wherever they appear; arguments take the leftover tokens in order. -c consumes the token after it.', lines: [5],
      patch: { 'd0.r': { cls: 'cell ghost' }, t0: { cls: '' }, t1: { cls: '' }, t2: { cls: '' }, t3: { cls: '' }, a0: { cls: 'arrow hot' }, a1: { cls: 'arrow hot' }, a2: { cls: 'arrow hot' }, 'p0.r': { cls: 'cell hot' }, 'p1.r': { cls: 'cell hot' }, 'p2.r': { cls: 'cell hot' } } },
    { title: 'Each parameter converts its value', caption: 'A parameter with no token on the command line looks at its envvar, then its default. The type then converts the string: INT calls int("2"); a flag becomes True when present. Callbacks run after conversion.', lines: [2, 3],
      patch: { 't0.t': { text: '"Ann"' }, 't1.t': { text: 'True' }, 't3.t': { text: '2' }, 'p0.r': { cls: 'cell ok' }, 'p1.r': { cls: 'cell ok' }, 'p2.r': { cls: 'cell ok' }, a0: { cls: 'arrow ok' }, a1: { cls: 'arrow ok' }, a2: { cls: 'arrow ok' }, conv: { text: 'STRING("Ann") → "Ann" · flag present → True · INT("2") → 2' } } },
    { title: 'Your function gets keyword arguments', caption: 'Converted values land in ctx.params, keyed by the Python name click derives from the option (--count → count, --dry-run → dry_run). ctx.invoke(callback, **ctx.params) calls your function.', lines: [4],
      patch: { params: { cls: '' }, ap: { cls: 'arrow ok' }, call: { cls: '' } } },
    { title: 'A bad value never reaches your code', caption: 'If conversion fails, click raises BadParameter, prints the usage line and the message, and exits with code 2. Your function is not called. Under CliRunner the same shows up as result.exit_code == 2.', lines: [3],
      patch: { 't3.t': { text: '"x"' }, 'p2.r': { cls: 'cell err' }, a2: { cls: 'arrow err' }, params: { cls: 'dim' }, call: { cls: 'dim' }, ap: { cls: 'arrow hid' }, err: { cls: '' }, conv: { text: 'INT("x") → BadParameter → usage + "Error: ..." on stderr' } } },
  ],
};

export default {
  id: 'click', name: 'click', glyph: 'ck', group: 'automation', version: '8.5', keywords: 'cli command line argument option flag group prompt argparse terminal',
  tagline: 'Command-line interfaces from decorated functions.',
  install: 'pip install click', docs: 'https://click.palletsprojects.com/', packages: ['click'],
  overview: {
    what: 'click turns a function into a command-line program. Decorators declare arguments, options and flags; click parses argv, converts and validates values, prints help and usage errors, and calls your function with keyword arguments. Groups nest commands (git-style), a Context carries state between them, and CliRunner tests the whole thing in-process.',
    yes: ['Any script that takes flags or arguments and needs --help for free.', 'Multi-command tools with shared setup (git-style verbs).', 'Prompts, confirmations, coloured output, progress bars.', 'CLIs that must be tested without spawning a process.'],
    no: ['You want commands generated from type hints (typer, built on click).', 'A one-off script with a single positional argument (sys.argv is enough).', 'Interactive full-screen terminal apps (Textual, prompt_toolkit).'],
    note: 'Every snippet ends by invoking the command with <code>click.testing.CliRunner</code> and printing <code>.output</code>, which is how you test click apps anyway. Locally you would call <code>cli()</code> at the bottom of the file and run it from a shell. The sandbox has click 8.1; the snippets also run on 8.2+.',
  },
  cheatsheet: [
    { id: 'first', title: 'A first command', blurb: 'Arguments are positional, options have names, flags are boolean options.', snippets: [
      { title: 'Argument, option, flag', code: `import click
from click.testing import CliRunner

@click.command()
@click.argument("name")
@click.option("--shout", is_flag=True, help="Upper-case the greeting.")
@click.option("--count", "-c", default=1, show_default=True, help="Repeat.")
def cli(name, shout, count):
    """Greet NAME on the terminal."""
    msg = f"Hello, {name}!"
    for _ in range(count):
        click.echo(msg.upper() if shout else msg)

runner = CliRunner()
print(runner.invoke(cli, ["Ann", "--shout", "-c", "2"]).output)
print(runner.invoke(cli, ["--help"]).output)`, note: 'The function parameter names must match the names click derives: <code>--count</code> → <code>count</code>. The type of an option is inferred from its <code>default</code> (here <code>int</code>).' },
      { title: 'Usage errors and exit codes', code: `import click
from click.testing import CliRunner

@click.command()
@click.argument("name")
@click.option("--count", "-c", type=int, default=1)
def cli(name, count):
    if count > 3:
        raise click.BadParameter("keep it under 4", param_hint="--count")
    click.echo(f"{name} x{count}")

r = CliRunner().invoke(cli, ["-c", "x", "Ann"])   # not an int
print(r.exit_code, r.output)
r = CliRunner().invoke(cli, ["-c", "9", "Ann"])   # your own check
print(r.exit_code, r.output)
r = CliRunner().invoke(cli, [])                   # missing argument
print(r.exit_code, r.output)`, note: 'Usage errors exit with code 2 and print the usage line first. A <code>ClickException</code> exits with 1. <code>result.exit_code</code> is how tests check this.' },
    ] },
    { id: 'types', title: 'Parameter types', snippets: [
      { title: 'Built-in types, ranges, choices, dates', code: `import click
from click.testing import CliRunner

@click.command()
@click.option("--ratio", type=click.FloatRange(0, 1), default=0.5)
@click.option("--level", type=click.IntRange(0, 5, clamp=True), default=0)
@click.option("--region", type=click.Choice(["North", "South"], case_sensitive=False))
@click.option("--since", type=click.DateTime(formats=["%Y-%m-%d"]))
def cli(ratio, level, region, since):
    click.echo(f"{ratio=} {level=} {region=} {since=}")

r = CliRunner()
print(r.invoke(cli, ["--level", "9", "--region", "north", "--since", "2026-03-01"]).output)
print(r.invoke(cli, ["--ratio", "2"]).output)
print(r.invoke(cli, ["--region", "West"]).output)`, note: '<code>clamp=True</code> silently pins out-of-range values; without it they are errors. <code>Choice</code> normalises case when <code>case_sensitive=False</code>, so your function receives <code>"North"</code>.' },
      { title: 'Several values: nargs, multiple, tuples, counting', code: `import click
from click.testing import CliRunner

@click.command()
@click.argument("ids", type=int, nargs=-1)             # zero or more positionals
@click.option("--tag", multiple=True)                  # --tag a --tag b
@click.option("--size", type=(int, str), default=(1, "kb"))   # two tokens
@click.option("-v", "--verbose", count=True)           # -vvv → 3
def cli(ids, tag, size, verbose):
    click.echo(f"{ids=} {tag=} {size=} {verbose=}")

print(CliRunner().invoke(cli, ["1", "2", "3", "--tag", "a", "--tag", "b", "--size", "4", "mb", "-vv"]).output)
print(CliRunner().invoke(cli, ["--tag", "x"]).output)`, note: 'All of these arrive as <em>tuples</em>, even when empty. Use <code>nargs=-1, required=True</code> to demand at least one.' },
      { title: 'Paths, files and environment variables', code: `import click
from click.testing import CliRunner

@click.command()
@click.argument("src", type=click.Path(exists=True, dir_okay=False))
@click.option("--token", envvar="APP_TOKEN", required=True, help="Or set APP_TOKEN.")
@click.option("--out", type=click.File("w"), default="-", help="Output file, - for stdout.")
def cli(src, token, out):
    lines = sum(1 for _ in open(src))
    click.echo(f"{src}: {lines} lines (token {token[:3]}...)", file=out)

r = CliRunner()
print(r.invoke(cli, ["/data/orders.csv"], env={"APP_TOKEN": "abc123"}).output)
print(r.invoke(cli, ["/data/missing.csv", "--token", "t"]).output)
with r.isolated_filesystem():                     # a temp cwd, removed afterwards
    open("in.txt", "w").write("a\\nb\\n")
    print(r.invoke(cli, ["in.txt", "--token", "xyz", "--out", "report.txt"]).output, open("report.txt").read())`, note: '<code>click.Path</code> validates and hands you a string (add <code>path_type=pathlib.Path</code> for a Path). <code>click.File</code> opens lazily and closes for you; <code>-</code> means stdin/stdout.' },
    ] },
    { id: 'prompts', title: 'Prompts and confirmation', snippets: [
      { title: 'Prompt for missing values, hide passwords, confirm', code: `import click
from click.testing import CliRunner

@click.command()
@click.option("--name", prompt="Your name")               # asks only if not given
@click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True)
@click.confirmation_option(prompt="Really run?")           # adds --yes to skip
def cli(name, password):
    if click.confirm("Send a welcome email?", default=True):
        click.echo(f"emailing {name}")
    click.echo(f"{name}: password of {len(password)} chars")

r = CliRunner()
print(r.invoke(cli, input="Ann\\nsecret\\nsecret\\ny\\n\\n").output)     # answers each prompt
print(r.invoke(cli, ["--name", "Bo", "--yes"], input="pw\\npw\\nn\\n").output)
print(r.invoke(cli, ["--name", "Cy"], input="pw\\npw\\nn\\n").exit_code)   # declined → Aborted`, note: '<code>input=</code> feeds stdin line by line. <code>click.prompt("Port", type=int, default=8000)</code> asks ad hoc inside the function.' },
    ] },
    { id: 'groups', title: 'Groups and context', blurb: 'A group is a command that dispatches to subcommands. The Context links parent and child invocations.', snippets: [
      { title: 'A group with subcommands', code: `import click
from click.testing import CliRunner

@click.group()
def cli():
    """Order tools."""

@cli.command()
@click.argument("region", type=click.Choice(["North", "South", "East", "West"]))
@click.option("--limit", default=3, show_default=True)
def orders(region, limit):
    """List orders in REGION."""
    import csv
    rows = [r for r in csv.DictReader(open("/data/orders.csv")) if r["region"] == region]
    for r in rows[:limit]:
        click.echo(f"{r['order_id']}  {r['date']}  {r['status']}")

@cli.command("ship")                      # explicit name; default is the function name
@click.argument("ids", type=int, nargs=-1, required=True)
def ship_orders(ids):
    """Mark orders as shipped."""
    click.echo(f"shipping {len(ids)} orders")

r = CliRunner()
print(r.invoke(cli, ["orders", "North", "--limit", "2"]).output)
print(r.invoke(cli, ["ship", "7", "8"]).output)
print(r.invoke(cli, ["--help"]).output)`, note: 'Group options go before the subcommand (<code>cli -v orders</code>); subcommand options go after it. <code>cli.add_command(other)</code> attaches commands defined elsewhere.' },
      { title: 'Shared state with ctx.obj', code: `import click
from click.testing import CliRunner

@click.group()
@click.option("--verbose", "-v", is_flag=True)
@click.option("--db", default="/data/shop.sqlite", show_default=True)
@click.pass_context
def cli(ctx, verbose, db):
    ctx.ensure_object(dict)             # ctx.obj is None until someone sets it
    ctx.obj.update(verbose=verbose, db=db)

@cli.command()
@click.pass_obj                         # receives ctx.obj instead of ctx
def stats(obj):
    import sqlite3
    n = sqlite3.connect(obj["db"]).execute("SELECT count(*) FROM orders").fetchone()[0]
    click.echo(f"{n} orders" + (f" in {obj['db']}" if obj["verbose"] else ""))

r = CliRunner()
print(r.invoke(cli, ["stats"]).output)
print(r.invoke(cli, ["-v", "stats"]).output)`, note: 'The group callback runs first, then the subcommand. <code>@pass_context</code> gives the Context; <code>@pass_obj</code> gives just <code>ctx.obj</code>. <code>click.make_pass_decorator(Config)</code> builds a typed version.' },
      { title: 'Context: invoke, exit, invoked_subcommand', code: `import click
from click.testing import CliRunner

@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx):
    if ctx.invoked_subcommand is None:      # bare "cli" → run a default
        ctx.invoke(status, short=True)

@cli.command()
@click.option("--short", is_flag=True)
def status(short):
    click.echo("ok" if short else "everything is fine")

@cli.command()
@click.pass_context
def deploy(ctx):
    click.echo("deploying...")
    if ctx.parent.params.get("dry_run"):
        ctx.exit(0)
    ctx.fail("no target configured")       # UsageError → exit 2

r = CliRunner()
print(r.invoke(cli, []).output)
print(r.invoke(cli, ["status"]).output)
res = r.invoke(cli, ["deploy"]); print(res.exit_code, res.output)`, note: 'Without <code>invoke_without_command=True</code>, a bare group prints its help and exits 2. <code>ctx.invoke(cmd, **kw)</code> calls another command with its defaults filled in.' },
    ] },
    { id: 'output', title: 'Output', snippets: [
      { title: 'echo, style, secho', code: `import click
from click.testing import CliRunner

@click.command()
def cli():
    click.echo("plain text to stdout")
    click.echo("this goes to stderr", err=True)
    click.secho("done", fg="green", bold=True)                  # style + echo
    click.echo(click.style("warn:", fg="yellow") + " disk at 91%")
    click.echo(click.style("link", underline=True, fg="bright_blue"))

r = CliRunner()
print(r.invoke(cli).output)                       # no tty → colours stripped
print(repr(CliRunner().invoke(cli, color=True).output))   # keep the ANSI codes`, note: '<code>click.echo</code> strips ANSI codes when stdout is not a terminal and handles Windows consoles. Plain <code>print</code> does neither, but still works.' },
      { title: 'Progress bars, pagers and editors (terminal only)', run: false, code: `import click, time

@click.command()
@click.argument("n", type=int, default=20)
def cli(n):
    with click.progressbar(range(n), label="Processing", show_pos=True) as items:
        for _ in items:
            time.sleep(0.05)
    with click.progressbar(length=1000, label="Bytes") as bar:
        for chunk in (250, 250, 500):
            bar.update(chunk)
    click.echo_via_pager("\\n".join(f"line {i}" for i in range(200)))   # less/more
    text = click.edit("# notes\\n")          # opens $EDITOR, returns None if unchanged
    click.pause()                            # "Press any key to continue..."

if __name__ == "__main__":
    cli()`, note: 'The bar is hidden when stdout is not a TTY (CliRunner, pipes, CI): only the label is printed. <code>click.clear()</code>, <code>click.getchar()</code> and <code>click.launch(url)</code> are the other terminal helpers.' },
    ] },
    { id: 'testing', title: 'Testing and packaging', snippets: [
      { title: 'CliRunner: output, exit code, exceptions', code: `import click
from click.testing import CliRunner

@click.command()
@click.option("--fail", is_flag=True)
@click.option("--crash", is_flag=True)
def cli(fail, crash):
    if crash:
        raise RuntimeError("unexpected")     # a real bug, not a click error
    if fail:
        raise click.ClickException("known problem")
    click.echo("fine")

r = CliRunner()
ok = r.invoke(cli); print(ok.exit_code, ok.output.strip())
bad = r.invoke(cli, ["--fail"]); print(bad.exit_code, bad.output.strip())
crash = r.invoke(cli, ["--crash"]); print(crash.exit_code, type(crash.exception).__name__)
assert ok.exit_code == 0 and "fine" in ok.output
# r.invoke(cli, ["--crash"], catch_exceptions=False)   # let it raise inside pytest instead`, note: 'Unhandled exceptions are caught and stored on <code>result.exception</code> with exit code 1, which makes a test pass silently unless you assert on <code>exit_code</code>. In click 8.2+ <code>result.stderr</code> is always available and <code>result.output</code> interleaves both streams.' },
      { title: 'Run it as a script or install it as a command', run: false, code: `# app.py
import click

@click.group()
@click.version_option("1.2.0", prog_name="orders")   # adds --version
def cli():
    """Order tools."""

if __name__ == "__main__":
    cli()            # parses sys.argv; python app.py orders North

# pyproject.toml — installs an "orders" executable on pip install
# [project.scripts]
# orders = "app:cli"

# shell completion (bash/zsh/fish), once per shell:
#   eval "$(_ORDERS_COMPLETE=bash_source orders)"`, note: 'Set <code>CLICK</code>-style env prefixes with <code>auto_envvar_prefix="ORDERS"</code> on <code>cli()</code> so <code>ORDERS_ORDERS_LIMIT=5</code> fills <code>--limit</code> automatically.' },
    ] },
  ],
  concepts: [
    { id: 'pipeline', title: 'From decorator to function call', intro: 'What the decorators build, and what happens to argv before your function runs. Knowing the order (parse → envvar/default → type → callback → call) explains most surprises.', explainer: pipelineExplainer },
  ],
  compare: [
    { title: 'Argument, option or flag?', columns: ['@click.argument', '@click.option', 'option with is_flag', 'option with prompt'], rows: [
      ['Given as', 'positional token', '--name value', '--name (present or not)', '--name value, else asked'],
      ['Required by default', true, false, false, false],
      ['Own help text in --help', false, true, true, true],
      ['Reads an envvar', { part: 'envvar= only' }, true, true, true],
      ['Several values', 'nargs=N or -1', 'multiple=True or nargs', 'count=True', { part: 'no' }],
      ['Good for', 'the main input (file, name)', 'settings with defaults', 'on/off switches', 'secrets, interactive setup'],
    ], verdict: 'One or two arguments for the thing the command acts on; everything else an option with a default. Flags for booleans, and <code>--x/--no-x</code> when the default is on.' },
    { title: 'Ways to stop', columns: ['ctx.exit(code)', 'click.ClickException', 'click.UsageError / ctx.fail', 'click.BadParameter', 'click.Abort'], rows: [
      ['Exit code', 'as given', '1', '2', '2', '1'],
      ['Prints usage line', false, false, true, true, false],
      ['Message', 'none', 'Error: msg', 'Error: msg', "Error: Invalid value for '--x': msg", 'Aborted!'],
      ['Use when', 'work is done early', 'expected failure', 'arguments do not fit together', 'one value is wrong', 'user said no'],
    ], note: 'All of these are caught by click and turned into output plus an exit code; a plain Python exception escapes as a traceback (exit 1).' },
  ],
  gotchas: [
    { title: 'The function parameter must match the derived name', bad: `@click.option("--out-file")
def cli(outfile): ...
# TypeError: unexpected keyword argument 'out_file'`, good: `@click.option("--out-file")
def cli(out_file): ...
# or choose the name explicitly:
@click.option("--out-file", "dest")
def cli(dest): ...`, why: 'click takes the longest long option, strips the dashes and turns the remaining dashes into underscores. A bare identifier in the decorator overrides that.' },
    { title: 'multiple and nargs give tuples, not lists', bad: `@click.option("--tag", multiple=True)
def cli(tag):
    tag.append("default")   # AttributeError: tuple`, good: `@click.option("--tag", multiple=True)
def cli(tag):
    tags = list(tag) or ["default"]`, why: 'Every repeated parameter arrives as a tuple, and an absent one as an empty tuple (never <code>None</code>). Convert if you need to mutate it.' },
    { title: 'A flag that defaults to on cannot be switched off', bad: `@click.option("--cache", is_flag=True, default=True)
# --cache is always True; there is no --no-cache`, good: `@click.option("--cache/--no-cache", default=True)
def cli(cache): ...`, why: 'A single flag only sets its value when present. The slash form declares both switches, and <code>--help</code> shows the pair.' },
    { title: 'A bare group prints help instead of running', bad: `@click.group()
def cli():
    click.echo("setting up")   # runs only before a subcommand
# "cli" with no subcommand → usage text, exit 2`, good: `@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx):
    if ctx.invoked_subcommand is None:
        click.echo("no subcommand given")`, why: 'A group needs a subcommand unless told otherwise. Inside the callback, <code>ctx.invoked_subcommand</code> tells you whether one follows.' },
  ],
  presets: [
    { title: 'A small orders CLI', code: `import click, csv
from click.testing import CliRunner

@click.group()
def cli():
    """Order tools."""

@cli.command()
@click.argument("region", type=click.Choice(["North", "South", "East", "West"]))
@click.option("--status", default="shipped", show_default=True)
def count(region, status):
    rows = [r for r in csv.DictReader(open("/data/orders.csv")) if r["region"] == region and r["status"] == status]
    click.secho(f"{len(rows)} {status} orders in {region}", fg="green")

print(CliRunner().invoke(cli, ["count", "North", "--status", "returned"], color=True).output)
print(CliRunner().invoke(cli, ["count", "--help"]).output)` },
  ],
};
