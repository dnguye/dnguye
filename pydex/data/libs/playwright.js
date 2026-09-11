import { scene } from '../../js/explainer.js';

const actionabilityExplainer = {
  hold: 3200,
  code: ['page.get_by_role("button", name="Save").click()', '# resolve → attached → visible → stable → enabled → receives events → click', '# each check retries until it passes or timeout (30 s) expires'],
  build() {
    const s = scene(760, 320);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 32, label, cls);
    s.text('h', 20, 24, 'actionability checks, run in order and retried together', 'lbl sm bold ink-2', undefined, 'start');
    box('k0', 20, 40, 110, 'resolve locator'); box('k1', 140, 40, 80, 'attached'); box('k2', 230, 40, 70, 'visible'); box('k3', 310, 40, 70, 'stable'); box('k4', 390, 40, 80, 'enabled'); box('k5', 480, 40, 120, 'receives events'); box('k6', 610, 40, 130, 'mouse click', 'cell ok');
    s.arrow('e0', 132, 56, 138, 56); s.arrow('e1', 222, 56, 228, 56); s.arrow('e2', 302, 56, 308, 56); s.arrow('e3', 382, 56, 388, 56); s.arrow('e4', 472, 56, 478, 56); s.arrow('e5', 602, 56, 608, 56);
    // retry loop
    s.path('retry', 'M430 74 L430 100 L75 100 L75 76', 'arrow ghost hid');
    s.text('rt', 250, 92, '', 'lbl sm ink-2');
    // DOM
    s.text('dh', 20, 130, 'the page', 'lbl sm bold ink-2', undefined, 'start');
    s.rect('dom', 20, 142, 400, 96, 'panel', undefined, 8);
    box('btn', 40, 160, 240, '<button disabled>Save</button>', 'cell hid');
    box('overlay', 40, 200, 240, 'div.modal-backdrop (covers it)', 'cell err hid');
    s.text('log', 20, 262, '', 'lbl sm ink-2', undefined, 'start');
    box('timeout', 440, 160, 300, 'TimeoutError: element is not enabled', 'cell err hid');
    box('force', 440, 200, 300, 'force=True skips every check', 'cell ghost hid');
    s.text('res', 20, 292, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'One call, a whole checklist', caption: 'click() is not a raw mouse event. Before dispatching anything, Playwright runs a list of actionability checks and keeps retrying them until all pass in the same attempt or the timeout expires. This is why you rarely write explicit waits.', lines: [0, 1],
      patch: { 'k0.r': { cls: 'cell hot' } } },
    { title: 'Resolve the locator (strict)', caption: 'The locator is a query, not an element handle: it is re-evaluated on every retry, so a re-rendered button is fine. It must match exactly one element; two matches raise a strict mode violation instead of clicking the first.', lines: [0],
      patch: { btn: { cls: '' }, 'btn.r': { cls: 'cell hot' }, log: { text: 'waiting for get_by_role("button", name="Save") → resolved to 1 element' } } },
    { title: 'Attached, visible, stable', caption: 'Attached: in the DOM. Visible: non-empty bounding box, not visibility:hidden. Stable: the same bounding box on two consecutive animation frames, so CSS transitions and slide-ins finish first. The element is scrolled into view along the way.', lines: [1],
      patch: { 'k0.r': { cls: 'cell ok' }, 'k1.r': { cls: 'cell ok' }, 'k2.r': { cls: 'cell ok' }, 'k3.r': { cls: 'cell ok' }, 'btn.r': { cls: 'cell' } } },
    { title: 'Enabled fails, so the whole loop retries', caption: 'The button is disabled while the form validates. Playwright logs the failed check and retries the entire sequence every few hundred milliseconds. No exception yet: the clock is the 30 s action timeout (configurable per call or via set_default_timeout).', lines: [2],
      patch: { 'k4.r': { cls: 'cell err' }, retry: { cls: 'arrow ghost' }, rt: { text: 'retry: 20 ms, 100 ms, 100 ms, 500 ms…' }, log: { text: '  element is not enabled — waiting…' } } },
    { title: 'The page changes; the next attempt passes', caption: 'Validation finishes and the app removes disabled. The retry resolves the locator afresh and now enabled passes. "Receives events" then checks that a hit test at the click point returns this element and not, say, a modal backdrop covering it.', lines: [1],
      patch: { 'btn.t': { text: '<button>Save</button>' }, 'btn.r': { cls: 'cell ok' }, 'k4.r': { cls: 'cell ok' }, 'k5.r': { cls: 'cell ok' }, retry: { cls: 'arrow ghost hid' }, rt: { text: '' }, overlay: { cls: '' }, 'overlay.r': { cls: 'cell ghost' }, 'overlay.t': { text: 'no overlay at the click point' }, log: { text: '  element is enabled, hit target is the button → performing click' } } },
    { title: 'Then the click, or a TimeoutError', caption: 'Only now does the mouse move to the element centre and press. If the checks never all pass, click() raises TimeoutError whose message lists what it was waiting for. force=True skips the checks; expect() runs the same retry loop for assertions.', lines: [2],
      patch: { 'k6.r': { cls: 'cell hot' }, timeout: { cls: '' }, force: { cls: '' }, res: { text: 'a navigation triggered by the click is awaited too (no wait_for_navigation needed)' } } },
  ],
};

export default {
  id: 'playwright', name: 'Playwright', glyph: 'pw', group: 'automation', version: '1.62', keywords: 'browser automation e2e end-to-end test chromium firefox webkit scraping locator selenium',
  tagline: 'Drive real browsers: end-to-end tests, scraping, screenshots.',
  install: 'pip install pytest-playwright && playwright install chromium', docs: 'https://playwright.dev/python/', packages: [], runnable: false,
  overview: {
    what: 'Playwright launches Chromium, Firefox or WebKit and drives them through one API. Locators describe elements the way a user sees them (role, label, text), every action waits until the element is ready, and expect() assertions retry until they pass. Browser contexts give each test an isolated profile in milliseconds. It has sync and async flavours, a pytest plugin, request interception, tracing and a code generator.',
    yes: ['End-to-end tests of web apps, in CI, across three engines.', 'Scraping pages that render with JavaScript.', 'Screenshots, PDFs and visual checks of pages.', 'Automating a web workflow that has no API.'],
    no: ['The site has a JSON API: call it with httpx or requests instead.', 'Static HTML that never runs JavaScript (requests + BeautifulSoup is lighter).', 'Testing a single component in isolation (a unit test or a component-testing tool).'],
    note: 'Playwright needs a browser binary and a driver subprocess, so these snippets cannot run in the browser sandbox. Locally: <code>pip install pytest-playwright</code>, <code>playwright install chromium</code>, then run a snippet as a script or with <code>pytest</code>.',
  },
  cheatsheet: [
    { id: 'launch', title: 'Launch, context, page', blurb: 'Browser → BrowserContext (an isolated profile) → Page (a tab). Contexts are cheap; browsers are not.', snippets: [
      { title: 'Sync API script', code: `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)        # or p.firefox / p.webkit
    context = browser.new_context(viewport={"width": 1280, "height": 800}, locale="en-GB")
    page = context.new_page()
    page.goto("https://example.com", wait_until="domcontentloaded")
    print(page.title())
    print(page.locator("h1").inner_text())
    context.close()
    browser.close()`, note: 'One browser per process, one context per test or per user session, one page per tab. <code>headless=False, slow_mo=200</code> lets you watch it.' },
      { title: 'Async API', code: `import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://example.com")
        print(await page.title())
        # several pages in parallel: one context each keeps cookies separate
        contexts = [await browser.new_context() for _ in range(3)]
        pages = [await c.new_page() for c in contexts]
        await asyncio.gather(*(pg.goto(f"https://example.com/?n={i}") for i, pg in enumerate(pages)))
        await browser.close()

asyncio.run(main())`, note: 'Same method names, every call awaited. Use this inside asyncio apps and notebooks; the sync API refuses to run in a running event loop.' },
      { title: 'Context options: auth state, devices, permissions', code: `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    iphone = p.devices["iPhone 15"]                       # viewport, UA, touch, scale
    context = browser.new_context(
        **iphone,
        geolocation={"latitude": 51.5, "longitude": -0.12}, permissions=["geolocation"],
        color_scheme="dark", timezone_id="Europe/London",
        record_video_dir="videos/",
    )
    page = context.new_page()
    page.goto("https://example.com/login")
    page.get_by_label("Email").fill("ann@example.com")
    page.get_by_label("Password").fill("secret")
    page.get_by_role("button", name="Sign in").click()
    context.storage_state(path="auth.json")               # cookies + localStorage, reuse later:
    logged_in = browser.new_context(storage_state="auth.json")`, note: 'Log in once, save <code>storage_state</code>, and start every other test from it. <code>browser.new_context</code> takes ~10 ms; a login flow takes seconds.' },
    ] },
    { id: 'locators', title: 'Locators', blurb: 'A locator is a lazy query. It resolves when an action or assertion needs it, and again on every retry.', snippets: [
      { title: 'User-facing locators', code: `page.get_by_role("button", name="Add to cart")          # accessible role + name (preferred)
page.get_by_role("heading", level=2, name="Orders")
page.get_by_label("Email address")                       # <label> text or aria-label
page.get_by_placeholder("Search products")
page.get_by_text("Out of stock", exact=True)             # visible text; substring unless exact
page.get_by_alt_text("Kettle, stainless steel")
page.get_by_title("Close")
page.get_by_test_id("checkout-total")                    # data-testid by default

page.locator("css=nav >> text=Orders")                   # CSS / XPath when nothing else fits
page.locator("xpath=//table[@id='orders']//tr[2]")`, note: 'Role and label locators survive markup changes and double as an accessibility check. Configure the test-id attribute with <code>selectors.set_test_id_attribute("data-qa")</code>.' },
      { title: 'Filter, chain, count, iterate', code: `rows = page.get_by_role("row")
rows.filter(has_text="Kettle").get_by_role("button", name="Remove").click()
rows.filter(has=page.get_by_role("cell", name="returned")).count()
page.locator("article").filter(has_not_text="Sold out").first.click()

product = page.locator(".product", has_text="Lamp")      # scope further queries to it
product.get_by_role("link").click()
page.get_by_role("listitem").nth(2).hover()
page.get_by_role("button", name="Save").or_(page.get_by_role("button", name="Update")).click()
page.get_by_role("checkbox").and_(page.locator("[data-required]")).check()

for item in page.get_by_role("listitem").all():         # snapshot of the current matches
    print(item.inner_text())
print(page.get_by_role("link").all_inner_texts())`, note: '<code>.all()</code> and <code>.count()</code> do not wait; use them after an assertion has established the list is populated.' },
    ] },
    { id: 'actions', title: 'Actions and waiting', snippets: [
      { title: 'Click, fill, select, check, upload, keys', code: `page.get_by_label("Name").fill("Ann")                     # clears, then types
page.get_by_label("Comment").press_sequentially("slow", delay=50)   # key by key, for autocomplete
page.get_by_label("Region").select_option("North")        # by value or label
page.get_by_label("Region").select_option(["North", "South"])       # <select multiple>
page.get_by_label("Gift wrap").check()
page.get_by_role("radio", name="Express").check()
page.get_by_role("button", name="Save").click()
page.get_by_role("button", name="More").click(button="right", modifiers=["Shift"])
page.get_by_role("button", name="Tiny").dblclick(position={"x": 2, "y": 2})
page.get_by_label("Upload").set_input_files(["report.csv", "notes.txt"])
page.locator("#drop").drag_to(page.locator("#target"))
page.keyboard.press("Control+Enter")
page.get_by_role("button", name="Delete").click(force=True)   # skip actionability checks (rarely right)`, note: 'Every action auto-waits: attached, visible, stable, enabled, receives events. Pass <code>timeout=5000</code> to shorten the 30 s default for one call.' },
      { title: 'Waiting the right way', code: `from playwright.sync_api import expect

page.goto("https://example.com/orders", wait_until="networkidle")   # load | domcontentloaded | networkidle
page.get_by_role("button", name="Refresh").click()

expect(page.get_by_role("row")).to_have_count(12)             # retries up to the expect timeout
page.get_by_text("Loaded 12 orders").wait_for(state="visible")
page.get_by_text("Loading…").wait_for(state="hidden")

with page.expect_response(lambda r: "/api/orders" in r.url and r.status == 200) as resp:
    page.get_by_role("button", name="Refresh").click()
print(resp.value.json()["total"])

with page.expect_popup() as popup:                            # a new tab
    page.get_by_role("link", name="Invoice").click()
popup.value.wait_for_load_state()
page.wait_for_function("() => window.dataLoaded === true")
page.set_default_timeout(10_000)                              # for actions on this page`, note: 'Prefer a condition (an assertion, a response, a URL) over <code>wait_for_timeout(ms)</code>, which sleeps blindly and makes tests both slow and flaky.' },
    ] },
    { id: 'assert', title: 'Assertions', snippets: [
      { title: 'expect() on locators and pages', code: `from playwright.sync_api import expect
import re

expect(page).to_have_title(re.compile(r"Orders"))
expect(page).to_have_url("https://example.com/orders?page=2")

total = page.get_by_test_id("checkout-total")
expect(total).to_be_visible()
expect(total).to_have_text("$120.00")                 # full text, whitespace-normalised
expect(total).to_contain_text("120")
expect(page.get_by_role("button", name="Pay")).to_be_enabled()
expect(page.get_by_label("Gift wrap")).to_be_checked()
expect(page.get_by_label("Email")).to_have_value("ann@example.com")
expect(page.get_by_role("row")).to_have_count(12)
expect(page.locator(".badge")).to_have_class(re.compile(r"\\bactive\\b"))
expect(page.get_by_role("alert")).to_have_attribute("aria-live", "polite")
expect(page.get_by_text("Error")).not_to_be_visible()
expect(page.get_by_role("main")).to_have_screenshot("orders.png", max_diff_pixel_ratio=0.01)

expect.set_options(timeout=10_000)                     # default is 5 s per assertion`, note: 'These retry until they pass or the expect timeout expires; a plain <code>assert loc.text_content() == ...</code> checks once and races the page.' },
      { title: 'Soft assertions and a11y snapshot', code: `from playwright.sync_api import expect

# soft: record failures, keep going, fail the test at the end
expect.soft(page.get_by_role("heading", level=1)).to_have_text("Orders")
expect.soft(page.get_by_role("status")).to_contain_text("12 results")

# the accessibility tree as YAML: one assertion for a whole region
expect(page.get_by_role("navigation")).to_match_aria_snapshot("""
  - navigation:
    - link "Orders"
    - link "Products"
    - button "Account"
""")

# the same tree, for exploring what roles/names your page exposes
print(page.get_by_role("main").aria_snapshot())`, note: 'Aria snapshots are what the code generator and the trace viewer show; they document what a screen reader sees and fail loudly when structure changes.' },
    ] },
    { id: 'network', title: 'Network', snippets: [
      { title: 'Mock, modify and block requests', code: `import json

# mock an API the page calls
page.route("**/api/orders*", lambda route: route.fulfill(
    status=200, content_type="application/json",
    body=json.dumps({"total": 1, "items": [{"order_id": 1, "status": "shipped"}]}),
))

# modify a real response
def add_flag(route):
    response = route.fetch()
    data = response.json(); data["feature_x"] = True
    route.fulfill(response=response, json=data)
page.route("**/api/config", add_flag)

# block noise
page.route("**/*.{png,jpg,woff2}", lambda route: route.abort())
page.route("**/analytics/**", lambda route: route.abort())

page.goto("https://example.com/orders")
page.unroute("**/api/orders*")
# also: page.on("request", print), page.on("response", lambda r: print(r.status, r.url))`, note: 'Routes match in reverse registration order; the last <code>page.route</code> wins. <code>route.continue_(headers={...})</code> forwards with changes. Set routes before <code>goto</code>.' },
      { title: 'API calls without a page', code: `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    api = p.request.new_context(base_url="https://api.example.com",
                                extra_http_headers={"Authorization": "Bearer token"})
    r = api.post("/orders", data={"product_id": 101, "qty": 2})
    assert r.ok, r.status
    order = r.json()
    r2 = api.get(f"/orders/{order['id']}")
    print(r2.status, r2.json()["status"])
    api.dispose()

# inside a page test, share the page's cookies:
#   page.request.get("/api/me").json()`, note: 'Useful for seeding data before a UI test and for cleaning up after it, with the same cookie jar the browser context uses.' },
    ] },
    { id: 'artifacts', title: 'Screenshots, PDF, tracing', snippets: [
      { title: 'Capture what happened', code: `page.screenshot(path="page.png")                              # viewport
page.screenshot(path="full.png", full_page=True)
page.get_by_role("table").screenshot(path="table.png")         # one element
png_bytes = page.screenshot(type="png", clip={"x": 0, "y": 0, "width": 400, "height": 300})

page.emulate_media(media="print")
page.pdf(path="orders.pdf", format="A4", print_background=True)   # Chromium only

context.tracing.start(screenshots=True, snapshots=True, sources=True)
page.goto("https://example.com/orders")
page.get_by_role("button", name="Export").click()
context.tracing.stop(path="trace.zip")     # open with: playwright show-trace trace.zip

page.on("console", lambda msg: print("browser console:", msg.type, msg.text))
page.on("pageerror", lambda err: print("uncaught:", err))`, note: 'A trace has DOM snapshots, network, console and a timeline for every action. With pytest-playwright, <code>--tracing retain-on-failure</code> records it only for failing tests.' },
    ] },
    { id: 'pytest', title: 'pytest-playwright and tooling', snippets: [
      { title: 'Fixtures and a first test', code: `# test_orders.py — pytest-playwright provides page, context, browser, browser_name...
import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {**browser_context_args, "viewport": {"width": 1280, "height": 800}, "storage_state": "auth.json"}

def test_filter_orders(page: Page):
    page.goto("/orders")                       # relative to --base-url
    page.get_by_label("Region").select_option("North")
    page.get_by_role("button", name="Apply").click()
    expect(page.get_by_role("row")).to_have_count(6)
    expect(page.get_by_role("cell", name="South")).to_have_count(0)

@pytest.mark.only_browser("chromium")
def test_pdf_export(page: Page):
    page.goto("/orders")
    page.pdf(path="orders.pdf")

# pytest --base-url http://localhost:8000 --browser chromium --browser webkit --headed --tracing retain-on-failure -n 4`, note: 'Each test gets a fresh context and page. <code>--screenshot only-on-failure --video retain-on-failure</code> keep artefacts; <code>-n</code> needs pytest-xdist.' },
      { title: 'Codegen and the CLI', code: `# generate code by clicking through a site (choose Python sync/async, pytest)
playwright codegen https://example.com --target python-pytest -o test_flow.py
playwright codegen --device "iPhone 15" --save-storage auth.json https://example.com

# browsers
playwright install                 # all three engines
playwright install chromium --with-deps   # plus OS libraries, for CI images
playwright install-deps

# inspect
playwright show-trace trace.zip
PWDEBUG=1 pytest test_orders.py    # opens the Inspector, steps through actions
playwright screenshot --full-page https://example.com shot.png
playwright pdf https://example.com page.pdf`, note: 'Pin the same Playwright version in CI as locally; browser builds are tied to the package version, so <code>playwright install</code> must run after every upgrade.' },
    ] },
  ],
  concepts: [
    { id: 'actionability', title: 'What happens before a click', intro: 'Auto-waiting is the reason Playwright tests rarely need sleeps. Here is the checklist every action runs, how it retries, and where the timeout comes from.', explainer: actionabilityExplainer },
  ],
  compare: [
    { title: 'Locator strategies', columns: ['get_by_role', 'get_by_label / text', 'get_by_test_id', 'CSS / XPath'], rows: [
      ['Reads like the user', { dots: 5 }, { dots: 4 }, { dots: 2 }, { dots: 1 }],
      ['Survives markup refactors', { dots: 5 }, { dots: 4 }, { dots: 5 }, { dots: 1 }],
      ['Needs code changes in the app', false, false, true, false],
      ['Checks accessibility as a side effect', true, { part: 'labels only' }, false, false],
      ['Handles duplicates', 'name= / exact=', 'exact=', 'unique ids', 'nth() / :has()'],
    ], verdict: 'Roles first, labels and text next, test ids for things with no semantic handle, CSS only for scraping markup you do not control. Ratings are judgement calls.' },
    { title: 'Ways to wait', columns: ['expect(locator)', 'locator.wait_for()', 'expect_response / expect_popup', 'wait_for_load_state', 'wait_for_timeout'], rows: [
      ['Waits for', 'an assertion to hold', 'attached / visible / hidden / detached', 'a network or page event', 'load | domcontentloaded | networkidle', 'nothing, a fixed time'],
      ['Retries', true, true, { part: 'until timeout' }, { part: 'once' }, false],
      ['Fails fast when wrong', true, true, true, { part: 'networkidle can hang' }, false],
      ['Use it', 'by default', 'for elements you will not act on', 'around the click that triggers it', 'after goto when needed', 'only while debugging'],
    ] },
  ],
  gotchas: [
    { title: 'Sleeping instead of waiting', bad: `page.get_by_role("button", name="Refresh").click()
page.wait_for_timeout(2000)              # hope the table has loaded
assert page.get_by_role("row").count() == 12`, good: `page.get_by_role("button", name="Refresh").click()
expect(page.get_by_role("row")).to_have_count(12)   # retries until true or 5 s`, why: 'A fixed sleep is too long on a fast machine and too short on a slow CI runner. Assertions and actions already retry; give them a condition to wait for.' },
    { title: 'A locator that matches several elements refuses to act', bad: `page.get_by_role("button", name="Delete").click()
# Error: strict mode violation: resolved to 3 elements`, good: `page.get_by_role("row").filter(has_text="Kettle").get_by_role("button", name="Delete").click()
# or, when position really is the point:
page.get_by_role("button", name="Delete").first.click()`, why: 'Strict mode stops an action from silently hitting the wrong element. Narrow the locator with a parent, a filter or an exact name before reaching for <code>.first</code> or <code>.nth()</code>.' },
    { title: 'The sync API inside an event loop', bad: `# in Jupyter, FastAPI, or any asyncio code
with sync_playwright() as p:      # Error: It looks like you are using
    ...                            # Playwright Sync API inside the asyncio loop`, good: `from playwright.async_api import async_playwright
async with async_playwright() as p:
    browser = await p.chromium.launch()
    ...`, why: 'The sync API runs its own event loop and cannot nest inside a running one. Where a loop already exists, the async API is the only option.' },
    { title: 'Reading a value once, then asserting on it', bad: `text = page.get_by_test_id("total").text_content()
assert text == "$120.00"    # ran before the total updated`, good: `expect(page.get_by_test_id("total")).to_have_text("$120.00")`, why: '<code>text_content()</code>, <code>count()</code> and <code>is_visible()</code> return immediately. <code>expect</code> re-reads until the value matches, which is what a test almost always means.' },
  ],
};
