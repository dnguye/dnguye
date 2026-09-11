import { scene } from '../../js/explainer.js';

const validationExplainer = {
  hold: 3000,
  code: ['class Order(BaseModel):', '    qty: int = Field(gt=0)', '    email: EmailStr', 'Order.model_validate(raw)'],
  build() {
    const s = scene(760, 320);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 36, label, cls);
    s.text('t0', 20, 22, 'raw input', 'lbl bold', undefined, 'start');
    box('in1', 20, 40, 170, '"qty": "3"'); box('in2', 20, 84, 170, '"email": "a@b.co"'); box('in3', 20, 128, 170, '"price": "abc"'); box('in4', 20, 172, 170, '"extra": true');
    s.text('t1', 260, 22, '1 · coerce to the annotation', 'lbl sm bold ink-2', undefined, 'start');
    box('c1', 260, 40, 180, 'int("3") → 3', 'cell hid'); box('c2', 260, 84, 180, 'str ✓', 'cell hid'); box('c3', 260, 128, 180, 'float("abc") ✗', 'cell hid'); box('c4', 260, 172, 180, 'ignored (extra=ignore)', 'cell hid');
    s.text('t2', 500, 22, '2 · constraints & validators', 'lbl sm bold ink-2', undefined, 'start');
    box('v1', 500, 40, 160, 'gt=0 ✓', 'cell hid'); box('v2', 500, 84, 160, 'EmailStr ✓', 'cell hid'); box('v3', 500, 128, 160, 'skipped', 'cell hid');
    box('model', 500, 230, 160, 'Order(...)', 'cell ok hid');
    box('err', 260, 230, 200, 'ValidationError', 'cell err hid');
    s.text('errd', 260, 290, '', 'code', undefined, 'start');
    s.arrow('a1', 192, 58, 256, 58, 'arrow hid'); s.arrow('a2', 192, 102, 256, 102, 'arrow hid'); s.arrow('a3', 192, 146, 256, 146, 'arrow hid'); s.arrow('a4', 192, 190, 256, 190, 'arrow hid');
    s.arrow('b1', 442, 58, 496, 58, 'arrow hid'); s.arrow('b2', 442, 102, 496, 102, 'arrow hid');
    s.arrow('m1', 580, 166, 580, 226, 'arrow hid');
    s.arrow('e1', 350, 166, 350, 226, 'arrow hid');
    return s;
  },
  steps: [
    { title: 'Untrusted data arrives', caption: 'A dict from JSON, a form, a CSV row. Strings where you want numbers, keys you never asked for.', lines: [3] },
    { title: 'Each field is coerced to its annotation', caption: 'Lax mode (the default) converts "3" → 3 and "2.5" → 2.5 but refuses "abc" → float. Strict mode refuses any conversion.', lines: [0, 1],
      patch: { c1: { cls: '' }, c2: { cls: '' }, c3: { cls: '' }, c4: { cls: '' }, a1: { cls: 'arrow' }, a2: { cls: 'arrow' }, a3: { cls: 'arrow' }, a4: { cls: 'arrow' }, 'c3.r': { cls: 'cell err' }, 'c4.r': { cls: 'cell ghost' } } },
    { title: 'Constraints and validators run on the coerced values', caption: 'Field(gt=0), min_length, regex patterns, then your @field_validator functions, in declaration order. A field that failed coercion skips this stage.', lines: [1, 2],
      patch: { v1: { cls: '' }, v2: { cls: '' }, v3: { cls: '' }, b1: { cls: 'arrow' }, b2: { cls: 'arrow' }, 'v1.r': { cls: 'cell ok' }, 'v2.r': { cls: 'cell ok' }, 'v3.r': { cls: 'cell ghost' } } },
    { title: 'Errors are collected, not raised one at a time', caption: 'All failing fields are reported together in one ValidationError, each with a loc, a type and a message. That is what your API returns as a 422.', lines: [3],
      patch: { err: { cls: '' }, e1: { cls: 'arrow err' }, errd: { text: "[{'loc': ('price',), 'type': 'float_parsing', ...}]" } } },
    { title: 'Or a fully typed instance comes out', caption: 'With valid input, @model_validator(mode="after") runs last for cross-field rules, and you get an Order whose attributes are exactly the annotated types.', lines: [3],
      patch: { err: { cls: 'hid' }, e1: { cls: 'arrow hid' }, errd: { text: '' }, 'in3.t': { text: '"price": "9.5"' }, 'c3.t': { text: 'float("9.5") → 9.5' }, 'c3.r': { cls: 'cell' }, 'v3.t': { text: 'ge=0 ✓' }, 'v3.r': { cls: 'cell ok' }, model: { cls: '' }, m1: { cls: 'arrow ok' } } },
  ],
};

export default {
  id: 'pydantic', name: 'pydantic', glyph: 'pyd', group: 'correct', version: '2.x', keywords: 'validation model schema json settings types dataclass',
  tagline: 'Type hints that validate: parse untrusted data into real objects.',
  install: 'pip install pydantic', docs: 'https://docs.pydantic.dev/latest/', packages: ['pydantic'],
  overview: {
    what: 'pydantic turns a class with type hints into a validator and serialiser. Feed it a dict or JSON, get an instance with the declared types or a single ValidationError that lists every problem. Version 2 is a rewrite with a Rust core; the API changed (model_dump, model_validate, field_validator), so check which version an example targets.',
    yes: ['API request and response models (FastAPI is built on it).', 'Config files and environment settings (pydantic-settings).', 'Any boundary where data enters your program: files, queues, webhooks.', 'Generating JSON Schema from Python types.'],
    no: ['Plain internal data containers with no validation (dataclasses).', 'Hot loops creating millions of tiny objects (a plain class or NamedTuple).', 'Validation rules that are mostly relational or database-backed.'],
  },
  cheatsheet: [
    { id: 'models', title: 'Models', snippets: [
      { title: 'Declare, validate, coerce', code: `from pydantic import BaseModel
from datetime import date

class Order(BaseModel):
    order_id: int
    region: str
    quantity: int = 1
    placed: date | None = None

o = Order.model_validate({"order_id": "1001", "region": "North", "placed": "2025-11-06"})
print(o)
print(type(o.order_id), type(o.placed))
print(Order(order_id=7, region="East"))`, note: 'Lax mode converts "1001" to 1001 and the ISO string to a date. Missing fields with defaults are filled; missing fields without defaults are errors.' },
      { title: 'ValidationError lists everything', code: `from pydantic import BaseModel, ValidationError

class User(BaseModel):
    name: str
    age: int
    tags: list[str] = []

try:
    User(name=None, age="forty", tags="x")
except ValidationError as e:
    print(e.error_count(), "errors")
    for err in e.errors():
        print(err["loc"], err["type"], "-", err["msg"])
    print(e.json(indent=1)[:200])` },
      { title: 'Field: constraints, aliases, defaults', code: `from pydantic import BaseModel, Field, ValidationError
from uuid import uuid4

class Product(BaseModel):
    id: str = Field(default_factory=lambda: uuid4().hex[:8])
    name: str = Field(min_length=1, max_length=60)
    price: float = Field(gt=0, description="USD")
    category: str = Field(alias="cat", pattern=r"^[a-z]+$")

p = Product.model_validate({"name": "Kettle", "price": 39, "cat": "kitchen"})
print(p)
try:
    Product(name="", price=-1, cat="Kitchen!")
except ValidationError as e:
    print([ (x["loc"][0], x["type"]) for x in e.errors() ])`, note: '<code>default_factory</code> runs per instance, so mutable defaults are safe. <code>alias</code> is the input name; the attribute keeps the Python name.' },
    ] },
    { id: 'nested', title: 'Nested and collections', snippets: [
      { title: 'Models inside models', code: `from pydantic import BaseModel

class Line(BaseModel):
    product_id: int
    qty: int

class Address(BaseModel):
    city: str
    country: str = "NO"

class Order(BaseModel):
    id: int
    ship_to: Address
    lines: list[Line]
    meta: dict[str, str] = {}

raw = {"id": 1, "ship_to": {"city": "Oslo"}, "lines": [{"product_id": 101, "qty": 2}, {"product_id": 107, "qty": "1"}]}
o = Order.model_validate(raw)
print(o.ship_to.country, o.lines[1].qty, sum(l.qty for l in o.lines))
print(o.model_dump())` },
      { title: 'Validate a list or any type with TypeAdapter', code: `from pydantic import TypeAdapter, BaseModel
import json

class Employee(BaseModel):
    id: int
    name: str
    salary: int
    remote: bool

rows = json.loads('[{"id": 1, "name": "Amara", "salary": "72000", "remote": "yes"}, {"id": 2, "name": "Bo", "salary": 68000, "remote": false}]')
people = TypeAdapter(list[Employee]).validate_python(rows)
print(people[0].remote, people[1].salary + 1)
print(TypeAdapter(list[int]).validate_json("[1, 2, 3]"))`, note: '"yes", "on", "1", "true" all coerce to <code>True</code> in lax mode.' },
    ] },
    { id: 'validators', title: 'Custom validators', snippets: [
      { title: 'field_validator and model_validator', code: `from pydantic import BaseModel, field_validator, model_validator, ValidationError

class Booking(BaseModel):
    email: str
    start: int
    end: int

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("must contain @")
        return v                       # always return the value

    @model_validator(mode="after")
    def check_range(self):
        if self.end <= self.start:
            raise ValueError("end must be after start")
        return self

print(Booking(email="  Ann@Example.com ", start=1, end=3).email)
try:
    Booking(email="nope", start=5, end=2)
except ValidationError as e:
    print([x["msg"] for x in e.errors()])`, note: 'Raise <code>ValueError</code> (or <code>AssertionError</code>) inside validators; pydantic wraps it. Field validators run before the model validator.' },
    ] },
    { id: 'serialize', title: 'Serialise and JSON Schema', snippets: [
      { title: 'model_dump and model_dump_json', code: `from pydantic import BaseModel, Field
from datetime import date

class Order(BaseModel):
    id: int
    placed: date
    note: str | None = None
    internal_score: float = Field(default=0.5, exclude=True)

o = Order(id=1, placed=date(2025, 11, 6))
print(o.model_dump())                          # python types (date stays date)
print(o.model_dump(mode="json"))               # json-safe types
print(o.model_dump_json(exclude_none=True))
print(Order.model_validate_json('{"id": 2, "placed": "2025-01-01"}'))`, note: 'v1 names (<code>.dict()</code>, <code>.json()</code>, <code>parse_obj</code>) still exist but warn. Use the <code>model_*</code> family.' },
      { title: 'JSON Schema and strict mode', code: `from pydantic import BaseModel, ConfigDict, ValidationError
import json

class Point(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    x: int
    y: int

print(json.dumps(Point.model_json_schema(), indent=1)[:260])
for raw in ({"x": 1, "y": 2}, {"x": "1", "y": 2}, {"x": 1, "y": 2, "z": 3}):
    try:
        print(Point.model_validate(raw))
    except ValidationError as e:
        print("rejected:", [x["type"] for x in e.errors()])` },
    ] },
    { id: 'settings', title: 'Settings from the environment', snippets: [
      { title: 'pydantic-settings', run: false, code: `# pip install pydantic-settings
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env")
    database_url: str
    debug: bool = False
    workers: int = 4

settings = Settings()        # reads APP_DATABASE_URL, APP_DEBUG, ... and .env
print(settings.model_dump())`, note: 'Not runnable here: the package is separate and the sandbox has no environment to read. Types and defaults work exactly like a model.' },
    ] },
  ],
  concepts: [
    { id: 'validation', title: 'What validation does to a dict', intro: 'Coercion first, constraints second, your validators third, and every failure collected into one error.', explainer: validationExplainer },
  ],
  compare: [
    { title: 'Lax versus strict coercion', columns: ['Input', 'Annotation', 'Lax (default)', 'Strict'], rows: [
      ['"3"', { code: 'int' }, '3', 'error'],
      ['3', { code: 'float' }, '3.0', '3.0'],
      ['"2025-01-01"', { code: 'date' }, 'date(2025,1,1)', 'error'],
      ['"yes"', { code: 'bool' }, 'True', 'error'],
      ['1.5', { code: 'int' }, 'error (fractional)', 'error'],
      ['[1, 2]', { code: 'tuple[int, int]' }, '(1, 2)', 'error'],
    ], note: 'Strict is per field (<code>Field(strict=True)</code>) or per model (<code>ConfigDict(strict=True)</code>). JSON input is a little more lenient in strict mode because JSON has no tuples or dates.' },
    { title: 'Ways to get data out', columns: ['model_dump()', 'model_dump(mode="json")', 'model_dump_json()', 'dict(model)'], rows: [
      ['Returns', 'dict', 'dict', 'str', 'dict'],
      ['Nested models converted', true, true, true, false],
      ['Dates / UUIDs as strings', false, true, true, false],
      ['Honours exclude / alias options', true, true, true, false],
    ] },
  ],
  gotchas: [
    { title: 'Optional does not mean "has a default"', bad: `class M(BaseModel):
    note: str | None      # still required!
M()   # ValidationError: note field required`, good: `class M(BaseModel):
    note: str | None = None`, why: 'The annotation says which values are allowed; the default says whether it may be omitted. Both are needed for "may be missing".' },
    { title: 'A validator that forgets to return', bad: `@field_validator("name")
@classmethod
def strip(cls, v):
    v.strip()        # returns None → name becomes None`, good: `    return v.strip()`, why: 'The return value replaces the field. No return means the field is set to <code>None</code>.' },
    { title: 'Extra keys are silently dropped', bad: `class M(BaseModel):
    id: int
M.model_validate({"id": 1, "idd": 2})   # typo ignored`, good: `class M(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: int`, why: 'The default is <code>extra="ignore"</code>. For inbound API payloads, forbid extras so typos surface as 422s.' },
    { title: 'v1 code on v2', bad: `m.dict(); m.json(); M.parse_obj(d)
@validator("x")`, good: `m.model_dump(); m.model_dump_json(); M.model_validate(d)
@field_validator("x")`, why: 'Most v1 methods exist with deprecation warnings, but validators changed semantics (no <code>each_item</code>, <code>mode="before"/"after"</code>). Run <code>bump-pydantic</code> for large codebases.' },
  ],
  presets: [
    { title: 'Validate the products file', code: `from pydantic import BaseModel, Field, TypeAdapter
import json

class Product(BaseModel):
    id: int
    name: str = Field(min_length=1)
    category: str
    price: float = Field(gt=0)

products = TypeAdapter(list[Product]).validate_json(open("/data/products.json").read())
print(len(products), "valid products")
[p for p in products if p.category == "outdoor"]` },
  ],
};
