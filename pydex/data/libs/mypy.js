import { scene } from '../../js/explainer.js';

const narrowingExplainer = {
  hold: 3200,
  code: ['def label(x: int | str | None) -> str:', '    if x is None:', '        return "none"', '    if isinstance(x, int):', '        return str(x + 1)', '    return x.upper()', 'label(3.5)'],
  build() {
    const s = scene(760, 330);
    const lines = ['def label(x: int | str | None) -> str:', '    if x is None:', '        return "none"', '    if isinstance(x, int):', '        return str(x + 1)', '    return x.upper()', 'label(3.5)'];
    s.text('ct', 20, 28, 'source', 'lbl sm bold ink-2', undefined, 'start');
    lines.forEach((t, i) => {
      const g = s.g(`l${i}`, 20, 40 + i * 34);
      s.rect(`l${i}.r`, 0, 0, 420, 28, 'cell', g);
      s.text(`l${i}.t`, 10, 14, t, 'lbl', g, 'start');
    });
    s.text('pt', 480, 28, 'what mypy knows about x', 'lbl sm bold ink-2', undefined, 'start');
    s.rect('panel', 480, 40, 260, 130, 'panel', undefined, 8);
    s.cell('c-int', 494, 54, 70, 30, 'int', 'cell');
    s.cell('c-str', 574, 54, 70, 30, 'str', 'cell');
    s.cell('c-none', 654, 54, 74, 30, 'None', 'cell');
    s.text('where', 610, 106, 'at line 1: int | str | None', 'lbl sm ink-2');
    s.text('after', 610, 130, '', 'lbl sm ink-2');
    s.text('after2', 610, 152, '', 'lbl sm ink-2');
    s.cell('err', 480, 190, 260, 32, '', 'cell hid');
    s.text('errt', 480, 240, '', 'lbl sm ink-2', undefined, 'start');
    s.text('errt2', 480, 260, '', 'lbl sm ink-2', undefined, 'start');
    s.text('errt3', 480, 280, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The annotation is the starting fact', caption: 'Inside label, x is declared as int | str | None. mypy does not run the code; it tracks a set of possible types for x and updates that set at every branch.', lines: [0],
      patch: { 'l0.r': { cls: 'cell hot' }, 'c-int.r': { cls: 'cell hot' }, 'c-str.r': { cls: 'cell hot' }, 'c-none.r': { cls: 'cell hot' } } },
    { title: 'x is None splits the union', caption: 'Inside the if, x is None and the return leaves the function. On the line after the if, None has been eliminated: x is int | str. An early return narrows just as well as an else.', lines: [1, 2],
      patch: { 'l0.r': { cls: 'cell' }, 'l1.r': { cls: 'cell hot' }, 'l2.r': { cls: 'cell hot' }, 'c-none': { cls: 'dim' }, 'c-none.r': { cls: 'cell err' }, where: { text: 'inside the if: None' }, after: { text: 'after line 3: int | str' } } },
    { title: 'isinstance narrows again', caption: 'In the branch x is int, so x + 1 is fine and str(...) matches the declared return type. After the return only str is left.', lines: [3, 4],
      patch: { 'l1.r': { cls: 'cell' }, 'l2.r': { cls: 'cell' }, 'l3.r': { cls: 'cell hot' }, 'l4.r': { cls: 'cell ok' }, 'c-int': { cls: 'dim' }, 'c-int.r': { cls: 'cell err' }, where: { text: 'inside the if: int' }, after: { text: 'after line 5: str' } } },
    { title: 'What remains is exactly str', caption: 'x.upper() type-checks because every other case has been ruled out. No cast, no assert: the control flow is the proof. The same works with match, in, ==, callable(), and TypeIs functions.', lines: [5],
      patch: { 'l3.r': { cls: 'cell' }, 'l4.r': { cls: 'cell' }, 'l5.r': { cls: 'cell ok' }, 'c-str.r': { cls: 'cell ok' }, where: { text: 'line 6: str' }, after: { text: 'x.upper() → str, matches -> str' } } },
    { title: 'A call that does not fit is reported at the call site', caption: 'label(3.5) passes a float. mypy compares the argument type with the parameter type and reports the mismatch where the call is, with the error code in brackets so it can be silenced precisely.', lines: [6],
      patch: { 'l5.r': { cls: 'cell' }, 'l6.r': { cls: 'cell err' }, err: { cls: '' }, 'err.r': { cls: 'cell err' }, 'err.t': { text: 'error at line 7  [arg-type]' }, errt: { text: 'Argument 1 to "label" has incompatible type' }, errt2: { text: '"float"; expected "int | str | None"' } } },
    { title: 'Remove a check and the error moves into the body', caption: 'Delete the isinstance branch and x is int | str at the last line. int has no .upper, so mypy reports [union-attr] there. Narrowing is why unions are usable at all: each check pays for the code below it.', lines: [3, 4, 5],
      patch: { l3: { cls: 'dim' }, l4: { cls: 'dim' }, 'l6.r': { cls: 'cell' }, 'l5.r': { cls: 'cell err' }, 'c-int': { cls: '' }, 'c-int.r': { cls: 'cell hot' }, 'c-str.r': { cls: 'cell hot' }, where: { text: 'line 6 without the isinstance: int | str' }, after: { text: '' }, 'err.t': { text: 'error at line 6  [union-attr]' }, errt: { text: 'Item "int" of "int | str" has no attribute "upper"' }, errt2: { text: '' } } },
  ],
};

export default {
  id: 'mypy', name: 'mypy', glyph: 'my', group: 'testing', version: '2.3', keywords: 'type checker static typing annotations protocol typeddict generics strict reveal_type',
  tagline: 'Static type checking for annotated Python, before anything runs.',
  install: 'pip install mypy', docs: 'https://mypy.readthedocs.io/', packages: [], runnable: false,
  overview: {
    what: 'mypy reads your annotations and checks that every call, assignment and return agrees with them, without executing the program. It follows PEP 484 and its successors, so the same annotations serve pyright, ty, IDEs and runtime tools like pydantic. Unannotated code is skipped by default, which is what makes gradual adoption possible: you can type one module at a time and turn the strictness up as you go.',
    yes: ['Codebases that other people call into: libraries, services with many contributors.', 'Catching None-handling bugs, wrong argument types and impossible branches before tests run.', 'Refactors: rename a field, change a return type, let the checker list every caller to fix.', 'Making editors precise: completions and go-to-definition follow the same types.'],
    no: ['Throwaway scripts where the feedback loop is running the script.', 'Heavily dynamic code (metaclasses, monkeypatching, getattr everywhere): expect many Any and ignores.', 'You want the fastest checker for editor feedback (pyright and ty are faster; mypy has the plugin ecosystem).'],
    note: 'mypy is a command-line tool that reads whole packages and their stubs from disk, so it does not run in the browser sandbox. Every snippet shows the code and mypy\'s verdict as comments; copy it into a file and run <code>mypy file.py</code> (or <code>mypy --strict file.py</code>) locally. Verdicts are from mypy 2.3.',
  },
  cheatsheet: [
    { id: 'run', title: 'Run it', snippets: [
      { title: 'A first run and how to read the output', code: `# app.py
def total(prices: list[float], discount: float | None = None) -> float:
    subtotal = sum(prices)
    return subtotal * (1 - discount)       # error: Unsupported operand types for - ("int" and "None")  [operator]

print(total([9.5, 20], "10%"))           # error: Argument 2 to "total" has incompatible type "str";
                                          #        expected "float | None"  [arg-type]
count: int = total([1.0])                 # error: Incompatible types in assignment (expression has type
                                          #        "float", variable has type "int")  [assignment]

# $ mypy app.py
# app.py:4: error: ...  [operator]
# app.py:6: error: ...  [arg-type]
# app.py:8: error: ...  [assignment]
# Found 3 errors in 1 file (checked 1 source file)`, note: 'Each error ends with a code in brackets. Codes are what you pass to <code># type: ignore[...]</code>, <code>--disable-error-code</code> and <code>--enable-error-code</code>.' },
      { title: 'Command line', code: `mypy src/                       # check a tree (needs __init__.py files, or --explicit-package-bases)
mypy -p myapp                   # a package by import name
mypy -m myapp.models            # one module
mypy app.py --strict            # everything strict (see the flag list below)
mypy --pretty --show-error-context app.py
mypy --num-workers 4 src/       # parallel type checking (mypy 2.0+; also MYPY_NUM_WORKERS)
mypy --install-types --non-interactive   # fetch missing stub packages from typeshed's list
mypy -c 'reveal_type(sorted)'   # check a code string
dmypy run -- src/               # daemon: keeps the cache warm; seconds → milliseconds on re-runs
mypy --html-report out/ src/    # how much of the code is precisely typed
stubgen -p legacy_lib -o stubs/ # generate .pyi stubs for an untyped package
stubtest mylib                  # compare a package's stubs against its runtime`, note: 'Python 3.10 is the oldest <code>--python-version</code> mypy 2.x will target. The cache in <code>.mypy_cache/</code> makes the second run much faster; the daemon makes it near-instant.' },
      { title: 'pyproject.toml', code: `[tool.mypy]
python_version = "3.12"
files = ["src", "tests"]
strict = true
warn_unreachable = true           # not part of strict
enable_error_code = ["possibly-undefined", "truthy-bool", "ignore-without-code", "redundant-expr"]
pretty = true
plugins = ["pydantic.mypy"]       # libraries with dynamic behaviour ship mypy plugins

[[tool.mypy.overrides]]           # loosen per module, never globally
module = ["legacy.*", "scripts.*"]
disallow_untyped_defs = false
check_untyped_defs = true

[[tool.mypy.overrides]]
module = ["yaml", "boto3.*", "some_untyped_lib"]
ignore_missing_imports = true     # only for packages with no stubs and no py.typed`, note: 'Options map one-to-one onto CLI flags: <code>--disallow-untyped-defs</code> becomes <code>disallow_untyped_defs</code>. Nearest config wins; <code>mypy.ini</code> and <code>setup.cfg</code> are also read.' },
      { title: 'What --strict turns on', code: `# --strict is a bundle; each flag can also be set on its own or per module.
--warn-unused-configs           # config sections that match no file
--disallow-any-generics         # list, dict, Callable need parameters: list[int] not list
--disallow-subclassing-any
--disallow-untyped-calls        # calling an unannotated function from typed code
--disallow-untyped-defs         # every def needs annotations
--disallow-incomplete-defs      # ...all of its arguments, not just some
--check-untyped-defs            # check bodies of unannotated functions too
--disallow-untyped-decorators
--warn-redundant-casts
--warn-unused-ignores           # a "# type: ignore" that silences nothing is an error
--warn-return-any               # returning Any from a function declared to return int
--no-implicit-reexport          # "from x import y" does not re-export y unless "as y"
--strict-equality               # 1 == "1" is always False: flag it
--extra-checks                  # stricter TypedDict/ParamSpec handling

# Already on by default in mypy 2.x (they used to be opt-in):
#   --local-partial-types   x = None at module level needs an annotation before a function assigns it
#   --strict-bytes          bytearray / memoryview are no longer accepted where bytes is expected
#   strict optional         int means int; write int | None when None is allowed
# Not included in --strict: --warn-unreachable, --disallow-any-explicit, --disallow-any-expr`, note: 'The exact list is printed by <code>mypy --help</code> under <code>--strict</code> and can grow between releases. Pin mypy in CI.' },
    ] },
    { id: 'annotate', title: 'Annotations and narrowing', blurb: 'Where the checker gets its facts, and how control flow refines them.', snippets: [
      { title: 'Inference, Optional, and return types', code: `from collections.abc import Iterable

names = ["ann", "bo"]                     # inferred: list[str]
ages: dict[str, int] = {}                 # empty containers need a hint
names.append(3)                           # error: Argument 1 to "append" of "list" has incompatible type "int"; expected "str"  [arg-type]

def find(items: Iterable[str], prefix: str) -> str | None:
    for it in items:
        if it.startswith(prefix):
            return it
    return None                           # fine; forgetting this line: error: Missing return statement  [return]

def shout(prefix: str = None) -> str:     # error: Incompatible default for argument "prefix" (default has type "None", argument has type "str")  [assignment]
    ...

first = find(names, "a")
print(first.upper())                      # error: Item "None" of "str | None" has no attribute "upper"  [union-attr]
if first is not None:
    print(first.upper())                  # ok`, note: 'Accept broad types (<code>Iterable</code>, <code>Mapping</code>, <code>Sequence</code>) and return precise ones (<code>list[str]</code>). Implicit Optional has been off since mypy 0.990: write <code>str | None = None</code>.' },
      { title: 'Narrowing: None, isinstance, in, match', code: `from typing import assert_never

def describe(x: int | str | list[int] | None) -> str:
    if x is None:
        return "nothing"
    reveal_type(x)                        # note: Revealed type is "int | str | list[int]"
    if isinstance(x, (int, str)):
        return str(x)
    reveal_type(x)                        # note: Revealed type is "list[int]"
    return ",".join(map(str, x))

def kind(code: str) -> str:
    if code in ("get", "put"):            # mypy 1.20+: narrows to Literal["get", "put"]
        reveal_type(code)                 # note: Revealed type is "Literal['get', 'put']"
    return code

def area(shape: tuple[str, float] | tuple[str, float, float]) -> float:
    match shape:
        case ("circle", r):
            return 3.14159 * r * r
        case ("rect", w, h):
            return w * h
        case _:
            return 0.0

def handle(x: int | str) -> None:
    if isinstance(x, int): ...
    elif isinstance(x, str): ...
    else:
        assert_never(x)                   # error here if a new member joins the union`, note: 'Narrowing applies to local variables and, with limits, to attributes like <code>self.x</code>. A function call in between does not reset it, which is a deliberate unsoundness.' },
      { title: 'TypeIs and TypeGuard: your own narrowing', code: `from typing import TypeGuard, TypeIs

def is_str_list(xs: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in xs)

def is_positive_int(x: object) -> TypeIs[int]:       # Python 3.13 / typing_extensions
    return isinstance(x, int) and x > 0                 # must be equivalent to isinstance for the type part

def process(raw: list[object], n: int | str) -> None:
    if is_str_list(raw):
        reveal_type(raw)                  # note: Revealed type is "list[str]"
    if is_positive_int(n):
        reveal_type(n)                    # note: Revealed type is "int"
    else:
        reveal_type(n)                    # note: Revealed type is "int | str"   (TypeIs: n may be a non-positive int)`, note: '<code>TypeIs</code> narrows both branches like <code>isinstance</code>; <code>TypeGuard</code> only narrows the positive branch and may return an unrelated type. Prefer <code>TypeIs</code> for "is it this type" checks.' },
    ] },
    { id: 'structural', title: 'Protocol and TypedDict', blurb: 'Describe a shape instead of naming a class.', snippets: [
      { title: 'Protocol: structural interfaces', code: `from typing import Protocol, runtime_checkable

class SupportsClose(Protocol):
    def close(self) -> None: ...

class Logger(Protocol):
    name: str
    def log(self, msg: str, /) -> None: ...

class FileSink:                           # no inheritance needed
    name = "file"
    def log(self, msg: str, /) -> None:
        print(msg)
    def close(self) -> None: ...

def shutdown(x: SupportsClose) -> None:
    x.close()

shutdown(FileSink())                      # ok: has close()
shutdown(open("/tmp/x", "w"))             # ok: file objects have close()
shutdown(42)                              # error: Argument 1 to "shutdown" has incompatible type "int"; expected "SupportsClose"  [arg-type]

@runtime_checkable
class Sized(Protocol):
    def __len__(self) -> int: ...
isinstance([], Sized)                     # True; only method presence is checked at runtime`, note: 'The stdlib ships many: <code>Iterable</code>, <code>Sized</code>, <code>SupportsIndex</code>, <code>Hashable</code>. A Protocol with a method that does not match reports every missing or mis-typed member in a note.' },
      { title: 'TypedDict: dicts with known keys', code: `from typing import TypedDict, NotRequired, Required
import json

class Order(TypedDict):
    order_id: int
    region: str
    quantity: int
    note: NotRequired[str]                # may be absent

class Partial(TypedDict, total=False):    # everything optional...
    id: Required[int]                     # ...except this

def shipping(o: Order) -> float:
    return 4.99 if o["region"] == "North" else 6.99

o: Order = {"order_id": 1, "region": "North", "quantity": 2}
o["quantity"] += 1                        # ok
o["qty"] = 3                              # error: TypedDict "Order" has no key "qty"  [typeddict-unknown-key]
o.get("note", "").upper()                 # ok: get with a default
raw = json.loads('{"order_id": 1}')       # Any: JSON is untyped
shipping(raw)                             # accepted (Any), checked by nothing; validate with pydantic first
shipping({"order_id": 1, "region": "N"})  # error: Missing key "quantity" for TypedDict "Order"  [typeddict-item]`, note: 'TypedDict is for data that really is a dict (JSON, rows, kwargs). For your own objects a dataclass gives attribute access and checks for free.' },
    ] },
    { id: 'generics', title: 'Generics, overloads, Literal', snippets: [
      { title: 'Generic functions with TypeVar (PEP 695 syntax)', code: `from collections.abc import Sequence, Callable, Hashable
from typing import TypeVar

def first[T](xs: Sequence[T]) -> T:       # Python 3.12+ syntax; T is inferred per call
    return xs[0]

reveal_type(first([1, 2]))                # note: Revealed type is "int"
reveal_type(first("ab"))                  # note: Revealed type is "str"

def dedupe[K: Hashable, V](items: list[V], key: Callable[[V], K]) -> list[V]:   # K is bounded
    seen: set[K] = set()
    out: list[V] = []
    for it in items:
        if (k := key(it)) not in seen:
            seen.add(k); out.append(it)
    return out

# pre-3.12 spelling, still fine:
T = TypeVar("T")
def last(xs: Sequence[T]) -> T:
    return xs[-1]

def broken[T](x: T) -> T:
    return str(x)                         # error: Incompatible return value type (got "str", expected "T")  [return-value]`, note: 'A TypeVar links inputs to outputs. If it appears only once in a signature you probably want a plain type or <code>object</code>.' },
      { title: 'Generic classes and Self', code: `from typing import Self

class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> Self:      # Self: subclasses get their own type back
        self._items.append(item)
        return self
    def pop(self) -> T:
        return self._items.pop()

s = Stack[int]()
s.push(1).push(2)
s.push("x")                               # error: Argument 1 to "push" of "Stack" has incompatible type "str"; expected "int"  [arg-type]
reveal_type(s.pop())                      # note: Revealed type is "int"

class IntStack(Stack[int]):
    def total(self) -> int:
        return sum(self._items)
reveal_type(IntStack().push(1))           # note: Revealed type is "IntStack"

t = Stack()                               # error with --strict: Need type annotation for "t"  [var-annotated]`, note: 'Variance is inferred from how <code>T</code> is used; mypy reports if you use a covariant TypeVar in an argument position.' },
      { title: 'overload and Literal', code: `from typing import Literal, overload

Mode = Literal["r", "rb"]

@overload
def read(path: str, mode: Literal["r"] = ...) -> str: ...
@overload
def read(path: str, mode: Literal["rb"]) -> bytes: ...
def read(path: str, mode: Mode = "r") -> str | bytes:     # the implementation is not checked against callers
    with open(path, mode) as f:
        return f.read()

reveal_type(read("a.txt"))                # note: Revealed type is "str"
reveal_type(read("a.bin", "rb"))          # note: Revealed type is "bytes"
read("a.txt", "w")                        # error: No overload variant of "read" matches argument types "str", "str"  [call-overload]

def set_level(level: Literal["debug", "info", "warn"]) -> None: ...
set_level("info")                         # ok
lvl = "info"
set_level(lvl)                            # ok: inferred as Literal["info"] since it is never reassigned
levels = ["debug", "info"]
set_level(levels[0])                      # error: Argument 1 has incompatible type "str"  [arg-type]`, note: 'Overloads describe how the return type depends on the arguments. Keep the count small; a <code>Literal</code> union or a TypeVar often does the job with less code.' },
      { title: 'Typing a decorator with ParamSpec', code: `from collections.abc import Callable
from functools import wraps
import time

def timed[**P, R](fn: Callable[P, R]) -> Callable[P, R]:      # keeps the signature intact
    @wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        t0 = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {time.perf_counter() - t0:.3f}s")
    return wrapper

@timed
def add(a: int, b: int) -> int:
    return a + b

reveal_type(add)                          # note: Revealed type is "def (a: int, b: int) -> int"
add(1, "2")                               # error: Argument 2 to "add" has incompatible type "str"; expected "int"  [arg-type]

# Without ParamSpec, Callable[..., Any] would turn every decorated function into Any,
# and --disallow-untyped-decorators would then complain at each use.` },
    ] },
    { id: 'escape', title: 'Escape hatches and diagnostics', snippets: [
      { title: 'reveal_type, cast, assert_type', code: `from typing import cast, assert_type, Any
import json

data = json.loads('{"n": 1}')
reveal_type(data)                         # note: Revealed type is "Any"
n = cast(int, data["n"])                  # you promise; mypy believes, nothing runs at runtime
reveal_type(n)                            # note: Revealed type is "int"

xs = [1, 2, 3]
assert_type(xs, list[int])                # ok; fails to type-check if the inferred type differs
assert_type(xs, list[float])              # error: Expression is of type "list[int]", not "list[float]"  [assert-type]

y = cast(int, 5)                          # error with --warn-redundant-casts: Redundant cast to "int"  [redundant-cast]
reveal_locals()                           # note: every local and its type

def load() -> Any: ...
value: int = load()                       # accepted: Any is compatible with everything (that is the danger)`, note: '<code>reveal_type</code> and <code>reveal_locals</code> need no import; mypy understands them and Python 3.11+ has <code>typing.reveal_type</code> for runtime. Delete them before committing, or CI fails on the notes.' },
      { title: 'type: ignore, done precisely', code: `import yaml                               # error: Library stubs not installed for "yaml"  [import-untyped]
import yaml  # type: ignore[import-untyped]  # ok, and only this code is silenced
x: int = "a"  # type: ignore                # works, but with enable_error_code = ["ignore-without-code"]:
                                            # error: "type: ignore" comment without error code  [ignore-without-code]
y: int = 1  # type: ignore[assignment]      # error with --warn-unused-ignores: Unused "type: ignore" comment  [unused-ignore]

# mypy: disable-error-code="union-attr"     # a per-file setting, anywhere in the file
# mypy: strict                              # per-file flags work too

def legacy(a, b):                           # unannotated: body skipped unless check_untyped_defs
    return a + b

result = legacy(1, 2)                       # error with --disallow-untyped-calls: Call to untyped function "legacy" in typed context  [no-untyped-call]
reveal_type(result)                         # note: Revealed type is "Any"`, note: 'Prefer narrowing the type or fixing the annotation. When you must ignore, always give the code; <code>--warn-unused-ignores</code> then tells you when the ignore can be deleted.' },
    ] },
    { id: 'adopt', title: 'Stubs and gradual adoption', snippets: [
      { title: 'Stubs, py.typed, and missing imports', code: `# Where types for an import come from, in order:
#   1. inline annotations in the package, if it ships a "py.typed" marker file
#   2. a stub package: types-requests, types-PyYAML, ... (pip install, or mypy --install-types)
#   3. typeshed, bundled with mypy (stdlib and a few popular packages)
#   4. your own stubs: MYPYPATH=stubs/  with stubs/legacy_lib/__init__.pyi

# stubs/legacy_lib/__init__.pyi
def connect(dsn: str, timeout: float = ...) -> Connection: ...
class Connection:
    def query(self, sql: str, *params: object) -> list[tuple[object, ...]]: ...
    def close(self) -> None: ...

# Publishing a typed library: add an empty file  src/mylib/py.typed
# and include it in the wheel (setuptools: package_data / hatch: included by default).

# When nothing is available:
# [[tool.mypy.overrides]]
# module = ["legacy_lib.*"]
# ignore_missing_imports = true     # the module becomes Any; contain it to that module
# follow_untyped_imports = true     # mypy 1.14+: read the untyped package anyway and infer what it can`, note: '<code>stubgen -p legacy_lib -o stubs/</code> writes a first draft of the .pyi files from the runtime signatures.' },
      { title: 'Adopt gradually', code: `# Step 1: run on everything with the loosest useful settings; fix crashes and imports.
[tool.mypy]
files = ["src"]
ignore_missing_imports = true
check_untyped_defs = true          # bodies of unannotated functions are checked too

# Step 2: make new code strict by package, oldest code last.
[[tool.mypy.overrides]]
module = ["myapp.api.*", "myapp.core.*"]
strict = true

# Step 3: ratchet. Run in CI with the error count as a ceiling that only goes down:
#   mypy src/ | tail -1      # "Found 143 errors in 27 files"
# or add "# type: ignore[code]" in bulk once and remove them file by file.

# Step 4: when every package is strict, delete the overrides and set strict = true globally.
# Useful reports along the way:
#   mypy --txt-report out/ src/          per-file percentage of precisely typed lines
#   mypy --any-exprs-report out/ src/    where Any still leaks in`, note: 'The biggest single win is usually <code>check_untyped_defs</code>: it finds real bugs in old code without requiring a single new annotation.' },
    ] },
  ],
  concepts: [
    { id: 'narrowing', title: 'How types flow through a function', intro: 'mypy never runs the code. It carries a set of possible types for each name, shrinks it at every check, and compares what is left against what each operation needs.', explainer: narrowingExplainer },
  ],
  compare: [
    { title: 'Ways to describe a shape', columns: ['Protocol', 'ABC', 'TypedDict', 'dataclass'], rows: [
      ['Matching', 'structural: has the members', 'nominal: must subclass', 'structural: has the keys', 'nominal'],
      ['Runtime object', 'anything that fits', 'an instance', 'a plain dict', 'an instance'],
      ['Third-party classes fit', true, false, { part: 'dicts only' }, false],
      ['isinstance works', { part: 'with @runtime_checkable' }, true, false, true],
      ['Best for', 'function parameters: "needs .close()"', 'a hierarchy you own', 'JSON, rows, kwargs', 'your own records'],
    ], verdict: 'Parameters take a <code>Protocol</code>, data from outside is a <code>TypedDict</code> until validated, your own data is a <code>dataclass</code>. ABCs earn their place when you want shared implementation.' },
    { title: 'Escape hatches', columns: ['Any', 'object', 'cast()', 'type: ignore[code]'], rows: [
      ['What it says', 'skip checking this value', 'could be anything, prove it before use', 'trust me, it is this type', 'this line is wrong, move on'],
      ['Checking lost', 'everywhere the value flows', 'none', 'at that expression', 'that line'],
      ['Runtime cost', false, false, false, false],
      ['Caught by', '--disallow-any-*, --warn-return-any', '(never; it is sound)', '--warn-redundant-casts', '--warn-unused-ignores'],
      ['Reach for it', { dots: 1 }, { dots: 5 }, { dots: 3 }, { dots: 2 }],
    ], note: 'Ratings are judgement calls: how happily you should reach for each one.', verdict: '<code>object</code> plus narrowing is the honest choice; <code>cast</code> for the boundary with untyped data; <code>Any</code> only where it comes from someone else\'s code.' },
  ],
  gotchas: [
    { title: 'Unannotated functions are not checked at all', bad: `def total(prices, discount):
    return sum(prices) * (1 - discount) + "!"   # no error reported`, good: `def total(prices: list[float], discount: float) -> float:
    return sum(prices) * (1 - discount) + "!"   # error: Unsupported operand types  [operator]
# or globally: check_untyped_defs = true`, why: 'Without annotations the body is skipped and the function returns <code>Any</code> to every caller. <code>check_untyped_defs</code> checks bodies anyway; <code>disallow_untyped_defs</code> makes missing annotations an error.' },
    { title: 'A None default does not make the type Optional', bad: `def greet(name: str = None) -> str:
    # error: Incompatible default for argument "name" (default has type "None", argument has type "str")
    return "hi " + (name or "you")`, good: `def greet(name: str | None = None) -> str:
    return "hi " + (name or "you")`, why: 'Implicit Optional was removed as a default in mypy 0.990. The annotation must say <code>| None</code> so callers and the body both know it can be missing.' },
    { title: 'list and dict are invariant', bad: `def show(items: list[object]) -> None: ...
names: list[str] = ["a"]
show(names)   # error: Argument 1 has incompatible type "list[str]"; expected "list[object]"`, good: `from collections.abc import Sequence
def show(items: Sequence[object]) -> None: ...
show(names)   # ok: Sequence is read-only, hence covariant`, why: 'If <code>show</code> could <code>append(1)</code> to a <code>list[object]</code>, your <code>list[str]</code> would be corrupted. Read-only ABCs (<code>Sequence</code>, <code>Mapping</code>, <code>Iterable</code>) accept the subtypes; mutable containers do not.' },
    { title: 'Module-level None needs an annotation (mypy 2.0)', bad: `cache = None
def init() -> None:
    global cache
    cache = {}     # error: Need type annotation for "cache"  [var-annotated]`, good: `cache: dict[str, int] | None = None
def init() -> None:
    global cache
    cache = {}`, why: 'mypy 2.0 turned on <code>--local-partial-types</code>: a variable\'s type is settled in the scope where it is first assigned, so a bare <code>None</code> can no longer be completed by an assignment in another function.' },
  ],
  presets: [],
};
