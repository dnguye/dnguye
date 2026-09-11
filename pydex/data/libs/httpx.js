import { scene } from '../../js/explainer.js';

const poolExplainer = {
  hold: 3200,
  code: ['httpx.get(url)                      # three separate calls', 'with httpx.Client() as c: c.get(url)  # three calls, one client', 'async with httpx.AsyncClient() as c:', '    await asyncio.gather(*[c.get(u) for u in urls])', 'httpx.AsyncClient(http2=True)', 'httpx.Limits(max_connections=10, max_keepalive_connections=5)'],
  build() {
    const s = scene(760, 330);
    const X0 = 170;                                   // where t = 0 sits
    const lane = (id, y, label) => s.text(id, 20, y + 14, label, 'lbl sm bold ink-2', undefined, 'start');
    const bar = (id, x, y, w, label, cls) => s.cell(id, x, y, w, 28, label, cls);
    // time axis
    s.line('axis', X0, 300, 740, 300, 'arrow ghost');
    s.text('ax0', X0, 316, 't = 0', 'lbl sm ink-2');
    s.text('axn', 720, 316, 'time', 'lbl sm ink-2');
    s.text('leg', 20, 316, 'grey = connect + TLS   blue = request/response', 'lbl sm ink-2', undefined, 'start');
    // lane 1: three one-shot calls
    lane('l1', 36, 'httpx.get() x3');
    for (let i = 0; i < 3; i++) {
      bar(`c1${i}`, X0 + i * 160, 36, 60, 'connect', 'cell ghost hid');
      bar(`r1${i}`, X0 + i * 160 + 60, 36, 90, `GET ${i + 1}`, 'cell hid');
    }
    s.text('e1', X0 + 480 + 8, 50, '', 'lbl sm ink-2', undefined, 'start');
    // lane 2: one Client, keep-alive
    lane('l2', 90, 'Client');
    bar('c20', X0, 90, 60, 'connect', 'cell ghost hid');
    for (let i = 0; i < 3; i++) bar(`r2${i}`, X0 + 60 + i * 90, 90, 90, `GET ${i + 1}`, 'cell hid');
    s.text('e2', X0 + 330 + 8, 104, '', 'lbl sm ink-2', undefined, 'start');
    // lane 3: AsyncClient + gather (three connections in parallel)
    lane('l3', 144, 'AsyncClient');
    s.text('l3b', 20, 172, '+ gather', 'lbl sm ink-2', undefined, 'start');
    for (let i = 0; i < 3; i++) {
      bar(`c3${i}`, X0, 144 + i * 30, 60, 'connect', 'cell ghost hid');
      bar(`r3${i}`, X0 + 60, 144 + i * 30, 90, `GET ${i + 1}`, 'cell hid');
    }
    bar('w3', X0 + 150, 204, 80, 'GET 4 waits', 'cell err hid');
    s.text('e3', X0 + 150 + 8, 158, '', 'lbl sm ink-2', undefined, 'start');
    // lane 4: HTTP/2, one connection, multiplexed streams
    lane('l4', 248, 'http2=True');
    bar('c40', X0, 248, 60, 'connect', 'cell ghost hid');
    bar('r40', X0 + 60, 248, 110, 'streams 1, 2, 3', 'cell hid');
    s.text('e4', X0 + 170 + 8, 262, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Three one-shot calls pay the handshake three times', caption: 'httpx.get() builds a Client, opens a TCP connection, does the TLS handshake, sends one request and closes everything. The next call starts from zero, so the three calls run back to back.', lines: [0],
      patch: { c10: { cls: '' }, r10: { cls: '' }, c11: { cls: '' }, r11: { cls: '' }, c12: { cls: '' }, r12: { cls: '' }, e1: { text: 'done at t = 480' } } },
    { title: 'A Client keeps the connection open', caption: 'The Client owns a connection pool. After the first request the socket stays open (keep-alive), and requests two and three skip the connect and TLS steps. Same server, same three requests, one third fewer round trips.', lines: [1],
      patch: { c10: { add: 'dim' }, r10: { add: 'dim' }, c11: { add: 'dim' }, r11: { add: 'dim' }, c12: { add: 'dim' }, r12: { add: 'dim' }, e1: { text: 't = 480' },
        c20: { cls: '' }, r20: { cls: '' }, r21: { cls: '' }, r22: { cls: '' }, 'r20.r': { cls: 'cell hot' }, 'r21.r': { cls: 'cell hot' }, 'r22.r': { cls: 'cell hot' }, e2: { text: 'done at t = 330' } } },
    { title: 'AsyncClient plus gather overlaps the waiting', caption: 'Each coroutine awaits its own socket. While one request waits for the server, the event loop runs the others, and the pool opens as many connections as it needs. Three requests take about as long as one.', lines: [2, 3],
      patch: { c20: { add: 'dim' }, r20: { add: 'dim' }, r21: { add: 'dim' }, r22: { add: 'dim' }, 'r20.r': { cls: 'cell' }, 'r21.r': { cls: 'cell' }, 'r22.r': { cls: 'cell' }, e2: { text: 't = 330' },
        c30: { cls: '' }, c31: { cls: '' }, c32: { cls: '' }, r30: { cls: '' }, r31: { cls: '' }, r32: { cls: '' }, 'r30.r': { cls: 'cell hot' }, 'r31.r': { cls: 'cell hot' }, 'r32.r': { cls: 'cell hot' }, e3: { text: 'done at t = 150' } } },
    { title: 'HTTP/2 multiplexes on a single connection', caption: 'With http2=True (pip install httpx[http2]) one connection carries many streams at once. Concurrent requests to the same host need no extra sockets or handshakes; the server interleaves the responses.', lines: [4],
      patch: { 'r30.r': { cls: 'cell' }, 'r31.r': { cls: 'cell' }, 'r32.r': { cls: 'cell' }, e3: { text: 't = 150' },
        c40: { cls: '' }, r40: { cls: '' }, 'r40.r': { cls: 'cell hot' }, e4: { text: 'done at t = 170, one socket' } } },
    { title: 'Limits cap how far the pool grows', caption: 'httpx.Limits sets max_connections and how many idle ones to keep. When every connection is busy, the next request waits for a free one instead of opening another. A Semaphore in your code does the same job one level up.', lines: [5],
      patch: { 'r40.r': { cls: 'cell' }, c40: { add: 'dim' }, r40: { add: 'dim' }, e4: { text: 't = 170' },
        c30: { rm: 'dim' }, c31: { rm: 'dim' }, c32: { rm: 'dim' }, w3: { cls: '' }, e3: { text: 'max_connections=3: the fourth request queues' } } },
  ],
};

export default {
  id: 'httpx', name: 'httpx', glyph: 'hx', group: 'http', version: '0.28', keywords: 'http client async get post json client asyncclient http2 timeout transport testing',
  tagline: 'HTTP client with the requests API, plus async, HTTP/2 and pluggable transports.',
  install: 'pip install httpx', docs: 'https://www.python-httpx.org/', packages: ['httpx'],
  overview: {
    what: 'httpx is a requests-compatible HTTP client that also has an AsyncClient, HTTP/2 support and a transport layer you can swap out. The same call shape works synchronously and asynchronously, a Client pools connections, and ASGITransport/WSGITransport let you call a web app in-process without starting a server. It is the client FastAPI and Starlette test suites are built on.',
    yes: ['You need async HTTP inside asyncio code, or a mix of sync and async in one codebase.', 'You want strict, explicit behaviour: timeouts on by default, redirects opt-in.', 'Testing an ASGI or WSGI app without a server, or mocking HTTP in unit tests.', 'HTTP/2 to a server that supports it.'],
    no: ['A tiny script where requests is already installed and good enough.', 'Very high-throughput async crawling where aiohttp\'s raw speed matters more than API ergonomics.', 'Zero dependencies (urllib.request).'],
    note: 'In the sandbox, <code>https://api.pydex.local</code> is a mock server backed by the sample data, wired in through <code>httpx.MockTransport</code>. Sync and async clients both work; any other host fails on purpose.',
  },
  cheatsheet: [
    { id: 'requests', title: 'Requests and responses', blurb: 'The requests API you know, with a few stricter defaults.', snippets: [
      { title: 'GET with query parameters', code: `import httpx

r = httpx.get("https://api.pydex.local/orders",
              params={"region": "North", "limit": 3}, timeout=5.0)
print(r.status_code, r.url)                 # the URL includes the encoded query
print(r.headers["content-type"])
data = r.json()
print(data["total"], "orders in North; first:")
data["items"][0]`, note: 'Module-level <code>httpx.get()</code> creates a throwaway <code>Client</code> per call. Fine for one request; use a <code>Client</code> for more than one.' },
      { title: 'POST: json=, data=, content=', code: `import httpx
url = "https://api.pydex.local/echo"

as_json = httpx.post(url, json={"name": "Kettle", "qty": 2})
print(as_json.json()["headers"]["content-type"])     # application/json

as_form = httpx.post(url, data={"name": "Kettle", "qty": 2})
print(as_form.json()["headers"]["content-type"])     # x-www-form-urlencoded

raw = httpx.post(url, content=b'<order qty="2"/>', headers={"Content-Type": "application/xml"})
print(raw.json()["json"])                            # the raw body echoed back`, note: '<code>data=</code> is for form fields only. Raw bytes or text go in <code>content=</code>; passing them to <code>data=</code> raises in 0.28.' },
      { title: 'What a Response carries', code: `import httpx

r = httpx.get("https://api.pydex.local/products/101")
print(r.status_code, r.reason_phrase, r.is_success, r.http_version)
print(r.text[:48])                # str, decoded using the charset (utf-8 fallback)
print(r.content[:16])             # bytes
print(r.request.method, r.request.url)
print(r.encoding, dict(r.headers))
missing = httpx.get("https://api.pydex.local/products/999")
print(missing.status_code, missing.is_error, missing.json())`, note: '<code>is_success</code>, <code>is_redirect</code>, <code>is_client_error</code>, <code>is_server_error</code> classify the status; <code>is_error</code> covers 4xx and 5xx.' },
    ] },
    { id: 'client', title: 'Client: pooling and defaults', blurb: 'One Client per program or per worker. It keeps connections open and merges defaults into every request.', snippets: [
      { title: 'base_url, default headers, merged params', code: `import httpx

with httpx.Client(base_url="https://api.pydex.local",
                  headers={"User-Agent": "pydex/1.0", "Accept": "application/json"},
                  params={"limit": 2}, timeout=5.0) as client:
    for region in ["North", "South", "East"]:
        r = client.get("/orders", params={"region": region})   # per-call params merge with the defaults
        body = r.json()
        print(region, body["total"], [o["order_id"] for o in body["items"]])
    echo = client.get("/echo", headers={"X-Request-Id": "abc-123"})
    print(echo.json()["headers"])`, note: 'Per-call <code>headers=</code> and <code>params=</code> are merged on top of the client\'s. Relative paths resolve against <code>base_url</code>.' },
      { title: 'Walk a paginated endpoint', code: `import httpx

def iter_orders(client, **filters):
    page = 1
    while True:
        r = client.get("/orders", params={**filters, "page": page, "limit": 50})
        body = r.raise_for_status().json()       # raise_for_status() returns the response
        yield from body["items"]
        if page * 50 >= body["total"]:
            return
        page += 1

with httpx.Client(base_url="https://api.pydex.local") as client:
    rows = list(iter_orders(client, status="returned"))
print(len(rows), "returned orders; first id", rows[0]["order_id"])` },
      { title: 'Timeouts, limits, redirects', code: `import httpx

timeout = httpx.Timeout(10.0, connect=3.0)      # 10 s read/write/pool, 3 s to connect
limits = httpx.Limits(max_connections=20, max_keepalive_connections=5)

with httpx.Client(timeout=timeout, limits=limits, follow_redirects=True) as client:
    r = client.get("https://api.pydex.local/products", params={"category": "office"})
    print(r.status_code, len(r.json()), "office products")
    print(client.timeout)
# no timeout at all (rarely what you want):  httpx.Client(timeout=None)
# transport-level retries on connect errors: httpx.HTTPTransport(retries=3)`, note: 'The default is 5 seconds for every phase. Redirects are <em>not</em> followed unless you ask; a 301 comes back as a plain response.' },
    ] },
    { id: 'async', title: 'Async', blurb: 'AsyncClient has the same methods, awaited. Use it inside asyncio code and share one instance.', snippets: [
      { title: 'AsyncClient with gather', code: `import asyncio, httpx

async def main():
    async with httpx.AsyncClient(base_url="https://api.pydex.local", timeout=5.0) as client:
        ids = [101, 102, 103, 999]
        responses = await asyncio.gather(*(client.get(f"/products/{i}") for i in ids))
        for r in responses:
            body = r.json()
            print(r.status_code, body.get("name") or body.get("error"))

asyncio.run(main())`, note: 'Requests in a <code>gather</code> overlap: while one waits on the network, the others run. The pool opens extra connections up to <code>Limits.max_connections</code>.' },
      { title: 'Bound the concurrency', code: `import asyncio, httpx

async def fetch(client, sem, region):
    async with sem:                                   # at most 2 in flight
        r = await client.get("/orders", params={"region": region, "limit": 1})
        return region, r.json()["total"]

async def main():
    sem = asyncio.Semaphore(2)
    async with httpx.AsyncClient(base_url="https://api.pydex.local") as client:
        results = await asyncio.gather(*(fetch(client, sem, x) for x in ["North", "South", "East", "West"]))
    for region, total in results:
        print(f"{region:<6} {total:>4} orders")

asyncio.run(main())`, note: 'A Semaphore limits how many coroutines are inside the block at once. Prefer it over spawning one task per URL when the list is long.' },
    ] },
    { id: 'errors', title: 'Errors, hooks, auth', snippets: [
      { title: 'The exception family', code: `import httpx

def fetch(url):
    try:
        r = httpx.get(url, timeout=5.0)
        r.raise_for_status()                    # 4xx/5xx -> HTTPStatusError
        return r.json()
    except httpx.HTTPStatusError as e:          # response exists: e.response, e.request
        print("HTTP", e.response.status_code, "for", e.request.url.path)
    except httpx.TimeoutException:              # ConnectTimeout, ReadTimeout, ...
        print("timed out")
    except httpx.RequestError as e:             # ConnectError, ReadError, ... (no response)
        print("transport:", type(e).__name__, str(e)[:50])

fetch("https://api.pydex.local/status/503")
fetch("https://example.com/not-mocked")
print(fetch("https://api.pydex.local/status/200"))`, note: '<code>httpx.HTTPError</code> is the common base. <code>RequestError</code> means no response arrived; <code>HTTPStatusError</code> means one did and you asked to reject it.' },
      { title: 'Event hooks: log every request, reject errors', code: `import httpx

def log_request(request):
    print("->", request.method, request.url.path)

def log_response(response):
    print("<-", response.status_code, response.headers.get("x-request-id"))
    response.raise_for_status()               # every 4xx/5xx becomes an exception

client = httpx.Client(base_url="https://api.pydex.local",
                      event_hooks={"request": [log_request], "response": [log_response]})
print(client.get("/employees").json()[0]["name"])
try:
    client.get("/status/404")
except httpx.HTTPStatusError as e:
    print("caught", e.response.status_code)
client.close()`, note: 'Hooks are lists, so several can run. In a response hook the body is not yet read; call <code>response.read()</code> first if you need it.' },
      { title: 'Custom Auth: add a token, refresh on 401', code: `import httpx

class TokenAuth(httpx.Auth):
    requires_response_body = False
    def __init__(self):
        self.token = "stale-token"
    def auth_flow(self, request):
        request.headers["Authorization"] = f"Bearer {self.token}"
        response = yield request                  # send it; get the response back
        if response.status_code == 401:
            self.token = "fresh-token"            # refresh, then replay once
            request.headers["Authorization"] = f"Bearer {self.token}"
            yield request

with httpx.Client(auth=TokenAuth(), base_url="https://api.pydex.local") as client:
    r = client.get("/status/401")                 # 401 -> refresh -> replayed once
    print(r.status_code, "after replay; token is now", client.auth.token)
    print(client.get("/echo").json()["headers"]["authorization"])
    # built-ins: httpx.BasicAuth("user", "pw"), httpx.DigestAuth(...), or auth=("user", "pw")`, note: 'The generator protocol lets one Auth object handle challenges, refresh tokens or sign requests without knowing whether the client is sync or async.' },
    ] },
    { id: 'stream', title: 'Streaming and files', snippets: [
      { title: 'Stream a large response to disk', code: `import httpx

with httpx.Client() as client:
    with client.stream("GET", "https://api.pydex.local/orders", params={"limit": 200}) as r:
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))   # 0 if the server did not say
        n = 0
        with open("/tmp/orders.json", "wb") as f:
            for chunk in r.iter_bytes(chunk_size=8192):
                f.write(chunk); n += len(chunk)
        print(n, "bytes written; content-length said", total)
# async: async with client.stream(...) as r:  async for chunk in r.aiter_bytes(): ...`, note: 'Inside <code>stream()</code> the body is not loaded until you iterate, so memory stays flat. <code>iter_lines()</code> and <code>iter_text()</code> exist too, <code>r.num_bytes_downloaded</code> tracks progress against a real transport, and <code>r.read()</code> loads the rest.' },
      { title: 'Upload files (multipart)', code: `import httpx, io

csv_bytes = io.BytesIO(b"sku,qty\\n101,2\\n104,1\\n")
files = {"report": ("orders.csv", csv_bytes, "text/csv")}     # (filename, file, content type)
r = httpx.post("https://api.pydex.local/echo", files=files, data={"note": "weekly"})
echoed = r.json()
print(echoed["headers"]["content-type"][:30])                 # multipart/form-data; boundary=
print('filename="orders.csv"' in echoed["json"], "sku,qty" in echoed["json"])
# from disk:  files={"report": open("orders.csv", "rb")}` },
    ] },
    { id: 'testing', title: 'Testing without a network', blurb: 'Transports decide how a request is sent. Swap one in and the client never touches a socket.', snippets: [
      { title: 'MockTransport: fake a server in a unit test', code: `import httpx, json

def handler(request: httpx.Request) -> httpx.Response:
    if request.url.path == "/login" and request.method == "POST":
        body = json.loads(request.content)
        if body.get("password") == "hunter2":
            return httpx.Response(200, json={"token": "abc"})
        return httpx.Response(401, json={"error": "bad credentials"})
    return httpx.Response(404)

client = httpx.Client(transport=httpx.MockTransport(handler), base_url="https://fake.test")
print(client.post("/login", json={"password": "hunter2"}).json())
print(client.post("/login", json={"password": "nope"}).status_code)
print(client.get("/anything").status_code)`, note: 'The handler sees the real <code>Request</code> the client built, headers and encoding included, so what you assert on is what a server would receive.' },
      { title: 'ASGITransport / WSGITransport: call an app in-process', code: `import asyncio, httpx, json

async def app(scope, receive, send):          # any ASGI app: FastAPI, Starlette, Django (asgi)
    assert scope["type"] == "http"
    body = json.dumps({"path": scope["path"], "method": scope["method"]}).encode()
    await send({"type": "http.response.start", "status": 200,
                "headers": [(b"content-type", b"application/json")]})
    await send({"type": "http.response.body", "body": body})

async def main():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/health")
        print(r.status_code, r.json())

asyncio.run(main())
# sync WSGI apps (Flask, Django wsgi): httpx.Client(transport=httpx.WSGITransport(app=app))`, packages: ['httpx'], note: 'No server, no port, no threads: the client calls the app coroutine directly. The <code>app=</code> shortcut on the client was removed in 0.28; pass a transport.' },
    ] },
  ],
  concepts: [
    { id: 'pool', title: 'Connections, pools and the async client', intro: 'Why <code>httpx.get()</code> in a loop is slow, what a <code>Client</code> reuses, how <code>AsyncClient</code> overlaps waiting, and what HTTP/2 changes. Same three requests, four ways.', explainer: poolExplainer },
  ],
  compare: [
    { title: 'Three ways to send a request', columns: ['httpx.get() and friends', 'Client', 'AsyncClient'], rows: [
      ['Connection reuse', false, true, true],
      ['Needs an event loop', false, false, true],
      ['Concurrent requests', false, { part: 'with threads' }, 'gather / TaskGroup'],
      ['Default headers, base_url, auth, hooks', false, true, true],
      ['Works with ASGITransport', false, false, true],
      ['Works with WSGITransport', false, true, false],
      ['Use for', 'one-off calls in scripts', 'services, CLIs, sync code', 'asyncio apps, fan-out I/O'],
    ], verdict: 'Reach for a <code>Client</code> as soon as there is a second request. Use <code>AsyncClient</code> when the surrounding code is already async; there is no speed win from async for a single sequential call.' },
    { title: 'Transports', columns: ['HTTPTransport', 'ASGITransport', 'WSGITransport', 'MockTransport'], rows: [
      ['Sends to', 'the network', 'an ASGI app in-process', 'a WSGI app in-process', 'your handler function'],
      ['Client type', 'sync or async', 'AsyncClient', 'Client', 'sync or async'],
      ['Options', 'retries, http2, verify, proxy', 'raise_app_exceptions, client', 'script_name, remote_addr', 'handler'],
      ['Typical use', 'production', 'testing FastAPI / Starlette', 'testing Flask / Django', 'unit tests, fixtures'],
    ], note: 'Pass <code>transport=</code> to a client, or <code>mounts={"https://api.example.com": transport}</code> to route only some hosts. The sandbox routes <code>api.pydex.local</code> exactly that way.' },
  ],
  gotchas: [
    { title: 'Redirects are not followed by default', bad: `r = httpx.get("https://example.com/old")
r.json()          # r.status_code == 301, body is an HTML stub`, good: `r = httpx.get("https://example.com/old", follow_redirects=True)
# or once, on the client: httpx.Client(follow_redirects=True)`, why: 'requests follows redirects silently; httpx makes it explicit so a POST is never replayed somewhere you did not expect. Check <code>r.is_redirect</code> and <code>r.next_request</code> if you handle them yourself.' },
    { title: 'The default 5 s timeout bites slow downloads', bad: `httpx.get(big_file_url)      # ReadTimeout after 5 s of silence`, good: `httpx.get(big_file_url, timeout=httpx.Timeout(5.0, read=60.0))
# never wait at all: timeout=None (use with care)`, why: 'Every phase (connect, read, write, pool) defaults to 5 seconds. That is a good default for APIs and a bad one for large bodies or slow endpoints; tune the read timeout rather than switching timeouts off.' },
    { title: 'A new AsyncClient per request throws away the pool', bad: `async def fetch(url):
    async with httpx.AsyncClient() as c:   # connect + TLS every call
        return await c.get(url)`, good: `client = httpx.AsyncClient()          # one per app, created inside the loop
async def fetch(url):
    return await client.get(url)
# on shutdown: await client.aclose()`, why: 'The whole point of a client is the connection pool. Create it once (in an app lifespan or a fixture), share it, and close it when the loop shuts down.' },
    { title: 'data= no longer takes raw bytes, app= is gone', bad: `httpx.post(url, data=b"<xml/>")           # TypeError in 0.28
httpx.AsyncClient(app=my_asgi_app)        # TypeError in 0.28`, good: `httpx.post(url, content=b"<xml/>", headers={"Content-Type": "application/xml"})
httpx.AsyncClient(transport=httpx.ASGITransport(app=my_asgi_app))`, why: 'Both were deprecated for several releases and removed in 0.28. <code>data=</code> now means form fields only; <code>proxies=</code> became <code>proxy=</code> (or <code>mounts=</code>) in the same release.' },
  ],
  presets: [
    { title: 'Sync and async against the mock API', code: `import asyncio, httpx

with httpx.Client(base_url="https://api.pydex.local", timeout=5.0) as client:
    for p in client.get("/products", params={"category": "kitchen"}).json():
        print(f"{p['id']}  {p['name']:<22} \${p['price']:>7.2f}")

async def totals():
    async with httpx.AsyncClient(base_url="https://api.pydex.local") as client:
        regions = ["North", "South", "East", "West"]
        rs = await asyncio.gather(*(client.get("/orders", params={"region": r, "limit": 1}) for r in regions))
        return {r: resp.json()["total"] for r, resp in zip(regions, rs)}

asyncio.run(totals())` },
  ],
};
