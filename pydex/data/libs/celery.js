import { scene } from '../../js/explainer.js';

const pipelineExplainer = {
  hold: 3200,
  code: [
    'r = add.delay(2, 3)                 # producer',
    'celery -A proj worker -c 2          # consumer',
    'r.get(timeout=10)                   # result backend',
    'raise self.retry(countdown=8)       # inside the task',
  ],
  build() {
    const s = scene(760, 340);
    s.cell('prod', 20, 40, 140, 36, 'add.delay(2, 3)');
    s.text('prod.l', 90, 92, '', 'lbl sm ink-2');
    s.cell('msg', 30, 110, 120, 26, '', 'cell info hid');
    s.arrow('a1', 162, 58, 208, 58, 'arrow hid');

    const b = s.g('broker', 210, 30);
    s.rect('broker.p', 0, 0, 170, 130, 'panel', b, 8);
    s.text('broker.t', 8, -12, 'broker · queue "default"', 'lbl sm bold ink-2', b, 'start');
    s.cell('q0', 10, 10, 150, 26, 'msg a', 'cell', b);
    s.cell('q1', 10, 44, 150, 26, 'msg b', 'cell', b);
    s.cell('q2', 10, 78, 150, 26, '', 'cell ghost', b);
    s.text('broker.l', 85, 118, 'Redis list / AMQP queue', 'lbl sm ink-2', b);
    s.arrow('a2', 382, 58, 428, 58, 'arrow hid');

    const w = s.g('worker', 430, 30);
    s.rect('worker.p', 0, 0, 310, 130, 'panel', w, 8);
    s.text('worker.t', 8, -12, 'worker · prefork, -c 2', 'lbl sm bold ink-2', w, 'start');
    s.cell('pre', 10, 10, 130, 30, 'prefetch buffer', 'cell', w);
    s.text('pre.l', 75, 56, '', 'lbl sm ink-2', w);
    s.cell('ch1', 160, 10, 140, 30, 'child 1 · idle', 'cell', w);
    s.cell('ch2', 160, 50, 140, 30, 'child 2 · idle', 'cell', w);
    s.text('worker.l', 230, 100, '', 'lbl sm ink-2', w);
    s.arrow('a3', 142, 25, 158, 25, 'arrow hid', w);

    s.arrow('a4', 585, 162, 585, 218, 'arrow hid');
    s.cell('backend', 480, 220, 210, 36, 'result backend', 'cell hid');
    s.text('backend.l', 585, 272, '', 'lbl sm ink-2');
    s.arrow('a5', 478, 238, 172, 238, 'arrow hid');
    s.cell('ar', 20, 220, 150, 36, 'r.get(timeout=10)', 'cell hid');
    s.text('ar.l', 95, 272, '', 'lbl sm ink-2');

    s.path('retry', 'M660 162 L660 190 L295 190 L295 164', 'arrow hid');
    s.text('retry.l', 470, 204, '', 'lbl sm ink-2');
    s.text('foot', 380, 318, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'delay() serialises a message, not a call', caption: 'The task body does not run here. delay() builds a message: task name, JSON args and kwargs, a fresh uuid4 id, headers such as eta, expires and retries=0. task_routes picks the queue. It returns an AsyncResult straight away; if the broker is unreachable it raises kombu.exceptions.OperationalError after its own retries.', lines: [0],
      patch: { 'prod.r': { cls: 'cell hot' }, 'prod.l': { text: 'returns AsyncResult(id)' }, msg: { cls: '' }, 'msg.t': { text: '{id, "add", [2, 3]}' } } },
    { title: 'The broker queues it', caption: 'The message lands at the tail of the queue. With Redis that is a list per queue (LPUSH / BRPOP); with RabbitMQ a real AMQP queue with per-message acknowledgements. Nothing consumes it until a worker subscribed to this queue is free.', lines: [0],
      patch: { a1: { cls: 'arrow hot flow' }, 'prod.r': { cls: 'cell' }, msg: { x: 220, y: 108 }, 'q2.r': { cls: 'cell hot' }, 'q2.t': { text: 'msg c ← ours' } } },
    { title: 'The worker prefetches ahead of time', caption: 'The main worker process reserves messages before a child is free: up to concurrency × worker_prefetch_multiplier (2 × 4 = 8 here). With the default early ack the broker forgets the message at this moment. Reserved messages are invisible to other workers, which is why long tasks want prefetch_multiplier=1 and acks_late=True.', lines: [1],
      patch: { a1: { cls: 'arrow' }, a2: { cls: 'arrow hot flow' }, msg: { x: 440, y: 40 }, 'msg.t': { text: 'msg c' }, 'q2.r': { cls: 'cell ghost' }, 'q2.t': { text: '' }, 'pre.r': { cls: 'cell hot' }, 'pre.l': { text: 'up to 2 × 4 reserved' } } },
    { title: 'A child process runs the task', caption: 'The prefork pool forked the children at startup. The main process hands the message to an idle child, which decodes it, sets self.request (id, retries, hostname, delivery_info) and calls add(2, 3). Soft and hard time limits are enforced from outside the child.', lines: [1],
      patch: { a2: { cls: 'arrow' }, a3: { cls: 'arrow hot' }, 'pre.r': { cls: 'cell' }, msg: { cls: 'hid' }, 'ch1.t': { text: 'child 1 · add(2, 3)' }, 'ch1.r': { cls: 'cell hot' }, 'worker.l': { text: 'time limits · self.request' } } },
    { title: 'The return value goes to the result backend; get() reads it', caption: 'The child returns 5; the worker stores state=SUCCESS plus the serialised result (or FAILURE with the exception and traceback) under celery-task-meta-<id>, expiring after result_expires (1 day). r.get() waits on that key (the Redis backend uses pub/sub, others poll) and re-raises a stored exception. No backend configured means get() raises NotImplementedError.', lines: [2],
      patch: { a3: { cls: 'arrow hid' }, msg: { cls: 'hid' }, 'ch1.t': { text: 'child 1 · idle' }, 'ch1.r': { cls: 'cell' }, a4: { cls: 'arrow ok' }, backend: { cls: '' }, 'backend.r': { cls: 'cell ok' }, 'backend.t': { text: 'celery-task-meta-<id> = 5' }, 'backend.l': { text: 'SUCCESS · expires in 1 day' }, a5: { cls: 'arrow ok' }, ar: { cls: '' }, 'ar.r': { cls: 'cell ok' }, 'ar.l': { text: '→ 5' } } },
    { title: 'retry() re-queues the same task id with a delay', caption: 'Inside the task, self.retry() publishes the message again with retries+1 and an ETA of now + countdown, then raises celery.exceptions.Retry so this run ends with state RETRY. The worker that picks it up holds ETA messages in memory until they are due. After max_retries the exception becomes MaxRetriesExceededError, or the original error with autoretry_for.', lines: [3],
      patch: { a4: { cls: 'arrow hid' }, a5: { cls: 'arrow hid' }, backend: { cls: 'dim' }, ar: { cls: 'dim' }, 'ch1.t': { text: 'child 1 · retry()' }, 'ch1.r': { cls: 'cell err' }, retry: { cls: 'arrow err flow' }, 'retry.l': { text: 'same id · retries=1 · eta=now+8s' }, 'q2.r': { cls: 'cell err' }, 'q2.t': { text: 'msg c (retry 1)' }, foot: { text: 'state: RETRY → runs again → SUCCESS or MaxRetriesExceededError' } } },
  ],
};

export default {
  id: 'celery', name: 'Celery', glyph: 'ce', group: 'cloud', version: '5.5', keywords: 'task queue worker broker redis rabbitmq beat periodic retry chain group chord flower',
  tagline: 'Background tasks: send a message, a worker runs it, a backend keeps the result.',
  install: 'pip install "celery[redis]"', docs: 'https://docs.celeryq.dev/en/stable/', packages: [], runnable: false,
  overview: {
    what: 'Celery turns a Python function into a task: calling .delay() serialises the arguments into a message on a broker (Redis or RabbitMQ), and a separate worker process picks it up, runs it and optionally stores the return value in a result backend. Around that core sit retries, routing to queues, scheduled and periodic tasks (beat), and a canvas for composing tasks into chains, groups and chords.',
    yes: ['Work that should not block a web request: emails, PDFs, image processing, webhooks.', 'Periodic jobs with beat instead of cron scattered across machines.', 'Fan-out and fan-in over many items (group, chord) with retries per item.', 'Scaling consumers independently of producers across many hosts.'],
    no: ['A single process that just needs a background thread (ThreadPoolExecutor, or arq/asyncio for async).', 'Durable workflows with human steps and days-long waits (Temporal, Prefect, Airflow).', 'Streaming or exactly-once event processing (Kafka clients).', 'Django-only, database-backed simplicity (django-q2, Huey, or Django 6 tasks).'],
    note: 'A task needs a broker process and a worker process, so nothing here runs in the browser sandbox. Locally: <code>docker run -p 6379:6379 redis</code>, then <code>celery -A proj worker -l info</code> in one terminal and the snippets in another; in tests, <code>task_always_eager=True</code> (last cheat-sheet group) runs tasks inline with no broker at all.',
  },
  cheatsheet: [
    { id: 'app', title: 'App, tasks, calling', blurb: 'One Celery app per project; tasks are functions the worker can import by name.', snippets: [
      { title: 'The app and its configuration', code: `# proj/celery.py
from celery import Celery

app = Celery(
    "proj",
    broker="redis://localhost:6379/0",          # or "amqp://guest:guest@localhost:5672//"
    backend="redis://localhost:6379/1",         # results; omit for fire-and-forget only
    include=["proj.tasks"],                     # modules to import in the worker
)
app.conf.update(
    task_serializer="json", result_serializer="json", accept_content=["json"],
    timezone="Europe/Berlin", enable_utc=True,
    task_acks_late=True, worker_prefetch_multiplier=1,     # long tasks: one at a time, ack after
    task_reject_on_worker_lost=True,
    task_track_started=True,                    # STARTED state instead of PENDING while running
    result_expires=3600,
    task_default_queue="default",
    task_routes={"proj.tasks.send_email": {"queue": "emails"}},
    broker_connection_retry_on_startup=True,
    broker_transport_options={"visibility_timeout": 3600},  # redis: redeliver unacked after 1 h
    task_time_limit=300, task_soft_time_limit=240,
)
# or keep settings in a module: app.config_from_object("proj.celeryconfig")
# Django: app.config_from_object("django.conf:settings", namespace="CELERY"); app.autodiscover_tasks()`, note: 'Setting names are the lowercase 4.x+ form. JSON is the default serializer since Celery 4; pickle is opt-in and lets any producer execute code on your worker.' },
      { title: 'Define tasks', code: `# proj/tasks.py
import logging
from celery import shared_task
from proj.celery import app

log = logging.getLogger(__name__)

@app.task
def add(x: int, y: int) -> int:
    return x + y

@app.task(bind=True, name="proj.tasks.send_email", queue="emails", max_retries=3, ignore_result=True)
def send_email(self, user_id: int, template: str) -> None:
    log.info("task %s attempt %d on %s", self.request.id, self.request.retries, self.request.hostname)
    user = User.objects.get(pk=user_id)           # fetch fresh inside the task, never pass the object
    mailer.send(user.email, template)

@shared_task                                      # no app import: reusable across apps (Django style)
def resize(path: str, width: int) -> str:
    return f"{path}@{width}"

print(add.name, send_email.name)                  # "proj.tasks.add", "proj.tasks.send_email"
print(add(2, 3))                                  # a task is still a callable: runs inline, no broker`, note: '<code>bind=True</code> passes the task instance as <code>self</code>, which is how you reach <code>self.request</code> and <code>self.retry</code>. Names default to <code>module.function</code>; the worker looks tasks up by name, so both sides must import the same module path.' },
      { title: 'delay, apply_async and signatures', code: `from datetime import datetime, timedelta, UTC
from proj.tasks import add, send_email

r = add.delay(2, 3)                                   # shorthand for apply_async(args=(2, 3))
print(r.id, r.state)                                  # "PENDING" until a worker reports otherwise

r = add.apply_async(args=(2, 3), kwargs={}, countdown=10)          # run in ≥10 s
r = add.apply_async((2, 3), eta=datetime.now(UTC) + timedelta(hours=1))
r = send_email.apply_async((42, "welcome"), queue="emails", priority=9, expires=600)
r = add.apply_async((2, 3), link=send_email.s(42, "sum-ready"), link_error=alert.s())
r = add.apply_async((2, 3), task_id="dedupe-key-2-3", retry=True,
                    retry_policy={"max_retries": 3, "interval_start": 0, "interval_step": 0.2})

# signatures: a call frozen for later, for the canvas, or to hand to another task
sig = add.s(2, 3)                                     # partial: more args can be appended
sig = add.si(2, 3)                                    # immutable: ignores a parent result
sig = add.s(2, 3).set(queue="math", countdown=5)
sig.delay()                                           # or sig.apply_async()
print(add.s(2).clone(args=(2, 3)))`, note: '<code>countdown</code> and <code>eta</code> are held by the worker that reserved the message, not by the broker: a worker restart re-queues them, and ETAs far in the future pile up in memory. For those, schedule with beat or a database.' },
    ] },
    { id: 'results', title: 'Results', snippets: [
      { title: 'AsyncResult: state, wait, inspect', code: `from celery.result import AsyncResult
from celery.exceptions import TimeoutError
from proj.celery import app
from proj.tasks import add

r = add.delay(2, 3)
print(r.id, r.ready(), r.state)            # PENDING | STARTED | RETRY | SUCCESS | FAILURE | REVOKED

try:
    value = r.get(timeout=10)              # blocks; re-raises the task's exception by default
except TimeoutError:
    print("still running")
except Exception as e:
    print("task failed:", e, r.traceback)

print(r.successful(), r.failed(), r.result)   # result is the value or the exception object
value = r.get(propagate=False)             # return the exception instead of raising

# later, elsewhere: rebuild from the id you stored
again = AsyncResult(r.id, app=app)         # or app.AsyncResult(r.id)
print(again.state)
again.forget()                             # delete from the backend
r.revoke(terminate=True)                   # cancel if not started; SIGTERM the child if it has`, note: '<code>PENDING</code> also means "unknown id": the backend has no row until the worker writes one, so a typo in the id looks like a task that has not started. Set <code>task_track_started=True</code> to see STARTED.' },
      { title: 'Chaining on results and error callbacks', code: `from proj.celery import app
from proj.tasks import add, notify, alert, parse

# link: run notify with the result as its first argument
r = add.apply_async((2, 3), link=notify.s("sum ready"), link_error=alert.s())

# a task can return a signature to continue the pipeline
@app.task(bind=True)
def fetch(self, url):
    data = http_get(url)
    return parse.s(data).set(queue="cpu")   # replaces this task's result with parse's

# replace this task entirely (keeps the id, useful for polling)
@app.task(bind=True)
def poll(self, job_id):
    if not done(job_id):
        raise self.replace(poll.si(job_id).set(countdown=30))
    return fetch_result(job_id)

# read a result without a backend round-trip: the worker can be told to keep nothing
@app.task(ignore_result=True)
def fire_and_forget(payload): ...`, note: 'With <code>ignore_result=True</code> (or <code>task_ignore_result</code> globally) the backend stays empty and <code>.get()</code> waits forever. Chords and <code>group(...).get()</code> need a backend regardless.' },
    ] },
    { id: 'retries', title: 'Retries and time limits', snippets: [
      { title: 'Manual retry with backoff', code: `import requests
from celery.exceptions import MaxRetriesExceededError, SoftTimeLimitExceeded
from proj.celery import app

@app.task(bind=True, max_retries=5, soft_time_limit=60, time_limit=90)
def sync_order(self, order_id: int) -> dict:
    try:
        resp = requests.post("https://erp.example/orders", json={"id": order_id}, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        # re-queue this same task id; raises Retry so nothing below runs
        raise self.retry(exc=exc, countdown=min(2 ** self.request.retries * 10, 600))
    except SoftTimeLimitExceeded:
        cleanup(order_id)                    # raised inside the task at soft_time_limit
        raise                                # hard limit kills the child without cleanup
    return resp.json()

try:
    sync_order.delay(1001).get(timeout=700)
except MaxRetriesExceededError:
    print("gave up after 5 retries")`, note: '<code>self.retry()</code> always raises: put it last in the except block. <code>self.request.retries</code> counts from 0. Time limits need the prefork pool; the threads pool cannot interrupt a task.' },
      { title: 'Automatic retries', code: `import requests
from proj.celery import app

@app.task(
    autoretry_for=(requests.RequestException, ConnectionError),
    dont_autoretry_for=(requests.HTTPError,),   # 4xx is not transient
    retry_kwargs={"max_retries": 5},
    retry_backoff=True,           # 1, 2, 4, 8, 16 s… (or an int: the first delay)
    retry_backoff_max=600,        # cap the delay
    retry_jitter=True,            # randomise to avoid thundering herds
    acks_late=True,               # ack after the run, so a killed worker does not lose it
)
def fetch_rates(day: str) -> dict:
    r = requests.get(f"https://fx.example/{day}", timeout=10)
    r.raise_for_status()
    return r.json()

fetch_rates.apply_async(("2026-09-11",), expires=3600)   # stop retrying after an hour, whatever happens`, note: 'After the last retry the original exception is re-raised, not <code>MaxRetriesExceededError</code>. Mixing <code>autoretry_for</code> with a manual <code>self.retry</code> is fine; both use the same counter.' },
    ] },
    { id: 'canvas', title: 'Canvas: chain, group, chord', snippets: [
      { title: 'chain and group', code: `from celery import chain, group
from celery.result import GroupResult
from proj.celery import app
from proj.tasks import add, mul, fetch_page, parse, store

# chain: each result becomes the next signature's first argument
res = chain(add.s(2, 2), mul.s(10), add.s(1))()       # ((2+2)*10)+1
res = (add.s(2, 2) | mul.s(10) | add.s(1)).apply_async()
print(res.get(timeout=10))                            # 41 — the AsyncResult of the LAST task
print(res.parent.get())                               # 40: walk back through .parent

# .si() breaks the result passing when the next task does not want the value
pipeline = fetch_page.s("https://example.com") | parse.s() | store.si("cache-key")

# group: run in parallel, collect a list in submission order
g = group(add.s(i, i) for i in range(10))
gr = g.apply_async()
print(gr.ready(), gr.completed_count())
print(gr.get(timeout=30))                             # [0, 2, 4, ...]
gr.save()                                             # persist the member ids in the backend
print(GroupResult.restore(gr.id, app=app).get())      # later, from the id alone

# chunks: 100 pairs as 10 tasks of 10
add.chunks(zip(range(100), range(100)), 10).apply_async()`, note: 'A chain is one message at a time: the worker that finishes task n publishes task n+1. A group is n messages published at once; <code>gr.get()</code> polls the backend for all of them.' },
      { title: 'chord: fan out, then fan in', code: `from celery import chord, group
from proj.celery import app

@app.task
def score(doc_id: int) -> float:
    return len(str(doc_id)) * 0.1

@app.task
def summarise(scores: list[float]) -> dict:              # receives the list of header results
    return {"n": len(scores), "mean": sum(scores) / len(scores)}

header = group(score.s(i) for i in range(50))
r = chord(header)(summarise.s())                         # or chord(header, summarise.s()).apply_async()
print(r.get(timeout=60))                                 # {"n": 50, "mean": ...}

# on_error for the body if any header task fails; the body still needs every header result
r = chord(header, summarise.s().on_error(alert.s())).apply_async()

# chords inside chains, with an immutable step after
flow = (chord(header, summarise.s()) | notify.si("scores done")).apply_async()`, note: 'A chord needs a result backend: the worker counts header completions there and fires the body when the last one lands. With <code>ignore_result=True</code> on the header tasks the body never runs.' },
    ] },
    { id: 'beat', title: 'Periodic tasks with beat', snippets: [
      { title: 'beat_schedule and crontab', code: `# proj/celery.py (continued)
from celery.schedules import crontab

app.conf.beat_schedule = {
    "nightly-report": {
        "task": "proj.tasks.build_report",
        "schedule": crontab(hour=2, minute=0),                 # 02:00 in app.conf.timezone
        "args": ("daily",),
        "options": {"queue": "reports", "expires": 3600},      # skip if not picked up within an hour
    },
    "poll-every-30s": {"task": "proj.tasks.poll_inbox", "schedule": 30.0},
    "monday-cleanup": {"task": "proj.tasks.cleanup", "schedule": crontab(hour=7, minute=30, day_of_week="mon")},
    "every-3h": {"task": "proj.tasks.sync", "schedule": crontab(minute=0, hour="*/3")},
}

# programmatic alternative
@app.on_after_configure.connect
def setup_periodic(sender, **kwargs):
    sender.add_periodic_task(600.0, poll_inbox.s(), name="poll every 10 min")

# run ONE scheduler process; it only enqueues, workers execute:
#   celery -A proj beat -l info -s /var/lib/celery/beat-schedule
#   celery -A proj beat --scheduler django_celery_beat.schedulers:DatabaseScheduler   # edit in admin
#   celery -A proj worker -B     # embedded beat: development only`, note: 'Beat keeps its last-run times in the schedule file, so a restart does not re-fire everything. Two beats means every job runs twice; use one replica or a lock-based scheduler such as <code>redbeat</code>.' },
    ] },
    { id: 'workers', title: 'Workers, queues, idempotency', snippets: [
      { title: 'Worker CLI flags that matter', code: `# one worker, 8 prefork children, two queues, events on for flower
celery -A proj worker -l INFO -Q default,emails -c 8 -P prefork -E -n w1@%h

# long or memory-hungry tasks: no prefetch, recycle children, hard limits
celery -A proj worker -Q reports -c 2 --prefetch-multiplier=1 \\
    --max-tasks-per-child=200 --max-memory-per-child=500000 \\
    --time-limit=1800 --soft-time-limit=1500

# I/O-bound tasks: hundreds of green threads in one process (pip install gevent)
celery -A proj worker -Q emails -P gevent -c 200

# scale between 3 and 12 children with load; single-process debugging
celery -A proj worker --autoscale=12,3
celery -A proj worker -P solo -l DEBUG

# operations
celery -A proj inspect active           # what is running, per worker
celery -A proj inspect reserved         # prefetched but not started
celery -A proj inspect stats
celery -A proj control revoke <task_id> --terminate
celery -A proj purge                    # drop every queued message (asks first)
celery -A proj status`, note: 'Each queue you route to must be listed in some worker\'s <code>-Q</code>, or its messages wait forever. <code>-P threads</code> works without extra packages but cannot enforce time limits.' },
      { title: 'acks_late and idempotent tasks', code: `import redis
from proj.celery import app

r = redis.Redis()

@app.task(bind=True, acks_late=True, reject_on_worker_lost=True, autoretry_for=(Exception,), retry_backoff=True)
def charge(self, order_id: int, amount_cents: int) -> str:
    # acks_late: the message is acked AFTER this returns, so a killed worker → redelivery,
    # which means this body can run twice. Make the second run a no-op.
    key = f"charged:{order_id}"
    if not r.set(key, self.request.id, nx=True, ex=86400):
        return "already charged"
    try:
        payment_api.charge(order_id, amount_cents, idempotency_key=key)   # pass the key downstream too
    except Exception:
        r.delete(key)                       # release the claim so the retry can try again
        raise
    return "charged"

# Django: enqueue only once the row is committed, or the worker may not find it
from django.db import transaction
def create_order(request):
    order = Order.objects.create(...)
    transaction.on_commit(lambda: charge.delay(order.id, order.total_cents))`, note: 'Without <code>acks_late</code> a task is acked when reserved: a worker OOM-killed mid-task loses it silently. With it, on Redis the <code>visibility_timeout</code> (1 h default) must exceed your longest task or it is redelivered while still running.' },
    ] },
    { id: 'monitoring', title: 'Monitoring and testing', snippets: [
      { title: 'flower, events, inspect from Python', code: `# pip install flower
#   celery -A proj flower --port=5555 --basic-auth=admin:s3cret --persistent=True
#   → http://localhost:5555 : workers, queues, per-task success/failure/runtime, revoke buttons, a REST API
#   workers must run with -E (or worker_send_task_events=True) for task-level data

from proj.celery import app

insp = app.control.inspect(timeout=2)
print(insp.active())                     # {"w1@host": [{"id": ..., "name": ..., "args": ...}]}
print(insp.reserved(), insp.scheduled())  # prefetched; ETA/countdown waiting
print(insp.stats()["w1@host"]["pool"]["max-concurrency"])

app.control.revoke("a1b2…", terminate=True, signal="SIGKILL")
app.control.rate_limit("proj.tasks.fetch_rates", "10/m")
app.control.add_consumer("emails", destination=["w1@host"])   # start consuming a queue at runtime

# queue depth on redis (there is no broker API for it in celery itself)
import redis
print(redis.Redis().llen("emails"))

# flower's API from a script
# curl -u admin:s3cret http://localhost:5555/api/tasks?state=FAILURE&limit=20`, note: 'Prometheus scrapes flower at <code>/metrics</code>. Signals (<code>task_prerun</code>, <code>task_failure</code>, <code>task_retry</code>) in <code>celery.signals</code> are the hook for your own logging or Sentry.' },
      { title: 'Tests: eager mode, apply(), and mocking delay', code: `# conftest.py / test_tasks.py — pip install pytest pytest-celery
import pytest
from unittest import mock
from proj.celery import app
from proj.tasks import add, send_email, charge

@pytest.fixture(autouse=True)
def eager():
    app.conf.update(task_always_eager=True, task_eager_propagates=True,  # run inline; raise, do not store
                    task_store_eager_result=False)
    yield
    app.conf.update(task_always_eager=False)

def test_add_runs_inline():
    r = add.delay(2, 3)                       # EagerResult: already finished
    assert r.get() == 5 and r.successful()

def test_body_directly():
    assert add(2, 3) == 5                     # the plain function
    assert add.apply(args=(2, 3)).get() == 5  # through the task machinery, still no broker

def test_view_enqueues_without_running(client):
    with mock.patch("proj.views.charge.delay") as delay:
        client.post("/orders", data={...})
        delay.assert_called_once_with(mock.ANY, 1999)

# a real worker in-process when eager mode hides too much (retries, routing):
@pytest.fixture(scope="session")
def celery_config():
    return {"broker_url": "memory://", "result_backend": "cache+memory://"}

def test_with_worker(celery_app, celery_worker):
    @celery_app.task
    def mul(x, y): return x * y
    celery_worker.reload()
    assert mul.delay(6, 7).get(timeout=5) == 42`, note: 'Eager mode skips the broker, the serializer and the worker: it will not catch an unserialisable argument or a wrong queue. The <code>celery_app</code>/<code>celery_worker</code> fixtures come from the <code>celery.contrib.pytest</code> plugin (enable with <code>pytest -p celery.contrib.pytest</code> or the pytest-celery package).' },
    ] },
  ],
  concepts: [
    { id: 'pipeline', title: 'From delay() to get(): the message, the worker, the backend', intro: 'A task call is a message that changes hands four times: producer to broker, broker to worker main process, main process to a child, and the child\'s return value to the result backend. Retries re-enter the same loop with the same id.', explainer: pipelineExplainer },
  ],
  compare: [
    { title: 'Ways to call a task', columns: ['.delay()', '.apply_async()', '.s() / .si()', '.apply()'], rows: [
      ['Sends a message to the broker', true, true, { part: 'when you call .delay()/.apply_async() on it' }, false],
      ['Options: countdown, eta, queue, expires, link', false, true, { part: 'via .set(...)' }, false],
      ['Returns', 'AsyncResult', 'AsyncResult', 'Signature', 'EagerResult (ran inline)'],
      ['Argument style', 'add.delay(2, 3)', 'apply_async(args=(2, 3), kwargs={})', 'add.s(2, 3)', 'apply(args=(2, 3))'],
      ['Use it for', 'the common case', 'routing and timing control', 'canvas building blocks, callbacks', 'tests and debugging'],
    ], verdict: '<code>.delay()</code> until you need an option, then <code>.apply_async()</code>. Anything that composes with other tasks starts life as a signature.' },
    { title: 'Canvas primitives', columns: ['chain', 'group', 'chord', 'map / starmap / chunks'], rows: [
      ['Execution', 'sequential', 'parallel', 'parallel header, then one body', 'one task iterates the items'],
      ['Result passing', 'each result → next first arg', 'none between members', 'list of header results → body', 'list returned by the one task'],
      ['Messages published', 'one at a time', 'one per member, up front', 'one per header member + body', 'one (or one per chunk)'],
      ['Needs a result backend', false, { part: 'for .get() / .save()' }, true, false],
      ['Returns', 'AsyncResult of the last task', 'GroupResult', 'AsyncResult of the body', 'AsyncResult'],
      ['Good for', 'pipelines', 'independent fan-out', 'fan-out then aggregate', 'many tiny items with one overhead'],
    ], note: 'Combine freely: a chain can contain groups and chords, and a group of chains is normal.' },
  ],
  gotchas: [
    { title: 'Passing ORM objects (or anything not JSON) as arguments', bad: `order = Order.objects.get(pk=1)
send_invoice.delay(order)
# kombu.exceptions.EncodeError: Object of type Order is not JSON serializable
# (with pickle: it "works" and the worker gets a stale snapshot, possibly before commit)`, good: `send_invoice.delay(order.pk)

@app.task
def send_invoice(order_id: int):
    order = Order.objects.get(pk=order_id)   # fresh row, current state`, why: 'Arguments cross a process boundary as a message: ids, strings, numbers, small dicts. Fetching inside the task also means the worker sees whatever was committed by the time it runs, which is the state you actually want to act on.' },
    { title: 'No result backend, but you call .get()', bad: `app = Celery("proj", broker="redis://localhost:6379/0")
add.delay(2, 3).get()
# NotImplementedError: No result backend is configured.
chord(group(...), summarise.s())()   # body never fires`, good: `app = Celery("proj", broker="redis://localhost:6379/0",
             backend="redis://localhost:6379/1")
app.conf.result_expires = 3600
# and for tasks nobody reads: @app.task(ignore_result=True)`, why: 'The broker only carries requests; results need their own store. Once a backend exists every task writes to it unless told not to, so set <code>result_expires</code> and mark fire-and-forget tasks <code>ignore_result=True</code> to keep Redis from filling up.' },
    { title: 'Every replica runs beat, so every job runs N times', bad: `# Dockerfile / Procfile used by 4 replicas
CMD celery -A proj worker -B -l info`, good: `# workers, scaled freely
CMD celery -A proj worker -l info
# exactly one of these, anywhere
CMD celery -A proj beat -l info -s /var/lib/celery/schedule
# or a scheduler that takes a lock: celery-redbeat`, why: 'Beat is a scheduler that enqueues messages on a timer; it has no idea another beat exists. <code>-B</code> embeds one in each worker, which is convenient on a laptop and a duplicate-job generator in production.' },
    { title: 'A killed worker loses the task unless acks are late, and then it may run twice', bad: `@app.task
def import_file(path): ...      # acked when reserved
# OOM kill, deploy restart, spot instance reclaimed → task vanishes, state stays PENDING`, good: `@app.task(acks_late=True, reject_on_worker_lost=True)
def import_file(path):
    if already_imported(path):  # idempotent: safe to redeliver
        return
    ...
# redis: broker_transport_options={"visibility_timeout": 7200} > longest run`, why: 'Early ack (the default) trades durability for at-most-once execution. <code>acks_late</code> flips that to at-least-once: the message returns to the queue when the connection drops or, on Redis, when <code>visibility_timeout</code> passes, so the body must tolerate a second run.' },
  ],
  presets: [],
};
