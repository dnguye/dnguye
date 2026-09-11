import { scene } from '../../js/explainer.js';

const requestExplainer = {
  hold: 3200,
  code: ['request = HttpRequest(environ)   # WSGIHandler / ASGIHandler', 'for mw in MIDDLEWARE: request -> mw.process_request', 'view, kwargs = resolve(request.path)   # ROOT_URLCONF', 'qs = Order.objects.filter(...)          # lazy until iterated', 'return render(request, "orders.html", {"orders": qs})', 'for mw in reversed(MIDDLEWARE): response = mw(response)'],
  build() {
    const s = scene(760, 340);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 32, label, cls);
    box('srv', 20, 20, 150, 'WSGI / ASGI handler');
    s.text('srv.n', 95, 62, 'HttpRequest', 'lbl sm ink-2');
    // middleware column (request goes down, response comes up)
    const MW = ['SecurityMiddleware', 'SessionMiddleware', 'CommonMiddleware', 'CsrfViewMiddleware', 'AuthenticationMiddleware'];
    MW.forEach((m, i) => box(`mw${i}`, 230, 20 + i * 44, 210, m, 'cell hid'));
    s.text('mw.t', 335, 246, 'MIDDLEWARE, top to bottom', 'lbl sm ink-2');
    s.arrow('in0', 172, 36, 226, 36, 'arrow hid');
    for (let i = 0; i < 4; i++) s.arrow(`dn${i}`, 300, 52 + i * 44, 300, 62 + i * 44, 'arrow hid');
    for (let i = 0; i < 4; i++) s.arrow(`up${i}`, 370, 62 + i * 44, 370, 52 + i * 44, 'arrow hid');
    s.arrow('out0', 226, 36, 172, 36, 'arrow hid');
    s.text('short', 230, 268, '', 'lbl sm ink-2', undefined, 'start');
    // right side: urlconf -> view -> orm / template
    box('url', 500, 20, 240, 'URLconf: resolve(path)', 'cell hid');
    box('view', 500, 80, 240, 'view(request, **kwargs)', 'cell hid');
    box('orm', 500, 140, 110, 'ORM', 'cell hid');
    box('db', 630, 140, 110, 'database', 'cell ghost hid');
    box('tpl', 500, 200, 240, 'template.render(context)', 'cell hid');
    box('resp', 500, 260, 240, 'HttpResponse', 'cell hid');
    s.arrow('r1', 442, 36, 496, 36, 'arrow hid');
    s.arrow('r2', 620, 52, 620, 76, 'arrow hid');
    s.arrow('r3', 555, 112, 555, 136, 'arrow hid');
    s.arrow('r3b', 612, 156, 626, 156, 'arrow hid');
    s.arrow('r4', 555, 172, 555, 196, 'arrow hid');
    s.arrow('r5', 620, 232, 620, 256, 'arrow hid');
    s.arrow('r6', 496, 276, 442, 220, 'arrow hid');
    s.text('orm.n', 620, 190, '', 'lbl sm ink-2');
    s.text('foot', 20, 320, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The handler builds an HttpRequest', caption: 'gunicorn (WSGI) or uvicorn (ASGI) hands Django a raw request. The handler wraps it in an HttpRequest: method, path, GET and POST QueryDicts, headers, body. It also loads the middleware chain once, at startup, from the MIDDLEWARE setting.', lines: [0],
      patch: { 'srv.r': { cls: 'cell hot' } } },
    { title: 'Down through the middleware', caption: 'Each middleware wraps the next like an onion. On the way in it can attach things (request.session, request.user), or return a response early: CommonMiddleware redirecting to add a slash, CsrfViewMiddleware rejecting a bad token. Order in the setting is the order of this walk.', lines: [1],
      patch: { 'srv.r': { cls: 'cell' }, in0: { cls: 'arrow hot' }, mw0: { cls: '' }, mw1: { cls: '' }, mw2: { cls: '' }, mw3: { cls: '' }, mw4: { cls: '' }, dn0: { cls: 'arrow hot' }, dn1: { cls: 'arrow hot' }, dn2: { cls: 'arrow hot' }, dn3: { cls: 'arrow hot' }, 'mw1.r': { cls: 'cell hot' }, 'mw4.r': { cls: 'cell hot' }, short: { text: 'any layer may return a response and stop the walk' } } },
    { title: 'The URLconf resolves the path to a view', caption: 'ROOT_URLCONF is a module with urlpatterns. Django walks them in order (include() nests other modules), the first match wins, and path converters produce typed keyword arguments. No match raises Http404.', lines: [2],
      patch: { 'mw1.r': { cls: 'cell' }, 'mw4.r': { cls: 'cell' }, dn0: { cls: 'arrow' }, dn1: { cls: 'arrow' }, dn2: { cls: 'arrow' }, dn3: { cls: 'arrow' }, in0: { cls: 'arrow' }, url: { cls: '' }, r1: { cls: 'arrow hot' }, 'url.r': { cls: 'cell hot' }, short: { text: '' } } },
    { title: 'The view runs; the ORM builds SQL lazily', caption: 'The view gets the HttpRequest plus the URL kwargs. A QuerySet is only a description of a query: filter(), order_by() and select_related() add to it, and nothing hits the database until the view iterates, slices, or counts it.', lines: [3],
      patch: { 'url.r': { cls: 'cell' }, view: { cls: '' }, r2: { cls: 'arrow hot' }, 'view.r': { cls: 'cell hot' }, orm: { cls: '' }, db: { cls: '' }, r3: { cls: 'arrow hot' }, r3b: { cls: 'arrow ghost' }, 'orm.r': { cls: 'cell info' }, 'orm.n': { text: 'SQL runs on iteration' } } },
    { title: 'The template renders the context', caption: 'render() loads a template through the configured engines, evaluates the context (which is where the QuerySet finally runs), autoescapes every variable, and wraps the resulting string in an HttpResponse with status 200 and text/html.', lines: [4],
      patch: { 'view.r': { cls: 'cell' }, r3b: { cls: 'arrow hot flow' }, 'db.r': { cls: 'cell hot' }, tpl: { cls: '' }, r4: { cls: 'arrow hot' }, 'tpl.r': { cls: 'cell hot' }, resp: { cls: '' }, r5: { cls: 'arrow ok' }, 'resp.r': { cls: 'cell ok' } } },
    { title: 'Back up through the middleware, in reverse', caption: 'The response climbs the same stack from the bottom: SessionMiddleware saves the session and sets its cookie, CommonMiddleware adds Content-Length, SecurityMiddleware adds security headers. Then the handler streams it to the server. A middleware that returned early skips every layer below it, both ways.', lines: [5],
      patch: { 'tpl.r': { cls: 'cell' }, 'db.r': { cls: 'cell ghost' }, r3b: { cls: 'arrow ghost' }, r6: { cls: 'arrow ok' }, up0: { cls: 'arrow ok' }, up1: { cls: 'arrow ok' }, up2: { cls: 'arrow ok' }, up3: { cls: 'arrow ok' }, out0: { cls: 'arrow ok' }, 'mw1.r': { cls: 'cell ok' }, 'mw2.r': { cls: 'cell ok' }, 'mw0.r': { cls: 'cell ok' }, 'srv.r': { cls: 'cell ok' }, foot: { text: 'process_exception hooks run in the same reverse order when the view raises' } } },
  ],
};

// Every runnable snippet is a complete one-file Django project. The sandbox reuses one
// interpreter, so settings are configured once and the URL cache is cleared per snippet.
const BOOT = `import django
from django.conf import settings
from django.urls import path, clear_url_caches
if not settings.configured:                 # one-file project: settings, urls and views together
    settings.configure(DEBUG=True, SECRET_KEY="dev", ROOT_URLCONF=__name__, ALLOWED_HOSTS=["*"], TIME_ZONE="UTC",
        INSTALLED_APPS=[], MIDDLEWARE=[], TEMPLATES=[{"BACKEND": "django.template.backends.django.DjangoTemplates"}],
        DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}})
    django.setup()
clear_url_caches()                          # the sandbox reuses one interpreter between snippets
`;

export default {
  id: 'django', name: 'Django', glyph: 'dj', group: 'http', version: '5.2', keywords: 'web framework orm models views urls templates forms admin migrations middleware',
  tagline: 'The batteries-included web framework: ORM, admin, auth, forms, templates.',
  install: 'pip install django', docs: 'https://docs.djangoproject.com/en/5.2/', packages: ['pip:django', 'tzdata'],
  overview: {
    what: 'Django is a full-stack web framework with strong opinions: a URLconf routes to views, an ORM with migrations owns the database schema, a template engine renders HTML, and auth, sessions, forms, an admin site and a test client come in the box. Projects are split into apps, and the conventions are the same everywhere, which is why a Django codebase you have never seen still looks familiar.',
    yes: ['A database-backed site or product that needs auth, an admin and a schema that will evolve.', 'Teams that want one well-documented way to do things.', 'Server-rendered HTML with forms, plus JSON endpoints (or Django REST framework) alongside.', 'Long-lived projects where migrations and a stable upgrade path matter.'],
    no: ['A microservice with two endpoints and no database (Flask, FastAPI).', 'A pure async, high-concurrency API where typed validation and OpenAPI matter most (FastAPI).', 'You already have a schema managed elsewhere and want thin SQL access (SQLAlchemy Core).'],
    note: 'Views, URLs, forms, middleware and templates run here as one-file projects driven by <code>django.test.Client</code>. Models need an app with migrations and the admin needs a server, so those snippets are copy-only; run them in a project made with <code>django-admin startproject</code>.',
  },
  cheatsheet: [
    { id: 'views', title: 'Views and URLs', blurb: 'A view is a function that takes an HttpRequest and returns an HttpResponse. urlpatterns decide which one runs.', snippets: [
      { title: 'A one-file project: settings, view, URLconf, Client', code: BOOT + `from django.http import HttpResponse, JsonResponse
from django.test import Client

def home(request):
    return HttpResponse("hello")

def product(request, pid):                   # pid arrives as an int thanks to <int:pid>
    return JsonResponse({"id": pid, "name": f"product {pid}"})

urlpatterns = [
    path("", home, name="home"),
    path("products/<int:pid>/", product, name="product"),
]

c = Client()
print(c.get("/").content, c.get("/products/7/").json())
print(c.get("/products/abc/").status_code)   # no pattern matches -> 404`, note: 'Converters: <code>str</code> (default), <code>int</code>, <code>slug</code>, <code>uuid</code>, <code>path</code>. In a real project this is three files: <code>settings.py</code>, <code>urls.py</code>, <code>views.py</code>.' },
      { title: 'reverse(), include() and namespaces', code: BOOT + `from django.http import JsonResponse
from django.urls import include, reverse
from django.test import Client

def order_detail(request, order_id):
    return JsonResponse({"order": order_id, "self": reverse("shop:order", args=[order_id])})

def order_list(request):
    return JsonResponse({"list": reverse("shop:orders"), "first": reverse("shop:order", kwargs={"order_id": 1001})})

shop_patterns = [                            # normally shop/urls.py with app_name = "shop"
    path("orders/", order_list, name="orders"),
    path("orders/<int:order_id>/", order_detail, name="order"),
]
urlpatterns = [path("shop/", include((shop_patterns, "shop")))]

c = Client()
print(c.get(reverse("shop:orders")).json())
print(c.get("/shop/orders/1001/").json())`, note: 'Never hard-code URLs in views or templates: <code>reverse()</code> in Python, <code>{% url "shop:order" 1001 %}</code> in templates. Namespaces keep names unique across apps.' },
      { title: 'Project layout and commands', run: false, code: `django-admin startproject mysite .       # manage.py, mysite/settings.py, mysite/urls.py
python manage.py startapp shop           # shop/models.py, views.py, admin.py, migrations/
# add "shop" to INSTALLED_APPS, then:
python manage.py makemigrations          # write migration files from model changes
python manage.py migrate                 # apply them to the database
python manage.py createsuperuser         # admin login
python manage.py runserver               # http://127.0.0.1:8000/  (admin at /admin/)
python manage.py shell                   # a Python shell with Django set up
python manage.py test                    # run the test suite
python manage.py check --deploy          # production settings audit

# mysite/urls.py
from django.contrib import admin
from django.urls import include, path
urlpatterns = [path("admin/", admin.site.urls), path("shop/", include("shop.urls"))]` },
    ] },
    { id: 'request', title: 'Requests and responses', snippets: [
      { title: 'GET params, JSON bodies, headers, redirects', code: BOOT + `import json
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from django.test import Client

@require_http_methods(["GET", "POST"])       # anything else -> 405
def orders(request):
    if request.method == "GET":
        region = request.GET.get("region", "all")             # QueryDict: .getlist() for repeats
        return JsonResponse({"region": region, "limit": int(request.GET.get("limit", 10)),
                             "ua": request.headers.get("User-Agent")})
    data = json.loads(request.body)          # JSON body; request.POST only holds form fields
    return JsonResponse({"created": data}, status=201)

def old(request):
    return redirect("orders", permanent=True)   # target: a URL name, a model instance, or a URL

urlpatterns = [path("orders/", orders, name="orders"), path("old/", old)]

c = Client(headers={"User-Agent": "pydex"})
print(c.get("/orders/?region=North&limit=3").json())
print(c.post("/orders/", data=json.dumps({"sku": 101}), content_type="application/json").json())
print(c.delete("/orders/").status_code, c.get("/old/").status_code, c.get("/old/")["Location"])`, note: '<code>request.GET</code> and <code>request.POST</code> are QueryDicts (<code>getlist</code> for repeated keys). <code>request.headers</code> is case-insensitive. Form posts from a browser also need a CSRF token unless the view is <code>@csrf_exempt</code>.' },
      { title: 'Class-based views', code: BOOT + `import json
from django.http import JsonResponse
from django.views import View
from django.test import Client

STOCK = {101: 4, 104: 0}

class StockView(View):
    http_method_names = ["get", "patch"]          # others get a 405 automatically

    def get(self, request, sku):
        return JsonResponse({"sku": sku, "stock": STOCK.get(sku, 0)})

    def patch(self, request, sku):
        STOCK[sku] = STOCK.get(sku, 0) + json.loads(request.body)["delta"]
        return self.get(request, sku)

urlpatterns = [path("stock/<int:sku>/", StockView.as_view(), name="stock")]

c = Client()
print(c.get("/stock/104/").json())
print(c.patch("/stock/104/", data='{"delta": 3}', content_type="application/json").json())
print(c.post("/stock/104/").status_code)`, note: '<code>as_view()</code> returns a plain function for the URLconf and dispatches on <code>request.method</code>. Generic views (<code>ListView</code>, <code>DetailView</code>, <code>CreateView</code>) build on this with model and template conventions.' },
    ] },
    { id: 'forms', title: 'Forms', blurb: 'Declare fields once; get parsing, validation, error messages and HTML rendering.', snippets: [
      { title: 'Validate and clean input', code: BOOT + `from django import forms
from django.http import JsonResponse
from django.test import Client

class OrderForm(forms.Form):
    sku = forms.IntegerField(min_value=100)
    quantity = forms.IntegerField(min_value=1, max_value=50)
    email = forms.EmailField(required=False)
    note = forms.CharField(max_length=80, required=False, strip=True)

    def clean_note(self):                                  # per-field hook: runs after type coercion
        note = self.cleaned_data["note"]
        if "urgent" in note.lower():
            raise forms.ValidationError("no urgent orders on this channel")
        return note

def create(request):
    form = OrderForm(request.POST)
    if not form.is_valid():
        return JsonResponse({"errors": form.errors}, status=400)   # {field: [messages]}
    return JsonResponse({"clean": form.cleaned_data}, status=201)  # typed values

urlpatterns = [path("orders/", create)]
c = Client()
print(c.post("/orders/", {"sku": "101", "quantity": "2", "note": " gift wrap "}).json())
print(c.post("/orders/", {"sku": "7", "quantity": "99", "email": "nope", "note": "URGENT"}).json())`, note: '<code>cleaned_data</code> holds Python values (ints, not strings). Add a <code>clean()</code> method for checks that span fields; it can call <code>self.add_error("field", msg)</code>.' },
      { title: 'Render a form and a ModelForm', run: false, code: `# forms.py
from django import forms
from .models import Order

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ["product", "quantity", "region"]           # never "__all__" on user-facing forms
        widgets = {"region": forms.Select(choices=[("N", "North"), ("S", "South")])}

# views.py
def order_create(request):
    form = OrderForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        order = form.save()                                  # creates the model instance
        return redirect("shop:order", order_id=order.pk)
    return render(request, "shop/order_form.html", {"form": form})

# shop/order_form.html
# <form method="post">{% csrf_token %}{{ form.as_div }}<button>Save</button></form>` },
    ] },
    { id: 'templates', title: 'Templates', snippets: [
      { title: 'Template language: variables, filters, tags', code: BOOT + `from django.template import Template, Context

tpl = Template("""<h1>{{ title|upper }}</h1>
<ul>{% for o in orders %}
  <li class="{% cycle 'odd' 'even' %}">#{{ o.id }} {{ o.region }} — {{ o.total|floatformat:2 }}{% if o.rush %} (rush){% endif %}</li>
{% empty %}<li>no orders</li>{% endfor %}</ul>
<p>{{ orders|length }} orders, first {{ orders.0.region|default:"?" }}, note: {{ note }}</p>""")

html = tpl.render(Context({
    "title": "Orders", "note": "<b>escaped</b>",
    "orders": [{"id": 1001, "region": "North", "total": 158, "rush": True}, {"id": 1002, "region": "East", "total": 79.5, "rush": False}],
}))
print(html)`, note: 'Dots do everything: <code>o.region</code> tries dict key, attribute, then index. Variables are autoescaped; mark trusted HTML with <code>|safe</code> or <code>mark_safe()</code>, sparingly.' },
      { title: 'Inheritance, and render() in a view', code: BOOT + `from django.shortcuts import render
from django.test import Client, override_settings

LOCMEM = {"BACKEND": "django.template.backends.django.DjangoTemplates",     # in a project: DIRS=[BASE_DIR / "templates"], APP_DIRS=True
          "OPTIONS": {"context_processors": ["django.template.context_processors.request"],
                      "loaders": [("django.template.loaders.locmem.Loader", {
              "base.html": "<title>{% block title %}Shop{% endblock %}</title><main>{% block body %}{% endblock %}</main>",
              "order.html": '{% extends "base.html" %}{% block title %}Order {{ order.id }}{% endblock %}'
                            "{% block body %}{{ order.region }}: {{ order.total }} at {{ request.path }}{% endblock %}",
          })]}}

def order(request, order_id):
    return render(request, "order.html", {"order": {"id": order_id, "region": "North", "total": 158}})

urlpatterns = [path("orders/<int:order_id>/", order)]

with override_settings(TEMPLATES=[LOCMEM]):        # in a project the templates live on disk
    r = Client().get("/orders/1001/")
    print(r.status_code, r["Content-Type"]); print(r.content.decode())`, note: '<code>render(request, name, context)</code> finds the template by name, adds context processors (<code>request</code>, <code>user</code>, <code>csrf_token</code>) and returns an HttpResponse. <code>{% extends %}</code> must be the first tag in a child template.' },
    ] },
    { id: 'middleware', title: 'Middleware and sessions', snippets: [
      { title: 'Write a middleware', code: BOOT + `import time
from django.http import JsonResponse, HttpResponseForbidden
from django.test import Client, override_settings

def timing_middleware(get_response):                 # runs once at startup
    def middleware(request):                         # runs per request
        if request.headers.get("X-Blocked"):
            return HttpResponseForbidden("blocked")  # short-circuit: the view never runs
        t0 = time.perf_counter()
        response = get_response(request)             # everything below, including the view
        response["Server-Timing"] = f"app;dur={(time.perf_counter() - t0) * 1000:.2f}"
        return response
    return middleware

def ping(request):
    return JsonResponse({"pong": True})

urlpatterns = [path("ping/", ping)]

with override_settings(MIDDLEWARE=[f"{__name__}.timing_middleware"]):   # in settings.py: "myapp.middleware.timing_middleware"
    c = Client()
    r = c.get("/ping/"); print(r.json(), r["Server-Timing"])
    print(c.get("/ping/", headers={"X-Blocked": "1"}).status_code)`, note: 'Code before <code>get_response</code> runs on the way in (top of the list first); code after runs on the way out (bottom first). A class with <code>__init__(self, get_response)</code> and <code>__call__</code> works the same and can add <code>process_view</code> and <code>process_exception</code> hooks. The default stack, in order: Security, Session, Common, CsrfView, Authentication, Message, XFrameOptions.' },
      { title: 'Sessions', code: BOOT + `from django.http import JsonResponse
from django.test import Client, override_settings

def visit(request):
    request.session["visits"] = request.session.get("visits", 0) + 1     # a dict that persists per browser
    if request.GET.get("user"):
        request.session["user"] = request.GET["user"]
    return JsonResponse({"visits": request.session["visits"], "user": request.session.get("user")})

def logout(request):
    request.session.flush()                          # drop the data and the cookie
    return JsonResponse({"ok": True})

urlpatterns = [path("visit/", visit), path("logout/", logout)]

with override_settings(MIDDLEWARE=["django.contrib.sessions.middleware.SessionMiddleware"],
                       SESSION_ENGINE="django.contrib.sessions.backends.signed_cookies"):
    c = Client()                                     # keeps cookies between requests
    print(c.get("/visit/").json(), c.get("/visit/?user=ann").json(), c.get("/visit/").json())
    c.get("/logout/"); print(c.get("/visit/").json())`, note: 'The default engine stores session data in the <code>django_session</code> table (needs <code>django.contrib.sessions</code> in INSTALLED_APPS and a migrate); only the id travels in the cookie. Cache or signed-cookie backends are alternatives.' },
    ] },
    { id: 'orm', title: 'Models and the ORM', blurb: 'Copy-only: models need an installed app with migrations. Run these in a project.', snippets: [
      { title: 'Define models', run: false, code: `# shop/models.py
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=40, db_index=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self): return self.name

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending"; SHIPPED = "shipped"; RETURNED = "returned"

    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="orders")
    region = models.CharField(max_length=20)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        indexes = [models.Index(fields=["region", "status"])]`, note: 'Every model gets an auto <code>id</code> primary key. <code>on_delete</code> is required on foreign keys: <code>CASCADE</code>, <code>PROTECT</code>, <code>SET_NULL</code> (with <code>null=True</code>).' },
      { title: 'Query, filter, annotate', run: false, code: `from django.db.models import Count, F, Q, Sum
from shop.models import Order, Product

Order.objects.filter(region="North", status="shipped")              # AND
Order.objects.filter(Q(region="North") | Q(region="South")).exclude(quantity__lt=2)
Order.objects.filter(product__category="kitchen")                   # join through the FK
Order.objects.filter(created__year=2025, product__name__icontains="kettle")
Order.objects.order_by("-created").values("id", "region")[:5]      # dicts, LIMIT 5
Product.objects.annotate(n=Count("orders")).filter(n__gt=3)         # GROUP BY, HAVING
Order.objects.aggregate(total=Sum(F("quantity") * F("product__price")))   # {"total": Decimal(...)}
Order.objects.select_related("product")                             # JOIN, one query for order.product
Product.objects.prefetch_related("orders")                          # second query, then joined in Python
Order.objects.filter(status="pending").update(status="shipped")      # one UPDATE, no signals
qs = Order.objects.filter(region="West")
print(qs.query)                                                     # the SQL it would run
print(qs.exists(), qs.count())                                      # cheap checks: no rows loaded` },
      { title: 'Create, update, delete, transactions', run: false, code: `from django.db import transaction
from shop.models import Order, Product

kettle = Product.objects.create(name="Kettle", category="kitchen", price="39.00")
order = Order(product=kettle, region="North", quantity=2)
order.save()                                                   # INSERT; order.pk is now set
order.quantity = 3; order.save(update_fields=["quantity"])     # UPDATE one column

lamp, created = Product.objects.get_or_create(name="Desk lamp", defaults={"category": "office", "price": "29.90"})
Order.objects.bulk_create([Order(product=lamp, region=r) for r in ("East", "West")])

try:
    Product.objects.get(name="Nope")
except Product.DoesNotExist:
    pass

with transaction.atomic():                                     # all or nothing
    Product.objects.filter(pk=kettle.pk).update(price=F("price") * 1.1)
    order.delete()                                             # cascades per on_delete` },
      { title: 'Admin, migrations, management command', run: false, code: `# shop/admin.py  ->  /admin/shop/order/
from django.contrib import admin
from .models import Order, Product

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "region", "status", "created"]
    list_filter = ["status", "region"]
    search_fields = ["product__name"]
    autocomplete_fields = ["product"]

admin.site.register(Product)

# migrations: after editing models.py
#   python manage.py makemigrations shop      -> shop/migrations/0002_....py
#   python manage.py migrate                  -> applies; commit the files with the model change

# shop/management/commands/reprice.py  ->  python manage.py reprice 1.1
from django.core.management.base import BaseCommand
class Command(BaseCommand):
    help = "Multiply every price by FACTOR"
    def add_arguments(self, parser): parser.add_argument("factor", type=float)
    def handle(self, *args, factor, **options):
        n = Product.objects.update(price=F("price") * factor)
        self.stdout.write(self.style.SUCCESS(f"updated {n} products"))` },
    ] },
    { id: 'testing', title: 'Testing', snippets: [
      { title: 'TestCase with the test client', run: false, code: `# shop/tests.py  ->  python manage.py test shop
from django.test import TestCase
from django.urls import reverse
from .models import Product

class ProductViewTests(TestCase):                    # each test runs in a rolled-back transaction
    @classmethod
    def setUpTestData(cls):                          # created once per class
        cls.kettle = Product.objects.create(name="Kettle", category="kitchen", price="39.00")

    def test_detail(self):
        r = self.client.get(reverse("shop:product", args=[self.kettle.pk]))
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, "Kettle")
        self.assertTemplateUsed(r, "shop/product_detail.html")

    def test_create_requires_login(self):
        r = self.client.post(reverse("shop:product_create"), {"name": "x"})
        self.assertRedirects(r, "/accounts/login/?next=/shop/products/new/")
        self.assertNumQueries(1, lambda: list(Product.objects.all()))`, note: 'The test runner creates a throwaway database and applies migrations. With pytest, <code>pytest-django</code> gives the same client and DB as fixtures.' },
    ] },
  ],
  concepts: [
    { id: 'request', title: 'A request through Django', intro: 'Down the middleware stack, through the URLconf to a view, out to the ORM and template, and back up the stack in reverse. The order of <code>MIDDLEWARE</code> is the order of this walk.', explainer: requestExplainer },
  ],
  compare: [
    { title: 'Returning a response', columns: ['HttpResponse', 'JsonResponse', 'render()', 'redirect()', 'Http404 / get_object_or_404'], rows: [
      ['Content-Type', 'text/html (or yours)', 'application/json', 'text/html', 'none', 'text/html'],
      ['Status', '200 (or status=)', '200 (or status=)', '200', '302 (permanent=True: 301)', '404'],
      ['Takes', 'str / bytes', 'dict (safe=False for lists)', 'request, template, context', 'URL name, model, or URL', 'model + lookup'],
      ['Use for', 'plain text, files, custom headers', 'APIs', 'HTML pages', 'after a POST', 'missing objects'],
    ], note: 'All of these are HttpResponse instances: set headers with <code>response["X-Name"] = value</code> and cookies with <code>response.set_cookie()</code>.' },
    { title: 'Function views, View, generic views', columns: ['function view', 'View subclass', 'generic CBV (ListView, CreateView...)'], rows: [
      ['Boilerplate', { dots: 1 }, { dots: 2 }, { dots: 1 }],
      ['Readable at a glance', { dots: 5 }, { dots: 4 }, { dots: 2 }],
      ['Reuse via mixins and inheritance', false, true, true],
      ['Conventions for model + template', false, false, true],
      ['Use for', 'APIs, one-off pages, anything unusual', 'REST-ish endpoints grouped by method', 'standard CRUD pages over a model'],
    ], verdict: 'Start with functions. Move to a <code>View</code> when GET/POST share setup, and to generic views when the page is textbook CRUD and you know their hooks (<code>get_queryset</code>, <code>form_valid</code>).', note: 'Ratings are judgement calls.' },
  ],
  gotchas: [
    { title: 'QuerySets are lazy, and re-evaluate', bad: `orders = Order.objects.filter(region="North")
if orders:                       # loads every row
    n = orders.count()           # second query
    first = orders[0]            # cached now, but only because the if evaluated it`, good: `orders = Order.objects.filter(region="North")
if orders.exists():              # SELECT 1 ... LIMIT 1
    first = orders.first()
rows = list(orders)              # evaluate once, then reuse the list`, why: 'Building a QuerySet costs nothing; each iteration, slice, <code>len()</code> or boolean test that has no cache runs SQL. Use <code>exists()</code>, <code>count()</code> and explicit lists deliberately, and read the query count with <code>django.db.connection.queries</code> or the debug toolbar.' },
    { title: 'N+1 queries through a foreign key', bad: `for o in Order.objects.all():
    print(o.product.name)        # one query per order`, good: `for o in Order.objects.select_related("product"):
    print(o.product.name)        # one JOIN
# reverse or many-to-many: Product.objects.prefetch_related("orders")`, why: 'Accessing a related object that was not loaded triggers a query. <code>select_related</code> joins forward FKs; <code>prefetch_related</code> batches reverse and many-to-many relations in a second query.' },
    { title: 'timezone.now() as a default is evaluated once', bad: `created = models.DateTimeField(default=timezone.now())   # the time the process started`, good: `created = models.DateTimeField(default=timezone.now)     # called per row
# or: auto_now_add=True (set once on create), auto_now=True (every save)`, why: 'A default is stored as a value if you call it and as a callable if you pass the function. The same trap applies to <code>default=[]</code> and <code>default={}</code> on JSONField: pass <code>list</code> or <code>dict</code>.' },
    { title: 'get() raises when zero or many rows match', bad: `product = Product.objects.get(name=name)   # DoesNotExist or MultipleObjectsReturned`, good: `product = get_object_or_404(Product, pk=pk)          # in a view: a proper 404
product = Product.objects.filter(name=name).first()   # None when missing`, why: '<code>get()</code> is for lookups that must be unique (a primary key, a unique field). For anything else, filter and pick, and let views turn missing rows into 404s rather than 500s.' },
  ],
  presets: [
    { title: 'One-file Django API', code: BOOT + `from django.http import JsonResponse
from django.test import Client

PRODUCTS = {101: "Kettle", 102: "Chef knife", 104: "Desk lamp"}

def products(request):
    q = request.GET.get("q", "").lower()
    return JsonResponse({"items": [{"id": k, "name": v} for k, v in PRODUCTS.items() if q in v.lower()]})

def product(request, pid):
    return JsonResponse({"id": pid, "name": PRODUCTS[pid]}) if pid in PRODUCTS else JsonResponse({"error": "not found"}, status=404)

urlpatterns = [path("products/", products), path("products/<int:pid>/", product)]

c = Client()
print(c.get("/products/?q=k").json())
print(c.get("/products/104/").json(), c.get("/products/9/").status_code)` },
  ],
};
