import { scene } from '../../js/explainer.js';

const fixtureExplainer = {
  hold: 3000,
  code: ['@pytest.fixture', 'def db(tmp_path):', '    conn = connect(tmp_path / "t.db")', '    yield conn', '    conn.close()', '', 'def test_insert(db): ...'],
  build() {
    const s = scene(760, 300);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 36, label, cls);
    box('test', 20, 40, 190, 'test_insert(db)');
    box('db', 280, 40, 150, 'fixture db', 'cell ghost');
    box('tmp', 500, 40, 170, 'fixture tmp_path', 'cell ghost');
    s.arrow('a1', 212, 58, 276, 58, 'arrow hid'); s.arrow('a2', 432, 58, 496, 58, 'arrow hid');
    s.text('l1', 244, 80, 'needs', 'lbl sm ink-2 hid'); s.text('l2', 464, 80, 'needs', 'lbl sm ink-2 hid');
    // timeline
    const T = 150;
    s.text('tl', 20, T - 20, 'timeline', 'lbl sm bold ink-2', undefined, 'start');
    box('s1', 20, T, 130, 'make tmp dir', 'cell hid'); box('s2', 160, T, 130, 'connect()', 'cell hid'); box('s3', 300, T, 130, 'run the test', 'cell hid'); box('s4', 440, T, 130, 'conn.close()', 'cell hid'); box('s5', 580, T, 150, 'remove tmp dir', 'cell hid');
    s.text('yl', 365, T + 60, '', 'lbl sm ink-2');
    s.text('sc', 20, 270, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'A test names what it needs', caption: 'Arguments of a test function are fixture names. pytest looks each one up in the test module, conftest.py files, plugins and built-ins.', lines: [6],
      patch: { 'test.r': { cls: 'cell hot' } } },
    { title: 'Fixtures can depend on fixtures', caption: 'db asks for tmp_path, a built-in that gives a fresh directory. pytest builds a dependency graph and resolves it in order.', lines: [1],
      patch: { db: { cls: '' }, tmp: { cls: '' }, a1: { cls: 'arrow hot' }, a2: { cls: 'arrow hot' }, l1: { cls: 'lbl sm ink-2' }, l2: { cls: 'lbl sm ink-2' }, 'db.r': { cls: 'cell' }, 'tmp.r': { cls: 'cell' } } },
    { title: 'Setup runs top-down', caption: 'Everything before yield is setup. The yielded value is what the test receives as db.', lines: [2, 3],
      patch: { s1: { cls: '' }, s2: { cls: '' }, 's1.r': { cls: 'cell ok' }, 's2.r': { cls: 'cell ok' } } },
    { title: 'The test runs', caption: 'One test, one set of fixture values. With scope="function" (the default) nothing is shared between tests.', lines: [6],
      patch: { s3: { cls: '' }, 's3.r': { cls: 'cell hot' } } },
    { title: 'Teardown runs bottom-up, even on failure', caption: 'Code after yield runs when the test finishes, in reverse order of setup. A failing assert still closes the connection and removes the directory.', lines: [4],
      patch: { s4: { cls: '' }, s5: { cls: '' }, 's4.r': { cls: 'cell info' }, 's5.r': { cls: 'cell info' }, sc: { text: 'scope="module" or "session" would run setup once and share the value' } } },
  ],
};

const RUN = (body) => `import pytest, pathlib, sys, hashlib
src = '''${body}'''
name = "test_" + hashlib.md5(src.encode()).hexdigest()[:8]     # one module per snippet
sys.modules.pop(name, None)
test_file = pathlib.Path(f"/tmp/{name}.py"); test_file.write_text(src)
pytest.main(["-q", "-p", "no:cacheprovider", str(test_file)])`;

export default {
  id: 'pytest', name: 'pytest', glyph: 'pyt', group: 'testing', version: '8.x', keywords: 'test testing fixture parametrize mock assert unittest',
  tagline: 'Tests as plain functions. Fixtures, parametrize, rich asserts.',
  install: 'pip install pytest', docs: 'https://docs.pytest.org/', packages: ['pytest'],
  overview: {
    what: 'pytest discovers functions named test_* in files named test_*.py, runs them, and rewrites plain assert statements so failures show the values involved. Fixtures replace setUp/tearDown with dependency injection, and parametrize turns one function into many cases. Almost every Python project uses it, directly or through plugins.',
    yes: ['Unit and integration tests for any Python code, including unittest-style classes.', 'Test data that needs setup and cleanup (databases, temp files, fake servers).', 'Running the same test over many inputs.', 'A plugin ecosystem: coverage, xdist (parallel), asyncio, django, mock.'],
    no: ['Property-based testing (hypothesis, which plugs into pytest).', 'Browser end-to-end tests (Playwright, which also plugs in).', 'Benchmarks (pytest-benchmark or a dedicated tool).'],
    note: 'Snippets write a test file to <code>/tmp</code> and run <code>pytest.main</code> on it, so you see real pytest output.',
  },
  cheatsheet: [
    { id: 'basics', title: 'Write and run', snippets: [
      { title: 'A first test file', code: RUN(`def add(a, b):
    return a + b

def test_add_ints():
    assert add(2, 3) == 5

def test_add_strings():
    assert add("py", "test") == "pytest"

def test_shows_values_on_failure():
    result = add(2, 2)
    assert result == 5, "arithmetic is hard"
`), note: 'The third test fails on purpose. Look at how pytest prints <code>result</code> without you writing any message.' },
      { title: 'Useful command-line flags', run: false, code: `pytest                      # discover and run everything
pytest -q                   # quiet
pytest -x                   # stop at first failure
pytest -k "add and not str" # select by name expression
pytest tests/test_api.py::test_login
pytest --lf                 # only tests that failed last time
pytest -vv --tb=short       # verbose names, short tracebacks
pytest -s                   # show print() output
pytest -m "not slow"        # deselect by marker
pytest -n auto              # parallel (pytest-xdist)` },
    ] },
    { id: 'fixtures', title: 'Fixtures', snippets: [
      { title: 'Setup, yield, teardown', code: RUN(`import pytest, sqlite3

@pytest.fixture
def db(tmp_path):
    conn = sqlite3.connect(tmp_path / "t.db")
    conn.execute("CREATE TABLE items(name TEXT)")
    yield conn                      # the test runs here
    conn.close()                    # teardown, even if the test fails

def test_insert(db):
    db.execute("INSERT INTO items VALUES ('kettle')")
    assert db.execute("SELECT count(*) FROM items").fetchone()[0] == 1

def test_starts_empty(db):          # a fresh db, not the one above
    assert db.execute("SELECT count(*) FROM items").fetchone()[0] == 0
`), note: '<code>tmp_path</code> is a built-in fixture. Others: <code>monkeypatch</code>, <code>capsys</code>, <code>caplog</code>, <code>request</code>.' },
      { title: 'Scope and conftest.py', run: false, code: `# conftest.py — fixtures here are visible to every test in the directory tree
import pytest

@pytest.fixture(scope="session")     # built once per test run
def settings():
    return {"url": "https://api.pydex.local"}

@pytest.fixture(scope="module")      # once per test file
def client(settings):
    import requests
    with requests.Session() as s:
        s.headers["Accept"] = "application/json"
        yield s

@pytest.fixture(autouse=True)        # runs for every test without being requested
def fast_sleep(monkeypatch):
    monkeypatch.setattr("time.sleep", lambda s: None)`, note: 'Scopes: function (default), class, module, package, session. Wider scope is faster but shares state.' },
      { title: 'monkeypatch and capsys', code: RUN(`import os

def greet():
    return f"hello {os.environ.get('USER_NAME', 'stranger')}"

def test_env(monkeypatch):
    monkeypatch.setenv("USER_NAME", "Ann")
    assert greet() == "hello Ann"

def test_default(monkeypatch):
    monkeypatch.delenv("USER_NAME", raising=False)
    assert greet() == "hello stranger"

def test_prints(capsys):
    print("report ready")
    assert capsys.readouterr().out == "report ready\\n"
`) },
    ] },
    { id: 'param', title: 'Parametrize and expectations', snippets: [
      { title: 'One function, many cases', code: RUN(`import pytest

def slug(s):
    return "-".join(s.lower().split())

@pytest.mark.parametrize("text, expected", [
    ("Hello World", "hello-world"),
    ("  spaced   out ", "spaced-out"),
    ("", ""),
    pytest.param("Ünïcode", "ünïcode", id="unicode"),
])
def test_slug(text, expected):
    assert slug(text) == expected
`), note: 'Each case is a separate test with its own id, so a failure names the input. Stack two decorators for a grid.' },
      { title: 'Expect an exception, compare floats', code: RUN(`import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a / b

def test_zero():
    with pytest.raises(ValueError, match="by zero") as info:
        divide(1, 0)
    assert "zero" in str(info.value)

def test_float():
    assert divide(1, 3) == pytest.approx(0.3333, abs=1e-4)
    assert [0.1 + 0.2] == pytest.approx([0.3])
`) },
      { title: 'skip, xfail, custom marks', code: RUN(`import pytest, sys

@pytest.mark.skipif(sys.platform == "emscripten", reason="no subprocess in the browser")
def test_needs_subprocess():
    import subprocess
    assert subprocess.run(["true"]).returncode == 0

@pytest.mark.xfail(reason="known bug #42", strict=True)
def test_known_bug():
    assert 1 + 1 == 3

@pytest.mark.slow
def test_marked():
    assert True
`), note: '<code>strict=True</code> makes an unexpectedly passing xfail a failure, so fixed bugs get their marker removed. Register custom marks in <code>pytest.ini</code> to avoid warnings.' },
    ] },
    { id: 'mock', title: 'Mocking', snippets: [
      { title: 'Replace a dependency', code: RUN(`from unittest.mock import Mock, patch

class Mailer:
    def send(self, to, body):
        raise RuntimeError("no network in tests")

def notify(mailer, user):
    if user["active"]:
        mailer.send(user["email"], "welcome")
        return True
    return False

def test_sends_to_active_user():
    mailer = Mock(spec=Mailer)
    assert notify(mailer, {"email": "a@b.co", "active": True})
    mailer.send.assert_called_once_with("a@b.co", "welcome")

def test_skips_inactive():
    mailer = Mock(spec=Mailer)
    assert not notify(mailer, {"email": "a@b.co", "active": False})
    mailer.send.assert_not_called()
`), note: '<code>spec=</code> makes the mock reject attributes the real class lacks, so typos in method names fail loudly.' },
    ] },
  ],
  concepts: [
    { id: 'fixtures', title: 'How a fixture is resolved and torn down', intro: 'A test asks for names. pytest builds the values, runs the test, then unwinds in reverse.', explainer: fixtureExplainer },
  ],
  compare: [
    { title: 'Fixture scopes', columns: ['function', 'class', 'module', 'session'], rows: [
      ['Built', 'per test', 'per test class', 'per file', 'once per run'],
      ['Isolation', { dots: 5 }, { dots: 4 }, { dots: 2 }, { dots: 1 }],
      ['Speed with expensive setup', { dots: 1 }, { dots: 2 }, { dots: 4 }, { dots: 5 }],
      ['Typical use', 'temp files, fresh objects', 'shared per class', 'parsed test data', 'DB engine, app instance'],
    ] },
    { title: 'skip, skipif, xfail', columns: ['skip', 'skipif', 'xfail'], rows: [
      ['Runs the test', false, { part: 'when condition is False' }, true],
      ['Reported as', 's', 's', 'x (or X if it passes)'],
      ['Use for', 'not applicable here', 'platform / version', 'known bug, keep the test'],
    ] },
  ],
  gotchas: [
    { title: 'Calling a fixture directly', bad: `def test_x():
    conn = db()        # Fixture "db" called directly`, good: `def test_x(db):
    ...`, why: 'Fixtures are requested by parameter name. pytest calls them and handles scope and teardown.' },
    { title: 'assert with a tuple is always true', bad: `assert (value == 5, "should be five")`, good: `assert value == 5, "should be five"`, why: 'A non-empty tuple is truthy. pytest warns about this, but only if the tuple is a literal.' },
    { title: 'Tests that depend on order', bad: `items = []
def test_a(): items.append(1)
def test_b(): assert items == [1]   # passes alone? no; passes after a`, good: `@pytest.fixture
def items(): return []`, why: 'Shared module state couples tests. Run with <code>-p randomly</code> or <code>-n auto</code> and these break. Give each test its own fixture.' },
    { title: 'pytest.raises that is too broad', bad: `with pytest.raises(Exception):
    parse(data)     # any bug passes`, good: `with pytest.raises(ValueError, match="invalid date"):
    parse(data)`, why: 'A typo that raises <code>NameError</code> would satisfy the broad version. Name the exception and match the message.' },
  ],
  presets: [
    { title: 'Run a parametrized test', code: RUN(`import pytest

def fizzbuzz(n):
    return "FizzBuzz" if n % 15 == 0 else "Fizz" if n % 3 == 0 else "Buzz" if n % 5 == 0 else str(n)

@pytest.mark.parametrize("n, out", [(1, "1"), (3, "Fizz"), (5, "Buzz"), (15, "FizzBuzz"), (30, "FizzBuzz")])
def test_fizzbuzz(n, out):
    assert fizzbuzz(n) == out
`) },
  ],
};
