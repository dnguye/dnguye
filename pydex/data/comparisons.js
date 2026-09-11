// Cross-library comparisons. Ratings are 1–5 judgement calls, features are yes/no/partial.
// Where a comparison shows code, the "lines of code" bars are computed from those snippets.
export const COMPARISONS = [
  {
    id: 'dataframes', title: 'pandas vs polars vs numpy', lede: 'Three ways to hold a table of numbers in memory.', libs: ['pandas', 'polars', 'numpy'],
    columns: ['pandas', 'polars', 'numpy'],
    rows: [
      ['Column labels and mixed types', true, true, false],
      ['Index / row labels', true, false, false],
      ['Lazy execution with an optimizer', false, true, false],
      ['Uses all cores by default', false, true, { part: 'BLAS only' }],
      ['Bigger-than-RAM (streaming)', false, true, false],
      ['Ecosystem: plotting, ML, IO glue', { dots: 5 }, { dots: 3 }, { dots: 5 }],
      ['Speed on big group-bys and joins', { dots: 2 }, { dots: 5 }, { part: 'n/a' }],
      ['Learning curve', { dots: 3 }, { dots: 3 }, { dots: 2 }],
      ['Stack Overflow answers', { dots: 5 }, { dots: 2 }, { dots: 5 }],
    ],
    verdict: 'numpy for arrays, pandas when everything around you speaks pandas, polars when the data is large or the pipeline is long. Converting between them is one call, so mix.',
    snippets: [
      { title: 'pandas', packages: ['pandas'], code: `import pandas as pd
df = pd.read_csv("/data/orders.csv")
df["rev"] = df.quantity * df.unit_price
(df[df.status == "shipped"]
   .groupby("region")["rev"].sum()
   .sort_values(ascending=False))` },
      { title: 'polars', packages: ['polars'], code: `import polars as pl
(pl.read_csv("/data/orders.csv").lazy()   # scan_csv outside the browser
   .filter(pl.col("status") == "shipped")
   .with_columns(rev=pl.col("quantity") * pl.col("unit_price"))
   .group_by("region").agg(pl.col("rev").sum())
   .sort("rev", descending=True)
   .collect())` },
      { title: 'numpy', packages: ['numpy'], code: `import numpy as np
d = np.genfromtxt("/data/orders.csv", delimiter=",", names=True, dtype=None, encoding="utf-8")
d = d[d["status"] == "shipped"]
rev = d["quantity"] * d["unit_price"]
regions, idx = np.unique(d["region"], return_inverse=True)
totals = np.bincount(idx, weights=rev)
order = np.argsort(-totals)
list(zip(regions[order], totals[order].round(2)))` },
    ],
  },
  {
    id: 'http', title: 'requests vs httpx vs urllib', lede: 'Making HTTP calls: the classic, the modern, and the one already installed.', libs: ['requests', 'asyncio'],
    columns: ['requests', 'httpx', 'urllib.request', 'aiohttp'],
    rows: [
      ['In the standard library', false, false, true, false],
      ['Sync API', true, true, true, false],
      ['Async API', false, true, false, true],
      ['HTTP/2', false, { part: 'with h2' }, false, false],
      ['Connection pooling', true, true, false, true],
      ['Built-in retries', { part: 'via urllib3' }, { part: 'transport retries' }, false, false],
      ['Ergonomics', { dots: 5 }, { dots: 5 }, { dots: 2 }, { dots: 3 }],
      ['Server-side (test client) use', false, true, false, true],
    ],
    verdict: 'requests when the code is synchronous and you want the most familiar API. httpx when you need async, HTTP/2, or one client for sync and async. urllib only when adding a dependency is impossible.',
    snippets: [
      { title: 'requests', packages: ['requests'], code: `import requests
r = requests.get("https://api.pydex.local/products/101", timeout=5)
r.raise_for_status()
r.json()` },
      { title: 'httpx (sync)', packages: ['httpx'], code: `import httpx
r = httpx.get("https://api.pydex.local/products/101", timeout=5)
r.raise_for_status()
r.json()` },
      { title: 'httpx (async)', packages: ['httpx'], code: `import asyncio, httpx
async def main():
    async with httpx.AsyncClient(timeout=5) as c:
        r = await c.get("https://api.pydex.local/products/101")
        r.raise_for_status()
        return r.json()
asyncio.run(main())` },
    ],
  },
  {
    id: 'plotting', title: 'matplotlib vs seaborn vs plotly vs altair', lede: 'Static control, statistical defaults, or interactive output.', libs: ['matplotlib', 'pandas'],
    columns: ['matplotlib', 'seaborn', 'plotly', 'altair'],
    rows: [
      ['Output', 'static image', 'static image (matplotlib)', 'interactive HTML', 'interactive HTML (Vega)'],
      ['Works from a tidy DataFrame', { part: 'via pandas.plot' }, true, true, true],
      ['Fine control of every element', { dots: 5 }, { dots: 4 }, { dots: 3 }, { dots: 2 }],
      ['Lines of code for a good default', { dots: 2 }, { dots: 5 }, { dots: 4 }, { dots: 4 }],
      ['Statistical plots (regression, KDE, facets)', { dots: 2 }, { dots: 5 }, { dots: 3 }, { dots: 3 }],
      ['Dashboards', false, false, { part: 'Dash' }, { part: 'via Streamlit / Panel' }],
      ['Publication PDFs / SVG', true, true, { part: 'needs kaleido' }, { part: 'needs vl-convert' }],
    ],
    verdict: 'seaborn for exploring a DataFrame, matplotlib to finish the figure, plotly when the reader needs to hover and zoom.',
  },
  {
    id: 'testing', title: 'pytest vs unittest', lede: 'The third-party standard against the one in the standard library.', libs: ['pytest'],
    columns: ['pytest', 'unittest'],
    rows: [
      ['Test as a plain function', true, false],
      ['Plain assert with value introspection', true, { part: 'assertEqual etc.' }],
      ['Fixtures with dependency injection', true, { part: 'setUp / tearDown' }],
      ['Parametrize', true, { part: 'subTest' }],
      ['Plugins (coverage, parallel, asyncio, django)', { dots: 5 }, { dots: 2 }],
      ['Runs unittest-style classes', true, true],
      ['Zero dependencies', false, true],
    ],
    verdict: 'pytest, unless you cannot add a dependency. It runs your existing unittest classes, so migration can be gradual.',
    snippets: [
      { title: 'pytest', packages: ['pytest'], code: `import pytest, pathlib
import sys; sys.modules.pop("test_p", None)
pathlib.Path("/tmp/test_p.py").write_text('''
import pytest
@pytest.mark.parametrize("a,b,s", [(1, 2, 3), (2, 2, 4)])
def test_add(a, b, s):
    assert a + b == s
''')
pytest.main(["-q", "-p", "no:cacheprovider", "/tmp/test_p.py"])` },
      { title: 'unittest', packages: [], code: `import unittest

class AddTests(unittest.TestCase):
    def test_add(self):
        for a, b, s in [(1, 2, 3), (2, 2, 4)]:
            with self.subTest(a=a, b=b):
                self.assertEqual(a + b, s)

unittest.main(argv=["x"], exit=False, verbosity=1)` },
    ],
  },
  {
    id: 'models', title: 'pydantic vs dataclasses vs attrs vs TypedDict', lede: 'Four ways to give a record a shape.', libs: ['pydantic'],
    columns: ['pydantic', 'dataclasses', 'attrs', 'TypedDict'],
    rows: [
      ['In the standard library', false, true, false, true],
      ['Validates and coerces at runtime', true, false, { part: 'validators, no coercion' }, false],
      ['JSON in / out built in', true, false, false, false],
      ['JSON Schema generation', true, false, false, false],
      ['Instance creation cost', { dots: 2 }, { dots: 5 }, { dots: 5 }, { dots: 5 }],
      ['Static type checking', true, true, true, true],
      ['It is still a dict', false, false, false, true],
    ],
    verdict: 'dataclasses for internal structures, pydantic at the boundary where data is untrusted, TypedDict when you must keep a dict but want the checker to see its keys.',
    snippets: [
      { title: 'pydantic', packages: ['pydantic'], code: `from pydantic import BaseModel
class Point(BaseModel):
    x: int
    y: int = 0
Point.model_validate({"x": "3"})` },
      { title: 'dataclass', packages: [], code: `from dataclasses import dataclass
@dataclass
class Point:
    x: int
    y: int = 0
Point(x="3")     # no validation: x stays a str` },
      { title: 'TypedDict', packages: [], code: `from typing import TypedDict
class Point(TypedDict, total=False):
    x: int
    y: int
p: Point = {"x": "3"}   # only a type checker would complain
p` },
    ],
  },
  {
    id: 'web-frameworks', title: 'FastAPI vs Flask vs Django', lede: 'Typed async APIs, the minimal classic, or the batteries-included framework.', libs: ['fastapi', 'pydantic'],
    columns: ['FastAPI', 'Flask', 'Django'],
    rows: [
      ['Async-native', true, { part: 'since 2.0, limited' }, { part: 'views yes, ORM partly' }],
      ['Request validation from type hints', true, false, { part: 'via DRF serializers' }],
      ['OpenAPI docs generated', true, { part: 'extensions' }, { part: 'DRF + drf-spectacular' }],
      ['ORM included', false, false, true],
      ['Admin UI included', false, false, true],
      ['Auth, sessions, forms included', false, { part: 'extensions' }, true],
      ['Server-rendered HTML', { part: 'Jinja2 optional' }, true, true],
      ['Best fit', 'JSON APIs, ML serving', 'small sites and services', 'content sites, CRUD apps'],
    ],
    verdict: 'FastAPI for an API consumed by other programs. Django when you need the admin, auth and ORM on day one. Flask when the whole thing fits in one file and you want to pick every part yourself.',
  },
  {
    id: 'databases', title: 'SQLAlchemy vs Django ORM vs sqlite3', lede: 'How much the database layer should know about your objects.', libs: ['sqlalchemy'],
    columns: ['SQLAlchemy ORM', 'SQLAlchemy Core', 'Django ORM', 'sqlite3 / psycopg'],
    rows: [
      ['Framework independent', true, true, false, true],
      ['Object mapping and relationships', true, false, true, false],
      ['Composable query builder', { dots: 5 }, { dots: 5 }, { dots: 4 }, { dots: 1 }],
      ['Migrations', { part: 'Alembic' }, { part: 'Alembic' }, true, false],
      ['Async support', true, true, { part: 'partial' }, { part: 'driver-dependent' }],
      ['Raw SQL escape hatch', true, true, true, 'it is the SQL'],
    ],
    verdict: 'Inside Django, use its ORM. Everywhere else SQLAlchemy, with Core or <code>text()</code> for reports and bulk loads.',
  },
  {
    id: 'concurrency', title: 'asyncio vs threading vs multiprocessing', lede: 'Match the tool to what the program is waiting on.', libs: ['asyncio'],
    columns: ['asyncio', 'threading', 'multiprocessing'],
    rows: [
      ['Good for I/O-bound work', true, true, { part: 'overkill' }],
      ['Good for CPU-bound work', false, { part: 'only if the library releases the GIL' }, true],
      ['Needs async libraries', true, false, false],
      ['Memory per unit of concurrency', { dots: 5 }, { dots: 3 }, { dots: 1 }],
      ['Can share Python objects directly', true, true, false],
      ['Concurrency ceiling', 'tens of thousands', 'hundreds', 'number of cores'],
      ['Debuggability', { dots: 3 }, { dots: 2 }, { dots: 3 }],
    ],
    verdict: 'Waiting on the network: asyncio if the libraries are async, threads (or a ThreadPoolExecutor) if they are not. Crunching numbers: processes, or numpy which does the crunching in C.',
    snippets: [
      { title: 'asyncio', packages: [], code: `import asyncio, time
async def io(n): await asyncio.sleep(0.3); return n
async def main():
    t = time.perf_counter()
    r = await asyncio.gather(*(io(n) for n in range(5)))
    print(r, f"{time.perf_counter() - t:.2f}s")
asyncio.run(main())` },
      { title: 'threads', run: false, packages: [], code: `import time
from concurrent.futures import ThreadPoolExecutor
def io(n): time.sleep(0.3); return n
t = time.perf_counter()
with ThreadPoolExecutor(max_workers=5) as ex:
    r = list(ex.map(io, range(5)))
print(r, f"{time.perf_counter() - t:.2f}s")   # no threads in the browser` },
      { title: 'processes', run: false, packages: [], code: `from concurrent.futures import ProcessPoolExecutor
def cpu(n): return sum(i * i for i in range(n))
if __name__ == "__main__":
    with ProcessPoolExecutor() as ex:
        print(list(ex.map(cpu, [10**6] * 4)))   # no processes in the browser` },
    ],
  },
  {
    id: 'scraping', title: 'Beautiful Soup vs lxml vs Scrapy vs Playwright', lede: 'Parsing a page, parsing fast, crawling a site, or driving a browser.', libs: ['bs4', 'requests'],
    columns: ['Beautiful Soup', 'lxml', 'Scrapy', 'Playwright'],
    rows: [
      ['Fetches pages itself', false, false, true, true],
      ['Runs JavaScript', false, false, false, true],
      ['CSS selectors', true, { part: 'cssselect' }, true, true],
      ['XPath', false, true, true, true],
      ['Parsing speed', { dots: 3 }, { dots: 5 }, { dots: 5 }, { dots: 2 }],
      ['Crawling, throttling, pipelines', false, false, true, false],
      ['Setup effort', { dots: 5 }, { dots: 4 }, { dots: 2 }, { dots: 2 }],
    ],
    verdict: 'requests + Beautiful Soup for a page or two, Scrapy for a whole site, Playwright when the content only exists after JavaScript runs.',
  },
  {
    id: 'ml', title: 'scikit-learn vs XGBoost / LightGBM vs PyTorch', lede: 'Classic models, boosted trees, or neural networks.', libs: ['sklearn'],
    columns: ['scikit-learn', 'XGBoost / LightGBM', 'PyTorch'],
    rows: [
      ['Tabular data', { dots: 5 }, { dots: 5 }, { dots: 2 }],
      ['Images, audio, text', { dots: 1 }, { dots: 1 }, { dots: 5 }],
      ['GPU', false, true, true],
      ['Uses the fit / predict API', true, true, false],
      ['Explainability tooling', { dots: 4 }, { dots: 4 }, { dots: 2 }],
      ['Code to a first working model', { dots: 5 }, { dots: 4 }, { dots: 2 }],
    ],
    verdict: 'Start in scikit-learn. Swap in a gradient-boosting library for the last few points of accuracy on tables. Reach for PyTorch when the input is not a table.',
  },
];
