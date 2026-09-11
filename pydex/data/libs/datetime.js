import { scene } from '../../js/explainer.js';

// How an aware datetime converts: wall time -> UTC instant -> other wall time.
const tzExplainer = {
  hold: 3200,
  code: [
    'ny = datetime(2026, 7, 4, 14, 30)                  # naive',
    'ny = ny.replace(tzinfo=ZoneInfo("America/New_York"))',
    'utc = ny.astimezone(UTC)                           # 18:30+00:00',
    'tokyo = ny.astimezone(ZoneInfo("Asia/Tokyo"))      # 03:30+09:00, next day',
    'ny == utc == tokyo                                 # True: one instant',
  ],
  build() {
    const s = scene(760, 320);
    s.text('h0', 20, 22, 'America/New_York', 'lbl bold', undefined, 'start');
    s.text('h1', 290, 22, 'UTC', 'lbl bold', undefined, 'start');
    s.text('h2', 520, 22, 'Asia/Tokyo', 'lbl bold', undefined, 'start');
    s.cell('ny', 20, 44, 220, 36, '2026-07-04 14:30', 'cell ghost');
    s.text('ny-off', 20, 98, 'tzinfo = None: just a wall clock', 'lbl sm ink-2', undefined, 'start');
    s.cell('utc', 290, 44, 200, 36, '2026-07-04 18:30Z', 'cell hid');
    s.text('utc-off', 290, 98, '', 'lbl sm ink-2', undefined, 'start');
    s.cell('tk', 520, 44, 220, 36, '2026-07-05 03:30', 'cell hid');
    s.text('tk-off', 520, 98, '', 'lbl sm ink-2', undefined, 'start');
    s.arrow('a1', 244, 62, 286, 62, 'arrow hid');
    s.text('a1-l', 265, 48, '', 'lbl sm ink-2');
    s.arrow('a2', 494, 62, 516, 62, 'arrow hid');
    s.text('a2-l', 505, 48, '', 'lbl sm ink-2');
    // rule box: what a tzinfo provides
    s.rect('rule', 20, 130, 720, 56, 'panel hid', undefined, 8);
    s.text('rule.t', 32, 146, '', 'lbl sm bold ink-2', undefined, 'start');
    s.text('rule.1', 32, 168, '', 'lbl sm', undefined, 'start');
    // winter row for the last step
    s.cell('wny', 20, 214, 220, 36, '2026-01-04 14:30', 'cell hid');
    s.text('wny-off', 20, 268, '', 'lbl sm ink-2', undefined, 'start');
    s.cell('wutc', 290, 214, 200, 36, '2026-01-04 19:30Z', 'cell hid');
    s.arrow('wa', 244, 232, 286, 232, 'arrow hid');
    s.text('wa-l', 265, 218, '', 'lbl sm ink-2');
    s.text('eq', 520, 232, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'A naive datetime is only a wall clock', caption: 'datetime(2026, 7, 4, 14, 30) says "half past two" and nothing else. It cannot be converted, compared with an aware value, or turned into a timestamp without guessing a zone.', lines: [0] },
    { title: 'Attaching a zone adds a rule, not an offset', caption: 'ZoneInfo is a set of rules. For this wall time it answers utcoffset() = -4h (EDT, July) and tzname() = "EDT". The stored fields do not change; replace() only sets tzinfo.', lines: [1],
      patch: { 'ny.r': { cls: 'cell hot' }, 'ny.t': { text: '2026-07-04 14:30 -04:00' }, 'ny-off': { text: 'utcoffset() = -4h (EDT), fold=0' }, rule: { cls: 'panel hot' }, 'rule.t': { text: 'tzinfo answers three questions for a given wall time' }, 'rule.1': { text: 'utcoffset(dt)   dst(dt)   tzname(dt)   — the answers depend on the date' } } },
    { title: 'astimezone first subtracts the offset', caption: 'Step one of any conversion: wall time minus utcoffset() gives the UTC instant. 14:30 - (-4h) = 18:30Z. Every aware datetime is really this instant plus a way of displaying it.', lines: [2],
      patch: { 'ny.r': { cls: 'cell' }, utc: { cls: '' }, 'utc.r': { cls: 'cell hot' }, a1: { cls: 'arrow hot flow' }, 'a1-l': { text: '− (−4h)' }, 'utc-off': { text: 'the instant: what == and - compare' }, rule: { cls: 'panel' } } },
    { title: 'Then the target zone adds its own offset', caption: 'tz.fromutc(18:30Z) asks Tokyo for its offset at that instant: +9h, no DST. 18:30 + 9h = 03:30 on the 5th. The date rolled over; the instant did not move.', lines: [3],
      patch: { 'utc.r': { cls: 'cell' }, a1: { cls: 'arrow' }, tk: { cls: '' }, 'tk.r': { cls: 'cell ok' }, 'tk.t': { text: '2026-07-05 03:30 +09:00' }, a2: { cls: 'arrow ok flow' }, 'a2-l': { text: '+9h' }, 'tk-off': { text: 'utcoffset() = +9h (JST)' } } },
    { title: 'Three faces, one instant', caption: 'ny == tokyo is True and tokyo - ny is 0:00:00, because aware comparison and subtraction happen on the UTC instant. Only naive values compare by their fields.', lines: [4],
      patch: { a2: { cls: 'arrow ok' }, 'ny.r': { cls: 'cell ok' }, 'utc.r': { cls: 'cell ok' }, eq: { text: 'ny == utc == tokyo  →  True' } } },
    { title: 'The offset belongs to the instant, not the zone', caption: 'The same wall time in January is EST, -5h, so it lands at 19:30Z. Never cache "New York is -4"; ask the datetime. This is also why timedelta arithmetic across a DST change needs a trip through UTC.', lines: [1, 2],
      patch: { wny: { cls: '' }, 'wny.r': { cls: 'cell info' }, 'wny.t': { text: '2026-01-04 14:30 -05:00' }, 'wny-off': { text: 'utcoffset() = -5h (EST)' }, wutc: { cls: '' }, 'wutc.r': { cls: 'cell info' }, wa: { cls: 'arrow info' }, 'wa-l': { text: '− (−5h)' }, rule: { cls: 'panel dim' } } },
  ],
};

export default {
  id: 'datetime', name: 'datetime', glyph: 'dt', group: 'essentials', version: '3.12, standard library', keywords: 'date time timedelta timezone zoneinfo utc strftime strptime isoformat fromisoformat',
  tagline: 'Dates, times, durations and zones, without guessing.',
  install: 'built in — from datetime import datetime, UTC', docs: 'https://docs.python.org/3/library/datetime.html', packages: [],
  overview: {
    what: 'datetime gives you four value types: date, time, datetime and timedelta, plus tzinfo for zones. The one idea that matters is naive versus aware: a naive datetime is a wall clock with no zone, an aware one carries a tzinfo and therefore names a real instant. Pair it with zoneinfo (stdlib since 3.9) for real time zones and you rarely need a third-party package.',
    yes: ['Timestamps on records, logs and API payloads (ISO 8601 in, ISO 8601 out).', 'Durations, deadlines and "how long ago" arithmetic.', 'Converting between zones and handling DST correctly.', 'Parsing and formatting with strptime/strftime.'],
    no: ['Fuzzy parsing of "next Tuesday" or "3 days ago" (dateutil, arrow, pendulum).', 'Calendar arithmetic like "plus one month" with business-day rules (dateutil.relativedelta, workalendar).', 'Vectorised date columns (pandas, polars, numpy datetime64).'],
    note: 'Snippets that use <code>zoneinfo</code> load the <code>tzdata</code> package first, because the browser sandbox has no system zone database. On Linux and macOS the OS provides it; on Windows run <code>pip install tzdata</code>.',
  },
  cheatsheet: [
    { id: 'now', title: 'Now and construction', snippets: [
      { title: 'Now, today, UTC', code: `from datetime import datetime, date, UTC

print(datetime.now())                 # naive: local wall clock, no tzinfo
print(datetime.now(UTC))              # aware: tzinfo=UTC
print(datetime.now().astimezone())    # aware: local zone, OS-provided offset
print(date.today())
stamp = datetime.now(UTC).replace(microsecond=0)
print(stamp.isoformat())              # 2026-09-11T14:30:05+00:00`, note: '<code>datetime.UTC</code> (3.11) is an alias of <code>timezone.utc</code>. Prefer <code>now(UTC)</code> over the deprecated <code>utcnow()</code>, which returned a naive value.' },
      { title: 'Build values by hand', code: `from datetime import datetime, date, time

d = date(2026, 9, 11)
t = time(14, 30)
dt = datetime(2026, 9, 11, 14, 30)
print(datetime.combine(d, t) == dt)
print(dt.year, dt.month, dt.day, dt.hour, dt.minute)
print(dt.weekday(), dt.isoweekday(), dt.strftime("%A"))   # 4 5 Friday
print(dt.isocalendar())                                   # (year, week, weekday)
print(dt.replace(day=1, hour=0, minute=0))                # first of the month
print(dt.date(), dt.time(), dt.min.year, dt.max.year)` },
    ] },
    { id: 'parse', title: 'Parse strings', blurb: 'fromisoformat for ISO 8601 (fast, strict); strptime for anything else.', snippets: [
      { title: 'fromisoformat: the fast path', code: `from datetime import datetime, date, time

print(datetime.fromisoformat("2026-09-11T14:30:00"))
print(datetime.fromisoformat("2026-09-11 14:30"))
print(datetime.fromisoformat("2026-09-11T14:30:00Z"))            # 3.11+: Z accepted
print(datetime.fromisoformat("2026-09-11T14:30:00.250+02:00").utcoffset())
print(date.fromisoformat("20260911"), time.fromisoformat("14:30"))
try:
    datetime.fromisoformat("11/09/2026")
except ValueError as e:
    print("ValueError:", e)`, note: 'Since 3.11 it accepts most of ISO 8601, including <code>Z</code> and basic format. It is several times faster than <code>strptime</code>.' },
      { title: 'strptime for custom formats', code: `from datetime import datetime

print(datetime.strptime("11/09/2026 2:30 PM", "%d/%m/%Y %I:%M %p"))
print(datetime.strptime("Sep 11 2026", "%b %d %Y").date())
print(datetime.strptime("2026-W37-5", "%G-W%V-%u"))        # ISO week date
print(datetime.strptime("20260911T143000+0200", "%Y%m%dT%H%M%S%z"))
try:
    datetime.strptime("2026-13-01", "%Y-%m-%d")
except ValueError as e:
    print("ValueError:", e)`, note: 'The result is naive unless the format contains <code>%z</code>. <code>%Z</code> only matches a few names such as UTC; use <code>%z</code> or attach a <code>ZoneInfo</code> afterwards.' },
      { title: 'Dates from a CSV', code: `import csv
from datetime import date

with open("/data/orders.csv", newline="") as f:
    dates = [date.fromisoformat(row["date"]) for row in csv.DictReader(f)]

print(len(dates), "orders from", min(dates), "to", max(dates))
print("span:", (max(dates) - min(dates)).days, "days")
print("weekend orders:", sum(d.weekday() >= 5 for d in dates))
print("in Q4:", sum(d.month >= 10 for d in dates))` },
    ] },
    { id: 'format', title: 'Format and timestamps', snippets: [
      { title: 'isoformat, strftime, f-strings', code: `from datetime import datetime, UTC

dt = datetime(2026, 9, 11, 14, 30, 5, 123456, tzinfo=UTC)
print(dt.isoformat())
print(dt.isoformat(timespec="seconds"))
print(dt.isoformat(sep=" ", timespec="minutes"))
print(dt.strftime("%A %d %B %Y, %H:%M %Z"))
print(dt.strftime("%Y%m%d_%H%M%S"))              # safe in file names
print(f"{dt:%Y-%m-%d} | {dt:%b %d} | {dt:%H:%M}")  # the format spec is strftime
print(str(dt), repr(dt.date()))`, note: 'Common codes: <code>%Y-%m-%d</code>, <code>%H:%M:%S</code>, <code>%a/%A</code> weekday, <code>%b/%B</code> month, <code>%j</code> day of year, <code>%z</code> offset, <code>%Z</code> name.' },
      { title: 'Unix timestamps', code: `from datetime import datetime, UTC
from zoneinfo import ZoneInfo

ts = 1_790_000_000
print(datetime.fromtimestamp(ts, UTC))
print(datetime.fromtimestamp(ts, ZoneInfo("Europe/Berlin")))
dt = datetime(2026, 9, 11, 14, 30, tzinfo=UTC)
print(dt.timestamp())                 # seconds since the epoch (float)
print(int(dt.timestamp() * 1000))     # milliseconds, for JavaScript APIs
naive = datetime(2026, 9, 11, 14, 30)
print(naive.timestamp())              # treated as LOCAL time: avoid`, packages: ['tzdata'], note: 'Always pass a <code>tz</code> to <code>fromtimestamp</code>. Without it the result is naive local time, which changes meaning from machine to machine.' },
    ] },
    { id: 'math', title: 'Arithmetic', snippets: [
      { title: 'timedelta', code: `from datetime import datetime, timedelta

start = datetime(2026, 9, 11, 9, 0)
end = start + timedelta(days=2, hours=3, minutes=15)
gap = end - start
print(end, "|", gap)
print(gap.days, gap.seconds, gap.total_seconds())       # 2 11700 184500.0
print(gap / timedelta(hours=1), "hours")                # divide to get a number
print(timedelta(hours=36) > timedelta(days=1))
print(start - timedelta(weeks=1))
deadline = start + timedelta(days=30)
print((deadline - datetime(2026, 9, 25)).days, "days left")`, note: 'A timedelta only stores days, seconds and microseconds. <code>.seconds</code> is the leftover within a day; use <code>total_seconds()</code> for the whole span.' },
      { title: 'Months and years: replace and clamp', code: `from datetime import date
import calendar

def add_months(d: date, n: int) -> date:
    y, m = divmod(d.month - 1 + n, 12)
    y, m = d.year + y, m + 1
    last = calendar.monthrange(y, m)[1]
    return d.replace(year=y, month=m, day=min(d.day, last))

print(add_months(date(2026, 1, 31), 1))     # 2026-02-28
print(add_months(date(2026, 11, 15), 3))    # 2027-02-15
try:
    date(2024, 2, 29).replace(year=2025)
except ValueError as e:
    print("ValueError:", e)`, note: 'There is no <code>timedelta(months=1)</code> because a month has no fixed length. <code>dateutil.relativedelta</code> does this clamping for you.' },
      { title: 'Buckets and ranges', code: `import csv
from collections import Counter
from datetime import date, timedelta

with open("/data/orders.csv", newline="") as f:
    rows = list(csv.DictReader(f))
by_month = Counter(row["date"][:7] for row in rows)
for month, n in sorted(by_month.items())[:4]:
    print(month, n)

d = date(2025, 10, 1)
d += timedelta(days=(7 - d.weekday()) % 7)           # first Monday on or after Oct 1
mondays = [d + timedelta(weeks=i) for i in range(14)]
mondays = [m for m in mondays if m.year == 2025]
print(mondays[0], "...", mondays[-1], len(mondays), "Mondays in Q4")` },
    ] },
    { id: 'tz', title: 'Time zones', blurb: 'zoneinfo for real zones, timezone for fixed offsets, astimezone to convert.', snippets: [
      { title: 'Aware datetimes with zoneinfo', code: `from datetime import datetime, UTC
from zoneinfo import ZoneInfo

ny = ZoneInfo("America/New_York")
meeting = datetime(2026, 7, 4, 14, 30, tzinfo=ny)
print(meeting, meeting.tzname(), meeting.utcoffset())
print(meeting.astimezone(UTC))
print(meeting.astimezone(ZoneInfo("Asia/Tokyo")))
print(meeting.astimezone(ZoneInfo("Europe/Oslo")).strftime("%H:%M %Z"))
winter = meeting.replace(month=1)
print(winter.tzname(), winter.utcoffset())   # EST, -5h: the offset follows the date`, packages: ['tzdata'], note: 'Pass <code>tzinfo=</code> to the constructor or <code>replace()</code>. Never call <code>ZoneInfo(...).localize</code>; that was pytz.' },
      { title: 'Fixed offsets and UTC', code: `from datetime import datetime, timezone, timedelta, UTC

print(UTC is timezone.utc)
plus2 = timezone(timedelta(hours=2), name="+02")
dt = datetime(2026, 9, 11, 12, tzinfo=plus2)
print(dt.isoformat(), "->", dt.astimezone(UTC).isoformat())

naive = datetime(2026, 9, 11, 12)
print(naive.replace(tzinfo=UTC))    # relabel: same digits, now aware
print(naive.astimezone(UTC))        # convert: assumes naive is LOCAL time
print(dt.tzinfo, dt.utcoffset())`, note: 'A <code>timezone</code> object is one fixed offset with no DST rules. Use it for parsed offsets like <code>+02:00</code>, not for "Berlin".' },
      { title: 'DST: repeated and missing hours', code: `from datetime import datetime, timedelta, UTC
from zoneinfo import ZoneInfo

oslo = ZoneInfo("Europe/Oslo")
# 2025-10-26: clocks go back 03:00 -> 02:00, so 02:30 happens twice
first = datetime(2025, 10, 26, 2, 30, tzinfo=oslo)            # fold=0, the first
second = first.replace(fold=1)
print(first.utcoffset(), second.utcoffset())                  # 2:00:00 1:00:00
print(first.astimezone(UTC), second.astimezone(UTC))

# 2026-03-29: clocks go forward 02:00 -> 03:00, so 02:30 never happens
t0 = datetime(2026, 3, 29, 1, 30, tzinfo=oslo)
print(t0 + timedelta(hours=1))                                # 02:30+01:00: wall clock
print((t0.astimezone(UTC) + timedelta(hours=1)).astimezone(oslo))   # 03:30+02:00: elapsed`, packages: ['tzdata'], note: 'Adding a timedelta to an aware datetime moves the wall clock, not the instant. For "one hour later" go through UTC.' },
    ] },
    { id: 'compare', title: 'Compare, sort, round-trip', snippets: [
      { title: 'Ordering and equality', code: `from datetime import datetime, date, UTC

events = [datetime(2026, 9, 11, 9), datetime(2026, 9, 10, 17), datetime(2026, 9, 11, 8, 30)]
print(sorted(events)[0], max(events))
print(date(2026, 9, 11) == datetime(2026, 9, 11).date())

aware = datetime.now(UTC)
naive = datetime.now()
try:
    aware < naive
except TypeError as e:
    print("TypeError:", e)
print(aware == naive)          # False, no error: equality never raises` },
      { title: 'Round-trip through JSON and SQLite', code: `import json, sqlite3
from datetime import datetime, UTC

stamp = datetime.now(UTC).replace(microsecond=0)
payload = json.dumps({"created": stamp.isoformat()})
back = datetime.fromisoformat(json.loads(payload)["created"])
print(payload, back == stamp)

con = sqlite3.connect(":memory:")
con.execute("create table t(created text)")
con.execute("insert into t values (?)", (stamp.isoformat(),))
raw = con.execute("select created from t").fetchone()[0]
print(raw, datetime.fromisoformat(raw) == stamp)`, note: 'Store ISO 8601 strings with an offset. They sort lexically, every language parses them, and <code>fromisoformat</code> brings them back aware.' },
    ] },
  ],
  concepts: [
    { id: 'aware', title: 'Naive vs aware, and how astimezone converts', intro: 'A conversion is two subtractions: the source offset takes you to UTC, the target offset takes you out again. The offsets come from <code>tzinfo</code> rules evaluated at that instant, which is why DST just works.', explainer: tzExplainer },
  ],
  compare: [
    { title: 'Ways to get the current time', columns: ['datetime.now()', 'datetime.now(UTC)', 'datetime.now().astimezone()', 'datetime.utcnow()', 'time.time()'], rows: [
      ['Aware', false, true, true, false, { part: 'a float' }],
      ['Zone', 'local, unnamed', 'UTC', 'local, with offset', 'UTC (but naive)', 'epoch seconds'],
      ['Safe to store or send', { dots: 1 }, { dots: 5 }, { dots: 4 }, { dots: 1 }, { dots: 4 }],
      ['Status', 'fine for display', 'recommended', 'fine', 'deprecated (3.12)', 'fine for measuring'],
    ], verdict: 'Record and compare in <code>now(UTC)</code>, convert with <code>astimezone(ZoneInfo(...))</code> only when a human reads it. <code>utcnow()</code> gives a naive value that looks like UTC and is treated as local by <code>timestamp()</code>: replace it.' },
    { title: 'Parsing a string', columns: ['fromisoformat', 'strptime', 'fromtimestamp'], rows: [
      ['Input', 'ISO 8601 text', 'any text with a format', 'a number'],
      ['Speed', { dots: 5 }, { dots: 2 }, { dots: 5 }],
      ['Aware result', { part: 'if the text has an offset' }, { part: 'only with %z' }, { part: 'if you pass tz=' }],
      ['Validation', 'strict', 'strict to the format', 'range check only'],
      ['Handles "Sep 11 2026"', false, true, false],
    ], verdict: 'Try <code>fromisoformat</code> first. Fall back to <code>strptime</code> for legacy formats, and reach for <code>dateutil.parser</code> only when the format is genuinely unknown.' },
  ],
  gotchas: [
    { title: 'utcnow() is naive and deprecated', bad: `stamp = datetime.utcnow()
stamp.timestamp()        # wrong unless the machine runs in UTC`, good: `from datetime import datetime, UTC
stamp = datetime.now(UTC)
stamp.timestamp()        # correct everywhere`, why: '<code>utcnow()</code> returns UTC digits with no <code>tzinfo</code>, so every later operation treats them as local time. 3.12 emits a DeprecationWarning for it.' },
    { title: 'replace(tzinfo=) relabels, astimezone() converts', bad: `dt = datetime(2026, 7, 4, 14, 30, tzinfo=UTC)
dt.replace(tzinfo=ZoneInfo("Asia/Tokyo"))
# 14:30+09:00: a different instant, 9 hours earlier`, good: `dt.astimezone(ZoneInfo("Asia/Tokyo"))
# 23:30+09:00: the same instant`, why: '<code>replace</code> swaps the zone and keeps the digits. <code>astimezone</code> keeps the instant and recomputes the digits. Use <code>replace</code> only to make a naive value aware.' },
    { title: 'Naive and aware do not mix', bad: `datetime.now(UTC) - datetime(2026, 9, 11)
# TypeError: can't subtract offset-naive and offset-aware datetimes`, good: `datetime.now(UTC) - datetime(2026, 9, 11, tzinfo=UTC)`, why: 'Ordering and subtraction need a common instant, and a naive value has none. Equality returns <code>False</code> silently, which hides the same bug in <code>in</code> checks and dict lookups.' },
    { title: 'timedelta across a DST change moves the wall clock', bad: `t0 = datetime(2026, 3, 29, 1, 30, tzinfo=ZoneInfo("Europe/Oslo"))
t0 + timedelta(hours=1)
# 02:30+01:00, a time that never existed that night`, good: `(t0.astimezone(UTC) + timedelta(hours=1)).astimezone(ZoneInfo("Europe/Oslo"))
# 03:30+02:00, sixty real minutes later`, why: 'Aware arithmetic is defined on the fields, and the zone is only consulted when you ask for the offset. Elapsed time is a UTC question; calendar time ("same time tomorrow") is a wall-clock question.' },
  ],
  presets: [
    { title: 'Orders per month and weekday', code: `import csv
from collections import Counter
from datetime import date

with open("/data/orders.csv", newline="") as f:
    dates = [date.fromisoformat(r["date"]) for r in csv.DictReader(f)]

months = Counter(d.strftime("%Y-%m") for d in dates)
for month, n in sorted(months.items()):
    print(month, "#" * n)
days = Counter(d.strftime("%a") for d in dates)
print({day: days[day] for day in ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")})` },
  ],
};
