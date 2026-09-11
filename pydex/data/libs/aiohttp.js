import { scene } from '../../js/explainer.js';

const sessionExplainer = {
  hold: 3200,
  code: ['async with aiohttp.ClientSession() as session:', '    tasks = [fetch(session, u) for u in urls]', '    results = await asyncio.gather(*tasks)', '', 'async def fetch(session, url):', '    async with session.get(url) as resp:   # suspends here', '        return await resp.json()             # and here'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 32, label, cls);
    // session + connector
    const sess = s.g('sess', 20, 30, 'hid');
    s.rect('sess.p', 0, 0, 200, 120, 'panel', sess, 8);
    s.text('sess.t', 8, -10, 'ClientSession', 'lbl sm bold ink-2', sess, 'start');
    box('conn', 10, 12, 180, 'TCPConnector (pool)', 'cell', sess);
    box('cj', 10, 52, 85, 'cookies', 'cell ghost', sess);
    box('dns', 105, 52, 85, 'DNS cache', 'cell ghost', sess);
    s.text('sess.n', 100, 106, 'limit=100 connections', 'lbl sm ink-2', sess);
    // tasks
    ['fetch(u1)', 'fetch(u2)', 'fetch(u3)'].forEach((t, i) => box(`t${i}`, 280, 30 + i * 44, 120, t, 'cell hid'));
    s.text('tasks.t', 340, 20, 'Tasks', 'lbl sm bold ink-2');
    for (let i = 0; i < 3; i++) s.arrow(`ta${i}`, 402, 46 + i * 44, 456, 46 + i * 44, 'arrow hid');
    // sockets
    ['socket 1', 'socket 2', 'socket 3'].forEach((t, i) => box(`sk${i}`, 460, 30 + i * 44, 100, t, 'cell ghost hid'));
    s.text('sk.t', 510, 20, 'sockets', 'lbl sm bold ink-2');
    for (let i = 0; i < 3; i++) s.arrow(`sa${i}`, 562, 46 + i * 44, 616, 46 + i * 44, 'arrow hid');
    box('net', 620, 30, 120, 'servers', 'cell ghost hid');
    s.text('st0', 220, 46, '', 'lbl sm ink-2'); s.text('st1', 220, 90, '', 'lbl sm ink-2'); s.text('st2', 220, 134, '', 'lbl sm ink-2');
    // event loop timeline
    s.text('tl', 20, 200, 'event loop, one thread', 'lbl sm bold ink-2', undefined, 'start');
    s.line('tlx', 20, 250, 740, 250, 'arrow ghost');
    const slots = [['s0', 20, 70, 't1', 'cell'], ['s1', 92, 70, 't2', 'cell'], ['s2', 164, 70, 't3', 'cell'], ['s3', 236, 130, 'idle: waiting on sockets', 'cell ghost'], ['s4', 368, 70, 't2', 'cell'], ['s5', 440, 70, 't1', 'cell'], ['s6', 512, 70, 't3', 'cell'], ['s7', 584, 120, 'gather returns', 'cell ok']];
    slots.forEach(([id, x, w, label, cls]) => box(id, x, 212, w, label, cls + ' hid'));
    s.text('tl.n', 20, 275, '', 'lbl sm ink-2', undefined, 'start');
    s.text('tl.m', 20, 300, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'One session, one connection pool', caption: 'ClientSession owns a TCPConnector (the pool of open sockets, capped by limit), a cookie jar and a DNS cache. Creating it is the expensive part; that is why you make one per application, not one per request.', lines: [0],
      patch: { sess: { cls: '' }, 'conn.r': { cls: 'cell hot' } } },
    { title: 'gather schedules three tasks', caption: 'Each fetch(...) call makes a coroutine; gather wraps them in Tasks and hands them to the running event loop. Nothing has run yet: the loop will start them on its next turn, in order.', lines: [1, 2],
      patch: { 'conn.r': { cls: 'cell' }, t0: { cls: '' }, t1: { cls: '' }, t2: { cls: '' } } },
    { title: 'Each task runs until it must wait', caption: 'Task 1 asks the session for a connection, writes the request, and then hits "await": the response has not arrived, so it yields. The loop immediately runs task 2, then task 3. Three requests are in flight after three short slices of work.', lines: [5],
      patch: { 't0.r': { cls: 'cell hot' }, 't1.r': { cls: 'cell hot' }, 't2.r': { cls: 'cell hot' }, ta0: { cls: 'arrow hot' }, ta1: { cls: 'arrow hot' }, ta2: { cls: 'arrow hot' }, sk0: { cls: '' }, sk1: { cls: '' }, sk2: { cls: '' }, sa0: { cls: 'arrow hot flow' }, sa1: { cls: 'arrow hot flow' }, sa2: { cls: 'arrow hot flow' }, net: { cls: '' },
        s0: { cls: '' }, s1: { cls: '' }, s2: { cls: '' }, s3: { cls: '' }, 'tl.n': { text: 'await = "wake me when this socket is readable"; the loop is free meanwhile' } } },
    { title: 'Responses arrive in any order', caption: 'The loop watches all three sockets with the OS selector. Whichever answers first wakes its task: here task 2 resumes, reads headers, then awaits resp.json() to pull the body. The others resume as their bytes land. No thread was blocked at any point.', lines: [6],
      patch: { sa0: { cls: 'arrow' }, sa1: { cls: 'arrow ok flow' }, sa2: { cls: 'arrow' }, 't0.r': { cls: 'cell' }, 't2.r': { cls: 'cell' }, 't1.r': { cls: 'cell ok' }, s4: { cls: '' }, s5: { cls: '' }, s6: { cls: '' }, st1: { text: 'first back' } } },
    { title: 'gather returns in input order; the pool keeps the sockets', caption: 'gather resolves when every task is done and returns results in the order you passed the coroutines, not the order they finished. The sockets go back to the connector as keep-alive connections for the next requests and are closed when the session exits.', lines: [2, 0],
      patch: { sa1: { cls: 'arrow' }, 't0.r': { cls: 'cell ok' }, 't2.r': { cls: 'cell ok' }, s7: { cls: '' }, 'sk0.r': { cls: 'cell ok' }, 'sk1.r': { cls: 'cell ok' }, 'sk2.r': { cls: 'cell ok' }, 'tl.m': { text: 'results == [r1, r2, r3]; a Semaphore or TCPConnector(limit=) bounds how many run at once' } } },
  ],
};

export default {
  id: 'aiohttp', name: 'aiohttp', glyph: 'aio', group: 'http', version: '3.12', keywords: 'async http client server websocket asyncio session aiohttp web',
  tagline: 'Async HTTP client and server on asyncio, with WebSockets on both sides.',
  install: 'pip install aiohttp', docs: 'https://docs.aiohttp.org/', packages: [], runnable: false,
  overview: {
    what: 'aiohttp is an asyncio-native HTTP library with two halves: a client (ClientSession) built for many concurrent requests over pooled connections, and a server (aiohttp.web) with routing, middlewares, streaming and WebSockets. Everything is a coroutine; nothing blocks the event loop. It is what many crawlers, bots and internal async services are built on.',
    yes: ['Fan-out I/O: hundreds of requests in flight from one process.', 'WebSocket clients and servers.', 'A small async HTTP server without a framework on top.', 'Streaming large uploads or downloads chunk by chunk.'],
    no: ['A synchronous script (requests or httpx).', 'You want one client API for sync and async code, or HTTP/2 (httpx).', 'A full web framework with validation and docs (FastAPI) or batteries (Django).'],
    note: 'aiohttp needs real sockets and C extensions (multidict, yarl, aiohappyeyeballs) that the browser runtime cannot provide, so these snippets are copy-only. Run them locally with <code>python script.py</code>; the server examples start on <code>http://127.0.0.1:8080</code>.',
  },
  cheatsheet: [
    { id: 'client', title: 'Client basics', blurb: 'Everything goes through a ClientSession. Responses are context managers; read the body while they are open.', snippets: [
      { title: 'GET with params and JSON', code: `import asyncio, aiohttp

async def main():
    async with aiohttp.ClientSession(base_url="https://api.example.com") as session:
        async with session.get("/orders", params={"region": "North", "limit": 3}) as resp:
            print(resp.status, resp.url, resp.headers["Content-Type"])
            data = await resp.json()          # body must be read inside the block
            print(data["total"])
        # shorthand when you only need the body:
        text = await (await session.get("/health")).text()
        print(text[:40])

asyncio.run(main())`, note: '<code>session.get()</code> returns a context manager, not a response. Leaving the <code>async with</code> releases the connection back to the pool, so read what you need inside it.' },
      { title: 'POST: json=, data=, headers', code: `import asyncio, aiohttp

async def main():
    headers = {"Authorization": "Bearer demo-token", "Accept": "application/json"}
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.post("https://api.example.com/orders", json={"sku": 101, "qty": 2}) as r:
            print(r.status, await r.json())                 # Content-Type: application/json set for you
        async with session.post("https://api.example.com/login", data={"user": "ann", "pw": "x"}) as r:
            print(r.status)                                 # form-urlencoded
        async with session.post("https://api.example.com/raw", data=b"<xml/>",
                                headers={"Content-Type": "application/xml"}) as r:
            print(r.status)                                 # bytes or str go as-is

asyncio.run(main())` },
      { title: 'Status checks and the exception family', code: `import asyncio, aiohttp

async def fetch(session, url):
    try:
        async with session.get(url, raise_for_status=True) as r:   # or on the session, or r.raise_for_status()
            return await r.json()
    except aiohttp.ClientResponseError as e:      # 4xx/5xx: e.status, e.message, e.headers
        print("HTTP", e.status, "for", e.request_info.url)
    except aiohttp.ClientConnectorError as e:     # DNS failure, refused connection
        print("cannot connect:", e.os_error)
    except asyncio.TimeoutError:                  # ClientTimeout exceeded (TimeoutError on 3.11+)
        print("timed out")
    except aiohttp.ClientError as e:              # base class for everything above
        print("other:", type(e).__name__)

async def main():
    async with aiohttp.ClientSession() as session:
        print(await fetch(session, "https://api.example.com/status/503"))

asyncio.run(main())`, note: '<code>raise_for_status</code> is off by default. Turn it on per call, per session (<code>ClientSession(raise_for_status=True)</code>), or call <code>resp.raise_for_status()</code> yourself.' },
    ] },
    { id: 'concurrency', title: 'One session, many requests', snippets: [
      { title: 'Fan out with gather', code: `import asyncio, aiohttp

async def fetch_product(session, pid):
    async with session.get(f"/products/{pid}") as r:
        return pid, r.status, (await r.json()).get("name")

async def main():
    async with aiohttp.ClientSession(base_url="https://api.example.com") as session:
        results = await asyncio.gather(*(fetch_product(session, i) for i in range(101, 111)),
                                       return_exceptions=True)   # one failure does not cancel the rest
    for item in results:
        print(item if not isinstance(item, Exception) else f"failed: {item!r}")

asyncio.run(main())`, note: 'Results come back in the order of the inputs. Without <code>return_exceptions=True</code> the first exception propagates and the other tasks keep running in the background.' },
      { title: 'Bound the concurrency', code: `import asyncio, aiohttp

async def fetch(session, sem, url):
    async with sem:                                  # at most 10 requests in flight
        async with session.get(url) as r:
            return url, r.status, len(await r.read())

async def main(urls):
    sem = asyncio.Semaphore(10)
    connector = aiohttp.TCPConnector(limit=20, limit_per_host=5)   # pool caps, independent of the semaphore
    async with aiohttp.ClientSession(connector=connector) as session:
        async with asyncio.TaskGroup() as tg:        # Python 3.11+: cancels the rest on the first error
            tasks = [tg.create_task(fetch(session, sem, u)) for u in urls]
    for t in tasks:
        print(t.result())

asyncio.run(main([f"https://api.example.com/orders?page={p}" for p in range(1, 41)]))`, note: 'The Semaphore limits your coroutines; the connector limits sockets. Use both: a polite crawler limits per host, a fast internal client raises <code>limit</code>.' },
      { title: 'Session defaults and cookies', code: `import asyncio, aiohttp

async def main():
    timeout = aiohttp.ClientTimeout(total=30)
    async with aiohttp.ClientSession(
        base_url="https://api.example.com",
        headers={"User-Agent": "pydex/1.0"},
        timeout=timeout,
        cookie_jar=aiohttp.CookieJar(unsafe=True),     # unsafe=True: keep cookies for IP-address hosts too
        json_serialize=__import__("json").dumps,       # swap in orjson.dumps for speed
    ) as session:
        await session.post("/login", data={"user": "ann"})       # sets a cookie
        async with session.get("/me") as r:                     # cookie sent automatically
            print(r.status, session.cookie_jar.filter_cookies("https://api.example.com"))

asyncio.run(main())` },
    ] },
    { id: 'timeouts', title: 'Timeouts, retries, streaming', snippets: [
      { title: 'ClientTimeout and a retry loop', code: `import asyncio, aiohttp

RETRY_ON = {429, 500, 502, 503, 504}

async def get_with_retry(session, url, attempts=3):
    for attempt in range(attempts):
        try:
            async with session.get(url) as r:
                if r.status in RETRY_ON and attempt < attempts - 1:
                    raise aiohttp.ClientResponseError(r.request_info, r.history, status=r.status)
                r.raise_for_status()
                return await r.json()
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            if attempt == attempts - 1:
                raise
            await asyncio.sleep(0.5 * 2 ** attempt)        # 0.5 s, 1 s, 2 s

async def main():
    timeout = aiohttp.ClientTimeout(total=None, connect=5, sock_read=30)   # no cap on the whole download
    async with aiohttp.ClientSession(timeout=timeout) as session:
        print(await get_with_retry(session, "https://api.example.com/flaky"))

asyncio.run(main())`, note: 'The default is <code>ClientTimeout(total=300)</code>. <code>total</code> covers connect, send and the entire body read, so set it to <code>None</code> and use <code>sock_read</code> for large downloads. For a full retry policy see the aiohttp-retry package.' },
      { title: 'Stream a download, upload a file', code: `import asyncio, aiohttp

async def download(session, url, path):
    async with session.get(url) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            async for chunk in r.content.iter_chunked(64 * 1024):   # never loads the whole body
                f.write(chunk)
        print("saved", path, r.headers.get("Content-Length"), "bytes")

async def upload(session, url, path):
    form = aiohttp.FormData()                                       # multipart/form-data
    form.add_field("report", open(path, "rb"), filename="orders.csv", content_type="text/csv")
    async with session.post(url, data=form) as r:                  # raw stream instead: data=open(path, "rb")
        print(r.status)

async def main():
    async with aiohttp.ClientSession() as session:
        await download(session, "https://api.example.com/export.csv", "/tmp/export.csv")
        await upload(session, "https://api.example.com/upload", "/tmp/export.csv")

asyncio.run(main())`, note: '<code>r.content</code> is a StreamReader: <code>iter_chunked</code>, <code>iter_any</code>, <code>readline()</code>. For server-sent events, iterate lines and parse <code>data:</code> prefixes.' },
    ] },
    { id: 'server', title: 'Server: aiohttp.web', blurb: 'Handlers are coroutines that take a Request and return a Response. Routing, middlewares and startup hooks live on the Application.', snippets: [
      { title: 'Routes, path parameters, JSON', code: `from aiohttp import web

routes = web.RouteTableDef()
PRODUCTS = {101: "Kettle", 102: "Chef knife"}

@routes.get("/products")
async def list_products(request):
    q = request.query.get("q", "").lower()                       # ?q=...
    return web.json_response([{"id": k, "name": v} for k, v in PRODUCTS.items() if q in v.lower()])

@routes.get("/products/{pid}")
async def get_product(request):
    pid = int(request.match_info["pid"])                         # path parameters are strings
    if pid not in PRODUCTS:
        raise web.HTTPNotFound(text="no such product")           # exceptions are responses
    return web.json_response({"id": pid, "name": PRODUCTS[pid]})

@routes.post("/products")
async def create_product(request):
    body = await request.json()                                   # or await request.post() for forms
    return web.json_response({"created": body["name"]}, status=201)

app = web.Application()
app.add_routes(routes)
if __name__ == "__main__":
    web.run_app(app, port=8080)                                   # blocks; Ctrl-C to stop`, note: 'Pattern syntax: <code>{name}</code> matches one segment, <code>{name:regex}</code> constrains it. <code>web.run_app</code> installs a loop and serves; under an existing loop use <code>web.AppRunner</code> + <code>web.TCPSite</code>.' },
      { title: 'Middlewares, startup and cleanup', code: `import time, aiohttp
from aiohttp import web

@web.middleware
async def timing(request, handler):
    t0 = time.perf_counter()
    try:
        response = await handler(request)                  # the next middleware or the view
    except web.HTTPException as e:                         # turn 4xx/5xx into JSON
        response = web.json_response({"error": e.reason}, status=e.status)
    response.headers["Server-Timing"] = f"app;dur={(time.perf_counter() - t0) * 1000:.1f}"
    return response

async def client_session(app):                             # cleanup_ctx: setup before yield, teardown after
    app["http"] = aiohttp.ClientSession()
    yield
    await app["http"].close()

async def proxy(request):
    async with request.app["http"].get("https://api.example.com/products") as r:
        return web.json_response(await r.json())

app = web.Application(middlewares=[timing])
app.cleanup_ctx.append(client_session)
app.router.add_get("/proxy", proxy)
web.run_app(app, port=8080)`, note: 'Middlewares are listed outermost first. <code>app[...]</code> is the place for shared resources such as a client session or a DB pool; <code>cleanup_ctx</code> ties their lifetime to the server\'s.' },
      { title: 'Streaming responses and static files', code: `import asyncio
from aiohttp import web

async def events(request):                                 # server-sent events
    resp = web.StreamResponse(headers={"Content-Type": "text/event-stream", "Cache-Control": "no-cache"})
    await resp.prepare(request)                            # sends headers now
    for i in range(5):
        await resp.write(f"data: tick {i}\\n\\n".encode())
        await asyncio.sleep(1)
    return resp

async def big_file(request):
    return web.FileResponse("/data/export.csv")            # sendfile, range requests, ETag

app = web.Application()
app.router.add_get("/events", events)
app.router.add_get("/export", big_file)
app.router.add_static("/static/", path="./static", show_index=False)
web.run_app(app, port=8080)` },
    ] },
    { id: 'websockets', title: 'WebSockets', snippets: [
      { title: 'WebSocket server', code: `from aiohttp import web

async def chat(request):
    ws = web.WebSocketResponse(heartbeat=30)             # pings every 30 s, closes dead peers
    await ws.prepare(request)
    request.app["clients"].add(ws)
    try:
        async for msg in ws:                              # ends when the client closes
            if msg.type == web.WSMsgType.TEXT:
                for peer in request.app["clients"]:
                    await peer.send_str(msg.data)         # broadcast
            elif msg.type == web.WSMsgType.ERROR:
                print("ws error:", ws.exception())
    finally:
        request.app["clients"].discard(ws)
    return ws

app = web.Application()
app["clients"] = set()
app.router.add_get("/ws", chat)
web.run_app(app, port=8080)` },
      { title: 'WebSocket client', code: `import asyncio, aiohttp

async def main():
    async with aiohttp.ClientSession() as session:
        async with session.ws_connect("ws://127.0.0.1:8080/ws", heartbeat=30) as ws:
            await ws.send_json({"type": "hello", "user": "ann"})
            async for msg in ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    print("got", msg.data)
                    if msg.data == "bye":
                        await ws.close()
                elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                    break

asyncio.run(main())`, note: '<code>send_str</code>, <code>send_bytes</code>, <code>send_json</code> and their <code>receive_*</code> counterparts. Iterating the socket yields <code>WSMessage</code> objects with <code>type</code> and <code>data</code>.' },
    ] },
    { id: 'testing', title: 'Testing', snippets: [
      { title: 'pytest-aiohttp: a client for your app', code: `# pip install pytest-aiohttp
import pytest
from aiohttp import web
from main import app                     # the web.Application from your module

@pytest.fixture
async def client(aiohttp_client):        # starts the app on a random port, tears it down after
    return await aiohttp_client(app)

async def test_list_products(client):
    r = await client.get("/products", params={"q": "kettle"})
    assert r.status == 200
    assert (await r.json())[0]["name"] == "Kettle"

async def test_missing(client):
    r = await client.get("/products/999")
    assert r.status == 404

async def test_ws(client):
    async with client.ws_connect("/ws") as ws:
        await ws.send_str("hi")
        assert (await ws.receive_str()) == "hi"`, note: 'With plain pytest-asyncio, use <code>aiohttp.test_utils.TestServer</code> and <code>TestClient</code> directly. Mock outbound HTTP with the aioresponses package.' },
    ] },
  ],
  concepts: [
    { id: 'session', title: 'One session, many requests on the event loop', intro: 'How three <code>fetch()</code> coroutines share a ClientSession and a single thread: what the pool holds, where each task suspends, and why the results still come back in order.', explainer: sessionExplainer },
  ],
  compare: [
    { title: 'ClientTimeout fields', columns: ['total', 'connect', 'sock_connect', 'sock_read'], rows: [
      ['Covers', 'the whole request including the body read', 'getting a connection from the pool, DNS, TCP and TLS', 'the TCP connect alone', 'each read from the socket'],
      ['Default', '300 s', 'None', 'None', 'None'],
      ['Set it for', 'APIs with small bodies', 'flaky networks', 'rarely', 'large downloads, streams'],
      ['Large download setting', { code: 'total=None' }, { code: 'connect=5' }, '', { code: 'sock_read=30' }],
    ], note: 'Pass a <code>ClientTimeout</code> to the session for a default, or per request with <code>timeout=</code>. <code>timeout=None</code> on a request disables it entirely.' },
    { title: 'Reading a response body', columns: ['.text()', '.json()', '.read()', '.content.iter_chunked()'], rows: [
      ['Returns', 'str', 'dict / list', 'bytes', 'bytes chunks'],
      ['Loads whole body', true, true, true, false],
      ['Checks Content-Type', false, { part: 'yes; content_type=None to skip' }, false, false],
      ['Must run inside the response block', true, true, true, true],
    ], verdict: 'Every reader is a coroutine and needs the connection still open: read inside <code>async with session.get(...) as r</code>. <code>.json()</code> raises <code>ContentTypeError</code> on a non-JSON content type unless you pass <code>content_type=None</code>.' },
  ],
  gotchas: [
    { title: 'A ClientSession per request', bad: `async def fetch(url):
    async with aiohttp.ClientSession() as s:   # new pool, new DNS cache, new TLS each call
        async with s.get(url) as r:
            return await r.text()`, good: `async def main():
    async with aiohttp.ClientSession() as s:   # one per application
        results = await asyncio.gather(*(fetch(s, u) for u in urls))`, why: 'The session is the connection pool. Creating it per call throws away keep-alive sockets and DNS results and prints "Unclosed client session" warnings when you forget to close it.' },
    { title: 'Reading the body after the block', bad: `async with session.get(url) as r:
    pass
data = await r.json()     # ClientConnectionError: Connection closed`, good: `async with session.get(url) as r:
    data = await r.json()`, why: 'Leaving the <code>async with</code> releases the connection back to the pool and discards any unread body. Read first, then leave.' },
    { title: 'Forgetting that errors are silent by default', bad: `async with session.get(url) as r:
    data = await r.json()     # on a 500 with an HTML body: ContentTypeError, not "server error"`, good: `async with aiohttp.ClientSession(raise_for_status=True) as session:
    async with session.get(url) as r:      # 4xx/5xx -> ClientResponseError
        data = await r.json()`, why: 'Like requests, aiohttp treats a 500 as a valid response. Turning <code>raise_for_status</code> on for the session gives one predictable exception type to handle.' },
    { title: 'The 5-minute total timeout kills big downloads', bad: `async with session.get(big_url) as r:       # default ClientTimeout(total=300)
    async for chunk in r.content.iter_chunked(65536): ...   # TimeoutError mid-file`, good: `timeout = aiohttp.ClientTimeout(total=None, connect=10, sock_read=60)
async with session.get(big_url, timeout=timeout) as r: ...`, why: '<code>total</code> spans the whole transfer, not just the wait for headers. Trade it for a per-read timeout so a stalled socket still fails but a slow, healthy download does not.' },
  ],
};
