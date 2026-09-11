import { scene } from '../../js/explainer.js';

const requestExplainer = {
  hold: 3000,
  code: ['@app.post("/orders/{region}", response_model=OrderOut)', 'def create(region: str, dry_run: bool = False,', '           order: OrderIn, db=Depends(get_db)):', '    return db.insert(order)'],
  build() {
    const s = scene(760, 320);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 36, label, cls);
    s.text('req', 20, 22, 'POST /orders/North?dry_run=true   {"qty": 2, "product_id": 101}', 'code', undefined, 'start');
    box('route', 20, 44, 200, 'match route');
    box('path', 20, 100, 200, 'region: str ← path', 'cell hid');
    box('query', 20, 144, 200, 'dry_run: bool ← query', 'cell hid');
    box('body', 20, 188, 200, 'order: OrderIn ← body', 'cell hid');
    box('dep', 20, 232, 200, 'db ← Depends(get_db)', 'cell hid');
    box('handler', 320, 144, 150, 'create(...)', 'cell hid');
    box('rm', 540, 144, 190, 'response_model filter', 'cell hid');
    box('json', 540, 232, 190, 'JSON + 200', 'cell ok hid');
    box('err', 320, 232, 150, '422 with details', 'cell err hid');
    s.arrow('a1', 222, 118, 316, 156, 'arrow hid'); s.arrow('a2', 222, 162, 316, 162, 'arrow hid'); s.arrow('a3', 222, 206, 316, 168, 'arrow hid'); s.arrow('a4', 222, 250, 316, 174, 'arrow hid');
    s.arrow('h1', 472, 162, 536, 162, 'arrow hid'); s.arrow('h2', 635, 182, 635, 228, 'arrow hid');
    s.arrow('e1', 222, 206, 316, 244, 'arrow hid');
    s.text('n1', 395, 300, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'Route by method and path', caption: 'Starlette matches POST /orders/{region}. Path parameters are captured as strings at this point.', lines: [0],
      patch: { 'route.r': { cls: 'cell hot' } } },
    { title: 'Parameters are sorted by where they come from', caption: 'A name that appears in the path is a path parameter. A pydantic model is the body. Everything else with a simple type is a query parameter. Each is converted and validated.', lines: [1, 2],
      patch: { 'route.r': { cls: 'cell' }, path: { cls: '' }, query: { cls: '' }, body: { cls: '' }, 'path.r': { cls: 'cell hot' }, 'query.r': { cls: 'cell hot' }, 'body.r': { cls: 'cell hot' } } },
    { title: 'Dependencies are resolved', caption: 'Depends(get_db) calls get_db (which may itself declare dependencies) and injects the result. A generator dependency yields, then cleans up after the response.', lines: [2],
      patch: { dep: { cls: '' }, 'dep.r': { cls: 'cell info' } } },
    { title: 'The handler runs', caption: 'Your function gets typed values, not strings. A def handler runs in a threadpool; an async def handler runs on the event loop and must not block.', lines: [3],
      patch: { handler: { cls: '' }, a1: { cls: 'arrow' }, a2: { cls: 'arrow' }, a3: { cls: 'arrow' }, a4: { cls: 'arrow' }, 'handler.r': { cls: 'cell hot' } } },
    { title: 'response_model shapes the output', caption: 'The return value is validated and serialised through OrderOut: extra fields are dropped, types are enforced, and the schema lands in /docs.', lines: [0],
      patch: { rm: { cls: '' }, json: { cls: '' }, h1: { cls: 'arrow' }, h2: { cls: 'arrow ok' }, 'handler.r': { cls: 'cell' }, 'rm.r': { cls: 'cell hot' } } },
    { title: 'When validation fails', caption: 'A bad body or query never reaches your code. FastAPI returns 422 with pydantic\'s error list, and the OpenAPI docs already told the client what was required.', lines: [1, 2],
      patch: { err: { cls: '' }, e1: { cls: 'arrow err' }, 'body.r': { cls: 'cell err' }, n1: { text: '{"detail": [{"loc": ["body", "qty"], "msg": ...}]}' } } },
  ],
};

export default {
  id: 'fastapi', name: 'fastapi', glyph: 'api', group: 'web', version: '0.115', keywords: 'api rest server endpoint async uvicorn openapi swagger',
  tagline: 'Typed HTTP APIs: declare parameters, get validation and docs for free.',
  install: 'pip install "fastapi[standard]"', docs: 'https://fastapi.tiangolo.com/', packages: ['pip:fastapi', 'httpx'],
  overview: {
    what: 'FastAPI builds a web API from Python functions with type hints. Path, query and body parameters are parsed and validated by pydantic, dependencies are injected, and an OpenAPI schema with interactive docs is generated automatically. It runs on Starlette (ASGI) with uvicorn as the usual server.',
    yes: ['JSON APIs and microservices, especially with async I/O.', 'You want request validation, serialisation and docs without writing them.', 'Backends for single-page apps and mobile clients.'],
    no: ['Server-rendered HTML sites with an admin (Django).', 'A tiny synchronous service where Flask\'s minimalism is enough.', 'Running inside this sandbox: it needs a server process. Copy the snippets into a file and run <code>fastapi dev main.py</code>.'],
  },
  cheatsheet: [
    { id: 'app', title: 'App and endpoints', snippets: [
      { title: 'Hello, with path and query parameters', code: `from fastapi import FastAPI

app = FastAPI(title="Orders API")

@app.get("/")
def root():
    return {"ok": True}

@app.get("/orders/{order_id}")
def get_order(order_id: int, verbose: bool = False):
    # order_id comes from the path (converted to int, 422 if not numeric)
    # verbose comes from the query string: /orders/7?verbose=true
    return {"order_id": order_id, "verbose": verbose}

# run:  fastapi dev main.py     (or: uvicorn main:app --reload)
# docs: http://127.0.0.1:8000/docs

# --- call it in-process (no server in the browser; locally: fastapi dev main.py) ---
import httpx
async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
    r = await c.get("/orders/7?verbose=true")
    print(r.status_code, r.json())
    print((await c.get("/orders/seven")).json())        # 422: not an int`, note: 'Parameters with the same name as a path segment are path params; other simple types are query params; pydantic models are the body.' },
      { title: 'Request body and response model', code: `from fastapi import FastAPI, status
from pydantic import BaseModel, Field

app = FastAPI()

class OrderIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100)
    note: str | None = None

class OrderOut(BaseModel):
    order_id: int
    product_id: int
    quantity: int
    status: str

@app.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderIn):
    return {"order_id": 1241, **order.model_dump(), "status": "pending", "secret": "dropped"}

# --- call it in-process (no server in the browser; locally: fastapi dev main.py) ---
import httpx
async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
    r = await c.post("/orders", json={"product_id": 101, "quantity": 2})
    print(r.status_code, r.json())                       # secret is gone
    print((await c.post("/orders", json={"product_id": 101, "quantity": 0})).json()["detail"][0]["msg"])`, note: '<code>response_model</code> validates the output and strips undeclared keys such as <code>secret</code>. The request JSON is validated before your function runs.' },
    ] },
    { id: 'deps', title: 'Dependencies and errors', snippets: [
      { title: 'Depends for shared logic', code: `from fastapi import FastAPI, Depends, HTTPException, Header
from typing import Annotated

app = FastAPI()
FAKE_DB = {101: {"name": "Kettle"}, 102: {"name": "Chef knife"}}

def get_db():
    db = FAKE_DB          # open a session in real life
    try:
        yield db
    finally:
        pass              # close it here

def current_user(authorization: Annotated[str | None, Header()] = None):
    if authorization != "Bearer demo-token":
        raise HTTPException(status_code=401, detail="missing or bad token")
    return {"user": "ann"}

@app.get("/products/{pid}")
def product(pid: int, db=Depends(get_db), user=Depends(current_user)):
    if pid not in db:
        raise HTTPException(status_code=404, detail=f"product {pid} not found")
    return {**db[pid], "seen_by": user["user"]}

# --- call it in-process (no server in the browser; locally: fastapi dev main.py) ---
import httpx
async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
    print((await c.get("/products/101")).json())
    ok = {"Authorization": "Bearer demo-token"}
    print((await c.get("/products/101", headers=ok)).json())
    print((await c.get("/products/999", headers=ok)).json())`, note: 'Dependencies can depend on dependencies. Put <code>dependencies=[Depends(current_user)]</code> on a router to protect a whole group.' },
      { title: 'Pagination and filters as a dependency', code: `from fastapi import FastAPI, Depends, Query
from typing import Annotated
from pydantic import BaseModel

app = FastAPI()

class Page(BaseModel):
    limit: int = Query(20, ge=1, le=100)
    offset: int = Query(0, ge=0)

@app.get("/orders")
def list_orders(page: Annotated[Page, Depends()], region: str | None = None):
    rows = [{"id": i, "region": region or "any"} for i in range(1000)]
    return {"total": len(rows), "items": rows[page.offset : page.offset + page.limit]}

# --- call it in-process (no server in the browser; locally: fastapi dev main.py) ---
import httpx
async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
    r = await c.get("/orders", params={"limit": 2, "offset": 10, "region": "North"})
    print(r.json())
    print((await c.get("/orders", params={"limit": 500})).status_code)   # 422` },
    ] },
    { id: 'async', title: 'Async, routers, background work', snippets: [
      { title: 'async def endpoints', code: `import asyncio, httpx
from fastapi import FastAPI

app = FastAPI()

@app.get("/aggregate")
async def aggregate():
    async with httpx.AsyncClient(timeout=5) as client:
        a, b = await asyncio.gather(
            client.get("https://api.pydex.local/products"),
            client.get("https://api.pydex.local/employees"),
        )
    return {"products": len(a.json()), "employees": len(b.json())}

@app.get("/cpu")
def cpu_bound():           # plain def → runs in a threadpool, does not block the loop
    return {"sum": sum(range(10_000_000))}

# --- call it in-process (no server in the browser; locally: fastapi dev main.py) ---
import httpx
async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
    print((await c.get("/aggregate")).json())
    print((await c.get("/cpu")).json())`, note: 'Use <code>async def</code> only when you await inside. A blocking call (requests, time.sleep, heavy CPU) inside <code>async def</code> stalls every other request.' },
      { title: 'APIRouter, BackgroundTasks, CORS', code: `from fastapi import FastAPI, APIRouter, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["https://app.example.com"], allow_methods=["*"], allow_headers=["*"])

orders = APIRouter(prefix="/orders", tags=["orders"])

def send_receipt(order_id: int):
    print("emailing receipt for", order_id)    # runs after the response is sent

@orders.post("/{order_id}/confirm")
def confirm(order_id: int, tasks: BackgroundTasks):
    tasks.add_task(send_receipt, order_id)
    return {"order_id": order_id, "status": "confirmed"}

app.include_router(orders)

# --- call it in-process (no server in the browser; locally: fastapi dev main.py) ---
import httpx
async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
    print((await c.post("/orders/7/confirm")).json())
    print([r.path for r in app.routes if hasattr(r, "path")][-2:])` },
    ] },
    { id: 'test', title: 'Testing', snippets: [
      { title: 'TestClient (no server needed)', run: false, code: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items", status_code=201)
def create(item: Item):
    return {"id": 1, **item.model_dump()}

client = TestClient(app)

def test_create():
    r = client.post("/items", json={"name": "Kettle", "price": 39})
    assert r.status_code == 201
    assert r.json()["name"] == "Kettle"

def test_validation():
    r = client.post("/items", json={"name": "Kettle", "price": "cheap"})
    assert r.status_code == 422
    assert r.json()["detail"][0]["loc"] == ["body", "price"]`, note: 'TestClient drives the ASGI app in-process using a thread, which the browser lacks; the other snippets use <code>httpx.ASGITransport</code> for the same effect. Override dependencies with <code>app.dependency_overrides[get_db] = fake_db</code>.' },
    ] },
  ],
  concepts: [
    { id: 'request', title: 'What happens to a request', intro: 'From URL to handler and back: where each parameter comes from, when dependencies run, and why bad input never reaches your code.', explainer: requestExplainer },
  ],
  compare: [
    { title: 'Where a parameter comes from', columns: ['Path', 'Query', 'Body', 'Header / Cookie'], rows: [
      ['Declared as', 'name in the route string', 'simple type not in the path', 'pydantic model', { code: 'Annotated[str, Header()]' }],
      ['Example', { code: '/orders/{id}' }, { code: '?limit=20' }, { code: '{"qty": 2}' }, { code: 'Authorization: …' }],
      ['Can be optional', false, true, true, true],
      ['Validated by pydantic', true, true, true, true],
    ], note: 'Use <code>Query()</code>, <code>Path()</code>, <code>Body()</code> to add constraints or to force a simple type into the body.' },
    { title: 'def versus async def handlers', columns: ['def', 'async def'], rows: [
      ['Runs on', 'threadpool', 'event loop'],
      ['Safe with blocking libraries (requests, sync ORM)', true, false],
      ['Best with', 'sync code you already have', 'httpx, async DB drivers, websockets'],
      ['Concurrency ceiling', 'threadpool size (~40)', 'thousands of idle connections'],
    ], verdict: 'Mixing is fine. The only mistake is blocking inside <code>async def</code>.' },
  ],
  gotchas: [
    { title: 'Blocking inside async def', bad: `@app.get("/slow")
async def slow():
    time.sleep(2)          # freezes every request for 2 s
    return requests.get(url).json()`, good: `@app.get("/slow")
def slow():                # threadpool
    time.sleep(2)
    return requests.get(url).json()
# or: await asyncio.sleep(2); await httpx_client.get(url)`, why: 'The event loop is single-threaded. Anything that does not <code>await</code> holds it.' },
    { title: 'Returning an ORM object without from_attributes', bad: `class UserOut(BaseModel):
    id: int; name: str
@app.get("/u/{i}", response_model=UserOut)
def u(i: int): return db.get(User, i)   # validation error`, good: `class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; name: str`, why: 'pydantic reads dict keys by default. <code>from_attributes</code> lets it read object attributes such as SQLAlchemy rows.' },
    { title: 'Depends is a marker, not a call', bad: `def endpoint(db=get_db()):     # runs once at import time`, good: `def endpoint(db=Depends(get_db)):`, why: 'The default value is evaluated when the function is defined. <code>Depends</code> tells FastAPI to call it per request.' },
    { title: 'Mutable module state across workers', bad: `CACHE = {}    # each uvicorn worker has its own copy`, good: `# use Redis / a database, or run one worker while prototyping`, why: 'Production runs several processes. In-memory state is per process and disappears on restart.' },
  ],
};
