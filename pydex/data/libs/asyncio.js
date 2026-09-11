import { scene } from '../../js/explainer.js';

const loopExplainer = {
  hold: 3000,
  code: ['async def fetch(name, delay):', '    await asyncio.sleep(delay)   # hands control back', '    return name', 'await asyncio.gather(fetch("a", 2), fetch("b", 1), fetch("c", 3))'],
  build() {
    const s = scene(760, 320);
    const X0 = 120, PX = 170; // px per second
    s.text('t', 20, 22, 'one thread, one event loop', 'lbl bold', undefined, 'start');
    // time axis
    for (let t = 0; t <= 3; t++) { s.line(`tk${t}`, X0 + t * PX, 44, X0 + t * PX, 230, 'arrow'); s.reg.get(`tk${t}`).style.markerEnd = 'none'; s.reg.get(`tk${t}`).style.strokeDasharray = '2 4'; s.text(`tl${t}`, X0 + t * PX, 244, `${t}s`, 'lbl sm ink-2'); }
    const tasks = [['a', 2], ['b', 1], ['c', 3]];
    tasks.forEach(([n, d], i) => {
      const y = 60 + i * 56;
      s.text(`n${i}`, 20, y + 14, `fetch("${n}", ${d})`, 'code', undefined, 'start');
      s.rect(`run${i}`, X0, y, 14, 28, 'cell hot hid', undefined, 3);           // runs until the await
      s.rect(`wait${i}`, X0 + 14, y + 8, d * PX - 14, 12, 'cell ghost hid', undefined, 3);  // waiting
      s.rect(`done${i}`, X0 + d * PX, y, 14, 28, 'cell ok hid', undefined, 3);  // resumes
      s.text(`dl${i}`, X0 + d * PX + 24, y + 14, '', 'lbl sm ink-2', undefined, 'start');
    });
    s.text('total', 20, 290, '', 'lbl sm bold', undefined, 'start');
    s.text('seq', 20, 308, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Three coroutines are scheduled', caption: 'gather wraps each coroutine in a Task. Nothing runs until the loop gets control, which happens at the await.', lines: [3] },
    { title: 'Each task runs until its first await', caption: 'Task a runs, reaches await asyncio.sleep(2) and yields. The loop immediately starts b, then c. All three are now waiting on timers.', lines: [1],
      patch: { run0: { cls: 'cell hot' }, run1: { cls: 'cell hot' }, run2: { cls: 'cell hot' }, wait0: { cls: 'cell ghost' }, wait1: { cls: 'cell ghost' }, wait2: { cls: 'cell ghost' } } },
    { title: 'At 1 s, b resumes', caption: 'Its timer fires, the loop wakes b, which returns "b". The loop goes back to waiting; a and c still have time to run.', lines: [2],
      patch: { done1: { cls: 'cell ok' }, dl1: { text: 'returns "b"' } } },
    { title: 'At 2 s, a resumes', caption: 'Awaits are resumed in the order their events complete, not in the order the tasks were created.', lines: [2],
      patch: { done0: { cls: 'cell ok' }, dl0: { text: 'returns "a"' } } },
    { title: 'At 3 s, c resumes and gather returns', caption: 'gather preserves the input order: ["a", "b", "c"]. Total wall time is the longest task, 3 s, not the sum, 6 s.', lines: [3],
      patch: { done2: { cls: 'cell ok' }, dl2: { text: 'returns "c" → gather → ["a", "b", "c"]' }, total: { text: 'total: 3 s (concurrent)' }, seq: { text: 'sequential awaits would take 2 + 1 + 3 = 6 s; a blocking time.sleep would also take 6 s' } } },
  ],
};

export default {
  id: 'asyncio', name: 'asyncio', glyph: 'aio', group: 'essentials', version: '3.12, standard library', keywords: 'async await coroutine event loop concurrency task gather',
  tagline: 'Concurrency for waiting: run many slow I/O operations on one thread.',
  install: 'built in — import asyncio', docs: 'https://docs.python.org/3/library/asyncio.html', packages: [],
  overview: {
    what: 'asyncio runs coroutines on a single-threaded event loop. When a coroutine awaits something slow (a socket, a timer, a subprocess), it hands control back and another coroutine runs. It makes I/O-bound programs fast without threads, and it is the foundation of FastAPI, httpx, aiohttp and most modern network libraries.',
    yes: ['Many network calls at once: APIs, web scraping, websockets.', 'Servers that hold thousands of idle connections.', 'Orchestrating subprocesses and timers.'],
    no: ['CPU-bound work (multiprocessing, or a compiled library that releases the GIL).', 'Code that only calls blocking libraries (threads are simpler).', 'A script that does one thing at a time; async adds ceremony with no gain.'],
    note: 'The sandbox already runs inside an event loop, so <code>asyncio.run(main())</code> is rewritten to <code>await main()</code> when you press Run. Everything else is standard asyncio.',
  },
  cheatsheet: [
    { id: 'basics', title: 'Coroutines and tasks', snippets: [
      { title: 'async def, await, gather', code: `import asyncio, time

async def fetch(name, delay):
    await asyncio.sleep(delay)          # stands in for network I/O
    return f"{name} done"

async def main():
    t0 = time.perf_counter()
    results = await asyncio.gather(fetch("a", 0.6), fetch("b", 0.3), fetch("c", 0.9))
    print(results, f"in {time.perf_counter() - t0:.2f}s (not 1.8s)")

asyncio.run(main())`, note: 'Calling <code>fetch("a", 1)</code> creates a coroutine object; nothing runs until it is awaited or wrapped in a Task.' },
      { title: 'create_task for fire-and-track', code: `import asyncio

async def worker(n):
    await asyncio.sleep(0.2 * n)
    print("worker", n, "finished")
    return n * n

async def main():
    tasks = [asyncio.create_task(worker(n), name=f"w{n}") for n in range(1, 4)]
    print("scheduled:", [t.get_name() for t in tasks])
    for coro in asyncio.as_completed(tasks):        # in completion order
        print("got", await coro)
    print("all done:", all(t.done() for t in tasks))

asyncio.run(main())`, note: 'Keep a reference to every task you create. The loop only holds weak references; an un-referenced task can be garbage-collected mid-flight.' },
      { title: 'TaskGroup (3.11+)', code: `import asyncio

async def step(n):
    await asyncio.sleep(0.1 * n)
    if n == 3:
        raise ValueError("step 3 failed")
    return n

async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(step(n)) for n in range(1, 5)]
    except* ValueError as eg:
        print("group failed:", [str(e) for e in eg.exceptions])
    print([t.result() if not t.cancelled() and t.exception() is None else "x" for t in tasks])

asyncio.run(main())`, note: 'When one task fails the group cancels the others and raises an ExceptionGroup. <code>gather</code> without <code>return_exceptions</code> leaves the others running.' },
    ] },
    { id: 'control', title: 'Timeouts, limits, cancellation', snippets: [
      { title: 'asyncio.timeout and wait_for', code: `import asyncio

async def slow():
    await asyncio.sleep(2)
    return "never"

async def main():
    try:
        async with asyncio.timeout(0.3):
            await slow()
    except TimeoutError:
        print("timed out after 0.3s")
    try:
        await asyncio.wait_for(slow(), timeout=0.2)
    except TimeoutError:
        print("wait_for timed out too")

asyncio.run(main())` },
      { title: 'Semaphore to cap concurrency', code: `import asyncio, time

sem = asyncio.Semaphore(3)         # at most 3 in flight
active = 0

async def call(i):
    global active
    async with sem:
        active += 1
        print(f"start {i} (active={active})")
        await asyncio.sleep(0.2)
        active -= 1
        return i

async def main():
    t0 = time.perf_counter()
    await asyncio.gather(*(call(i) for i in range(7)))
    print(f"7 calls, 3 at a time: {time.perf_counter() - t0:.1f}s")

asyncio.run(main())` },
      { title: 'Cancellation is cooperative', code: `import asyncio

async def job():
    try:
        while True:
            await asyncio.sleep(0.1)
            print("tick")
    except asyncio.CancelledError:
        print("cleaning up, then re-raising")
        raise                       # always re-raise

async def main():
    t = asyncio.create_task(job())
    await asyncio.sleep(0.35)
    t.cancel()
    try:
        await t
    except asyncio.CancelledError:
        print("task cancelled:", t.cancelled())

asyncio.run(main())` },
    ] },
    { id: 'patterns', title: 'Patterns', snippets: [
      { title: 'Producer / consumer with a Queue', code: `import asyncio

async def producer(q):
    for i in range(6):
        await q.put(i)
        await asyncio.sleep(0.05)
    await q.put(None)               # sentinel

async def consumer(q, name):
    while (item := await q.get()) is not None:
        print(name, "processed", item)
        await asyncio.sleep(0.12)
    await q.put(None)               # pass the sentinel on

async def main():
    q = asyncio.Queue(maxsize=2)    # back-pressure: put() waits when full
    await asyncio.gather(producer(q), consumer(q, "c1"), consumer(q, "c2"))

asyncio.run(main())` },
      { title: 'Async iteration and context managers', code: `import asyncio

class Ticker:
    def __init__(self, n): self.n = n
    def __aiter__(self): return self
    async def __anext__(self):
        if self.n == 0: raise StopAsyncIteration
        self.n -= 1; await asyncio.sleep(0.05); return self.n

async def numbers():                # async generator
    for i in range(3):
        await asyncio.sleep(0.02); yield i

class Conn:
    async def __aenter__(self): print("open"); return self
    async def __aexit__(self, *exc): print("close")

async def main():
    async with Conn():
        print([x async for x in Ticker(3)], [x async for x in numbers()])

asyncio.run(main())` },
      { title: 'Blocking code via to_thread', run: false, code: `import asyncio, time, requests

def blocking_download(url):
    return requests.get(url, timeout=5).status_code      # sync library

async def main():
    # run sync functions in the default thread pool without blocking the loop
    codes = await asyncio.gather(*(asyncio.to_thread(blocking_download, u) for u in urls))
    print(codes)

asyncio.run(main())`, note: 'Not runnable in the browser (no threads). <code>to_thread</code> is the bridge for libraries that only offer sync APIs.' },
    ] },
  ],
  concepts: [
    { id: 'loop', title: 'What the event loop does with an await', intro: 'Concurrency without threads: every <code>await</code> is a place where the loop can switch to another task.', explainer: loopExplainer },
  ],
  compare: [
    { title: 'Running several coroutines', columns: ['gather', 'TaskGroup', 'create_task + as_completed', 'wait'], rows: [
      ['Results in input order', true, { part: 'read task.result()' }, false, false],
      ['Cancels siblings on failure', false, true, false, false],
      ['Process results as they arrive', false, false, true, { part: 'FIRST_COMPLETED' }],
      ['Python version', 'any', '3.11+', 'any', 'any'],
    ], verdict: '<code>TaskGroup</code> for structured work that should fail together, <code>gather</code> for a simple fan-out, <code>as_completed</code> when early results matter.' },
    { title: 'Waiting primitives', columns: ['asyncio.sleep', 'time.sleep'], rows: [
      ['Yields to the loop', true, false],
      ['Other tasks progress meanwhile', true, false],
      ['Use inside async def', true, false],
    ] },
  ],
  gotchas: [
    { title: 'Forgetting await', bad: `async def main():
    fetch("a", 1)     # RuntimeWarning: coroutine was never awaited`, good: `    await fetch("a", 1)
    # or: task = asyncio.create_task(fetch("a", 1))`, why: 'Calling a coroutine function only creates the coroutine object. It runs when awaited or scheduled as a Task.' },
    { title: 'A blocking call freezes everything', bad: `async def handler():
    data = requests.get(url)       # every other task waits
    time.sleep(1)`, good: `async def handler():
    async with httpx.AsyncClient() as c:
        data = await c.get(url)
    await asyncio.sleep(1)`, why: 'The loop can only switch at an <code>await</code>. Sync I/O never awaits, so nothing else runs until it returns.' },
    { title: 'asyncio.run inside a running loop', bad: `# in Jupyter, or inside another coroutine
asyncio.run(main())   # RuntimeError: asyncio.run() cannot be called from a running event loop`, good: `await main()          # notebooks already have a loop
# in scripts, asyncio.run(main()) is the right entry point`, why: 'There is one loop per thread. Notebooks (and this sandbox) start it for you.' },
    { title: 'Fire-and-forget tasks disappear', bad: `asyncio.create_task(save(record))    # may never finish`, good: `tasks.add(asyncio.create_task(save(record)))
# or await it, or use a TaskGroup`, why: 'The loop keeps only weak references. Hold the task somewhere until it is done.' },
  ],
  presets: [
    { title: 'Concurrent mock API calls', code: `import asyncio, time, httpx

async def get(client, path):
    r = await client.get(path)
    return path, r.status_code, len(r.content)

async def main():
    t0 = time.perf_counter()
    async with httpx.AsyncClient(base_url="https://api.pydex.local", timeout=5) as client:
        results = await asyncio.gather(*(get(client, p) for p in ["/products", "/employees", "/orders?limit=5", "/status/404"]))
    for r in results:
        print(r)
    print(f"{time.perf_counter() - t0:.3f}s")

asyncio.run(main())`, packages: ['httpx'] },
  ],
};
