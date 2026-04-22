/**
 * UC17 — Agent Memory
 * Cloudflare Agent Memory is a managed service giving AI agents persistent memory
 * across sessions — recall what matters, forget what doesn't, get smarter over time.
 *
 * Distinct from UC12 (AIChatAgent SQLite history, which is session-local).
 * Agent Memory is cross-session, cross-agent, and retrieval-based with a synthesis layer.
 *
 * Key operations:
 *   - profile.ingest([messages]) — bulk memory extraction at context compaction
 *   - profile.remember({ content }) — explicit single memory storage by the model
 *   - profile.recall("query") — retrieval + LLM synthesis → natural language answer
 *   - profile.forget(memoryId) — mark memory as no longer true
 *   - profile.list() — enumerate stored memories
 *
 * Memory types: Facts · Events · Instructions · Tasks
 * Retrieval: 5 parallel channels → Reciprocal Rank Fusion → synthesis model
 *
 * References:
 *   https://blog.cloudflare.com/introducing-agent-memory
 *   https://developers.cloudflare.com/agents/concepts/memory/
 */

export const uc17 = {
  id: 'uc17',
  title: 'Agent Memory',
  subtitle: 'Managed persistent memory across sessions — ingest, recall, remember, forget',

  nodes: [
    // Left column — agent
    {
      id: 'agent-app',
      label: 'Agent / App',
      sublabel: 'Agents SDK or Workers binding',
      icon: '\u{1F916}',
      type: 'user',
      column: 'left',
      description: 'An agent running on the Cloudflare Agents SDK (or any Worker) accesses Agent Memory through a binding (env.MEMORY) or the REST API. The agent has two interaction patterns: bulk ingestion at compaction time (shipping a conversation to be processed in the background) and direct tool use (model explicitly remembers, recalls, forgets, or lists memories mid-session). For agents outside Workers, the same operations are available via REST API with TypeScript, Python, and Go SDKs.',
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },

    // Center column — memory pipeline
    {
      id: 'memory-profile',
      label: 'Memory Profile',
      sublabel: 'env.MEMORY.getProfile("name")',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agent Memory',
      description: 'A Memory Profile is an isolated memory store identified by name, shared across sessions, agents, and users within your account. It is the entry point for all memory operations. One profile can hold memories from thousands of sessions over months — it grows without degrading retrieval quality because ingestion deduplicates and supersedes stale facts rather than accumulating indefinitely. Profiles are accessed via env.MEMORY.getProfile("my-project") from any Worker.',
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
    {
      id: 'ingestion',
      label: 'Ingestion Pipeline',
      sublabel: 'Extract · Verify · Classify · Vectorize',
      icon: '\u{1F4E5}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agent Memory',
      description: 'When a conversation arrives for ingestion, it passes through a multi-stage pipeline. Content-addressed IDs (SHA-256) make re-ingestion idempotent. The extractor runs two passes in parallel: a full pass for broad extraction and a detail pass (for longer conversations) focused on concrete values like names, prices, and version numbers. A verifier runs 8 checks (entity identity, temporal accuracy, completeness, etc.) on each extracted item. The classifier assigns one of four memory types: Facts (stable truths), Events (timestamped occurrences), Instructions (procedures/runbooks), or Tasks (ephemeral work-in-progress). Facts and instructions get normalized topic keys for supersession — new memories with the same key forward-chain over old ones rather than creating duplicates. Background vectorization runs after the API response, prepending generated search queries to bridge write-vs-search vocabulary.',
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
    {
      id: 'memory-store',
      label: 'Memory Store',
      sublabel: 'Facts · Events · Instructions · Tasks',
      icon: '\u{1F4BE}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agent Memory',
      description: 'Extracted, verified, and classified memories are persisted with content-addressed deduplication (INSERT OR IGNORE silently skips duplicates). Facts and instructions maintain a version chain via forward pointers — superseded memories are not deleted but are no longer surfaced in retrieval. Tasks are excluded from the vector index (kept lean) but remain discoverable via full-text search. Embeddings are stored alongside memories to power semantic retrieval. The store grows gracefully: Cloudflare agents have run against production codebases for weeks with thousands of stored memories and maintained sub-100ms recall latency.',
    },
    {
      id: 'recall-engine',
      label: 'Recall Engine',
      sublabel: '5 retrieval channels · RRF fusion · synthesis',
      icon: '\u{1F50D}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agent Memory',
      description: 'When an agent calls profile.recall("query"), the retrieval pipeline runs query analysis and embedding concurrently. Five retrieval channels run in parallel: (1) full-text search with Porter stemming; (2) exact fact-key lookup; (3) raw message search (safety net for verbatim details extraction missed); (4) direct vector search; (5) HyDE (Hypothetical Document Embedding) vector search — embeds a declarative answer-like statement to find memories that are similar to what the answer would look like. Results from all five channels are fused with Reciprocal Rank Fusion (RRF), weighted by signal strength. The top candidates are passed to a synthesis model which returns a natural language answer. Temporal queries (date math) are handled deterministically via regex+arithmetic, not by the LLM.',
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },

    // Right column — output
    {
      id: 'memory-result',
      label: 'Memory Context',
      sublabel: 'Synthesized answer returned to agent',
      icon: '\u{1F4AC}',
      type: 'resource',
      column: 'right',
      description: 'The recall operation returns a synthesized natural language answer to the agent\'s query — not a raw list of memory snippets. The agent injects this into its context window before generating a response, without needing to design queries or manage storage strategy. The constrained tool surface (remember/recall/forget/list) keeps memory operations out of the agent\'s reasoning budget. An agent that runs for weeks against a real codebase accumulates facts about user preferences, past decisions, system state, and procedures — and surfaces exactly the relevant subset on each turn.',
    },
  ],

  edges: [
    { id: 'e-app-profile',   from: 'agent-app',     to: 'memory-profile', label: 'getProfile()',          direction: 'ltr' },
    { id: 'e-profile-ingest',from: 'memory-profile', to: 'ingestion',      label: 'ingest() at compaction', direction: 'ltr' },
    { id: 'e-ingest-store',  from: 'ingestion',      to: 'memory-store',   label: 'Store memories',        direction: 'ltr' },
    { id: 'e-profile-recall',from: 'memory-profile', to: 'recall-engine',  label: 'recall(query)',         direction: 'ltr' },
    { id: 'e-store-recall',  from: 'memory-store',   to: 'recall-engine',  label: 'Query store',           direction: 'ltr' },
    { id: 'e-recall-result', from: 'recall-engine',  to: 'memory-result',  label: 'Synthesized answer',    direction: 'ltr' },
    { id: 'e-result-app',    from: 'memory-result',  to: 'agent-app',      label: 'Inject into context',   direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Agent accesses a named Memory Profile',
      product: 'Agent Memory',
      description: 'The agent calls env.MEMORY.getProfile("my-project") to get a handle to a named memory store. A profile is shared across sessions, agent instances, and users within the account — it accumulates knowledge over the lifetime of a project, not just a single conversation. Profiles are accessible from Workers via binding or from any environment via the REST API (TypeScript, Python, and Go SDKs available).',
      why: 'Named profiles let different agent instances, users, and sessions all share the same growing pool of knowledge. A support agent handling ticket #1234 sees the same customer preferences that ticket #4321 stored last month.',
      activeNodes: ['agent-app', 'memory-profile'],
      activeEdges: ['e-app-profile'],
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
    {
      title: 'Conversation ingested at compaction — memories extracted',
      product: 'Agent Memory',
      description: 'When the agent harness compacts context (to stay within model token limits), it ships the conversation to profile.ingest([messages]). The ingestion pipeline processes it through parallel extraction passes (full + detail), a multi-check verifier, and a classifier that assigns one of four memory types: Facts (stable truths like "user prefers pnpm"), Events (timestamped occurrences), Instructions (procedures and runbooks), and Tasks (ephemeral in-progress work). Content-addressed IDs make re-ingestion idempotent. The API returns quickly; background vectorization runs asynchronously.',
      why: 'Most agents today permanently discard information at compaction. Agent Memory preserves knowledge that would otherwise be lost — user preferences, architectural decisions, recurring issues, established patterns — without ballooning the context window.',
      activeNodes: ['memory-profile', 'ingestion'],
      activeEdges: ['e-profile-ingest'],
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
    {
      title: 'Memories stored with deduplication and supersession',
      product: 'Agent Memory',
      description: 'Verified, classified memories are written to the store with content-addressed deduplication (duplicate ingestion is silently skipped). Facts and Instructions get normalized topic keys — when a new memory has the same key as an existing one, the old memory is superseded rather than deleted, creating a forward-pointer version chain. Tasks are stored with full-text search but excluded from the vector index (ephemeral by design). Facts and Instructions are fully vectorized to support semantic recall. The store grows without degrading: superseded memories are archived, not accumulated.',
      why: 'Without supersession, memory stores accumulate contradictions — both "user prefers npm" and "user prefers pnpm" would exist after a preference change, confusing retrieval. Version chaining ensures recall always surfaces the current truth.',
      activeNodes: ['ingestion', 'memory-store'],
      activeEdges: ['e-ingest-store'],
    },
    {
      title: 'Agent explicitly remembers an important fact mid-session',
      product: 'Agent Memory',
      description: 'At any point mid-session, the model can call profile.remember({ content, sessionId }) to explicitly store a memory — for instance, after a user states a new requirement or an incident reveals an important system constraint. This is a lightweight direct tool-call, not a full ingestion pass. The model does not need to design a query or manage storage — the tool surface is deliberately constrained so memory stays out of the reasoning budget.',
      why: 'Bulk ingestion runs at compaction, but some facts are important enough to store immediately. Direct remember() gives the model agency to flag information that should survive beyond this session without waiting for compaction to happen.',
      activeNodes: ['agent-app', 'memory-profile'],
      activeEdges: ['e-app-profile'],
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
    {
      title: 'Agent recalls relevant memories with a natural language query',
      product: 'Agent Memory',
      description: 'The agent calls profile.recall("What package manager does this user prefer?"). The recall engine concurrently runs query analysis and query embedding. Five retrieval channels run in parallel: full-text search with Porter stemming, exact fact-key lookup, raw message search (safety net), direct vector search, and HyDE (Hypothetical Document Embedding) vector search — which embeds a declarative answer-phrased statement to surface memories that look like the answer, bridging vocabulary mismatch between queries and stored facts.',
      why: 'No single retrieval method works best for all queries. Full-text search handles exact-term recall; vector search handles semantic similarity; HyDE handles abstract multi-hop queries where the question and answer use different vocabulary. Running five channels in parallel and fusing results gives consistently higher recall quality than any single method.',
      activeNodes: ['memory-profile', 'memory-store', 'recall-engine'],
      activeEdges: ['e-profile-recall', 'e-store-recall'],
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
    {
      title: 'Five retrieval channels fused with RRF → synthesis',
      product: 'Agent Memory',
      description: 'Results from all five channels are merged with Reciprocal Rank Fusion (RRF) — each result scored by its rank in each channel, weighted by signal strength. Fact-key exact matches receive highest weight. Full-text, HyDE, and direct vector results are each weighted by expected signal strength. Raw message matches receive low weight as a safety net. Ties break by recency. The top-ranked candidates are passed to a synthesis model which generates a natural language answer. Temporal queries (e.g., "what was decided on April 10?") are handled deterministically via regex+arithmetic — date math is not delegated to the LLM.',
      why: 'RRF fusion consistently outperforms any single retrieval channel on real-world agent memory workloads. The synthesis step means the agent receives a usable answer — not a raw list of snippets requiring further processing that would consume context budget.',
      activeNodes: ['memory-store', 'recall-engine', 'memory-result'],
      activeEdges: ['e-store-recall', 'e-recall-result'],
    },
    {
      title: 'Synthesized memory injected into agent context',
      product: 'Agent Memory',
      description: 'The recall result — a synthesized natural language answer like "The user prefers pnpm over npm" — is returned to the agent and injected into context before the next LLM call. The agent uses this to personalize its response or continue a task with full awareness of past context. The model can also call profile.forget(memoryId) to explicitly invalidate a memory that is no longer true, and profile.list() to enumerate stored memories for auditing.',
      why: 'Agents that run for weeks or months against production systems need memory that scales without filling the context window. Retrieval-based memory surfaces only the relevant subset on each turn — no context bloat, no stale contradictions, no re-reading thousands of messages.',
      activeNodes: ['recall-engine', 'memory-result', 'agent-app'],
      activeEdges: ['e-recall-result', 'e-result-app'],
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/memory/',
    },
  ],
};
