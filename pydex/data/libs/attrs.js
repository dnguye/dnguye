import { scene } from '../../js/explainer.js';

// The generated __init__: converters as each value lands, validators once everything is set, then the hook.
const initExplainer = {
  hold: 3200,
  code: ['@define', 'class Order:', '    qty: int = field(converter=int, validator=ge(1))', '    region: str = field(converter=str.upper, validator=in_(REGIONS))', 'Order(qty="3", region="north")', 'order.qty = "0"   # on_setattr: convert, then validate'],
  build() {
    const s = scene(760, 330);
    const stage = (id, y, label, cls = 'cell') => s.cell(id, 20, y, 320, 32, label, cls);
    stage('call', 30, 'Order(qty="3", region="north")');
    stage('conv', 88, 'convert: int("3"), str.upper("north")', 'cell hid');
    stage('assign', 146, 'self.qty = 3    self.region = "NORTH"', 'cell hid');
    stage('valid', 204, 'validate all: ge(1), in_(REGIONS)', 'cell hid');
    stage('post', 262, '__attrs_post_init__(self)', 'cell hid');
    s.arrow('a1', 180, 64, 180, 84, 'arrow hid'); s.arrow('a2', 180, 122, 180, 142, 'arrow hid');
    s.arrow('a3', 180, 180, 180, 200, 'arrow hid'); s.arrow('a4', 180, 238, 180, 258, 'arrow hid');
    s.text('t-inst', 400, 24, 'the instance', 'lbl bold', undefined, 'start');
    s.rect('inst-p', 400, 36, 340, 100, 'panel', undefined, 8);
    s.cell('st-qty', 412, 48, 316, 32, 'qty: (not set yet)');
    s.cell('st-reg', 412, 92, 316, 32, 'region: (not set yet)');
    s.text('m1', 400, 170, '', 'lbl sm ink-2', undefined, 'start');
    s.text('m2', 400, 194, '', 'lbl sm ink-2', undefined, 'start');
    s.text('m3', 400, 218, '', 'lbl sm ink-2', undefined, 'start');
    s.text('m4', 400, 242, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The call reaches a generated __init__', caption: 'define wrote an __init__ whose parameters are the fields in order (a leading underscore is stripped). Both arguments arrive as strings. Nothing has been checked yet.', lines: [0, 1, 4],
      patch: { 'call.r': { cls: 'cell hot' }, m1: { text: 'def __init__(self, qty=NOTHING, region=NOTHING):' } } },
    { title: 'Converters run as each field is assigned', caption: 'For every field with a converter, the generated code does self.qty = int(qty) and self.region = str.upper(region), in field order. A converter also runs on the default value, so a default of "3" would become 3 too.', lines: [2, 3],
      patch: { 'call.r': { cls: 'cell' }, a1: { cls: 'arrow hot' }, conv: { cls: '' }, 'conv.r': { cls: 'cell hot' }, a2: { cls: 'arrow hot' }, assign: { cls: '' }, 'assign.r': { cls: 'cell ok' },
        'st-qty.t': { text: 'qty: 3   (int)' }, 'st-reg.t': { text: 'region: "NORTH"' }, 'st-qty.r': { cls: 'cell ok' }, 'st-reg.r': { cls: 'cell ok' },
        m1: { text: 'self.qty = int("3")' }, m2: { text: 'self.region = str.upper("north")' } } },
    { title: 'Validators run after every field is set', caption: 'Only now does attrs call each validator as validator(instance, attribute, value). Because all attributes already exist, a validator on region may read self.qty: cross-field checks work without any special hook.', lines: [2, 3],
      patch: { 'conv.r': { cls: 'cell' }, a3: { cls: 'arrow hot' }, valid: { cls: '' }, 'valid.r': { cls: 'cell hot' },
        m1: { text: 'ge(1)(self, fields(Order).qty, 3)          ok' }, m2: { text: 'in_(REGIONS)(self, fields(Order).region, "NORTH")   ok' }, m3: { text: 'a failing validator raises ValueError / TypeError' }, m4: { text: 'and the half-built instance is discarded' } } },
    { title: 'Then your hook, if any', caption: '__attrs_post_init__ runs last, with converted and validated attributes. Use it for derived fields; use __attrs_pre_init__ when a base class __init__ must run first.', lines: [1],
      patch: { 'valid.r': { cls: 'cell ok' }, a4: { cls: 'arrow hot' }, post: { cls: '' }, 'post.r': { cls: 'cell ok' }, m1: { text: 'Order(qty=3, region="NORTH")' }, m2: { text: '' }, m3: { text: '' }, m4: { text: '' } } },
    { title: 'Assignment later runs the same pipeline', caption: 'Classes made with define get on_setattr=[convert, validate] by default: order.qty = "0" is converted to 0 and then rejected by ge(1), so the attribute keeps its old value. The classic attr.s decorator does not do this; frozen classes refuse the assignment outright.', lines: [5],
      patch: { 'post.r': { cls: 'cell' }, 'call.t': { text: 'order.qty = "0"' }, 'call.r': { cls: 'cell hot' }, 'conv.r': { cls: 'cell hot' }, 'conv.t': { text: 'convert: int("0")' }, 'assign.r': { cls: 'cell' }, 'assign.t': { text: 'assignment skipped: validation failed' }, 'valid.r': { cls: 'cell err' }, post: { cls: 'dim' }, a4: { cls: 'arrow ghost' },
        'st-qty.t': { text: 'qty: 3   (unchanged)' }, m1: { text: 'int("0") → 0' }, m2: { text: 'ge(1) → ValueError: \'qty\' must be >= 1: 0' }, m3: { text: 'attr.s classes: plain assignment, no checks' } } },
  ],
};

export default {
  id: 'attrs', name: 'attrs', glyph: 'at', group: 'models', version: '23.2', keywords: 'define field validator converter frozen evolve asdict Factory slots attr.s',
  tagline: 'Classes without boilerplate, plus validators and converters.',
  install: 'pip install attrs', docs: 'https://www.attrs.org/en/stable/', packages: ['attrs'], runnable: true,
  overview: {
    what: 'attrs generates __init__, __repr__, __eq__, ordering and hashing from annotated fields, like dataclasses, and then goes further: each field can carry converters that normalise input and validators that reject bad values, both re-run on assignment. Classes use __slots__ by default, evolve() copies with changes, and asdict() walks nested structures. dataclasses was modelled on it; attrs remains the more complete tool when a record needs to defend itself.',
    yes: ['Records that must validate or normalise their inputs at construction.', 'Immutable value objects with cheap copy-with-changes (frozen + evolve).', 'Many instances: slotted classes by default.', 'You want dataclass ergonomics without waiting for the next Python release.'],
    no: ['JSON parsing with schemas and error reports (pydantic, or attrs + cattrs).', 'Zero third-party dependencies (dataclasses).', 'Tuple-like records (typing.NamedTuple).', 'ORM or settings frameworks with their own model base.'],
    note: 'Two APIs coexist. The modern one is <code>attrs.define</code> / <code>attrs.field</code> (2021+, slotted, validates on assignment). The classic <code>attr.s</code> / <code>attr.ib</code> is kept for compatibility; new code should not use it.',
  },
  cheatsheet: [
    { id: 'define', title: 'define and field', blurb: 'Annotate fields; field() adds defaults, factories and per-field options.', snippets: [
      { title: 'A class in three lines', code: `from attrs import define, field, Factory

@define
class Product:
    id: int
    name: str
    price: float = 0.0
    tags: list[str] = field(factory=list)         # or Factory(list)
    meta: dict = Factory(dict)                    # same thing, no field()

p = Product(101, "Kettle", 39.0)
print(p)                                          # repr, eq, hash rules as dataclasses
print(p == Product(101, "Kettle", 39.0))
p.tags.append("kitchen")
print(p.tags, Product(1, "x").tags)               # separate lists
print(Product.__slots__)                          # slotted by default`, note: '<code>define</code> is <code>slots=True</code>, <code>eq=True</code>, <code>order=False</code>, <code>on_setattr=[convert, validate]</code>. Use <code>attrs.frozen</code> for the immutable variant.' },
      { title: 'Private attributes and aliases', code: `from attrs import define, field, fields

@define
class Account:
    _balance: float = 0.0                        # init argument is "balance"
    owner: str = field(default="", alias="name")  # explicit init name

    def deposit(self, amount):
        self._balance += amount
        return self

a = Account(balance=10, name="Ann").deposit(5)
print(a)                                          # repr shows _balance
print(a._balance, a.owner)
print([(f.name, f.alias) for f in fields(Account)])`, note: 'attrs strips one leading underscore to build the parameter name. That keeps "private" storage and a clean public constructor without a property.' },
    ] },
    { id: 'validators', title: 'Validators', blurb: 'Called after all fields are set, as validator(instance, attribute, value). Raise to reject.', snippets: [
      { title: 'Built-in validators', code: `from attrs import define, field, validators as v

REGIONS = {"North", "South", "East", "West"}

@define
class Order:
    region: str = field(validator=v.in_(REGIONS))
    quantity: int = field(validator=[v.instance_of(int), v.ge(1), v.le(100)])
    note: str = field(default="", validator=v.max_len(40))
    email: str | None = field(default=None, validator=v.optional(v.matches_re(r"[^@]+@[^@]+")))

print(Order("North", 3))
for bad in [dict(region="Mars", quantity=1), dict(region="East", quantity=0),
            dict(region="East", quantity="2"), dict(region="East", quantity=1, email="nope")]:
    try:
        Order(**bad)
    except (ValueError, TypeError) as e:
        print(type(e).__name__, "-", e.args[0])`, note: 'A list of validators runs in order and is the same as <code>v.and_(…)</code>. <code>v.optional</code> lets <code>None</code> through.' },
      { title: 'Custom and cross-field validators', code: `from attrs import define, field, validators as v

@define
class Booking:
    start: int
    end: int = field()
    guests: list[str] = field(factory=list, validator=v.deep_iterable(
        member_validator=v.instance_of(str), iterable_validator=v.instance_of(list)))

    @end.validator
    def _end_after_start(self, attribute, value):
        if value <= self.start:                 # other fields are already set
            raise ValueError(f"{attribute.name} must be after start ({self.start})")

print(Booking(1, 3, ["ann"]))
for args in [(3, 1), (1, 2, ["ann", 7])]:
    try:
        Booking(*args)
    except (ValueError, TypeError) as e:
        print(type(e).__name__, "-", e.args[0])`, note: 'The decorator form and <code>field(validator=…)</code> can be combined on one field. Validators see the whole instance because they run after every assignment.' },
      { title: 'Validation on assignment, and switching it off', code: `from attrs import define, field, validators as v, setters
import attrs

@define
class Slider:
    value: int = field(validator=[v.ge(0), v.le(10)])
    label: str = field(default="", on_setattr=setters.NO_OP)   # this one is free-form

s = Slider(5)
s.value = 7                     # validated on the way in
try:
    s.value = 11
except ValueError as e:
    print("rejected:", e.args[0])
print(s.value)

attrs.validators.set_disabled(True)   # e.g. in a hot loop you trust
Slider(99); print("no check while disabled")
attrs.validators.set_disabled(False)` },
    ] },
    { id: 'converters', title: 'Converters', blurb: 'Run before assignment, on arguments and on defaults. Normalise, do not validate.', snippets: [
      { title: 'Coerce and normalise input', code: `from attrs import define, field, converters as c

@define
class Reading:
    sensor: str = field(converter=str.strip)
    value: float = field(converter=float)
    ts: int | None = field(default=None, converter=c.optional(int))      # None passes
    unit: str = field(default=None, converter=c.default_if_none("C"))    # None → "C"
    active: bool = field(default="yes", converter=c.to_bool)             # "yes"/"1"/"true"
    tags: tuple = field(default=(), converter=c.pipe(sorted, tuple))     # chain converters

r = Reading("  t1 ", "21.5", "1700000000", tags=["b", "a"])
print(r)
print(Reading("t2", 3))              # converters also run on the defaults
r.value = "22.0"                     # and again on assignment
print(type(r.value).__name__, r.value)`, note: 'Converters run in field order, before any validator. The converted value is what validators and your code see.' },
    ] },
    { id: 'frozen', title: 'frozen and evolve', blurb: 'Immutable instances, and the idiomatic way to change them.', snippets: [
      { title: 'Value objects', code: `from attrs import frozen, evolve, field
from attrs.exceptions import FrozenInstanceError

@frozen
class Money:
    amount: int
    currency: str = field(converter=str.upper)

    def __add__(self, other):
        if other.currency != self.currency:
            raise ValueError("currency mismatch")
        return evolve(self, amount=self.amount + other.amount)   # copy with changes

m = Money(100, "eur")
try:
    m.amount = 5
except FrozenInstanceError:
    print("immutable")
print(m + Money(50, "EUR"), {m, Money(100, "EUR")})       # hashable
print(evolve(m, currency="usd"))                          # converters run again`, note: '<code>evolve</code> calls <code>__init__</code>, so converters and validators apply to the changed fields. It takes init names, so a private <code>_x</code> is changed with <code>evolve(o, x=…)</code>.' },
      { title: 'on_setattr: per-class and per-field', code: `from attrs import define, field, setters

@define(on_setattr=setters.frozen)          # every field read-only after init
class Config:
    host: str
    port: int = 8000

cfg = Config("localhost")
try:
    cfg.port = 9000
except AttributeError as e:                 # FrozenAttributeError
    print(type(e).__name__)

@define
class Session:
    user: str = field(on_setattr=setters.frozen)   # only this field is locked
    hits: int = 0

s = Session("ann"); s.hits += 1
print(s)` },
    ] },
    { id: 'convert', title: 'asdict, fields, filters', snippets: [
      { title: 'Introspect and serialise', code: `from attrs import define, field, asdict, astuple, fields, filters, has

@define
class Line:
    sku: str
    qty: int

@define
class Order:
    id: int
    lines: list[Line]
    secret: str = field(default="", repr=False)

o = Order(1, [Line("A1", 2)], "tok")
print(asdict(o))                                   # recursive
print(asdict(o, filter=filters.exclude(fields(Order).secret)))
print(asdict(o, recurse=False)["lines"][0])        # keeps Line objects
print(astuple(o), has(Order), has(dict))
print([f.name for f in fields(Order)], fields(Order).id.type)` },
      { title: 'Load and check products.json', code: `import json
from attrs import define, field, validators as v, converters as c

@define(frozen=True)
class Product:
    id: int = field(converter=int)
    name: str = field(converter=str.strip, validator=v.min_len(1))
    category: str = field(validator=v.in_({"kitchen", "office", "outdoor", "fitness"}))
    price: float = field(converter=float, validator=v.gt(0))

with open("/data/products.json") as f:
    products = [Product(**d) for d in json.load(f)]

print(len(products), products[0])
by_cat = {}
for p in products:
    by_cat.setdefault(p.category, []).append(p.price)
print({k: round(sum(x) / len(x), 2) for k, x in sorted(by_cat.items())})`, note: 'For real JSON boundaries use <code>cattrs</code>: it structures nested dicts into attrs classes with typed error reports.' },
    ] },
    { id: 'hooks', title: 'Hooks and comparison', snippets: [
      { title: '__attrs_post_init__ and __attrs_pre_init__', code: `from attrs import define, field

class Base:
    def __init__(self):
        self.log = []          # attrs will not call this unless asked

@define
class Job(Base):
    name: str
    retries: int = 3
    slug: str = field(init=False)

    def __attrs_pre_init__(self):
        super().__init__()     # runs before the generated __init__
    def __attrs_post_init__(self):
        self.slug = self.name.lower().replace(" ", "-")
        self.log.append("created")

j = Job("Nightly Build")
print(j, j.log)`, note: '<code>init=False</code> fields are set in <code>__attrs_post_init__</code>. For a derived value you never store, a plain <code>@property</code> is simpler.' },
      { title: 'Tune equality and ordering', code: `from attrs import define, field

@define(order=True)
class Version:
    major: int
    minor: int
    build: str = field(default="", eq=False, order=False)    # ignored by == and <

@define
class Tag:
    name: str = field(eq=str.lower)          # compare via a key function

print(sorted([Version(1, 10, "b"), Version(1, 2, "a")]))
print(Version(1, 2, "x") == Version(1, 2, "y"))
print(Tag("Sale") == Tag("SALE"), Tag("Sale") == Tag("sold"))

@define(eq=False)                          # identity semantics: no __eq__, default __hash__
class Node:
    value: int
a = Node(1)
print(a == Node(1), a == a, len({a, Node(1)}))` },
    ] },
  ],
  concepts: [
    { id: 'init', title: 'The __init__ pipeline', intro: 'A call to an attrs class passes through a fixed sequence: converters as each value lands, validators once everything is in place, then your hook. The same sequence runs again on assignment for <code>define</code> classes. Knowing the order explains why validators can read other fields and why a converter never sees a validated value.', explainer: initExplainer },
  ],
  compare: [
    { title: 'attrs against dataclasses', columns: ['attrs.define', '@dataclass'], rows: [
      ['Validators, run at init and on assignment', true, { part: '__post_init__ by hand' }],
      ['Converters (coerce input, also defaults)', true, false],
      ['__slots__ by default', true, { part: 'slots=True' }],
      ['Copy with changes', { code: 'evolve(o, x=1)' }, { code: 'replace(o, x=1)' }],
      ['Private attribute with a clean init name', true, false],
      ['Per-field eq/order key functions', true, false],
      ['asdict with filters', true, { part: 'dict_factory only' }],
      ['Frozen, ordering, kw_only, match_args', true, true],
      ['Runs without an install', false, true],
    ], verdict: 'The two feel the same at the call site. Pick attrs when fields need converting or validating, or when you rely on slots and evolve; pick dataclasses when the record is internal and a dependency is not worth it.' },
    { title: 'The decorators', columns: ['attrs.define', 'attrs.frozen', 'attr.s (classic)', 'attr.s(auto_attribs=True)'], rows: [
      ['Fields declared by', 'annotation', 'annotation', 'attr.ib() only', 'annotation'],
      ['Slotted by default', true, true, false, false],
      ['Converters and validators on assignment', true, { part: 'assignment refused' }, false, false],
      ['Mutable instances', true, false, true, true],
      ['Hashable by default', false, true, false, false],
      ['Recommended for new code', true, true, false, false],
    ], note: '<code>attrs.mutable</code> is an alias of <code>define</code>. Classic <code>attr.s</code> stays for old code bases and will keep working.', verdict: 'Import from <code>attrs</code>, not <code>attr</code>, and use <code>define</code> or <code>frozen</code>. Reach for the classic API only when maintaining code that already uses it.' },
  ],
  gotchas: [
    { title: 'A leading underscore changes the init name', bad: `@define
class Account:
    _balance: float = 0.0

Account(_balance=10)
# TypeError: unexpected keyword argument '_balance'`, good: `Account(balance=10)
# or keep the underscore as the argument name:
_balance: float = field(default=0.0, alias="_balance")`, why: 'attrs strips one leading underscore when it builds <code>__init__</code> so private storage can have a public parameter. <code>evolve</code> and <code>fields(...).alias</code> use the same stripped name.' },
    { title: 'Mutable defaults are shared, not rejected', bad: `@define
class Cart:
    items: list = []       # one list for every Cart

a, b = Cart(), Cart()
a.items.append(1)
print(b.items)            # [1]`, good: `@define
class Cart:
    items: list = field(factory=list)   # or Factory(list)`, why: 'Unlike dataclasses, attrs does not raise on a mutable default; the class attribute is used as-is. <code>factory=</code> calls the callable once per instance.' },
    { title: 'Classic attr.s does not validate on assignment', bad: `@attr.s
class Slider:
    value = attr.ib(validator=attr.validators.le(10))

s = Slider(5)
s.value = 99      # accepted silently`, good: `@define
class Slider:
    value: int = field(validator=validators.le(10))

s = Slider(5)
s.value = 99      # ValueError`, why: '<code>define</code> sets <code>on_setattr=[setters.convert, setters.validate]</code>; <code>attr.s</code> defaults to no hooks. Either add <code>on_setattr</code> to the classic decorator or, better, migrate.' },
    { title: 'Converters run before validators, and on defaults', bad: `@define
class Row:
    n: int = field(converter=int, validator=validators.instance_of(str))

Row("3")   # TypeError: 'n' must be <class 'str'> (got 3 ...)
# the validator never sees the string`, good: `@define
class Row:
    n: int = field(converter=int, validator=validators.ge(0))
Row("3")   # Row(n=3)`, why: 'The pipeline is fixed: convert, assign, then validate. Write validators for the converted type. Defaults go through converters too, so <code>default="3"</code> with <code>converter=int</code> yields <code>3</code>.' },
  ],
  presets: [
    { title: 'Validated orders from the CSV', code: `import csv
from attrs import define, field, validators as v, evolve

@define(frozen=True)
class Order:
    order_id: int = field(converter=int)
    region: str = field(validator=v.in_({"North", "South", "East", "West"}))
    quantity: int = field(converter=int, validator=v.ge(1))
    unit_price: float = field(converter=float)
    discount: float = field(converter=float, validator=[v.ge(0), v.lt(1)])

    def total(self):
        return round(self.quantity * self.unit_price * (1 - self.discount), 2)

keep = ("order_id", "region", "quantity", "unit_price", "discount")
with open("/data/orders.csv") as f:
    orders = [Order(**{k: r[k] for k in keep}) for r in csv.DictReader(f)]

top = max(orders, key=Order.total)
print(top, top.total())
print(evolve(top, discount=0.5).total())` },
  ],
};
