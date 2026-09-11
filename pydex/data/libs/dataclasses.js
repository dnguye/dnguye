import { scene } from '../../js/explainer.js';

// What the decorator writes for you, one method at a time.
const generateExplainer = {
  hold: 3200,
  code: ['@dataclass(order=True, frozen=True)', 'class Order:', '    id: int', '    qty: int = 1', '    tags: list = field(default_factory=list)', '# → __init__ __repr__ __eq__ __lt__… __setattr__ __hash__'],
  build() {
    const s = scene(760, 320);
    s.text('t-cls', 20, 24, 'class body', 'lbl bold', undefined, 'start');
    s.rect('cls-p', 20, 36, 280, 130, 'panel', undefined, 8);
    s.cell('f0', 30, 46, 260, 32, 'id: int');
    s.cell('f1', 30, 86, 260, 32, 'qty: int = 1');
    s.cell('f2', 30, 126, 260, 32, 'tags = field(default_factory=list)');
    s.cell('deco', 330, 84, 120, 36, '@dataclass', 'cell info');
    s.arrow('a-in', 302, 102, 326, 102, 'arrow hid');
    s.arrow('a-out', 452, 102, 466, 102, 'arrow hid');
    s.text('t-gen', 470, 24, 'generated on the class', 'lbl bold', undefined, 'start');
    const gen = [['init', '__init__(self, id, qty=1, tags=…)'], ['repr', '__repr__ → Order(id=1, qty=1, …)'], ['eq', '__eq__ compares field tuples'], ['ord', '__lt__ __le__ __gt__ __ge__ (order)'], ['setattr', '__setattr__ → FrozenInstanceError'], ['hash', '__hash__ from fields (frozen + eq)']];
    gen.forEach(([id, label], i) => s.cell(`g-${id}`, 470, 40 + i * 40, 270, 32, label, 'cell hid'));
    s.text('note', 20, 200, '', 'lbl sm ink-2', undefined, 'start');
    s.text('note2', 20, 224, '', 'lbl sm ink-2', undefined, 'start');
    s.text('note3', 20, 248, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Fields come from the annotations, in order', caption: 'The decorator reads __annotations__ of the class body. Every annotated name becomes a field, in definition order; unannotated assignments and ClassVar names are skipped. That order fixes the __init__ signature and the comparison tuple.', lines: [1, 2, 3, 4],
      patch: { 'f0.r': { cls: 'cell hot' }, 'f1.r': { cls: 'cell hot' }, 'f2.r': { cls: 'cell hot' }, 'a-in': { cls: 'arrow hot' }, note: { text: 'fields(Order) → (id, qty, tags)' } } },
    { title: '__init__ is written from the field list', caption: 'A source string like "def __init__(self, id, qty=1, tags=_HAS_DEFAULT_FACTORY): …" is built and exec()-ed once, at class creation. Defaults become parameter defaults. A default_factory is called inside __init__, so every instance gets its own list.', lines: [2, 3, 4],
      patch: { 'a-out': { cls: 'arrow hot' }, 'g-init': { cls: '' }, 'g-init.r': { cls: 'cell ok' }, note: { text: 'Order(7) → self.id = 7; self.qty = 1; self.tags = list()' }, note2: { text: 'a plain "tags: list = []" is refused: the one list would be shared' } } },
    { title: '__repr__ and __eq__ use the same field tuple', caption: '__repr__ prints every field with repr=True. __eq__ returns (id, qty, tags) == (other.id, other.qty, other.tags), and only when other is the same class; otherwise NotImplemented. With eq=True and no frozen, __hash__ is set to None: equal-by-value objects must not sit in a set while they can still change.', lines: [5],
      patch: { 'f0.r': { cls: 'cell' }, 'f1.r': { cls: 'cell' }, 'f2.r': { cls: 'cell' }, 'g-init.r': { cls: 'cell' }, 'g-repr': { cls: '' }, 'g-repr.r': { cls: 'cell ok' }, 'g-eq': { cls: '' }, 'g-eq.r': { cls: 'cell ok' },
        note: { text: 'Order(7) == Order(7) → True' }, note2: { text: 'eq=True without frozen → __hash__ = None (unhashable)' } } },
    { title: 'order=True adds the four comparisons', caption: 'Each of __lt__, __le__, __gt__ and __ge__ compares the same tuples, so instances sort by the first field, then the second. Comparing to another class raises TypeError. Exclude a field from the tuple with field(compare=False).', lines: [0],
      patch: { 'g-repr.r': { cls: 'cell' }, 'g-eq.r': { cls: 'cell' }, 'g-ord': { cls: '' }, 'g-ord.r': { cls: 'cell ok' }, note: { text: 'sorted(orders) sorts by (id, qty, tags)' }, note2: { text: 'Order(1) < Order(2) → True; Order(1) < 5 → TypeError' } } },
    { title: 'frozen=True swaps in a __setattr__ that refuses', caption: 'Assignment after construction raises FrozenInstanceError. Inside __init__ the generated code uses object.__setattr__ to get past its own guard, which is also what you use in __post_init__. Because the instance cannot change, eq+frozen now generates a real __hash__ from the fields.', lines: [0, 5],
      patch: { 'g-ord.r': { cls: 'cell' }, 'g-setattr': { cls: '' }, 'g-setattr.r': { cls: 'cell err' }, 'g-hash': { cls: '' }, 'g-hash.r': { cls: 'cell ok' },
        note: { text: 'o.qty = 2 → FrozenInstanceError' }, note2: { text: '{Order(7), Order(7)} → one element; usable as a dict key' }, note3: { text: 'tags=[] still makes it unhashable at hash() time: use a tuple for frozen data' } } },
  ],
};

export default {
  id: 'dataclasses', name: 'dataclasses', glyph: 'dc', group: 'models', version: '3.12', keywords: 'dataclass field default_factory frozen slots asdict replace post_init kw_only',
  tagline: 'Classes that are mostly data, with the boilerplate written for you.',
  install: 'standard library', docs: 'https://docs.python.org/3/library/dataclasses.html', packages: [], runnable: true,
  overview: {
    what: 'dataclasses turns a class body of annotated fields into a class with a generated __init__, __repr__ and __eq__, and optionally ordering, immutability, __slots__ and a keyword-only constructor. Nothing happens at runtime beyond that: instances are ordinary objects with ordinary attributes, there is no validation, and the type hints are not enforced. It is the standard-library answer to "I want a record type without writing __init__".',
    yes: ['Plain records and value objects: config, DTOs, rows, results.', 'Classes that need a sensible repr and equality without hand-writing them.', 'Immutable keys for sets and dicts (frozen=True).', 'A base you can grow methods on, unlike a namedtuple.'],
    no: ['Input validation or coercion (pydantic, attrs with validators).', 'Serialisation to and from JSON schemas (pydantic, cattrs, msgspec).', 'ORM models or anything with lazy attributes (SQLAlchemy, Django).', 'Tuple semantics: unpacking, indexing, being a tuple (typing.NamedTuple).'],
  },
  cheatsheet: [
    { id: 'define', title: 'Define a dataclass', blurb: 'Annotate the fields; the decorator writes the constructor.', snippets: [
      { title: 'Fields, defaults, default_factory', code: `from dataclasses import dataclass, field

@dataclass
class Product:
    id: int
    name: str
    price: float = 0.0
    tags: list[str] = field(default_factory=list)   # never a bare []

p = Product(101, "Kettle", 39.0)
print(p)                                  # generated __repr__
print(p == Product(101, "Kettle", 39.0))  # generated __eq__: by value
p.tags.append("kitchen")
print(p.tags, Product(1, "x").tags)       # each instance has its own list`, note: 'Defaults must follow non-defaults, as in any signature. A mutable default (<code>list</code>, <code>dict</code>, <code>set</code>) raises <code>ValueError</code>; use <code>default_factory</code>.' },
      { title: 'field() options', code: `from dataclasses import dataclass, field, fields

@dataclass
class User:
    name: str
    email: str = field(repr=False)                # hide from repr
    password_hash: str = field(repr=False, compare=False)
    id: int = field(default=0, metadata={"db": "primary_key"})
    logins: int = field(default=0, init=False)    # not a constructor argument

u = User("ann", "ann@example.com", "x1")
print(u)                                          # name and id only
print(u == User("ann", "ann@example.com", "OTHER"))   # hash ignored in eq
u.logins += 1
print([(f.name, f.init, f.metadata) for f in fields(User)])`, note: '<code>metadata</code> is an inert mapping for your own tooling; dataclasses never reads it.' },
    ] },
    { id: 'behaviour', title: 'Generated behaviour', blurb: 'Flags on the decorator switch methods on and off.', snippets: [
      { title: 'order=True and sorting', code: `from dataclasses import dataclass, field

@dataclass(order=True)
class Version:
    major: int
    minor: int
    label: str = field(default="", compare=False)   # ignored by == and <

vs = [Version(1, 10, "old"), Version(2, 0), Version(1, 2, "lts")]
print(sorted(vs))
print(Version(1, 2) < Version(1, 10), Version(1, 2, "a") == Version(1, 2, "b"))
print(max(vs))

try:
    Version(1, 0) < (1, 0)
except TypeError as e:
    print("TypeError:", e)`, note: 'Ordering compares fields as tuples, in declaration order. Put the most significant field first.' },
      { title: 'frozen=True: immutable and hashable', code: `from dataclasses import dataclass, FrozenInstanceError

@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def moved(self, dx, dy):
        return Point(self.x + dx, self.y + dy)   # return a new one

p = Point(1, 2)
try:
    p.x = 5
except FrozenInstanceError as e:
    print("frozen:", e)

visited = {p, Point(1, 2), p.moved(1, 0)}      # hashable → set/dict keys
print(len(visited), hash(p) == hash(Point(1, 2)))`, note: 'Without <code>frozen</code>, <code>eq=True</code> sets <code>__hash__</code> to <code>None</code>. <code>unsafe_hash=True</code> forces a hash on a mutable class; usually a mistake.' },
    ] },
    { id: 'postinit', title: '__post_init__ and InitVar', blurb: 'Run code after the generated __init__: validate, derive, or consume constructor-only arguments.', snippets: [
      { title: 'Validate and derive', code: `from dataclasses import dataclass, field

@dataclass
class Order:
    quantity: int
    unit_price: float
    discount: float = 0.0
    total: float = field(init=False)      # computed, not passed in

    def __post_init__(self):
        if not 0 <= self.discount < 1:
            raise ValueError(f"bad discount {self.discount}")
        self.total = round(self.quantity * self.unit_price * (1 - self.discount), 2)

print(Order(3, 79.0, 0.15))
try:
    Order(1, 10.0, 1.5)
except ValueError as e:
    print("ValueError:", e)`, note: 'A field with <code>init=False</code> must be assigned in <code>__post_init__</code> or given a default; otherwise the attribute simply does not exist.' },
      { title: 'InitVar: constructor-only inputs', code: `from dataclasses import dataclass, field, InitVar

@dataclass
class Connection:
    host: str
    port: int = 5432
    password: InitVar[str | None] = None      # accepted by __init__, not stored
    dsn: str = field(init=False, repr=False)

    def __post_init__(self, password):
        auth = f":{password}" if password else ""
        self.dsn = f"postgres://user{auth}@{self.host}:{self.port}"

c = Connection("db.local", password="s3cret")
print(c)                     # password is not a field, so not in repr
print(c.dsn)
print(hasattr(c, "password"))` },
    ] },
    { id: 'convert', title: 'Convert and copy', blurb: 'Module-level helpers work on any dataclass instance or class.', snippets: [
      { title: 'asdict, astuple, replace, fields', code: `from dataclasses import dataclass, asdict, astuple, replace, fields, is_dataclass

@dataclass
class Line:
    sku: str
    qty: int

@dataclass
class Order:
    id: int
    lines: list[Line]

o = Order(1, [Line("A1", 2), Line("B2", 1)])
print(asdict(o))                    # recursive: nested dataclasses become dicts
print(astuple(o))
o2 = replace(o, id=2)               # shallow copy with changes, runs __init__
print(o2.id, o2.lines is o.lines)   # the list is shared
print([f.name for f in fields(o)], is_dataclass(o), is_dataclass(Order))`, note: '<code>asdict</code> deep-copies every value it walks through. On large nested structures it is slow; read attributes directly or use <code>vars(o)</code> for a shallow view.' },
      { title: 'Load records from JSON', code: `import json
from dataclasses import dataclass, fields

@dataclass(frozen=True)
class Product:
    id: int
    name: str
    category: str
    price: float

    @classmethod
    def from_dict(cls, d):
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in d.items() if k in known})   # ignore extras

with open("/data/products.json") as f:
    products = [Product.from_dict(d) for d in json.load(f)]

print(len(products), products[0])
print(max(products, key=lambda p: p.price))
print(sorted({p.category for p in products}))` },
    ] },
    { id: 'options', title: 'slots, kw_only, match_args', blurb: 'Newer flags: leaner instances, keyword-only construction, pattern matching.', snippets: [
      { title: 'slots=True and kw_only', code: `from dataclasses import dataclass, KW_ONLY

@dataclass(slots=True)
class Vec:
    x: float
    y: float

v = Vec(1, 2)
try:
    v.z = 3                        # no __dict__: the attribute set is fixed
except AttributeError as e:
    print("AttributeError:", e)

@dataclass
class Job:
    name: str
    _: KW_ONLY                     # everything after this is keyword-only
    retries: int = 3
    timeout: float = 30.0

print(Job("build", timeout=5))
print(Job.__match_args__)      # positional names only`, note: '<code>slots=True</code> creates a new class, so <code>super()</code> without arguments breaks inside its methods; use <code>super(Vec, self)</code>. <code>kw_only=True</code> on the decorator makes every field keyword-only.' },
      { title: 'Pattern matching on dataclasses', code: `from dataclasses import dataclass

@dataclass
class Shipped:
    order_id: int
    carrier: str
@dataclass
class Cancelled:
    order_id: int
    reason: str = ""
def describe(event):
    match event:
        case Shipped(order_id=i, carrier="DHL"):
            return f"{i}: express via DHL"
        case Shipped(i, carrier):            # positional uses __match_args__
            return f"{i}: shipped via {carrier}"
        case Cancelled(i, reason) if reason:
            return f"{i}: cancelled ({reason})"
        case Cancelled(i):
            return f"{i}: cancelled"
for e in [Shipped(1, "DHL"), Shipped(2, "UPS"), Cancelled(3, "fraud"), Cancelled(4)]:
    print(describe(e))` },
    ] },
    { id: 'inherit', title: 'Inheritance and class attributes', snippets: [
      { title: 'Subclass fields and ClassVar', code: `from dataclasses import dataclass, field
from typing import ClassVar

@dataclass
class Base:
    id: int
    created: str = "today"

@dataclass
class Employee(Base):
    registry: ClassVar[list] = []      # not a field: shared, not in __init__
    name: str = ""                     # must have a default: Base already has one
    team: str = "Sales"

e = Employee(1, name="Ann")
print(e)                               # fields in MRO order: id, created, name, team
Employee.registry.append(e.id)
print(Employee.registry, "registry" in Employee.__dataclass_fields__)`, note: 'Fields are merged base-first. A subclass may re-declare a base field to change its default; its position stays where the base put it.' },
    ] },
    { id: 'json', title: 'To JSON and back', snippets: [
      { title: 'Round-trip through json', code: `import json
from dataclasses import dataclass, asdict, field

@dataclass
class Cart:
    user: str
    items: dict[str, int] = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)

cart = Cart("ann", {"kettle": 1, "knife": 2}, ["gift wrap"])
text = json.dumps(asdict(cart), indent=1)
print(text)

back = Cart(**json.loads(text))          # keys match field names exactly
print(back == cart)`, note: 'Only JSON-native types survive the trip: nested dataclasses come back as dicts, dates as strings. Convert them in <code>__post_init__</code> or use a library.' },
    ] },
  ],
  concepts: [
    { id: 'generate', title: 'What @dataclass generates', intro: 'The decorator is a code generator that runs once, when the class is created. Knowing which method comes from which flag explains the error messages (<code>FrozenInstanceError</code>, "unhashable type", "non-default argument follows default argument") and where <code>__post_init__</code> fits.', explainer: generateExplainer },
  ],
  compare: [
    { title: 'What each decorator flag changes', columns: ['@dataclass', 'frozen=True', 'order=True', 'slots=True', 'kw_only=True'], rows: [
      ['Instances mutable', true, false, true, true, true],
      ['Hashable (usable in sets)', false, true, false, false, false],
      ['Sortable with < and sorted()', false, false, true, false, false],
      ['Positional constructor arguments', true, true, true, true, false],
      ['New attributes can be added later', true, false, true, false, true],
      ['Memory per instance', { dots: 2 }, { dots: 2 }, { dots: 2 }, { dots: 4 }, { dots: 2 }],
      ['Extra generated methods', '__init__ __repr__ __eq__', '__setattr__ __delattr__ __hash__', '__lt__ __le__ __gt__ __ge__', '__slots__ (no __dict__)', 'none: signature changes'],
    ], note: 'Flags combine: <code>frozen=True, slots=True</code> is the usual value-object setup. Memory dots are a judgement; slots typically saves a third or more per instance.', verdict: 'Start with the bare decorator. Add <code>frozen=True</code> when instances are keys or shared, <code>slots=True</code> when you create millions, <code>kw_only=True</code> when the class has more than three fields or will grow.' },
    { title: 'dataclass against the alternatives', columns: ['@dataclass', 'typing.NamedTuple', 'TypedDict', 'attrs', 'pydantic'], rows: [
      ['In the standard library', true, true, true, false, false],
      ['Validation at construction', { part: '__post_init__' }, false, false, true, true],
      ['Converters / coercion', false, false, false, true, true],
      ['Immutable option', true, true, false, true, true],
      ['Behaves like a tuple', false, true, false, false, false],
      ['Is a real class (methods, isinstance)', true, true, false, true, true],
      ['JSON schema and parsing', false, false, false, { part: 'cattrs' }, true],
    ], verdict: 'Use <code>@dataclass</code> for internal data with no untrusted input. Reach for attrs when you want validators and converters with the same feel, and pydantic at the boundary where JSON arrives.' },
  ],
  gotchas: [
    { title: 'A mutable default is rejected', bad: `@dataclass
class Cart:
    items: list = []
# ValueError: mutable default <class 'list'> for field items is not allowed`, good: `@dataclass
class Cart:
    items: list = field(default_factory=list)`, why: 'A class-level <code>[]</code> would be one list shared by every instance, the classic Python trap. The check triggers for any unhashable default, so it also catches <code>dict</code>, <code>set</code> and other mutable dataclasses.' },
    { title: 'Non-default field after a default one', bad: `@dataclass
class Base:
    id: int = 0

@dataclass
class Child(Base):
    name: str
# TypeError: non-default argument 'name' follows default argument`, good: `@dataclass(kw_only=True)
class Child(Base):
    name: str          # keyword-only fields may follow defaults
# or: name: str = field(kw_only=True)`, why: 'Fields map to positional parameters in declaration order, base class first, and Python forbids a required positional parameter after an optional one. Keyword-only fields sit after the positional ones, so the rule does not apply to them.' },
    { title: 'eq=True makes instances unhashable', bad: `@dataclass
class Tag:
    name: str

seen = {Tag("a")}
# TypeError: unhashable type: 'Tag'`, good: `@dataclass(frozen=True)
class Tag:
    name: str

seen = {Tag("a"), Tag("a")}   # len 1`, why: 'Equal objects must have equal hashes, and a mutable object\'s fields can change after it is put in a set. So the decorator sets <code>__hash__ = None</code> unless the class is frozen (or you pass <code>unsafe_hash=True</code> and accept the risk).' },
    { title: 'Frozen __post_init__ cannot assign normally', bad: `@dataclass(frozen=True)
class Rect:
    w: float
    h: float
    area: float = field(init=False)
    def __post_init__(self):
        self.area = self.w * self.h   # FrozenInstanceError`, good: `    def __post_init__(self):
        object.__setattr__(self, "area", self.w * self.h)`, why: 'frozen replaces <code>__setattr__</code> on the class, and <code>__post_init__</code> runs after that guard is in place. <code>object.__setattr__</code> bypasses the override, exactly as the generated <code>__init__</code> does.' },
  ],
  presets: [
    { title: 'Products as frozen records', code: `import json
from dataclasses import dataclass, replace, asdict

@dataclass(frozen=True, order=True)
class Product:
    price: float          # first field → sort key
    name: str
    category: str
    id: int

with open("/data/products.json") as f:
    products = [Product(**d) for d in json.load(f)]

cheapest = sorted(products)[:3]
on_sale = [replace(p, price=round(p.price * 0.9, 2)) for p in cheapest]
for before, after in zip(cheapest, on_sale):
    print(f"{before.name:<22} {before.price:>7.2f} → {after.price:>7.2f}")
print(asdict(on_sale[0]))` },
  ],
};
