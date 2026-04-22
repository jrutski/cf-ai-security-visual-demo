/**
 * UC16 — Workers AI Inference Engine: Speed at Scale
 * How Cloudflare's Infire engine handles large language models efficiently:
 * prefill/decode disaggregation, prompt caching, KV cache sharing via Mooncake RDMA,
 * and speculative decoding with EAGLE-3.
 *
 * Developer-actionable feature:
 *   - x-session-affinity header → enables prompt caching + discounted cached token pricing
 *   - Docs: https://developers.cloudflare.com/workers-ai/features/prompt-caching/
 *
 * Key results (from Cloudflare blog, April 2026):
 *   - p90 TTFB: dramatically improved after PD disaggregation (same GPU count)
 *   - p90 inter-token latency: ~100ms → 20–30ms (3× improvement with speculative decoding)
 *   - Prompt cache hit ratio: 60% → 80% at peak with x-session-affinity
 *   - Infire: 20% higher throughput than vLLM on identical hardware
 *   - Cold-start: under 20 seconds for Kimi K2.5 (1T+ parameters)
 *
 * References:
 *   https://blog.cloudflare.com/high-performance-llms/
 *   https://developers.cloudflare.com/workers-ai/features/prompt-caching/
 */

export const uc16 = {
  id: 'uc16',
  title: 'Workers AI Inference Engine: Speed at Scale',
  subtitle: 'How Infire, PD disaggregation, prompt caching, and speculative decoding power fast LLM inference',

  nodes: [
    // Left column — origin
    {
      id: 'agent-app',
      label: 'Agent / App',
      sublabel: 'Sends x-session-affinity header',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'An agent or application sends inference requests to the Workers AI OpenAI-compatible endpoint. By including the x-session-affinity header (a stable identifier for the session), the caller opts into session-aware routing and prompt caching. Cached input tokens are priced at a discount, making long-context agentic workflows significantly cheaper. This is the one developer-actionable optimization in the entire Infire stack.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/features/prompt-caching/',
    },

    // Center column — inference infrastructure
    {
      id: 'workers-ai-ep',
      label: 'Workers AI Endpoint',
      sublabel: 'OpenAI-compatible API',
      icon: '\u26A1',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI',
      description: 'The Workers AI endpoint accepts OpenAI-compatible /chat/completions requests. It reads the x-session-affinity header to tag the request with a session identifier used for downstream routing decisions. The endpoint supports streaming (SSE) and non-streaming responses, all model families available on Workers AI, and the same token pricing structure with a discount for cached input tokens.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'load-balancer',
      label: 'Token-Aware Load Balancer',
      sublabel: 'Routes to prefill / decode clusters',
      icon: '\u2696',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI',
      description: 'A custom token-aware load balancer routes requests to the optimal prefill and decode servers. Unlike a naive round-robin load balancer, this one estimates how many prefill tokens and decode tokens are currently in-flight to each endpoint in the pool and spreads load accordingly. It also rewrites SSE streaming responses from the decode server to include metadata from the prefill server (such as the KV cache transfer location). Session affinity requests are preferentially routed to regions that previously computed that session\'s context.',
    },
    {
      id: 'prefill-server',
      label: 'Prefill Server (Infire)',
      sublabel: 'Compute-bound input processing',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Infire)',
      description: 'The prefill server runs the compute-bound stage: processing all input tokens (system prompt, conversation history, tool definitions, MCP context) in a single forward pass and populating the KV cache. Prefill is compute-bound — the GPU\'s tensor cores are the bottleneck, not memory bandwidth. By running prefill on dedicated servers tuned for high compute throughput, Infire avoids the prefill stage starving the memory-bound decode stage. Infire can begin serving Kimi K2.5 (1 trillion parameters) in under 20 seconds from a cold start.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'kv-cache',
      label: 'KV Cache (Mooncake)',
      sublabel: 'RDMA across GPUs and NVMe',
      icon: '\u{1F4BE}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI',
      description: 'The KV cache stores the result of the prefill computation — the attention key/value tensors for every input token. For agentic use cases with long, growing context windows, the KV cache grows with each turn. Cloudflare uses the Mooncake Transfer Engine and Mooncake Store (from Moonshot AI) to share KV cache across GPUs via RDMA protocols (NVLink and NVMe over Fabric), enabling direct memory-to-memory transfers without CPU involvement. Mooncake Store extends the cache beyond GPU VRAM to NVMe storage, increasing cache hit ratios. A cache hit on a session skips prefill entirely — from 60% to 80% hit ratio at peak after adoption of x-session-affinity.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/features/prompt-caching/',
    },
    {
      id: 'decode-server',
      label: 'Decode Server (Infire)',
      sublabel: 'Speculative decoding, EAGLE-3',
      icon: '\u{1F680}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers AI (Infire)',
      description: 'The decode server runs the memory-bound stage: generating output tokens one at a time (or in speculative batches). Infire uses NVIDIA\'s EAGLE-3 (Extrapolation Algorithm for Greater Language-model Efficiency) draft model to implement speculative decoding — a smaller draft LLM generates several candidate tokens that the target model then validates in a single forward pass. Tool calls and structured JSON outputs are especially well-suited to speculative decoding because their formats are predictable. Result: p90 inter-token latency improved from ~100ms to 20–30ms, a 3× improvement.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },

    // Right column — output
    {
      id: 'token-stream',
      label: 'Token Stream',
      sublabel: 'Streamed SSE response',
      icon: '\u{1F4AC}',
      type: 'resource',
      column: 'right',
      description: 'Tokens are streamed back to the caller as server-sent events (SSE), compatible with the OpenAI streaming format. The load balancer transparently merges metadata from the prefill server into the decode server\'s SSE stream so the caller receives a single coherent response. For non-streaming requests, the full response is buffered and returned as a single JSON object. Infire achieves up to 20% higher tokens-per-second throughput than vLLM on identical hardware due to lower memory overhead and tighter GPU utilization.',
    },
  ],

  edges: [
    { id: 'e-app-ep',       from: 'agent-app',      to: 'workers-ai-ep',  label: 'Request + session header', direction: 'ltr' },
    { id: 'e-ep-lb',        from: 'workers-ai-ep',  to: 'load-balancer',  label: 'Route request',             direction: 'ltr' },
    { id: 'e-lb-prefill',   from: 'load-balancer',  to: 'prefill-server', label: 'Prefill stage',             direction: 'ltr' },
    { id: 'e-prefill-kvc',  from: 'prefill-server', to: 'kv-cache',       label: 'Store KV tensors',          direction: 'ltr' },
    { id: 'e-kvc-decode',   from: 'kv-cache',       to: 'decode-server',  label: 'Transfer KV (RDMA)',        direction: 'ltr' },
    { id: 'e-decode-stream',from: 'decode-server',  to: 'token-stream',   label: 'Token stream (SSE)',        direction: 'ltr' },
    { id: 'e-stream-app',   from: 'token-stream',   to: 'agent-app',      label: 'Response',                  direction: 'rtl' },
  ],

  steps: [
    {
      title: 'App sends request with x-session-affinity header',
      product: 'Workers AI',
      description: 'The application or agent sends an OpenAI-compatible /chat/completions request to Workers AI, including an x-session-affinity header set to a stable session identifier. This is the one developer-configurable optimization in the entire Infire stack. Workers AI uses this identifier to route subsequent requests in the same session to regions that previously computed the session\'s context. Input tokens served from cache are priced at a discount. Without the header, sessions are routed independently and prompt caching is best-effort.',
      why: 'Agentic workloads grow context windows with every turn — system prompt, all tool definitions, full conversation history. Without session affinity, each turn recomputes the full context. With it, only the new tokens need to be prefilled. This is the highest-leverage optimization available to developers today.',
      activeNodes: ['agent-app', 'workers-ai-ep'],
      activeEdges: ['e-app-ep'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/features/prompt-caching/',
    },
    {
      title: 'Token-aware load balancer routes to the optimal cluster',
      product: 'Workers AI',
      description: 'A custom load balancer estimates how many prefill tokens and decode tokens are currently in-flight to each endpoint in the pool. It routes the request to the prefill server with available compute capacity, preferring servers in the same region that previously cached this session\'s KV tensors. This token-awareness is critical: naive round-robin routing would send a 200K-token prefill to an already-saturated server while an idle server sits unused.',
      why: 'LLM inference has wildly variable compute cost per request — a 200K-token prefill is orders of magnitude more expensive than a 500-token one. A load balancer that ignores token counts will create severe tail latency. Token-aware routing distributes GPU work proportionally.',
      activeNodes: ['workers-ai-ep', 'load-balancer'],
      activeEdges: ['e-ep-lb'],
    },
    {
      title: 'Prefill server processes all input tokens in one forward pass',
      product: 'Workers AI (Infire)',
      description: 'The prefill server runs the compute-bound stage: all input tokens (system prompt, tool definitions, MCP context, conversation history) are processed in a single forward pass, populating the KV cache. Prefill is compute-intensive — it scales quadratically with input length. By running prefill on dedicated servers separately tuned for high compute throughput, Infire avoids the prefill workload starving the memory-bound decode servers. Infire can start serving Kimi K2.5 (1 trillion parameters, 8× H100 GPUs) in under 20 seconds from a cold start.',
      why: 'Prefill and decode have fundamentally different hardware requirements. Prefill needs high compute throughput (tensor core utilization); decode needs high memory bandwidth. Running them on the same GPU means each stage fights the other. Disaggregation allows each stage to be independently scaled and hardware-tuned.',
      activeNodes: ['load-balancer', 'prefill-server'],
      activeEdges: ['e-lb-prefill'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'Prompt cache check — skip prefill if already computed',
      product: 'Workers AI',
      description: 'Before executing the full prefill, Infire checks the KV cache for existing tensors matching this session\'s context prefix. For sessions using x-session-affinity, previously computed input tokens are retrieved directly from cache — the prefill stage is skipped entirely for those tokens. Only new tokens (the latest user message) need to be prefilled. Cloudflare\'s internal usage of this header in tools like OpenCode raised the input token cache hit ratio from 60% to 80% at peak, significantly increasing effective throughput without adding GPUs.',
      why: 'In a multi-turn agent session, 80–95% of the input tokens are identical from one turn to the next (system prompt + full history). Recomputing them from scratch every turn wastes GPU time that could serve other users. Prompt caching converts this repeated computation into a fast cache lookup.',
      activeNodes: ['prefill-server', 'kv-cache'],
      activeEdges: ['e-prefill-kvc'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/features/prompt-caching/',
    },
    {
      title: 'KV tensors transferred to decode server via Mooncake RDMA',
      product: 'Workers AI',
      description: 'The KV cache tensors from the prefill server are transferred to the decode server via Mooncake\'s Transfer Engine using RDMA protocols — NVLink for intra-node transfers and NVMe over Fabric for cross-node transfers. RDMA allows direct memory-to-memory transfer without CPU involvement, minimizing latency and CPU overhead. Mooncake Store extends the cache beyond GPU VRAM to NVMe SSDs, increasing the total window of sessions that remain cached. For models like Kimi K2.5 that span 8× H100 GPUs (560GB of parameters), sharing the KV cache across GPUs is a hard requirement.',
      why: 'Without efficient KV cache transfer, PD disaggregation would incur prohibitive latency moving tensors between servers. Mooncake\'s RDMA-based transfer makes the cross-server handoff fast enough to be worthwhile — the latency of the transfer is smaller than the savings from running prefill and decode on separately optimized hardware.',
      activeNodes: ['prefill-server', 'kv-cache'],
      activeEdges: ['e-prefill-kvc', 'e-kvc-decode'],
    },
    {
      title: 'Decode server generates tokens with speculative decoding',
      product: 'Workers AI (Infire)',
      description: 'The decode server generates output tokens in the memory-bound stage. Infire uses NVIDIA\'s EAGLE-3 draft model to implement speculative decoding: EAGLE-3 (a smaller LLM) generates several candidate tokens ahead of time, and the target model validates them in a single forward pass. Validating is cheaper than generating — so when the draft tokens are accepted, the effective tokens-per-second rate multiplies. Agentic tool calls and structured JSON outputs have highly predictable formats, making speculative decoding especially effective. Result: p90 inter-token latency improved from ~100ms to 20–30ms.',
      why: 'LLMs generate tokens one at a time by default — each token requires a full forward pass of the target model. Speculative decoding "pre-loads the chamber" with likely tokens so the target model can accept multiple tokens per forward pass. The quality trade-off is zero: the target model makes the final accept/reject decision.',
      activeNodes: ['kv-cache', 'decode-server'],
      activeEdges: ['e-kvc-decode'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'Token stream returned — faster, cheaper, at higher throughput',
      product: 'Workers AI',
      description: 'Tokens are streamed back as server-sent events. The combined effect of all Infire optimizations: p90 TTFB and inter-token latency drop sharply after PD disaggregation (even as request volume increases); speculative decoding cuts inter-token latency 3×; prompt caching eliminates redundant prefill for agentic sessions; Infire achieves 20% higher tokens-per-second than vLLM on identical hardware with significantly lower memory overhead. Infire can run Llama 4 Scout on 2× H200 GPUs with 56 GiB remaining for KV cache — configurations where vLLM cannot boot at all.',
      why: 'Every optimization compounds: faster prefill → lower TTFB; better cache hit rate → less prefill work → more GPU time for decode; speculative decoding → more tokens per forward pass → higher effective throughput. The net result is faster responses, higher request capacity per GPU, and lower cost per token.',
      activeNodes: ['decode-server', 'token-stream', 'agent-app'],
      activeEdges: ['e-decode-stream', 'e-stream-app'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
  ],
};
