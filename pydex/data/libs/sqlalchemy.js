import { scene } from '../../js/explainer.js';

const sessionExplainer = {
  hold: 3000,
  code: ['with Session(engine) as s:', '    p = Product(name="Kettle")', '    s.add(p)              # pending', '    s.execute(select(...)) # autoflush → INSERT', '    s.commit()            # COMMIT, objects expire', 'p.name                    # refresh on access'],
  build() {
    const s = scene(760, 320);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 36, label, cls);
    s.rect('sessbox', 20, 40, 400, 200, 'panel', undefined, 8);
    s.text('sesst', 30, 56, 'Session (identity map + unit of work)', 'lbl sm bold ink-2', undefined, 'start');
    box('obj', 40, 80, 150, 'Product(...)', 'cell hid');
    s.text('state', 115, 134, '', 'lbl sm ink-2');
    box('q', 220, 80, 180, 'select(Product)', 'cell hid');
    s.rect('dbbox', 480, 40, 260, 200, 'panel', undefined, 8);
    s.text('dbt', 490, 56, 'database (transaction)', 'lbl sm bold ink-2', undefined, 'start');
    box('ins', 500, 80, 220, 'INSERT INTO products …', 'cell hid');
    box('sel', 500, 128, 220, 'SELECT … FROM products', 'cell hid');
    box('commit', 500, 176, 220, 'COMMIT', 'cell hid');
    s.arrow('a1', 402, 98, 496, 98, 'arrow hid'); s.arrow('a2', 402, 146, 496, 146, 'arrow hid');
    s.text('note', 20, 280, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'A Session is a workspace', caption: 'It holds Python objects and remembers which are new, changed or deleted. It opens a database transaction lazily on first use.', lines: [0] },
    { title: 'add() makes an object pending', caption: 'No SQL yet. The object sits in the session waiting for a flush.', lines: [1, 2],
      patch: { obj: { cls: '' }, 'obj.r': { cls: 'cell hot' }, state: { text: 'pending' } } },
    { title: 'A query triggers autoflush', caption: 'Before running your SELECT the session flushes pending changes, so the query sees the row you just added. The INSERT happens here.', lines: [3],
      patch: { q: { cls: '' }, ins: { cls: '' }, sel: { cls: '' }, a1: { cls: 'arrow hot' }, a2: { cls: 'arrow' }, state: { text: 'persistent (in transaction)' }, note: { text: 'p.id is now populated from the database' } } },
    { title: 'commit() ends the transaction', caption: 'All flushed work becomes durable. By default every loaded object is then expired, so the next attribute access reloads fresh data.', lines: [4],
      patch: { commit: { cls: '' }, 'commit.r': { cls: 'cell ok' }, 'obj.r': { cls: 'cell ghost' }, state: { text: 'expired' }, note: { text: 'expire_on_commit=False keeps attributes loaded after commit' } } },
    { title: 'Touching an expired attribute after close fails', caption: 'Outside the with block the session is closed, so p.name raises DetachedInstanceError. Read what you need before leaving, or turn off expire_on_commit.', lines: [5],
      patch: { 'obj.r': { cls: 'cell err' }, state: { text: 'detached' }, note: { text: 'DetachedInstanceError: instance is not bound to a Session' } } },
  ],
};

const MODELS = `from sqlalchemy import create_engine, select, func, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase):
    pass

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    category: Mapped[str]
    price: Mapped[float]
    orders: Mapped[list["Order"]] = relationship(back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    order_id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[str]
    region: Mapped[str]
    quantity: Mapped[int]
    status: Mapped[str]
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product: Mapped[Product] = relationship(back_populates="orders")

engine = create_engine("sqlite:////data/shop.sqlite")
`;

export default {
  id: 'sqlalchemy', name: 'SQLAlchemy', glyph: 'sa', group: 'store', version: '2.0', keywords: 'orm database sql session engine query postgres sqlite mysql',
  tagline: 'SQL toolkit and ORM: one API for every relational database.',
  install: 'pip install sqlalchemy', docs: 'https://docs.sqlalchemy.org/en/20/', packages: ['sqlalchemy'],
  overview: {
    what: 'SQLAlchemy has two layers. Core builds SQL from Python expressions and runs it on any supported database. The ORM maps classes to tables and tracks objects in a Session so that changes turn into the right INSERT, UPDATE and DELETE statements. The 2.0 style (select(), Mapped[] annotations) is shown here; a lot of older code uses session.query().',
    yes: ['An application with a relational database and more than a few tables.', 'You want the same code on SQLite in tests and PostgreSQL in production.', 'Migrations (with Alembic), connection pooling, transactions done right.'],
    no: ['A one-off script that runs three queries (sqlite3 or psycopg directly).', 'Analytics over big tables (write SQL and load into pandas or polars).', 'A Django project (use its ORM).'],
    note: 'The sandbox mounts <code>shop.sqlite</code> with products, orders and employees at <code>/data</code>. Write examples use an in-memory database so they can be re-run.',
  },
  cheatsheet: [
    { id: 'core', title: 'Engine and Core', snippets: [
      { title: 'Connect and run SQL', code: `from sqlalchemy import create_engine, text

engine = create_engine("sqlite:////data/shop.sqlite", echo=False)
with engine.connect() as conn:
    rows = conn.execute(text("SELECT region, count(*) AS n FROM orders GROUP BY region ORDER BY n DESC"))
    for region, n in rows:
        print(f"{region:<6} {n}")
    one = conn.execute(text("SELECT name, price FROM products WHERE id = :id"), {"id": 101}).one()
    print(one, one.name, one._mapping["price"])`, note: 'Always bind parameters (<code>:id</code>) instead of formatting strings into SQL. <code>echo=True</code> logs every statement.' },
      { title: 'Table objects and the select() builder', code: `from sqlalchemy import create_engine, MetaData, Table, select, func

engine = create_engine("sqlite:////data/shop.sqlite")
meta = MetaData()
orders = Table("orders", meta, autoload_with=engine)     # reflect an existing table
products = Table("products", meta, autoload_with=engine)

stmt = (select(products.c.category, func.sum(orders.c.quantity).label("qty"))
        .join(products, products.c.id == orders.c.product_id)
        .where(orders.c.status == "shipped")
        .group_by(products.c.category)
        .order_by(func.sum(orders.c.quantity).desc()))
print(stmt)
with engine.connect() as conn:
    print(conn.execute(stmt).all())` },
    ] },
    { id: 'orm', title: 'ORM models and queries', snippets: [
      { title: 'Declare models with Mapped[]', code: MODELS + `
with Session(engine) as session:
    kettle = session.get(Product, 101)
    print(kettle.name, kettle.price, len(kettle.orders), "orders")
    cheap = session.scalars(select(Product).where(Product.price < 30).order_by(Product.price)).all()
    print([p.name for p in cheap])`, note: '<code>session.get</code> uses the primary key. <code>scalars()</code> returns objects; <code>execute()</code> returns rows of columns.' },
      { title: 'Filters, joins, aggregates', code: MODELS + `
with Session(engine) as session:
    stmt = (select(Product.category, func.count(Order.order_id).label("n"), func.sum(Order.quantity).label("qty"))
            .join(Order.product)
            .where(Order.status == "shipped", Order.region.in_(["North", "East"]))
            .group_by(Product.category)
            .having(func.count(Order.order_id) > 5)
            .order_by(func.sum(Order.quantity).desc()))
    for cat, n, qty in session.execute(stmt):
        print(f"{cat:<9} orders={n:<3} qty={qty}")
    big = session.scalars(select(Order).where(Order.quantity >= 5).limit(3)).all()
    print([(o.order_id, o.product.name) for o in big])`, note: 'Multiple conditions in <code>where()</code> are ANDed. Use <code>or_()</code>, <code>Order.region == None</code> → <code>Order.region.is_(None)</code>.' },
      { title: 'Eager loading to avoid N+1', code: MODELS + `from sqlalchemy.orm import selectinload

engine = create_engine("sqlite:////data/shop.sqlite", echo=False)
with Session(engine) as session:
    stmt = select(Product).options(selectinload(Product.orders)).where(Product.category == "kitchen")
    for p in session.scalars(stmt):
        print(p.name, "→", sum(o.quantity for o in p.orders), "units")
    # without selectinload, each p.orders access above would run its own SELECT`, note: '<code>selectinload</code> loads all related rows in one extra query. <code>joinedload</code> does it in the same query with a JOIN.' },
    ] },
    { id: 'write', title: 'Insert, update, delete', snippets: [
      { title: 'Create tables and write rows', code: `from sqlalchemy import create_engine, select, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase): pass

class Team(Base):
    __tablename__ = "teams"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    members: Mapped[list["Member"]] = relationship(back_populates="team", cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "members"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    team: Mapped[Team] = relationship(back_populates="members")

engine = create_engine("sqlite://")            # in-memory
Base.metadata.create_all(engine)

with Session(engine) as session:
    eng = Team(name="Engineering", members=[Member(name="Chen"), Member(name="Dara")])
    session.add(eng)
    session.add_all([Team(name="Design", members=[Member(name="Hana")])])
    session.commit()
    print("ids assigned:", eng.id, [m.id for m in eng.members])

    dara = session.scalars(select(Member).where(Member.name == "Dara")).one()
    dara.name = "Dara N."                       # tracked change → UPDATE on commit
    session.delete(session.scalars(select(Team).where(Team.name == "Design")).one())   # cascades to Hana
    session.commit()
    print(session.scalars(select(Member.name)).all())`, note: 'Relationship assignment sets foreign keys for you. <code>cascade="all, delete-orphan"</code> deletes children with the parent.' },
      { title: 'Bulk statements and transactions', code: `from sqlalchemy import create_engine, text, update, delete, insert, select, Table, Column, Integer, String, MetaData
from sqlalchemy.orm import Session

meta = MetaData()
items = Table("items", meta, Column("id", Integer, primary_key=True), Column("name", String), Column("qty", Integer))
engine = create_engine("sqlite://")
meta.create_all(engine)

with engine.begin() as conn:                    # commits at the end, rolls back on error
    conn.execute(insert(items), [{"name": "kettle", "qty": 3}, {"name": "lamp", "qty": 0}, {"name": "mat", "qty": 8}])
    conn.execute(update(items).where(items.c.qty == 0).values(qty=1))
    conn.execute(delete(items).where(items.c.name == "mat"))

try:
    with engine.begin() as conn:
        conn.execute(insert(items), [{"name": "bands", "qty": 2}])
        raise RuntimeError("something failed after the insert")
except RuntimeError as e:
    print("rolled back:", e)
with engine.connect() as conn:
    print(conn.execute(select(items)).all())` },
    ] },
    { id: 'pandas', title: 'With pandas', snippets: [
      { title: 'read_sql from an engine', code: `import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:////data/shop.sqlite")
df = pd.read_sql(text("""
    SELECT o.region, p.category, sum(o.quantity * o.unit_price) AS revenue
    FROM orders o JOIN products p ON p.id = o.product_id
    WHERE o.status = 'shipped'
    GROUP BY o.region, p.category
"""), engine)
df.pivot(index="region", columns="category", values="revenue").round(0)`, packages: ['sqlalchemy', 'pandas'] },
    ] },
  ],
  concepts: [
    { id: 'session', title: 'The Session and the unit of work', intro: 'When SQL actually runs, why <code>id</code> is None until it does, and where DetachedInstanceError comes from.', explainer: sessionExplainer },
  ],
  compare: [
    { title: 'Three ways to talk to the database', columns: ['sqlite3 / psycopg (DB-API)', 'SQLAlchemy Core', 'SQLAlchemy ORM'], rows: [
      ['You write', 'SQL strings', 'Python expressions → SQL', 'classes and attributes'],
      ['Portable across databases', false, true, true],
      ['Composable queries', { dots: 1 }, { dots: 5 }, { dots: 5 }],
      ['Change tracking / relationships', false, false, true],
      ['Overhead per row', { dots: 1 }, { dots: 2 }, { dots: 3 }],
      ['Good for', 'scripts, analytics', 'bulk operations, reporting', 'application logic'],
    ], verdict: 'Use the ORM for the application, drop to Core (or plain SQL via <code>text()</code>) for bulk loads and reports. They share the same engine and can mix in one Session.' },
    { title: 'Relationship loading strategies', columns: ['lazy (default)', 'selectinload', 'joinedload', 'raiseload'], rows: [
      ['Queries for N parents', '1 + N', '2', '1 (with JOIN)', '1, then error'],
      ['Duplicated parent rows', false, false, { part: 'de-duplicated for you' }, false],
      ['Best for', 'one object', 'collections', 'many-to-one', 'catching N+1 in tests'],
    ] },
  ],
  gotchas: [
    { title: 'Forgetting to commit', bad: `with Session(engine) as s:
    s.add(Product(name="x"))
# session closed → rolled back, nothing saved`, good: `with Session(engine) as s:
    s.add(Product(name="x"))
    s.commit()
# or: with Session(engine) as s, s.begin(): ...`, why: 'Closing a Session rolls back its transaction. Nothing is durable until <code>commit()</code>.' },
    { title: 'Using objects after the session closes', bad: `with Session(engine) as s:
    p = s.get(Product, 1)
print(p.orders)   # DetachedInstanceError`, good: `with Session(engine) as s:
    p = s.scalars(select(Product).options(selectinload(Product.orders)).where(Product.id == 1)).one()
    orders = list(p.orders)`, why: 'Lazy attributes need a live session. Load what you need inside, or pass <code>expire_on_commit=False</code> for plain columns.' },
    { title: 'N+1 in a loop', bad: `for p in session.scalars(select(Product)):
    print(p.orders)     # one SELECT per product`, good: `select(Product).options(selectinload(Product.orders))`, why: 'Lazy loading is per object. Eager-load collections you will iterate. <code>echo=True</code> makes the extra queries visible.' },
    { title: 'Comparing to None with ==', bad: `select(Order).where(Order.region == None)   # works but linters complain
select(Order).where(Order.region is None)   # always empty`, good: `select(Order).where(Order.region.is_(None))`, why: '<code>is</code> is a Python identity test the ORM cannot intercept. <code>is_()</code> emits <code>IS NULL</code>.' },
  ],
  presets: [
    { title: 'ORM query on the shop database', code: MODELS + `
with Session(engine) as session:
    stmt = (select(Product.name, func.sum(Order.quantity).label("units"))
            .join(Order.product).where(Order.status == "shipped")
            .group_by(Product.name).order_by(func.sum(Order.quantity).desc()).limit(5))
    for name, units in session.execute(stmt):
        print(f"{name:<22} {units}")` },
  ],
};
