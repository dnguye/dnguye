import { scene } from '../../js/explainer.js';

const wireExplainer = {
  hold: 3200,
  code: ['cur.execute("SELECT * FROM orders WHERE region = %s", (region,))', 'rows = cur.fetchall()          # loaders + row_factory', 'with conn.pipeline():          # several execute() calls,', '    cur.execute(q1); cur.execute(q2)   # one round trip'],
  build() {
    const s = scene(760, 330);
    s.rect('cl', 20, 34, 340, 264, 'panel', undefined, 8);
    s.text('cl-l', 30, 46, 'client: your process + psycopg', 'lbl sm bold ink-2', undefined, 'start');
    s.rect('sv', 420, 34, 320, 264, 'panel', undefined, 8);
    s.text('sv-l', 430, 46, 'PostgreSQL server', 'lbl sm bold ink-2', undefined, 'start');
    s.cell('code', 30, 60, 320, 32, 'execute(sql, (region,))');
    s.cell('ph', 30, 108, 152, 30, '%s  →  $1', 'cell hid');
    s.cell('ad', 198, 108, 152, 30, '"North" → text', 'cell hid');
    s.cell('q2', 30, 152, 152, 28, 'execute(q2)', 'cell hid');
    s.cell('q3', 198, 152, 152, 28, 'execute(q3)', 'cell hid');
    s.cell('ld', 30, 250, 152, 30, 'loaders → Python', 'cell hid');
    s.cell('rf', 198, 250, 152, 30, 'row_factory', 'cell hid');
    s.cell('parse', 430, 60, 300, 30, 'Parse: plan "… WHERE region = $1"', 'cell hid');
    s.cell('bind', 430, 108, 300, 30, 'Bind: $1 = \'North\'', 'cell hid');
    s.cell('exec', 430, 156, 300, 30, 'Execute → DataRow × n', 'cell hid');
    s.cell('sync', 430, 204, 300, 28, 'Sync', 'cell hid');
    s.arrow('w1', 362, 76, 426, 76, 'arrow hid');
    s.arrow('w2', 362, 124, 426, 124, 'arrow hid');
    s.arrow('w3', 426, 265, 362, 265, 'arrow hid');
    s.text('wl1', 392, 66, '', 'lbl sm ink-2');
    s.text('wl2', 392, 114, '', 'lbl sm ink-2');
    s.text('wl3', 392, 254, '', 'lbl sm ink-2');
    s.text('n0', 30, 200, '', 'lbl bold', undefined, 'start');
    s.text('n1', 30, 222, '', 'lbl sm ink-2', undefined, 'start');
    s.text('foot', 20, 316, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'SQL and values stay apart on the client', caption: 'The query string with %s placeholders and the parameters tuple are two separate things. psycopg never builds the final SQL text on the client; that would be string interpolation, and it is exactly what the driver exists to avoid.', lines: [0],
      patch: { 'code.r': { cls: 'cell hot' }, n0: { text: 'two objects' }, n1: { text: 'query: str    params: tuple / dict' }, foot: { text: 'literal % in the query must be written %% when parameters are passed' } } },
    { title: 'Placeholders are rewritten, values adapted', caption: '%s becomes $1, %(name)s becomes a numbered slot too. Each Python value goes through a dumper that picks a PostgreSQL type and a wire format: str → text, int → int2/4/8 or numeric, datetime → timestamptz, dict → jsonb only if you wrap it in Jsonb().', lines: [0],
      patch: { 'code.r': { cls: 'cell' }, ph: { cls: '' }, 'ph.r': { cls: 'cell hot' }, ad: { cls: '' }, 'ad.r': { cls: 'cell hot' }, n0: { text: 'adaptation' }, n1: { text: 'psycopg.adapt: dumpers (out) and loaders (in)' }, foot: { text: 'sql.Identifier("orders") is composed client-side for table/column names, which cannot be $n parameters' } } },
    { title: 'Extended protocol: Parse, Bind, Execute', caption: 'Three messages cross the wire. Parse carries only the statement text, so the server plans it before it has seen any value. Bind attaches the typed values to $1…$n. Execute runs the plan. A value can therefore only ever be data: no quoting rules, no injection.', lines: [0],
      patch: { 'ph.r': { cls: 'cell' }, 'ad.r': { cls: 'cell' }, w1: { cls: 'arrow hot flow' }, w2: { cls: 'arrow hot flow' }, wl1: { text: 'Parse' }, wl2: { text: 'Bind + Execute' }, parse: { cls: '' }, 'parse.r': { cls: 'cell hot' }, bind: { cls: '' }, 'bind.r': { cls: 'cell hot' }, exec: { cls: '' }, 'exec.r': { cls: 'cell hot' }, sync: { cls: '' },
        n0: { text: 'server-side binding' }, n1: { text: 'one statement per execute(); no "; DROP" possible' }, foot: { text: 'psycopg2 interpolated on the client; psycopg 3 sends parameters separately' } } },
    { title: 'Rows come back; loaders make them Python', caption: 'DataRow messages carry each column in text or binary format. A loader per column type converts them (int8 → int, numeric → Decimal, timestamptz → aware datetime, jsonb → dict). Then row_factory decides the shape of each row: tuple, dict, namedtuple, your class.', lines: [1],
      patch: { w1: { cls: 'arrow' }, w2: { cls: 'arrow' }, 'parse.r': { cls: 'cell' }, 'bind.r': { cls: 'cell' }, 'exec.r': { cls: 'cell ok' }, w3: { cls: 'arrow ok flow' }, wl3: { text: 'DataRow …' }, ld: { cls: '' }, 'ld.r': { cls: 'cell ok' }, rf: { cls: '' }, 'rf.r': { cls: 'cell ok' },
        n0: { text: 'cur.fetchall()' }, n1: { text: 'binary=True asks for the binary format (faster)' }, foot: { text: 'a server-side cursor (cursor(name=...)) fetches DataRows in batches of itersize instead of all at once' } } },
    { title: 'Repeated queries get prepared', caption: 'After a statement has run prepare_threshold times (default 5) on a connection, psycopg gives it a name and the server keeps the plan. From then on only Bind and Execute cross the wire. Set prepare=True on execute() to force it, or prepare_threshold=None to disable.', lines: [0],
      patch: { 'exec.r': { cls: 'cell' }, w3: { cls: 'arrow' }, 'ld.r': { cls: 'cell' }, 'rf.r': { cls: 'cell' }, 'parse.t': { text: 'Parse skipped: prepared as _pg3_1' }, 'parse.r': { cls: 'cell ghost' }, 'bind.r': { cls: 'cell hot' }, w2: { cls: 'arrow hot' }, w1: { cls: 'arrow ghost' }, wl1: { text: '' },
        n0: { text: 'prepared statements' }, n1: { text: 'conn.prepare_threshold = 5 (default)' }, foot: { text: 'behind pgbouncer in transaction mode, set prepare_threshold=None' } } },
    { title: 'Pipeline mode: many queries, one round trip', caption: 'Inside with conn.pipeline(): each execute() is sent immediately without waiting for its result; the results are read back in order when you fetch, when the block ends, or at a sync point. On a link with 20 ms latency, ten queries cost 20 ms instead of 200 ms.', lines: [2, 3],
      patch: { 'bind.r': { cls: 'cell' }, w2: { cls: 'arrow' }, 'parse.t': { text: 'Parse / Bind / Execute  ×3, queued' }, 'parse.r': { cls: 'cell hot' }, 'code.r': { cls: 'cell hot' }, q2: { cls: '' }, 'q2.r': { cls: 'cell hot' }, q3: { cls: '' }, 'q3.r': { cls: 'cell hot' }, w1: { cls: 'arrow hot flow' }, wl1: { text: '3 queries, no wait' }, 'sync.r': { cls: 'cell ok' }, w3: { cls: 'arrow ok flow' }, wl3: { text: 'results, in order' },
        n0: { text: 'with conn.pipeline():' }, n1: { text: 'fetch after the block, or call pipeline.sync()' }, foot: { text: 'an error in one query fails the rest of the pipeline batch; COPY and server-side cursors are not allowed inside' } } },
  ],
};

export default {
  id: 'psycopg', name: 'psycopg', glyph: 'pg', group: 'db', version: '3.2', keywords: 'postgresql postgres driver cursor copy pool async pipeline jsonb',
  tagline: 'The PostgreSQL driver: sync and async, server-side binding, COPY.',
  install: 'pip install "psycopg[binary,pool]"', docs: 'https://www.psycopg.org/psycopg3/docs/', packages: [], runnable: false,
  overview: {
    what: 'psycopg 3 is the modern PostgreSQL adapter for Python: a DB-API driver with the same API in sync and async flavours, parameters bound on the server, first-class COPY, connection pooling, pipeline mode and adaptation of Python types to PostgreSQL types (and back) that you can extend. It is the successor to psycopg2 and what SQLAlchemy, Django and most tooling use for PostgreSQL today.',
    yes: ['Any Python service that talks to PostgreSQL directly with SQL.', 'Bulk loading with COPY, or streaming millions of rows out.', 'Async web apps (FastAPI, aiohttp) with AsyncConnection and a pool.', 'Latency-sensitive batches: pipeline mode and prepared statements.'],
    no: ['You want Python objects instead of SQL (SQLAlchemy or an ORM on top of psycopg).', 'An embedded or file database (sqlite3).', 'psycopg2-only extras such as its DictCursor API (psycopg 3 has row factories instead).', 'Extremely old servers: psycopg 3 needs PostgreSQL 10+.'],
    note: 'psycopg needs a PostgreSQL server over a TCP or Unix socket, which the browser sandbox cannot open, so these snippets are copy-only. To run them locally: <code>docker run --rm -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres:17</code>, then <code>pip install "psycopg[binary,pool]"</code> and <code>export PG="postgresql://postgres:pw@localhost/postgres"</code>.',
  },
  cheatsheet: [
    { id: 'connect', title: 'Connect and query', snippets: [
      { title: 'connect, execute, fetch', code: `import os, psycopg

# conninfo: a URL or "host=... dbname=... user=..." string; PG* env vars fill the gaps
with psycopg.connect(os.environ["PG"], connect_timeout=5, application_name="pydex") as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT id, name, price FROM products ORDER BY price DESC")
        print(cur.fetchone())          # one tuple
        for id_, name, price in cur:   # iterate the rest
            print(id_, name, price)
    row = conn.execute("SELECT count(*) FROM orders").fetchone()   # connection.execute shortcut
    print(row[0])
# leaving the with-block commits (or rolls back on exception) and closes`, note: '<code>conn.execute()</code> creates a throwaway cursor. The connection context manager commits on success, rolls back on error and closes; the cursor one just closes.' },
      { title: 'conninfo helpers and connection settings', code: `import psycopg
from psycopg.conninfo import make_conninfo, conninfo_to_dict

dsn = make_conninfo("postgresql://app@db.internal/shop", password="s3cret", sslmode="require")
print(conninfo_to_dict(dsn)["host"])

conn = psycopg.connect(dsn, autocommit=True, prepare_threshold=5, row_factory=psycopg.rows.dict_row)
conn.execute("SET statement_timeout = '30s'")     # per-session settings, plain SQL
print(conn.info.server_version, conn.info.backend_pid, conn.info.transaction_status)
conn.close()`, note: '<code>autocommit=True</code> is required for statements that cannot run in a transaction (<code>CREATE DATABASE</code>, <code>VACUUM</code>, <code>CREATE INDEX CONCURRENTLY</code>).' },
    ] },
    { id: 'params', title: 'Parameters and composed SQL', blurb: 'Values are bound server-side; identifiers are composed client-side with psycopg.sql.', snippets: [
      { title: 'Positional and named placeholders', code: `import os, psycopg, datetime as dt

with psycopg.connect(os.environ["PG"]) as conn:
    cur = conn.execute("SELECT order_id, rep FROM orders WHERE region = %s AND quantity >= %s",
                       ("North", 4))
    print(cur.fetchall()[:3])

    cur = conn.execute("SELECT count(*) FROM orders WHERE status = %(status)s AND date >= %(since)s",
                       {"status": "returned", "since": dt.date(2025, 6, 1)})
    print(cur.fetchone()[0])

    # a list binds as a PostgreSQL array: use = ANY(%s), not IN %s
    cur = conn.execute("SELECT rep, count(*) FROM orders WHERE rep = ANY(%s) GROUP BY rep", (["Eli", "Farah"],))
    print(cur.fetchall())
    # a literal % needs doubling when parameters are present
    print(conn.execute("SELECT name FROM products WHERE name LIKE %s || '%%'", ("Desk",)).fetchall())`, note: 'Placeholders are always <code>%s</code>, whatever the type; psycopg tells the server the type from the Python value. <code>%s</code> can also appear as <code>%b</code> to force binary or <code>%t</code> to force text.' },
      { title: 'Dynamic identifiers with psycopg.sql', code: `import os, psycopg
from psycopg import sql

def top(conn, table: str, column: str, n: int = 5):
    query = sql.SQL("SELECT {cols} FROM {tbl} ORDER BY {col} DESC LIMIT %s").format(
        cols=sql.SQL(", ").join(map(sql.Identifier, ["id", "name", column])),
        tbl=sql.Identifier("public", table),        # schema-qualified, quoted safely
        col=sql.Identifier(column),
    )
    print(query.as_string(conn))                    # see the final text for debugging
    return conn.execute(query, (n,)).fetchall()

with psycopg.connect(os.environ["PG"]) as conn:
    print(top(conn, "products", "price"))
    # sql.Literal(value) inlines a value (rarely needed); sql.Placeholder() emits %s`, note: 'Table and column names cannot be parameters. <code>sql.Identifier</code> quotes them correctly, and the composed object is still executed with normal parameters for the values.' },
      { title: 'executemany and JSON', code: `import os, psycopg
from psycopg.types.json import Jsonb, Json

rows = [("ann", {"tags": ["vip"], "cart": {"total": 120.5}}),
        ("bo",  {"tags": [],      "cart": {"total": 40}})]
with psycopg.connect(os.environ["PG"]) as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS events(id serial PRIMARY KEY, who text, payload jsonb)")
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO events(who, payload) VALUES (%s, %s)",
                        [(who, Jsonb(p)) for who, p in rows], returning=True)
        ids = []
        while True:                       # one result set per parameter tuple
            ids.append(cur.fetchone()[0])
            if not cur.nextset(): break
    print(ids, cur.rowcount)
    print(conn.execute("SELECT who, payload -> 'cart' ->> 'total' FROM events WHERE payload @> %s",
                       (Jsonb({"tags": ["vip"]}),)).fetchall())   # jsonb comes back as a dict`, note: 'A plain dict is not adapted; wrap it in <code>Jsonb</code> (or <code>Json</code> for the json type). <code>executemany</code> uses pipeline mode internally, so it is fast; for very large loads use COPY.' },
    ] },
    { id: 'rows', title: 'Row factories', snippets: [
      { title: 'dict_row, namedtuple_row, class_row, scalar_row', code: `import os, psycopg
from dataclasses import dataclass
from psycopg.rows import dict_row, namedtuple_row, class_row, scalar_row

@dataclass
class Product:
    id: int
    name: str
    price: float

with psycopg.connect(os.environ["PG"], row_factory=dict_row) as conn:     # default for the connection
    print(conn.execute("SELECT id, name FROM products LIMIT 1").fetchone())          # {'id': 101, 'name': ...}

    with conn.cursor(row_factory=namedtuple_row) as cur:                      # override per cursor
        r = cur.execute("SELECT id, name, price FROM products LIMIT 1").fetchone()
        print(r.name, r.price)

    with conn.cursor(row_factory=class_row(Product)) as cur:                  # columns → constructor kwargs
        print(cur.execute("SELECT id, name, price FROM products LIMIT 2").fetchall())

    with conn.cursor(row_factory=scalar_row) as cur:                          # first column only
        print(cur.execute("SELECT name FROM employees ORDER BY hired").fetchall())`, note: '<code>class_row</code> works with any class whose <code>__init__</code> takes the column names as keywords (dataclasses, pydantic models). Write your own factory as a function <code>(cursor) -&gt; (values) -&gt; row</code>.' },
    ] },
    { id: 'copy', title: 'COPY: bulk in and out', snippets: [
      { title: 'COPY FROM STDIN with write_row', code: `import os, csv, psycopg

with psycopg.connect(os.environ["PG"]) as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS staging_orders(order_id int, date date, region text, quantity int, unit_price numeric)")
    with open("orders.csv") as f, conn.cursor() as cur:
        reader = csv.DictReader(f)
        with cur.copy("COPY staging_orders (order_id, date, region, quantity, unit_price) FROM STDIN") as copy:
            for r in reader:                                   # Python values, adapted per column
                copy.write_row((int(r["order_id"]), r["date"], r["region"], int(r["quantity"]), r["unit_price"]))
    print(conn.execute("SELECT count(*) FROM staging_orders").fetchone())

    # or ship the file bytes as-is when the format already matches
    with open("orders.csv", "rb") as f, conn.cursor() as cur:
        with cur.copy("COPY staging_orders FROM STDIN WITH (FORMAT csv, HEADER)") as copy:
            while data := f.read(65536):
                copy.write(data)`, note: 'COPY is an order of magnitude faster than <code>executemany</code> for large loads. <code>write_row</code> handles quoting and NULLs; <code>write</code> sends raw bytes you formatted yourself.' },
      { title: 'COPY TO STDOUT, streaming rows out', code: `import os, psycopg

with psycopg.connect(os.environ["PG"]) as conn, conn.cursor() as cur:
    total = 0
    with cur.copy("COPY (SELECT region, quantity, unit_price FROM orders WHERE status = 'shipped') TO STDOUT") as copy:
        copy.set_types(["text", "int4", "numeric"])           # tell psycopg how to parse each column
        for region, qty, price in copy.rows():                # tuples of Python values, streamed
            total += qty * price
    print(round(total, 2))

    with open("orders.csv", "wb") as f, cur.copy("COPY orders TO STDOUT WITH (FORMAT csv, HEADER)") as copy:
        for chunk in copy:                                     # raw bytes, memory stays flat
            f.write(chunk)`, note: 'COPY TO streams from the server; nothing is buffered client-side beyond one block. It is the tool for exporting big tables to files or to another database.' },
    ] },
    { id: 'tx', title: 'Transactions', snippets: [
      { title: 'transaction() blocks, savepoints, Rollback', code: `import os, psycopg
from psycopg import Rollback

with psycopg.connect(os.environ["PG"]) as conn:        # not autocommit: a transaction is open on first use
    with conn.transaction():                            # commit at the end, rollback on exception
        conn.execute("UPDATE acct SET balance = balance - 30 WHERE name = 'ann'")
        with conn.transaction():                        # nested → SAVEPOINT
            conn.execute("UPDATE acct SET balance = balance + 30 WHERE name = 'bo'")
            raise Rollback                              # undo only the inner block, no exception propagates
        conn.execute("INSERT INTO log(msg) VALUES ('debit kept, credit undone')")
    print(conn.info.transaction_status)                 # IDLE: committed

    try:
        with conn.transaction():
            conn.execute("INSERT INTO acct VALUES ('ann', 0)")     # duplicate key
    except psycopg.errors.UniqueViolation as e:
        print("rolled back:", e.diag.message_primary, e.sqlstate)`, note: 'Outside <code>transaction()</code>, use <code>conn.commit()</code>/<code>conn.rollback()</code> as usual. Errors are typed: <code>psycopg.errors.UniqueViolation</code>, <code>SerializationFailure</code>, all under <code>psycopg.Error</code>, with <code>.sqlstate</code> and <code>.diag</code>.' },
      { title: 'Isolation level and retry on serialization failure', code: `import time, psycopg
from psycopg import IsolationLevel
from psycopg.errors import SerializationFailure

def transfer(conn, src, dst, amount, retries=3):
    conn.isolation_level = IsolationLevel.SERIALIZABLE   # takes effect on the next transaction
    for attempt in range(retries):
        try:
            with conn.transaction():
                bal = conn.execute("SELECT balance FROM acct WHERE name = %s FOR UPDATE", (src,)).fetchone()[0]
                if bal < amount: raise ValueError("insufficient funds")
                conn.execute("UPDATE acct SET balance = balance - %s WHERE name = %s", (amount, src))
                conn.execute("UPDATE acct SET balance = balance + %s WHERE name = %s", (amount, dst))
            return
        except SerializationFailure:
            time.sleep(0.05 * 2 ** attempt)             # another transaction won; try again
    raise RuntimeError("gave up after retries")` },
    ] },
    { id: 'pool', title: 'Connection pool', snippets: [
      { title: 'ConnectionPool', code: `import os, psycopg
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row

pool = ConnectionPool(os.environ["PG"], min_size=2, max_size=10, open=True,
                      kwargs={"row_factory": dict_row, "application_name": "api"},
                      max_idle=300, check=ConnectionPool.check_connection)
pool.wait(timeout=10)                                  # block until min_size connections are ready

def get_product(pid: int):
    with pool.connection(timeout=5) as conn:           # borrow; returned (and rolled back if needed) on exit
        return conn.execute("SELECT * FROM products WHERE id = %s", (pid,)).fetchone()

print(get_product(101))
print(pool.get_stats()["pool_size"], pool.get_stats()["requests_waiting"])
pool.close()                                           # or use: with ConnectionPool(...) as pool:`, note: 'One pool per process, created at startup. <code>check</code> validates a connection before handing it out so a restarted server does not surface as errors in request handlers. <code>NullConnectionPool</code> opens a new connection per request when an external pooler (pgbouncer) is in front.' },
    ] },
    { id: 'async', title: 'Async, server-side cursors, pipeline, notify', snippets: [
      { title: 'AsyncConnection and AsyncConnectionPool', code: `import os, asyncio, psycopg
from psycopg_pool import AsyncConnectionPool

async def main():
    async with AsyncConnectionPool(os.environ["PG"], min_size=1, max_size=5, open=False) as pool:
        await pool.open(); await pool.wait()
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT region, count(*) FROM orders GROUP BY region ORDER BY 2 DESC")
                async for region, n in cur:
                    print(region, n)
            row = await (await conn.execute("SELECT now()")).fetchone()
            print(row)
        # same API with an explicit connection:
        # async with await psycopg.AsyncConnection.connect(dsn) as conn: ...

asyncio.run(main())`, note: 'Every method that touches the network is awaited; the code otherwise mirrors the sync version line for line. In FastAPI, create the pool in the lifespan handler and depend on <code>pool.connection()</code>.' },
      { title: 'Server-side cursor and stream() for big results', code: `import os, psycopg

with psycopg.connect(os.environ["PG"]) as conn:
    # named cursor: DECLARE ... CURSOR on the server, rows fetched in batches of itersize
    with conn.cursor(name="orders_scan", scrollable=False, withhold=False) as cur:
        cur.itersize = 2000
        cur.execute("SELECT order_id, quantity, unit_price FROM orders ORDER BY order_id")
        total = sum(q * p for _, q, p in cur)              # never holds the whole table in memory
    print(total)

    # stream(): single-row mode over a plain cursor, no server cursor needed
    with conn.cursor() as cur:
        for row in cur.stream("SELECT * FROM orders WHERE region = %s", ("East",)):
            pass   # process one row at a time`, note: 'A normal <code>execute()</code> downloads the whole result set before <code>fetchone()</code> returns. Named cursors and <code>stream()</code> pull incrementally; <code>stream()</code> cannot be used inside pipeline mode.' },
      { title: 'Pipeline mode', code: `import os, psycopg

with psycopg.connect(os.environ["PG"]) as conn:
    with conn.pipeline() as p:
        c1 = conn.execute("SELECT count(*) FROM orders WHERE region = %s", ("North",))
        c2 = conn.execute("SELECT count(*) FROM orders WHERE region = %s", ("South",))
        conn.execute("INSERT INTO log(msg) VALUES (%s)", ("two counts requested",))
        p.sync()                                         # flush and read results so far
        print(c1.fetchone()[0], c2.fetchone()[0])       # fetching also syncs implicitly
        for region in ("East", "West"):
            conn.execute("INSERT INTO log(msg) VALUES (%s)", (region,))
    # results of the remaining statements are collected when the block ends`, note: 'Pipeline mode needs libpq 14+. It removes one network round trip per statement, which is the dominant cost for small queries over a real network.' },
      { title: 'LISTEN / NOTIFY', code: `import os, psycopg

with psycopg.connect(os.environ["PG"], autocommit=True) as conn:   # notifications need autocommit
    conn.execute("LISTEN orders_changed")
    gen = conn.notifies(timeout=30, stop_after=3)
    for n in gen:                                     # blocks until a NOTIFY arrives
        print(n.channel, n.payload, n.pid)

# elsewhere, or in a trigger:
#   with psycopg.connect(dsn, autocommit=True) as c:
#       c.execute("NOTIFY orders_changed, %s", ("order 1042",))   # or: SELECT pg_notify('orders_changed', 'x')`, note: '<code>notifies()</code> is a generator that waits on the socket; pass <code>timeout</code> so a quiet channel does not block forever. The async version is <code>async for n in conn.notifies()</code>.' },
    ] },
  ],
  concepts: [
    { id: 'wire', title: 'The client/server round trip: server-side binding and pipeline mode', intro: 'psycopg 3 does not build SQL strings. It sends the statement and the values as separate protocol messages, lets the server bind them, and turns the rows that come back into Python objects. Pipeline mode changes only the timing of those messages.', explainer: wireExplainer },
  ],
  compare: [
    { title: 'Row factories', columns: ['tuple_row (default)', 'dict_row', 'namedtuple_row', 'class_row(C)', 'scalar_row'], rows: [
      ['Each row is', 'tuple', 'dict', 'namedtuple', 'an instance of C', 'the first column'],
      ['Access by name', false, true, true, true, { part: 'n/a' }],
      ['Access by position', true, false, true, false, { part: 'n/a' }],
      ['Per-row cost', { dots: 5 }, { dots: 4 }, { dots: 3 }, { dots: 2 }, { dots: 5 }],
      ['Good for', 'unpacking', 'JSON responses', 'readable code', 'domain models', 'SELECT id FROM …'],
    ], note: 'Cost ratings are relative judgement calls.', verdict: '<code>dict_row</code> as the connection default for services that return JSON; <code>class_row</code> when a dataclass or pydantic model already describes the row.' },
    { title: 'Loading many rows', columns: ['execute() in a loop', 'executemany()', 'COPY FROM STDIN', 'INSERT … SELECT unnest(%s, %s)'], rows: [
      ['Round trips', 'one per row', 'batched (pipeline)', 'one stream', 'one'],
      ['Relative speed', { dots: 1 }, { dots: 3 }, { dots: 5 }, { dots: 4 }],
      ['RETURNING / ON CONFLICT', true, { part: 'RETURNING via returning=True' }, false, true],
      ['Streams from a file', false, false, true, false],
      ['Best for', 'a few rows', 'hundreds to thousands', 'bulk loads', 'upserts of arrays'],
    ], verdict: '<code>executemany</code> until it hurts, then COPY into a staging table and <code>INSERT … SELECT … ON CONFLICT</code> from there.' },
  ],
  gotchas: [
    { title: 'A literal % in a parametrised query', bad: `cur.execute("SELECT * FROM products WHERE name LIKE 'Desk%'", ())
# psycopg.ProgrammingError: incomplete placeholder: '%'`, good: `cur.execute("SELECT * FROM products WHERE name LIKE 'Desk%%'", ())
# better: pass the pattern as a value
cur.execute("SELECT * FROM products WHERE name LIKE %s", ("Desk%",))`, why: 'When a parameters argument is given, the query is parsed for <code>%s</code>/<code>%(name)s</code> placeholders, so a bare <code>%</code> must be doubled. Without any parameters argument the string is sent as-is.' },
    { title: 'A single value must still be a sequence', bad: `cur.execute("SELECT * FROM orders WHERE rep = %s", "Eli")
# TypeError: query parameters should be a sequence or a mapping`, good: `cur.execute("SELECT * FROM orders WHERE rep = %s", ("Eli",))
cur.execute("SELECT * FROM orders WHERE rep = %s", ["Eli"])`, why: 'Parameters are matched positionally to placeholders, so they must arrive as a tuple or list even when there is one of them (a dict for named placeholders).' },
    { title: 'Table names are not parameters', bad: `cur.execute("SELECT * FROM %s WHERE id = %s", ("orders", 5))
# syntax error at or near "'orders'": the name was sent as a string value`, good: `from psycopg import sql
cur.execute(sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier("orders")), (5,))`, why: 'Server-side binding can only carry values. Identifiers must be part of the statement text; <code>sql.Identifier</code> quotes them and protects against injection through a name.' },
    { title: 'Work is lost without commit (or the context manager)', bad: `conn = psycopg.connect(dsn)
conn.execute("INSERT INTO log(msg) VALUES ('started')")
conn.close()     # implicit rollback: nothing was written`, good: `with psycopg.connect(dsn) as conn:
    conn.execute("INSERT INTO log(msg) VALUES ('started')")
# exit → commit; or conn.commit() explicitly; or autocommit=True`, why: 'Like every DB-API driver, psycopg opens a transaction on the first statement and closing discards it. The connection context manager commits for you; a bare <code>connect()</code> does not.' },
  ],
};
