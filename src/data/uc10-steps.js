/**
 * UC10 — RAG / Knowledge Base
 * Build retrieval-augmented generation pipelines with AI Search, Vectorize, and Workers AI.
 *
 * Two phases:
 *   1. Ingestion: documents → AI Search auto-indexing → embeddings stored in Vectorize
 *   2. Query: user query → embed → semantic search → context injection → LLM → grounded response
 *
 * References:
 *   https://developers.cloudflare.com/ai-search/
 *   https://developers.cloudflare.com/vectorize/
 *   https://developers.cloudflare.com/workers-ai/
 *   https://developers.cloudflare.com/workers/
 */

export const uc10 = {
  id: 'uc10',
  title: 'RAG Knowledge Base',
  subtitle: 'Build retrieval-augmented generation pipelines with AI Search, Vectorize, and Workers AI',

  nodes: [
    // Left column — data origins (queries + documents)
    {
      id: 'user-app',
      label: 'User / Application',
      sublabel: 'Natural language queries',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'End users or application code send natural language questions to the RAG Worker. No knowledge of the underlying data format or storage is needed — the worker retrieves relevant context automatically before calling the LLM.',
    },
    {
      id: 'doc-source',
      label: 'Documents / Data Source',
      sublabel: 'Files, web, R2, databases',
      icon: '\u{1F4C4}',
      type: 'resource',
      column: 'left',
      description: 'The raw knowledge corpus to be indexed: plain text, Markdown, HTML, PDFs, or structured data from R2 buckets, D1 databases, external APIs, or web crawls. AI Search accepts any text content as input to its indexing pipeline.',
    },
    // Center column — Cloudflare RAG pipeline
    {
      id: 'ai-search',
      label: 'AI Search',
      sublabel: 'Automated indexing + similarity caching',
      icon: '\u{1F50D}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare AI Search',
      description: 'AI Search is a fully-managed RAG service. It automatically chunks, embeds, and indexes your content into Vectorize — no manual embedding pipeline required. Supports multitenancy via folder-based metadata filters, similarity caching to reduce repeated compute, and a Workers binding for direct in-Worker queries without HTTP overhead.',
      docsUrl: 'https://developers.cloudflare.com/ai-search/',
    },
    {
      id: 'vectorize',
      label: 'Vectorize',
      sublabel: 'Vector database, nearest-neighbor search',
      icon: '\u{1F5C3}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Vectorize',
      description: 'Vectorize is a globally distributed vector database integrated directly into the Cloudflare Workers runtime. Stores dense float vectors with optional metadata, and returns cosine similarity nearest-neighbor results sub-millisecond from the same edge PoP as your Worker. AI Search manages Vectorize automatically — you can also query Vectorize directly for custom pipelines.',
      docsUrl: 'https://developers.cloudflare.com/vectorize/',
    },
    {
      id: 'rag-worker',
      label: 'Workers',
      sublabel: 'RAG orchestration, context injection',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers',
      description: 'A Worker orchestrates the full RAG pipeline: receives the user query, calls AI Search (or Vectorize directly) for semantic retrieval, assembles a prompt by injecting the retrieved chunks as context, and calls Workers AI or an external LLM via AI Gateway. All runs at the edge — no separate orchestration infrastructure required.',
      docsUrl: 'https://developers.cloudflare.com/workers/',
    },
    {
      id: 'workers-ai',
      label: 'Workers AI',
      sublabel: 'On-network embeddings + LLM inference',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers AI',
      description: 'Workers AI runs open-source models directly on Cloudflare\'s GPU network via the env.AI binding — zero egress fees, data stays on Cloudflare\'s network. Used for embedding generation (BAAI bge-base-en-v1.5) at ingestion and query time, and optionally for LLM inference (Llama 3, Mistral, Gemma). Results are cached across all Workers in the account.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    // Right column — external LLM (optional)
    {
      id: 'ext-llm',
      label: 'External LLM',
      sublabel: 'OpenAI, Anthropic via AI Gateway',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'For workloads requiring frontier models, the RAG Worker can route LLM inference to OpenAI, Anthropic, Google AI, or any other provider via AI Gateway — combining on-network retrieval (Vectorize) with external LLM generation. AI Gateway adds caching, rate limiting, and cost tracking to external LLM calls.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
    },
  ],

  edges: [
    { id: 'e-doc-aisearch',       from: 'doc-source',  to: 'ai-search',   label: 'Ingest docs',        direction: 'ltr' },
    { id: 'e-aisearch-vectorize', from: 'ai-search',   to: 'vectorize',   label: 'Embed + store',      direction: 'ltr' },
    { id: 'e-user-ragworker',     from: 'user-app',    to: 'rag-worker',  label: 'User query',         direction: 'ltr' },
    { id: 'e-ragworker-aisearch', from: 'rag-worker',  to: 'ai-search',   label: 'Semantic search',    direction: 'ltr' },
    { id: 'e-aisearch-ragworker', from: 'ai-search',   to: 'rag-worker',  label: 'Top-K chunks',       direction: 'rtl' },
    { id: 'e-ragworker-wai',      from: 'rag-worker',  to: 'workers-ai',  label: 'Prompt + context',   direction: 'ltr' },
    { id: 'e-wai-extllm',         from: 'workers-ai',  to: 'ext-llm',     label: 'LLM inference',      direction: 'ltr' },
    { id: 'e-wai-user',           from: 'workers-ai',  to: 'user-app',    label: 'Grounded response',  direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Documents ingested into AI Search',
      product: 'Cloudflare AI Search',
      description: 'Document content from R2 buckets, D1 tables, web crawls, or any API is pushed to AI Search\'s indexing pipeline. AI Search accepts plain text, Markdown, or HTML and handles chunking, embedding, and storage in Vectorize automatically — no manual embedding code needed. Continuous indexing keeps the knowledge base fresh without reprocessing everything.',
      why: 'Automated indexing eliminates the most complex part of building a RAG system: the embedding pipeline. AI Search handles chunking strategy, embedding model selection, and vector storage — letting you focus on the application.',
      activeNodes: ['doc-source', 'ai-search'],
      activeEdges: ['e-doc-aisearch'],
      docsUrl: 'https://developers.cloudflare.com/ai-search/configuration/indexing/',
    },
    {
      title: 'Embeddings stored in Vectorize',
      product: 'Cloudflare Vectorize',
      description: 'AI Search generates dense vector embeddings for each document chunk using Workers AI (BAAI bge-base-en-v1.5 or equivalent) and stores them in Vectorize. Each vector is stored with metadata (source URL, document ID, tenant folder) enabling filtered retrieval. Vectorize is globally distributed — queries return results from the nearest edge PoP with sub-millisecond latency.',
      why: 'Keeping embeddings in Vectorize on Cloudflare\'s network means retrieval happens at the same edge node as your Worker — no cross-region hops, no separate vector database to operate, no egress fees.',
      activeNodes: ['ai-search', 'vectorize'],
      activeEdges: ['e-aisearch-vectorize'],
      docsUrl: 'https://developers.cloudflare.com/vectorize/',
    },
    {
      title: 'User query arrives at the RAG Worker',
      product: 'Cloudflare Workers',
      description: 'The user\'s natural language question arrives at the RAG Worker via HTTP. The Worker is the RAG orchestrator: it manages the full pipeline from query embedding through context assembly and LLM call. Deployed globally, it runs at the same edge PoP as the Vectorize index — typically under 10ms of retrieval latency before the LLM call.',
      why: 'Collocating the RAG orchestration Worker with Vectorize eliminates retrieval round-trip latency. The whole context-assembly step happens at the edge before any external LLM call is made.',
      activeNodes: ['user-app', 'rag-worker'],
      activeEdges: ['e-user-ragworker'],
      docsUrl: 'https://developers.cloudflare.com/workers/',
    },
    {
      title: 'Semantic search retrieves relevant chunks',
      product: 'Cloudflare AI Search',
      description: 'The RAG Worker calls AI Search (or Vectorize directly) with the user\'s query text. AI Search embeds the query using the same embedding model used at ingestion, performs a cosine similarity nearest-neighbor search in Vectorize, and returns the top-K most semantically relevant document chunks with their metadata and similarity scores. Similarity caching serves repeated queries from cache, cutting compute costs.',
      why: 'Semantic search finds documents that are conceptually relevant to the query — not just keyword matches. A user asking "How do I cancel my subscription?" retrieves chunks about account management even if those chunks never use the word "cancel".',
      activeNodes: ['rag-worker', 'ai-search', 'vectorize'],
      activeEdges: ['e-ragworker-aisearch', 'e-aisearch-vectorize', 'e-aisearch-ragworker'],
      docsUrl: 'https://developers.cloudflare.com/ai-search/',
    },
    {
      title: 'Context injected into LLM prompt',
      product: 'Cloudflare Workers',
      description: 'The Worker assembles the final LLM prompt by injecting the retrieved chunks as context — typically with instructions like "Answer using only the provided context." Source metadata (document title, URL) can be included so the LLM can cite its sources in the response. The assembled prompt is then passed to Workers AI or an external LLM.',
      why: 'RAG constrains LLM responses to your actual knowledge base, eliminating hallucinations about topics outside the corpus. Citations let users verify claims — critical for enterprise knowledge bases, legal, and support use cases.',
      activeNodes: ['rag-worker', 'workers-ai'],
      activeEdges: ['e-ragworker-wai'],
      docsUrl: 'https://developers.cloudflare.com/workers/',
    },
    {
      title: 'LLM generates grounded response',
      product: 'Cloudflare Workers AI',
      description: 'Workers AI runs LLM inference on-network (Llama 3, Mistral, Qwen, and others via env.AI binding), or the Worker routes to an external provider (OpenAI, Anthropic, Google AI) via AI Gateway for frontier model quality. Workers AI responses incur zero egress fees and keep data on Cloudflare\'s network — important for regulated industries.',
      why: 'Running inference on Workers AI for retrieval and context-heavy tasks while reserving external LLMs for high-complexity reasoning optimizes cost without sacrificing quality for the right workloads.',
      activeNodes: ['workers-ai', 'ext-llm'],
      activeEdges: ['e-wai-extllm'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'Grounded response returned to user',
      product: 'Cloudflare Workers',
      description: 'The LLM response — grounded in the retrieved document chunks — is returned to the user with optional source citations. The Worker can post-process the response (strip context markers, format citations, stream tokens) before delivery. Streaming responses via Server-Sent Events or WebSocket keeps latency perception low for long responses.',
      why: 'A grounded, cited response transforms a generic LLM into a reliable expert on your organization\'s specific knowledge — answering from your documentation, not training data.',
      activeNodes: ['workers-ai', 'user-app'],
      activeEdges: ['e-wai-user'],
      docsUrl: 'https://developers.cloudflare.com/ai-search/',
    },
  ],
};
