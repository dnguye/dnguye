import { scene } from '../../js/explainer.js';

// Explainer 1: how `/` joins and how resolve() normalises.
const joinExplainer = {
  hold: 3000,
  code: ['base = Path("/data")', 'p = base / "reports" / ".." / "orders.csv"', 'p.resolve()', 'base / "/etc/hosts"   # absolute right side wins'],
  build() {
    const s = scene(760, 300);
    s.text('h1', 20, 22, 'parts (a tuple of segments)', 'lbl bold', undefined, 'start');
    s.text('h2', 20, 176, 'the string that comes out', 'lbl bold', undefined, 'start');
    // segment cells that get appended one by one
    const segs = [['seg0', '/', 40], ['seg1', 'data', 70], ['seg2', 'reports', 90], ['seg3', '..', 50], ['seg4', 'orders.csv', 110]];
    let x = 20;
    segs.forEach(([id, label, w], i) => { s.cell(id, x, 40, w, 34, label, i < 2 ? 'cell' : 'cell hid'); x += w + 8; });
    s.text('note', 20, 100, 'Path("/data").parts == ("/", "data")', 'lbl sm ink-2', undefined, 'start');
    s.cell('str', 20, 196, 380, 34, '/data', 'cell');
    s.text('str-note', 20, 252, 'no filesystem access yet: joining is pure string work', 'lbl sm ink-2', undefined, 'start');
    // resolve panel on the right
    s.rect('rp', 440, 40, 300, 118, 'panel hid', undefined, 8);
    s.text('rp.t', 452, 56, 'resolve()', 'lbl sm bold ink-2', undefined, 'start');
    s.text('rp.1', 452, 80, 'asks the OS for the real path', 'lbl sm', undefined, 'start');
    s.text('rp.2', 452, 100, 'follows symlinks, drops ..', 'lbl sm', undefined, 'start');
    s.text('rp.3', 452, 120, 'makes it absolute (from cwd)', 'lbl sm', undefined, 'start');
    s.text('rp.4', 452, 140, 'strict=True raises if missing', 'lbl sm', undefined, 'start');
    for (const id of ['rp.t', 'rp.1', 'rp.2', 'rp.3', 'rp.4']) s.reg.get(id).classList.add('hid');
    s.cell('abs', 440, 196, 300, 34, '/etc/hosts', 'cell err hid');
    return s;
  },
  steps: [
    { title: 'A Path is a tuple of parts', caption: 'Path("/data") is stored as the parts ("/", "data"). Nothing on disk is touched when you build one; it is a value, not a file handle.', lines: [0] },
    { title: '/ appends parts', caption: 'Each right-hand operand is split on the separator and appended. "reports" and ".." are kept literally: the path now points at /data/reports/../orders.csv.', lines: [1],
      patch: { seg2: { cls: '' }, seg3: { cls: '' }, seg4: { cls: '' }, 'seg2.r': { cls: 'cell hot' }, 'seg3.r': { cls: 'cell hot' }, 'seg4.r': { cls: 'cell hot' }, 'str.t': { text: '/data/reports/../orders.csv' }, note: { text: 'parts == ("/", "data", "reports", "..", "orders.csv")' } } },
    { title: '.. is not collapsed by joining', caption: 'pathlib refuses to guess: if "reports" were a symlink, collapsing ".." lexically would give the wrong answer. Only the filesystem knows.', lines: [1],
      patch: { 'seg2.r': { cls: 'cell' }, 'seg4.r': { cls: 'cell' }, 'seg3.r': { cls: 'cell err' } } },
    { title: 'resolve() consults the OS', caption: 'resolve() makes the path absolute, follows every symlink and removes the "..". It returns a new Path; the original is unchanged. absolute() only prepends the cwd and leaves ".." alone.', lines: [2],
      patch: { rp: { cls: 'panel hot' }, 'rp.t': { cls: 'lbl sm bold ink-2' }, 'rp.1': { cls: 'lbl sm' }, 'rp.2': { cls: 'lbl sm' }, 'rp.3': { cls: 'lbl sm' }, 'rp.4': { cls: 'lbl sm' },
        seg2: { cls: 'dim' }, seg3: { cls: 'dim' }, 'str.t': { text: '/data/orders.csv' }, 'str.r': { cls: 'cell ok' }, note: { text: 'resolved parts == ("/", "data", "orders.csv")' } } },
    { title: 'An absolute right side replaces everything', caption: 'base / "/etc/hosts" is /etc/hosts. Joining an anchored path discards the left operand, exactly like os.path.join. Guard user input with is_relative_to() or strip the leading slash first.', lines: [3],
      patch: { rp: { cls: 'panel dim' }, abs: { cls: '' }, 'str.r': { cls: 'cell dim' }, 'str-note': { text: 'Path("/data") / "/etc/hosts"  →  /etc/hosts' } } },
  ],
};

// Explainer 2: how glob("**/*.py") walks a tree.
const globExplainer = {
  hold: 3000,
  code: ['root = Path("project")', 'root.glob("**/*.py")     # lazy generator', 'root.rglob("*.py")       # same thing', 'sorted(root.glob("*.py"))  # one level only'],
  build() {
    const s = scene(760, 320);
    s.text('h', 20, 22, 'project/', 'lbl bold', undefined, 'start');
    // tree: directories and files
    const nodes = [
      ['d-src', 40, 44, 90, 30, 'src/', 'cell'],
      ['f-app', 150, 44, 110, 30, 'app.py', 'cell'],
      ['f-util', 150, 82, 110, 30, 'utils.py', 'cell'],
      ['d-tests', 40, 124, 90, 30, 'tests/', 'cell'],
      ['f-test', 150, 124, 110, 30, 'test_app.py', 'cell'],
      ['d-data', 40, 166, 90, 30, 'data/', 'cell'],
      ['f-csv', 150, 166, 110, 30, 'orders.csv', 'cell'],
      ['f-readme', 40, 210, 110, 30, 'README.md', 'cell'],
      ['f-setup', 40, 252, 110, 30, 'setup.py', 'cell'],
    ];
    nodes.forEach(([id, x, y, w, h, l, c]) => s.cell(id, x, y, w, h, l, c));
    // pattern segments
    s.text('ph', 330, 22, 'pattern', 'lbl bold', undefined, 'start');
    s.cell('p0', 330, 44, 60, 30, '**', 'cell');
    s.cell('p1', 400, 44, 70, 30, '*.py', 'cell');
    s.text('pnote', 330, 92, '', 'lbl sm ink-2', undefined, 'start');
    s.text('pnote2', 330, 110, '', 'lbl sm ink-2', undefined, 'start');
    // results
    s.text('rh', 530, 22, 'yielded', 'lbl bold', undefined, 'start');
    const res = [['r0', 'setup.py'], ['r1', 'src/app.py'], ['r2', 'src/utils.py'], ['r3', 'tests/test_app.py']];
    res.forEach(([id, l], i) => s.cell(id, 530, 44 + i * 38, 210, 30, l, 'cell ok hid'));
    s.text('rnote', 530, 210, '', 'lbl sm ink-2', undefined, 'start');
    s.text('rnote2', 530, 228, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Split the pattern on /', caption: 'glob("**/*.py") becomes two selectors: "**" (any number of directory levels, including zero) and "*.py" (a filename filter). Each selector consumes one path level.', lines: [1],
      patch: { 'p0.r': { cls: 'cell hot' }, 'p1.r': { cls: 'cell hot' }, pnote: { text: '** = walk every directory, depth first' }, pnote2: { text: '*.py = fnmatch on the name' } } },
    { title: '** starts at the root itself', caption: 'Zero directories is a valid match for "**", so the root is checked first. setup.py matches "*.py"; README.md does not.', lines: [1],
      patch: { 'p0.r': { cls: 'cell' }, 'f-setup.r': { cls: 'cell ok' }, 'f-readme.r': { cls: 'cell err' }, r0: { cls: '' } } },
    { title: 'Descend into src/', caption: 'The walk uses os.scandir, one directory at a time, so nothing is listed until you ask for the next result. app.py and utils.py match.', lines: [1],
      patch: { 'd-src.r': { cls: 'cell hot' }, 'f-app.r': { cls: 'cell ok' }, 'f-util.r': { cls: 'cell ok' }, r1: { cls: '' }, r2: { cls: '' } } },
    { title: 'tests/ and data/', caption: 'test_app.py matches. orders.csv fails the name filter and is skipped. Directories themselves can match too, when the last selector fits their name.', lines: [1],
      patch: { 'd-src.r': { cls: 'cell' }, 'd-tests.r': { cls: 'cell hot' }, 'd-data.r': { cls: 'cell hot' }, 'f-test.r': { cls: 'cell ok' }, 'f-csv.r': { cls: 'cell err' }, r3: { cls: '' } } },
    { title: 'Order is whatever the OS returns', caption: 'Results arrive in directory-listing order, which differs between filesystems and runs. Wrap in sorted() when order matters. rglob("*.py") is shorthand for glob("**/*.py").', lines: [2, 3],
      patch: { 'd-tests.r': { cls: 'cell' }, 'd-data.r': { cls: 'cell' }, rnote: { text: 'generator: consumed once, no list built' }, rnote2: { text: 'sorted(...) for a stable order' } } },
  ],
};

export default {
  id: 'pathlib', name: 'pathlib', glyph: 'pl', group: 'essentials', version: '3.12, standard library', keywords: 'path file directory glob rglob read_text write_text mkdir suffix stem parent',
  tagline: 'Filesystem paths as objects: join, inspect, read, write, glob.',
  install: 'built in — from pathlib import Path', docs: 'https://docs.python.org/3/library/pathlib.html', packages: [],
  overview: {
    what: 'pathlib replaces the string-and-os.path style of file handling with a Path object. You build paths with the / operator, ask them questions (exists, suffix, parent), and read or write through them directly. A Path is accepted anywhere a filename is (open, shutil, sqlite3, pandas) because it implements os.PathLike.',
    yes: ['Any script that touches files: config, logs, data directories.', 'Walking a tree and filtering by name or extension.', 'Building output paths from input paths (same stem, new suffix).', 'Code that must run on Windows and POSIX without separator bugs.'],
    no: ['Pure string manipulation of URL-like paths (use urllib.parse or posixpath).', 'Bulk copy, move and delete of trees (pathlib has no copytree; use shutil).', 'Very hot loops over millions of entries where os.scandir tuples are cheaper.'],
    note: 'The sandbox filesystem is in-memory: <code>/data</code> holds the mock files, <code>/tmp</code> is writable, and everything is forgotten when the page reloads.',
  },
  cheatsheet: [
    { id: 'build', title: 'Build and take apart', blurb: 'A Path is a value. Joining and slicing never touch the disk.', snippets: [
      { title: 'Join with / and read the pieces', code: `from pathlib import Path

p = Path("/data") / "reports" / "q3" / "orders_2025.csv"
print(p)
print(p.name, "|", p.stem, "|", p.suffix)   # orders_2025.csv | orders_2025 | .csv
print(p.parent)                            # /data/reports/q3
print(p.parents[1])                        # /data/reports
print(p.parts)
print(p.anchor, p.is_absolute())`, note: '<code>parents</code> is a sequence: <code>parents[0]</code> is the parent, <code>parents[1]</code> the grandparent. Slicing it is allowed since 3.10.' },
      { title: 'Derive a sibling path', code: `from pathlib import Path

src = Path("/data/orders.csv")
print(src.with_suffix(".parquet"))          # /data/orders.parquet
print(src.with_stem("orders_clean"))        # /data/orders_clean.csv
print(src.with_name("summary.txt"))         # /data/summary.txt
print(src.parent / "out" / (src.stem + ".json"))

archive = Path("backup.tar.gz")
print(archive.suffix, archive.suffixes)     # .gz ['.tar', '.gz']
print(archive.with_suffix(""))              # backup.tar`, note: '<code>suffix</code> is only the last extension. For <code>.tar.gz</code> use <code>suffixes</code> or <code>name.removesuffix(".tar.gz")</code>.' },
      { title: 'Relative, absolute, resolved', code: `from pathlib import Path

p = Path("/data/reports/../orders.csv")
print(p.resolve())                          # .. collapsed by asking the OS
print(Path("orders.csv").absolute())        # cwd + name, no symlink work
print(Path.cwd(), Path.home())

data = Path("/data/orders.csv")
print(data.relative_to("/data"))            # orders.csv
print(data.is_relative_to("/tmp"))          # False
print(Path("a/b").relative_to("a/c", walk_up=True))   # ../b (3.12)` },
    ] },
    { id: 'inspect', title: 'Inspect what is there', snippets: [
      { title: 'Exists, type, size, mtime', code: `from pathlib import Path
from datetime import datetime, UTC

p = Path("/data/orders.csv")
print(p.exists(), p.is_file(), p.is_dir())
st = p.stat()
print(st.st_size, "bytes")
print(datetime.fromtimestamp(st.st_mtime, UTC).isoformat(timespec="seconds"))
print(Path("/data/missing.csv").exists())   # False, no exception` },
      { title: 'List a directory', code: `from pathlib import Path

for entry in sorted(Path("/data").iterdir()):
    kind = "dir " if entry.is_dir() else "file"
    print(f"{kind}  {entry.name:<16} {entry.stat().st_size:>7} B")`, note: '<code>iterdir()</code> yields direct children only, in arbitrary order. Sort it.' },
    ] },
    { id: 'io', title: 'Read and write', blurb: 'Whole-file helpers for small files; open() when you need streaming or a mode.', snippets: [
      { title: 'read_text, write_text, read_bytes', code: `from pathlib import Path

text = Path("/data/employees.csv").read_text(encoding="utf-8")
lines = text.splitlines()
print(len(lines), "lines; header:", lines[0])

out = Path("/tmp/pydex/first_three.csv")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("\\n".join(lines[:4]) + "\\n", encoding="utf-8")
print(out.read_bytes()[:20])
print(out.stat().st_size, "bytes written")`, note: 'Always pass <code>encoding</code>; the default is platform dependent (UTF-8 on Linux, often cp1252 on Windows).' },
      { title: 'open() on a Path, line by line', code: `from pathlib import Path
import csv

p = Path("/data/orders.csv")
with p.open(newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    shipped = sum(1 for row in reader if row["status"] == "shipped")
print("shipped:", shipped)

log = Path("/tmp/pydex/run.log")
log.parent.mkdir(parents=True, exist_ok=True)
with log.open("a", encoding="utf-8") as f:
    f.write("processed orders.csv\\n")
print(log.read_text())`, note: '<code>Path.open</code> takes the same arguments as the built-in <code>open</code>. The built-in accepts a Path too.' },
      { title: 'mkdir, touch, and idempotent setup', code: `from pathlib import Path

root = Path("/tmp/pydex/project")
for sub in ("src", "tests", "data"):
    (root / sub).mkdir(parents=True, exist_ok=True)
(root / "src" / "app.py").write_text("print('hi')\\n")
(root / "src" / "utils.py").touch()          # empty file, like the shell command
(root / "tests" / "test_app.py").touch()
(root / "README.md").write_text("# demo\\n")
(root / "data" / "orders.csv").write_bytes(Path("/data/orders.csv").read_bytes())

print(sorted(str(p.relative_to(root)) for p in root.rglob("*")))`, note: '<code>parents=True</code> creates missing intermediates; <code>exist_ok=True</code> makes a second run a no-op instead of <code>FileExistsError</code>.' },
    ] },
    { id: 'find', title: 'Find files', snippets: [
      { title: 'glob and rglob', code: `from pathlib import Path

root = Path("/tmp/pydex/project")
root.mkdir(parents=True, exist_ok=True)
for rel in ("src/app.py", "src/utils.py", "tests/test_app.py", "data/orders.csv", "setup.py"):
    (root / rel).parent.mkdir(parents=True, exist_ok=True); (root / rel).touch()

print(sorted(p.name for p in root.glob("*.py")))          # top level only
print(sorted(str(p.relative_to(root)) for p in root.rglob("*.py")))
print(sorted(str(p.relative_to(root)) for p in root.glob("**/test_*.py")))
print([p.name for p in Path("/data").glob("*.[cj]s*")])   # character classes work`, note: 'Both return generators in filesystem order. <code>rglob(x)</code> is <code>glob("**/" + x)</code>.' },
      { title: 'Filter, then sort by size or mtime', code: `from pathlib import Path

files = [p for p in Path("/data").iterdir() if p.is_file()]
by_size = sorted(files, key=lambda p: p.stat().st_size, reverse=True)
for p in by_size:
    print(f"{p.stat().st_size:>7}  {p.name}")

newest = max(files, key=lambda p: p.stat().st_mtime)
print("newest:", newest.name)
csvs = [p for p in files if p.suffix == ".csv"]
print("csv files:", [p.stem for p in csvs])` },
      { title: 'Path.walk (3.12) for top-down control', code: `from pathlib import Path

root = Path("/tmp/pydex/project")
root.mkdir(parents=True, exist_ok=True)
for rel in ("src/app.py", "tests/test_app.py", ".git/HEAD", "data/orders.csv"):
    (root / rel).parent.mkdir(parents=True, exist_ok=True); (root / rel).touch()

for dirpath, dirnames, filenames in root.walk():
    dirnames[:] = [d for d in dirnames if not d.startswith(".")]   # prune in place
    depth = len(dirpath.relative_to(root).parts)
    print("  " * depth + dirpath.name + "/", sorted(filenames))`, note: 'Like <code>os.walk</code> but yields Path objects. Editing <code>dirnames</code> in place stops the walk from entering those directories.' },
    ] },
    { id: 'change', title: 'Rename, move, delete', snippets: [
      { title: 'rename, replace, unlink, rmdir', code: `from pathlib import Path
import shutil

d = Path("/tmp/pydex/moves"); d.mkdir(parents=True, exist_ok=True)
a = d / "a.txt"; a.write_text("A")
b = a.rename(d / "b.txt")                 # returns the new Path
print(b.exists(), a.exists())             # True False

c = d / "c.txt"; c.write_text("C")
c.replace(b)                              # overwrite b atomically (same filesystem)
print(b.read_text())                      # C

b.unlink()
b.unlink(missing_ok=True)                 # second call is fine
shutil.rmtree(d)                          # rmdir() only removes empty dirs
print(d.exists())`, note: '<code>rename</code> raises on Windows if the target exists; <code>replace</code> overwrites everywhere. For cross-device moves use <code>shutil.move</code>.' },
      { title: 'Copy files and trees with shutil', code: `from pathlib import Path
import shutil

src = Path("/data/products.json")
dst_dir = Path("/tmp/pydex/copies"); dst_dir.mkdir(parents=True, exist_ok=True)
copied = shutil.copy2(src, dst_dir / "products_backup.json")   # keeps mtime
print(Path(copied).name, Path(copied).stat().st_size == src.stat().st_size)

tree = shutil.copytree("/data", "/tmp/pydex/data_copy", dirs_exist_ok=True)
print(sorted(p.name for p in Path(tree).iterdir()))`, note: 'pathlib deliberately has no copy or tree operations; <code>shutil</code> accepts Path objects directly.' },
    ] },
    { id: 'pure', title: 'Pure paths and interop', snippets: [
      { title: 'PurePath: manipulate without a filesystem', code: `from pathlib import PurePosixPath, PureWindowsPath

w = PureWindowsPath(r"C:\\Users\\dana\\reports\\q3.xlsx")
print(w.drive, w.parts[:2], w.stem)         # C: ('C:\\\\', 'Users') q3
print(w.as_posix())                         # C:/Users/dana/reports/q3.xlsx
print(PureWindowsPath("a/B.TXT").match("*.txt"))   # True: case-insensitive on Windows

u = PurePosixPath("/srv/uploads") / "2025" / "img.png"
print(u.with_suffix(".webp"), u.is_absolute())
print(PurePosixPath("a/b.txt").match("*.txt"), PurePosixPath("a/b.txt").match("b.*"))`, note: 'Use a Pure path when you are describing a path for another machine or OS. It has every string method of Path and none of the I/O.' },
      { title: 'Strings, os.fspath, and older APIs', code: `from pathlib import Path
import os, sqlite3, json

p = Path("/data/products.json")
print(str(p), repr(p))
print(os.fspath(p))                 # what open() and os functions call
print(p.as_uri())                   # file:///data/products.json

with open(p) as f:                  # built-in open accepts Path
    print(len(json.load(f)), "products")
con = sqlite3.connect(Path("/data/shop.sqlite"))   # so does sqlite3
print(con.execute("select count(*) from orders").fetchone())
print(os.path.getsize(p) == p.stat().st_size)`, note: 'Anything that takes <code>os.PathLike</code> takes a Path. Call <code>str()</code> only for libraries that check <code>isinstance(x, str)</code>.' },
    ] },
  ],
  concepts: [
    { id: 'join', title: 'Joining is lexical, resolving asks the OS', intro: 'The <code>/</code> operator only appends parts. Nothing is normalised until you call <code>resolve()</code>, and an absolute right-hand operand throws away everything before it.', explainer: joinExplainer },
    { id: 'glob', title: 'How glob walks a tree', intro: 'A pattern is split into per-level selectors. <code>**</code> is a recursive walk, the last segment is a name filter, and the whole thing is a lazy generator in filesystem order.', explainer: globExplainer },
  ],
  compare: [
    { title: 'Ways to walk a directory', columns: ['iterdir()', 'glob(pattern)', 'rglob(pattern)', 'walk()', 'os.scandir'], rows: [
      ['Recursive', false, { part: 'with **' }, true, true, false],
      ['Filters by name', false, true, true, { part: 'you filter' }, { part: 'you filter' }],
      ['Can prune subtrees', false, false, false, true, { part: 'manual recursion' }],
      ['Yields', 'Path', 'Path', 'Path', '(dir, names, names)', 'DirEntry'],
      ['Cost per entry', { dots: 3 }, { dots: 3 }, { dots: 3 }, { dots: 4 }, { dots: 5 }],
      ['Readability', { dots: 5 }, { dots: 5 }, { dots: 5 }, { dots: 4 }, { dots: 2 }],
    ], note: 'Ratings are judgement calls. os.scandir wins on cost because DirEntry caches is_file/is_dir from the listing without a second stat.', verdict: '<code>rglob</code> for "all the .csv files under here", <code>walk()</code> when you need to skip <code>.git</code> or <code>node_modules</code>, <code>os.scandir</code> only when profiling says the walk itself is the bottleneck.' },
    { title: 'Which class to use', columns: ['Path', 'PurePosixPath', 'PureWindowsPath'], rows: [
      ['Does I/O (exists, read_text, glob)', true, false, false],
      ['Separator and case rules', 'the running OS', 'always /', 'always \\ (and /), case-insensitive match'],
      ['Can be created on any OS', { part: 'flavour of the host' }, true, true],
      ['Typical use', 'real files on this machine', 'URLs, S3 keys, container paths', 'paths destined for a Windows box'],
    ], verdict: 'Almost always <code>Path</code>. Reach for a Pure path when the path belongs to another system and you only need to slice and join it.' },
  ],
  gotchas: [
    { title: 'An absolute right operand discards the left', bad: `base = Path("/srv/uploads")
name = "/etc/passwd"          # from user input
target = base / name          # Path('/etc/passwd')`, good: `target = (base / name.lstrip("/")).resolve()
if not target.is_relative_to(base.resolve()):
    raise ValueError("path escapes upload dir")`, why: '<code>/</code> behaves like <code>os.path.join</code>: an anchored segment restarts the path. Strip the slash and check <code>is_relative_to</code> after resolving so <code>..</code> cannot climb out either.' },
    { title: 'suffix is only the last extension', bad: `Path("data.tar.gz").with_suffix(".zip")
# Path('data.tar.zip')`, good: `p = Path("data.tar.gz")
p.with_name(p.name.removesuffix(".tar.gz") + ".zip")
# or inspect p.suffixes == ['.tar', '.gz']`, why: '<code>suffix</code> stops at the last dot. <code>suffixes</code> gives them all; <code>with_suffix("")</code> removes exactly one.' },
    { title: 'glob order is not stable', bad: `first = next(Path("/data").glob("*.csv"))
# whichever the OS lists first: differs by machine and run`, good: `first = sorted(Path("/data").glob("*.csv"))[0]`, why: 'The generator yields entries in <code>os.scandir</code> order, which is filesystem dependent. Tests that pass locally can fail in CI without <code>sorted()</code>.' },
    { title: 'mkdir needs parents=True and exist_ok=True', bad: `Path("/tmp/out/2025/q3").mkdir()
# FileNotFoundError the first time, FileExistsError the second`, good: `Path("/tmp/out/2025/q3").mkdir(parents=True, exist_ok=True)`, why: 'Plain <code>mkdir()</code> mirrors the C call: one level, must not exist. The two flags make it behave like <code>mkdir -p</code>, which is what setup code almost always wants.' },
  ],
  presets: [
    { title: 'Catalogue a directory', code: `from pathlib import Path

root = Path("/data")
files = sorted(p for p in root.iterdir() if p.is_file())
for p in files:
    text_lines = len(p.read_text(errors="replace").splitlines())
    print(f"{p.name:<16} {p.suffix:<6} {p.stat().st_size:>7} B  {text_lines:>4} lines")
print("total:", sum(p.stat().st_size for p in files), "bytes")` },
  ],
};
