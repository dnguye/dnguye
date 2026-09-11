import { scene } from '../../js/explainer.js';

const contextExplainer = {
  hold: 3200,
  code: ['environ  ->  app.wsgi_app(environ, start_response)', 'ctx = app.request_context(environ); ctx.push()', 'rule, view_args = url_map.match()', 'before_request hooks  ->  view(**view_args)', 'make_response(rv)  ->  after_request hooks', 'session.save()  ->  ctx.pop()   # g is gone'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 36, label, cls);
    // top row: the pipeline
    box('srv', 20, 30, 120, 'WSGI server');
    box('wsgi', 170, 30, 130, 'app.wsgi_app', 'cell hid');
    box('ctx', 330, 30, 160, 'RequestContext', 'cell hid');
    box('route', 520, 30, 110, 'url_map.match', 'cell hid');
    box('view', 660, 30, 80, 'view()', 'cell hid');
    s.arrow('a1', 142, 48, 166, 48, 'arrow hid'); s.arrow('a2', 302, 48, 326, 48, 'arrow hid');
    s.arrow('a3', 492, 48, 516, 48, 'arrow hid'); s.arrow('a4', 632, 48, 656, 48, 'arrow hid');
    // the context stack panel
    const p = s.g('panel', 330, 90, 'hid');
    s.rect('panel.p', 0, 0, 300, 130, 'panel', p, 8);
    s.text('panel.t', 8, -10, 'while the context is pushed', 'lbl sm bold ink-2', p, 'start');
    box('px_req', 10, 12, 130, 'request', 'cell info', p);
    box('px_sess', 150, 12, 140, 'session', 'cell info', p);
    box('px_g', 10, 58, 130, 'g', 'cell info', p);
    box('px_app', 150, 58, 140, 'current_app', 'cell info', p);
    s.text('panel.n', 150, 116, 'proxies resolve to this request\'s objects', 'lbl sm ink-2', p);
    // hooks column on the left
    box('bef', 20, 100, 160, 'before_request', 'cell hid');
    box('aft', 20, 160, 160, 'after_request', 'cell hid');
    box('tear', 20, 220, 160, 'teardown_request', 'cell hid');
    s.arrow('h1', 100, 138, 100, 156, 'arrow hid'); s.arrow('h2', 100, 198, 100, 216, 'arrow hid');
    s.text('bef.n', 190, 118, '', 'lbl sm ink-2', undefined, 'start');
    s.text('aft.n', 190, 178, '', 'lbl sm ink-2', undefined, 'start');
    // bottom row: response path
    box('mk', 660, 100, 80, 'Response', 'cell hid');
    s.arrow('v1', 700, 68, 700, 96, 'arrow hid');
    box('cookie', 520, 250, 220, 'Set-Cookie: session=...', 'cell hid');
    box('out', 20, 280, 120, 'bytes to client', 'cell hid');
    s.arrow('o1', 516, 268, 144, 292, 'arrow hid');
    s.text('foot', 330, 300, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The server calls the app with a WSGI environ', caption: 'Flask is a WSGI app. gunicorn or the dev server parses the socket bytes into an environ dict (method, path, headers, body stream) and calls app.wsgi_app with it. Nothing Flask-specific exists yet.', lines: [0],
      patch: { 'srv.r': { cls: 'cell hot' }, wsgi: { cls: '' }, a1: { cls: 'arrow hot' } } },
    { title: 'A RequestContext is pushed', caption: 'wsgi_app builds a RequestContext from the environ and pushes it (an AppContext is pushed underneath if none is active). From here, request, session and g are usable anywhere in the call stack: they are proxies that look up the top of this stack.', lines: [1],
      patch: { 'srv.r': { cls: 'cell' }, 'wsgi.r': { cls: 'cell hot' }, ctx: { cls: '' }, a2: { cls: 'arrow hot' }, panel: { cls: '' } } },
    { title: 'Routing picks the view', caption: 'The URL map (werkzeug) matches path and method against every rule. Converters turn <int:id> into an int. No match raises NotFound or MethodNotAllowed, which become 404/405 responses through the same error path as your own exceptions.', lines: [2],
      patch: { 'wsgi.r': { cls: 'cell' }, 'ctx.r': { cls: 'cell' }, route: { cls: '' }, a3: { cls: 'arrow hot' }, 'route.r': { cls: 'cell hot' } } },
    { title: 'before_request hooks, then the view', caption: 'Every before_request function runs first; if one returns a value, that becomes the response and the view is skipped (this is how auth checks short-circuit). Otherwise the view is called with the converted URL arguments. g is the place for per-request scratch data such as a DB connection.', lines: [3],
      patch: { 'route.r': { cls: 'cell' }, bef: { cls: '' }, 'bef.r': { cls: 'cell hot' }, 'bef.n': { text: 'return -> skip the view' }, view: { cls: '' }, a4: { cls: 'arrow hot' }, 'view.r': { cls: 'cell hot' }, 'px_g.r': { cls: 'cell hot' } } },
    { title: 'The return value becomes a Response', caption: 'make_response accepts a str, bytes, dict or list (serialised as JSON), a (body, status, headers) tuple, or a Response. after_request hooks then see the Response object and can add headers or cookies.', lines: [4],
      patch: { 'bef.r': { cls: 'cell' }, 'view.r': { cls: 'cell' }, 'px_g.r': { cls: 'cell info' }, mk: { cls: '' }, v1: { cls: 'arrow hot' }, 'mk.r': { cls: 'cell ok' }, h1: { cls: 'arrow' }, aft: { cls: '' }, 'aft.r': { cls: 'cell hot' }, 'aft.n': { text: 'sees the Response' } } },
    { title: 'Session saved, context popped, g discarded', caption: 'If the session changed, it is signed with SECRET_KEY and written as a Set-Cookie header. teardown_request runs even after an exception. Then the context is popped: g and its contents are gone, and the Response is returned to the server as bytes.', lines: [5],
      patch: { 'aft.r': { cls: 'cell' }, 'mk.r': { cls: 'cell' }, cookie: { cls: '' }, 'cookie.r': { cls: 'cell ok' }, h2: { cls: 'arrow' }, tear: { cls: '' }, 'tear.r': { cls: 'cell info' }, panel: { cls: 'dim' }, out: { cls: '' }, 'out.r': { cls: 'cell ok' }, o1: { cls: 'arrow ok' }, foot: { text: 'next request: fresh RequestContext, fresh g, same session cookie' } } },
  ],
};

export default {
  id: 'flask', name: 'Flask', glyph: 'fl', group: 'http', version: '3.1', keywords: 'web framework wsgi route request response jinja blueprint session',
  tagline: 'A small WSGI framework: routes, requests, Jinja templates, and nothing you did not ask for.',
  install: 'pip install flask', docs: 'https://flask.palletsprojects.com/', packages: ['pip:flask'],
  overview: {
    what: 'Flask maps URLs to Python functions and hands them a request object; whatever they return becomes the response. It ships routing (werkzeug), templating (Jinja), signed cookie sessions and a test client, and leaves databases, auth and forms to extensions you pick. The app is a plain WSGI callable, so gunicorn, uWSGI or any WSGI server runs it.',
    yes: ['Small services, internal tools, and APIs where you want to see every moving part.', 'Server-rendered HTML with Jinja templates.', 'Teaching or prototyping: the whole request cycle fits in one file.', 'Wrapping existing synchronous Python (ORMs, SDKs) behind HTTP.'],
    no: ['You want an ORM, admin, auth and migrations decided for you (Django).', 'The API is async-heavy or needs typed request validation and OpenAPI docs (FastAPI).', 'Long-lived connections such as WebSockets are central (Starlette, aiohttp).'],
    note: 'There is no server process in the browser, so every snippet ends by driving the app with <code>app.test_client()</code>, which calls the WSGI app in-process. Locally, run the same file with <code>flask --app main run --debug</code>.',
  },
  cheatsheet: [
    { id: 'routes', title: 'App and routes', blurb: 'One Flask object, decorated functions, URL converters.', snippets: [
      { title: 'Routes with converters and methods', code: `from flask import Flask, url_for

app = Flask(__name__)

@app.route("/")
def index():
    return "hello"                                    # str -> 200 text/html

@app.get("/products/<int:pid>")                      # int converter: 404 for /products/abc
def product(pid):
    return {"id": pid, "url": url_for("product", pid=pid)}   # dict -> JSON

@app.route("/orders/<region>", methods=["GET", "POST"])
def orders(region):
    return f"{region} orders"

with app.test_client() as c:
    print(c.get("/").text, c.get("/products/7").json)
    print(c.get("/products/abc").status_code, c.post("/orders/North").text, c.delete("/").status_code)`, note: 'Converters: <code>string</code> (default), <code>int</code>, <code>float</code>, <code>path</code>, <code>uuid</code>. <code>url_for</code> builds URLs from the endpoint name, so routes can move without breaking links.' },
      { title: 'Run it locally', run: false, code: `# main.py holds "app = Flask(__name__)"
flask --app main run --debug          # dev server with reloader and debugger, http://127.0.0.1:5000
flask --app main run --port 8080 --host 0.0.0.0
flask --app main routes               # list every rule, endpoint and method

# production: a WSGI server, several workers
gunicorn -w 4 -b 0.0.0.0:8000 main:app

# never call app.run() in production; in this sandbox there is no socket to bind
if __name__ == "__main__":
    app.run(debug=True)` },
    ] },
    { id: 'request', title: 'Request data and responses', snippets: [
      { title: 'Query args, form fields, JSON, headers', code: `from flask import Flask, request

app = Flask(__name__)

@app.get("/search")
def search():
    q = request.args.get("q", "")                       # ?q=...  (MultiDict: .getlist for repeats)
    limit = request.args.get("limit", 10, type=int)     # coerced; default when missing or invalid
    return {"q": q, "limit": limit, "ua": request.headers.get("User-Agent", "?")}

@app.post("/orders")
def create():
    data = request.get_json() if request.is_json else request.form.to_dict()   # JSON body or form fields
    return {"received": data, "content_type": request.content_type}

with app.test_client() as c:
    print(c.get("/search?q=kettle&limit=x").json)
    print(c.post("/orders", json={"sku": 101, "qty": 2}).json)
    print(c.post("/orders", data={"sku": "101"}).json)`, note: '<code>request.values</code> merges args and form. Uploaded files are in <code>request.files</code>; raw bytes in <code>request.get_data()</code>.' },
      { title: 'Ways to return a response', code: `from flask import Flask, jsonify, make_response, redirect, abort, url_for

app = Flask(__name__)

@app.get("/a")
def a(): return "created", 201                            # (body, status)
@app.get("/b")
def b(): return {"ok": True}, 200, {"X-Trace": "abc"}    # (body, status, headers); dict -> JSON
@app.get("/c")
def c(): return jsonify([1, 2, 3])                        # explicit JSON (a bare list also works on Flask >= 2.2)
@app.get("/d")
def d():
    resp = make_response("cached", 200)                   # a Response you can mutate
    resp.set_cookie("seen", "1", httponly=True, samesite="Lax")
    return resp
@app.get("/e")
def e(): return redirect(url_for("a"))                    # 302 with Location
@app.get("/f")
def f(): abort(403)                                       # raises HTTPException -> 403 page

with app.test_client() as c:
    for path in "abcdef":
        r = c.get(f"/{path}")
        print(path, r.status_code, r.mimetype, r.headers.get("Location") or r.headers.get("Set-Cookie", r.text)[:14])` },
    ] },
    { id: 'templates', title: 'Templates', snippets: [
      { title: 'Jinja: variables, loops, filters, autoescape', code: `from flask import Flask, render_template_string, request

app = Flask(__name__)
PAGE = """<h1>{{ title }}</h1>
<ul>{% for p in products %}<li>{{ p.name }} — {{ "%.2f"|format(p.price) }}</li>{% endfor %}</ul>
<p>{{ note }}</p>{# the note is escaped: no <script> gets through #}
<p>{{ products|length }} items, path {{ request.path }}</p>"""

@app.get("/catalogue")
def catalogue():
    products = [{"name": "Kettle", "price": 39}, {"name": "Desk lamp", "price": 29.9}]
    return render_template_string(PAGE, title="Catalogue", products=products, note="<script>x</script>")

with app.test_client() as c:
    print(c.get("/catalogue").text)`, note: 'In a real app, <code>render_template("catalogue.html", ...)</code> loads from the <code>templates/</code> folder next to the module. <code>request</code>, <code>session</code>, <code>g</code>, <code>config</code> and <code>url_for</code> are available in every template.' },
      { title: 'Template inheritance and custom filters', code: `from flask import Flask, render_template_string
from jinja2 import DictLoader

app = Flask(__name__)
app.jinja_loader = DictLoader({                       # stands in for the templates/ folder
    "base.html": "<title>{% block title %}Shop{% endblock %}</title><main>{% block body %}{% endblock %}</main>",
    "order.html": '{% extends "base.html" %}{% block title %}Order {{ id }}{% endblock %}'
                  "{% block body %}Total: {{ total|money }}{% endblock %}",
})

@app.template_filter("money")
def money(value):
    return f"\${value:,.2f}"

@app.get("/orders/<int:id>")
def order(id):
    return render_template_string('{% include "order.html" %}', id=id, total=1234.5)

with app.test_client() as c:
    print(c.get("/orders/42").text)`, note: '<code>@app.template_filter</code> registers a filter; <code>@app.context_processor</code> injects variables into every template; <code>@app.template_global</code> adds a callable.' },
    ] },
    { id: 'state', title: 'Sessions, g, and request hooks', blurb: 'Where per-user and per-request state lives, and the hooks that run around every view.', snippets: [
      { title: 'Session in a signed cookie', code: `from flask import Flask, session, request, redirect, url_for

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-me"        # signs the cookie; sessions fail without it

@app.post("/login")
def login():
    session["user"] = request.form["user"]     # stored client-side, signed, readable by the user
    session.permanent = True                   # lives PERMANENT_SESSION_LIFETIME (31 days), not just the browser session
    return redirect(url_for("me"))

@app.get("/me")
def me():
    session["visits"] = session.get("visits", 0) + 1     # changed -> a new Set-Cookie goes out
    return {"user": session.get("user"), "visits": session["visits"]}

@app.post("/logout")
def logout():
    session.clear(); return "", 204

with app.test_client() as c:                   # the test client keeps cookies between calls
    print(c.get("/me").json, c.post("/login", data={"user": "ann"}, follow_redirects=True).json)
    c.post("/logout"); print(c.get("/me").json)`, note: 'The cookie is signed, not encrypted: tamper-proof, but anyone with the cookie can read it. Keep it small (4 KB limit) and never put secrets in it; use Flask-Session or a DB for server-side sessions.' },
      { title: 'before_request, g, teardown', code: `from flask import Flask, g, request, abort
import sqlite3

app = Flask(__name__)

@app.before_request
def open_db_and_check_token():
    g.db = sqlite3.connect("/data/shop.sqlite")        # per-request connection, parked on g
    if request.path.startswith("/admin") and request.headers.get("Authorization") != "Bearer demo":
        abort(401)                                     # short-circuits: the view never runs

@app.teardown_request
def close_db(exc):                                     # runs even if the view raised
    if db := g.pop("db", None):
        db.close()

@app.get("/admin/stats")
def stats():
    (n,) = g.db.execute("SELECT count(*) FROM orders").fetchone()
    return {"orders": n}

with app.test_client() as c:
    print(c.get("/admin/stats").status_code, c.get("/admin/stats", headers={"Authorization": "Bearer demo"}).json)`, note: '<code>g</code> lives for one request (it sits on the app context, which is pushed per request). It is not shared between requests and not a place for caches. <code>after_request</code> hooks receive the Response and must return it.' },
    ] },
    { id: 'structure', title: 'Blueprints, errors, app factory', snippets: [
      { title: 'Blueprints group routes', code: `from flask import Flask, Blueprint, abort

products = Blueprint("products", __name__, url_prefix="/products")
CATALOGUE = {101: "Kettle", 102: "Chef knife"}

@products.get("/")
def list_products():
    return {"items": [{"id": k, "name": v} for k, v in CATALOGUE.items()]}

@products.get("/<int:pid>")
def get_product(pid):
    return {"id": pid, "name": CATALOGUE[pid]} if pid in CATALOGUE else abort(404)

@products.errorhandler(404)                        # scoped to this blueprint's routes
def product_missing(e):
    return {"error": "no such product"}, 404

app = Flask(__name__)
app.register_blueprint(products)                   # endpoints become products.list_products, ...
app.register_blueprint(products, url_prefix="/v2/products", name="products_v2")

with app.test_client() as c:
    print(c.get("/products/").json["items"][0], c.get("/v2/products/101").json)
    print(c.get("/products/999").json, c.get("/nope").status_code)`, note: 'A blueprint is a recipe: nothing exists until it is registered on an app, and it can be registered more than once under different prefixes.' },
      { title: 'Error handlers and custom exceptions', code: `from flask import Flask
from werkzeug.exceptions import HTTPException

app = Flask(__name__)

class OutOfStock(Exception):
    def __init__(self, sku): self.sku = sku

@app.errorhandler(OutOfStock)                      # your own exception -> a proper response
def handle_oos(e):
    return {"error": "out of stock", "sku": e.sku}, 409

@app.errorhandler(HTTPException)                   # every 4xx/5xx as JSON instead of an HTML page
def handle_http(e):
    return {"error": e.name, "status": e.code}, e.code

@app.post("/buy/<int:sku>")
def buy(sku):
    if sku == 104: raise OutOfStock(sku)
    return {"bought": sku}

with app.test_client() as c:
    print(c.post("/buy/101").json, c.post("/buy/104").json)
    print(c.get("/buy/101").json, c.get("/missing").json)`, note: 'Handlers are matched by class hierarchy: the most specific registered handler wins. Register on a blueprint to scope it.' },
      { title: 'Application factory and config', code: `from flask import Flask, current_app

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(SECRET_KEY="dev", DATABASE="/data/shop.sqlite", PAGE_SIZE=20)
    app.config.from_prefixed_env()             # FLASK_PAGE_SIZE=50 in the environment overrides
    if test_config:
        app.config.update(test_config)

    @app.get("/config")
    def show():
        return {"db": current_app.config["DATABASE"], "page_size": current_app.config["PAGE_SIZE"]}

    @app.cli.command("stats")                  # flask --app main stats
    def stats(): print("page size is", current_app.config["PAGE_SIZE"])
    return app

app = create_app({"PAGE_SIZE": 5, "TESTING": True})
print(app.test_client().get("/config").json)
print(app.test_cli_runner().invoke(args=["stats"]).output.strip())`, note: 'A factory lets tests build an app with different config and avoids import-time side effects. <code>flask --app "main:create_app()"</code> calls it for you.' },
    ] },
    { id: 'testing', title: 'Testing', snippets: [
      { title: 'test_client and test_request_context', code: `from flask import Flask, request, url_for

app = Flask(__name__)

@app.get("/hello/<name>")
def hello(name):
    return {"hi": name, "loud": request.args.get("loud") == "1"}

client = app.test_client()
r = client.get("/hello/ann", query_string={"loud": "1"}, headers={"X-Test": "1"})
print(r.status_code, r.json, r.mimetype)
print(r.get_json() == r.json, r.get_data(as_text=True)[:16])

with app.test_request_context("/hello/bo?loud=0"):     # a fake request, no view called
    print(request.path, request.args["loud"], url_for("hello", name="cy"))

with app.app_context():                                # app context alone: config, g, current_app
    print(app.name, app.config["DEBUG"])`, note: '<code>test_request_context</code> is how you exercise code that reads <code>request</code> or calls <code>url_for</code> outside a real request.' },
      { title: 'pytest fixtures for a Flask app', run: false, code: `# conftest.py
import pytest
from main import create_app

@pytest.fixture
def app():
    app = create_app({"TESTING": True, "SECRET_KEY": "test"})
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

# test_orders.py
def test_create_order(client):
    r = client.post("/orders", json={"sku": 101, "qty": 2})
    assert r.status_code == 201
    assert r.json["qty"] == 2

def test_login_sets_session(client):
    client.post("/login", data={"user": "ann"})
    with client.session_transaction() as s:      # read or edit the session cookie
        assert s["user"] == "ann"`, note: '<code>TESTING=True</code> propagates exceptions to the test instead of rendering a 500 page.' },
    ] },
  ],
  concepts: [
    { id: 'contexts', title: 'One request through Flask', intro: 'From a WSGI environ to bytes on the wire: when the request context is pushed, what <code>request</code>, <code>g</code> and <code>session</code> point at, where the hooks run, and why <code>g</code> is empty on the next request.', explainer: contextExplainer },
  ],
  compare: [
    { title: 'Ways to return a response from a view', columns: ['str / bytes', 'dict / list', 'tuple', 'make_response()', 'jsonify()', 'redirect() / abort()'], rows: [
      ['Status code', '200', '200', 'you choose', 'you choose', '200', '302 / any 4xx-5xx'],
      ['Content-Type', 'text/html', 'application/json', 'depends on body', 'you set it', 'application/json', 'text/html'],
      ['Can set headers or cookies', false, false, { part: 'headers' }, true, { part: 'via .headers' }, false],
      ['Use for', 'HTML, plain text', 'JSON APIs', 'JSON or text with a status', 'cookies, caching, files', 'top-level JSON list on old Flask', 'flow control'],
    ], verdict: 'Return a dict for JSON and a tuple when the status matters. Reach for <code>make_response</code> only when you need to touch headers or cookies.' },
    { title: 'Where to keep state', columns: ['g', 'session', 'app.config', 'module global'], rows: [
      ['Lifetime', 'one request', 'one browser, across requests', 'process', 'process'],
      ['Per user', false, true, false, false],
      ['Stored where', 'memory (app context)', 'signed cookie on the client', 'memory', 'memory'],
      ['Safe with several workers', true, true, { part: 'read-only' }, false],
      ['Typical content', 'DB connection, current user object', 'user id, flash messages', 'settings, secrets', 'constants only'],
    ], note: 'Anything that must survive a restart or be shared between worker processes belongs in a database or cache, not in any of these.' },
  ],
  gotchas: [
    { title: 'Working outside of application context', bad: `from flask import current_app
DB_URL = current_app.config["DATABASE"]   # RuntimeError at import time`, good: `def get_db():
    return connect(current_app.config["DATABASE"])   # called inside a request
# or, in scripts and threads:
with app.app_context():
    print(current_app.config["DATABASE"])`, why: '<code>current_app</code>, <code>g</code>, <code>request</code> and <code>session</code> are proxies to a context that only exists while a request (or an explicit <code>app_context()</code>) is active. Module-level code and background threads have none.' },
    { title: 'request.json raises on the wrong Content-Type', bad: `data = request.json        # 415 Unsupported Media Type if the client sent a form`, good: `data = request.get_json(silent=True) or {}
# or check first:  if not request.is_json: abort(400)`, why: 'Since Flask 2.1, <code>request.json</code> fails loudly when the body is not declared as JSON. <code>get_json(silent=True)</code> returns <code>None</code> instead so you can respond with a clear 400.' },
    { title: 'Trailing slashes are two different rules', bad: `@app.route("/users/")   # /users  -> 308 redirect to /users/  (a POST body is lost on some clients)
@app.route("/users")    # /users/ -> 404`, good: `@app.route("/users", strict_slashes=False)   # both paths serve the view
# or pick one style and be consistent, especially for POST endpoints`, why: 'werkzeug treats the trailing slash as part of the rule. A rule ending in <code>/</code> behaves like a folder and redirects the bare path; a rule without it does not accept the slashed path.' },
    { title: 'Sessions silently need SECRET_KEY', bad: `app = Flask(__name__)
session["user"] = "ann"    # RuntimeError: The session is unavailable because no secret key was set`, good: `app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]   # long, random, the same on every worker`, why: 'The session cookie is signed with this key. Generate it once (<code>python -c "import secrets; print(secrets.token_hex(32))"</code>); a key that differs between workers or restarts logs everyone out.' },
  ],
  presets: [
    { title: 'A small JSON API with a test client', code: `from flask import Flask, request, abort

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev"
ORDERS = {}

@app.post("/orders")
def create():
    data = request.get_json(silent=True) or {}
    if "sku" not in data: abort(400)
    ORDERS[len(ORDERS) + 1] = {"id": len(ORDERS) + 1, **data}
    return ORDERS[len(ORDERS)], 201

@app.get("/orders/<int:oid>")
def read(oid): return ORDERS.get(oid) or abort(404)

with app.test_client() as c:
    print(c.post("/orders", json={"sku": 101, "qty": 2}).json)
    print(c.get("/orders/1").json, c.get("/orders/9").status_code, c.post("/orders", json={}).status_code)` },
  ],
};
