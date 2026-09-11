import { scene } from '../../js/explainer.js';

const ttlExplainer = {
  hold: 3000,
  code: ['r.set("session:42", token, ex=30)', 'r.hset("cart:42", mapping=items)      # no TTL', 'r.set("cache:products", blob, ex=60)', 'r.ttl("session:42")   # seconds left, -1 = none, -2 = gone', 'r.set("session:42", token)             # plain SET drops the TTL'],
  build() {
    const s = scene(760, 320);
    s.rect('space', 20, 40, 720, 190, 'panel', undefined, 10);
    s.text('space.t', 34, 30, 'key space (one database)', 'lbl sm bold ink-2', undefined, 'start');
    s.text('clock', 720, 30, 't = 0 s', 'lbl sm bold ink-2', undefined, 'end');
    const key = (id, y, name, val, ttl, cls = 'cell hid') => {
      const g = s.g(id, 40, y, 'hid');
      s.rect(`${id}.k`, 0, 0, 170, 34, 'cell', g); s.text(`${id}.kt`, 85, 17, name, 'lbl', g);
      s.rect(`${id}.v`, 176, 0, 300, 34, 'cell', g); s.text(`${id}.vt`, 326, 17, val, 'lbl sm', g);
      s.rect(`${id}.x`, 482, 0, 200, 34, 'cell ghost', g); s.text(`${id}.xt`, 582, 17, ttl, 'lbl sm', g);
    };
    key('k1', 60, 'session:42', 'string  "tok_9f3…"', 'TTL 30 s');
    key('k2', 110, 'cart:42', 'hash  {kettle: 1, mug: 2}', 'TTL -1 (never)');
    key('k3', 160, 'cache:products', 'string  "[{…}, {…}]"  (2 KB)', 'TTL 60 s');
    s.text('note', 380, 260, '', 'lbl sm ink-2');
    s.text('note2', 380, 285, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'SET with ex= creates a key and starts its clock', caption: 'Every key lives in one flat namespace. The colon in session:42 is a naming convention, not a hierarchy. ex=30 attaches an expiry 30 seconds from now.', lines: [0],
      patch: { k1: { cls: '' }, 'k1.k': { cls: 'cell hot' }, 'k1.x': { cls: 'cell info' }, clock: { text: 't = 0 s' } } },
    { title: 'Keys without an expiry live until deleted', caption: 'HSET creates a hash. Nothing was said about time, so TTL reports -1. It stays until DEL, FLUSHDB, or an eviction policy such as allkeys-lru needs the memory.', lines: [1, 2],
      patch: { 'k1.k': { cls: 'cell' }, k2: { cls: '' }, 'k2.k': { cls: 'cell hot' }, k3: { cls: '' }, 'k3.x': { cls: 'cell info' }, note: { text: 'volatile keys (with TTL) and persistent keys share the same space' } } },
    { title: 'Time passes; reads do not refresh the clock', caption: '20 seconds later TTL is 10 and 40. GET, HGET and friends never touch the expiry. Only EXPIRE, PEXPIRE, EXPIREAT, PERSIST, or a new SET change it.', lines: [3],
      patch: { 'k2.k': { cls: 'cell' }, clock: { text: 't = 20 s' }, 'k1.xt': { text: 'TTL 10 s' }, 'k3.xt': { text: 'TTL 40 s' }, note: { text: 'r.ttl("session:42") → 10' }, note2: { text: 'r.get("session:42") does not extend it' } } },
    { title: 'Expiry: the key is deleted, lazily or actively', caption: 'At t = 30 the session key is gone. Redis removes expired keys when they are next touched and also samples volatile keys in the background, so memory is freed within a fraction of a second.', lines: [3],
      patch: { clock: { text: 't = 31 s' }, 'k1.k': { cls: 'cell err' }, 'k1.v': { cls: 'cell err' }, 'k1.x': { cls: 'cell err' }, 'k1.xt': { text: 'expired' }, 'k3.xt': { text: 'TTL 29 s' }, note: { text: 'r.ttl("session:42") → -2 (no such key)   r.get(...) → None' }, note2: { text: '' } } },
    { title: 'A plain SET overwrites the value and drops the TTL', caption: 'Writing the key again with SET makes it persistent unless you pass ex= again or keepttl=True. INCR, HSET, LPUSH and other in-place commands keep the existing expiry.', lines: [4],
      patch: { clock: { text: 't = 35 s' }, k1: { cls: '' }, 'k1.k': { cls: 'cell hot' }, 'k1.v': { cls: 'cell' }, 'k1.x': { cls: 'cell ghost' }, 'k1.xt': { text: 'TTL -1 (never)' }, 'k1.vt': { text: 'string  "tok_c81…"' }, 'k3.xt': { text: 'TTL 25 s' }, note: { text: 'r.set("session:42", token, keepttl=True) keeps the clock running' }, note2: { text: 'r.set("session:42", token, ex=30) restarts it' } } },
  ],
};

const pipelineExplainer = {
  hold: 3000,
  code: ['r.incr("hits")          # 1 round trip each', 'r.sadd("seen", user)', 'r.expire("seen", 60)', '', 'with r.pipeline() as p:  # queue locally…', '    p.incr("hits"); p.sadd("seen", user); p.expire("seen", 60)', '    hits, added, ok = p.execute()   # …one write, one read'],
  build() {
    const s = scene(760, 330);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 32, label, cls);
    s.text('ct', 110, 30, 'client (your process)', 'lbl sm bold ink-2');
    s.text('st', 650, 30, 'Redis server', 'lbl sm bold ink-2');
    s.line('cl', 110, 44, 110, 310, 'arrow ghost'); s.line('sl', 650, 44, 650, 310, 'arrow ghost');
    s.text('gap', 380, 60, '← one round trip = network latency, e.g. 0.5 ms', 'lbl sm ink-2 hid');
    // sequential: 3 request/reply pairs
    const pairs = [['INCR hits', '→ 1'], ['SADD seen u1', '→ 1'], ['EXPIRE seen 60', '→ 1']];
    pairs.forEach(([req, rep], i) => {
      const y = 80 + i * 56;
      s.arrow(`q${i}`, 116, y, 644, y, 'arrow hid'); s.text(`qt${i}`, 380, y - 10, req, 'lbl sm hid');
      s.arrow(`p${i}`, 644, y + 22, 116, y + 22, 'arrow hid'); s.text(`pt${i}`, 380, y + 34, rep, 'lbl sm ink-2 hid');
    });
    s.text('cost', 380, 250, '', 'lbl sm bold ink-2');
    // pipeline: queue + one batch
    box('b0', 20, 80, 180, 'INCR hits', 'cell hid'); box('b1', 20, 116, 180, 'SADD seen u1', 'cell hid'); box('b2', 20, 152, 180, 'EXPIRE seen 60', 'cell hid');
    s.text('bq', 110, 200, 'queued, nothing sent yet', 'lbl sm ink-2 hid');
    s.arrow('batch', 206, 116, 644, 116, 'arrow hid'); s.text('batcht', 425, 104, 'MULTI · INCR · SADD · EXPIRE · EXEC', 'lbl sm hid');
    s.arrow('reply', 644, 170, 206, 170, 'arrow hid'); s.text('replyt', 425, 186, '[1, 1, True]', 'lbl sm ink-2 hid');
    box('res', 20, 230, 180, 'hits, added, ok', 'cell hid');
    s.text('atom', 650, 250, '', 'lbl sm ink-2', undefined, 'end');
    return s;
  },
  steps: [
    { title: 'Each command waits for its reply', caption: 'redis-py sends INCR, blocks until the reply arrives, then returns 1. The server is idle while bytes travel; your code is idle while waiting.', lines: [0],
      patch: { gap: { cls: 'lbl sm ink-2' }, q0: { cls: 'arrow hot flow' }, qt0: { cls: 'lbl sm' }, p0: { cls: 'arrow ok' }, pt0: { cls: 'lbl sm ink-2' } } },
    { title: 'Three commands, three round trips', caption: 'Redis executes each command in microseconds. With 0.5 ms of latency per trip, the network dominates: 1.5 ms of waiting for maybe 10 µs of work.', lines: [1, 2],
      patch: { q0: { cls: 'arrow' }, q1: { cls: 'arrow hot flow' }, qt1: { cls: 'lbl sm' }, p1: { cls: 'arrow ok' }, pt1: { cls: 'lbl sm ink-2' }, q2: { cls: 'arrow hot flow' }, qt2: { cls: 'lbl sm' }, p2: { cls: 'arrow ok' }, pt2: { cls: 'lbl sm ink-2' }, cost: { text: '3 round trips ≈ 1.5 ms' } } },
    { title: 'A pipeline queues commands in the client', caption: 'Calls on the pipeline object return the pipeline itself, not values. Nothing has crossed the network; the commands sit in a list in your process.', lines: [4, 5],
      patch: { q0: { cls: 'arrow hid' }, q1: { cls: 'arrow hid' }, q2: { cls: 'arrow hid' }, p0: { cls: 'arrow hid' }, p1: { cls: 'arrow hid' }, p2: { cls: 'arrow hid' }, qt0: { cls: 'hid' }, qt1: { cls: 'hid' }, qt2: { cls: 'hid' }, pt0: { cls: 'hid' }, pt1: { cls: 'hid' }, pt2: { cls: 'hid' }, gap: { cls: 'hid' }, cost: { text: '' },
        b0: { cls: '' }, b1: { cls: '' }, b2: { cls: '' }, 'b0.r': { cls: 'cell hot' }, 'b1.r': { cls: 'cell hot' }, 'b2.r': { cls: 'cell hot' }, bq: { cls: 'lbl sm ink-2' } } },
    { title: 'execute() sends everything in one write', caption: 'The whole batch goes out as one buffer. By default (transaction=True) it is wrapped in MULTI/EXEC, so the server runs the three commands back to back with no other client in between.', lines: [6],
      patch: { batch: { cls: 'arrow hot flow' }, batcht: { cls: 'lbl sm' }, bq: { cls: 'hid' }, atom: { text: 'MULTI … EXEC: atomic on the server' } } },
    { title: 'One read returns every reply, in order', caption: 'execute() returns a list with one entry per queued command, so you unpack it positionally. One round trip instead of three; for 1,000 commands the difference is seconds versus milliseconds.', lines: [6],
      patch: { batch: { cls: 'arrow' }, reply: { cls: 'arrow ok' }, replyt: { cls: 'lbl sm ink-2' }, res: { cls: '' }, 'res.r': { cls: 'cell ok' }, 'b0.r': { cls: 'cell' }, 'b1.r': { cls: 'cell' }, 'b2.r': { cls: 'cell' }, cost: { text: '1 round trip ≈ 0.5 ms' } } },
  ],
};

export default {
  id: 'redis', name: 'redis', glyph: 'rd', group: 'db', version: '5.x (redis-py)', keywords: 'cache key value ttl expire hash list set sorted set leaderboard pipeline pubsub rate limit',
  tagline: 'In-memory data structures over the network: cache, counters, queues.',
  install: 'pip install redis', docs: 'https://redis.readthedocs.io/', packages: ['pip:redis', 'pip:fakeredis', 'sortedcontainers'], runnable: true,
  overview: {
    what: 'redis-py is the client for Redis, a server that keeps strings, hashes, lists, sets and sorted sets in memory and answers commands in microseconds. Each Python method maps to one Redis command with the same name, so the Redis docs are the API docs. On top of that the client adds connection pooling, pipelines, transactions, pub/sub and an asyncio twin under <code>redis.asyncio</code>.',
    yes: ['Caching computed results or API responses with a time-to-live.', 'Counters, rate limits, sessions, feature flags: small hot data read far more often than written.', 'Leaderboards and ranking with sorted sets.', 'Lightweight queues and fan-out with lists, streams or pub/sub.'],
    no: ['The data must survive a crash with zero loss (Redis persistence is periodic; use a database).', 'Queries by anything other than the key (use PostgreSQL, or Redis Stack search).', 'Values larger than a few MB, or a dataset larger than RAM.', 'A durable job queue with retries and visibility timeouts (Celery on RabbitMQ, or SQS).'],
    note: 'There is no Redis server in the browser, so <code>redis.Redis(...)</code>, <code>redis.from_url(...)</code> and <code>redis.asyncio.Redis(...)</code> are transparently backed by <a href="https://github.com/cunla/fakeredis-py">fakeredis</a>, an in-memory implementation of the command set. The code is what you would run against a real server; only the network is missing. Lua scripting and modules are not available in the fake.',
  },
  cheatsheet: [
    { id: 'strings', title: 'Strings, counters, expiry', blurb: 'The simplest type: bytes under a key, optionally with a clock attached.', snippets: [
      { title: 'Connect, set, get, and decode', code: `import redis

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
r.set("greeting", "hello")
print(r.get("greeting"))                  # 'hello' (str, because decode_responses=True)
print(r.get("missing"))                   # None
print(r.exists("greeting", "missing"))    # 1: number of keys that exist
r.mset({"a": 1, "b": 2}); print(r.mget("a", "b", "c"))
r.delete("greeting")
print(r.keys("*"))                        # fine here; use scan_iter in production`, note: 'Without <code>decode_responses=True</code> every reply is <code>bytes</code>. Numbers are always stored as strings; <code>r.get("a")</code> returns <code>"1"</code>, not <code>1</code>.' },
      { title: 'Atomic counters and NX/XX', code: `import redis
r = redis.Redis(decode_responses=True)
r.delete("hits", "lock")

print(r.incr("hits"))            # 1 — creates the key, atomic across clients
print(r.incrby("hits", 10))      # 11
print(r.decr("hits"))            # 10
print(r.incrbyfloat("temp", 0.5))
print(r.set("lock", "worker-1", nx=True))   # True: set only if absent
print(r.set("lock", "worker-2", nx=True))   # None: already held
print(r.set("lock", "worker-2", xx=True))   # True: set only if present
print(r.get("lock"))`, note: '<code>INCR</code> is the building block for counters, ids and rate limits: one command, one round trip, no read-modify-write race.' },
      { title: 'TTL: set, inspect, extend, watch it expire', code: `import redis, time
r = redis.Redis(decode_responses=True)

r.set("session:42", "tok_9f3", ex=30)      # seconds; px= for milliseconds
print(r.ttl("session:42"))                 # 30
r.expire("session:42", 90)                 # extend
print(r.ttl("session:42"))                 # 90
r.persist("session:42"); print(r.ttl("session:42"))   # -1: no expiry
r.set("blink", "x", px=200)
time.sleep(0.3)
print(r.get("blink"), r.ttl("blink"))      # None -2: expired and gone
r.set("session:42", "tok_new", keepttl=True)          # overwrite but keep the clock`, note: 'A plain <code>set()</code> on an existing key removes its TTL. <code>keepttl=True</code> or passing <code>ex=</code> again avoids the surprise.' },
    ] },
    { id: 'hashes', title: 'Hashes and lists', snippets: [
      { title: 'Hash: one key, many fields', code: `import redis
r = redis.Redis(decode_responses=True)
r.delete("user:7")

r.hset("user:7", mapping={"name": "Ann", "plan": "pro", "logins": 0})
r.hincrby("user:7", "logins", 1)
r.hset("user:7", "last_ip", "10.0.0.5")
print(r.hget("user:7", "name"))          # 'Ann'
print(r.hgetall("user:7"))               # whole object as a dict
print(r.hmget("user:7", "plan", "nope")) # ['pro', None]
print(r.hexists("user:7", "plan"), r.hlen("user:7"))
r.hdel("user:7", "last_ip")
print(sorted(r.hkeys("user:7")))`, note: 'Use a hash when you update fields independently. If you always read and write the whole object, a JSON string is simpler and one round trip.' },
      { title: 'List: a queue or a capped log', code: `import redis
r = redis.Redis(decode_responses=True)
r.delete("jobs", "log")

r.rpush("jobs", "resize:1", "resize:2", "email:3")   # append (tail)
print(r.lpop("jobs"))                                # 'resize:1' — FIFO with rpush + lpop
print(r.lrange("jobs", 0, -1))                       # remaining, oldest first
print(r.llen("jobs"))

for i in range(10):                                  # keep only the last 5 entries
    r.lpush("log", f"event {i}")
    r.ltrim("log", 0, 4)
print(r.lrange("log", 0, -1))
# r.blpop("jobs", timeout=5) blocks a worker until an item arrives`, note: '<code>lpush</code> + <code>ltrim</code> is the standard capped log. For a real work queue with acknowledgements look at Streams (<code>xadd</code>, <code>xreadgroup</code>).' },
    ] },
    { id: 'sets', title: 'Sets and sorted sets', snippets: [
      { title: 'Set: membership and set algebra', code: `import redis
r = redis.Redis(decode_responses=True)
r.delete("tags:kettle", "tags:mug", "online")

r.sadd("tags:kettle", "kitchen", "electric", "gift")
r.sadd("tags:mug", "kitchen", "gift", "ceramic")
print(r.sismember("tags:kettle", "gift"))            # True
print(sorted(r.sinter("tags:kettle", "tags:mug")))   # shared tags
print(sorted(r.sdiff("tags:kettle", "tags:mug")))    # only on kettle
print(r.scard("tags:mug"))                           # size
for uid in ["u1", "u2", "u1", "u3"]:                 # unique visitors: duplicates vanish
    r.sadd("online", uid)
print(r.scard("online"), r.srandmember("online") in r.smembers("online"))` },
      { title: 'Sorted set: a leaderboard', code: `import redis
r = redis.Redis(decode_responses=True)
r.delete("board")

r.zadd("board", {"ann": 120, "bo": 95, "cy": 140, "di": 95})
r.zincrby("board", 30, "bo")                         # bo → 125
print(r.zrange("board", 0, 2, desc=True, withscores=True))   # top 3
print(r.zrevrank("board", "ann"), r.zscore("board", "ann"))  # 0-based rank from the top
print(r.zrangebyscore("board", 100, 130))            # everyone between 100 and 130
print(r.zcard("board"), r.zcount("board", 0, 99))
r.zremrangebyrank("board", 0, -4)                    # keep only the top 3
print(r.zrange("board", 0, -1, withscores=True))`, note: 'Scores are floats; members are unique. Ties are ordered lexically by member. Rank queries are O(log N), which is why sorted sets beat "sort the whole table".' },
    ] },
    { id: 'batch', title: 'Pipelines and transactions', blurb: 'Cut round trips, and make read-modify-write safe.', snippets: [
      { title: 'Pipeline: many commands, one round trip', code: `import redis
r = redis.Redis(decode_responses=True)
r.delete("hits", "seen")

with r.pipeline() as pipe:
    pipe.incr("hits")
    pipe.sadd("seen", "u1")
    pipe.expire("seen", 60)
    pipe.get("hits")
    hits, added, ok, val = pipe.execute()   # one list, in order
print(hits, added, ok, val)

with r.pipeline(transaction=False) as pipe:  # batch only, no MULTI/EXEC
    for i in range(1000):
        pipe.set(f"k:{i}", i)
    pipe.execute()
print(r.dbsize())`, note: 'Calls on <code>pipe</code> return the pipeline, not results. Results only exist after <code>execute()</code>. With the default <code>transaction=True</code> the batch is also atomic.' },
      { title: 'WATCH: optimistic transaction', code: `import redis
r = redis.Redis(decode_responses=True)
r.set("stock:kettle", 3)

def buy(qty):
    with r.pipeline() as pipe:
        while True:
            try:
                pipe.watch("stock:kettle")           # abort if it changes before EXEC
                stock = int(pipe.get("stock:kettle"))
                if stock < qty:
                    pipe.unwatch(); return False
                pipe.multi()                         # queue from here on
                pipe.decrby("stock:kettle", qty)
                pipe.execute()
                return True
            except redis.WatchError:
                continue                             # someone else changed it: retry

print(buy(2), buy(2), r.get("stock:kettle"))

# r.transaction(fn, "stock:kettle") wraps exactly this retry loop in one call.
# It is not run here: the in-memory stand-in this page uses does not implement it.`, note: '<code>WATCH</code> is check-and-set: if a watched key changes between WATCH and EXEC the transaction fails with <code>WatchError</code> instead of writing stale data. For hot keys prefer a single atomic command or a Lua script.' },
    ] },
    { id: 'patterns', title: 'Caching, rate limits, locks', snippets: [
      { title: 'Cache-aside with a TTL', code: `import redis, json, time
r = redis.Redis(decode_responses=True)
r.delete("cache:product:101")
calls = 0

def load_product(pid):                 # the slow source of truth
    global calls; calls += 1
    return {"id": pid, "name": "Kettle", "price": 39.5}

def get_product(pid, ttl=300):
    key = f"cache:product:{pid}"
    if (hit := r.get(key)) is not None:
        return json.loads(hit)
    value = load_product(pid)
    r.set(key, json.dumps(value), ex=ttl)
    return value

print(get_product(101), get_product(101))
print("loads:", calls, "ttl:", r.ttl("cache:product:101"))
r.delete("cache:product:101")          # invalidate on write`, note: 'Serialise with JSON, not pickle, so other languages and future versions of your code can read it. Delete the key when the source changes; TTL is the safety net, not the invalidation strategy.' },
      { title: 'Rate limit: fixed window and sliding window', code: `import redis, time
r = redis.Redis(decode_responses=True)
r.delete("rl:fixed:u1", "rl:slide:u1")

def allow_fixed(user, limit=3, window=60):
    key = f"rl:fixed:{user}"
    n = r.incr(key)
    if n == 1:
        r.expire(key, window)          # first hit starts the window
    return n <= limit

def allow_sliding(user, limit=3, window=60):
    key, now = f"rl:slide:{user}", time.time()
    with r.pipeline() as p:
        p.zremrangebyscore(key, 0, now - window)   # drop old hits
        p.zadd(key, {str(now): now})
        p.zcard(key)
        p.expire(key, window)
        count = p.execute()[2]
    return count <= limit

print([allow_fixed("u1") for _ in range(5)])
print([allow_sliding("u1") for _ in range(5)])`, note: 'Fixed windows allow 2× the limit at a boundary. The sorted-set version counts hits in the trailing 60 s and costs one round trip thanks to the pipeline.' },
      { title: 'Lock with SET NX PX', code: `import redis, uuid, time
r = redis.Redis(decode_responses=True)
r.delete("lock:report")

def acquire(name, ttl_ms=5000):
    token = uuid.uuid4().hex
    return token if r.set(f"lock:{name}", token, nx=True, px=ttl_ms) else None

def release(name, token):              # only the holder may release
    key = f"lock:{name}"
    if r.get(key) == token:            # racy without Lua; see note
        r.delete(key); return True
    return False

t = acquire("report"); print("got lock:", bool(t))
print("second caller:", acquire("report"))
print("wrong token:", release("report", "nope"), "holder:", release("report", t))
# built in: with r.lock("lock:report", timeout=5, blocking_timeout=2): ...`, note: 'The TTL guarantees a crashed holder cannot block forever. <code>r.lock()</code> does the same with a Lua script for an atomic compare-and-delete; use it on a real server.' },
    ] },
    { id: 'async', title: 'Pub/sub and asyncio', snippets: [
      { title: 'Publish and subscribe', code: `import redis
r = redis.Redis(decode_responses=True)

sub = r.pubsub(ignore_subscribe_messages=True)
sub.subscribe("orders", "alerts")
r.publish("orders", "order 1042 shipped")
r.publish("alerts", "disk 91%")

for _ in range(4):
    msg = sub.get_message(timeout=0.1)  # non-blocking poll; None when empty
    if msg:
        print(msg["channel"], "->", msg["data"])
sub.unsubscribe(); sub.close()
# long-running: for msg in sub.listen(): ...   (blocks; run in its own thread)`, note: 'Pub/sub is fire-and-forget: a message published with no subscriber is dropped, and a subscriber that was offline never sees it. Use Streams when messages must persist.' },
      { title: 'redis.asyncio', code: `import asyncio
import redis.asyncio as aredis

async def main():
    r = aredis.Redis(decode_responses=True)
    await r.delete("visits")
    await asyncio.gather(*(r.incr("visits") for _ in range(50)))   # concurrent commands
    print(await r.get("visits"))
    async with r.pipeline() as pipe:
        pipe.set("a", 1); pipe.get("a")
        print(await pipe.execute())
    await r.aclose()

asyncio.run(main())`, note: 'Same command names, every call awaited. Commands share a connection pool; one client per application, closed with <code>aclose()</code>.' },
    ] },
  ],
  concepts: [
    { id: 'ttl', title: 'The key space and TTL', intro: 'Every key sits in one flat namespace and may carry an expiry. What starts the clock, what does not, and what happens when it reaches zero.', explainer: ttlExplainer },
    { id: 'pipeline', title: 'Why a pipeline is faster', intro: 'Redis is fast; the network is not. A pipeline trades many small waits for one.', explainer: pipelineExplainer },
  ],
  compare: [
    { title: 'Which data type', columns: ['string', 'hash', 'list', 'set', 'sorted set'], rows: [
      ['Shape', 'bytes / number', 'field → value', 'ordered, duplicates ok', 'unique members', 'unique members with a score'],
      ['Typical use', 'cache blob, counter, flag', 'an object with fields', 'queue, recent-N log', 'tags, unique visitors', 'leaderboard, time index, sliding window'],
      ['Partial update', false, true, { part: 'ends only' }, true, true],
      ['Ordered', false, false, true, false, true],
      ['Range by rank or score', false, false, { part: 'by index' }, false, true],
      ['Key ops', 'GET SET INCR', 'HSET HGET HINCRBY', 'LPUSH RPOP LRANGE', 'SADD SISMEMBER SINTER', 'ZADD ZRANGE ZRANK'],
    ], verdict: 'Start with strings and hashes. Reach for a list when order of arrival matters, a set when uniqueness does, and a sorted set when you need "top N" or "everything between".' },
    { title: 'Batching and atomicity', columns: ['one call per command', 'pipeline(transaction=False)', 'pipeline() (MULTI/EXEC)', 'WATCH + MULTI', 'r.transaction / Lua'], rows: [
      ['Round trips for N commands', 'N', '1', '1', '2+', '1–2'],
      ['Atomic on the server', { part: 'per command' }, false, true, true, true],
      ['Can branch on a read mid-batch', true, false, false, true, { part: 'Lua only' }],
      ['Retries on conflict', { part: 'n/a' }, false, false, 'you write the loop', 'r.transaction does'],
    ], verdict: 'Pipeline for throughput, <code>WATCH</code> when a write depends on a read, Lua (or a single atomic command like <code>INCR</code>) when the key is hot.' },
  ],
  gotchas: [
    { title: 'Replies are bytes unless you ask', bad: `r = redis.Redis()
r.set("n", 1)
r.get("n") == "1"      # False: b'1'`, good: `r = redis.Redis(decode_responses=True)
int(r.get("n")) == 1   # values are strings; convert yourself`, why: 'Redis stores byte strings. <code>decode_responses=True</code> decodes them as UTF-8; numbers still come back as text and need <code>int()</code>.' },
    { title: 'SET silently drops the TTL', bad: `r.set("session:42", token, ex=1800)
...
r.set("session:42", new_token)   # now lives forever`, good: `r.set("session:42", new_token, keepttl=True)
# or: r.set("session:42", new_token, ex=1800)`, why: 'A plain SET replaces the key, expiry included. In-place commands (<code>INCR</code>, <code>HSET</code>, <code>LPUSH</code>) keep it.' },
    { title: 'KEYS blocks the whole server', bad: `for k in r.keys("cache:*"):
    r.delete(k)`, good: `for k in r.scan_iter("cache:*", count=500):
    r.delete(k)
# or r.unlink(*batch) to free memory in the background`, why: 'Redis is single-threaded for commands. <code>KEYS</code> walks every key in one go; with millions of keys every other client stalls. <code>SCAN</code> returns a page at a time.' },
    { title: 'Reading from a pipeline before execute()', bad: `pipe = r.pipeline()
n = pipe.get("hits")     # this is the pipeline object
print(int(n))            # TypeError`, good: `pipe.get("hits"); pipe.incr("hits")
n, _ = pipe.execute()`, why: 'Queued commands have not been sent. Every method on a pipeline returns the pipeline for chaining; the values arrive together from <code>execute()</code>.' },
  ],
  presets: [
    { title: 'Leaderboard with a pipeline', code: `import redis, random
r = redis.Redis(decode_responses=True)
r.delete("board")

players = ["ann", "bo", "cy", "di", "ed"]
with r.pipeline() as pipe:
    for round_no in range(20):
        pipe.zincrby("board", random.randint(1, 10), random.choice(players))
    pipe.execute()

for rank, (name, score) in enumerate(r.zrange("board", 0, -1, desc=True, withscores=True), 1):
    print(f"{rank}. {name:<4} {int(score):>3}")
print("bo is rank", r.zrevrank("board", "bo") + 1)` },
  ],
};
