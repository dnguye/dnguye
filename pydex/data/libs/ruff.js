import { scene } from '../../js/explainer.js';

const selectionExplainer = {
  hold: 3200,
  code: ['[tool.ruff.lint]', 'select = ["E", "F", "I", "B"]      # replaces the defaults', 'ignore = ["E501"]', '[tool.ruff.lint.per-file-ignores]', '"tests/*" = ["B011"]', '', 'import os  # noqa: F401'],
  build() {
    const s = scene(760, 330);
    const rules = [['E501', 'line too long'], ['E711', '== None'], ['F401', 'unused import'], ['F841', 'unused variable'], ['I001', 'unsorted imports'], ['B006', 'mutable default'], ['B011', 'assert False'], ['UP006', 'List[int] → list[int]']];
    s.text('rt', 20, 30, 'rule registry (960+ rules; 8 shown)', 'lbl sm bold ink-2', undefined, 'start');
    rules.forEach(([code, desc], i) => {
      const x = 20 + (i % 4) * 182, y = 48 + Math.floor(i / 4) * 64;
      const g = s.g(`r${i}`, x, y, 'dim');
      s.rect(`r${i}.r`, 0, 0, 170, 48, 'cell', g);
      s.text(`r${i}.c`, 85, 16, code, 'lbl bold', g);
      s.text(`r${i}.d`, 85, 34, desc, 'lbl sm ink-2', g);
    });
    s.text('cfg', 20, 195, '', 'lbl sm bold ink-2', undefined, 'start');
    s.text('cfg2', 20, 215, '', 'lbl sm ink-2', undefined, 'start');
    s.cell('f1', 20, 240, 300, 34, 'app/main.py', 'cell hid');
    s.cell('f2', 400, 240, 300, 34, 'tests/test_main.py', 'cell hid');
    s.text('f1t', 20, 300, '', 'lbl sm ink-2', undefined, 'start');
    s.text('f2t', 400, 300, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'The default set: 413 rules on, the opinionated ones off', caption: 'Since 0.16 Ruff enables most of pyflakes (F), isort (I001), pyupgrade (UP), bugbear (B), simplify (SIM), comprehensions (C4), many pylint (PL) and RUF rules with no config at all. Style-only pycodestyle rules (E5, E7) and a few contested ones such as B011 stay off.', lines: [],
      patch: { r2: { cls: '' }, r3: { cls: '' }, r4: { cls: '' }, r5: { cls: '' }, r7: { cls: '' }, cfg: { text: 'active: F401 F841 I001 B006 UP006 … (413 rules)   off: E501 E711 B011' } } },
    { title: 'select replaces that set; a prefix matches a family', caption: '"E" is every pycodestyle rule, "B" every bugbear rule. select = [...] throws the defaults away and starts from your list, so UP006 is now off: nobody selected "UP". extend-select would have added to the defaults instead.', lines: [0, 1],
      patch: { r0: { cls: '' }, 'r0.r': { cls: 'cell hot' }, r1: { cls: '' }, 'r1.r': { cls: 'cell hot' }, 'r2.r': { cls: 'cell hot' }, 'r3.r': { cls: 'cell hot' }, 'r4.r': { cls: 'cell hot' }, 'r5.r': { cls: 'cell hot' }, r6: { cls: '' }, 'r6.r': { cls: 'cell hot' }, r7: { cls: 'dim' }, cfg: { text: 'active: E, F, I, B   (UP006 off: select replaced the defaults)' } } },
    { title: 'ignore removes rules; the more specific selector wins', caption: 'select = ["E"] with ignore = ["E501"] disables that one rule. The reverse works too: ignore = ["E"] plus select = ["E501"] keeps only E501, because a full code beats a prefix, and a prefix beats a linter group. ALL is the broadest of all.', lines: [2],
      patch: { r0: { cls: 'dim' }, 'r0.r': { cls: 'cell err' }, cfg: { text: 'active: E minus E501, F, I, B' }, cfg2: { text: 'precedence: ALL < linter group < prefix < rule code' } } },
    { title: 'per-file-ignores narrows by path', caption: 'Some rules are wrong in some places: assert False (B011) is a pytest idiom, __init__.py files re-export names (F401). The glob is matched against the file path, and the rule set is computed once per file.', lines: [3, 4],
      patch: { f1: { cls: '' }, f2: { cls: '' }, 'f2.r': { cls: 'cell info' }, f1t: { text: 'checks: E, F, I, B  (not E501)' }, f2t: { text: 'checks: E, F, I, B  (not E501, not B011)' } } },
    { title: 'A suppression comment silences one line', caption: '# noqa: F401 (or the newer # ruff: ignore[F401]) skips that code on that line only. A bare # noqa silences everything on the line; PGH004 flags those. # ruff: noqa or # ruff: file-ignore[F401] at the top exempts the whole file.', lines: [6],
      patch: { 'f1.r': { cls: 'cell hot' }, f1t: { text: 'import os  # noqa: F401  → F401 skipped on this line only' }, 'r2.r': { cls: 'cell info' } } },
    { title: 'What actually runs on each file', caption: 'Resolution order: defaults → select / extend-select → ignore → per-file-ignores → line comments. A CLI --select outranks pyproject.toml, and the nearest pyproject.toml outranks a parent one. ruff check --show-settings prints the result.', lines: [],
      patch: { 'f1.r': { cls: 'cell ok' }, 'f2.r': { cls: 'cell ok' }, 'r2.r': { cls: 'cell hot' }, cfg2: { text: 'ruff check --show-settings app/main.py' } } },
  ],
};

export default {
  id: 'ruff', name: 'ruff', glyph: 'rf', group: 'testing', version: '0.16', keywords: 'lint linter format formatter flake8 isort black pyupgrade pre-commit noqa',
  tagline: 'One fast tool that replaces flake8, isort, pyupgrade and black.',
  install: 'pip install ruff', docs: 'https://docs.astral.sh/ruff/', packages: [], runnable: false,
  overview: {
    what: 'Ruff is a linter and formatter for Python written in Rust. <code>ruff check</code> runs rules ported from flake8 and its plugins, isort, pyupgrade, pylint and others (413 of the 960+ are on by default since 0.16) and can fix most of what it finds. <code>ruff format</code> is a drop-in replacement for black. Both read one <code>[tool.ruff]</code> table in pyproject.toml and finish a large repository in well under a second, which is why they run on every save and every commit.',
    yes: ['Any Python project: it is the default lint and format setup for new code.', 'Replacing a stack of flake8 plugins, isort and black with one config.', 'Auto-fixing mechanical issues: unused imports, import order, old syntax.', 'Fast feedback in editors and pre-commit without a daemon.'],
    no: ['Type checking (mypy, pyright, or ty from the same team).', 'Deep cross-module analysis that pylint does (Ruff implements a subset of pylint rules).', 'Formatting non-Python files (Ruff formats Python, notebooks, and Python blocks inside Markdown).'],
    note: 'Ruff is a compiled binary that needs a filesystem and a shell, so nothing here runs in the browser. Copy the commands and config into a terminal: <code>pip install ruff</code> (or <code>uv tool install ruff</code>), then <code>ruff check .</code> and <code>ruff format .</code> in your project.',
  },
  cheatsheet: [
    { id: 'cli', title: 'Command line', blurb: 'Two subcommands. check lints, format formats, both take paths and exit non-zero when something is wrong.', snippets: [
      { title: 'Lint and fix', code: `ruff check .                    # lint the tree; respects .gitignore
ruff check src/app.py           # one file
ruff check --fix .              # apply safe fixes in place
ruff check --fix --unsafe-fixes .   # also fixes that may change behaviour
ruff check --diff .             # show what --fix would change, change nothing
ruff check --watch .            # re-run on every save
ruff check --statistics .       # count of violations per rule
ruff check --select E,W --ignore E501 .   # override config for one run
ruff check --output-format=github .       # annotations in CI logs (also json, junit, sarif, gitlab)
ruff check --add-noqa .         # write a noqa for every current violation (adoption)
ruff check --add-ignore .       # same, using the newer  # ruff: ignore[CODE]  comments`, note: 'Exit code 0 means no violations. <code>--exit-zero</code> reports without failing; <code>--exit-non-zero-on-fix</code> fails CI if a fix was needed. Since 0.16 the available fix is shown inline under each diagnostic.' },
      { title: 'Format', code: `ruff format .                   # rewrite files (black-compatible style)
ruff format --check .           # exit 1 if any file would change, for CI
ruff format --diff src/         # show the changes instead
ruff format --check --output-format=github .   # CI annotations (0.16+)
ruff format --line-length 100 . # one-off override
ruff format notebook.ipynb      # notebooks; Python blocks in .md files are formatted too
echo "x = [1,2 ,3]" | ruff format -        # stdin → stdout
# Lint first, then format: some fixes (I001 import sorting) produce
# code the formatter then lays out.
ruff check --fix . && ruff format .`, note: 'The formatter output matches black except for a few documented deviations. It never changes semantics.' },
      { title: 'Explore the rule set', code: `ruff rule F401                  # explain one rule: what it flags, why, the fix
ruff rule --all                 # every rule, with docs
ruff linter                     # list the rule families (E, F, I, UP, B, …)
ruff check --select ALL --statistics .    # what would everything flag?
ruff check --show-settings src/app.py     # the resolved config for one file
ruff config lint.select         # documentation for a config option
ruff version`, note: 'The rules page in the docs marks which rules are on by default and which have a fix; <code>ruff rule</code> gives the same information offline.' },
    ] },
    { id: 'config', title: 'Configuration', blurb: 'One table in pyproject.toml. ruff.toml or .ruff.toml work too, with the same keys minus the tool.ruff prefix.', snippets: [
      { title: 'A solid starting pyproject.toml', code: `[tool.ruff]
line-length = 100
target-version = "py312"          # decides which syntax UP rules may introduce
src = ["src", "tests"]            # roots for first-party import detection
extend-exclude = ["migrations", "build"]

[tool.ruff.lint]
# Ruff 0.16+ already enables F, I, UP, B, SIM, C4, RUF and most PL rules.
# extend-select adds to that set; select = [...] would replace it.
extend-select = [
    "E", "W",    # pycodestyle (only E722, E902, W605 are on by default)
    "N",         # pep8-naming
    "PTH",       # prefer pathlib over os.path
    "TRY",       # exception handling hygiene
]
ignore = ["E501"]                 # the formatter owns line length

[tool.ruff.format]
docstring-code-format = true      # format code examples inside docstrings`, note: 'If <code>target-version</code> is unset Ruff reads <code>requires-python</code> from the <code>[project]</code> table. To pin the pre-0.16 behaviour exactly: <code>select = ["E4", "E7", "E9", "F"]</code>.' },
      { title: 'per-file-ignores and fixable', code: `[tool.ruff.lint.per-file-ignores]
"__init__.py" = ["F401"]          # re-exports look unused
"tests/**" = ["S101", "B011", "PLR2004"]   # assert, assert False, magic numbers
"scripts/*.py" = ["T201"]         # print() is the point
"docs/conf.py" = ["ALL"]

[tool.ruff.lint]
fixable = ["ALL"]                 # default: every rule with a fix
unfixable = ["F401", "ERA001"]    # report unused imports and commented-out code, do not delete them
extend-safe-fixes = ["UP007"]     # promote a fix from unsafe to safe once you trust it
dummy-variable-rgx = "^(_+|(_+[a-zA-Z0-9_]*[a-zA-Z0-9]+?))$"

[tool.ruff.lint.pydocstyle]
convention = "google"             # D rules follow Google-style docstrings`, note: 'Removing unused imports with <code>--fix</code> while you are mid-edit can delete an import you were about to use. Many teams put <code>F401</code> in <code>unfixable</code> for editor runs.' },
      { title: 'Import sorting (isort) options', code: `[tool.ruff.lint.isort]
known-first-party = ["myapp"]
known-third-party = ["django"]
combine-as-imports = true          # from x import a as b, c as d
force-single-line = false
lines-after-imports = 2
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
required-imports = ["from __future__ import annotations"]

# Result of ruff check --select I --fix on a messy header:
#   import os, sys                      →   import os
#   from myapp.db import Session        →   import sys
#   import requests                     →
#                                       →   import requests
#                                       →
#                                       →   from myapp.db import Session`, note: 'Rule I001 is the whole of isort. Setting <code>src</code> at the top level is what makes <code>myapp</code> first-party without listing it.' },
      { title: 'Formatter options', code: `[tool.ruff.format]
quote-style = "double"            # or "single", "preserve"
indent-style = "space"            # or "tab"
line-ending = "lf"                # "auto", "cr-lf", "native"
skip-magic-trailing-comma = false # a trailing comma forces one-item-per-line (black behaviour)
docstring-code-format = true
docstring-code-line-length = 80
exclude = ["*.pyi", "generated/"]

# opt out per region:
#   # fmt: off
#   MATRIX = [
#       [1, 0, 0],
#       [0, 1, 0],
#   ]
#   # fmt: on
# or per statement:  x = [1,2,3]  # fmt: skip`, note: 'The magic trailing comma is the main lever for layout: add one to explode a call, remove it to let Ruff collapse the call back to one line.' },
    ] },
    { id: 'rules', title: 'Rule families in practice', blurb: 'What the common prefixes catch, shown on real code. The comment after each line is the rule Ruff reports.', snippets: [
      { title: 'F and E: pyflakes and pycodestyle', code: `import os                                 # F401 os imported but unused
import sys

def load(path, verbose = False):          # E251 unexpected spaces around keyword equals (needs "E2")
    data = open(path).read()              # SIM115 use a context manager (default on)
    result = parse(data)                  # F821 undefined name parse
    unused = len(data)                    # F841 local variable unused is assigned to but never used
    if verbose == True:                   # E712 comparison to True (needs "E7")
        print(data)
    if data == None:                      # E711 comparison to None (needs "E7")
        return
    return sys.intern(data)

# ruff check --fix removes the import (F401 safe) and rewrites == None / == True.
# F841's fix is unsafe: the right-hand side might have side effects.
# F rules are on by default; E5/E7 style rules must be selected since 0.16.` },
      { title: 'UP, B, SIM, C4: modernise and de-bug', code: `from typing import List, Optional        # UP035 deprecated import (use builtins)

def tags(items: List[str], extra: Optional[List[str]] = None) -> List[str]:
    # UP006 use list instead of List       UP045 use X | None instead of Optional[X]
    ...

def append(x, bucket=[]):                 # B006 mutable argument default
    bucket.append(x)
    return bucket

def first(xs):
    try:
        return xs[0]
    except:                               # E722 bare except (on by default)
        return None

if key in d.keys(): ...                   # SIM118 use key in d
opts = dict(a=1, b=2)                     # C408 unnecessary dict() call → {"a": 1, "b": 2}
print("%s items" % n)                     # UP031 use format specifiers instead of percent format
"{} items".format(n)                      # UP032 use f-string
squares = list(map(lambda v: v * v, xs))  # C417 unnecessary map → [v * v for v in xs]

# After ruff check --fix with target-version = "py312":
#   def tags(items: list[str], extra: list[str] | None = None) -> list[str]:
#   print(f"{n} items")`, note: 'UP fixes depend on <code>target-version</code>: <code>X | None</code> needs 3.10+, so Ruff will not introduce it for an older target.' },
      { title: 'Suppress one line, one file, or one rule', code: `import os  # noqa: F401                  # this code, this line
import re  # noqa                         # every rule on this line (avoid; enable PGH004 to flag it)
x = 1  # noqa: E501, F841                 # several codes

import math  # ruff: ignore[F401]         # 0.16+: Ruff's own syntax, same meaning…
# ruff: ignore[N803]                      # …or on its own line, covering the next logical line
def legacy(camelCase): ...

# ruff: disable[N803]                     # a range (0.15+)
def a(oldArg): ...
def b(otherArg): ...
# ruff: enable[N803]

# ruff: noqa: E501                        # top of file: this rule for the whole file
# ruff: file-ignore[E501] long tables     # same, with a reason
# ruff: noqa                              # exempt the file entirely

# Stale comments are themselves a violation (RUF100, unused-noqa, on by default);
# ruff check --fix removes them.` },
    ] },
    { id: 'integrate', title: 'pre-commit and CI', snippets: [
      { title: '.pre-commit-config.yaml', code: `repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.16.7                      # pin; bump with pre-commit autoupdate
    hooks:
      - id: ruff-check                # lint (the hook was called "ruff" before 0.11)
        args: [--fix]
      - id: ruff-format               # then format

# install the git hook once:   pre-commit install
# run on everything:           pre-commit run --all-files`, note: 'Order matters: <code>ruff-check --fix</code> before <code>ruff-format</code>, so the formatter lays out whatever the fixes produced.' },
      { title: 'GitHub Actions', code: `# .github/workflows/lint.yml
name: lint
on: [push, pull_request]
jobs:
  ruff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/ruff-action@v3      # installs ruff and runs "ruff check" by default
        with:
          args: check --output-format=github .
      - uses: astral-sh/ruff-action@v3
        with:
          args: format --check --output-format=github .`, note: '<code>--output-format=github</code> turns each violation into an inline annotation on the pull request diff. Pass <code>version:</code> to pin the Ruff release the action installs.' },
    ] },
    { id: 'editor', title: 'Editor integration', snippets: [
      { title: 'VS Code settings.json', code: `{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  "ruff.lineLength": 100,
  "ruff.configuration": "~/.config/ruff/ruff.toml",
  "ruff.nativeServer": "on"
}
// The extension bundles ruff and runs its language server (ruff server);
// set "ruff.path" to use the one from your virtualenv instead.`, note: 'Neovim, Helix, Zed, Sublime and PyCharm all speak to the same <code>ruff server</code> (LSP): diagnostics, quick fixes, format on save, hover on a rule code.' },
      { title: 'Programmatic use and stdin', code: `# lint a buffer without a file (editors and tooling do this)
echo 'import os' | ruff check --stdin-filename app.py -
# format a buffer
echo 'x=[1,2]' | ruff format -
# machine-readable output
ruff check --output-format=json . | python -c "import json,sys; print(len(json.load(sys.stdin)), 'violations')"
# a single rule, no config file involved
ruff check --isolated --select F401 src/`, note: '<code>--isolated</code> ignores every config file, which is the reliable way to answer "does this rule fire on this code" in isolation.' },
    ] },
  ],
  concepts: [
    { id: 'selection', title: 'How rule selection composes', intro: 'Defaults, <code>select</code>, <code>ignore</code>, <code>per-file-ignores</code> and line comments are applied in a fixed order, and a narrower selector always beats a broader one.', explainer: selectionExplainer },
  ],
  compare: [
    { title: 'Rule families worth knowing', columns: ['F', 'E / W', 'I', 'UP', 'B', 'SIM', 'RUF'], rows: [
      ['Ported from', 'pyflakes', 'pycodestyle', 'isort', 'pyupgrade', 'flake8-bugbear', 'flake8-simplify', 'ruff'],
      ['Catches', 'undefined / unused names', 'style, spacing', 'import order', 'outdated syntax', 'probable bugs', 'needless complexity', 'misc, noqa hygiene'],
      ['Auto-fixable', { part: 'F401, F841' }, { part: 'most' }, true, true, { part: 'some' }, { part: 'most' }, { part: 'some' }],
      ['False positives', { dots: 1 }, { dots: 1 }, { dots: 1 }, { dots: 2 }, { dots: 2 }, { dots: 3 }, { dots: 2 }],
      ['On by default (0.16)', { part: 'most' }, { part: 'E722, E902, W605' }, true, { part: 'most' }, { part: 'most' }, { part: 'most' }, { part: 'many' }],
    ], note: 'False-positive ratings are judgement calls; lower is better.', verdict: 'The 0.16 defaults are a good baseline. Add <code>E</code>, <code>W</code>, <code>N</code>, <code>PTH</code> with <code>extend-select</code>, keep <code>ignore = ["E501"]</code>, and check <code>--statistics</code> before enabling a noisy family.' },
    { title: 'Safe and unsafe fixes', columns: ['safe fix', 'unsafe fix', 'no fix'], rows: [
      ['Applied by --fix', true, false, false],
      ['Applied by --fix --unsafe-fixes', true, true, false],
      ['Can change behaviour', false, { part: 'in edge cases' }, { part: 'n/a' }],
      ['Example', 'F401 remove unused import', 'F841 remove unused assignment', 'F821 undefined name'],
    ], verdict: 'Run <code>--unsafe-fixes</code> with <code>--diff</code> first and read it. Promote fixes you trust with <code>extend-safe-fixes</code>; demote surprising ones with <code>extend-unsafe-fixes</code>.' },
  ],
  gotchas: [
    { title: 'select replaces the defaults', bad: `[tool.ruff.lint]
select = ["I"]     # only isort now; the other 412 default rules are gone`, good: `[tool.ruff.lint]
extend-select = ["I"]   # defaults plus isort (redundant since 0.16: I001 is a default)
# or list what you want explicitly: select = ["E4", "E7", "E9", "F", "I", "UP", "B"]`, why: '<code>select</code> is the whole set; <code>extend-select</code> adds to whatever is already active. Silently losing pyflakes and bugbear is the classic first-config mistake.' },
    { title: 'Running the formatter before the linter', bad: `ruff format . && ruff check --fix .
# import fixes leave lines the formatter would have reflowed`, good: `ruff check --fix . && ruff format .`, why: 'Lint fixes such as import sorting and comprehension rewrites produce code that may need reformatting. Format last so the output is stable.' },
    { title: 'E501 fights the formatter', bad: `extend-select = ["E"]
line-length = 88
# long strings and comments that ruff format cannot break are reported forever`, good: `extend-select = ["E"]
ignore = ["E501"]   # let ruff format decide
# a looser hard cap if you want one:
# [tool.ruff.lint.pycodestyle]  max-line-length = 120`, why: 'The formatter wraps code but never splits a string literal or a comment, so E501 keeps firing on lines nothing can fix.' },
    { title: 'A noqa on the wrong line', bad: `result = some_call(
    a, b)  # noqa: E501   # applies to this line, the diagnostic is on the one above`, good: `result = some_call(  # noqa: E501
    a, b)
# or cover the whole statement:  # ruff: ignore[E501]  on the line before it`, why: 'A <code>noqa</code> suppresses the line it sits on. <code># ruff: ignore[CODE]</code> on its own line covers the next logical line, which is the fix for multi-line statements; RUF100 reports suppressions that match nothing.' },
  ],
  presets: [],
};
