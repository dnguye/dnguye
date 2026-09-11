import { scene } from '../../js/explainer.js';

const txExplainer = {
  hold: 3200,
  code: ['con = sqlite3.connect("shop.db")        # legacy mode: isolation_level="DEFERRED"', 'with con:', '    con.execute("INSERT INTO orders ...", params)', '    n = con.execute("SELECT count(*) FROM orders").fetchone()', '# clean exit → commit()   |   exception → rollback()'],
  build() {
    const s = scene(760, 320);
    s.text('h0', 20, 24, 'your code', 'lbl bold', undefined, 'start');
    s.text('h1', 270, 24, 'sqlite3 module', 'lbl bold', undefined, 'start');
    s.text('h2', 510, 24, 'database file', 'lbl bold', undefined, 'start');
    s.cell('c0', 20, 40, 200, 32, 'connect("shop.db")');
    s.cell('c1', 20, 90, 200, 32, 'execute("INSERT …")');
    s.cell('c2', 20, 140, 200, 32, 'execute("SELECT count(*)")');
    s.cell('c3', 20, 190, 200, 32, 'con.commit()');
    s.cell('c4', 20, 240, 200, 32, 'con.rollback()');
    s.cell('m0', 270, 40, 200, 32, 'in_transaction = False', 'cell ghost');
    s.cell('m1', 270, 90, 200, 32, 'BEGIN  (implicit)', 'cell hid');
    s.cell('m2', 270, 190, 200, 32, 'COMMIT', 'cell hid');
    s.cell('m3', 270, 240, 200, 32, 'ROLLBACK', 'cell hid');
    s.arrow('a1', 222, 106, 266, 106, 'arrow hid');
    s.arrow('a3', 222, 206, 266, 206, 'arrow hid');
    s.arrow('a4', 222, 256, 266, 256, 'arrow hid');
    s.rect('dbp', 500, 34, 240, 250, 'panel', undefined, 8);
    s.cell('db', 516, 50, 208, 34, 'main file: 240 rows');
    s.cell('jr', 516, 110, 208, 34, 'journal / WAL: empty', 'cell ghost');
    s.cell('oth', 516, 190, 208, 34, 'other connections see: 240', 'cell ghost');
    s.text('lock', 620, 160, '', 'lbl sm ink-2');
    s.text('oth-l', 620, 250, '', 'lbl sm ink-2');
    s.arrow('w1', 472, 106, 512, 122, 'arrow hid');
    s.arrow('w3', 472, 206, 512, 84, 'arrow hid');
    s.text('foot', 20, 302, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'connect(): nothing is open yet', caption: 'Opening a connection does not start a transaction. In the default (legacy) mode the sqlite3 module waits for the first data-changing statement; SELECTs alone never open one.', lines: [0],
      patch: { 'c0.r': { cls: 'cell hot' }, foot: { text: 'in_transaction is False; reads run in autocommit until something is written' } } },
    { title: 'The first INSERT opens a transaction implicitly', caption: 'Before running an INSERT, UPDATE, DELETE or REPLACE, the module sends BEGIN on your behalf. From here on the connection holds a write lock (or, in WAL mode, appends frames to the -wal file) and in_transaction is True.', lines: [1, 2],
      patch: { 'c0.r': { cls: 'cell' }, 'c1.r': { cls: 'cell hot' }, m1: { cls: '' }, 'm1.r': { cls: 'cell hot' }, a1: { cls: 'arrow hot' }, 'm0.t': { text: 'in_transaction = True' }, 'm0.r': { cls: 'cell info' },
        w1: { cls: 'arrow hot' }, 'jr.r': { cls: 'cell hot' }, 'jr.t': { text: 'journal / WAL: +1 row (uncommitted)' }, lock: { text: 'RESERVED lock held by this connection' }, foot: { text: 'DDL (CREATE TABLE) does not trigger the implicit BEGIN; DML does' } } },
    { title: 'Reads inside see the new row; nobody else does', caption: 'A SELECT on the same connection counts 241: it reads its own uncommitted writes. Any other connection still sees the last committed state. With journal_mode=WAL other readers are never blocked by this writer; in rollback-journal mode they would wait once the commit starts.', lines: [3],
      patch: { 'c1.r': { cls: 'cell' }, 'c2.r': { cls: 'cell hot' }, 'jr.t': { text: 'journal / WAL: +1 row → count = 241' }, 'oth.r': { cls: 'cell' }, 'oth.t': { text: 'other connections see: 240' }, 'oth-l': { text: 'a second connect() reads the old snapshot' }, foot: { text: 'busy_timeout decides how long a blocked connection waits for the lock' } } },
    { title: 'commit() makes it durable', caption: 'Leaving the with-block normally calls commit(), which sends COMMIT. The journal is applied (or the WAL frames are marked committed and checkpointed into the main file later), the lock is released, and every other connection now sees 241 rows.', lines: [4],
      patch: { 'c2.r': { cls: 'cell' }, 'c3.r': { cls: 'cell ok' }, m2: { cls: '' }, 'm2.r': { cls: 'cell ok' }, a3: { cls: 'arrow ok' }, w3: { cls: 'arrow ok' }, 'db.r': { cls: 'cell ok' }, 'db.t': { text: 'main file: 241 rows' }, 'jr.r': { cls: 'cell ghost' }, 'jr.t': { text: 'journal / WAL: applied' }, m1: { cls: 'dim' }, 'm0.t': { text: 'in_transaction = False' }, 'm0.r': { cls: 'cell ghost' }, lock: { text: 'lock released' }, 'oth.r': { cls: 'cell ok' }, 'oth.t': { text: 'other connections see: 241' }, 'oth-l': { text: '' }, foot: { text: 'with con: is not a close; it only commits or rolls back' } } },
    { title: 'If the block raises: rollback()', caption: 'Rewind to before the commit. Had the second statement raised (an IntegrityError, a bug in your code), the context manager would call rollback() and re-raise. The journal is discarded and the file is exactly as it was. Closing a connection with an open transaction discards it the same way.', lines: [4],
      patch: { 'c3.r': { cls: 'cell' }, m2: { cls: 'hid' }, a3: { cls: 'arrow hid' }, w3: { cls: 'arrow hid' }, 'c4.r': { cls: 'cell err' }, m3: { cls: '' }, 'm3.r': { cls: 'cell err' }, a4: { cls: 'arrow err' }, 'db.r': { cls: 'cell' }, 'db.t': { text: 'main file: 240 rows' }, 'jr.r': { cls: 'cell err' }, 'jr.t': { text: 'journal / WAL: discarded' }, 'oth.r': { cls: 'cell ghost' }, 'oth.t': { text: 'other connections see: 240' }, foot: { text: 'the exception still propagates out of the with-block' } } },
    { title: 'autocommit=True: each statement is its own transaction', caption: 'Python 3.12 added connect(autocommit=...). With True, nothing is implicit: every statement commits on its own and you write BEGIN/COMMIT yourself to group work. With False, the module keeps a transaction open at all times and commit()/rollback() immediately start the next one. Both are PEP 249-clean; the legacy mode is the one that surprises people.', lines: [0],
      patch: { 'c4.r': { cls: 'cell' }, m3: { cls: 'hid' }, a4: { cls: 'arrow hid' }, m1: { cls: 'hid' }, a1: { cls: 'arrow hid' }, 'jr.r': { cls: 'cell ghost' }, 'jr.t': { text: 'journal / WAL: written and applied per statement' }, 'c1.r': { cls: 'cell hot' }, 'db.r': { cls: 'cell ok' }, 'db.t': { text: 'main file: 241 rows (immediately)' }, 'oth.t': { text: 'other connections see: 241' }, 'm0.t': { text: 'autocommit = True' }, 'm0.r': { cls: 'cell info' }, lock: { text: 'lock taken and released per statement' }, foot: { text: 'con.execute("BEGIN") … con.execute("COMMIT") groups statements explicitly' } } },
  ],
};

const RO = `con = sqlite3.connect("file:/data/shop.sqlite?mode=ro", uri=True)   # read-only URI
`;

export default {
  id: 'sqlite3', name: 'sqlite3', glyph: 'sq', group: 'db', version: '3.12+', keywords: 'database sql embedded transaction cursor row_factory executemany json window backup',
  tagline: 'A full SQL database in a file, in the standard library.',
  install: 'pip install sqlite3', docs: 'https://docs.python.org/3/library/sqlite3.html', packages: [], runnable: true,
  overview: {
    what: 'sqlite3 is the standard-library driver for SQLite: a transactional SQL engine that lives inside your process and stores everything in one file (or in memory). You get the DB-API you know from every other driver (connect, cursor, execute, fetch), plus SQLite features that matter in practice: window functions, JSON operators, CTEs, upserts, RETURNING, online backup, and Python functions callable from SQL.',
    yes: ['Local state for an app or CLI: config, cache, queue, history.', 'Analysing a few hundred MB of tabular data with real SQL and no server.', 'Tests and prototypes that later move to Postgres (same DB-API shape).', 'Shipping a dataset as a single file people can query.'],
    no: ['Many processes writing concurrently at high rates (one writer at a time).', 'A database shared over the network (use PostgreSQL/MySQL; SQLite on NFS corrupts).', 'You want a Python-side model layer (SQLAlchemy or an ORM on top of sqlite3).', 'Strict column types by default: use STRICT tables or expect type affinity.'],
    note: '<code>/data/shop.sqlite</code> holds <code>products</code>, <code>orders</code> and <code>employees</code> built from the sample files. Snippets open it read-only (<code>?mode=ro</code>) and use <code>":memory:"</code> or a <code>backup()</code> copy when they write.',
  },
  cheatsheet: [
    { id: 'query', title: 'Connect, query, fetch', snippets: [
      { title: 'Open, execute, iterate', code: `import sqlite3

` + RO + `tables = [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type = 'table'")]
print("SQLite", sqlite3.sqlite_version, "| tables:", tables)

cur = con.execute("SELECT id, name, price FROM products ORDER BY price DESC")
print(cur.fetchone())                 # one tuple
for id_, name, price in cur:          # the cursor iterates over the remaining rows
    print(f"{id_}  {name:<24} {price:>7.2f}")
con.close()`, note: '<code>con.execute()</code> is a shortcut that creates a cursor for you. <code>fetchone()</code>, <code>fetchmany(n)</code>, <code>fetchall()</code> and plain iteration all pull from the same cursor.' },
      { title: 'row_factory: sqlite3.Row and dicts', code: `import sqlite3

` + RO + `con.row_factory = sqlite3.Row            # rows act like tuples AND mappings
row = con.execute("SELECT * FROM employees WHERE id = ?", (3,)).fetchone()
print(row["name"], "|", row[1], "|", row.keys())

def dict_factory(cursor, row):           # any callable(cursor, tuple) → object
    return {d[0]: v for d, v in zip(cursor.description, row)}

cur = con.cursor(); cur.row_factory = dict_factory     # per cursor, or on the connection
print(cur.execute("SELECT team, count(*) AS n, avg(salary) AS avg FROM employees GROUP BY team").fetchall())`, note: '<code>sqlite3.Row</code> is the cheap choice: index by name or position, case-insensitive keys, no extra allocation per row. Set it once on the connection.' },
      { title: 'Introspect the schema', code: `import sqlite3

` + RO + `for name, sql in con.execute("SELECT name, sql FROM sqlite_master WHERE type = 'table'"):
    print(" ".join(sql.split())[:96])
print([(c[1], c[2], bool(c[5])) for c in con.execute("PRAGMA table_info(orders)")])   # name, type, is_pk
print(con.execute("PRAGMA foreign_key_list(orders)").fetchall())
print(con.execute("SELECT count(*) FROM orders").fetchone()[0], "orders,",
      con.execute("SELECT min(date), max(date) FROM orders").fetchone())` },
    ] },
    { id: 'params', title: 'Parameters', blurb: 'Values travel separately from the SQL text. Never format them into the string.', snippets: [
      { title: 'qmark, named, and a dynamic IN list', code: `import sqlite3

` + RO + `region, min_qty = "North", 4
rows = con.execute("SELECT order_id, rep, quantity FROM orders WHERE region = ? AND quantity >= ?",
                   (region, min_qty)).fetchall()
print(len(rows), "rows; first:", rows[:2])

n = con.execute("SELECT count(*) FROM orders WHERE status = :status AND date >= :since",
                {"status": "returned", "since": "2025-06-01"}).fetchone()[0]
print(n, "returned since June")

reps = ["Eli", "Farah"]                            # build the placeholders, bind the values
q = f"SELECT rep, count(*) FROM orders WHERE rep IN ({','.join('?' * len(reps))}) GROUP BY rep"
print(con.execute(q, reps).fetchall())`, note: 'SQLite quotes, escapes and types the values for you. A string formatted into SQL breaks on the first apostrophe and is an injection hole.' },
      { title: 'executemany, RETURNING, rowcount', code: `import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE tags(id INTEGER PRIMARY KEY, name TEXT UNIQUE, weight REAL DEFAULT 1)")
con.executemany("INSERT INTO tags(name, weight) VALUES (?, ?)", [("red", 1.5), ("green", 2), ("blue", .5)])

cur = con.execute("INSERT INTO tags(name) VALUES (?) RETURNING id, weight", ("gold",))
print("inserted:", cur.fetchone(), "| lastrowid:", cur.lastrowid)
cur = con.execute("UPDATE tags SET weight = weight * 2 WHERE weight < ?", (2,))
print("updated:", cur.rowcount, "| total_changes:", con.total_changes)
con.execute("INSERT INTO tags(name, weight) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET weight = excluded.weight",
            ("red", 9))                              # upsert
print(con.execute("SELECT * FROM tags ORDER BY id").fetchall())`, note: '<code>executemany</code> runs one prepared statement over a sequence of parameter tuples inside the same transaction, which is the fast way to bulk-insert. <code>rowcount</code> is -1 for SELECTs.' },
    ] },
    { id: 'tx', title: 'Transactions', snippets: [
      { title: 'with con: commits on success, rolls back on error', code: `import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE acct(name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0))")
con.executemany("INSERT INTO acct VALUES (?, ?)", [("ann", 100), ("bo", 20)])
con.commit()

def transfer(src, dst, amount):
    with con:                                   # commit on clean exit, rollback on exception
        con.execute("UPDATE acct SET balance = balance - ? WHERE name = ?", (amount, src))
        cur = con.execute("UPDATE acct SET balance = balance + ? WHERE name = ?", (amount, dst))
        if cur.rowcount == 0:
            raise LookupError(f"no account {dst!r}")   # the debit above is undone too

transfer("ann", "bo", 30)
try:
    transfer("ann", "zed", 50)
except LookupError as e:
    print("rolled back:", e)
print(con.execute("SELECT * FROM acct").fetchall(), "| in_transaction:", con.in_transaction)`, note: 'The context manager does not close the connection. Wrap it in <code>contextlib.closing(...)</code> or call <code>con.close()</code> yourself.' },
      { title: 'autocommit modes and explicit BEGIN', code: `import sqlite3

# Python 3.12+: autocommit=True → each statement commits itself; False → a transaction is always open
con = sqlite3.connect(":memory:", autocommit=True)
con.execute("CREATE TABLE log(msg TEXT)")
con.execute("INSERT INTO log VALUES ('a')")          # durable immediately
print("autocommit, in_transaction:", con.in_transaction)

con.execute("BEGIN")                                 # group statements by hand
con.execute("INSERT INTO log VALUES ('b')"); con.execute("INSERT INTO log VALUES ('c')")
print("after BEGIN, in_transaction:", con.in_transaction)
con.execute("ROLLBACK")
print(con.execute("SELECT count(*) FROM log").fetchone()[0], "row survives")

legacy = sqlite3.connect(":memory:")                 # default: isolation_level="DEFERRED"
legacy.execute("CREATE TABLE t(x)")
print("legacy after DDL:", legacy.in_transaction, end=" | ")
legacy.execute("INSERT INTO t VALUES (1)")
print("after INSERT:", legacy.in_transaction)       # BEGIN was issued for you`, note: 'The legacy mode issues BEGIN before the first INSERT/UPDATE/DELETE and never before DDL or SELECT, and <code>executescript()</code> commits first. New code should pick <code>autocommit=False</code> (always in a transaction) or <code>True</code> (never implicitly).' },
    ] },
    { id: 'analytics', title: 'Aggregates, joins, windows', snippets: [
      { title: 'JOIN, GROUP BY, HAVING', code: `import sqlite3

` + RO + `sql = """
SELECT p.category,
       count(*)                                                AS orders,
       round(sum(o.quantity * o.unit_price * (1 - o.discount)), 2) AS revenue,
       round(avg(o.quantity), 2)                               AS avg_qty
FROM orders o JOIN products p ON p.id = o.product_id
WHERE o.status = 'shipped'
GROUP BY p.category
HAVING orders > 5
ORDER BY revenue DESC"""
for row in con.execute(sql):
    print(row)` },
      { title: 'Window functions and a CTE', code: `import sqlite3

` + RO + `sql = """
WITH rev AS (
  SELECT region, rep, sum(quantity * unit_price) AS revenue
  FROM orders GROUP BY region, rep)
SELECT region, rep, round(revenue) AS revenue,
       rank() OVER (PARTITION BY region ORDER BY revenue DESC)                 AS rnk,
       round(100.0 * revenue / sum(revenue) OVER (PARTITION BY region), 1)    AS pct_of_region
FROM rev ORDER BY region, rnk"""
for row in con.execute(sql).fetchmany(6):
    print(row)

running = """
SELECT substr(date, 1, 7) AS month, round(sum(quantity * unit_price)) AS rev,
       round(sum(sum(quantity * unit_price)) OVER (ORDER BY substr(date, 1, 7))) AS running_total
FROM orders GROUP BY month LIMIT 4"""
print(con.execute(running).fetchall())`, note: 'Windows (<code>OVER</code>), CTEs (<code>WITH</code>), <code>FILTER</code>, <code>RETURNING</code> and upserts are all available; SQLite has tracked the standard closely since 3.25.' },
      { title: 'Dates and strings in SQL', code: `import sqlite3

` + RO + `sql = """
SELECT name, hired,
       strftime('%Y', hired)                                              AS year,
       cast((julianday('2026-01-01') - julianday(hired)) / 365.25 AS int) AS years_in,
       upper(substr(team, 1, 3)) || '-' || printf('%03d', id)             AS code
FROM employees ORDER BY hired LIMIT 5"""
for row in con.execute(sql):
    print(row)
print(con.execute("SELECT date('now'), datetime('2025-03-31', '+1 month'), unixepoch('2025-01-01')").fetchone())`, note: 'SQLite has no DATE type; ISO-8601 text sorts and compares correctly and the date functions parse it. Store UTC and convert at the edges.' },
    ] },
    { id: 'json', title: 'JSON and Python functions in SQL', snippets: [
      { title: 'JSON columns: ->, ->>, json_each', code: `import sqlite3, json

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE events(id INTEGER PRIMARY KEY, payload TEXT)")
events = [{"user": "ann", "tags": ["vip", "eu"], "cart": {"total": 120.5}},
          {"user": "bo",  "tags": ["eu"],        "cart": {"total": 40}},
          {"user": "cy",  "tags": [],            "cart": {"total": 99}}]
con.executemany("INSERT INTO events(payload) VALUES (?)", [(json.dumps(e),) for e in events])

print(con.execute("SELECT payload ->> '$.user', payload -> '$.cart' FROM events").fetchall())
print(con.execute("SELECT json_extract(payload, '$.cart.total') AS t FROM events WHERE t > 50").fetchall())
print(con.execute("SELECT e.id, j.value FROM events e, json_each(e.payload, '$.tags') j").fetchall())
print(con.execute("SELECT json_group_array(payload ->> '$.user') FROM events").fetchone()[0])
print(con.execute("SELECT json_set(payload, '$.cart.total', 0) FROM events WHERE id = 1").fetchone()[0])`, note: '<code>-&gt;&gt;</code> returns a SQL value (text/number), <code>-&gt;</code> returns JSON text. An expression index such as <code>CREATE INDEX ON events(payload -&gt;&gt; \'$.user\')</code> makes lookups fast.' },
      { title: 'create_function and create_aggregate', code: `import sqlite3, re, statistics

` + RO + `con.create_function("regexp", 2, lambda pat, s: re.search(pat, s or "") is not None, deterministic=True)
pat = r"\\d+ ?(cm|L)\\b"                                # X REGEXP Y calls regexp(Y, X)
print(con.execute("SELECT name FROM products WHERE name REGEXP ?", (pat,)).fetchall())

class Median:
    def __init__(self): self.vals = []
    def step(self, v): self.vals.append(v)
    def finalize(self): return statistics.median(self.vals)

con.create_aggregate("median", 1, Median)
for row in con.execute("SELECT region, median(quantity), round(avg(quantity), 2) FROM orders GROUP BY region"):
    print(row)`, note: 'Python functions run per row inside the engine, so they are slower than built-ins but let you use any library. <code>deterministic=True</code> lets SQLite use the function in indexes and constant-fold it.' },
      { title: 'Adapters and converters for dates', code: `import sqlite3, datetime as dt

sqlite3.register_adapter(dt.date, lambda d: d.isoformat())                        # Python → SQL text
sqlite3.register_converter("DATE", lambda b: dt.date.fromisoformat(b.decode()))   # column type DATE → Python

con = sqlite3.connect(":memory:", detect_types=sqlite3.PARSE_DECLTYPES)
con.execute("CREATE TABLE hires(name TEXT, hired DATE)")
con.execute("INSERT INTO hires VALUES (?, ?)", ("Ann", dt.date(2024, 4, 1)))
name, hired = con.execute("SELECT * FROM hires").fetchone()
print(repr(hired), "→ year", hired.year)                     # datetime.date, not str
print(con.execute("SELECT typeof(hired), hired FROM hires").fetchone())`, note: 'The built-in date/datetime adapters and converters are deprecated since 3.12; register your own (and decide about time zones explicitly). Converters key on the declared column type, so <code>detect_types</code> is required.' },
    ] },
    { id: 'files', title: 'Backup, dump, PRAGMAs', snippets: [
      { title: 'backup() into memory, then iterdump()', code: `import sqlite3

src = sqlite3.connect("file:/data/shop.sqlite?mode=ro", uri=True)
mem = sqlite3.connect(":memory:")
src.backup(mem)                                  # consistent online copy, page by page
src.close()

mem.execute("DELETE FROM orders WHERE status = 'returned'")
mem.execute("UPDATE products SET price = round(price * 1.1, 2)")
mem.commit()
print(mem.execute("SELECT count(*) FROM orders").fetchone(), mem.execute("SELECT max(price) FROM products").fetchone())

dump = list(mem.iterdump())                      # SQL that recreates the whole database
print(len(dump), "statements;", dump[1][:80])
with open("/tmp/shop_dump.sql", "w") as f:
    f.write("\\n".join(dump))
mem.backup(sqlite3.connect("/tmp/shop_copy.sqlite"))   # and back to a file`, note: '<code>backup()</code> is the right way to copy a live database; copying the file while another process writes gives a torn copy. <code>iterdump()</code> is the <code>.dump</code> command of the CLI.' },
      { title: 'PRAGMAs: journal mode, foreign keys, busy timeout', code: `import sqlite3, os

path = "/tmp/app.sqlite"
if os.path.exists(path): os.remove(path)
con = sqlite3.connect(path)
print("journal_mode:", con.execute("PRAGMA journal_mode = WAL").fetchone()[0])   # readers never block the writer
con.execute("PRAGMA foreign_keys = ON")          # off by default, per connection
con.execute("PRAGMA busy_timeout = 5000")        # wait up to 5 s for a lock instead of failing
con.executescript("""
CREATE TABLE parent(id INTEGER PRIMARY KEY);
CREATE TABLE child(id INTEGER PRIMARY KEY, parent_id REFERENCES parent(id) ON DELETE CASCADE);
INSERT INTO parent VALUES (1); INSERT INTO child VALUES (10, 1);
""")
try:
    con.execute("INSERT INTO child VALUES (11, 999)")
except sqlite3.IntegrityError as e:
    print("FK enforced:", e)
con.execute("DELETE FROM parent WHERE id = 1")
print("children left after cascade:", con.execute("SELECT count(*) FROM child").fetchone()[0])
con.close()`, note: 'WAL is the setting to turn on for any app with readers and a writer; it persists in the file, so set it once at creation. <code>foreign_keys</code> and <code>busy_timeout</code> must be set on every connection.' },
    ] },
  ],
  concepts: [
    { id: 'tx', title: 'A transaction\'s lifecycle: implicit BEGIN, commit, rollback', intro: 'Most sqlite3 surprises ("my rows vanished", "database is locked") come from not knowing when the module sends BEGIN and what <code>with con:</code> actually does. Follow one insert from <code>connect()</code> to the file on disk.', explainer: txExplainer },
  ],
  compare: [
    { title: 'Transaction control modes', columns: ['autocommit=False (3.12+)', 'autocommit=True (3.12+)', 'legacy default (isolation_level="DEFERRED")', 'legacy isolation_level=None'], rows: [
      ['Who sends BEGIN', 'the module, always one open', 'you, explicitly', 'the module, before the first DML', 'you, explicitly'],
      ['commit() needed to persist', true, { part: 'only after your own BEGIN' }, true, { part: 'only after your own BEGIN' }],
      ['DDL runs inside the transaction', true, false, false, false],
      ['executescript() commits first', false, false, true, false],
      ['with con: commits / rolls back', true, { part: 'no-op unless you began one' }, true, { part: 'no-op unless you began one' }],
      ['Matches PEP 249', true, { part: 'autocommit is allowed' }, { part: 'mostly' }, false],
    ], verdict: 'New code: pass <code>autocommit=False</code> for DB-API semantics or <code>autocommit=True</code> when you want SQLite\'s own behaviour and will write BEGIN yourself. The legacy default exists for compatibility.' },
    { title: 'Row factories', columns: ['tuple (default)', 'sqlite3.Row', 'dict factory', 'namedtuple / dataclass factory'], rows: [
      ['Access by name', false, true, true, true],
      ['Access by position', true, true, false, { part: 'namedtuple only' }],
      ['Cost per row', { dots: 5 }, { dots: 5 }, { dots: 3 }, { dots: 2 }],
      ['JSON-serialisable as is', { part: 'as a list' }, false, true, { part: 'via _asdict' }],
      ['Set up', 'nothing', 'con.row_factory = sqlite3.Row', 'a 2-line function', 'build per query from cursor.description'],
    ], note: 'Cost ratings are relative judgement calls.', verdict: '<code>sqlite3.Row</code> for almost everything; a dict factory when rows go straight to JSON.' },
  ],
  gotchas: [
    { title: 'Formatting values into SQL', bad: `con.execute(f"SELECT * FROM products WHERE name = '{name}'")
# name = "Kettle, 1.7 L" works; name = "O'Brien" is a syntax error;
# name = "x' OR 1=1 --" returns every row`, good: `con.execute("SELECT * FROM products WHERE name = ?", (name,))`, why: 'Placeholders send the value out of band, so quoting and escaping are handled by the engine and the statement structure cannot change. Only identifiers (table and column names) cannot be parameters; validate those against an allow-list.' },
    { title: 'A single string is a sequence of parameters', bad: `con.execute("SELECT * FROM orders WHERE rep = ?", "Eli")
# ProgrammingError: Incorrect number of bindings supplied.
# The current statement uses 1, and there are 3 supplied.`, good: `con.execute("SELECT * FROM orders WHERE rep = ?", ("Eli",))
con.execute("SELECT * FROM orders WHERE rep = ?", ["Eli"])`, why: 'Parameters must be a sequence (or a mapping for named placeholders). A str is a sequence of its characters, so the module tries to bind three of them.' },
    { title: 'with con: does not close the connection', bad: `with sqlite3.connect("app.db") as con:
    con.execute("INSERT ...")
# committed, but the file handle is still open`, good: `from contextlib import closing
with closing(sqlite3.connect("app.db")) as con, con:
    con.execute("INSERT ...")
# commit/rollback from the inner context, close from the outer`, why: 'The connection\'s context manager only manages the transaction. Leaked connections hold locks and file descriptors until garbage collection.' },
    { title: 'Changes vanish without commit()', bad: `con = sqlite3.connect("app.db")
con.execute("INSERT INTO log VALUES ('started')")
con.close()      # the implicit transaction is rolled back; nothing was saved`, good: `con = sqlite3.connect("app.db")
with con:
    con.execute("INSERT INTO log VALUES ('started')")
con.close()`, why: 'In the legacy mode the first INSERT opened a transaction on your behalf, and closing discards an open transaction. Reads on the same connection saw the row, which makes this hard to notice.' },
  ],
  presets: [
    { title: 'Top product per category', code: `import sqlite3

con = sqlite3.connect("file:/data/shop.sqlite?mode=ro", uri=True)
con.row_factory = sqlite3.Row
sql = """
WITH sales AS (
  SELECT p.category, p.name, sum(o.quantity) AS units,
         round(sum(o.quantity * o.unit_price * (1 - o.discount))) AS revenue
  FROM orders o JOIN products p ON p.id = o.product_id
  WHERE o.status = 'shipped' GROUP BY p.id)
SELECT *, rank() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk FROM sales
ORDER BY category, rnk"""
for r in con.execute(sql):
    print(f"{r['category']:<8} #{r['rnk']}  {r['name']:<24} {r['units']:>4} units  {r['revenue']:>8.0f}")` },
  ],
};
