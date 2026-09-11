import { scene } from '../../js/explainer.js';

const signatureExplainer = {
  hold: 3200,
  code: ['def deploy(', '    target: str,', '    replicas: int = 2,', '    dry_run: bool = False,', '): ...', 'app.command()(deploy)  →  deploy web --replicas 3'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 30, label, cls);
    s.text('h1', 20, 22, 'signature (inspect)', 'lbl sm bold ink-2', undefined, 'start');
    s.text('h2', 290, 22, 'click parameters typer builds', 'lbl sm bold ink-2', undefined, 'start');
    s.text('h3', 600, 22, 'argv', 'lbl sm bold ink-2', undefined, 'start');
    box('s0', 20, 36, 230, 'target: str', 'cell ghost');
    box('s1', 20, 82, 230, 'replicas: int = 2', 'cell ghost');
    box('s2', 20, 128, 230, 'dry_run: bool = False', 'cell ghost');
    s.text('r0', 20, 68, '', 'lbl sm ink-2', undefined, 'start');
    s.text('r1', 20, 114, '', 'lbl sm ink-2', undefined, 'start');
    s.text('r2', 20, 160, '', 'lbl sm ink-2', undefined, 'start');
    box('p0', 290, 36, 280, 'Argument TARGET', 'cell hid');
    box('p1', 290, 82, 280, 'Option --replicas', 'cell hid');
    box('p2', 290, 128, 280, 'Option --dry-run / --no-dry-run', 'cell hid');
    s.arrow('m0', 254, 51, 286, 51, 'arrow hid'); s.arrow('m1', 254, 97, 286, 97, 'arrow hid'); s.arrow('m2', 254, 143, 286, 143, 'arrow hid');
    box('t0', 600, 36, 60, '"web"', 'cell hid');
    box('t1', 600, 82, 140, '"--replicas" "3"', 'cell hid');
    box('t2', 600, 128, 100, '(absent)', 'cell ghost hid');
    s.arrow('a0', 596, 51, 574, 51, 'arrow hid'); s.arrow('a1', 596, 97, 574, 97, 'arrow hid'); s.arrow('a2', 596, 143, 574, 143, 'arrow hid');
    s.text('note', 290, 186, '', 'lbl sm ink-2', undefined, 'start');
    box('call', 290, 210, 380, 'deploy(target="web", replicas=3, dry_run=False)', 'cell ok hid');
    box('ann', 20, 270, 720, 'Annotated[int, typer.Option("-r", min=1, help="Pods")]  →  same Option + short flag, range check, help', 'cell info hid');
    s.arrow('ac', 430, 160, 430, 206, 'arrow hid');
    return s;
  },
  steps: [
    { title: 'typer reads the signature', caption: 'app.command() does not parse anything. It calls inspect.signature on your function and looks at each parameter: its name, its type hint and whether it has a default.', lines: [0, 1, 2, 3],
      patch: { 's0.r': { cls: 'cell hot' }, 's1.r': { cls: 'cell hot' }, 's2.r': { cls: 'cell hot' } } },
    { title: 'No default → Argument, default → Option', caption: 'That is the whole rule. target has no default, so it becomes a required positional argument. replicas and dry_run have defaults, so they become options named after the parameter, underscores turned into dashes.', lines: [1, 2, 3],
      patch: { p0: { cls: '' }, p1: { cls: '' }, p2: { cls: '' }, m0: { cls: 'arrow hot' }, m1: { cls: 'arrow hot' }, m2: { cls: 'arrow hot' }, r0: { text: 'no default → Argument' }, r1: { text: 'has default → Option' }, r2: { text: 'has default → Option' } } },
    { title: 'Type hints pick the click type', caption: 'str → STRING, int → INT, float → FLOAT, Path → click.Path, Enum → Choice of its values, list[T] → multiple=True. A bool becomes a flag pair --dry-run/--no-dry-run so the default can be switched either way.', lines: [1, 2, 3],
      patch: { 'p0.t': { text: 'Argument TARGET · STRING' }, 'p1.t': { text: 'Option --replicas · INT · default 2' }, 'p2.t': { text: '--dry-run/--no-dry-run · flag · False' }, 'p0.r': { cls: 'cell info' }, 'p1.r': { cls: 'cell info' }, 'p2.r': { cls: 'cell info' }, 's0.r': { cls: 'cell ghost' }, 's1.r': { cls: 'cell ghost' }, 's2.r': { cls: 'cell ghost' } } },
    { title: 'click parses argv against those parameters', caption: 'From here on it is plain click: "web" fills the argument, --replicas takes the next token and INT converts it, the absent flag falls back to its default. A bad token exits with code 2 before your code runs.', lines: [5],
      patch: { t0: { cls: '' }, t1: { cls: '' }, t2: { cls: '' }, a0: { cls: 'arrow hot' }, a1: { cls: 'arrow hot' }, a2: { cls: 'arrow ghost' }, note: { text: '"3" → int("3") → 3      no --dry-run token → default False' } } },
    { title: 'Your function is called with typed values', caption: 'The converted values are passed as keyword arguments. Inside deploy, replicas is already an int and dry_run a bool, so there is no parsing code to write.', lines: [0, 4],
      patch: { call: { cls: '' }, ac: { cls: 'arrow ok' }, 'p0.r': { cls: 'cell ok' }, 'p1.r': { cls: 'cell ok' }, 'p2.r': { cls: 'cell ok' } } },
    { title: 'Annotated adds what the hint cannot say', caption: 'Wrap the hint in Annotated[..., typer.Option(...)] to add help text, short names, ranges, env vars, prompts or a rich help panel. The classification rule still applies unless you use typer.Argument explicitly.', lines: [2],
      patch: { ann: { cls: '' }, call: { cls: 'dim' }, ac: { cls: 'arrow hid' } } },
  ],
};

export default {
  id: 'typer', name: 'typer', glyph: 'ty', group: 'automation', version: '0.27', keywords: 'cli command line type hints annotated argument option click rich help',
  tagline: 'CLIs from type-hinted functions, with rich help built in.',
  install: 'pip install typer', docs: 'https://typer.tiangolo.com/', packages: ['pip:typer', 'pip:rich>=13.8', 'click'],
  overview: {
    what: 'typer builds a click command from a function signature. Parameters without defaults become arguments, parameters with defaults become options, and type hints (int, bool, Path, Enum, list[str]) decide parsing and validation. Annotated adds help text, short flags, ranges and env vars. With rich installed, --help and errors render in panels. Everything click offers is still there underneath.',
    yes: ['Scripts and tools where you already write type hints.', 'Multi-command apps (subcommands, nested groups) with shared options.', 'Pretty, consistent --help without writing it by hand.', 'You want editor completion and static checking on CLI parameters.'],
    no: ['You need click-level control (custom parameter types, parsers, contexts): use click directly.', 'A one-argument script (sys.argv[1] is enough).', 'Full-screen interactive terminal apps (Textual).'],
    note: 'Snippets invoke the app with <code>typer.testing.CliRunner</code> and print <code>.output</code>; locally you would end the file with <code>if __name__ == "__main__": app()</code>. The first run installs typer and rich from PyPI (about 10 s).',
  },
  cheatsheet: [
    { id: 'first', title: 'Commands from type hints', blurb: 'No default → positional argument. Default → option. The hint picks the parser.', snippets: [
      { title: 'One function, one command', code: `import typer
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def hello(name: str, count: int = 1, shout: bool = False):
    """Greet NAME, COUNT times."""
    msg = f"Hello, {name}!"
    for _ in range(count):
        print(msg.upper() if shout else msg)

# locally:  if __name__ == "__main__": app()       or  typer.run(hello)
runner = CliRunner()
print(runner.invoke(app, ["Ann", "--count", "2", "--shout"]).output)
print(runner.invoke(app, ["--help"]).output)
r = runner.invoke(app, ["Ann", "--count", "two"]); print(r.exit_code, r.output)`, note: 'A single <code>@app.command()</code> is invoked directly (<code>hello Ann</code>, not <code>hello hello Ann</code>). <code>bool</code> becomes <code>--shout/--no-shout</code>; the default decides which one is shown.' },
      { title: 'Annotated: help, short names, ranges', code: `import typer
from typing import Annotated
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def hello(
    name: Annotated[str, typer.Argument(help="Who to greet.")],
    count: Annotated[int, typer.Option("--count", "-c", help="Repeat.", min=1, max=5)] = 1,
    shout: Annotated[bool, typer.Option("--shout", "-s", help="Upper-case it.")] = False,
):
    """Greet NAME."""
    for _ in range(count):
        print(f"HELLO {name}" if shout else f"Hello {name}")

runner = CliRunner()
print(runner.invoke(app, ["Ann", "-c", "2", "-s"]).output)
print(runner.invoke(app, ["--help"]).output)
print(runner.invoke(app, ["Ann", "-c", "9"]).output)`, note: 'The default stays on the right of <code>=</code>; <code>typer.Option(...)</code> only carries metadata. Naming the flag explicitly (<code>"--shout"</code>) drops the automatic <code>--no-shout</code>.' },
    ] },
    { id: 'types', title: 'Parameter types', snippets: [
      { title: 'Enums, lists and dates', code: `import typer
from enum import Enum
from datetime import datetime
from typer.testing import CliRunner

class Region(str, Enum):
    north = "North"
    south = "South"

app = typer.Typer()

@app.command()
def report(region: Region = Region.north, ids: list[int] = [], since: datetime = datetime(2026, 1, 1)):
    print(f"{region.value=} {ids=} {since.date()=}")

runner = CliRunner()
print(runner.invoke(app, ["--region", "South", "--ids", "3", "--ids", "4", "--since", "2026-03-01"]).output)
print(runner.invoke(app, ["--region", "West"]).output)`, note: 'An Enum turns into a <code>Choice</code> of its <em>values</em> and you receive the member. <code>list[int]</code> as an option repeats the flag; as an argument it takes any number of positionals.' },
      { title: 'Paths and environment variables', code: `import typer
from pathlib import Path
from typing import Annotated
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def count(
    src: Annotated[Path, typer.Argument(exists=True, dir_okay=False, readable=True)],
    token: Annotated[str, typer.Option(envvar="APP_TOKEN", help="Or set APP_TOKEN.")] = "anon",
    out: Annotated[Path | None, typer.Option(help="Write here instead of stdout.")] = None,
):
    msg = f"{src.name}: {sum(1 for _ in src.open())} lines (token {token})"
    if out:
        out.write_text(msg); print("wrote", out)
    else:
        print(msg)

runner = CliRunner()
print(runner.invoke(app, ["/data/orders.csv"], env={"APP_TOKEN": "abc"}).output)
print(runner.invoke(app, ["/data/orders.csv", "--out", "/tmp/report.txt"]).output, open("/tmp/report.txt").read())
print(runner.invoke(app, ["/data/missing.csv"]).output)`, note: 'You get a real <code>pathlib.Path</code>. <code>Path | None = None</code> is the idiom for an optional option; the hint must allow <code>None</code>.' },
      { title: 'Prompts and confirmation', code: `import typer
from typing import Annotated
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def login(
    user: Annotated[str, typer.Option(prompt=True)],
    password: Annotated[str, typer.Option(prompt=True, hide_input=True, confirmation_prompt=True)],
):
    if not typer.confirm("Proceed?"):
        raise typer.Abort()
    typer.secho(f"{user} logged in ({len(password)} chars)", fg=typer.colors.GREEN)

runner = CliRunner()
print(runner.invoke(app, input="ann\\npw\\npw\\ny\\n").output)          # every prompt answered from stdin
r = runner.invoke(app, ["--user", "bo"], input="pw\\npw\\nn\\n")
print(r.exit_code, repr(r.output))`, note: '<code>prompt=True</code> asks only when the option is missing. <code>typer.prompt("Port", type=int, default=8000)</code> asks ad hoc; <code>typer.Abort()</code> prints <em>Aborted.</em> and exits 1.' },
    ] },
    { id: 'apps', title: 'Subcommands and callbacks', snippets: [
      { title: 'A multi-command app with shared state', code: `import typer
from typing import Annotated
from typer.testing import CliRunner

app = typer.Typer(help="Order tools.", no_args_is_help=True)

@app.callback()
def main(ctx: typer.Context, verbose: Annotated[bool, typer.Option("--verbose", "-v")] = False):
    """Runs before every command; put shared setup here."""
    ctx.obj = {"verbose": verbose}

@app.command("list")                      # explicit name: "list" shadows the builtin
def list_orders(ctx: typer.Context, region: str = "North", limit: int = 3):
    import csv
    rows = [r for r in csv.DictReader(open("/data/orders.csv")) if r["region"] == region][:limit]
    for r in rows:
        print(r["order_id"], r["status"], r["date"] if ctx.obj["verbose"] else "")

@app.command()
def ship(ids: list[int]):
    print("shipping", ids)

runner = CliRunner()
print(runner.invoke(app, ["list", "--limit", "2"]).output)
print(runner.invoke(app, ["-v", "list"]).output)
print(runner.invoke(app, ["ship", "7", "8"]).output)
print(runner.invoke(app, []).output)`, note: 'Function names become command names with underscores turned into dashes (<code>list_orders</code> → <code>list-orders</code>) unless you pass a name. <code>ctx.obj</code> is the click context object.' },
      { title: 'Nested apps with add_typer', code: `import typer
from typer.testing import CliRunner

app = typer.Typer()
orders = typer.Typer(help="Manage orders.")
users = typer.Typer(help="Manage users.")
app.add_typer(orders, name="orders")
app.add_typer(users, name="users")

@orders.command("list")
def orders_list(status: str = "shipped"):
    print("orders with status", status)

@orders.command()
def cancel(order_id: int, reason: str = "customer request"):
    print(f"cancelled #{order_id}: {reason}")

@users.command()
def add(name: str):
    print("added", name)

runner = CliRunner()
print(runner.invoke(app, ["orders", "cancel", "42", "--reason", "damaged"]).output)
print(runner.invoke(app, ["users", "add", "Ann"]).output)
print(runner.invoke(app, ["orders", "--help"]).output)`, note: 'Each sub-app can have its own <code>@callback()</code> for group-level options. Split them across modules and <code>add_typer</code> them in one place.' },
      { title: 'Version flag with an eager callback', code: `import typer
from typing import Annotated
from typer.testing import CliRunner

__version__ = "1.4.0"
app = typer.Typer()

def show_version(value: bool):
    if value:
        print(f"orders {__version__}")
        raise typer.Exit()

@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    version: Annotated[bool, typer.Option("--version", callback=show_version, is_eager=True)] = False,
):
    if ctx.invoked_subcommand is None:
        print("no command given; try --help")

@app.command()
def sync():
    print("syncing")

runner = CliRunner()
print(runner.invoke(app, ["--version"]).output)
print(runner.invoke(app, []).output)
print(runner.invoke(app, ["sync"]).output)`, note: '<code>is_eager=True</code> runs the callback before other parameters are validated, so <code>--version</code> works even when required arguments are missing. <code>typer.Exit()</code> stops with code 0.' },
    ] },
    { id: 'exit', title: 'Exit codes and errors', snippets: [
      { title: 'typer.Exit, BadParameter and result.exit_code', code: `import typer
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def check(port: int, strict: bool = False):
    if port < 1024:
        raise typer.BadParameter("must be 1024 or higher", param_hint="PORT")   # exit 2
    if strict and port > 49151:
        typer.echo("ephemeral range not allowed", err=True)
        raise typer.Exit(code=3)                                                 # your code
    print("port ok")
    return 1        # ignored: return values never set the exit code

runner = CliRunner()
for args in (["8080"], ["80"], ["60000", "--strict"]):
    r = runner.invoke(app, args)
    print(args, "→ exit", r.exit_code, "|", r.output.strip().replace("\\n", " ")[:90])`, note: 'Under <code>CliRunner</code>, an uncaught Python exception is stored on <code>result.exception</code> with exit code 1; pass <code>catch_exceptions=False</code> to let it raise inside pytest.' },
    ] },
    { id: 'help', title: 'Help and output', snippets: [
      { title: 'Rich help: panels, markup, epilog', code: `import typer
from typing import Annotated
from typer.testing import CliRunner

app = typer.Typer(rich_markup_mode="rich")

@app.command(epilog="Docs: [link=https://typer.tiangolo.com]typer.tiangolo.com[/link]")
def deploy(
    target: Annotated[str, typer.Argument(help="Host to deploy to.")],
    replicas: Annotated[int, typer.Option(help="Pods to run.", rich_help_panel="Scaling", min=1, max=10)] = 2,
    dry_run: Annotated[bool, typer.Option(help="Print the plan, change nothing.", rich_help_panel="Safety")] = False,
):
    """Deploy [bold green]TARGET[/] to the cluster.

    The first paragraph is the summary; this one appears in the full help.
    """
    print(target, replicas, dry_run)

print(CliRunner().invoke(app, ["--help"]).output)`, note: '<code>rich_markup_mode="rich"</code> enables <code>[bold]</code> tags in help strings; <code>"markdown"</code> renders Markdown instead. Set <code>add_completion=False</code> on the Typer to hide the completion options.' },
      { title: 'Printing: typer.echo, colours, rich', code: `import typer
from rich.console import Console
from rich.table import Table
from typer.testing import CliRunner

app = typer.Typer()
console = Console(force_terminal=True, color_system="standard", width=60)

@app.command()
def status():
    typer.echo("plain line")
    typer.echo("to stderr", err=True)
    typer.secho("all good", fg=typer.colors.GREEN, bold=True)
    typer.echo(typer.style("careful", fg=typer.colors.YELLOW) + " with disk space")
    table = Table("service", "state")
    table.add_row("api", "[green]up[/]"); table.add_row("worker", "[red]down[/]")
    console.print(table)                       # rich renderables through a console

print(CliRunner().invoke(app, color=True).output)`, note: '<code>typer.echo</code> and <code>secho</code> are click\'s. For tables, trees and syntax use rich directly; typer already depends on it.' },
    ] },
    { id: 'testing', title: 'Testing and packaging', snippets: [
      { title: 'CliRunner in a pytest test', code: `import typer
from typer.testing import CliRunner

app = typer.Typer()

@app.command()
def add(a: int, b: int, verbose: bool = False):
    if verbose:
        print(f"{a} + {b} =", end=" ")
    print(a + b)

runner = CliRunner()

def test_add():
    result = runner.invoke(app, ["2", "3"])
    assert result.exit_code == 0
    assert result.output.strip() == "5"

def test_add_rejects_text():
    result = runner.invoke(app, ["2", "three"])
    assert result.exit_code == 2
    assert "three" in result.output

test_add(); test_add_rejects_text(); print("2 tests passed")`, note: 'Instantiate one <code>CliRunner</code> per module. <code>invoke</code> accepts <code>input=</code>, <code>env=</code> and <code>catch_exceptions=</code> exactly like click\'s runner.' },
      { title: 'Run, install and ship it', run: false, code: `# app.py
import typer
app = typer.Typer()

@app.command()
def sync(dry_run: bool = False): ...

if __name__ == "__main__":
    app()

# during development, no boilerplate needed:
#   typer app.py run sync --dry-run
#
# pyproject.toml — "orders" becomes an executable on pip install
# [project.scripts]
# orders = "app:app"
#
# shell completion, once:  orders --install-completion`, note: 'The <code>typer</code> command runs any file that defines an <code>app</code> (or a function) and adds <code>utils docs</code> to generate Markdown from the help text.' },
    ] },
  ],
  concepts: [
    { id: 'signature', title: 'Signature → click parameters → call', intro: 'typer never parses argv itself. It reads your function signature, builds click Arguments and Options from it, and lets click do the rest. Seeing the translation explains every naming and typing rule.', explainer: signatureExplainer },
  ],
  compare: [
    { title: 'Four ways to declare a parameter', columns: ['name: str', 'name: str = "x"', 'Annotated[str, Argument(...)]', 'Annotated[str, Option(...)]'], rows: [
      ['Becomes', 'required argument', 'option --name', 'argument', 'option'],
      ['Help text', false, false, true, true],
      ['Short flag (-n)', false, false, { part: 'n/a' }, true],
      ['envvar, prompt, ranges', false, false, true, true],
      ['Optional argument', false, { part: 'no (becomes option)' }, 'give it a default', { part: 'n/a' }],
    ], verdict: 'Start with bare hints. Reach for <code>Annotated</code> as soon as you want help text, and for <code>typer.Argument</code> when a positional needs a default.' },
    { title: 'Printing from a command', columns: ['print', 'typer.echo / secho', 'rich.print', 'Console.print'], rows: [
      ['Colour', false, 'fg=, bold=', 'markup tags', 'markup + Style'],
      ['Strips colour when piped', { part: 'n/a' }, true, true, true],
      ['err=True to stderr', false, true, { part: 'file=sys.stderr' }, 'Console(stderr=True)'],
      ['Tables, trees, panels', false, false, true, true],
      ['Captured by CliRunner', true, true, true, { part: 'unless file= was fixed' }],
    ], note: '<code>Console()</code> looks up <code>sys.stdout</code> at call time, so CliRunner captures it; <code>Console(file=sys.stdout)</code> binds to the stream that existed when it was created and escapes capture.' },
  ],
  gotchas: [
    { title: 'Adding a second command changes how the first is called', bad: `app = typer.Typer()
@app.command()
def hello(name: str): ...
@app.command()
def bye(name: str): ...
runner.invoke(app, ["Ann"])      # exit 2: "No such command 'Ann'"`, good: `runner.invoke(app, ["hello", "Ann"])
# single-command apps skip the name; add a callback to force
# subcommand mode from the start:
@app.callback()
def main(): ...`, why: 'With exactly one command and no callback, typer exposes it directly. The moment a second command or a callback appears, every command needs its name.' },
    { title: 'Return values do not set the exit code', bad: `@app.command()
def check(port: int):
    if port < 1024:
        print("bad port")
        return 1          # exit code is still 0`, good: `@app.command()
def check(port: int):
    if port < 1024:
        typer.echo("bad port", err=True)
        raise typer.Exit(code=1)`, why: 'click ignores the callback\'s return value. Only <code>typer.Exit</code>, <code>typer.Abort</code>, click exceptions or <code>sys.exit</code> change the code the shell sees.' },
    { title: 'A list option repeats the flag; values are not space-separated', bad: `def cli(tag: list[str] = []): ...
# cli --tag a b   → error: "Got unexpected extra argument (b)"`, good: `# cli --tag a --tag b
def cli(tag: list[str] = []): ...
# or make it a positional list: cli a b c
def cli(tags: list[str]): ...`, why: 'An option consumes exactly one token per occurrence. Only a list <em>argument</em> (or <code>Option(..., nargs=N)</code> via click) grabs several tokens in a row.' },
    { title: 'Optional needs None in the hint and the default', bad: `def cli(out: Path = None): ...
# typer infers Path and warns; --out cannot be "unset"`, good: `def cli(out: Path | None = None): ...
# (Optional[Path] on older Pythons)`, why: 'The hint decides the parser and the default decides the fallback. A default of <code>None</code> with a non-optional hint contradicts itself; the union tells typer that absence is a valid state.' },
  ],
  presets: [
    { title: 'Orders CLI with typer', code: `import csv, typer
from typing import Annotated
from typer.testing import CliRunner

app = typer.Typer(help="Order tools.")

@app.command()
def count(region: Annotated[str, typer.Argument(help="North, South, East or West")],
          status: Annotated[str, typer.Option("--status", "-s")] = "shipped"):
    """Count orders in REGION with a given STATUS."""
    rows = [r for r in csv.DictReader(open("/data/orders.csv")) if r["region"] == region and r["status"] == status]
    typer.secho(f"{len(rows)} {status} orders in {region}", fg=typer.colors.GREEN)

runner = CliRunner()
print(runner.invoke(app, ["North", "-s", "returned"], color=True).output)
print(runner.invoke(app, ["--help"]).output)` },
  ],
};
