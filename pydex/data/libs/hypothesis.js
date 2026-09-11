import { scene } from '../../js/explainer.js';

// Snippets run inside pytest: the test source is written to /tmp under a hashed module
// name (so re-running an edited snippet never collides) and pytest.main runs it in-process.
const RUN = (body) => `import pytest, pathlib, sys, hashlib
from hypothesis import settings
settings.register_profile("browser", deadline=None)    # the browser is slow; drop the 200 ms deadline
settings.load_profile("browser")
src = '''${body}'''
name = "test_" + hashlib.md5(src.encode()).hexdigest()[:8]      # one module per snippet
sys.modules.pop(name, None)
test_file = pathlib.Path(f"/tmp/{name}.py"); test_file.write_text(src)
pytest.main(["-q", "-p", "no:cacheprovider", str(test_file)])`;

const shrinkExplainer = {
  hold: 3200,
  code: ['@given(st.lists(st.integers()))', 'def test_total_under_100(xs):', '    assert sum(xs) < 100', '# Falsifying example: xs=[100]'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 36, label, cls);
    // generate → run loop
    box('strat', 20, 40, 200, 'lists(integers())');
    box('ex', 280, 40, 200, 'xs = ?', 'cell hid');
    box('test', 540, 40, 200, 'test body', 'cell ghost');
    s.arrow('a1', 222, 58, 276, 58, 'arrow hid');
    s.arrow('a2', 482, 58, 536, 58, 'arrow hid');
    s.text('n', 380, 92, '', 'lbl sm ink-2');
    box('verdict', 540, 100, 200, '', 'cell hid');
    // loop back: from test bottom to strategy bottom
    s.path('loop', 'M640 138 L640 160 L120 160 L120 80', 'arrow ghost hid');
    s.text('loopt', 380, 150, 'passed → draw another (up to max_examples)', 'lbl sm ink-2 hid');
    // shrinker
    box('shr', 20, 200, 120, 'shrinker', 'cell hid');
    box('c0', 170, 200, 150, '[204, 15, -9]', 'cell hid');
    box('c1', 370, 200, 150, '[204]', 'cell hid');
    box('c2', 570, 200, 150, '[100]', 'cell hid');
    s.arrow('s0', 142, 218, 166, 218, 'arrow hid');
    s.arrow('s1', 322, 218, 366, 218, 'arrow hid');
    s.arrow('s2', 522, 218, 566, 218, 'arrow hid');
    s.text('st1', 344, 250, 'delete elements', 'lbl sm ink-2 hid');
    s.text('st2', 544, 250, 'lower the value', 'lbl sm ink-2 hid');
    s.text('st3', 645, 270, '[99] passes, so 100 is minimal', 'lbl sm ink-2 hid');
    // report
    box('rep', 20, 280, 420, 'Falsifying example: test_total_under_100(xs=[100])', 'cell hid');
    s.text('db', 460, 298, 'saved to .hypothesis/ → replayed first next run', 'lbl sm ink-2 hid', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Draw an example from the strategy', caption: 'A strategy is a recipe, not a list. Each draw asks it for one value; lists(integers()) picks a length, then each element.', lines: [0],
      patch: { 'strat.r': { cls: 'cell hot' }, ex: { cls: '' }, 'ex.t': { text: 'xs = [57, -3, 8]' }, a1: { cls: 'arrow hot flow' }, n: { text: 'example 1' } } },
    { title: 'Run the test body; a pass means draw again', caption: 'The function is called like any test. Early examples are small and boring on purpose; later ones grow, and the generator deliberately mixes in edge cases: [], [0], huge values, repeats.', lines: [1, 2],
      patch: { 'strat.r': { cls: 'cell' }, a1: { cls: 'arrow' }, 'test.r': { cls: 'cell hot' }, a2: { cls: 'arrow hot' }, verdict: { cls: '' }, 'verdict.r': { cls: 'cell ok' }, 'verdict.t': { text: 'pass' }, loop: { cls: 'arrow ghost' }, loopt: { cls: 'lbl sm ink-2' }, n: { text: 'example 1 of up to 100' } } },
    { title: 'An example fails', caption: 'Example 23 makes the assert false. Hypothesis does not report it yet: a random failing input is usually large and noisy, and hard to reason about.', lines: [2],
      patch: { 'ex.t': { text: 'xs = [204, 15, -9]' }, 'ex.r': { cls: 'cell err' }, 'test.r': { cls: 'cell err' }, 'verdict.r': { cls: 'cell err' }, 'verdict.t': { text: 'FAIL: 210 < 100' }, loop: { cls: 'arrow ghost hid' }, loopt: { cls: 'lbl sm ink-2 hid' }, n: { text: 'example 23' } } },
    { title: 'Shrink: throw away what is not needed', caption: 'The shrinker re-runs the test on simpler variants and keeps any that still fail. Deleting elements is tried first: [204] alone still fails, so 15 and -9 are gone.', lines: [2],
      patch: { shr: { cls: '' }, 'shr.r': { cls: 'cell hot' }, c0: { cls: '' }, 'c0.r': { cls: 'cell err' }, s0: { cls: 'arrow hot' }, c1: { cls: '' }, 'c1.r': { cls: 'cell err' }, s1: { cls: 'arrow hot' }, st1: { cls: 'lbl sm ink-2' }, 'test.r': { cls: 'cell ghost' }, 'verdict.r': { cls: 'cell' }, 'verdict.t': { text: 'replays' } } },
    { title: 'Shrink: make each value smaller', caption: 'Then every integer is pushed towards zero with a binary search. 100 fails, 99 passes, so 100 is the boundary. "Simpler" is defined by the strategy, which is why shrunk values look human-chosen.', lines: [2],
      patch: { c2: { cls: '' }, 'c2.r': { cls: 'cell err' }, s2: { cls: 'arrow hot' }, st2: { cls: 'lbl sm ink-2' }, st3: { cls: 'lbl sm ink-2' } } },
    { title: 'Report the minimal case and remember it', caption: 'The failing call is printed as Falsifying example, and its bytes are saved in the .hypothesis/ directory. The next run replays it before generating anything new, so the bug stays reproduced until it is fixed.', lines: [3],
      patch: { rep: { cls: '' }, 'rep.r': { cls: 'cell err' }, db: { cls: 'lbl sm ink-2' }, 'shr.r': { cls: 'cell' }, c0: { add: 'dim' }, c1: { add: 'dim' } } },
  ],
};

export default {
  id: 'hypothesis', name: 'hypothesis', glyph: 'hy', group: 'testing', version: '6.x', keywords: 'property based testing strategies given shrink fuzz stateful',
  tagline: 'Property-based tests: you state the rule, it hunts for the input that breaks it.',
  install: 'pip install hypothesis', docs: 'https://hypothesis.readthedocs.io/', packages: ['pip:hypothesis', 'sortedcontainers', 'pytest'], runnable: true,
  overview: {
    what: 'Hypothesis turns a test function into a property: you describe the kind of input with strategies, decorate the test with @given, and it generates hundreds of examples, runs the test on each, and when one fails, shrinks it to the smallest input that still fails. It plugs into pytest and unittest and needs no runner of its own.',
    yes: ['Pure functions with an invariant: round-trips (decode(encode(x)) == x), idempotence, order independence, comparison with a simple oracle.', 'Parsers, serialisers, numeric code, anything with edge cases you would not think to list by hand.', 'Stateful systems: a sequence of operations checked against a model.', 'Replacing a long parametrize list with one rule.'],
    no: ['The property is hard to state: "the output looks right" needs an example-based test.', 'Each test run is slow (seconds) and cannot be made fast; 100 examples per test adds up.', 'You need coverage of specific business cases: keep those as explicit tests or @example.'],
    note: 'Snippets write a test file to <code>/tmp</code> and run <code>pytest.main</code> on it, so you see real Hypothesis output including the falsifying example. The wrapper loads a profile with <code>deadline=None</code> because the browser runtime is slower than the default 200 ms per-example deadline.',
  },
  cheatsheet: [
    { id: 'basics', title: 'A first property', blurb: 'One decorator, one strategy, one assertion about every input.', snippets: [
      { title: 'A round-trip property', code: RUN(`from hypothesis import given, strategies as st

def encode(s):                          # run-length encoding
    out = []
    for ch in s:
        if out and out[-1][0] == ch:
            out[-1][1] += 1
        else:
            out.append([ch, 1])
    return out

def decode(pairs):
    return "".join(ch * n for ch, n in pairs)

@given(st.text())                       # any str, including "", emoji, combining marks
def test_decode_inverts_encode(s):
    assert decode(encode(s)) == s
`), note: 'The test runs about 100 times with different strings. A property that reads "doing X then Y gets me back where I started" is the easiest kind to write.' },
      { title: 'Peek at what a strategy produces', code: `import warnings
from hypothesis import strategies as st
from hypothesis.errors import NonInteractiveExampleWarning
warnings.simplefilter("ignore", NonInteractiveExampleWarning)

print(st.integers(0, 100).example())
print(st.floats(allow_nan=False, allow_infinity=False).example())
print(repr(st.text(min_size=1, max_size=8).example()))
print(st.lists(st.integers(), min_size=2, max_size=5, unique=True).example())
print(st.dictionaries(st.text(max_size=3), st.booleans(), max_size=3).example())
print(st.sampled_from(["North", "South", "East"]).example())
print(st.one_of(st.none(), st.integers()).example())
print(st.tuples(st.integers(), st.text(max_size=4)).example())
print(st.fixed_dictionaries({"id": st.integers(1, 99), "ok": st.booleans()}).example())`, note: '<code>.example()</code> is for exploring at a prompt, never inside a test: it is slow and not shrunk. Run it twice and you get different values.' },
    ] },
    { id: 'strategies', title: 'Strategies', blurb: 'Compose small strategies into the exact shape your function accepts.', snippets: [
      { title: 'map, filter, builds', code: RUN(`from dataclasses import dataclass
from hypothesis import given, strategies as st

@dataclass
class Order:
    order_id: int
    qty: int
    unit_price: float

even = st.integers().map(lambda n: n * 2)          # transform every value
nonzero = st.integers().filter(lambda n: n != 0)   # reject some values (keep it cheap)
orders = st.builds(Order,                          # call a constructor with drawn kwargs
    order_id=st.integers(1, 10**6),
    qty=st.integers(1, 50),
    unit_price=st.floats(0.01, 999, allow_nan=False))

@given(even, nonzero, orders)
def test_shapes(e, nz, o):
    assert e % 2 == 0 and nz != 0
    assert o.qty * o.unit_price > 0
`), note: '<code>st.builds(cls)</code> with no kwargs infers strategies from type hints; <code>st.from_type(Order)</code> does the same. Prefer <code>map</code> over <code>filter</code> when you can construct the value directly.' },
      { title: 'Text, regexes, dates, emails', code: RUN(`import re, string, datetime as dt
from hypothesis import given, strategies as st

@given(st.from_regex(r"[A-Z]{3}-[0-9]{4}", fullmatch=True))
def test_sku_pattern(sku):
    assert re.fullmatch(r"[A-Z]{3}-[0-9]{4}", sku)

@given(st.text(alphabet=string.ascii_lowercase + "-", min_size=1))
def test_slug_stays_lower(s):
    assert s.lower() == s

@given(st.dates(min_value=dt.date(2000, 1, 1), max_value=dt.date(2100, 1, 1)), st.integers(0, 3650))
def test_adding_days_moves_forward(d, n):
    assert d + dt.timedelta(days=n) >= d

@given(st.emails())
def test_email_has_one_at(e):
    assert e.count("@") == 1
`), note: 'Also: <code>st.datetimes(timezones=...)</code>, <code>st.uuids()</code>, <code>st.ip_addresses()</code>, <code>st.binary()</code>, <code>st.decimals()</code>, and <code>hypothesis.extra</code> for numpy and pandas.' },
      { title: 'Recursive data: JSON', code: RUN(`import json
from hypothesis import given, strategies as st

json_values = st.recursive(
    st.none() | st.booleans() | st.integers() | st.floats(allow_nan=False) | st.text(),
    lambda inner: st.lists(inner) | st.dictionaries(st.text(), inner),
    max_leaves=12,
)

@given(json_values)
def test_json_round_trip(v):
    assert json.loads(json.dumps(v)) == v
`), note: '<code>a | b</code> is <code>st.one_of(a, b)</code>. <code>recursive(base, extend)</code> builds nested values; <code>max_leaves</code> keeps them small.' },
    ] },
    { id: 'composite', title: 'Dependent values', blurb: 'When one value depends on another, draw them in order.', snippets: [
      { title: '@composite: a strategy written as a function', code: RUN(`from hypothesis import given, strategies as st

@st.composite
def intervals(draw, lo=0, hi=1000):
    start = draw(st.integers(lo, hi))
    end = draw(st.integers(start, hi))     # depends on start
    return start, end

def overlaps(a, b):
    return a[0] <= b[1] and b[0] <= a[1]

@given(intervals(), intervals())
def test_overlap_is_symmetric(a, b):
    assert overlaps(a, b) == overlaps(b, a)

@given(intervals())
def test_interval_overlaps_itself(a):
    assert overlaps(a, a)
`), note: 'The decorated function gets <code>draw</code> as its first argument and becomes a strategy factory: call <code>intervals()</code> to get a strategy. It shrinks well because each draw is tracked.' },
      { title: 'st.data(): draw inside the test', code: RUN(`from hypothesis import given, strategies as st

@given(st.data())
def test_index_is_in_bounds(data):
    xs = data.draw(st.lists(st.integers(), min_size=1), label="xs")
    i = data.draw(st.integers(0, len(xs) - 1), label="index")
    assert xs[i] in xs

@given(st.data())
def test_pop_returns_last(data):
    stack = data.draw(st.lists(st.text(), min_size=1))
    top = stack[-1]
    assert stack.pop() == top
`), note: 'Use <code>data.draw</code> when the shape of the next value depends on what the test has computed so far. Labels show up in the falsifying example.' },
    ] },
    { id: 'control', title: 'Control the search', snippets: [
      { title: '@example and assume', code: RUN(`from hypothesis import given, example, assume, strategies as st

def parse_range(s):
    lo, hi = s.split("-")
    return int(lo), int(hi)

@given(st.integers(0, 10_000), st.integers(0, 10_000))
@example(lo=0, hi=0)                 # always run this case, before any generated ones
@example(lo=7, hi=7)
def test_range_round_trip(lo, hi):
    assume(lo <= hi)                 # not a failure: discard this example and draw another
    assert parse_range(f"{lo}-{hi}") == (lo, hi)
`), note: '<code>assume</code> is for cheap, rare rejections. If more than a few percent of examples are discarded Hypothesis raises a <code>HealthCheck</code>: fix the strategy instead.' },
      { title: 'settings: examples, deadline, phases', code: RUN(`from hypothesis import given, settings, HealthCheck, Phase, strategies as st

@settings(max_examples=300, deadline=None)          # more examples, no per-example time limit
@given(st.text())
def test_upper_is_idempotent(s):
    assert s.upper().upper() == s.upper()

@settings(max_examples=20, derandomize=True,        # same examples every run
          phases=[Phase.explicit, Phase.generate],  # skip replay and shrinking
          suppress_health_check=[HealthCheck.too_slow])
@given(st.lists(st.integers()))
def test_reverse_twice(xs):
    assert list(reversed(list(reversed(xs)))) == xs
`), note: '<code>@settings</code> can sit above or below <code>@given</code>. The default deadline is 200 ms per example; set <code>deadline=None</code> for tests that touch disk or network.' },
      { title: 'Profiles and pytest flags', run: false, code: `# conftest.py: register profiles once, pick one per environment
from hypothesis import settings, Verbosity, HealthCheck

settings.register_profile("ci", max_examples=1000, deadline=None)
settings.register_profile("dev", max_examples=25)
settings.register_profile("debug", max_examples=10, verbosity=Verbosity.verbose)
settings.load_profile("dev")             # default unless overridden below

# command line
#   pytest --hypothesis-profile=ci
#   pytest --hypothesis-show-statistics     # examples run, shrinks, discards per test
#   pytest --hypothesis-seed=1234            # reproduce a run
#   pytest --hypothesis-verbosity=verbose    # print every example
#   pytest --hypothesis-explain              # which parts of the input matter` },
    ] },
    { id: 'shrinking', title: 'Failures and shrinking', blurb: 'A failing property is reported as the smallest input that still fails.', snippets: [
      { title: 'Watch a failure shrink', code: RUN(`from hypothesis import given, strategies as st

def running_total(xs):
    total = 0
    for x in xs:
        total += x
    return total

@given(st.lists(st.integers()))
def test_total_under_100(xs):          # a wrong property, on purpose
    assert running_total(xs) < 100
`), note: 'The first failing example is random and messy. Hypothesis deletes elements and lowers values until nothing simpler fails, and reports <code>xs=[100]</code>: the smallest list whose total reaches 100.' },
      { title: 'A real bug: mean of floats overflows', code: RUN(`from hypothesis import given, strategies as st

def mean(xs):
    return sum(xs) / len(xs)

@given(st.lists(st.floats(allow_nan=False, allow_infinity=False), min_size=1))
def test_mean_is_within_bounds(xs):
    assert min(xs) <= mean(xs) <= max(xs)
`), note: 'Two floats near 1e308 sum to <code>inf</code>. Nobody writes that test case by hand. The fix is <code>statistics.fmean</code> or a running mean.' },
    ] },
    { id: 'stateful', title: 'Stateful testing', snippets: [
      { title: 'Rules, preconditions, invariants', code: RUN(`from collections import deque
from hypothesis import settings, strategies as st
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, precondition

class RingBuffer:                          # the system under test
    def __init__(self, cap):
        self.cap, self.items = cap, []
    def push(self, x):
        self.items.append(x)
        if len(self.items) > self.cap:
            self.items.pop(0)
    def pop(self):
        return self.items.pop(0)

class BufferMachine(RuleBasedStateMachine):
    def __init__(self):
        super().__init__()
        self.buf = RingBuffer(3)
        self.model = deque(maxlen=3)       # a trivially correct model

    @rule(x=st.integers())
    def push(self, x):
        self.buf.push(x); self.model.append(x)

    @precondition(lambda self: len(self.model) > 0)
    @rule()
    def pop(self):
        assert self.buf.pop() == self.model.popleft()

    @invariant()
    def same_length(self):
        assert len(self.buf.items) == len(self.model)

TestBuffer = BufferMachine.TestCase
TestBuffer.settings = settings(max_examples=30, stateful_step_count=15)
`), note: 'Hypothesis generates sequences of rule calls and checks invariants after each. A failure shrinks to the shortest sequence, printed as runnable Python.' },
    ] },
  ],
  concepts: [
    { id: 'shrink', title: 'Generate, run, fail, shrink', intro: 'What happens between <code>@given</code> and the line <code>Falsifying example</code>: a loop that draws inputs, and a second loop that simplifies the first one to fail.', explainer: shrinkExplainer },
  ],
  compare: [
    { title: 'Ways to shape a strategy', columns: ['.map()', '.filter()', '.flatmap()', '@composite', 'st.builds()'], rows: [
      ['Input', 'one value', 'one value', 'one value', 'as many draws as you like', 'drawn kwargs'],
      ['Output', 'transformed value', 'same value or rejected', 'a new strategy', 'anything', 'an instance'],
      ['Wasted examples', false, { part: 'every rejection' }, false, false, false],
      ['Dependent values', false, false, true, true, false],
      ['Shrinks well', { dots: 5 }, { dots: 4 }, { dots: 3 }, { dots: 5 }, { dots: 5 }],
      ['Reads well', { dots: 5 }, { dots: 4 }, { dots: 2 }, { dots: 5 }, { dots: 5 }],
    ], note: 'Ratings are judgement calls.', verdict: '<code>map</code> to transform, <code>builds</code> for objects, <code>@composite</code> whenever a later draw depends on an earlier one. Reach for <code>filter</code> only for cheap, rare rejections.' },
    { title: 'Three ways to write the test', columns: ['@given(strategies)', '@given(st.data())', 'RuleBasedStateMachine'], rows: [
      ['Generates', 'fixed arguments', 'values drawn mid-test', 'a sequence of operations'],
      ['Falsifying example shows', 'the arguments', 'each labelled draw', 'the shortest program of rule calls'],
      ['Best for', 'pure functions', 'draws that depend on computed state', 'APIs with internal state: caches, queues, DBs'],
      ['Setup cost', { dots: 1 }, { dots: 2 }, { dots: 4 }],
    ] },
  ],
  gotchas: [
    { title: 'Filtering away almost everything', bad: `@given(st.integers().filter(lambda n: n % 1000 == 0))
# FailedHealthCheck: filtered out too many examples`, good: `@given(st.integers().map(lambda n: n * 1000))`, why: 'A filter that rejects 99.9% of draws starves the generator. Build the value you want directly with <code>map</code>, <code>builds</code> or bounds on the strategy.' },
    { title: 'Function-scoped fixtures are shared across examples', bad: `@pytest.fixture
def cart(): return []

@given(st.integers())
def test_add(cart, n):
    cart.append(n)
    assert len(cart) == 1   # true for the first example only`, good: `@given(st.integers())
def test_add(n):
    cart = []               # fresh per example
    cart.append(n)
    assert len(cart) == 1`, why: 'pytest builds the fixture once per test function, and Hypothesis calls that function many times. Hypothesis raises <code>HealthCheck.function_scoped_fixture</code> to stop you; build per-example state inside the test.' },
    { title: 'Randomness inside the test makes it flaky', bad: `@given(st.integers())
def test_x(n):
    k = random.randint(0, n)     # different each replay
    assert f(n, k)`, good: `@given(st.integers(0, 10**6), st.data())
def test_x(n, data):
    k = data.draw(st.integers(0, n))`, why: 'Shrinking replays the test and expects the same result. A value Hypothesis did not draw cannot be replayed or shrunk, and a failure that does not reproduce is reported as <code>Flaky</code>.' },
    { title: 'The deadline trips on a slow first example', bad: `@given(st.text())
def test_parse_file(s):
    path.write_text(s)         # disk I/O: sometimes 300 ms
    assert parse(path)
# DeadlineExceeded, then Flaky on replay`, good: `@settings(deadline=None)
@given(st.text())
def test_parse_file(s): ...`, why: 'The 200 ms per-example deadline exists to catch accidental slowness in pure code. For I/O, JIT warm-up or shared caches, turn it off or raise it rather than living with intermittent failures.' },
  ],
  presets: [
    { title: 'Sorting properties', code: RUN(`from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sorted_is_ordered_and_a_permutation(xs):
    out = sorted(xs)
    assert all(a <= b for a, b in zip(out, out[1:]))
    assert sorted(out) == out                  # idempotent
    assert len(out) == len(xs) and set(out) == set(xs)

@given(st.lists(st.integers(), min_size=1))
def test_max_is_last_after_sort(xs):
    assert sorted(xs)[-1] == max(xs)
`) },
  ],
};
