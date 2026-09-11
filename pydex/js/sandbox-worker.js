/* Pyodide worker: loads CPython, mounts mock data at /data, patches requests/httpx
   to serve https://api.pydex.local from that data, and runs code Jupyter-style. */
// The runtime URL can be overridden (self-hosted mirror) via the worker's query string.
const PYODIDE = new URL(self.location.href).searchParams.get('cdn') || 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
importScripts(PYODIDE + 'pyodide.js');

const post = (m) => self.postMessage(m);
let pyodide = null, initPromise = null, currentRun = null;

const PREAMBLE = String.raw`
import sys, os, io, ast, json, base64, traceback, types
os.environ['MPLBACKEND'] = 'AGG'
sys.path.insert(0, '/data')

# ---------- sqlite mock database ----------
def _pydex_build_sqlite():
    import sqlite3, csv
    if os.path.exists('/data/shop.sqlite'):
        return
    con = sqlite3.connect('/data/shop.sqlite')
    con.executescript('''
    CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, price REAL);
    CREATE TABLE orders(order_id INTEGER PRIMARY KEY, date TEXT, region TEXT, rep TEXT,
        product_id INTEGER REFERENCES products(id), quantity INTEGER, unit_price REAL, discount REAL, status TEXT);
    CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, team TEXT, city TEXT, hired TEXT, salary INTEGER, remote TEXT);
    ''')
    with open('/data/products.json') as f:
        con.executemany('INSERT INTO products VALUES (?,?,?,?)', [(p['id'], p['name'], p['category'], p['price']) for p in json.load(f)])
    with open('/data/orders.csv') as f:
        rows = list(csv.DictReader(f))
        con.executemany('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)',
            [(int(r['order_id']), r['date'], r['region'], r['rep'], int(r['product_id']), int(r['quantity']), float(r['unit_price']), float(r['discount']), r['status']) for r in rows])
    with open('/data/employees.csv') as f:
        rows = list(csv.DictReader(f))
        con.executemany('INSERT INTO employees VALUES (?,?,?,?,?,?,?)',
            [(int(r['id']), r['name'], r['team'], r['city'], r['hired'], int(r['salary']), r['remote']) for r in rows])
    con.commit(); con.close()
_pydex_build_sqlite()

# ---------- mock HTTP API (https://api.pydex.local) ----------
def _pydex_load(name):
    with open('/data/' + name) as f:
        if name.endswith('.json'):
            return json.load(f)
        import csv
        return list(csv.DictReader(f))

def _pydex_route(method, url, headers, body):
    from urllib.parse import urlparse, parse_qs
    u = urlparse(url); path = u.path.rstrip('/') or '/'; q = {k: v[0] for k, v in parse_qs(u.query).items()}
    parts = [p for p in path.split('/') if p]
    def js(obj, status=200):
        return status, json.dumps(obj).encode(), 'application/json'
    if not parts:
        return js({'name': 'Pydex mock API', 'endpoints': ['/products', '/products/{id}', '/orders', '/employees', '/echo', '/status/{code}']})
    if parts[0] == 'products':
        items = _pydex_load('products.json')
        if len(parts) == 1:
            if 'category' in q: items = [p for p in items if p['category'] == q['category']]
            if method == 'POST':
                new = json.loads(body or b'{}'); new['id'] = 113
                return js(new, 201)
            return js(items)
        m = [p for p in items if str(p['id']) == parts[1]]
        return js(m[0]) if m else js({'error': 'product not found', 'id': parts[1]}, 404)
    if parts[0] == 'orders':
        rows = _pydex_load('orders.csv')
        for r in rows:
            r['order_id'] = int(r['order_id']); r['product_id'] = int(r['product_id']); r['quantity'] = int(r['quantity'])
            r['unit_price'] = float(r['unit_price']); r['discount'] = float(r['discount'])
        if method == 'POST':
            new = json.loads(body or b'{}'); new['order_id'] = 1241; new['status'] = 'pending'
            return js(new, 201)
        if 'region' in q: rows = [r for r in rows if r['region'] == q['region']]
        if 'status' in q: rows = [r for r in rows if r['status'] == q['status']]
        limit = int(q.get('limit', 20)); page = int(q.get('page', 1))
        start = (page - 1) * limit
        return js({'page': page, 'total': len(rows), 'items': rows[start:start + limit]})
    if parts[0] == 'employees':
        return js(_pydex_load('employees.csv'))
    if parts[0] == 'echo':
        try: parsed = json.loads(body) if body else None
        except Exception: parsed = body.decode('utf-8', 'replace') if body else None
        return js({'method': method, 'path': path, 'query': q, 'headers': {k: v for k, v in headers.items() if k.lower() in ('content-type', 'authorization', 'accept', 'user-agent', 'x-request-id')}, 'json': parsed})
    if parts[0] == 'status' and len(parts) > 1:
        code = int(parts[1])
        return code, json.dumps({'status': code}).encode(), 'application/json'
    if parts[0] == 'slow':
        return js({'ok': True, 'note': 'the mock never actually sleeps'})
    return js({'error': 'not found', 'path': path}, 404)

def _pydex_patch_requests():
    import requests
    from requests.adapters import BaseAdapter
    from requests.models import Response
    from requests.structures import CaseInsensitiveDict
    class MockAdapter(BaseAdapter):
        def send(self, request, **kw):
            r = Response(); r.request = request; r.url = request.url
            body = request.body
            if isinstance(body, str): body = body.encode()
            status, content, ctype = _pydex_route(request.method, request.url, request.headers, body)
            r.status_code = status; r._content = content; r._content_consumed = True; r.encoding = 'utf-8'
            r.headers = CaseInsensitiveDict({'Content-Type': ctype, 'Server': 'pydex-mock', 'X-Request-Id': 'req-4242'})
            r.reason = {200: 'OK', 201: 'Created', 404: 'Not Found', 500: 'Internal Server Error', 429: 'Too Many Requests', 503: 'Service Unavailable'}.get(status, 'OK')
            r.elapsed = __import__('datetime').timedelta(milliseconds=12)
            return r
        def close(self): pass
    class OfflineAdapter(BaseAdapter):
        def send(self, request, **kw):
            raise requests.ConnectionError(f'The sandbox is offline. Use https://api.pydex.local/... (tried {request.url})')
        def close(self): pass
    orig = requests.Session.__init__
    if getattr(requests.Session, '_pydex', False): return
    def __init__(self, *a, **k):
        orig(self, *a, **k)
        self.mount('https://', OfflineAdapter()); self.mount('http://', OfflineAdapter())
        self.mount('https://api.pydex.local', MockAdapter()); self.mount('http://api.pydex.local', MockAdapter())
    requests.Session.__init__ = __init__; requests.Session._pydex = True

def _pydex_patch_httpx():
    import httpx
    if getattr(httpx.Client, '_pydex', False): return
    def handler(request):
        status, content, ctype = _pydex_route(request.method, str(request.url), dict(request.headers), request.content)
        return httpx.Response(status, content=content, headers={'Content-Type': ctype, 'X-Request-Id': 'req-4242'})
    transport = httpx.MockTransport(handler)
    for cls in (httpx.Client, httpx.AsyncClient):
        orig = cls.__init__
        def __init__(self, *a, _orig=orig, **k):
            k.setdefault('transport', transport); _orig(self, *a, **k)
        cls.__init__ = __init__; cls._pydex = True

def _pydex_patch_threadpool():
    # The browser has no threads. Run "sync" endpoints and background tasks inline instead.
    async def _run(func, *args, **kwargs):
        return func(*args, **kwargs)
    async def _run_sync(func, *args, **kwargs):
        return func(*args)
    for modname in ('starlette.concurrency', 'starlette.routing', 'starlette.background', 'fastapi.routing', 'fastapi.concurrency', 'fastapi.dependencies.utils'):
        m = sys.modules.get(modname)
        if m is not None and hasattr(m, 'run_in_threadpool'):
            m.run_in_threadpool = _run
    try:
        import anyio.to_thread
        anyio.to_thread.run_sync = _run_sync
    except Exception:
        pass

def _pydex_patch_redis():
    # No Redis server in the browser: route the redis client to an in-memory fakeredis.
    import redis
    if getattr(redis, '_pydex', False): return
    try:
        import fakeredis
    except Exception:
        return
    redis.Redis = fakeredis.FakeRedis; redis.StrictRedis = fakeredis.FakeStrictRedis
    redis.from_url = lambda url, **k: fakeredis.FakeRedis(**{kk: v for kk, v in k.items() if kk in ('decode_responses',)})
    try:
        import redis.asyncio, fakeredis.aioredis
        redis.asyncio.Redis = fakeredis.aioredis.FakeRedis
        redis.asyncio.from_url = lambda url, **k: fakeredis.aioredis.FakeRedis(**{kk: v for kk, v in k.items() if kk in ('decode_responses',)})
    except Exception:
        pass
    redis._pydex = True

def _pydex_after_load():
    if 'redis' in sys.modules: _pydex_patch_redis()
    if 'requests' in sys.modules: _pydex_patch_requests()
    if 'httpx' in sys.modules: _pydex_patch_httpx()
    if 'fastapi' in sys.modules: _pydex_patch_threadpool()

# ---------- run protocol ----------
class _AsyncioRun(ast.NodeTransformer):
    """Rewrites asyncio.run(x) -> await x, because the browser loop is already running."""
    def visit_Call(self, node):
        self.generic_visit(node)
        f = node.func
        if isinstance(f, ast.Attribute) and f.attr == 'run' and isinstance(f.value, ast.Name) and f.value.id == 'asyncio' and node.args:
            return ast.Await(value=node.args[0])
        return node

_pydex_main = types.ModuleType('__main__')   # a real module, so ROOT_URLCONF=__name__, pickle etc. work
_pydex_ns = _pydex_main.__dict__

def _pydex_display(val):
    if val is None: return None
    try:
        import matplotlib.figure
        if isinstance(val, matplotlib.figure.Figure): return None
    except Exception: pass
    if 'plotly' in sys.modules and hasattr(val, 'to_plotly_json') and hasattr(val, 'to_json'):
        return {'kind': 'plotly', 'json': val.to_json()}
    h = getattr(val, '_repr_html_', None)
    if callable(h):
        try:
            html = h()
            if html: return {'kind': 'html', 'html': html}
        except Exception: pass
    r = repr(val)
    if len(r) > 20000: r = r[:20000] + '\n… (truncated)'
    return {'kind': 'text', 'text': r}

def _pydex_figures():
    if 'matplotlib.pyplot' not in sys.modules: return []
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        fig = plt.figure(n); buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=110, bbox_inches='tight'); out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close('all')
    return out

async def _pydex_run(code, fresh):
    if fresh:
        mod = types.ModuleType('__main__'); ns = mod.__dict__
    else:
        mod = _pydex_main; ns = _pydex_ns
    sys.modules['__main__'] = mod
    result = None; error = None
    try:
        tree = ast.parse(code, '<sandbox>')
        if 'asyncio' in code: tree = ast.fix_missing_locations(_AsyncioRun().visit(tree))
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value); ast.copy_location(last, tree)
        flags = ast.PyCF_ALLOW_TOP_LEVEL_AWAIT
        co = compile(tree, '<sandbox>', 'exec', flags=flags)
        r = eval(co, ns)
        if r is not None and hasattr(r, '__await__'): await r
        if last is not None:
            co2 = compile(last, '<sandbox>', 'eval', flags=flags)
            v = eval(co2, ns)
            if v is not None and hasattr(v, '__await__') and not hasattr(v, '_repr_html_'): v = await v
            result = _pydex_display(v)
    except SystemExit:
        pass
    except BaseException as e:
        tb = e.__traceback__
        # drop the frames that belong to this wrapper
        while tb is not None and tb.tb_frame.f_code.co_filename != '<sandbox>': tb = tb.tb_next
        error = ''.join(traceback.format_exception(type(e), e, tb or e.__traceback__))
    try:
        import pandas as pd  # tidy defaults for the sandbox
    except Exception: pass
    figs = _pydex_figures()
    return json.dumps({'result': result, 'figures': figs, 'error': error})

try:
    import pandas as _pd
    _pd.set_option('display.max_rows', 40); _pd.set_option('display.width', 120)
except Exception: pass
`;

const MOCK_FILES = ['orders.csv', 'employees.csv', 'products.json', 'page.html'];

async function init() {
  post({ type: 'status', stage: 'loading', text: 'Downloading the Python runtime (about 10 MB, cached afterwards)' });
  pyodide = await loadPyodide({ indexURL: PYODIDE });
  await pyodide.loadPackage(['sqlite3', 'ssl'], { messageCallback: () => {} }); // unvendored from the stdlib in Pyodide
  post({ type: 'status', stage: 'loading', text: 'Mounting mock data at /data' });
  try { pyodide.FS.mkdir('/data'); } catch (e) {}
  for (const f of MOCK_FILES) {
    const r = await fetch(new URL('../data/mock/' + f, self.location.href));
    pyodide.FS.writeFile('/data/' + f, new Uint8Array(await r.arrayBuffer()));
  }
  pyodide.setStdout({ batched: (s) => { if (currentRun) post({ type: 'stdout', id: currentRun, text: s + '\n' }); } });
  pyodide.setStderr({ batched: (s) => { if (currentRun) post({ type: 'stderr', id: currentRun, text: s + '\n' }); } });
  await pyodide.runPythonAsync(PREAMBLE);
  post({ type: 'status', stage: 'ready', text: 'Python ready' });
}

self.onmessage = async (ev) => {
  const m = ev.data;
  if (m.type === 'init') { if (!initPromise) initPromise = init(); return; }
  if (m.type === 'run') {
    try {
      if (!initPromise) initPromise = init();
      await initPromise;
      const all = (m.packages || []).filter(Boolean);
      const pk = all.filter(p => !p.startsWith('pip:')), pip = all.filter(p => p.startsWith('pip:')).map(p => p.slice(4));
      if (pk.length) {
        post({ type: 'status', stage: 'loading', id: m.id, text: `Loading ${pk.join(', ')}` });
        await pyodide.loadPackage(pk, { messageCallback: () => {}, errorCallback: (e) => post({ type: 'status', stage: 'loading', id: m.id, text: String(e) }) });
      }
      if (pip.length) {
        post({ type: 'status', stage: 'loading', id: m.id, text: `Installing ${pip.join(', ')} from PyPI (first time only)` });
        await pyodide.loadPackage('micropip', { messageCallback: () => {} });
        await pyodide.runPythonAsync(`import micropip\nawait micropip.install(${JSON.stringify(pip)})`);
      }
      try { await pyodide.loadPackagesFromImports(m.code, { messageCallback: () => {} }); } catch (e) {}
      // import so the patches can see the modules, then patch
      for (const name of ['requests', 'httpx', 'fastapi', 'redis']) if (m.code.includes(name)) { try { await pyodide.runPythonAsync(`import ${name}`); } catch (e) {} }
      await pyodide.runPythonAsync('_pydex_after_load()');
      post({ type: 'status', stage: 'running', id: m.id, text: 'Running' });
      currentRun = m.id;
      const t0 = performance.now();
      const run = pyodide.globals.get('_pydex_run');
      const raw = await run(m.code, !!m.fresh);
      run.destroy?.();
      const ms = Math.round(performance.now() - t0);
      currentRun = null;
      post({ type: 'result', id: m.id, ms, ...JSON.parse(raw) });
    } catch (e) {
      currentRun = null;
      post({ type: 'result', id: m.id, ms: 0, result: null, figures: [], error: String(e?.message || e) });
    }
  }
};
