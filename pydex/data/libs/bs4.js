import { scene } from '../../js/explainer.js';

const treeExplainer = {
  hold: 3000,
  code: ['soup.find("li")', 'soup.find_all("li")', 'soup.select("li.sale > a")', 'tag.parent, tag.find_next_sibling()'],
  build() {
    const s = scene(760, 320);
    const node = (id, x, y, label, w = 90) => s.cell(id, x - w / 2, y, w, 30, label);
    const edge = (id, x1, y1, x2, y2) => { const l = s.line(id, x1, y1 + 30, x2, y2, 'arrow'); l.style.markerEnd = 'none'; return l; };
    node('html', 380, 16, '<html>');
    node('body', 380, 66, '<body>');
    node('nav', 200, 116, '<nav>'); node('main', 380, 116, '<main>'); node('footer', 560, 116, '<footer>');
    node('h1', 280, 166, '<h1>'); node('ul', 380, 166, '<ul class=products>', 150); node('table', 520, 166, '<table>');
    node('li1', 250, 216, '<li class=product>', 120); node('li2', 380, 216, '<li class="product sale">', 150); node('li3', 520, 216, '<li class=product>', 120);
    node('a1', 250, 266, '<a>'); node('a2', 350, 266, '<a>'); node('sp2', 430, 266, '<span.price>', 80); node('a3', 520, 266, '<a>');
    edge('e1', 380, 16, 380, 66); edge('e2', 380, 66, 200, 116); edge('e3', 380, 66, 380, 116); edge('e4', 380, 66, 560, 116);
    edge('e5', 380, 116, 280, 166); edge('e6', 380, 116, 380, 166); edge('e7', 380, 116, 520, 166);
    edge('e8', 380, 166, 250, 216); edge('e9', 380, 166, 380, 216); edge('e10', 380, 166, 520, 216);
    edge('e11', 250, 216, 250, 266); edge('e12', 380, 216, 350, 266); edge('e13', 380, 216, 430, 266); edge('e14', 520, 216, 520, 266);
    s.text('cap', 20, 306, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'HTML becomes a tree', caption: 'BeautifulSoup parses the document into nested Tag objects. Every search starts from a node and looks downward into its descendants.', lines: [] },
    { title: 'find() returns the first match', caption: 'Depth-first, document order. The first <li> it meets wins, and you get a single Tag (or None).', lines: [0],
      patch: { 'li1.r': { cls: 'cell hot' }, cap: { text: 'soup.find("li") → one Tag' } } },
    { title: 'find_all() returns every match', caption: 'A list of Tags, still in document order. Filter with attrs={"class": "sale"} or class_="sale".', lines: [1],
      patch: { 'li2.r': { cls: 'cell hot' }, 'li3.r': { cls: 'cell hot' }, cap: { text: 'soup.find_all("li") → [Tag, Tag, Tag]' } } },
    { title: 'select() uses CSS selectors', caption: '"li.sale > a" means: an <a> whose direct parent is an <li> with class sale. One selector replaces several nested find calls.', lines: [2],
      patch: { 'li1.r': { cls: 'cell' }, 'li3.r': { cls: 'cell' }, 'li2.r': { cls: 'cell info' }, 'a2.r': { cls: 'cell hot' }, cap: { text: 'soup.select("li.sale > a") → [<a>]' } } },
    { title: 'Navigate from any tag', caption: '.parent walks up, .find_next_sibling() walks sideways, .children walks down. Text nodes (whitespace included) are siblings too, so prefer the find_* forms.', lines: [3],
      patch: { 'a2.r': { cls: 'cell' }, 'li2.r': { cls: 'cell hot' }, 'ul.r': { cls: 'cell info' }, 'li3.r': { cls: 'cell ok' }, cap: { text: 'li.parent → <ul>;  li.find_next_sibling("li") → next <li>' } } },
  ],
};

export default {
  id: 'bs4', name: 'beautifulsoup4', glyph: 'bs', group: 'web', version: '4.12', keywords: 'html parse scrape scraping css selector xml',
  tagline: 'Pull data out of HTML: find, select, navigate, extract.',
  install: 'pip install beautifulsoup4', docs: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/', packages: ['beautifulsoup4'],
  overview: {
    what: 'Beautiful Soup turns messy HTML into a tree you can search with tag names, attributes or CSS selectors. It does not fetch pages (pair it with requests) and it does not run JavaScript (pair it with a browser tool if the content is rendered client-side). It forgives broken markup.',
    yes: ['Extracting tables, links, prices, text from server-rendered pages.', 'Cleaning or rewriting HTML fragments.', 'Small scrapers and one-off data pulls.'],
    no: ['The page builds its content in JavaScript (Playwright).', 'You need XPath or maximum speed on huge documents (lxml directly).', 'Large crawls with scheduling and politeness (Scrapy).'],
    note: 'The sandbox has a sample catalogue page at <code>/data/page.html</code>. The snippets read it from disk instead of fetching.',
  },
  cheatsheet: [
    { id: 'parse', title: 'Parse and search', snippets: [
      { title: 'find and find_all', code: `from bs4 import BeautifulSoup

html = open("/data/page.html").read()
soup = BeautifulSoup(html, "html.parser")

print(soup.title.string)
first = soup.find("li", class_="product")
print(first.a.get_text(), first["data-id"])
sale = soup.find_all("li", class_="sale")
print(len(sale), "sale items:", [li.a.text for li in sale])`, note: '<code>class_</code> has the underscore because <code>class</code> is a Python keyword. Any other attribute is a plain keyword: <code>find("li", data_id="3")</code> does not work; use <code>attrs={"data-id": "3"}</code>.' },
      { title: 'CSS selectors with select', code: `from bs4 import BeautifulSoup
soup = BeautifulSoup(open("/data/page.html").read(), "html.parser")

names = [a.text for a in soup.select("ul.products > li > a")]
prices = [s.text for s in soup.select("li.sale .price")]
print(names[:4])
print(prices)
print(soup.select_one("footer a[href^='mailto:']")["href"])
print(soup.select("#stock tr")[1].get_text(" ", strip=True))`, note: '<code>select</code> returns a list; <code>select_one</code> returns the first match or None. Attribute selectors like <code>[href^="mailto:"]</code> work.' },
    ] },
    { id: 'extract', title: 'Extract text and attributes', snippets: [
      { title: 'Text, attributes, and links', code: `from bs4 import BeautifulSoup
soup = BeautifulSoup(open("/data/page.html").read(), "html.parser")

for li in soup.select("li.product")[:3]:
    name = li.a.get_text(strip=True)
    href = li.a["href"]                   # KeyError if missing; use .get("href")
    price = float(li.select_one(".price").text.lstrip("$"))
    cats = li.find("span", class_="cat").text
    print(f"{li['data-id']:>3}  {name:<20} {price:>7.2f}  {cats}  {href}")
print([a.get("href") for a in soup.nav.find_all("a")])` },
      { title: 'A table into rows of dicts', code: `from bs4 import BeautifulSoup
soup = BeautifulSoup(open("/data/page.html").read(), "html.parser")

table = soup.find("table", id="stock")
headers = [th.get_text(strip=True) for th in table.find_all("th")]
rows = []
for tr in table.find_all("tr")[1:]:
    cells = [td.get_text(strip=True) for td in tr.find_all("td")]
    rows.append(dict(zip(headers, cells)))
print(headers)
rows[:4]` },
    ] },
    { id: 'navigate', title: 'Navigate and modify', snippets: [
      { title: 'Parents, siblings, children', code: `from bs4 import BeautifulSoup
soup = BeautifulSoup(open("/data/page.html").read(), "html.parser")

li = soup.find("li", class_="sale")
print(li.parent.name, li.parent["class"])
print(li.find_next_sibling("li").a.text)
print(li.find_previous_sibling("li").a.text)
print([c.name for c in li.children if c.name])   # skip whitespace text nodes
print(li.find_parent("main").h1.text)` },
      { title: 'Edit the tree and re-serialise', code: `from bs4 import BeautifulSoup
soup = BeautifulSoup(open("/data/page.html").read(), "html.parser")

for tag in soup.select("nav, footer, table"):
    tag.decompose()                     # remove entirely
badge = soup.new_tag("strong"); badge.string = "SALE "
for li in soup.select("li.sale"):
    li.insert(0, badge.__copy__())
soup.h1.string = "Catalogue (sale items marked)"
print(soup.main.prettify()[:400])` },
    ] },
    { id: 'requests', title: 'With requests', snippets: [
      { title: 'Fetch, then parse', code: `import requests
from bs4 import BeautifulSoup

# Outside the sandbox: r = requests.get(url, timeout=10); r.raise_for_status(); html = r.text
html = open("/data/page.html").read()   # the sandbox serves no HTML pages
soup = BeautifulSoup(html, "html.parser")
print(soup.select_one("h1").text, "-", len(soup.select("li.product")), "products")`, packages: ['beautifulsoup4', 'requests'] },
    ] },
  ],
  concepts: [
    { id: 'tree', title: 'Searching the tree', intro: 'The difference between <code>find</code>, <code>find_all</code> and <code>select</code> is where they stop, not what they see.', explainer: treeExplainer },
  ],
  compare: [
    { title: 'find_all versus select', columns: ['find_all', 'select'], rows: [
      ['Syntax', 'Python kwargs', 'CSS selector string'],
      ['Nested conditions', { part: 'nest calls' }, true],
      ['Regex / callable filters', true, false],
      ['Limit results', { code: 'limit=3' }, { code: '[:3]' }],
      ['Readable for deep paths', { dots: 2 }, { dots: 5 }],
    ], verdict: '<code>select</code> for structure ("this inside that"), <code>find_all</code> for attribute logic and regexes.' },
    { title: 'Parsers', columns: ['html.parser', 'lxml', 'html5lib'], rows: [
      ['Extra install', false, true, true],
      ['Speed', { dots: 3 }, { dots: 5 }, { dots: 1 }],
      ['Tolerates broken HTML', { dots: 3 }, { dots: 4 }, { dots: 5 }],
      ['Behaves like a browser', false, false, true],
    ], note: 'Pick one and name it explicitly; different parsers produce slightly different trees for bad markup.' },
  ],
  gotchas: [
    { title: 'class is a list', bad: `li["class"] == "product"     # False; it is ["product", "sale"]`, good: `"product" in li["class"]
# or search: soup.find_all("li", class_="product")`, why: 'Multi-valued attributes (<code>class</code>, <code>rel</code>) come back as lists so you can test membership.' },
    { title: 'find returns None, then .text explodes', bad: `soup.find("h2").text
# AttributeError: 'NoneType' object has no attribute 'text'`, good: `h2 = soup.find("h2")
title = h2.text if h2 else ""`, why: 'A missing element is <code>None</code>, not an empty tag. Guard it or use <code>select_one(...)</code> with the same check.' },
    { title: 'Whitespace counts as a child', bad: `list(ul.children)[0]     # often "\\n", not the first <li>`, good: `ul.find("li")
[c for c in ul.children if c.name]`, why: 'Newlines between tags are NavigableString nodes. Tag-only navigation (<code>find</code>, <code>find_next_sibling</code>) skips them.' },
  ],
  presets: [
    { title: 'Scrape the catalogue', code: `from bs4 import BeautifulSoup
soup = BeautifulSoup(open("/data/page.html").read(), "html.parser")
rows = [{"id": li["data-id"], "name": li.a.text, "price": float(li.select_one(".price").text[1:]), "sale": "sale" in li["class"]}
        for li in soup.select("li.product")]
sorted(rows, key=lambda r: -r["price"])[:5]` },
  ],
};
