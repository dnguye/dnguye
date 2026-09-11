import { scene } from '../../js/explainer.js';

const lifecycleExplainer = {
  hold: 3000,
  code: ['s = requests.Session()', 'r = s.get(url, params={...}, timeout=5)', 'r.raise_for_status()', 'data = r.json()'],
  build() {
    const s = scene(760, 300);
    const box = (id, x, y, w, h, label, cls = 'cell') => s.cell(id, x, y, w, h, label, cls);
    box('code', 20, 40, 140, 44, 'your call');
    box('prep', 200, 40, 160, 44, 'PreparedRequest');
    box('sess', 200, 110, 160, 44, 'Session', 'cell ghost');
    box('pool', 400, 40, 150, 44, 'connection pool');
    box('server', 600, 40, 140, 44, 'server');
    box('resp', 400, 200, 150, 44, 'Response');
    box('you', 20, 200, 140, 44, 'your code');
    s.arrow('a1', 162, 62, 196, 62); s.arrow('a2', 362, 62, 396, 62); s.arrow('a3', 552, 62, 596, 62);
    s.arrow('a4', 670, 86, 670, 200, 'arrow hid'); s.arrow('a4b', 596, 222, 554, 222, 'arrow hid');
    s.arrow('a5', 398, 222, 164, 222, 'arrow hid');
    s.arrow('sa', 280, 108, 280, 88, 'arrow hid');
    s.text('l1', 280, 170, '', 'lbl sm ink-2');
    s.text('l2', 475, 120, '', 'lbl sm ink-2');
    s.text('l3', 475, 270, '', 'lbl sm ink-2');
    s.text('l4', 90, 270, '', 'lbl sm ink-2');
    s.text('l5', 670, 130, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'The call becomes a PreparedRequest', caption: 'Method, URL, params, headers and body are validated and encoded: the query string is built, JSON is serialised, Content-Type is chosen.', lines: [1],
      patch: { 'code.r': { cls: 'cell hot' }, 'prep.r': { cls: 'cell hot' }, a1: { cls: 'arrow hot' } } },
    { title: 'The Session merges its defaults', caption: 'Session-level headers, cookies, auth and proxies are layered under what you passed. requests.get() creates a throwaway Session for each call.', lines: [0],
      patch: { 'code.r': { cls: 'cell' }, 'sess.r': { cls: 'cell hot' }, sa: { cls: 'arrow hot' }, l1: { text: 'headers · cookies · auth · proxies' } } },
    { title: 'An adapter sends it over a pooled connection', caption: 'HTTPAdapter (urllib3 underneath) reuses open TCP/TLS connections to the same host. This is why a Session is faster than repeated requests.get().', lines: [1],
      patch: { 'prep.r': { cls: 'cell' }, 'sess.r': { cls: 'cell ghost' }, sa: { cls: 'arrow hid' }, 'pool.r': { cls: 'cell hot' }, a2: { cls: 'arrow hot' }, a3: { cls: 'arrow hot flow' }, l2: { text: 'keep-alive, retries live here' }, l5: { text: 'timeout=5 caps the wait' } } },
    { title: 'Bytes come back as a Response', caption: 'status_code, headers and the raw body. .text decodes it, .json() parses it, and both are computed lazily from .content.', lines: [1],
      patch: { 'pool.r': { cls: 'cell' }, a3: { cls: 'arrow' }, a2: { cls: 'arrow' }, 'server.r': { cls: 'cell hot' }, a4: { cls: 'arrow hot' }, a4b: { cls: 'arrow hot' }, 'resp.r': { cls: 'cell hot' }, l3: { text: 'status_code · headers · content' } } },
    { title: 'Check, then parse', caption: 'A 404 is still a Response, not an exception. raise_for_status() turns 4xx/5xx into HTTPError; only then is .json() safe to trust.', lines: [2, 3],
      patch: { 'server.r': { cls: 'cell' }, a4: { cls: 'arrow' }, a4b: { cls: 'arrow' }, 'resp.r': { cls: 'cell ok' }, a5: { cls: 'arrow ok' }, 'you.r': { cls: 'cell ok' }, l4: { text: 'r.ok → r.json()' } } },
  ],
};

export default {
  id: 'requests', name: 'requests', glyph: 'rq', group: 'http', version: '2.32', keywords: 'http get post api json session headers auth timeout',
  tagline: 'HTTP for humans: GET, POST, sessions, and sane error handling.',
  install: 'pip install requests', docs: 'https://requests.readthedocs.io/', packages: ['requests'],
  overview: {
    what: 'requests is the standard way to call HTTP APIs from synchronous Python. A one-liner for the simple case, a Session for the real one (connection reuse, default headers, cookies), and a small set of exceptions to catch. Under the hood it delegates to urllib3.',
    yes: ['Calling REST or JSON APIs from scripts and services.', 'Downloading files, submitting forms, handling cookies.', 'You want the most-copied, most-documented HTTP code on the internet.'],
    no: ['You need async or HTTP/2 (httpx).', 'Thousands of concurrent requests (httpx + asyncio, or aiohttp).', 'Zero dependencies are required (urllib.request in the stdlib).'],
    note: 'In the sandbox, <code>https://api.pydex.local</code> is a mock server backed by the sample data. Any other host raises a <code>ConnectionError</code> on purpose.',
  },
  cheatsheet: [
    { id: 'get', title: 'GET and read the response', snippets: [
      { title: 'Query parameters and JSON', code: `import requests

r = requests.get("https://api.pydex.local/orders",
                 params={"region": "North", "limit": 3}, timeout=5)
print(r.status_code, r.url)
print(r.headers["Content-Type"])
data = r.json()
print(data["total"], "orders in North; first:")
data["items"][0]`, note: 'Always pass <code>timeout</code>. Without it a stalled server hangs your program forever.' },
      { title: 'Text, bytes, and status', code: `import requests
r = requests.get("https://api.pydex.local/products/101", timeout=5)

print(r.ok, r.status_code, r.reason)
print(r.text[:60])          # decoded str
print(r.content[:20])       # raw bytes
print(r.elapsed.total_seconds(), "s")
missing = requests.get("https://api.pydex.local/products/999", timeout=5)
print(missing.status_code, missing.json())` },
    ] },
    { id: 'post', title: 'POST, headers, auth', snippets: [
      { title: 'json= versus data=', code: `import requests
url = "https://api.pydex.local/echo"

as_json = requests.post(url, json={"name": "Kettle", "qty": 2}, timeout=5)
print(as_json.json()["headers"]["Content-Type"])   # application/json

as_form = requests.post(url, data={"name": "Kettle", "qty": 2}, timeout=5)
print(as_form.json()["headers"]["Content-Type"])   # x-www-form-urlencoded
print(as_form.json()["json"])                       # the raw form body`, note: '<code>json=</code> serialises and sets the header for you. <code>data=</code> sends a form (or raw bytes/str if you pass one).' },
      { title: 'Headers and bearer tokens', code: `import requests

headers = {"Authorization": "Bearer demo-token", "Accept": "application/json", "X-Request-Id": "abc-123"}
r = requests.get("https://api.pydex.local/echo", headers=headers, timeout=5)
print(r.json()["headers"])
# Basic auth: requests.get(url, auth=("user", "pass"))` },
    ] },
    { id: 'errors', title: 'Errors and retries', snippets: [
      { title: 'raise_for_status and the exception family', code: `import requests

def fetch(url):
    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()            # 4xx/5xx → HTTPError
        return r.json()
    except requests.HTTPError as e:
        print("HTTP error:", e.response.status_code, e.response.json())
    except requests.ConnectionError as e:
        print("could not connect:", str(e)[:60])
    except requests.Timeout:
        print("timed out")
    except requests.RequestException as e:   # base class for all of the above
        print("other:", e)

fetch("https://api.pydex.local/status/500")
fetch("https://example.com/not-mocked")
print(fetch("https://api.pydex.local/status/200"))` },
      { title: 'Automatic retries with urllib3', code: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

retry = Retry(total=3, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504],
              allowed_methods=["GET", "POST"])
s = requests.Session()
s.mount("https://", HTTPAdapter(max_retries=retry))
r = s.get("https://api.pydex.local/status/200", timeout=5)
print(r.status_code, "with retry policy:", retry.total, "attempts, backoff", retry.backoff_factor)`, note: 'Backoff waits 0.5 s, 1 s, 2 s between attempts. The mock server answers instantly, so the policy is configured but not exercised here.' },
    ] },
    { id: 'session', title: 'Sessions', snippets: [
      { title: 'Reuse connections and defaults', code: `import requests

with requests.Session() as s:
    s.headers.update({"User-Agent": "pydex/1.0", "Accept": "application/json"})
    s.params = {"limit": 2}                       # default query params
    for region in ["North", "South", "East"]:
        r = s.get("https://api.pydex.local/orders", params={"region": region}, timeout=5)
        print(region, r.json()["total"], [o["order_id"] for o in r.json()["items"]])`, note: 'One Session per program or per worker. Its pool keeps TCP and TLS connections open between calls.' },
      { title: 'Walk a paginated endpoint', code: `import requests

def iter_orders(session, **filters):
    page = 1
    while True:
        r = session.get("https://api.pydex.local/orders", params={**filters, "page": page, "limit": 50}, timeout=5)
        r.raise_for_status()
        body = r.json()
        yield from body["items"]
        if page * 50 >= body["total"]:
            break
        page += 1

with requests.Session() as s:
    rows = list(iter_orders(s, status="returned"))
print(len(rows), "returned orders; first id", rows[0]["order_id"])` },
    ] },
    { id: 'files', title: 'Files and streaming', snippets: [
      { title: 'Stream a large body to disk', code: `import requests

r = requests.get("https://api.pydex.local/orders", params={"limit": 200}, stream=True, timeout=10)
r.raise_for_status()
n = 0
with open("/tmp/orders.json", "wb") as f:
    for chunk in r.iter_content(chunk_size=8192):
        f.write(chunk); n += len(chunk)
print(n, "bytes written")
# upload: requests.post(url, files={"file": open("report.csv", "rb")})`, note: '<code>stream=True</code> defers the body download until you iterate, so memory stays flat for big files.' },
    ] },
  ],
  concepts: [
    { id: 'lifecycle', title: 'What happens in one request', intro: 'From your keyword arguments to a parsed body: the objects requests builds along the way, and where timeouts, retries and pooling live.', explainer: lifecycleExplainer },
  ],
  compare: [
    { title: 'Reading a response body', columns: ['.json()', '.text', '.content', 'iter_content()'], rows: [
      ['Returns', 'dict / list', 'str', 'bytes', 'bytes chunks'],
      ['Decodes', 'JSON', 'by charset', 'nothing', 'nothing'],
      ['Loads whole body', true, true, true, false],
      ['Fails when', 'not valid JSON', 'wrong encoding guessed', 'never', 'never'],
    ] },
    { title: 'Sending a body', columns: ['json=', 'data=dict', 'data=str/bytes', 'files='], rows: [
      ['Content-Type', 'application/json', 'form-urlencoded', 'you set it', 'multipart/form-data'],
      ['Use for', 'JSON APIs', 'HTML forms', 'XML, raw payloads', 'uploads'],
    ] },
  ],
  gotchas: [
    { title: 'There is no default timeout', bad: `requests.get(url)   # can block forever`, good: `requests.get(url, timeout=(3.05, 27))  # (connect, read)`, why: 'A dropped connection or a slow server will hang the thread indefinitely. Every production call needs a timeout.' },
    { title: 'A 500 is not an exception', bad: `data = requests.get(url, timeout=5).json()
# on a 500 with an HTML error page: JSONDecodeError`, good: `r = requests.get(url, timeout=5)
r.raise_for_status()
data = r.json()`, why: 'requests only raises for transport problems. Status codes are your job: <code>raise_for_status()</code> or check <code>r.ok</code>.' },
    { title: 'data= sends a form, not JSON', bad: `requests.post(url, data={"a": 1})
# body: a=1, Content-Type form-urlencoded`, good: `requests.post(url, json={"a": 1})`, why: 'Most APIs expect JSON. <code>json=</code> serialises with the right header. Pass <code>data=json.dumps(...)</code> only if you also set the header.' },
    { title: 'Mutable session state leaks between calls', bad: `s.headers["Authorization"] = token_for(user_a)
...
s.get(url_for_user_b)   # still sends user A's token`, good: `s.get(url, headers={"Authorization": token})   # per call`, why: 'Session headers are defaults merged into every request. Per-request headers override without changing the session.' },
  ],
  presets: [
    { title: 'Call the mock API', code: `import requests

with requests.Session() as s:
    s.headers["Accept"] = "application/json"
    r = s.get("https://api.pydex.local/products", params={"category": "outdoor"}, timeout=5)
    r.raise_for_status()
    for p in r.json():
        print(f"{p['id']}  {p['name']:<20} \${p['price']:>7.2f}")
    echo = s.post("https://api.pydex.local/echo", json={"hello": "world"}, timeout=5)
    echo.json()` },
  ],
};
