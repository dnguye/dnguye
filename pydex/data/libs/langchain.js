import { scene } from '../../js/explainer.js';

// Explainer 1: an LCEL chain is a pipeline of runnables; one input dict flows through it.
const chainExplainer = {
  hold: 3000,
  code: ['chain = prompt | model | StrOutputParser()', 'chain.invoke({"topic": "otters"})', 'for chunk in chain.stream({"topic": "otters"}): …', 'chain.batch([{"topic": "otters"}, {"topic": "eels"}])'],
  build() {
    const s = scene(760, 300);
    s.cell('inp', 20, 40, 150, 36, '{"topic": "otters"}', 'cell info');
    s.cell('prompt', 230, 40, 150, 36, 'ChatPromptTemplate');
    s.cell('model', 440, 40, 130, 36, 'ChatModel');
    s.cell('parser', 620, 40, 120, 36, 'StrOutputParser');
    s.arrow('a1', 172, 58, 226, 58); s.arrow('a2', 382, 58, 436, 58); s.arrow('a3', 572, 58, 616, 58);
    s.text('l-pipe', 380, 22, 'RunnableSequence', 'lbl sm ink-2');
    // values under each stage
    const v1 = s.g('v1', 230, 110, 'hid');
    s.rect('v1.p', 0, 0, 190, 84, 'panel', v1, 8);
    s.text('v1.h', 8, -10, 'ChatPromptValue', 'lbl sm bold ink-2', v1, 'start');
    s.cell('v1.m0', 8, 10, 174, 28, 'system: Be terse.', 'cell', v1);
    s.cell('v1.m1', 8, 46, 174, 28, 'human: Tell me about otters', 'cell', v1);
    s.arrow('d1', 360, 78, 360, 106, 'arrow hid');
    const v2 = s.g('v2', 440, 110, 'hid');
    s.rect('v2.p', 0, 0, 130, 84, 'panel', v2, 8);
    s.text('v2.h', 8, -10, 'AIMessage', 'lbl sm bold ink-2', v2, 'start');
    s.cell('v2.c', 8, 10, 114, 28, 'content: "Otters …"', 'cell', v2);
    s.cell('v2.u', 8, 46, 114, 28, 'usage: 31 / 58 tok', 'cell ghost', v2);
    s.arrow('d2', 550, 78, 550, 106, 'arrow hid');
    s.cell('v3', 620, 120, 120, 36, '"Otters hold…"', 'cell ok hid');
    s.arrow('d3', 680, 78, 680, 116, 'arrow hid');
    s.text('foot', 20, 275, '', 'lbl sm ink-2', undefined, 'start');
    s.text('l-in', 20, 100, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Three runnables, one pipe', caption: 'prompt, model and parser each implement the Runnable interface: invoke, stream, batch and their async twins. The | operator joins them into a RunnableSequence, which is itself a Runnable.', lines: [0],
      patch: { 'prompt.r': { cls: 'cell hot' }, 'model.r': { cls: 'cell hot' }, 'parser.r': { cls: 'cell hot' } } },
    { title: 'invoke() with a dict', caption: 'The first runnable decides the input type. A prompt template wants a dict whose keys match its {variables}; a missing key is a KeyError before any model is called.', lines: [1],
      patch: { 'prompt.r': { cls: 'cell' }, 'model.r': { cls: 'cell' }, 'parser.r': { cls: 'cell' }, 'inp.r': { cls: 'cell hot' }, a1: { cls: 'arrow hot flow' }, 'l-in': { text: 'input_schema: {topic: str}' } } },
    { title: 'The prompt renders messages', caption: 'The template fills in the variables and returns a ChatPromptValue: a list of system/human/ai messages. Nothing has been sent anywhere yet.', lines: [1],
      patch: { 'inp.r': { cls: 'cell info' }, a1: { cls: 'arrow' }, 'prompt.r': { cls: 'cell hot' }, v1: { cls: '' }, d1: { cls: 'arrow hot' } } },
    { title: 'The model returns an AIMessage', caption: 'The chat model converts the messages to the provider\'s wire format, makes the HTTP call and wraps the reply: content, response_metadata, usage_metadata, and tool_calls if the model asked for a tool.', lines: [1],
      patch: { 'prompt.r': { cls: 'cell' }, d1: { cls: 'arrow' }, a2: { cls: 'arrow hot flow' }, 'model.r': { cls: 'cell hot' }, v2: { cls: '' }, d2: { cls: 'arrow hot' } } },
    { title: 'The parser extracts a string', caption: 'StrOutputParser returns message.content. Swap it for JsonOutputParser, or replace model + parser with model.with_structured_output(Schema) to get a pydantic object.', lines: [1],
      patch: { 'model.r': { cls: 'cell' }, a2: { cls: 'arrow' }, d2: { cls: 'arrow' }, a3: { cls: 'arrow hot flow' }, 'parser.r': { cls: 'cell hot' }, v3: { cls: '' }, d3: { cls: 'arrow ok' } } },
    { title: 'stream, batch and async come for free', caption: 'stream() pushes AIMessageChunks through the parser as they arrive; batch() runs inputs concurrently; ainvoke/astream are the async forms. With LangSmith tracing on, each stage is a nested run in the trace.', lines: [2, 3],
      patch: { 'parser.r': { cls: 'cell' }, a1: { cls: 'arrow ok flow' }, a2: { cls: 'arrow ok flow' }, a3: { cls: 'arrow ok flow' }, foot: { text: 'chain.stream → "Ott", "ers ", "hold", "…"   chain.batch → ["Otters …", "Eels …"]   await chain.ainvoke(…)' } } },
  ],
};

// Explainer 2: RAG = embed the question, find nearest chunks, stuff them into the prompt, generate.
const ragExplainer = {
  hold: 3000,
  code: ['store = InMemoryVectorStore.from_documents(chunks, embeddings)', 'docs = store.similarity_search(question, k=2)', 'prompt.invoke({"context": docs, "question": question})', 'answer = model.invoke(messages).content'],
  build() {
    const s = scene(760, 320);
    s.cell('q', 20, 40, 180, 36, '"How do otters sleep?"', 'cell info');
    s.cell('emb', 250, 40, 130, 36, 'embeddings');
    s.cell('vec', 250, 110, 130, 32, '[0.12, −0.31, …]', 'cell hid');
    s.arrow('a-q', 202, 58, 246, 58);
    s.arrow('a-vec', 315, 78, 315, 106, 'arrow hid');
    const st = s.g('store', 430, 30);
    s.rect('store.p', 0, 0, 160, 160, 'panel', st, 8);
    s.text('store.h', 8, -10, 'vector store', 'lbl sm bold ink-2', st, 'start');
    [['otters hold hands', 'd0'], ['sea otter diet', 'd1'], ['kelp forest ecology', 'd2'], ['sleeping in rafts', 'd3']].forEach(([t, id], i) => s.cell(id, 8, 10 + i * 36, 144, 28, t, 'cell', st));
    s.arrow('a-store', 382, 126, 426, 126, 'arrow hid');
    s.text('l-sim', 505, 206, '', 'lbl sm ink-2');
    s.cell('prompt', 630, 40, 110, 36, 'prompt', 'cell');
    s.cell('c0', 630, 84, 110, 26, 'context: rafts', 'cell hid');
    s.cell('c1', 630, 114, 110, 26, 'context: hands', 'cell hid');
    s.cell('c2', 630, 144, 110, 26, 'question', 'cell info hid');
    s.arrow('a-ctx', 592, 60, 626, 60, 'arrow hid');
    s.cell('model', 630, 200, 110, 36, 'model', 'cell');
    s.arrow('a-model', 685, 172, 685, 196, 'arrow hid');
    s.cell('ans', 430, 260, 310, 36, '"They float in rafts, holding paws…"', 'cell ok hid');
    s.path('a-ans', 'M626 218 L560 218 L560 256', 'arrow hid');
    s.text('foot', 20, 300, '', 'lbl sm ink-2', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Index once: chunks become vectors', caption: 'Documents are split into chunks, each chunk is embedded, and the store keeps vector + text + metadata side by side. This happens at build time, not per question.', lines: [0],
      patch: { 'd0.r': { cls: 'cell hot' }, 'd1.r': { cls: 'cell hot' }, 'd2.r': { cls: 'cell hot' }, 'd3.r': { cls: 'cell hot' }, foot: { text: 'RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50) → embed_documents(chunks)' } } },
    { title: 'The question is embedded with the same model', caption: 'At query time the question goes through the identical embedding model, so it lands in the same vector space as the chunks. Mixing embedding models between index and query returns noise.', lines: [1],
      patch: { 'd0.r': { cls: 'cell' }, 'd1.r': { cls: 'cell' }, 'd2.r': { cls: 'cell' }, 'd3.r': { cls: 'cell' }, 'q.r': { cls: 'cell hot' }, 'a-q': { cls: 'arrow hot' }, 'emb.r': { cls: 'cell hot' }, vec: { cls: '' }, 'a-vec': { cls: 'arrow hot' }, foot: { text: 'embed_query(question)' } } },
    { title: 'Nearest neighbours by cosine similarity', caption: 'The store compares the query vector with every chunk vector (or an approximate index for large stores) and returns the top k. Similarity is about wording and meaning, not correctness.', lines: [1],
      patch: { 'q.r': { cls: 'cell info' }, 'a-q': { cls: 'arrow' }, 'emb.r': { cls: 'cell' }, 'a-vec': { cls: 'arrow' }, 'a-store': { cls: 'arrow hot flow' }, 'd3.r': { cls: 'cell ok' }, 'd0.r': { cls: 'cell ok' }, d1: { cls: 'dim' }, d2: { cls: 'dim' }, 'l-sim': { text: 'k=2: rafts 0.81, hands 0.74' } } },
    { title: 'Stuff the chunks into the prompt', caption: 'The retrieved page_content is joined into a {context} slot next to the {question}. In a chain, a dict step ({"context": retriever | format, "question": RunnablePassthrough()}) feeds both.', lines: [2],
      patch: { 'a-store': { cls: 'arrow' }, 'a-ctx': { cls: 'arrow ok' }, 'prompt.r': { cls: 'cell hot' }, c0: { cls: '' }, c1: { cls: '' }, c2: { cls: '' }, foot: { text: '"Answer using only this context:\\n{context}\\n\\nQuestion: {question}"' } } },
    { title: 'The model answers from the context', caption: 'The model sees the chunks and the question in one message and writes a grounded answer. If retrieval missed the right chunk the model will still answer, so evaluate retrieval on its own.', lines: [3],
      patch: { 'prompt.r': { cls: 'cell' }, 'a-model': { cls: 'arrow hot flow' }, 'model.r': { cls: 'cell hot' }, ans: { cls: '' }, 'a-ans': { cls: 'arrow ok' }, foot: { text: 'return answer + [d.metadata["source"] for d in docs]   # cite what you retrieved' } } },
  ],
};

export default {
  id: 'langchain', name: 'LangChain', glyph: 'lc', group: 'ai', version: '1.4', keywords: 'llm chain lcel runnable prompt chat model rag retriever vector store agent tool langgraph langsmith',
  tagline: 'Compose prompts, models, tools and retrievers into runnable chains.',
  install: 'pip install langchain langchain-openai', docs: 'https://docs.langchain.com/oss/python/langchain/overview', packages: [], runnable: false,
  overview: {
    what: 'LangChain is a set of interfaces over LLM providers plus a composition language for gluing them together. Chat models, prompts, output parsers, retrievers and tools all implement Runnable, and the | operator chains them. Agents (create_agent) run a tool-calling loop on top of LangGraph, which also provides persistence. Provider code lives in separate packages (langchain-openai, langchain-anthropic, langchain-ollama, …) so the core stays small.',
    yes: ['Switching providers or models without rewriting call sites.', 'RAG: loaders, splitters, embeddings and dozens of vector-store integrations behind one interface.', 'Tool-calling agents with persistent conversation state.', 'You want tracing (LangSmith) and streaming across a multi-step pipeline for free.'],
    no: ['One model, one provider, one prompt: the provider SDK is fewer moving parts.', 'You need exact control over every request and token (call the API directly).', 'Complex branching workflows: reach for LangGraph itself rather than nesting chains.', 'The team is allergic to churn: the API has been reshaped several times (see the note).'],
    note: 'Nothing here runs in the browser: every snippet calls a hosted model and needs an API key in the environment (<code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, or a local Ollama server via <code>langchain-ollama</code>). Locally: <code>pip install langchain langchain-openai langchain-text-splitters langgraph</code>. <strong>On version drift:</strong> LangChain 1.0 (October 2025) moved legacy chains (<code>LLMChain</code>, <code>ConversationChain</code>, <code>RetrievalQA</code>) to <code>langchain-classic</code>, replaced <code>langgraph.prebuilt.create_react_agent</code> with <code>langchain.agents.create_agent</code>, and standardised message content blocks. The snippets target 1.x; if an import fails, check the version you have installed before anything else. Training-data code from 2023 and 2024 is mostly wrong now.',
  },
  cheatsheet: [
    { id: 'models', title: 'Chat models', blurb: 'One constructor, any provider.', snippets: [
      { title: 'init_chat_model and invoke', code: `from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-4o-mini", temperature=0)   # reads OPENAI_API_KEY
# other providers, same interface (each needs its package installed):
#   init_chat_model("anthropic:claude-opus-5")
#   init_chat_model("ollama:llama3.2")
# or the provider class directly: from langchain_openai import ChatOpenAI

reply = model.invoke("Explain what a runnable is, in one sentence.")
print(reply.content)
print(reply.usage_metadata)        # {'input_tokens': …, 'output_tokens': …, 'total_tokens': …}
print(reply.response_metadata["model_name"])`, note: 'The string form is <code>"provider:model"</code>. <code>invoke</code> accepts a plain string, a list of messages, or a list of <code>(role, text)</code> tuples.' },
      { title: 'Messages and multi-turn', code: `from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

model = init_chat_model("openai:gpt-4o-mini")
messages = [
    SystemMessage("You are terse."),
    HumanMessage("Name three otter species."),
]
ai = model.invoke(messages)            # an AIMessage
messages += [ai, HumanMessage("Which of those is the largest?")]
print(model.invoke(messages).content)
# tuple shorthand works too: [("system", "…"), ("human", "…")]`, note: 'You own the history: append the <code>AIMessage</code> you got back, then the next <code>HumanMessage</code>. For persistence across requests see the memory group.' },
      { title: 'Batch, async, retries, fallbacks', code: `import asyncio
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-4o-mini")
answers = model.batch(["Capital of Peru?", "Capital of Ghana?"], config={"max_concurrency": 5})
print([a.content for a in answers])

robust = model.with_retry(stop_after_attempt=3).with_fallbacks(
    [init_chat_model("openai:gpt-4o")]
)
print(robust.invoke("hi").content)

async def main():
    r = await model.ainvoke("Say hello in Welsh.")
    print(r.content)
asyncio.run(main())`, note: '<code>with_retry</code> and <code>with_fallbacks</code> return new runnables, so they compose into chains like anything else.' },
    ] },
    { id: 'chains', title: 'Prompts and LCEL chains', blurb: 'prompt | model | parser. The pipe builds a RunnableSequence.', snippets: [
      { title: 'A prompt template chain', code: `from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {tone} assistant."),
    ("human", "Tell me about {topic} in two sentences."),
])
model = init_chat_model("openai:gpt-4o-mini")
chain = prompt | model | StrOutputParser()

print(chain.invoke({"tone": "terse", "topic": "otters"}))
print(chain.input_schema.model_json_schema()["properties"].keys())   # tone, topic`, note: 'Variables use single braces. To include a literal brace in the template, double it: <code>{{</code>.' },
      { title: 'Parallel branches and plain functions', code: `from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough

model = init_chat_model("openai:gpt-4o-mini")
summary = ChatPromptTemplate.from_template("Summarise in one line: {text}") | model | StrOutputParser()
title = ChatPromptTemplate.from_template("A five-word title for: {text}") | model | StrOutputParser()

pipeline = (
    RunnableLambda(lambda s: {"text": s.strip()})            # any function is a runnable
    | RunnableParallel(summary=summary, title=title, text=RunnablePassthrough())
    | RunnableLambda(lambda d: f"{d['title']}\\n{d['summary']}")
)
print(pipeline.invoke("  Sea otters use rocks to crack open shellfish… "))`, note: 'A dict literal inside a pipe becomes a <code>RunnableParallel</code> automatically; the branches run concurrently. <code>RunnablePassthrough()</code> forwards the input unchanged.' },
    ] },
    { id: 'structured', title: 'Structured output', snippets: [
      { title: 'with_structured_output and pydantic', code: `from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model

class Person(BaseModel):
    name: str
    age: int = Field(description="Age in whole years")
    hobbies: list[str] = []

model = init_chat_model("openai:gpt-4o-mini")
extractor = model.with_structured_output(Person)
p = extractor.invoke("Ana is 34 and spends weekends on chess and kayaking.")
print(p)                 # name='Ana' age=34 hobbies=['chess', 'kayaking']
print(type(p).__name__)  # Person: a validated pydantic instance, not a string
# raw = model.with_structured_output(Person, include_raw=True).invoke(...)  # {"raw", "parsed", "parsing_error"}`, note: 'Uses the provider\'s native tool-calling or JSON mode, so it needs a model that supports one of them. Field descriptions become part of the schema the model sees, so write them.' },
      { title: 'Parser-based JSON for any model', code: `from pydantic import BaseModel
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

class Review(BaseModel):
    sentiment: str
    keywords: list[str]

parser = JsonOutputParser(pydantic_object=Review)
prompt = ChatPromptTemplate.from_messages([
    ("system", "Reply with JSON only.\\n{format_instructions}"),
    ("human", "{text}"),
]).partial(format_instructions=parser.get_format_instructions())
chain = prompt | init_chat_model("openai:gpt-4o-mini") | parser
print(chain.invoke({"text": "Battery life is superb, screen is dim."}))   # a dict`, note: 'Works with models that have no tool-calling because it relies on the prompt. Returns a dict; use <code>PydanticOutputParser</code> for a validated object, and expect the occasional parse failure to handle.' },
    ] },
    { id: 'rag', title: 'Retrieval', blurb: 'Split, embed, store, search, then stuff the hits into a prompt.', snippets: [
      { title: 'Build a vector store', code: `from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.embeddings import init_embeddings

docs = [Document(page_content=open("notes.md").read(), metadata={"source": "notes.md"})]
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)
print(len(chunks), chunks[0].metadata)

emb = init_embeddings("openai:text-embedding-3-small")
store = InMemoryVectorStore.from_documents(chunks, emb)
for doc, score in store.similarity_search_with_score("how do otters sleep", k=3):
    print(round(score, 3), doc.page_content[:60])
# persistent stores, same API: langchain_chroma.Chroma, langchain_postgres.PGVector, FAISS, …`, note: 'Loaders for PDF, HTML, Notion, S3 and the rest live in <code>langchain-community</code> (<code>PyPDFLoader</code>, <code>WebBaseLoader</code>). They all yield <code>Document</code>s, so the rest of the pipeline is unchanged.' },
      { title: 'A RAG chain', code: `from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

retriever = store.as_retriever(search_kwargs={"k": 3})        # store from the previous snippet

def format_docs(docs):
    return "\\n\\n".join(f"[{d.metadata['source']}] {d.page_content}" for d in docs)

prompt = ChatPromptTemplate.from_template(
    "Answer using only this context. Say 'not in the notes' if it is missing.\\n\\n{context}\\n\\nQuestion: {question}"
)
rag = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt | init_chat_model("openai:gpt-4o-mini") | StrOutputParser()
)
print(rag.invoke("How do otters sleep?"))`, note: 'The dict step receives the question string, sends it to the retriever on one branch and passes it through on the other, so the prompt gets both keys.' },
    ] },
    { id: 'agents', title: 'Tools and agents', snippets: [
      { title: 'Define a tool and let the model call it', code: `from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage

@tool
def get_weather(city: str) -> str:
    """Return today's weather for a city."""      # the docstring is the tool description
    return f"Sunny in {city}, 21 C"

model = init_chat_model("openai:gpt-4o-mini").bind_tools([get_weather])
msgs = [HumanMessage("What's the weather in Oslo?")]
ai = model.invoke(msgs)
print(ai.tool_calls)     # [{'name': 'get_weather', 'args': {'city': 'Oslo'}, 'id': 'call_…', 'type': 'tool_call'}]

tool_msg = get_weather.invoke(ai.tool_calls[0])   # runs it → a ToolMessage with the matching id
final = model.invoke(msgs + [ai, tool_msg])
print(final.content)`, note: 'This is one turn of the agent loop by hand: model asks, you run, you send the result back. <code>bind_tools</code> only advertises the tools; nothing executes until you call them.' },
      { title: 'create_agent runs the loop for you', code: `from langchain.agents import create_agent
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Return today's weather for a city."""
    return f"Sunny in {city}, 21 C"

agent = create_agent(
    model="openai:gpt-4o-mini",
    tools=[get_weather],
    system_prompt="You are a travel assistant. Use tools for facts.",
)
result = agent.invoke({"messages": [{"role": "user", "content": "Is Oslo warm today?"}]})
print(result["messages"][-1].content)
for m in result["messages"]:            # human → ai(tool_calls) → tool → ai
    print(type(m).__name__, getattr(m, "tool_calls", None) or m.content[:60])`, note: 'The agent is a compiled LangGraph graph: state is <code>{"messages": [...]}</code>, and it loops model → tools → model until the model answers without a tool call. Before 1.0 this was <code>langgraph.prebuilt.create_react_agent</code>.' },
    ] },
    { id: 'memory', title: 'Memory and history', snippets: [
      { title: 'Persist an agent conversation by thread', code: `from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(model="openai:gpt-4o-mini", tools=[], checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "user-42"}}

agent.invoke({"messages": [{"role": "user", "content": "My name is Ana."}]}, cfg)
r = agent.invoke({"messages": [{"role": "user", "content": "What's my name?"}]}, cfg)
print(r["messages"][-1].content)      # remembers "Ana": the checkpoint holds the full state
# production: from langgraph.checkpoint.postgres import PostgresSaver (or SqliteSaver)`, note: 'The checkpointer saves the graph state after each step, keyed by <code>thread_id</code>. A new thread id is a fresh conversation. <code>RunnableWithMessageHistory</code> still exists but this is the recommended route.' },
      { title: 'History in a plain chain, trimmed to fit', code: `from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, trim_messages

model = init_chat_model("openai:gpt-4o-mini")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are terse."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])
chain = prompt | model
history = []
for q in ["I'm planning a trip to Norway.", "What should I pack?"]:
    ai = chain.invoke({"history": trim_messages(history, max_tokens=2000, token_counter=model,
                                                 strategy="last", start_on="human", include_system=True),
                       "question": q})
    history += [HumanMessage(q), ai]
    print(ai.content[:80])` },
    ] },
    { id: 'stream', title: 'Streaming and tracing', snippets: [
      { title: 'Stream a chain and an agent', code: `from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.agents import create_agent

model = init_chat_model("openai:gpt-4o-mini")
chain = ChatPromptTemplate.from_template("Three facts about {topic}.") | model | StrOutputParser()
for chunk in chain.stream({"topic": "otters"}):       # str chunks after the parser
    print(chunk, end="", flush=True)
print()

agent = create_agent(model=model, tools=[])
for token, meta in agent.stream({"messages": [{"role": "user", "content": "Hi!"}]}, stream_mode="messages"):
    print(token.content, end="", flush=True)          # AIMessageChunk per token
# stream_mode="updates" yields one dict per graph step instead`, note: 'Streaming propagates through the chain as long as every stage can handle chunks; a custom <code>RunnableLambda</code> in the middle will buffer until it has the whole input.' },
      { title: 'LangSmith tracing', code: `import os
os.environ["LANGSMITH_TRACING"] = "true"          # set before creating models/chains
os.environ["LANGSMITH_API_KEY"] = "lsv2_…"
os.environ["LANGSMITH_PROJECT"] = "otter-bot"

from langsmith import traceable
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-4o-mini")

@traceable(name="answer")                          # your own function becomes a parent run
def answer(question: str) -> str:
    return model.invoke(question, config={"tags": ["demo"], "metadata": {"user": "ana"}}).content

print(answer("Why do otters hold hands?"))
# every invoke inside is a child run: prompts, latency, tokens, errors, all in the LangSmith UI`, note: 'Tracing is opt-in and works with any runnable; nothing changes in your code except the environment variables. Without a key the calls run normally and log nothing.' },
    ] },
  ],
  concepts: [
    { id: 'chain', title: 'A chain is a pipeline of runnables', intro: 'Understanding what flows between the stages explains most errors: the prompt wants a dict, the model returns a message, the parser turns it into the thing you actually wanted.', explainer: chainExplainer },
    { id: 'rag', title: 'Retrieve, stuff, generate', intro: 'RAG is a vector search followed by an ordinary prompt. The model never sees the store; it sees whatever the retriever pasted into the context slot.', explainer: ragExplainer },
  ],
  compare: [
    { title: 'Ways to build with LangChain 1.x', columns: ['LCEL chain', 'create_agent', 'legacy chains (langchain-classic)'], rows: [
      ['Control flow', 'fixed pipeline you write', 'model decides, loops over tools', 'fixed, hidden inside the class'],
      ['Tool calling loop', { part: 'by hand' }, true, { part: 'AgentExecutor' }],
      ['Streaming', true, true, { part: 'partial' }],
      ['Persistent state', { part: 'you manage it' }, 'checkpointer + thread_id', 'Memory classes'],
      ['Customise mid-run behaviour', 'compose runnables', 'middleware hooks', { part: 'subclassing' }],
      ['Status', 'current', 'current', 'maintained for migration only'],
    ], verdict: 'Deterministic steps: an LCEL chain. Anything where the model should decide what to call next: <code>create_agent</code>. Only touch <code>langchain-classic</code> to keep old code running while you port it.' },
    { title: 'Getting structured data out', columns: ['with_structured_output', 'JsonOutputParser / PydanticOutputParser', 'bind_tools + manual'], rows: [
      ['Uses native JSON / tool mode', true, false, true],
      ['Works with any chat model', { part: 'needs tool or JSON support' }, true, { part: 'needs tool support' }],
      ['Validated pydantic object back', true, { part: 'Pydantic parser only' }, { part: 'you validate' }],
      ['Handles malformed output', 'provider-enforced schema', 'raises OutputParserException', 'you decide'],
      ['Streams partial objects', false, { part: 'JSON parser yields partial dicts' }, false],
    ], verdict: 'Default to <code>with_structured_output</code>. Fall back to the prompt-based parsers for models without tool calling, and to manual <code>bind_tools</code> when the "structure" is really an action the model may or may not take.' },
  ],
  gotchas: [
    { title: 'Imports from a tutorial that no longer exist', bad: `from langchain.chains import LLMChain, RetrievalQA       # ModuleNotFoundError in 1.x
from langgraph.prebuilt import create_react_agent         # deprecated shim
chain = LLMChain(llm=model, prompt=prompt)`, good: `from langchain.agents import create_agent
chain = prompt | model | StrOutputParser()                # LCEL replaces LLMChain
# still need the old classes while porting? pip install langchain-classic`, why: 'The 1.0 release split the package: composition primitives in <code>langchain-core</code>, agents in <code>langchain</code>, everything legacy in <code>langchain-classic</code>. Check <code>pip show langchain</code> before trusting any snippet, including these.' },
    { title: 'A checkpointer without a thread_id', bad: `agent = create_agent(model, tools, checkpointer=InMemorySaver())
agent.invoke({"messages": [...]})
# ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id…`, good: `agent.invoke({"messages": [...]}, {"configurable": {"thread_id": "session-1"}})`, why: 'The checkpointer needs a key to store state under. Reusing a thread id continues that conversation; a new one starts fresh. Forgetting it entirely is an error rather than a silent memory-less run.' },
    { title: 'Passing a string where the prompt wants a dict', bad: `chain = ChatPromptTemplate.from_template("Tell me about {topic}") | model
chain.invoke("otters")   # TypeError: Expected mapping type as input to ChatPromptTemplate`, good: `chain.invoke({"topic": "otters"})
# or accept a string up front:
chain = {"topic": RunnablePassthrough()} | ChatPromptTemplate.from_template("Tell me about {topic}") | model`, why: 'The first runnable sets the input type of the whole chain. A prompt template takes a mapping of its variables; a dict step (a <code>RunnableParallel</code>) is the idiom for adapting other inputs.' },
    { title: 'Retrievers return Documents, not text', bad: `chain = {"context": retriever, "question": RunnablePassthrough()} | prompt | model
# the prompt receives "[Document(metadata=…, page_content=…), …]" verbatim`, good: `def format_docs(docs):
    return "\\n\\n".join(d.page_content for d in docs)
chain = {"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | model`, why: 'A template calls <code>str()</code> on whatever it is given, so a list of <code>Document</code> objects becomes their repr, metadata and all. Formatting is a one-line function, and it is where you decide whether sources are cited.' },
  ],
};
