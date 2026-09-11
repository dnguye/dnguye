# Pydex — an interactive reference for the Python libraries you actually use

Cheat sheets you can run, the hard ideas animated step by step, comparison
tables with a verdict, and a sandbox with mock data. Everything runs in the
browser: real CPython via [Pyodide](https://pyodide.org), no server, no build
step, no account.

## What's inside

| Category | Libraries |
|---|---|
| Python essentials | pathlib, datetime, collections, itertools, json, re, asyncio |
| HTTP and APIs | requests, httpx, aiohttp, FastAPI, Flask, Django |
| Data work | numpy, pandas, polars, matplotlib, seaborn, plotly |
| Validation and models | pydantic, dataclasses, attrs |
| Databases | SQLAlchemy, psycopg, sqlite3, redis |
| Testing and quality | pytest, hypothesis, ruff, mypy |
| Automation | typer, click, rich, Beautiful Soup, Playwright |
| AI and ML | scikit-learn, PyTorch, transformers, LangChain |
| Cloud and integrations | boto3, google-cloud-*, Celery |

42 libraries, 531 snippets, 51 animated explainers. The eleven that need a
server, a GPU, cloud credentials or a real browser (aiohttp, psycopg, ruff,
mypy, Playwright, PyTorch, transformers, LangChain, boto3, google-cloud,
Celery) are copy-only; every snippet on the other 31 pages runs in the
browser and is checked by the test harness.

Every library page has the same five parts: **Overview** (reach for it when /
look elsewhere when), **Cheat sheet** (snippets with Run · Copy · Open in
sandbox), **Concepts, animated** (play / pause / step / scrub, keyboard
friendly, honours `prefers-reduced-motion`), **Compare** (tables inside the
library plus links to the cross-library page), and **Gotchas** (surprising →
do this → why).

The **Compare** page holds twenty-three cross-library matrices (pandas vs polars vs
numpy, requests vs httpx vs urllib, argparse vs click vs typer, Celery vs RQ vs
Dramatiq vs arq, …). Ratings are 1–5 judgement calls, features are yes / no / partial;
where code is shown, the "lines" bars are counted from the snippets on the
page, not invented.

The **Sandbox** is a notebook-style editor. Mounted at `/data`:

- `orders.csv` (240 rows), `employees.csv`, `products.json`, `page.html`
- `shop.sqlite` — three tables built from the files above at start
- `https://api.pydex.local/…` — a mock HTTP API served from the same data for
  `requests` and `httpx` (`/products`, `/orders?region=`, `/employees`,
  `/echo`, `/status/{code}`). Any other host raises a `ConnectionError` on
  purpose.

## Run it

```bash
cd pydex
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` from disk does not work (module scripts and the worker
need `http://`). Deploy the folder as-is to GitHub Pages, Netlify, or any
static host. Pyodide (~10 MB, cached by the browser) and packages are fetched
from jsdelivr on first Run; to self-host them, set
`localStorage.setItem('pydex.pyodide', 'https://your.host/pyodide/v0.27.7/full/')`.

## Browser notes

- pandas takes a few seconds to load the first time; later runs are instant.
- `asyncio.run(main())` is rewritten to `await main()` because the page already
  runs inside an event loop.
- There are no threads: FastAPI "sync" endpoints and background tasks run
  inline, and the `TestClient` snippet is copy-only (the others call the app
  through `httpx.ASGITransport`). Flask uses `app.test_client()`, Django uses
  `settings.configure()` + `django.test.Client`, click and typer use
  `CliRunner`. Pure-Python packages (FastAPI, Flask, Django, typer, seaborn,
  plotly, hypothesis, redis + fakeredis) are installed from PyPI with micropip
  on first use.
- `redis.Redis(...)` is transparently an in-memory fakeredis, so the redis
  page reads like real code and still runs.
- rich output keeps its colours (ANSI is rendered), and a plotly figure that is
  the last expression renders as an interactive chart.
- `polars.scan_csv` is slow in the wasm build, so runnable snippets use
  `read_csv(...).lazy()` and say so.
- `zoneinfo` has no time-zone database in Pyodide, so the `datetime` snippets
  that use `ZoneInfo` load the `tzdata` package.
- typer needs a newer rich than Pyodide bundles, so both pages install
  `rich>=13.8` from PyPI.

## Structure

```
index.html            shell
css/pydex.css         tokens (light + dark) and components
js/app.js             hash router, library rail, ⌘K search, theme
js/pages.js           home / library / compare / sandbox renderers
js/highlight.js       small Python tokenizer → spans (no dependency)
js/explainer.js       step-through animation engine (scene + cumulative patches)
js/compare.js         matrix and bar renderers
js/sandbox.js         Pyodide client, output rendering, sandbox hand-off
js/sandbox-worker.js  Pyodide worker: mounts /data, builds sqlite, mocks HTTP, runs code
data/libs/*.js        one module per library: overview, cheat sheet, concepts, compare, gotchas, presets
data/comparisons.js   cross-library matrices
data/mock/            committed datasets (regenerate with tools/make-mock-data.py)
PLAN.md               the plan this was built from
```

### Adding a library

Create `data/libs/<id>.js` exporting the same shape as the others (see
`pandas.js`), add it to `data/libs/index.js`, and give it one of the nine
group ids. Snippets list the Pyodide packages they need in `packages`
(`pip:<name>` installs a pure-Python wheel from PyPI; `pip:<name>>=<version>`
pins it). Set `runnable: false` on a library whose code cannot execute in the
browser, or `run: false` on one snippet. An explainer is a `build()` that
draws a scene with the helpers in `js/explainer.js` and a list of steps whose
`patch` objects describe what changes; CSS transitions do the animation.

## Design

Cool slate ground, ink text, one amber accent (Python's yellow, matured).
Bricolage Grotesque for headings, Source Sans 3 for body, JetBrains Mono for
code. Both themes are designed, not inverted; contrast is 4.5:1 or better on
both. Keyboard: `⌘K` / `/` search, `← →` step an explainer, `⌘↵` run in the
sandbox.
