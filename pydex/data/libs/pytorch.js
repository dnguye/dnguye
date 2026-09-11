import { scene } from '../../js/explainer.js';

// Explainer 1: the autograd graph. Forward records a grad_fn per op; backward walks it.
const autogradExplainer = {
  hold: 3200,
  code: ['w = torch.tensor(3., requires_grad=True)', 'y = w * x + b            # x=2, b=1 → 7', 'loss = (y - t) ** 2      # t=10 → 9', 'loss.backward()', 'w.grad, b.grad           # -12., -6.'],
  build() {
    const s = scene(760, 320);
    s.text('h-leaf', 20, 22, 'leaf tensors', 'lbl sm bold ink-2', undefined, 'start');
    s.text('h-fwd', 300, 22, 'forward builds the graph', 'lbl sm bold ink-2', undefined, 'start');
    s.cell('x', 20, 40, 100, 32, 'x = 2.0');
    s.cell('w', 20, 100, 100, 32, 'w = 3.0', 'cell info');
    s.cell('b', 20, 160, 100, 32, 'b = 1.0', 'cell info');
    s.cell('t', 20, 220, 100, 32, 't = 10.0');
    s.text('l-x', 70, 84, 'no grad', 'lbl sm ink-2');
    s.text('l-w', 70, 144, 'requires_grad', 'lbl sm ink-2');
    s.text('l-b', 70, 204, 'requires_grad', 'lbl sm ink-2');
    s.text('l-t', 70, 264, 'no grad', 'lbl sm ink-2');
    // op nodes
    s.cell('mul', 200, 70, 130, 32, 'y1 = w·x = 6', 'cell hid');
    s.cell('mulfn', 200, 108, 130, 24, 'MulBackward0', 'cell ghost hid');
    s.cell('add', 390, 130, 130, 32, 'y = y1 + b = 7', 'cell hid');
    s.cell('addfn', 390, 168, 130, 24, 'AddBackward0', 'cell ghost hid');
    s.cell('loss', 580, 190, 160, 32, 'loss = (y−t)² = 9', 'cell hid');
    s.cell('lossfn', 580, 228, 160, 24, 'PowBackward0', 'cell ghost hid');
    // forward arrows
    s.arrow('a-x', 122, 56, 196, 80, 'arrow hid');
    s.arrow('a-w', 122, 116, 196, 92, 'arrow hid');
    s.arrow('a-mul', 332, 86, 386, 140, 'arrow hid');
    s.arrow('a-b', 122, 176, 386, 152, 'arrow hid');
    s.arrow('a-add', 522, 146, 576, 200, 'arrow hid');
    s.arrow('a-t', 122, 236, 576, 212, 'arrow hid');
    // backward arrows (reverse direction, drawn between grad_fn nodes)
    s.arrow('g-loss', 578, 240, 522, 186, 'arrow hid');
    s.arrow('g-add', 388, 180, 332, 126, 'arrow hid');
    s.arrow('g-w', 198, 120, 124, 122, 'arrow hid');
    s.arrow('g-b', 388, 186, 124, 182, 'arrow hid');
    s.text('g-loss.t', 560, 226, '', 'lbl sm', undefined, 'end');
    s.text('g-add.t', 370, 166, '', 'lbl sm', undefined, 'end');
    s.text('g-w.t', 160, 138, '', 'lbl sm');
    s.text('g-b.t', 250, 200, '', 'lbl sm');
    s.text('foot', 20, 300, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Leaves: the tensors you created', caption: 'w and b have requires_grad=True, so autograd will track everything computed from them. x and t are plain data: they take part in the maths but collect no gradient.', lines: [0],
      patch: { 'w.r': { cls: 'cell hot' }, 'b.r': { cls: 'cell hot' } } },
    { title: 'Each op records a grad_fn', caption: 'w * x produces y1 and attaches a MulBackward0 node that remembers its inputs. Nothing is differentiated yet; the graph is just being written down as the forward code runs.', lines: [1],
      patch: { 'w.r': { cls: 'cell info' }, 'b.r': { cls: 'cell info' }, mul: { cls: '' }, mulfn: { cls: '' }, 'mul.r': { cls: 'cell hot' }, 'a-x': { cls: 'arrow hot' }, 'a-w': { cls: 'arrow hot' } } },
    { title: 'The graph grows with every op', caption: 'The add and the squared error each add a node. Every intermediate tensor points at the grad_fn that made it (y.grad_fn is AddBackward0). Leaves have grad_fn=None.', lines: [1, 2],
      patch: { 'mul.r': { cls: 'cell' }, 'a-x': { cls: 'arrow' }, 'a-w': { cls: 'arrow' }, add: { cls: '' }, addfn: { cls: '' }, loss: { cls: '' }, lossfn: { cls: '' }, 'add.r': { cls: 'cell hot' }, 'loss.r': { cls: 'cell hot' }, 'a-mul': { cls: 'arrow hot' }, 'a-b': { cls: 'arrow hot' }, 'a-add': { cls: 'arrow hot' }, 'a-t': { cls: 'arrow hot' }, foot: { text: 'loss.grad_fn → PowBackward0 → SubBackward0 → AddBackward0 → MulBackward0' } } },
    { title: 'backward() starts at the root', caption: 'loss is a scalar, so backward() seeds dloss/dloss = 1 and asks PowBackward0 for the gradient of its input: 2·(y − t) = −6. That value flows to the node that produced y.', lines: [3],
      patch: { 'add.r': { cls: 'cell' }, 'loss.r': { cls: 'cell' }, 'a-mul': { cls: 'arrow' }, 'a-b': { cls: 'arrow' }, 'a-add': { cls: 'arrow' }, 'a-t': { cls: 'arrow' }, 'lossfn.r': { cls: 'cell err' }, 'g-loss': { cls: 'arrow err flow' }, 'g-loss.t': { text: 'dL/dy = −6' }, foot: { text: 'chain rule, one grad_fn at a time, in reverse order' } } },
    { title: 'The chain rule walks each node', caption: 'AddBackward0 passes −6 unchanged to both inputs. MulBackward0 multiplies by the other factor: dL/dw = −6 · x = −12. Gradients for x and t are never computed because nothing asked for them.', lines: [3],
      patch: { 'lossfn.r': { cls: 'cell ghost' }, 'g-loss': { cls: 'arrow err' }, 'addfn.r': { cls: 'cell err' }, 'mulfn.r': { cls: 'cell err' }, 'g-add': { cls: 'arrow err flow' }, 'g-b': { cls: 'arrow err flow' }, 'g-w': { cls: 'arrow err flow' }, 'g-add.t': { text: '−6' }, 'g-b.t': { text: 'dL/db = −6' }, 'g-w.t': { text: '−6 · x = −12' } } },
    { title: 'Gradients land in .grad; the graph is freed', caption: 'Leaves accumulate into .grad (a second backward() would add to −12, which is why training loops call zero_grad). The grad_fn nodes are released after use; pass retain_graph=True if you need a second pass.', lines: [4],
      patch: { 'addfn.r': { cls: 'cell ghost' }, 'mulfn.r': { cls: 'cell ghost' }, 'g-add': { cls: 'arrow err' }, 'g-b': { cls: 'arrow err' }, 'g-w': { cls: 'arrow err' }, 'w.r': { cls: 'cell ok' }, 'b.r': { cls: 'cell ok' }, 'w.t': { text: 'w.grad = −12' }, 'b.t': { text: 'b.grad = −6' }, mulfn: { cls: 'dim' }, addfn: { cls: 'dim' }, lossfn: { cls: 'dim' }, foot: { text: 'optimizer.step() reads .grad and moves w, b; optimizer.zero_grad() clears them for the next batch' } } },
  ],
};

// Explainer 2: the training loop as a cycle.
const loopExplainer = {
  hold: 3000,
  code: ['for epoch in range(epochs):', '    for xb, yb in loader:', '        opt.zero_grad()', '        out = model(xb)', '        loss = loss_fn(out, yb)', '        loss.backward()', '        opt.step()', '    evaluate(model, val_loader)   # eval() + no_grad()'],
  build() {
    const s = scene(760, 300);
    s.cell('batch', 20, 40, 140, 36, 'batch (xb, yb)');
    s.cell('zero', 200, 40, 150, 36, 'opt.zero_grad()');
    s.cell('fwd', 390, 40, 150, 36, 'out = model(xb)');
    s.cell('loss', 580, 40, 160, 36, 'loss_fn(out, yb)');
    s.cell('bwd', 580, 200, 160, 36, 'loss.backward()');
    s.cell('step', 330, 200, 160, 36, 'opt.step()');
    s.arrow('a1', 162, 58, 196, 58); s.arrow('a2', 352, 58, 386, 58); s.arrow('a3', 542, 58, 576, 58);
    s.arrow('a4', 660, 78, 660, 196);
    s.arrow('a5', 576, 218, 494, 218);
    s.path('a6', 'M328 218 L90 218 L90 80', 'arrow');
    s.text('l-grad', 648, 138, '', 'lbl sm ink-2', undefined, 'end');
    s.text('l-mid', 250, 130, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l-step', 410, 250, '', 'lbl sm ink-2');
    s.text('l-loop', 20, 280, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l-loss', 660, 22, '', 'lbl sm bold');
    return s;
  },
  steps: [
    { title: 'Fetch a batch from the DataLoader', caption: 'The loader shuffles indices each epoch, calls Dataset.__getitem__ for each one, and collates the results into stacked tensors. Move them to the same device as the model here.', lines: [0, 1],
      patch: { 'batch.r': { cls: 'cell hot' }, 'l-loop': { text: 'xb, yb = xb.to(device), yb.to(device)' } } },
    { title: 'Zero the gradients', caption: 'backward() accumulates into .grad rather than overwriting it. Clearing first means each step sees only this batch\'s gradient. set_to_none=True (the default) frees the memory instead of filling zeros.', lines: [2],
      patch: { 'batch.r': { cls: 'cell' }, 'zero.r': { cls: 'cell hot' }, a1: { cls: 'arrow hot' }, 'l-mid': { text: 'p.grad = None for every parameter' } } },
    { title: 'Forward pass, then the loss', caption: 'model(xb) runs __call__ → forward and records the autograd graph as it goes. The loss reduces predictions and targets to one scalar; that scalar is the root of the graph.', lines: [3, 4],
      patch: { 'zero.r': { cls: 'cell' }, a1: { cls: 'arrow' }, 'fwd.r': { cls: 'cell hot' }, 'loss.r': { cls: 'cell hot' }, a2: { cls: 'arrow hot' }, a3: { cls: 'arrow hot' }, 'l-mid': { text: 'graph recorded: Linear → ReLU → Linear → CrossEntropy' }, 'l-loss': { text: 'loss = 2.31' } } },
    { title: 'backward() fills .grad', caption: 'Autograd walks the graph from the loss back to every parameter with requires_grad=True and writes d(loss)/d(param) into param.grad. The graph is then freed.', lines: [5],
      patch: { 'fwd.r': { cls: 'cell' }, 'loss.r': { cls: 'cell' }, a2: { cls: 'arrow' }, a3: { cls: 'arrow' }, 'bwd.r': { cls: 'cell err' }, a4: { cls: 'arrow err flow' }, 'l-grad': { text: 'p.grad ← dloss/dp' }, 'l-mid': { text: '' } } },
    { title: 'optimizer.step() moves the weights', caption: 'The optimizer reads each .grad and updates the parameter in place: SGD does p −= lr · grad; Adam/AdamW scale by running moment estimates. No autograd here: the update runs under no_grad.', lines: [6],
      patch: { 'bwd.r': { cls: 'cell' }, a4: { cls: 'arrow err' }, 'step.r': { cls: 'cell ok' }, a5: { cls: 'arrow ok flow' }, 'l-step': { text: 'p ← p − lr · f(p.grad)' } } },
    { title: 'Repeat; evaluate with eval() and no_grad()', caption: 'Next batch, same six moves, and the loss trends down. Between epochs switch to model.eval() so Dropout and BatchNorm behave, and wrap validation in torch.no_grad() so no graph is built.', lines: [7],
      patch: { 'step.r': { cls: 'cell' }, a5: { cls: 'arrow ok' }, a6: { cls: 'arrow ok flow' }, 'batch.r': { cls: 'cell hot' }, 'l-loss': { text: 'loss 2.31 → 1.87 → 1.42 → …' }, 'l-loop': { text: 'model.eval(); with torch.no_grad(): acc = (model(xv).argmax(1) == yv).float().mean()' }, 'l-step': { text: '' } } },
  ],
};

export default {
  id: 'pytorch', name: 'PyTorch', glyph: 'pt', group: 'ai', version: '2.14', keywords: 'torch tensor autograd nn module dataloader training gpu cuda deep learning',
  tagline: 'Tensors with autograd, plus the pieces to train a network.',
  install: 'pip install torch', docs: 'https://docs.pytorch.org/docs/stable/', packages: [], runnable: false,
  overview: {
    what: 'PyTorch is a tensor library (like numpy, but on GPUs) with automatic differentiation on top. You write the forward computation as ordinary Python; autograd records it and hands back gradients. torch.nn packages layers and losses, torch.optim the update rules, torch.utils.data the batching. Everything else in deep learning (transformers, diffusion, RL) is built from these four modules.',
    yes: ['Training or fine-tuning a neural network, on one GPU or many.', 'You need gradients of an arbitrary computation (optimisation, physics, differentiable rendering).', 'Running published models: nearly every research release ships PyTorch weights.', 'Numeric work that should run on a GPU with numpy-like code.'],
    no: ['Classical ML on tabular data (scikit-learn, XGBoost, LightGBM).', 'You only need inference of a trained model in production with no Python (export to ONNX, or use a serving runtime).', 'Array maths that fits on one CPU core and needs no gradients (numpy).', 'JAX-style functional transforms and TPU-first work.'],
    note: 'There is no PyTorch build for the browser sandbox, so nothing on this page runs here. Locally, <code>pip install torch</code> gives a CPU build on every platform; for an NVIDIA GPU pick the matching CUDA wheel index from the <a href="https://pytorch.org/get-started/locally/">get-started selector</a> (for example <code>pip install torch --index-url https://download.pytorch.org/whl/cu128</code>); Apple Silicon uses the <code>mps</code> device out of the box. Every snippet below runs on CPU too, just slower.',
  },
  cheatsheet: [
    { id: 'tensors', title: 'Tensors', blurb: 'Create, inspect, reshape. Most numpy idioms carry over.', snippets: [
      { title: 'Create and compute', code: `import torch

a = torch.tensor([[1., 2.], [3., 4.]])
z = torch.zeros(2, 3); o = torch.ones_like(a); r = torch.randn(3, 2)
ar = torch.arange(6).reshape(2, 3)
print(a.shape, a.dtype, a.device)      # torch.Size([2, 2]) torch.float32 cpu
print(a @ a.T)                         # matrix multiply
print(a * 2 + 1)                       # elementwise, broadcasts scalars
print(a.sum(), a.mean(dim=0), a.max(dim=1).values)
print(a.item() if a.numel() == 1 else a[0, 1].item())   # Python scalar`, note: 'Integer literals give <code>int64</code>, floats give <code>float32</code>. Reductions take <code>dim=</code>; <code>max(dim=…)</code> returns a <code>(values, indices)</code> pair.' },
      { title: 'Index, reshape, broadcast', code: `import torch

x = torch.arange(24.).reshape(2, 3, 4)
print(x[0, :, 1])                      # numpy-style indexing
print(x[x > 20])                       # boolean mask → 1-D
print(x.view(6, 4).shape, x.permute(2, 0, 1).shape)
print(x.unsqueeze(0).shape, x.flatten(1).shape)   # add dim / keep dim 0
y = x + torch.tensor([1., 2., 3., 4.])  # broadcast over the last dim
print(torch.cat([x, x], dim=0).shape, torch.stack([x, x]).shape)
n = x.numpy()                           # shares memory (CPU tensors only)
print(torch.from_numpy(n).shape)`, note: '<code>view</code> needs contiguous memory; <code>reshape</code> copies when it must. After <code>permute</code>/<code>transpose</code>, call <code>.contiguous()</code> before <code>view</code>.' },
      { title: 'dtype and device', code: `import torch

device = "cuda" if torch.cuda.is_available() else \\
         "mps" if torch.backends.mps.is_available() else "cpu"
x = torch.randn(4, 3, device=device)
h = x.to(torch.float16)                 # cast
print(h.dtype, h.device)
print(x.cpu().numpy().shape)            # GPU → CPU → numpy
print(torch.get_default_dtype())        # float32
torch.manual_seed(0)                    # reproducible init and sampling
print(torch.rand(2))`, note: '<code>.to(device)</code> returns a new tensor; tensors on different devices cannot be combined. A model is moved in place by <code>model.to(device)</code>.' },
    ] },
    { id: 'autograd', title: 'Autograd', blurb: 'Gradients come from recording the forward pass.', snippets: [
      { title: 'backward() on a scalar', code: `import torch

w = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(1.0, requires_grad=True)
x, t = torch.tensor(2.0), torch.tensor(10.0)

y = w * x + b                 # 7
loss = (y - t) ** 2           # 9
print(y.grad_fn)              # <AddBackward0>
loss.backward()
print(w.grad, b.grad)         # tensor(-12.) tensor(-6.)
loss = ((w * x + b) - t) ** 2
loss.backward()
print(w.grad)                 # tensor(-24.): gradients accumulate` },
      { title: 'Stop tracking', code: `import torch
w = torch.randn(3, requires_grad=True)

with torch.no_grad():          # nothing inside is recorded
    w -= 0.1 * torch.ones(3)   # in-place update, as an optimizer does
frozen = w.detach()            # same data, no history
print(frozen.requires_grad)    # False

with torch.inference_mode():   # like no_grad, faster, for pure inference
    y = (w * 2).sum()
print(y.requires_grad)         # False
w.requires_grad_(False)        # flip the flag on a leaf in place`, note: '<code>detach()</code> shares memory; mutating the copy mutates the original. Use <code>.detach().clone()</code> for an independent tensor.' },
    ] },
    { id: 'modules', title: 'Building models', blurb: 'nn.Module owns parameters; forward defines the computation.', snippets: [
      { title: 'Subclass nn.Module', code: `import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, d_in: int, d_hidden: int, n_classes: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_in, d_hidden), nn.ReLU(), nn.Dropout(0.1),
            nn.Linear(d_hidden, n_classes),
        )
    def forward(self, x):
        return self.net(x)

model = MLP(20, 64, 3)
print(model)
print(sum(p.numel() for p in model.parameters() if p.requires_grad))
logits = model(torch.randn(8, 20))   # call the module, not .forward()
print(logits.shape)                  # torch.Size([8, 3])`, note: 'Anything assigned as an attribute that is a Module or <code>nn.Parameter</code> is registered automatically. Use <code>nn.ModuleList</code>/<code>nn.ModuleDict</code> for collections, not plain lists.' },
      { title: 'nn layers vs nn.functional', code: `import torch
import torch.nn as nn
import torch.nn.functional as F

x = torch.randn(4, 10)
lin = nn.Linear(10, 5)                      # owns weight and bias
y1 = lin(x)
y2 = F.linear(x, lin.weight, lin.bias)      # same maths, explicit params
print(torch.allclose(y1, y2))
print(F.relu(y1).min() >= 0, F.softmax(y1, dim=-1).sum(-1))
loss = F.cross_entropy(y1, torch.tensor([0, 1, 2, 3]))  # takes raw logits
print(loss.item())
print(nn.CrossEntropyLoss()(y1, torch.tensor([0, 1, 2, 3])).item())` },
    ] },
    { id: 'data', title: 'Datasets and loaders', snippets: [
      { title: 'A Dataset from a CSV', code: `import torch
import pandas as pd
from torch.utils.data import Dataset, DataLoader, random_split

class OrdersDataset(Dataset):
    def __init__(self, path):
        df = pd.read_csv(path)
        self.x = torch.tensor(df[["quantity", "unit_price", "discount"]].values, dtype=torch.float32)
        self.y = torch.tensor((df["status"] == "shipped").to_numpy(), dtype=torch.long)
    def __len__(self): return len(self.x)
    def __getitem__(self, i): return self.x[i], self.y[i]

ds = OrdersDataset("orders.csv")
train, val = random_split(ds, [0.8, 0.2], generator=torch.Generator().manual_seed(0))
loader = DataLoader(train, batch_size=32, shuffle=True, num_workers=2, pin_memory=True)
xb, yb = next(iter(loader))
print(xb.shape, yb.shape)       # torch.Size([32, 3]) torch.Size([32])`, note: '<code>num_workers&gt;0</code> loads batches in subprocesses; on Windows/macOS guard the script with <code>if __name__ == "__main__":</code>. <code>pin_memory</code> speeds up host→GPU copies.' },
      { title: 'TensorDataset for in-memory arrays', code: `import torch
from torch.utils.data import TensorDataset, DataLoader

X = torch.randn(1000, 20)
y = torch.randint(0, 3, (1000,))
loader = DataLoader(TensorDataset(X, y), batch_size=64, shuffle=True, drop_last=True)
print(len(loader))              # 15 full batches
for xb, yb in loader:
    print(xb.shape, yb.shape)
    break`, note: 'For huge datasets that stream from disk or the network, subclass <code>IterableDataset</code> instead and yield samples from <code>__iter__</code>.' },
    ] },
    { id: 'train', title: 'Training', blurb: 'The loop is six lines; everything else is bookkeeping.', snippets: [
      { title: 'The full minimal training loop', code: `import torch, torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

device = "cuda" if torch.cuda.is_available() else "cpu"
X, y = torch.randn(1000, 20), torch.randint(0, 3, (1000,))
train = DataLoader(TensorDataset(X, y), batch_size=64, shuffle=True)

model = nn.Sequential(nn.Linear(20, 64), nn.ReLU(), nn.Linear(64, 3)).to(device)
loss_fn = nn.CrossEntropyLoss()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)

for epoch in range(5):
    model.train()
    for xb, yb in train:
        xb, yb = xb.to(device), yb.to(device)
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        opt.step()
    print(f"epoch {epoch} last batch loss {loss.item():.3f}")`, note: '<code>CrossEntropyLoss</code> wants raw logits and integer class ids. <code>.item()</code> syncs with the GPU; call it once per epoch or every N steps, not every batch, if throughput matters.' },
      { title: 'Evaluate without building a graph', code: `import torch

@torch.no_grad()
def evaluate(model, loader, device):
    model.eval()                       # Dropout off, BatchNorm uses running stats
    correct = total = 0
    for xb, yb in loader:
        xb, yb = xb.to(device), yb.to(device)
        pred = model(xb).argmax(dim=1)
        correct += (pred == yb).sum().item()
        total += yb.numel()
    model.train()                      # hand it back ready for the next epoch
    return correct / total

# val_acc = evaluate(model, val_loader, device)`, note: '<code>eval()</code> and <code>no_grad()</code> are independent: one changes layer behaviour, the other stops autograd. Validation needs both.' },
      { title: 'Schedulers and gradient clipping', code: `import torch, torch.nn as nn

model = nn.Linear(20, 3)
opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
steps_per_epoch, epochs = 100, 10
sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=1e-3, total_steps=steps_per_epoch * epochs)

for step in range(steps_per_epoch * epochs):
    xb, yb = torch.randn(32, 20), torch.randint(0, 3, (32,))
    opt.zero_grad()
    loss = nn.functional.cross_entropy(model(xb), yb)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    opt.step()
    sched.step()                       # per step for OneCycle; per epoch for StepLR/Cosine
print(sched.get_last_lr())`, note: 'Clip after <code>backward()</code> and before <code>step()</code>. Epoch-based schedulers (<code>StepLR</code>, <code>CosineAnnealingLR</code>, <code>ReduceLROnPlateau(metric)</code>) are stepped once per epoch instead.' },
    ] },
    { id: 'speed', title: 'Faster: compile and mixed precision', snippets: [
      { title: 'torch.compile', code: `import torch, torch.nn as nn

model = nn.Sequential(nn.Linear(256, 512), nn.GELU(), nn.Linear(512, 10))
compiled = torch.compile(model)         # same parameters, fused kernels
x = torch.randn(64, 256)
out = compiled(x)                       # first call traces and compiles (slow once)
print(out.shape)
# variants:
# torch.compile(model, mode="reduce-overhead")   # CUDA graphs for small batches
# torch.compile(model, dynamic=True)             # varying shapes without recompiling
# torch._dynamo.reset()                          # clear caches when iterating`, note: 'Compile the model you train with; state_dict keys are unchanged (<code>compiled._orig_mod</code> is the original). Expect a recompile whenever input shapes or Python control flow change.' },
      { title: 'Automatic mixed precision', code: `import torch, torch.nn as nn

device = "cuda"
model = nn.Linear(1024, 10).to(device)
opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
xb, yb = torch.randn(32, 1024, device=device), torch.randint(0, 10, (32,), device=device)

# bfloat16: no scaler needed (Ampere+ GPUs)
with torch.autocast(device_type=device, dtype=torch.bfloat16):
    loss = nn.functional.cross_entropy(model(xb), yb)
loss.backward(); opt.step(); opt.zero_grad()

# float16 needs loss scaling to avoid underflow in gradients
scaler = torch.amp.GradScaler(device)
with torch.autocast(device_type=device, dtype=torch.float16):
    loss = nn.functional.cross_entropy(model(xb), yb)
scaler.scale(loss).backward(); scaler.step(opt); scaler.update(); opt.zero_grad()`, note: 'Weights stay float32; only the matmuls and activations inside the block run in the lower precision. Keep the loss computation inside <code>autocast</code> and <code>backward()</code> outside.' },
    ] },
    { id: 'save', title: 'Save and load', snippets: [
      { title: 'state_dict and checkpoints', code: `import torch, torch.nn as nn

model = nn.Sequential(nn.Linear(20, 64), nn.ReLU(), nn.Linear(64, 3))
opt = torch.optim.AdamW(model.parameters())
print(list(model.state_dict().keys()))      # ['0.weight', '0.bias', '2.weight', '2.bias']

torch.save(model.state_dict(), "model.pt")  # weights only: the recommended form
fresh = nn.Sequential(nn.Linear(20, 64), nn.ReLU(), nn.Linear(64, 3))
fresh.load_state_dict(torch.load("model.pt", map_location="cpu", weights_only=True))
fresh.eval()

ckpt = {"epoch": 7, "model": model.state_dict(), "opt": opt.state_dict()}
torch.save(ckpt, "ckpt.pt")                 # resume training later
state = torch.load("ckpt.pt", map_location="cpu", weights_only=True)
model.load_state_dict(state["model"]); opt.load_state_dict(state["opt"])`, note: '<code>weights_only=True</code> is the default since 2.6 and refuses to unpickle arbitrary objects. <code>map_location</code> lets a GPU checkpoint load on a CPU-only machine; move the model to its device afterwards.' },
    ] },
  ],
  concepts: [
    { id: 'autograd', title: 'The autograd graph', intro: 'Forward code builds a graph of <code>grad_fn</code> nodes as a side effect. <code>backward()</code> walks it in reverse, applying the chain rule one node at a time, and deposits the result in each leaf\'s <code>.grad</code>.', explainer: autogradExplainer },
    { id: 'loop', title: 'One step of training', intro: 'Every training loop is the same cycle. Knowing which line does what explains the classic bugs: a missing <code>zero_grad</code>, a missing <code>eval()</code>, a tensor on the wrong device.', explainer: loopExplainer },
  ],
  compare: [
    { title: 'torch.nn layers vs torch.nn.functional', columns: ['nn.Linear, nn.Dropout, …', 'F.linear, F.dropout, …'], rows: [
      ['Holds parameters and buffers', true, false],
      ['Must be instantiated first', true, false],
      ['Reacts to model.train() / model.eval()', true, { part: 'you pass training=' }],
      ['Appears in state_dict and print(model)', true, false],
      ['Good for', 'layers with weights, anything you save', 'activations, losses, one-off ops, custom layers'],
    ], verdict: 'Use the <code>nn</code> class for anything with state (weights, running stats, dropout rate you want in <code>eval()</code>) and the functional form inside your own <code>forward</code> for stateless maths like <code>relu</code>, <code>softmax</code>, <code>cross_entropy</code>.' },
    { title: 'Ways to save a model', columns: ['state_dict', 'torch.save(model)', 'torch.export / ONNX'], rows: [
      ['File contains', 'tensors keyed by name', 'pickled Module object', 'a graph of ops plus weights'],
      ['Needs the class definition to load', true, { part: 'and the same module path' }, false],
      ['Survives refactoring your code', true, false, true],
      ['Runs without Python', false, false, true],
      ['Recommended for', 'checkpoints, sharing weights', { part: 'quick experiments only' }, 'deployment, other runtimes'],
    ], verdict: 'Save <code>state_dict</code>s. Whole-model pickles break as soon as you rename a class, and loading them needs <code>weights_only=False</code>, which trusts the file completely.' },
  ],
  gotchas: [
    { title: 'Forgetting zero_grad accumulates gradients', bad: `for xb, yb in loader:
    loss = loss_fn(model(xb), yb)
    loss.backward()
    opt.step()          # gradients from every previous batch are still in .grad`, good: `for xb, yb in loader:
    opt.zero_grad()
    loss = loss_fn(model(xb), yb)
    loss.backward()
    opt.step()`, why: '<code>backward()</code> adds to <code>.grad</code> by design (that is how gradient accumulation over micro-batches works). Without <code>zero_grad()</code> each step applies the sum of all gradients so far and training diverges.' },
    { title: 'Validating without eval() and no_grad()', bad: `for xb, yb in val_loader:
    pred = model(xb).argmax(1)   # dropout still active, graph kept alive → wrong numbers, memory climbs`, good: `model.eval()
with torch.no_grad():
    for xb, yb in val_loader:
        pred = model(xb).argmax(1)
model.train()`, why: '<code>eval()</code> switches Dropout off and makes BatchNorm use its running statistics; <code>no_grad()</code> stops autograd from recording, which saves memory and time. They do different jobs and you need both.' },
    { title: 'Model on the GPU, data on the CPU', bad: `model = model.to("cuda")
for xb, yb in loader:
    out = model(xb)   # RuntimeError: Expected all tensors to be on the same device`, good: `model = model.to(device)
for xb, yb in loader:
    xb, yb = xb.to(device), yb.to(device)
    out = model(xb)`, why: 'DataLoader yields CPU tensors. Every tensor that meets a parameter must be on the parameter\'s device, so move each batch explicitly (<code>non_blocking=True</code> with <code>pin_memory</code> overlaps the copy with compute).' },
    { title: 'Softmax before CrossEntropyLoss', bad: `logits = model(xb)
probs = torch.softmax(logits, dim=1)
loss = nn.CrossEntropyLoss()(probs, yb)   # trains, but slowly and to a worse optimum`, good: `logits = model(xb)
loss = nn.CrossEntropyLoss()(logits, yb)  # log_softmax + NLL happen inside
probs = logits.softmax(dim=1)             # only for reporting`, why: '<code>CrossEntropyLoss</code> already applies <code>log_softmax</code>. Feeding it probabilities squashes the gradient signal and hides the bug because the loss still goes down. The same applies to <code>BCEWithLogitsLoss</code> vs <code>sigmoid</code> + <code>BCELoss</code>.' },
  ],
};
