import { scene } from '../../js/explainer.js';

const chainExplainer = {
  hold: 3200,
  code: [
    'session = boto3.Session(profile_name="dev")',
    's3 = session.client("s3", region_name="eu-west-1")',
    'pages = s3.get_paginator("list_objects_v2").paginate(Bucket="b")',
    'for page in pages: page.get("Contents", [])',
  ],
  build() {
    const s = scene(760, 330);
    s.cell('sess', 20, 40, 140, 36, 'boto3.Session()');
    s.text('sess.l', 90, 92, 'profile · region · creds', 'lbl sm ink-2');
    s.arrow('a1', 162, 58, 188, 58);

    const p = s.g('chain', 190, 30, 'dim');
    s.rect('chain.p', 0, 0, 210, 186, 'panel', p, 8);
    s.text('chain.t', 8, -12, 'credential chain (first hit wins)', 'lbl sm bold ink-2', p, 'start');
    ['1 explicit kwargs', '2 env vars', '3 ~/.aws/credentials', '4 ~/.aws/config (SSO, role)', '5 container / IMDS']
      .forEach((l, i) => s.cell(`c${i}`, 10, 10 + i * 34, 190, 28, l, 'cell', p));
    s.arrow('a2', 402, 58, 428, 58, 'arrow hid');

    s.cell('client', 430, 40, 150, 36, 'client("s3")', 'cell hid');
    s.text('region', 505, 92, '', 'lbl sm ink-2');
    s.arrow('a3', 505, 100, 505, 118, 'arrow hid');
    s.cell('req', 430, 120, 150, 36, 'ListObjectsV2', 'cell hid');
    s.cell('sig', 430, 170, 150, 36, 'SigV4 signature', 'cell hid');
    s.arrow('a4', 582, 138, 618, 138, 'arrow hid');
    s.cell('aws', 620, 120, 120, 36, 'S3 endpoint', 'cell hid');
    s.text('aws.l', 680, 172, '', 'lbl sm ink-2');

    s.cell('pag', 20, 250, 140, 36, 'paginate()', 'cell hid');
    s.arrow('b0', 162, 268, 198, 268, 'arrow hid');
    s.cell('p0', 200, 250, 110, 36, 'page 1 · 1000', 'cell hid');
    s.arrow('b1', 312, 268, 338, 268, 'arrow hid');
    s.cell('p1', 340, 250, 110, 36, 'page 2 · 1000', 'cell hid');
    s.arrow('b2', 452, 268, 478, 268, 'arrow hid');
    s.cell('p2', 480, 250, 110, 36, 'page 3 · 217', 'cell hid');
    s.text('done', 660, 268, '', 'lbl sm ink-2');
    s.text('tok', 380, 306, '', 'lbl sm ink-2');
    return s;
  },
  steps: [
    { title: 'A Session is configuration, not a connection', caption: 'Session() records a profile name, a region and nothing else. No file is read and no network call is made yet. boto3.client(...) at module level uses a hidden default Session.', lines: [0],
      patch: { 'sess.r': { cls: 'cell hot' } } },
    { title: 'Credentials resolve down a chain, lazily', caption: 'The first API call walks the providers in order: explicit kwargs, AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, ~/.aws/credentials, the profile in ~/.aws/config (SSO, assume-role), then container or EC2 instance metadata. The first one that answers wins and is cached; temporary credentials refresh themselves. The region resolves separately: region_name, AWS_REGION, then the profile.', lines: [0],
      patch: { chain: { cls: '' }, a1: { cls: 'arrow hot' }, c0: { add: 'dim' }, c1: { add: 'dim' }, 'c2.r': { cls: 'cell ok' } } },
    { title: 'client() builds methods from the service model', caption: 'botocore loads the JSON model for s3: every operation, parameter and response shape. Methods are generated from it at runtime, which is why editors need boto3-stubs to autocomplete them. Region plus service pick the endpoint. Building a client costs milliseconds and file I/O; calling it is cheap, so build once and reuse.', lines: [1],
      patch: { 'sess.r': { cls: 'cell' }, chain: { cls: 'dim' }, client: { cls: '' }, 'client.r': { cls: 'cell hot' }, a2: { cls: 'arrow hot' }, region: { text: 's3.eu-west-1.amazonaws.com' } } },
    { title: 'Every call is a signed HTTPS request', caption: 'Parameters are validated against the model (ParamValidationError happens here, before any network), serialised, then signed with SigV4: a hash of the request and the secret key becomes the Authorization header, so the secret itself is never sent. urllib3 pools the connection. Throttling and 5xx replies are retried according to Config(retries=...). The reply is parsed into a plain dict.', lines: [2],
      patch: { 'client.r': { cls: 'cell' }, req: { cls: '' }, 'req.r': { cls: 'cell hot' }, sig: { cls: '' }, a3: { cls: 'arrow hot' }, a4: { cls: 'arrow hot flow' }, aws: { cls: '' }, 'aws.l': { text: 'HTTP 200 + XML body' } } },
    { title: 'One response holds at most 1000 keys', caption: 'list_objects_v2 caps a page at 1000 objects. The reply carries IsTruncated and NextContinuationToken. A bucket with 2217 keys needs three round trips, and the hand-written while loop is where off-by-one bugs live.', lines: [2],
      patch: { 'req.r': { cls: 'cell' }, a4: { cls: 'arrow' }, pag: { cls: '' }, 'pag.r': { cls: 'cell hot' }, b0: { cls: 'arrow ok' }, p0: { cls: '' }, 'p0.r': { cls: 'cell ok' }, tok: { text: 'IsTruncated: true · NextContinuationToken: "1dEj…"' } } },
    { title: 'A paginator walks the pages for you', caption: 'paginate() returns a lazy iterator: each next() sends one more signed request carrying the previous token, and it stops when IsTruncated is false. PaginationConfig limits PageSize and MaxItems; .search("Contents[].Key") flattens every page with a JMESPath expression.', lines: [3],
      patch: { b1: { cls: 'arrow ok flow' }, p1: { cls: '' }, 'p1.r': { cls: 'cell ok' }, b2: { cls: 'arrow ok flow' }, p2: { cls: '' }, 'p2.r': { cls: 'cell ok' }, done: { text: 'IsTruncated: false → stop' }, tok: { text: 'token from page n becomes ContinuationToken of page n+1' } } },
  ],
};

export default {
  id: 'boto3', name: 'boto3', glyph: 'b3', group: 'cloud', version: '1.40', keywords: 'aws s3 dynamodb sqs lambda botocore client resource paginator presigned moto',
  tagline: 'The AWS SDK: clients for every service, built from JSON models.',
  install: 'pip install boto3', docs: 'https://boto3.amazonaws.com/v1/documentation/api/latest/index.html', packages: [], runnable: false,
  overview: {
    what: 'boto3 is the official AWS SDK for Python. A Session resolves credentials and a region; a client exposes one method per API operation, generated at runtime from botocore\'s JSON service models, and returns plain dicts. A handful of higher-level helpers sit on top: managed S3 transfers, paginators, waiters and the object-style resource API for S3 and DynamoDB.',
    yes: ['Talking to any AWS service from scripts, services or Lambda functions.', 'Moving files to and from S3, with multipart handled for you.', 'DynamoDB, SQS and Lambda glue code.', 'Anything the AWS CLI can do, done from Python with the same credentials.'],
    no: ['Async code (aiobotocore or aioboto3 wrap the same models).', 'A typed, object-oriented API (the resource layer is in maintenance mode; boto3-stubs adds types).', 'Infrastructure provisioning (CloudFormation, CDK, Pulumi or Terraform express it better).', 'Non-AWS S3-compatible stores work, but you set endpoint_url and lose the region logic.'],
    note: 'Every call needs AWS credentials and a network path to an AWS endpoint, so nothing here runs in the browser sandbox. Run the snippets locally against a real account, or install <code>moto</code> (<code>pip install "moto[s3,dynamodb,sqs]"</code>) and wrap them in <code>@mock_aws</code> as the last cheat-sheet group shows: same code, in-memory fake, no credentials beyond <code>AWS_DEFAULT_REGION</code> and dummy keys.',
  },
  cheatsheet: [
    { id: 'clients', title: 'Sessions, clients, resources', blurb: 'Credentials and region come from the environment; you name the service.', snippets: [
      { title: 'A client with an explicit region', code: `import boto3

s3 = boto3.client("s3", region_name="eu-west-1")
print(s3.meta.region_name, s3.meta.endpoint_url)

# a resource: object-style wrapper over the same client
ddb = boto3.resource("dynamodb", region_name="eu-west-1")
table = ddb.Table("orders")
print(table.meta.client.meta.service_model.service_name)

# every client knows its own waiters and modelled exceptions
print(s3.waiter_names[:3])
print(s3.exceptions.NoSuchKey)`, note: 'Build clients once, at import time or in a factory, and reuse them: each one parses the service model and opens a connection pool.' },
      { title: 'Sessions and profiles', code: `import boto3

session = boto3.Session(profile_name="dev")          # from ~/.aws/config
print(session.region_name, session.available_profiles)

creds = session.get_credentials().get_frozen_credentials()
print(creds.access_key[:4], "…", creds.token is not None)  # token → temporary creds

s3 = session.client("s3")                             # inherits region + creds
sqs = session.client("sqs", region_name="us-east-1")  # override per client

# assume a role and build a second session from the temporary keys
sts = session.client("sts")
tmp = sts.assume_role(RoleArn="arn:aws:iam::123456789012:role/ci", RoleSessionName="ci")["Credentials"]
prod = boto3.Session(aws_access_key_id=tmp["AccessKeyId"], aws_secret_access_key=tmp["SecretAccessKey"],
                     aws_session_token=tmp["SessionToken"], region_name="eu-west-1")`, note: 'Prefer profiles, <code>AWS_PROFILE</code> and roles over keys in code. For SSO, <code>aws sso login --profile dev</code> and the same <code>profile_name</code> just works.' },
      { title: 'Timeouts, retries and endpoints via Config', code: `import boto3
from botocore.config import Config

cfg = Config(
    region_name="eu-west-1",
    connect_timeout=5, read_timeout=60,
    retries={"max_attempts": 10, "mode": "adaptive"},   # legacy | standard | adaptive
    max_pool_connections=50,                            # threads sharing one client
    signature_version="s3v4",
)
s3 = boto3.client("s3", config=cfg)

# an S3-compatible store (MinIO, localstack, R2): same client, different endpoint
minio = boto3.client("s3", endpoint_url="http://localhost:9000",
                     aws_access_key_id="minioadmin", aws_secret_access_key="minioadmin",
                     config=Config(s3={"addressing_style": "path"}))`, note: '<code>adaptive</code> mode adds client-side rate limiting on top of exponential backoff. Env equivalents: <code>AWS_RETRY_MODE</code>, <code>AWS_MAX_ATTEMPTS</code>, <code>AWS_ENDPOINT_URL</code>.' },
    ] },
    { id: 's3', title: 'S3: objects, listing, presigned URLs', snippets: [
      { title: 'Upload and download', code: `import io
import boto3

s3 = boto3.client("s3")
BUCKET = "pydex-demo"

# managed transfer: multipart + parallel parts for big files
s3.upload_file("orders.csv", BUCKET, "raw/orders.csv",
               ExtraArgs={"ContentType": "text/csv", "ServerSideEncryption": "AES256"})

# small object straight from memory; the response carries the ETag
resp = s3.put_object(Bucket=BUCKET, Key="cfg/flags.json", Body=b'{"beta": true}',
                     ContentType="application/json")
print(resp["ETag"])

s3.download_file(BUCKET, "raw/orders.csv", "/tmp/orders.csv")

body = s3.get_object(Bucket=BUCKET, Key="cfg/flags.json")["Body"]   # StreamingBody
print(body.read().decode())

buf = io.BytesIO()
s3.download_fileobj(BUCKET, "raw/orders.csv", buf)      # into any file-like object
print(buf.tell(), "bytes")`, note: '<code>upload_file</code>/<code>download_file</code> take positional <code>(Filename, Bucket, Key)</code>; the low-level calls take keyword arguments only. Tune parts with <code>boto3.s3.transfer.TransferConfig</code>.' },
      { title: 'List with a paginator', code: `import boto3

s3 = boto3.client("s3")
paginator = s3.get_paginator("list_objects_v2")

total = 0
for page in paginator.paginate(Bucket="pydex-demo", Prefix="raw/2026/",
                               PaginationConfig={"PageSize": 1000}):
    for obj in page.get("Contents", []):        # no Contents key on an empty page
        total += obj["Size"]
print(f"{total / 1e6:.1f} MB")

# JMESPath over every page: keys of objects bigger than 1 MB
big = paginator.paginate(Bucket="pydex-demo").search("Contents[?Size > \`1000000\`].Key")
print(list(big)[:5])

# "folders": one level only, using the delimiter
page = s3.list_objects_v2(Bucket="pydex-demo", Prefix="raw/", Delimiter="/")
print([p["Prefix"] for p in page.get("CommonPrefixes", [])])`, note: 'Any operation with a <code>NextToken</code>/<code>Marker</code> has a paginator: <code>s3.can_paginate("list_objects_v2")</code>. Never loop on <code>list_objects</code> (v1) by hand.' },
      { title: 'Presigned URLs for browsers and other services', code: `import boto3
from botocore.config import Config

s3 = boto3.client("s3", config=Config(signature_version="s3v4"))

# anyone with the URL can GET this object for 15 minutes
url = s3.generate_presigned_url(
    "get_object", Params={"Bucket": "pydex-demo", "Key": "reports/q3.pdf"}, ExpiresIn=900,
)
print(url[:80], "…")

# direct upload with PUT: the client must send the same Content-Type
put_url = s3.generate_presigned_url(
    "put_object", Params={"Bucket": "pydex-demo", "Key": "uploads/a.png", "ContentType": "image/png"},
    ExpiresIn=300, HttpMethod="PUT",
)

# browser form POST with size and type constraints enforced server-side
post = s3.generate_presigned_post(
    "pydex-demo", "uploads/\${filename}",
    Conditions=[["content-length-range", 1, 10_000_000], ["starts-with", "$Content-Type", "image/"]],
    ExpiresIn=300,
)
print(post["url"], list(post["fields"]))`, note: 'The URL is signed with the credentials of the client that made it; with temporary (role/SSO) credentials it dies when they expire, whatever <code>ExpiresIn</code> says. Signing is local: no network call, no check that the object exists.' },
    ] },
    { id: 'dynamodb', title: 'DynamoDB', blurb: 'The resource layer converts Python types for you; numbers are Decimal.', snippets: [
      { title: 'put_item, get_item, update_item with conditions', code: `from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Attr

table = boto3.resource("dynamodb", region_name="eu-west-1").Table("orders")

# create-only: fail if the key already exists
try:
    table.put_item(
        Item={"pk": "ORDER#1001", "sk": "META", "region": "North", "total": Decimal("129.90"), "qty": 3},
        ConditionExpression=Attr("pk").not_exists(),
    )
except table.meta.client.exceptions.ConditionalCheckFailedException:
    print("already there")

item = table.get_item(Key={"pk": "ORDER#1001", "sk": "META"}, ConsistentRead=True).get("Item")
print(item)                                  # None if missing; numbers come back as Decimal

# atomic update; #s because "status" is a reserved word
out = table.update_item(
    Key={"pk": "ORDER#1001", "sk": "META"},
    UpdateExpression="SET #s = :s ADD qty :n",
    ConditionExpression="attribute_exists(pk)",
    ExpressionAttributeNames={"#s": "status"},
    ExpressionAttributeValues={":s": "shipped", ":n": Decimal(1)},
    ReturnValues="ALL_NEW",
)
print(out["Attributes"])` },
      { title: 'Query with key conditions and a filter', code: `import boto3
from boto3.dynamodb.conditions import Key, Attr

table = boto3.resource("dynamodb", region_name="eu-west-1").Table("orders")

kwargs = dict(
    KeyConditionExpression=Key("pk").eq("ORDER#1001") & Key("sk").begins_with("ITEM#"),
    FilterExpression=Attr("qty").gt(1),        # applied after the read; still costs RCUs
    ScanIndexForward=False,                    # newest sk first
    Limit=50,
)
items = []
while True:
    resp = table.query(**kwargs)
    items.extend(resp["Items"])
    if "LastEvaluatedKey" not in resp:
        break
    kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]
print(len(items))

# secondary index and batch writes
by_region = table.query(IndexName="region-index", KeyConditionExpression=Key("region").eq("North"))
with table.batch_writer(overwrite_by_pkeys=["pk", "sk"]) as batch:   # 25 puts per request, retries unprocessed
    for i in range(100):
        batch.put_item(Item={"pk": f"ORDER#{i}", "sk": "META", "region": "South"})`, note: '<code>query</code> needs the partition key with <code>eq</code>; the sort key takes <code>eq</code>, <code>lt</code>, <code>between</code>, <code>begins_with</code>. <code>scan</code> reads the whole table and is almost never what you want in production.' },
    ] },
    { id: 'sqs', title: 'SQS', snippets: [
      { title: 'Send, long-poll receive, delete', code: `import json
import boto3

sqs = boto3.client("sqs", region_name="eu-west-1")
url = sqs.get_queue_url(QueueName="jobs")["QueueUrl"]

sqs.send_message(
    QueueUrl=url, MessageBody=json.dumps({"order_id": 1001, "action": "invoice"}),
    MessageAttributes={"kind": {"DataType": "String", "StringValue": "billing"}},
    DelaySeconds=0,
)

while True:
    resp = sqs.receive_message(
        QueueUrl=url, MaxNumberOfMessages=10, WaitTimeSeconds=20,   # long polling: fewer empty replies
        VisibilityTimeout=60, MessageAttributeNames=["All"],
    )
    messages = resp.get("Messages", [])          # key absent when the queue is empty
    if not messages:
        break
    for m in messages:
        job = json.loads(m["Body"])
        print(job, m["MessageAttributes"]["kind"]["StringValue"])
        sqs.delete_message(QueueUrl=url, ReceiptHandle=m["ReceiptHandle"])   # ack = delete`, note: 'A message you do not delete within <code>VisibilityTimeout</code> comes back, possibly to another consumer: handlers must be idempotent. FIFO queues (<code>.fifo</code>) add <code>MessageGroupId</code> and <code>MessageDeduplicationId</code>.' },
    ] },
    { id: 'lambda', title: 'Lambda', snippets: [
      { title: 'Invoke synchronously and asynchronously', code: `import base64
import json
import boto3

lam = boto3.client("lambda", region_name="eu-west-1")

resp = lam.invoke(
    FunctionName="resize-image",
    InvocationType="RequestResponse",           # wait for the result
    LogType="Tail",                             # last 4 KB of logs, base64
    Payload=json.dumps({"key": "uploads/a.png", "width": 320}).encode(),
)
result = json.loads(resp["Payload"].read())
if "FunctionError" in resp:                     # the function raised; result is the error dict
    raise RuntimeError(result.get("errorMessage"))
print(resp["StatusCode"], result)
print(base64.b64decode(resp["LogResult"]).decode()[-200:])

# fire and forget: queued by Lambda, 202 comes back immediately
lam.invoke(FunctionName="send-email", InvocationType="Event", Payload=b'{"to": "a@b.c"}')`, note: 'Sync invocations time out with the client\'s <code>read_timeout</code> (60 s by default), which is shorter than the 15 min a function may run; raise it in <code>Config</code> for long functions.' },
    ] },
    { id: 'errors', title: 'Errors and waiters', snippets: [
      { title: 'ClientError and friends', code: `import boto3
from botocore.exceptions import ClientError, NoCredentialsError, EndpointConnectionError, ParamValidationError

s3 = boto3.client("s3", region_name="eu-west-1")

try:
    s3.get_object(Bucket="pydex-demo", Key="missing.txt")
except s3.exceptions.NoSuchKey:                     # modelled exception, a ClientError subclass
    print("no such key")
except ClientError as e:                            # everything the service returned as an error
    code = e.response["Error"]["Code"]
    status = e.response["ResponseMetadata"]["HTTPStatusCode"]
    if code in ("AccessDenied", "403"):
        print("check the IAM policy", status)
    else:
        raise
except (NoCredentialsError, EndpointConnectionError) as e:   # before any response: local config, network
    print("environment problem:", e)

try:
    s3.get_object(Bucket="pydex-demo")               # Key missing → no request is sent
except ParamValidationError as e:
    print(e)`, note: '<code>head_object</code> on a missing key raises a <code>ClientError</code> with code <code>"404"</code>, not <code>NoSuchKey</code>: HEAD has no body to carry the error code. Retryable throttling (<code>Throttling</code>, <code>TooManyRequestsException</code>) is already retried by botocore before you see it.' },
      { title: 'Waiters poll until a state is reached', code: `import boto3
from botocore.exceptions import WaiterError

s3 = boto3.client("s3", region_name="eu-west-1")
ec2 = boto3.client("ec2", region_name="eu-west-1")

s3.create_bucket(Bucket="pydex-demo-2026", CreateBucketConfiguration={"LocationConstraint": "eu-west-1"})
s3.get_waiter("bucket_exists").wait(Bucket="pydex-demo-2026")

ids = [i["InstanceId"] for i in ec2.run_instances(ImageId="ami-0abc", InstanceType="t3.micro",
                                                  MinCount=1, MaxCount=1)["Instances"]]
try:
    ec2.get_waiter("instance_running").wait(
        InstanceIds=ids, WaiterConfig={"Delay": 5, "MaxAttempts": 24},   # 5 s × 24 = 2 min
    )
except WaiterError as e:
    print("gave up:", e.last_response["Reservations"][0]["Instances"][0]["State"])
print(ec2.waiter_names)`, note: 'A waiter is a described polling loop from the service model: which call, which field, which values mean success or failure. It is the right tool for eventually-consistent resources; hand-written <code>time.sleep</code> loops are the wrong one.' },
    ] },
    { id: 'testing', title: 'Testing with moto', snippets: [
      { title: 'mock_aws: same code, in-memory AWS', code: `# test_upload.py  —  pip install "moto[s3,dynamodb]" pytest
import boto3
import pytest
from moto import mock_aws

def upload_report(s3, bucket: str, name: str, body: bytes) -> str:
    s3.put_object(Bucket=bucket, Key=f"reports/{name}", Body=body)
    return f"s3://{bucket}/reports/{name}"

@pytest.fixture(autouse=True)
def aws_env(monkeypatch):
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")       # never hit a real account by accident
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "eu-west-1")

@mock_aws
def test_upload_report():
    s3 = boto3.client("s3")                                   # created inside the mock
    s3.create_bucket(Bucket="reports", CreateBucketConfiguration={"LocationConstraint": "eu-west-1"})
    uri = upload_report(s3, "reports", "q3.csv", b"a,b\\n1,2\\n")
    assert uri == "s3://reports/reports/q3.csv"
    assert s3.get_object(Bucket="reports", Key="reports/q3.csv")["Body"].read() == b"a,b\\n1,2\\n"

@mock_aws
def test_missing_table_raises():
    ddb = boto3.resource("dynamodb")
    with pytest.raises(ddb.meta.client.exceptions.ResourceNotFoundException):
        ddb.Table("orders").get_item(Key={"pk": "x"})`, note: 'Clients must be created while the mock is active, so make them inside the test or in a fixture that uses <code>mock_aws</code> as a context manager. moto 5 replaced the per-service decorators (<code>mock_s3</code>…) with one <code>mock_aws</code>.' },
    ] },
  ],
  concepts: [
    { id: 'chain', title: 'Session, credential chain, client, paginator', intro: 'Every boto3 call is the same pipeline: resolve credentials once, build a client from a service model, sign an HTTPS request per call, and let a paginator repeat the call while the service says there is more.', explainer: chainExplainer },
  ],
  compare: [
    { title: 'client vs resource', columns: ['client', 'resource'], rows: [
      ['Shape', 'one method per API operation, kwargs in, dict out', 'objects with attributes and methods (Bucket, Table, Instance)'],
      ['Services covered', 'all of them', { part: 'S3, DynamoDB, SQS, SNS, EC2, IAM, CloudFormation, Glacier, CloudWatch, OpsWorks' }],
      ['New features land', true, { part: 'maintenance mode since 2023: no new services or actions' }],
      ['Pagination', 'get_paginator()', 'collections page for you (bucket.objects.filter(...))'],
      ['DynamoDB values', '{"S": "x"}, {"N": "3"} attribute maps', 'plain Python (str, Decimal, list, dict)'],
      ['Thread-safe', true, false],
      ['Batch S3 delete / DynamoDB batch_writer', false, true],
    ], verdict: 'Default to the client; it is complete and what the docs and Stack Overflow answers use. Reach for <code>resource("dynamodb")</code> for the type conversion and <code>batch_writer</code>, and <code>resource("s3")</code> for <code>bucket.objects.filter(...).delete()</code>. Do not start new designs on other resources.' },
    { title: 'Getting bytes into S3', columns: ['put_object', 'upload_file', 'upload_fileobj', 'presigned URL / POST'], rows: [
      ['Input', 'bytes or file-like, whole', 'path on disk', 'file-like stream', 'the other party uploads'],
      ['Multipart, parallel parts', false, true, true, { part: 'PUT single part; multipart needs your own signing per part' }],
      ['Returns ETag / VersionId', true, false, false, { part: 'in the HTTP response the uploader sees' }],
      ['Every API parameter available', true, { part: 'ExtraArgs subset' }, { part: 'ExtraArgs subset' }, { part: 'Params and Conditions' }],
      ['Objects larger than 5 GB', false, true, true, false],
      ['Best for', 'small objects, need the response', 'files from disk', 'streams, HTTP bodies, in-memory buffers', 'browsers and services without AWS credentials'],
    ], note: 'Sizes and part counts come from TransferConfig (8 MB threshold and part size, 10 threads by default).' },
  ],
  gotchas: [
    { title: 'Clients survive threads but not fork()', bad: `s3 = boto3.client("s3")          # made in the parent

def work(key):
    return s3.head_object(Bucket=B, Key=key)   # shared across forks

with multiprocessing.Pool(8) as pool:
    pool.map(work, keys)         # hangs, garbled responses, SSL errors`, good: `_s3 = None

def work(key):
    global _s3
    if _s3 is None:
        _s3 = boto3.client("s3")   # one per process, created after fork
    return _s3.head_object(Bucket=B, Key=key)

with multiprocessing.Pool(8) as pool:
    pool.map(work, keys)

# threads are fine: share ONE client, not one per call
with ThreadPoolExecutor(32) as ex:
    ex.map(lambda k: s3.head_object(Bucket=B, Key=k), keys)`, why: 'A client owns a urllib3 connection pool; forked children inherit the same sockets and interleave bytes on them. Clients are thread-safe (set <code>max_pool_connections</code> to match your thread count); Sessions and resources are not, so give each thread its own resource.' },
    { title: 'No region is only an error for some services', bad: `sqs = boto3.client("sqs")
# NoRegionError: You must specify a region.

s3 = boto3.client("s3")     # works…
s3.create_bucket(Bucket="b")  # …in us-east-1, whatever you meant`, good: `export AWS_DEFAULT_REGION=eu-west-1   # or region= in the profile

sqs = boto3.client("sqs", region_name="eu-west-1")
s3 = boto3.client("s3", region_name="eu-west-1")
s3.create_bucket(Bucket="b", CreateBucketConfiguration={"LocationConstraint": "eu-west-1"})`, why: 'S3, IAM and STS have global endpoints, so a missing region falls back to us-east-1 silently; regional services raise <code>NoRegionError</code>. Pin the region explicitly in code or config so a DynamoDB table or SQS queue is never looked up in the wrong place.' },
    { title: 'DynamoDB numbers are Decimal, and floats are refused', bad: `table.put_item(Item={"pk": "a", "price": 19.99})
# TypeError: Float types are not supported. Use Decimal types instead.

json.dumps(table.get_item(Key={"pk": "a"})["Item"])
# TypeError: Object of type Decimal is not JSON serializable`, good: `from decimal import Decimal
table.put_item(Item={"pk": "a", "price": Decimal(str(19.99))})   # str() first, never Decimal(19.99)

def default(o):
    if isinstance(o, Decimal):
        return int(o) if o == o.to_integral_value() else float(o)
    raise TypeError
json.dumps(item, default=default)`, why: 'DynamoDB stores 38-digit exact decimals. The resource serialiser refuses floats rather than round them, and <code>Decimal(19.99)</code> carries the float\'s binary tail (52 digits) which trips the same precision check; go through <code>str</code>. Reads give <code>Decimal</code> back, so convert on the way out.' },
    { title: 'Empty results drop the key instead of returning []', bad: `for obj in page["Contents"]:              # KeyError on an empty prefix
    ...
for m in resp["Messages"]:                # KeyError when the queue is idle
    ...
item = table.get_item(Key=k)["Item"]      # KeyError when the item is missing`, good: `for obj in page.get("Contents", []):
    ...
for m in resp.get("Messages", []):
    ...
item = table.get_item(Key=k).get("Item")   # None when missing`, why: 'Responses mirror the wire format: an absent list is absent, not empty. The affected keys are the ones that matter most: <code>Contents</code>, <code>CommonPrefixes</code>, <code>Messages</code>, <code>Item</code>, <code>Reservations</code>. Use <code>.get</code> with a default, and paginators still yield those pages.' },
  ],
  presets: [],
};
