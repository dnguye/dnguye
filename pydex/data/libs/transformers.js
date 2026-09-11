import { scene } from '../../js/explainer.js';

// Explainer: text → tokenizer → ids → model → logits → sampling → decode, one step of generate().
const generateExplainer = {
  hold: 3200,
  code: ['enc = tok("The cat sat on the", return_tensors="pt")', '# enc.input_ids, enc.attention_mask', 'logits = model(**enc).logits          # [1, 5, vocab]', 'probs = softmax(logits[0, -1] / temperature)', 'model.generate(**enc, max_new_tokens=1, do_sample=True)'],
  build() {
    const s = scene(760, 340);
    s.cell('txt', 20, 30, 220, 34, 'The cat sat on the');
    s.cell('tok', 300, 30, 130, 34, 'AutoTokenizer');
    s.arrow('a-tok', 242, 47, 296, 47);
    s.text('l-tok', 20, 86, 'tokens', 'lbl sm ink-2', undefined, 'start');
    ['The', 'Ġcat', 'Ġsat', 'Ġon', 'Ġthe'].forEach((t, i) => s.cell(`t${i}`, 20 + i * 76, 100, 70, 30, t, 'cell hid'));
    s.text('l-ids', 20, 146, 'input_ids', 'lbl sm ink-2', undefined, 'start');
    [464, 3797, 3332, 319, 262].forEach((v, i) => s.cell(`i${i}`, 20 + i * 76, 158, 70, 30, String(v), 'cell info hid'));
    s.text('l-mask', 20, 210, '', 'lbl sm ink-2', undefined, 'start');
    s.cell('model', 460, 100, 150, 70, 'model', 'cell hid');
    s.arrow('a-model', 398, 173, 456, 150, 'arrow hid');
    s.cell('logits', 460, 200, 150, 34, 'logits [1, 5, 50257]', 'cell hid');
    s.arrow('a-logits', 535, 172, 535, 196, 'arrow hid');
    s.text('l-prob', 640, 116, 'p(next token)', 'lbl sm ink-2', undefined, 'start');
    [['Ġmat  41%', 'p0'], ['Ġfloor  18%', 'p1'], ['Ġsofa  9%', 'p2'], ['…  32%', 'p3']].forEach(([t, id], i) => s.cell(id, 640, 130 + i * 32, 100, 28, t, 'cell hid'));
    s.arrow('a-probs', 612, 217, 636, 217, 'arrow hid');
    s.text('l-sample', 460, 268, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l-loop', 20, 316, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Text becomes subword tokens', caption: 'The tokenizer splits text with a learned byte-pair vocabulary. Common words are one token; rare ones become several pieces. The Ġ marks a leading space, so " cat" and "cat" are different tokens.', lines: [0],
      patch: { 'txt.r': { cls: 'cell hot' }, 'tok.r': { cls: 'cell hot' }, 'a-tok': { cls: 'arrow hot' }, t0: { cls: '' }, t1: { cls: '' }, t2: { cls: '' }, t3: { cls: '' }, t4: { cls: '' } } },
    { title: 'Tokens become ids plus an attention mask', caption: 'Each token is looked up in the vocabulary (GPT-2 ids shown). The attention mask is 1 for real tokens and 0 for padding, which is how a batch of different lengths can share one tensor.', lines: [0, 1],
      patch: { 'txt.r': { cls: 'cell' }, 'tok.r': { cls: 'cell' }, 'a-tok': { cls: 'arrow' }, i0: { cls: '' }, i1: { cls: '' }, i2: { cls: '' }, i3: { cls: '' }, i4: { cls: '' }, 'l-mask': { text: 'attention_mask = [1, 1, 1, 1, 1]' } } },
    { title: 'The model turns ids into logits', caption: 'A forward pass gives one score for every vocabulary entry at every position: shape [batch, seq, vocab]. For generation only the last position matters; it predicts what follows "the".', lines: [2],
      patch: { model: { cls: '' }, 'model.r': { cls: 'cell hot' }, 'a-model': { cls: 'arrow hot flow' }, logits: { cls: '' }, 'a-logits': { cls: 'arrow hot' } } },
    { title: 'Logits become a distribution', caption: 'softmax turns the last row of scores into probabilities. temperature divides the logits first (below 1 sharpens, above 1 flattens); top_k and top_p cut the long tail before sampling.', lines: [3],
      patch: { 'model.r': { cls: 'cell' }, 'a-model': { cls: 'arrow' }, 'a-logits': { cls: 'arrow' }, 'logits.r': { cls: 'cell hot' }, 'a-probs': { cls: 'arrow hot' }, p0: { cls: '' }, p1: { cls: '' }, p2: { cls: '' }, p3: { cls: '' }, 'l-sample': { text: 'temperature=0.7 · top_k=50 · top_p=0.9' } } },
    { title: 'One token is chosen and decoded', caption: 'With do_sample=True a token is drawn from the trimmed distribution; with do_sample=False (greedy) the argmax wins every time. tokenizer.decode maps the id back to text.', lines: [4],
      patch: { 'logits.r': { cls: 'cell' }, 'a-probs': { cls: 'arrow' }, 'p0.r': { cls: 'cell ok' }, p1: { cls: 'dim' }, p2: { cls: 'dim' }, p3: { cls: 'dim' }, 'txt.t': { text: 'The cat sat on the mat' }, 'txt.r': { cls: 'cell ok' }, 'l-sample': { text: 'sampled id 2603 → tok.decode([2603]) == " mat"' } } },
    { title: 'Append and repeat', caption: 'generate() appends the new id and runs the model again. Thanks to the KV cache earlier positions are not recomputed. It stops at eos_token_id or after max_new_tokens steps, whichever comes first.', lines: [4],
      patch: { 'l-loop': { text: 'input_ids += [2603] → forward → sample → … until eos_token_id or max_new_tokens' }, 'a-model': { cls: 'arrow hot flow' } } },
  ],
};

export default {
  id: 'transformers', name: 'transformers', glyph: 'tf', group: 'ai', version: '5.17', keywords: 'huggingface hugging face llm tokenizer pipeline generate bert gpt fine-tune trainer lora peft',
  tagline: 'Pretrained models from the Hugging Face Hub, one API for all of them.',
  install: 'pip install transformers', docs: 'https://huggingface.co/docs/transformers/', packages: [], runnable: false,
  overview: {
    what: 'transformers gives every model on the Hugging Face Hub the same three-part interface: a tokenizer (or processor) that turns text, images or audio into tensors, a model that maps tensors to logits or embeddings, and generate() for autoregressive decoding. pipeline() wraps all three for one-line inference; Trainer wraps the training loop. Since v5 the library is PyTorch-only and loads weights as safetensors.',
    yes: ['Running a published model: classification, NER, embeddings, chat, speech, vision.', 'Fine-tuning a pretrained checkpoint on your own labelled data.', 'You want the same code to work across hundreds of architectures.', 'Prototyping with an open-weights LLM before committing to a serving stack.'],
    no: ['High-throughput LLM serving in production (vLLM, TGI, SGLang; they load the same checkpoints).', 'Training from scratch at scale with custom parallelism (Megatron, torchtitan).', 'You only need an API model (call the provider SDK or LangChain).', 'Tiny classical NLP tasks where a regex or scikit-learn does the job.'],
    note: 'Models need PyTorch and weights downloaded from the Hub, neither of which exists in the browser sandbox, so nothing on this page runs here. Locally: <code>pip install torch transformers</code> (add <code>datasets accelerate peft</code> for the fine-tuning snippets). The first call to <code>from_pretrained</code> downloads the checkpoint into <code>~/.cache/huggingface</code>; small models (distilbert, Qwen2.5-0.5B) run fine on a CPU, anything larger wants a GPU. Gated models need <code>hf auth login</code>.',
  },
  cheatsheet: [
    { id: 'pipeline', title: 'pipeline(): one line to a result', snippets: [
      { title: 'Text classification and NER', code: `from transformers import pipeline

clf = pipeline("sentiment-analysis")   # downloads a small default model
print(clf(["I love this keyboard.", "The battery died in a day."]))
# [{'label': 'POSITIVE', 'score': 0.99…}, {'label': 'NEGATIVE', 'score': 0.99…}]

ner = pipeline("token-classification", model="dslim/bert-base-NER", aggregation_strategy="simple")
for ent in ner("Ada Lovelace worked with Charles Babbage in London."):
    print(ent["entity_group"], ent["word"], round(ent["score"], 2))

zs = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print(zs("The invoice is overdue", candidate_labels=["billing", "shipping", "support"]))`, note: 'Pass <code>device="cuda"</code> or <code>device_map="auto"</code> to run on a GPU. Always pin <code>model=</code> in real code; the task defaults can change between releases.' },
      { title: 'Chat with an instruct model', code: `from transformers import pipeline

gen = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B-Instruct",
               dtype="auto", device_map="auto")
messages = [
    {"role": "system", "content": "Answer in one sentence."},
    {"role": "user", "content": "Why do otters hold hands?"},
]
out = gen(messages, max_new_tokens=40, do_sample=False)
print(out[0]["generated_text"][-1]["content"])   # the assistant turn
# batching: gen([messages_a, messages_b], batch_size=2, max_new_tokens=40)`, note: 'Given a list of message dicts, the pipeline applies the model\'s chat template for you and returns the full conversation with the reply appended.' },
    ] },
    { id: 'tokenizers', title: 'Tokenizers', blurb: 'Text in, ids and masks out. Same object decodes.', snippets: [
      { title: 'Encode, inspect, decode', code: `from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("google-bert/bert-base-uncased")
enc = tok("Otters hold hands.", "So do humans.")      # a sentence pair
print(enc.keys())              # input_ids, token_type_ids, attention_mask
print(tok.convert_ids_to_tokens(enc["input_ids"]))
# ['[CLS]', 'otters', 'hold', 'hands', '.', '[SEP]', 'so', 'do', 'humans', '.', '[SEP]']
print(tok.decode(enc["input_ids"], skip_special_tokens=True))
print(tok.vocab_size, tok.model_max_length, tok.pad_token, tok.eos_token)`, note: 'Each checkpoint ships its own vocabulary and special tokens; always load the tokenizer with the same name as the model.' },
      { title: 'Batches: padding and truncation', code: `from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("google-bert/bert-base-uncased")
batch = tok(["short", "a much longer sentence that keeps going"],
            padding=True, truncation=True, max_length=8, return_tensors="pt")
print(batch["input_ids"].shape)          # torch.Size([2, 8])
print(batch["attention_mask"])
# tensor([[1, 1, 1, 0, 0, 0, 0, 0],
#         [1, 1, 1, 1, 1, 1, 1, 1]])
print(batch["input_ids"][0])             # padded with tok.pad_token_id`, note: '<code>padding="max_length"</code> pads every row to <code>max_length</code>; <code>padding=True</code> pads to the longest in the batch, which is cheaper. Truncation silently drops the tail, so check lengths for long inputs.' },
      { title: 'Chat templates', code: `from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
messages = [{"role": "system", "content": "Be brief."},
            {"role": "user", "content": "Why is the sky blue?"}]
text = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
print(text)
# <|im_start|>system\\nBe brief.<|im_end|>\\n<|im_start|>user\\n…<|im_end|>\\n<|im_start|>assistant\\n
inputs = tok.apply_chat_template(messages, add_generation_prompt=True,
                                 return_tensors="pt", return_dict=True)
print(inputs["input_ids"].shape)`, note: 'The template lives in the tokenizer config, so each model family gets its own special tokens without you hard-coding them. <code>add_generation_prompt=True</code> appends the assistant header so the model continues as the assistant.' },
    ] },
    { id: 'models', title: 'Models and their outputs', snippets: [
      { title: 'AutoModel: hidden states and embeddings', code: `import torch
from transformers import AutoTokenizer, AutoModel

name = "google-bert/bert-base-uncased"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModel.from_pretrained(name).eval()
inputs = tok(["Otters hold hands.", "Rocks do not."], padding=True, return_tensors="pt")
with torch.inference_mode():
    out = model(**inputs)
print(out.last_hidden_state.shape)           # torch.Size([2, 7, 768])
mask = inputs["attention_mask"].unsqueeze(-1)
emb = (out.last_hidden_state * mask).sum(1) / mask.sum(1)   # mean pool, ignore padding
print(torch.nn.functional.cosine_similarity(emb[0], emb[1], dim=0))`, note: 'Outputs are dataclass-like: <code>out.last_hidden_state</code>, <code>out.logits</code>, <code>out.hidden_states</code> (with <code>output_hidden_states=True</code>). For sentence embeddings, a purpose-trained model (sentence-transformers) beats mean-pooled BERT.' },
      { title: 'AutoModelFor…: task heads and logits', code: `import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

name = "distilbert/distilbert-base-uncased-finetuned-sst-2-english"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name).eval()
inputs = tok(["Great film.", "Dull and far too long."], padding=True, return_tensors="pt")
with torch.inference_mode():
    logits = model(**inputs).logits          # [2, num_labels]
probs = logits.softmax(dim=-1)
for row in probs:
    print(model.config.id2label[row.argmax().item()], round(row.max().item(), 3))
# ...ForCausalLM, ...ForTokenClassification, ...ForQuestionAnswering, ...ForImageClassification` },
      { title: 'Load a causal LM with dtype and device_map', code: `import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(
    name,
    dtype=torch.bfloat16,     # "auto" reads the checkpoint's dtype; torch_dtype= was the old name
    device_map="auto",        # place on GPU(s), spill to CPU if needed (needs accelerate)
)
print(model.device, next(model.parameters()).dtype)
print(model.num_parameters() / 1e6, "M params")
print(model.config.max_position_embeddings)`, note: 'Without <code>device_map</code> the model loads on CPU and you call <code>.to("cuda")</code> yourself. <code>bfloat16</code> halves memory with negligible quality loss; on CPU stay in <code>float32</code>.' },
    ] },
    { id: 'generate', title: 'Generation', snippets: [
      { title: 'generate() with sampling controls', code: `import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name, dtype="auto", device_map="auto")
messages = [{"role": "user", "content": "Give me a haiku about otters."}]
inputs = tok.apply_chat_template(messages, add_generation_prompt=True,
                                 return_tensors="pt", return_dict=True).to(model.device)
out = model.generate(**inputs, max_new_tokens=60,
                     do_sample=True, temperature=0.7, top_p=0.9, top_k=50,
                     repetition_penalty=1.1, pad_token_id=tok.eos_token_id)
new_tokens = out[0, inputs["input_ids"].shape[1]:]     # strip the prompt
print(tok.decode(new_tokens, skip_special_tokens=True))
# deterministic: do_sample=False (greedy) or num_beams=4, do_sample=False`, note: '<code>generate</code> returns prompt + completion, so slice off the prompt length. Sampling parameters only apply when <code>do_sample=True</code>; otherwise you get a warning and greedy decoding.' },
      { title: 'Stream tokens as they arrive', code: `from threading import Thread
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name, dtype="auto", device_map="auto")
inputs = tok.apply_chat_template([{"role": "user", "content": "Explain KV cache briefly."}],
                                 add_generation_prompt=True, return_tensors="pt", return_dict=True).to(model.device)

streamer = TextIteratorStreamer(tok, skip_prompt=True, skip_special_tokens=True)
Thread(target=model.generate, kwargs={**inputs, "max_new_tokens": 120, "streamer": streamer}).start()
for piece in streamer:                     # yields decoded text chunks
    print(piece, end="", flush=True)
print()`, note: '<code>TextStreamer</code> prints straight to stdout with no thread; <code>TextIteratorStreamer</code> is the one to use behind a web endpoint or UI.' },
      { title: 'Batched generation (left padding)', code: `from transformers import AutoTokenizer, AutoModelForCausalLM

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name, padding_side="left")   # decoder-only: pad on the left
if tok.pad_token is None:
    tok.pad_token = tok.eos_token
model = AutoModelForCausalLM.from_pretrained(name, dtype="auto", device_map="auto")

prompts = ["The capital of Norway is", "Three uses for a paperclip:"]
inputs = tok(prompts, padding=True, return_tensors="pt").to(model.device)
out = model.generate(**inputs, max_new_tokens=20, do_sample=False)
for row in tok.batch_decode(out[:, inputs["input_ids"].shape[1]:], skip_special_tokens=True):
    print(repr(row))` },
    ] },
    { id: 'finetune', title: 'Fine-tuning', blurb: 'datasets for the data, Trainer for the loop, PEFT to make it cheap.', snippets: [
      { title: 'Prepare data with datasets', code: `from datasets import load_dataset
from transformers import AutoTokenizer

ds = load_dataset("imdb")                           # DatasetDict: train / test / unsupervised
# or your own file: load_dataset("csv", data_files="reviews.csv")
tok = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased")

def prep(batch):
    return tok(batch["text"], truncation=True, max_length=256)

ds = ds.map(prep, batched=True, remove_columns=["text"])
train = ds["train"].shuffle(seed=0).select(range(2000))
test = ds["test"].shuffle(seed=0).select(range(500))
print(train.column_names)      # ['label', 'input_ids', 'attention_mask']
print(train[0]["input_ids"][:8])`, note: '<code>map(batched=True)</code> tokenizes thousands of rows per call and caches to disk (Arrow), so re-runs are instant. Keep the column named <code>label</code> (or <code>labels</code>): Trainer looks for it.' },
      { title: 'Trainer', code: `import numpy as np
from transformers import (AutoModelForSequenceClassification, TrainingArguments,
                          Trainer, DataCollatorWithPadding)

model = AutoModelForSequenceClassification.from_pretrained("distilbert/distilbert-base-uncased", num_labels=2)

def compute_metrics(p):
    return {"accuracy": (p.predictions.argmax(-1) == p.label_ids).mean()}

args = TrainingArguments(output_dir="out", per_device_train_batch_size=16, num_train_epochs=1,
                         learning_rate=2e-5, eval_strategy="epoch", save_strategy="epoch",
                         bf16=True, logging_steps=25, report_to="none")
trainer = Trainer(model=model, args=args, train_dataset=train, eval_dataset=test,
                  processing_class=tok, data_collator=DataCollatorWithPadding(tok),
                  compute_metrics=compute_metrics)
trainer.train()
print(trainer.evaluate())
trainer.save_model("out/best")   # model + tokenizer, loadable with from_pretrained`, note: 'Uses <code>train</code>, <code>test</code> and <code>tok</code> from the previous snippet. <code>processing_class=</code> replaced <code>tokenizer=</code>; <code>eval_strategy</code> replaced <code>evaluation_strategy</code>. Set <code>bf16=False</code> on CPU or older GPUs.' },
      { title: 'LoRA with PEFT', code: `from transformers import AutoModelForCausalLM
from peft import LoraConfig, get_peft_model, TaskType, PeftModel

base = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct", dtype="auto", device_map="auto")
cfg = LoraConfig(task_type=TaskType.CAUSAL_LM, r=8, lora_alpha=16, lora_dropout=0.05,
                 target_modules=["q_proj", "k_proj", "v_proj", "o_proj"])
model = get_peft_model(base, cfg)
model.print_trainable_parameters()     # trainable params: … || all params: … || trainable%: <1
# train with Trainer (or trl's SFTTrainer) exactly as before, then:
model.save_pretrained("adapter")       # writes only the adapter weights (a few MB)

# later: load base again, attach the adapter, optionally fold it in
model = PeftModel.from_pretrained(base, "adapter")
merged = model.merge_and_unload()      # a plain model with LoRA baked into the weights`, note: 'LoRA trains small low-rank matrices next to frozen weights, so memory drops to roughly the forward pass. Pick <code>target_modules</code> by printing the model and reading the attention projection names.' },
    ] },
    { id: 'loading', title: 'Loading, quantising, saving', snippets: [
      { title: '4-bit quantisation with bitsandbytes', code: `import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                         bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_use_double_quant=True)
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct",
                                             quantization_config=bnb, device_map="auto")
print(model.get_memory_footprint() / 1e9, "GB")
# 8-bit: BitsAndBytesConfig(load_in_8bit=True)
# training on top of a 4-bit base = QLoRA (peft.prepare_model_for_kbit_training first)`, note: 'bitsandbytes needs a CUDA GPU. Alternatives: pre-quantised GPTQ/AWQ checkpoints from the Hub load with no extra config, and <code>TorchAoConfig</code> covers int8/int4 via torchao.' },
      { title: 'Save, reload, share', code: `from transformers import AutoTokenizer, AutoModelForSequenceClassification

name = "distilbert/distilbert-base-uncased-finetuned-sst-2-english"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name)

model.save_pretrained("my-model")      # config.json + model.safetensors
tok.save_pretrained("my-model")        # tokenizer files next to it
model = AutoModelForSequenceClassification.from_pretrained("my-model")

# model.push_to_hub("your-name/my-model"); tok.push_to_hub("your-name/my-model")
# pin a revision when reproducibility matters:
# from_pretrained(name, revision="main")   # or a commit hash
# offline / custom cache: HF_HUB_OFFLINE=1, HF_HOME=/mnt/models`, note: 'Pushing needs <code>hf auth login</code> once. Everything under <code>my-model/</code> is what <code>from_pretrained</code> reads, so the directory can be zipped, copied or mounted.' },
    ] },
  ],
  concepts: [
    { id: 'generate', title: 'From text to the next token', intro: 'Every call to <code>generate()</code> is this loop: tokenize, forward, turn the last row of logits into probabilities, pick one, decode, append. The sampling parameters all act on step four.', explainer: generateExplainer },
  ],
  compare: [
    { title: 'Three ways to run a model', columns: ['pipeline()', 'Auto* + forward()', 'Auto* + generate()'], rows: [
      ['Lines to a first result', { dots: 5 }, { dots: 3 }, { dots: 2 }],
      ['Control over pre/post-processing', { dots: 2 }, { dots: 5 }, { dots: 4 }],
      ['Access to logits and hidden states', false, true, { part: 'output_scores=True' }],
      ['Batching', { part: 'batch_size=' }, 'you build the batch', 'you build the batch, left-padded'],
      ['Chat template applied for you', true, false, false],
      ['Use for', 'demos, quick evaluation, non-LLM tasks', 'embeddings, classification, research', 'text generation with tuned decoding'],
    ], verdict: 'Start with <code>pipeline()</code>; drop to tokenizer + model when you need the tensors, and to <code>generate()</code> when decoding parameters matter. All three load the same checkpoint.' },
    { title: 'Loading precision', columns: ['float32', 'bfloat16', '8-bit (bitsandbytes)', '4-bit nf4'], rows: [
      ['Bytes per weight', '4', '2', '1', '~0.5'],
      ['Needs a GPU', false, { part: 'slow on CPU' }, true, true],
      ['Quality loss', 'none', 'negligible', 'small', 'noticeable on small models'],
      ['Can fine-tune directly', true, true, { part: 'LoRA only' }, { part: 'QLoRA only' }],
      ['Load with', { code: 'from_pretrained(name)' }, { code: 'dtype=torch.bfloat16' }, { code: 'quantization_config=BitsAndBytesConfig(load_in_8bit=True)' }, { code: 'BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")' }],
    ], note: 'Bytes per weight are exact for the weights; activations and the KV cache add to the total. Quality rows are judgement calls; measure on your task.', verdict: '<code>bfloat16</code> on any modern GPU is the default. Quantise when the model would not otherwise fit; 4-bit lets a 7B model run on an 8 GB card.' },
  ],
  gotchas: [
    { title: 'Right padding breaks batched generation', bad: `tok = AutoTokenizer.from_pretrained(name)          # padding_side="right" for most checkpoints
inputs = tok(prompts, padding=True, return_tensors="pt")
out = model.generate(**inputs)   # shorter prompts get garbage: the model continues from [PAD]`, good: `tok = AutoTokenizer.from_pretrained(name, padding_side="left")
if tok.pad_token is None:
    tok.pad_token = tok.eos_token
inputs = tok(prompts, padding=True, return_tensors="pt")
out = model.generate(**inputs, pad_token_id=tok.pad_token_id)`, why: 'A decoder-only model predicts from the last position. With right padding that position is a pad token for every prompt shorter than the longest; left padding puts the real prompt ends in the last column.' },
    { title: 'max_length counts the prompt', bad: `out = model.generate(**inputs, max_length=50)
# a 60-token prompt → nothing generated, or a cut-off reply`, good: `out = model.generate(**inputs, max_new_tokens=50)`, why: '<code>max_length</code> is the total sequence length including the prompt. <code>max_new_tokens</code> is what you almost always mean; when both are set, <code>max_new_tokens</code> wins and you get a warning.' },
    { title: 'Prompting an instruct model without its chat template', bad: `inputs = tok("Why is the sky blue?", return_tensors="pt")
out = model.generate(**inputs, max_new_tokens=60)   # rambles, continues the question, ignores the "instruction"`, good: `inputs = tok.apply_chat_template([{"role": "user", "content": "Why is the sky blue?"}],
                                 add_generation_prompt=True, return_tensors="pt", return_dict=True)
out = model.generate(**inputs, max_new_tokens=60)`, why: 'Instruction-tuned checkpoints were trained on a specific wrapper of role markers and special tokens. Without it the model sees raw text and behaves like its base model.' },
    { title: 'Missing attention_mask and pad_token', bad: `ids = tok(text, return_tensors="pt")["input_ids"]
out = model.generate(ids)
# warning: "The attention mask and the pad token id were not set…"; batched results differ`, good: `inputs = tok(text, return_tensors="pt")        # dict with input_ids and attention_mask
out = model.generate(**inputs, pad_token_id=tok.eos_token_id)`, why: 'Without the mask the model attends to padding, and without a pad id <code>generate</code> guesses one. Passing the tokenizer\'s dict with <code>**</code> keeps the two tensors together.' },
  ],
};
