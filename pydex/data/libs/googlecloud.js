import { scene } from '../../js/explainer.js';

const pubsubExplainer = {
  hold: 3200,
  code: [
    'future = publisher.publish(topic, b"...", region="North")',
    'msg_id = future.result()',
    'subscriber.subscribe(sub, callback=handle)',
    'def handle(msg): ...; msg.ack()   # or msg.nack()',
  ],
  build() {
    const s = scene(760, 330);
    s.cell('pub', 20, 40, 140, 36, 'publisher.publish()');
    s.text('pub.l', 90, 92, '', 'lbl sm ink-2');
    s.cell('batch', 20, 110, 140, 32, 'client-side batch', 'cell ghost hid');
    s.arrow('a1', 162, 58, 218, 58, 'arrow hid');

    s.cell('topic', 220, 40, 140, 36, 'topic: orders');
    s.text('topic.l', 290, 92, '', 'lbl sm ink-2');
    s.arrow('a2', 362, 58, 418, 42, 'arrow hid');
    s.arrow('a3', 362, 58, 418, 116, 'arrow hid');

    s.cell('subA', 420, 22, 150, 36, 'sub: billing', 'cell');
    s.cell('subB', 420, 98, 150, 36, 'sub: analytics', 'cell');
    s.text('sub.l', 495, 180, 'independent cursors', 'lbl sm ink-2');
    s.arrow('a4', 572, 40, 628, 40, 'arrow hid');
    s.cell('cb', 630, 22, 110, 36, 'handle(msg)', 'cell hid');
    s.text('cb.l', 685, 100, '', 'lbl sm ink-2');
    s.path('a5', 'M685 60 L685 150 L560 150 L560 136', 'arrow hid');

    // message tokens
    s.cell('m0', 30, 150, 110, 26, 'msg · 7 KB', 'cell info hid');
    s.cell('mA', 430, 60, 110, 26, 'msg copy', 'cell info hid');
    s.cell('mB', 430, 136, 110, 26, 'msg copy', 'cell info hid');

    // outcome row
    s.cell('ack', 20, 220, 200, 36, 'msg.ack() → lease released', 'cell hid');
    s.cell('nack', 240, 220, 240, 36, 'nack() / deadline missed → redelivered', 'cell hid');
    s.cell('dlq', 500, 220, 240, 36, 'N attempts → dead-letter topic', 'cell hid');
    s.text('foot', 380, 300, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'publish() returns a future immediately', caption: 'data must be bytes; attributes are str→str. Nothing is sent yet: the client buffers messages into a batch until 100 messages, 1 MB or 10 ms have accumulated (BatchSettings), then makes one request. Holding the future is how you learn whether that request succeeded.', lines: [0],
      patch: { 'pub.r': { cls: 'cell hot' }, 'pub.l': { text: 'returns a Future' }, batch: { cls: '' }, m0: { cls: '' } } },
    { title: 'The topic stores the message and assigns an id', caption: 'The batch is sent; the service persists each message, stamps message_id and publish_time, and replies. future.result() resolves to the id, or raises the publish error. Until you call it, failures are invisible.', lines: [1],
      patch: { a1: { cls: 'arrow hot flow' }, 'topic.r': { cls: 'cell hot' }, 'topic.l': { text: 'message_id · publish_time' }, m0: { x: 235, y: 104 }, 'pub.r': { cls: 'cell' }, batch: { cls: 'dim' } } },
    { title: 'Fan-out: every subscription gets its own copy', caption: 'Subscriptions are independent cursors on the topic. Each one receives every message published after it was created, and keeps it until it is acked or retention expires (7 days by default). A topic with no subscriptions drops messages on the floor. A filter on a subscription can skip messages by attribute.', lines: [],
      patch: { a2: { cls: 'arrow hot' }, a3: { cls: 'arrow hot' }, m0: { cls: 'dim' }, mA: { cls: '' }, mB: { cls: '' }, 'topic.r': { cls: 'cell' }, 'subA.r': { cls: 'cell hot' }, 'subB.r': { cls: 'cell hot' } } },
    { title: 'Streaming pull leases messages to your callback', caption: 'subscribe() opens a bidirectional stream and runs handle(msg) on a thread pool. Each delivered message is leased: the ack deadline starts at the subscription default (10 s) and the client extends it in the background while your callback runs, up to max_lease_duration. FlowControl caps how many are outstanding at once.', lines: [2],
      patch: { a2: { cls: 'arrow' }, a3: { cls: 'arrow' }, 'subB.r': { cls: 'cell' }, a4: { cls: 'arrow hot flow' }, cb: { cls: '' }, 'cb.r': { cls: 'cell hot' }, 'cb.l': { text: 'lease: 10 s, auto-extended' }, mA: { x: 640, y: 60 } } },
    { title: 'ack() finishes it; anything else redelivers', caption: 'ack() tells the service to drop the message for this subscription. nack(), an exception before ack, a crash, or a lease that expires all send it back to the queue, so delivery is at least once and duplicates are normal. Make handlers idempotent (message_id, an ordering key, a dedup table). A dead-letter topic catches messages that fail N times.', lines: [3],
      patch: { a4: { cls: 'arrow' }, a5: { cls: 'arrow err' }, 'cb.r': { cls: 'cell' }, mA: { cls: 'hid' }, ack: { cls: '' }, 'ack.r': { cls: 'cell ok' }, nack: { cls: '' }, 'nack.r': { cls: 'cell err' }, dlq: { cls: '' }, foot: { text: 'at-least-once: the same message_id can arrive twice' } } },
    { title: 'Other subscriptions are unaffected', caption: 'billing acked its copy; analytics still holds the message until its own consumer acks it. This is why one topic can feed a database writer, a metrics job and an email sender without any of them knowing about the others.', lines: [],
      patch: { a5: { cls: 'arrow hid' }, 'subA.r': { cls: 'cell ok' }, 'subB.r': { cls: 'cell hot' }, 'mB.r': { cls: 'cell hot' }, foot: { text: 'billing: done · analytics: 1 unacked message' } } },
  ],
};

export default {
  id: 'googlecloud', name: 'google-cloud', glyph: 'gc', group: 'cloud', version: 'storage 3 · bigquery 3 · pubsub 2 · firestore 2', keywords: 'gcp gcs storage bigquery pubsub firestore secret manager adc service account emulator',
  tagline: 'One client library per Google Cloud service, sharing auth and retries.',
  install: 'pip install google-cloud-storage google-cloud-bigquery google-cloud-pubsub google-cloud-firestore google-cloud-secret-manager', docs: 'https://cloud.google.com/python/docs/reference', packages: [], runnable: false,
  overview: {
    what: 'The google-cloud-* packages are separate libraries, one per service, that share a base: google-auth for credentials (Application Default Credentials), google-api-core for retries, timeouts and exception types, and gRPC or REST transports underneath. Each exposes a Client whose methods map to service concepts: buckets and blobs, datasets and jobs, topics and subscriptions, collections and documents.',
    yes: ['Files and backups in Cloud Storage, with signed URLs for browsers.', 'Analytics and warehousing in BigQuery, straight into pandas.', 'Decoupling services with Pub/Sub topics and subscriptions.', 'Document data with realtime needs in Firestore; secrets in Secret Manager.'],
    no: ['A single unified SDK object like boto3 (each service is its own package and Client).', 'Async-first code (only some clients have AsyncClient variants; Firestore does).', 'Local development without Docker or gcloud emulators.', 'Legacy REST discovery APIs (google-api-python-client covers those).'],
    note: 'These clients need Google credentials and a network path to Google APIs, or a running emulator, so nothing here runs in the browser sandbox. Locally: <code>gcloud auth application-default login</code> against a real project, or the emulators. <code>gcloud emulators pubsub start</code> and <code>gcloud emulators firestore start</code> ship with the SDK; <code>fake-gcs-server</code> covers Cloud Storage; BigQuery has no official emulator (the community <code>bigquery-emulator</code> works for simple queries). The last cheat-sheet group shows how to point the clients at them.',
  },
  cheatsheet: [
    { id: 'auth', title: 'Auth, clients, retries', blurb: 'Every Client() finds credentials the same way; you rarely pass them by hand.', snippets: [
      { title: 'Application Default Credentials and service accounts', code: `import google.auth
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google.cloud import storage

# ADC: GOOGLE_APPLICATION_CREDENTIALS → gcloud user creds → attached service account (GCE, Cloud Run, GKE)
creds, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
print(project, type(creds).__name__)

client = storage.Client()                        # same lookup, done for you
client = storage.Client(project="my-proj")       # project from env: GOOGLE_CLOUD_PROJECT

# explicit service-account key (CI, or when you need a private key to sign URLs)
sa = service_account.Credentials.from_service_account_file(
    "/secrets/sa.json", scopes=["https://www.googleapis.com/auth/devstorage.read_write"],
)
client = storage.Client(project=sa.project_id, credentials=sa)

# a bearer token for a raw HTTP call
creds.refresh(Request())
print(creds.token[:12], "…", creds.expiry)`, note: 'On a laptop run <code>gcloud auth application-default login</code> once; in production attach a service account to the workload and pass nothing. Key files are the last resort, and rotating them is on you.' },
      { title: 'Retries and timeouts per call', code: `from google.api_core import exceptions, retry
from google.cloud import storage, bigquery
from google.cloud.storage.retry import DEFAULT_RETRY

# what to retry, how long to keep trying: timeout is the overall budget, not one attempt
patient = retry.Retry(
    predicate=retry.if_exception_type(exceptions.ServiceUnavailable, exceptions.TooManyRequests,
                                      exceptions.DeadlineExceeded),
    initial=1.0, maximum=16.0, multiplier=2.0, timeout=120.0,
)

blob = storage.Client().bucket("pydex-demo").blob("raw/orders.csv")
data = blob.download_as_bytes(retry=patient, timeout=30)     # timeout= is the per-request HTTP timeout

# storage ships a tuned default you can adjust instead of building one
blob.upload_from_filename("orders.csv", retry=DEFAULT_RETRY.with_timeout(300).with_delay(initial=1.5, maximum=45))

# the same two keywords exist on every google-cloud method
rows = bigquery.Client().query_and_wait("SELECT 1 AS one", retry=patient, wait_timeout=60)
try:
    storage.Client().get_bucket("does-not-exist")
except exceptions.NotFound as e:                              # api_core exceptions, not HTTP codes
    print(e.code, e.message)`, note: 'Non-idempotent writes are not retried by default: Storage only retries uploads that carry a precondition such as <code>if_generation_match</code>. <code>exceptions.GoogleAPICallError</code> is the base class; <code>NotFound</code>, <code>PermissionDenied</code>, <code>AlreadyExists</code>, <code>Conflict</code> are the ones you catch.' },
    ] },
    { id: 'storage', title: 'Cloud Storage', snippets: [
      { title: 'Buckets and blobs', code: `from google.api_core.exceptions import PreconditionFailed
from google.cloud import storage

client = storage.Client()
bucket = client.bucket("pydex-demo")            # no API call; get_bucket() would fetch metadata
blob = bucket.blob("raw/orders.csv")            # a handle; nothing exists yet

blob.upload_from_filename("orders.csv", content_type="text/csv")
bucket.blob("cfg/flags.json").upload_from_string('{"beta": true}', content_type="application/json")

# create only if absent: generation 0 means "no object"
try:
    bucket.blob("locks/nightly").upload_from_string("", if_generation_match=0)
except PreconditionFailed:
    print("someone else holds it")

text = bucket.blob("cfg/flags.json").download_as_text()
blob.download_to_filename("/tmp/orders.csv")
with bucket.blob("raw/big.parquet").open("rb") as f:      # streamed, file-like
    head = f.read(1024)

blob.reload()                                   # fetch metadata
print(blob.size, blob.content_type, blob.updated, blob.md5_hash)
blob.metadata = {"source": "erp"}; blob.patch()
bucket.copy_blob(blob, client.bucket("pydex-archive"), "orders-2026.csv")
blob.delete()`, note: '<code>gs://bucket/path/to/key</code> is one flat key; "folders" are a UI illusion. Uploads over 8 MB become resumable automatically (<code>chunk_size</code> on the blob).' },
      { title: 'List by prefix, one level at a time', code: `from google.cloud import storage

client = storage.Client()

# everything under a prefix, lazily paged
total = 0
for blob in client.list_blobs("pydex-demo", prefix="raw/2026/"):
    total += blob.size
print(f"{total / 1e6:.1f} MB")

# one "directory" level: delimiter makes sub-prefixes show up separately
it = client.list_blobs("pydex-demo", prefix="raw/", delimiter="/")
files = [b.name for b in it]                    # iterate first…
print(files, sorted(it.prefixes))               # …then prefixes is populated

# fields= trims the response when you only need names
names = [b.name for b in client.list_blobs("pydex-demo", max_results=1000, fields="items(name),nextPageToken")]` },
      { title: 'Signed URLs', code: `from datetime import timedelta
import google.auth
from google.auth.transport.requests import Request
from google.cloud import storage

client = storage.Client()
blob = client.bucket("pydex-demo").blob("reports/q3.pdf")

# with a service-account key file: the private key signs locally
url = blob.generate_signed_url(version="v4", expiration=timedelta(minutes=15), method="GET")
print(url[:80], "…")

# upload URL: the uploader must send exactly this Content-Type
put_url = blob.generate_signed_url(version="v4", expiration=timedelta(minutes=5), method="PUT",
                                   content_type="application/pdf")

# on GCE / Cloud Run / GKE there is no private key: ask the IAM signBlob API instead
creds, _ = google.auth.default()
creds.refresh(Request())
url = blob.generate_signed_url(
    version="v4", expiration=timedelta(minutes=15), method="GET",
    service_account_email=creds.service_account_email, access_token=creds.token,
)`, note: 'The IAM route needs <code>roles/iam.serviceAccountTokenCreator</code> on the service account for itself. V4 URLs last at most 7 days. A signed URL is computed locally: it does not prove the object exists.' },
    ] },
    { id: 'bigquery', title: 'BigQuery', snippets: [
      { title: 'Parameterised query into a DataFrame', code: `from google.cloud import bigquery

client = bigquery.Client()                      # pip install "google-cloud-bigquery[pandas]" for to_dataframe

sql = """
SELECT region, COUNT(*) AS orders, ROUND(SUM(quantity * unit_price), 2) AS revenue
FROM \`my-proj.shop.orders\`
WHERE status = @status AND order_date >= @since
GROUP BY region ORDER BY revenue DESC
"""
cfg = bigquery.QueryJobConfig(query_parameters=[
    bigquery.ScalarQueryParameter("status", "STRING", "shipped"),
    bigquery.ScalarQueryParameter("since", "DATE", "2026-01-01"),
])

# dry run first: how many bytes will this bill?
dry = client.query(sql, job_config=bigquery.QueryJobConfig(dry_run=True, use_query_cache=False, query_parameters=cfg.query_parameters))
print(f"{dry.total_bytes_processed / 1e9:.2f} GB")

rows = client.query_and_wait(sql, job_config=cfg)   # runs, waits, returns a RowIterator
for row in rows:
    print(row["region"], row.orders, row.revenue)  # by key or attribute

df = client.query_and_wait(sql, job_config=cfg).to_dataframe()
print(df.dtypes)`, note: 'Named parameters (<code>@status</code>) are the only safe way to put values in SQL. <code>query_and_wait</code> (3.15+) replaces <code>query(...).result()</code>; the job object is still there via <code>client.query</code> when you need its id or statistics.' },
      { title: 'Load a DataFrame or a GCS file', code: `import pandas as pd
from google.cloud import bigquery

client = bigquery.Client()
table_id = "my-proj.shop.orders_daily"

df = pd.read_csv("orders.csv", parse_dates=["order_date"])
job = client.load_table_from_dataframe(               # needs pyarrow; schema inferred from dtypes
    df, table_id,
    job_config=bigquery.LoadJobConfig(write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE),
)
job.result()                                          # blocks; raises on failure
print(client.get_table(table_id).num_rows)

# big files: point BigQuery at GCS instead of pushing bytes through your process
job = client.load_table_from_uri(
    "gs://pydex-demo/raw/2026/*.csv", table_id,
    job_config=bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV, skip_leading_rows=1, autodetect=True,
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        time_partitioning=bigquery.TimePartitioning(field="order_date"),
    ),
)
job.result()

# a few rows, right now (streaming; not for bulk, cannot be deleted for ~90 min)
errors = client.insert_rows_json(table_id, [{"order_id": 1, "region": "North", "quantity": 2}])
assert not errors, errors`, note: 'Load jobs are free and batch-oriented; streaming inserts cost per row. Use <code>WRITE_TRUNCATE</code> to replace, <code>WRITE_APPEND</code> to add, and partition on a date column so queries scan less.' },
    ] },
    { id: 'pubsub', title: 'Pub/Sub', snippets: [
      { title: 'Publish with futures and batching', code: `import json
from concurrent import futures
from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient(
    batch_settings=pubsub_v1.types.BatchSettings(max_messages=100, max_bytes=1_000_000, max_latency=0.05),
)
topic = publisher.topic_path("my-proj", "orders")

pending = []
for order in [{"id": 1, "region": "North"}, {"id": 2, "region": "South"}]:
    data = json.dumps(order).encode()                              # bytes only
    fut = publisher.publish(topic, data, region=order["region"], source="web")   # attributes: str → str
    fut.add_done_callback(lambda f: print("published", f.result()))
    pending.append(fut)

futures.wait(pending, return_when=futures.ALL_COMPLETED)         # or fut.result(timeout=30) each
print([f.result() for f in pending])                             # message ids

# ordered delivery per key needs ordering enabled on the publisher AND the subscription
ordered = pubsub_v1.PublisherClient(publisher_options=pubsub_v1.types.PublisherOptions(enable_message_ordering=True))
ordered.publish(topic, b"first", ordering_key="customer-42").result()`, note: 'Always resolve the futures before the process exits, or a batch may never be sent. A failed publish with an ordering key pauses that key until you call <code>publisher.resume_publish(topic, key)</code>.' },
      { title: 'Subscribe with a callback (streaming pull)', code: `import json
from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1

subscriber = pubsub_v1.SubscriberClient()
sub = subscriber.subscription_path("my-proj", "orders-billing")

def handle(message: pubsub_v1.subscriber.message.Message) -> None:
    order = json.loads(message.data)
    print(message.message_id, message.attributes.get("region"), message.delivery_attempt, order)
    try:
        bill(order)                       # must be idempotent: the same id can arrive twice
    except TransientError:
        message.nack()                    # back to the queue, redelivered with backoff
        return
    message.ack()

flow = pubsub_v1.types.FlowControl(max_messages=50, max_lease_duration=600)   # cap outstanding work
pull = subscriber.subscribe(sub, callback=handle, flow_control=flow)  # returns immediately; callbacks run on threads
print("listening on", sub)

with subscriber:                          # closes the gRPC channel on exit
    try:
        pull.result(timeout=300)          # block the main thread; None → forever
    except TimeoutError:
        pull.cancel()                     # stop pulling…
        pull.result()                     # …and wait for in-flight callbacks to finish`, note: 'For scripts and cron jobs, synchronous pull is simpler: <code>resp = subscriber.pull(request={"subscription": sub, "max_messages": 10})</code>, then <code>subscriber.acknowledge(request={"subscription": sub, "ack_ids": [m.ack_id for m in resp.received_messages]})</code>.' },
    ] },
    { id: 'firestore', title: 'Firestore', snippets: [
      { title: 'Documents: set, update, get, delete', code: `from google.cloud import firestore

db = firestore.Client(project="my-proj")             # database="(default)" unless you have several
ref = db.collection("orders").document("o-1001")     # a path; nothing is read yet

ref.set({"region": "North", "total": 129.9, "items": ["kettle"],
         "created": firestore.SERVER_TIMESTAMP})     # create or overwrite
ref.set({"note": "gift"}, merge=True)                # add fields, keep the rest
ref.update({                                         # fails if the document does not exist
    "status": "shipped",
    "total": firestore.Increment(5),
    "items": firestore.ArrayUnion(["card"]),
    "note": firestore.DELETE_FIELD,
    "updated": firestore.SERVER_TIMESTAMP,
})

snap = ref.get()
print(snap.exists, snap.id, snap.to_dict(), snap.update_time)
print(snap.get("total"))                             # a single field, dotted paths allowed

_, new_ref = db.collection("orders").add({"region": "South"})   # auto id
print(new_ref.id)
sub = ref.collection("events").document()            # subcollection, auto id
sub.set({"kind": "shipped"})
ref.delete()                                         # subcollections are NOT deleted with the parent` },
      { title: 'Queries, batches, transactions', code: `from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

db = firestore.Client()
orders = db.collection("orders")

q = (orders.where(filter=FieldFilter("region", "==", "North"))
           .where(filter=FieldFilter("total", ">=", 100))     # composite index needed; the error links to it
           .order_by("total", direction=firestore.Query.DESCENDING)
           .limit(5))
for snap in q.stream():                                       # lazy; .get() returns a list
    print(snap.id, snap.to_dict()["total"])

print(orders.where(filter=FieldFilter("status", "in", ["new", "paid"])).count().get()[0][0].value)

# up to 500 writes, atomically
batch = db.batch()
for i in range(3):
    batch.set(orders.document(f"o-{i}"), {"region": "East", "total": i * 10})
batch.commit()

# read-then-write with retries on contention
@firestore.transactional
def reserve(tx: firestore.Transaction, ref, qty: int) -> bool:
    stock = ref.get(transaction=tx).get("stock")               # all reads before any write
    if stock < qty:
        return False
    tx.update(ref, {"stock": stock - qty})
    return True

print(reserve(db.transaction(), db.collection("products").document("p-1"), 2))`, note: 'Firestore queries are index-backed: no joins, no OR across fields without <code>Or</code> filters, and every field combination you filter and sort on needs an index. Realtime: <code>q.on_snapshot(callback)</code> streams changes.' },
    ] },
    { id: 'secrets', title: 'Secret Manager', snippets: [
      { title: 'Read the latest version, add a new one', code: `from google.cloud import secretmanager

client = secretmanager.SecretManagerServiceClient()
project = "my-proj"                                  # project id or number

def get_secret(name: str, version: str = "latest") -> str:
    path = f"projects/{project}/secrets/{name}/versions/{version}"
    resp = client.access_secret_version(request={"name": path})
    return resp.payload.data.decode("utf-8")

DB_PASSWORD = get_secret("db-password")               # read once at startup, not per request

# create a secret, then push versions to it (rotation = add a version, then disable the old one)
parent = f"projects/{project}"
client.create_secret(request={"parent": parent, "secret_id": "api-key",
                              "secret": {"replication": {"automatic": {}}}})
ver = client.add_secret_version(request={"parent": f"{parent}/secrets/api-key",
                                         "payload": {"data": b"sk-live-…"}})
print(ver.name)                                       # …/versions/1

for s in client.list_secrets(request={"parent": parent}):
    print(s.name.rsplit("/", 1)[-1])`, note: 'Each <code>access_secret_version</code> is a billed API call and an audit-log entry; cache the value in the process. The runtime identity needs <code>roles/secretmanager.secretAccessor</code>, ideally per secret rather than per project.' },
    ] },
    { id: 'emulators', title: 'Emulators and tests', snippets: [
      { title: 'Point the clients at local emulators', code: `# conftest.py — run first:
#   gcloud emulators pubsub start --project=demo --host-port=localhost:8085
#   gcloud emulators firestore start --host-port=localhost:8080
#   docker run -p 4443:4443 fsouza/fake-gcs-server -scheme http
import os
import pytest
from google.auth.credentials import AnonymousCredentials
from google.cloud import firestore, pubsub_v1, storage

@pytest.fixture(scope="session", autouse=True)
def emulators():
    os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"      # the clients read these at construction
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    os.environ["STORAGE_EMULATOR_HOST"] = "http://localhost:4443"
    os.environ["GOOGLE_CLOUD_PROJECT"] = "demo"

@pytest.fixture
def gcs():
    client = storage.Client(project="demo", credentials=AnonymousCredentials())
    client.create_bucket("pydex-demo")
    yield client

@pytest.fixture
def topic():
    pub = pubsub_v1.PublisherClient()                          # emulator: insecure channel, no creds needed
    path = pub.topic_path("demo", "orders")
    pub.create_topic(request={"name": path})
    yield path
    pub.delete_topic(request={"topic": path})

def test_roundtrip(gcs, topic):
    gcs.bucket("pydex-demo").blob("a.txt").upload_from_string("hi")
    assert gcs.bucket("pydex-demo").blob("a.txt").download_as_text() == "hi"
    db = firestore.Client(project="demo")
    db.collection("t").document("x").set({"n": 1})
    assert db.collection("t").document("x").get().to_dict() == {"n": 1}`, note: 'Emulators keep no data between restarts and enforce no IAM, so they test your code, not your permissions. For unit tests without any process, <code>mock.patch("mymodule.storage.Client")</code> is often enough.' },
    ] },
  ],
  concepts: [
    { id: 'pubsub', title: 'Pub/Sub: publish, fan-out, lease, ack', intro: 'A message travels from a publish future, through the topic, into one copy per subscription, and out through a leased delivery that ends in ack or redelivery. The at-least-once guarantee falls out of that lease.', explainer: pubsubExplainer },
  ],
  compare: [
    { title: 'Where does this data belong?', columns: ['Cloud Storage', 'BigQuery', 'Firestore'], rows: [
      ['Unit of data', 'object (bytes) under a key', 'row in a columnar table', 'document (nested map) in a collection'],
      ['Query', 'by prefix only', 'full SQL, joins, window functions', 'indexed filters, order, limit; no joins'],
      ['Read latency', 'tens of ms per object', 'seconds per query', 'single-digit ms per document'],
      ['Write pattern', 'whole object at a time', 'batch loads; streaming for trickles', 'single-document transactions, batches of 500'],
      ['Consistency', 'strong', 'strong after job completes', 'strong; realtime listeners'],
      ['Pay for', 'GB stored, operations, egress', 'bytes scanned, storage', 'reads/writes/deletes per document'],
      ['Fits', 'files, backups, data lake, static assets', 'analytics, reporting, ML features', 'app state, user data, mobile sync'],
    ], verdict: 'Files go to Storage, analysis goes to BigQuery, application records go to Firestore. A common pipeline is all three: Storage as landing zone, a BigQuery load job, Firestore for what the app reads per request.' },
    { title: 'Consuming a Pub/Sub subscription', columns: ['streaming pull (subscribe)', 'synchronous pull', 'push subscription'], rows: [
      ['Needs a public endpoint', false, false, true],
      ['Throughput', { dots: 5 }, { dots: 2 }, { dots: 4 }],
      ['Flow control', 'FlowControl(max_messages, max_bytes)', 'max_messages per call', 'service-side, by response latency'],
      ['Ack', 'message.ack() in the callback', 'acknowledge(ack_ids=[...])', 'HTTP 2xx from your handler'],
      ['Process shape', 'long-running worker', 'script, cron, Cloud Function', 'Cloud Run / HTTP service, scales to zero'],
      ['Exactly-once option', true, true, false],
    ], note: 'Throughput dots are judgement calls, not measurements.', verdict: 'Workers that never stop: streaming pull. Batch jobs that drain a queue then exit: synchronous pull. Serverless HTTP services: push.' },
  ],
  gotchas: [
    { title: 'At-least-once means your handler runs twice', bad: `def handle(message):
    charge_card(json.loads(message.data))   # redelivered after a crash or lease expiry → double charge
    message.ack()`, good: `def handle(message):
    order = json.loads(message.data)
    if not mark_processed(message.message_id):    # SET NX in Redis, or a unique-key insert
        message.ack(); return                       # duplicate: drop it
    charge_card(order)
    message.ack()`, why: 'A message is redelivered whenever the service does not see an ack: crashes, timeouts, network retries, or a slow callback that outlives its lease. Exactly-once delivery on the subscription reduces this but only within Pub/Sub; your side effects still need an idempotency key.' },
    { title: 'Signed URLs need a private key, and ADC on GCE has none', bad: `blob.generate_signed_url(version="v4", expiration=timedelta(hours=1))
# AttributeError: you need a private key to sign credentials.
# the credentials you are currently using <class 'google.auth.compute_engine.credentials.Credentials'> just contains a token.`, good: `creds, _ = google.auth.default()
creds.refresh(Request())
blob.generate_signed_url(version="v4", expiration=timedelta(hours=1),
                         service_account_email=creds.service_account_email,
                         access_token=creds.token)   # signs via the IAM signBlob API`, why: 'Metadata-server credentials are bearer tokens; signing needs RSA. The IAM route calls <code>signBlob</code> on the service account, which requires it to hold <code>roles/iam.serviceAccountTokenCreator</code> on itself. Locally, user credentials from <code>gcloud auth application-default login</code> cannot sign either: impersonate a service account instead.' },
    { title: 'LIMIT does not limit what BigQuery bills', bad: `client.query_and_wait("SELECT * FROM \`shop.events\` LIMIT 10")
# scans and bills the entire table`, good: `cfg = bigquery.QueryJobConfig(dry_run=True)
job = client.query("SELECT user_id, ts FROM \`shop.events\` WHERE DATE(ts) = '2026-09-01'", job_config=cfg)
print(job.total_bytes_processed)          # check first; select columns; filter on the partition
# maximum_bytes_billed=10**9 in the config makes big scans fail instead of pay`, why: 'BigQuery is columnar and bills bytes read, not rows returned. Cost drops by selecting fewer columns and by filtering on a partition or cluster column; <code>LIMIT</code> is applied after the scan. Preview rows with <code>client.list_rows(table, max_results=10)</code>, which is free.' },
    { title: 'Positional where() is deprecated; query results are not free to iterate twice', bad: `docs = db.collection("orders").where("region", "==", "North").get()
# UserWarning: Detected filter using positional arguments…
for d in docs: ...
for d in docs: ...   # fine here, but with .stream() the second loop is empty`, good: `from google.cloud.firestore_v1.base_query import FieldFilter
q = db.collection("orders").where(filter=FieldFilter("region", "==", "North"))
docs = list(q.stream())        # materialise once if you need two passes`, why: '<code>FieldFilter</code> is the supported form and is what <code>And</code>/<code>Or</code> compose. <code>stream()</code> is a generator that pages through the API as you go; <code>get()</code> loads everything, which is convenient for small results and a memory problem for large ones.' },
  ],
  presets: [],
};
