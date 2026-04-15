/**
 * UC9 — Dynamic Routing
 * Intelligently route AI requests across providers using a visual flow editor.
 *
 * Core concepts:
 *   - Named routes used as the model name in requests (zero application code change)
 *   - Conditional nodes: if/else branches based on Custom Metadata, headers, or request body
 *   - Percentage nodes: probabilistic traffic splits for A/B testing and gradual rollouts
 *   - Rate Limit nodes: per-key request quotas with automatic fallback on exceed
 *   - Budget Limit nodes: per-key cost quotas with automatic fallback on exceed
 *   - Model nodes: provider + model target with chained fallback support
 *   - Versioned routes: deploy and roll back instantly from the dashboard
 *
 * References:
 *   https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/
 *   https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/
 */

export const uc9 = {
  id: 'uc9',
  title: 'Dynamic Routing',
  subtitle: 'Intelligently route AI requests across providers without code changes',

  nodes: [
    // Left column — Application and Platform Admin
    {
      id: 'app',
      label: 'Application / Agent',
      sublabel: 'Route name as model',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'Your application sends LLM requests using the dynamic route name as the model value — e.g., model: "dynamic/support". No code change is required beyond this model name substitution. All routing logic lives in AI Gateway and can be updated without any application deployment.',
    },
    {
      id: 'admin',
      label: 'Platform Admin',
      sublabel: 'Visual route editor',
      icon: '\u{1F527}',
      type: 'user',
      column: 'left',
      description: 'Platform administrators configure routing logic using the AI Gateway visual editor in the Cloudflare dashboard. Define conditionals, percentage splits, rate/budget limits, and fallback chains. Each change creates a new versioned draft — deploy to make it live or roll back to any previous version instantly.',
    },
    // Center column — Dynamic Routing pipeline
    {
      id: 'aig-route',
      label: 'AI Gateway',
      sublabel: 'Named route dispatch',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare AI Gateway',
      description: 'AI Gateway receives the request, identifies the dynamic route from the model name, and begins evaluating the deployed route version. Authentication must be enabled and provider keys configured via BYOK before using Dynamic Routing. Each route is versioned — deploy a draft to make it live, or roll back instantly from the Versions tab.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      id: 'conditional',
      label: 'Conditional Node',
      sublabel: 'If / else routing branches',
      icon: '\u{1F500}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Dynamic Routing',
      description: 'Conditional nodes evaluate expressions against request body fields, headers, or Custom Metadata attached to the request (e.g., user_plan == "paid", region == "EU"). Each branch independently routes to a different downstream node — a model, percentage split, rate limiter, or another conditional — enabling sophisticated multi-segment routing.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      id: 'percentage',
      label: 'Percentage Split',
      sublabel: 'A/B testing & gradual rollout',
      icon: '\u{1F3AF}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Dynamic Routing',
      description: 'Percentage nodes distribute traffic probabilistically across multiple outputs — e.g., 90% to the current production model, 10% to a new candidate. Use for safe model migrations, A/B performance comparisons, or gradual rollouts. Each output branch is fully independent and can route to any node type.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      id: 'rate-budget',
      label: 'Rate & Budget Limits',
      sublabel: 'Per-key quotas + auto-fallback',
      icon: '\u{1F4B0}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Dynamic Routing',
      description: 'Rate Limit nodes enforce request count quotas per key per time period. Budget Limit nodes enforce cost quotas (credits or tokens per period). When a limit is exceeded, the flow automatically falls back to the next configured node — routing to a cheaper model, a different provider, or returning a default response. No 429 errors surface to the application.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      id: 'model-node',
      label: 'Model Node',
      sublabel: 'Provider + model + fallback',
      icon: '\u{1F916}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Dynamic Routing',
      description: 'Model nodes define the target provider and model for a branch. Multiple model nodes can be chained as fallbacks — if the primary model returns an error or exceeds a configured timeout, Dynamic Routing automatically calls the next model node in the chain. The cf-aig-step response header identifies which step ultimately served the request.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    // Right column — LLM Providers (primary + fallbacks)
    {
      id: 'openai-p',
      label: 'OpenAI',
      sublabel: 'Primary: GPT-4o, o4-mini',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Primary provider for the majority traffic split or paid user branch. GPT-4o and o4-mini-high are common primary model selections in Dynamic Routing flows.',
    },
    {
      id: 'anthropic-f',
      label: 'Anthropic',
      sublabel: 'Fallback: Claude Sonnet',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Fallback provider when the primary (OpenAI) is unavailable, rate-limited, or over budget. Dynamic Routing triggers this fallback automatically — no client-side retry logic required.',
    },
    {
      id: 'workers-ai-r',
      label: 'Workers AI',
      sublabel: 'Cost tier: Llama, Mistral',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'right',
      description: 'Workers AI as a cost-optimized routing target — no egress fees, data stays on Cloudflare\'s network. Ideal for free-tier users, test traffic branches, or budget-constrained routing paths. Supports Llama, Mistral, and many other open-source models.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'other-f',
      label: 'Other Provider',
      sublabel: 'Final fallback',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Any additional AI provider supported by AI Gateway. Dynamic Routing supports 20+ providers — you can build multi-level fallback chains spanning as many providers as needed for resilience.',
    },
  ],

  edges: [
    { id: 'e-app-route',      from: 'app',        to: 'aig-route',   label: 'model: dynamic/support', direction: 'ltr' },
    { id: 'e-admin-route',    from: 'admin',      to: 'aig-route',   label: 'Configure',              direction: 'ltr' },
    { id: 'e-route-cond',     from: 'aig-route',  to: 'conditional', label: '',                       direction: 'ltr' },
    { id: 'e-cond-pct',       from: 'conditional', to: 'percentage', label: 'paid users',             direction: 'ltr' },
    { id: 'e-cond-rb',        from: 'conditional', to: 'rate-budget', label: '',                      direction: 'ltr' },
    { id: 'e-pct-rb',         from: 'percentage', to: 'rate-budget', label: '',                       direction: 'ltr' },
    { id: 'e-rb-model',       from: 'rate-budget', to: 'model-node', label: '',                       direction: 'ltr' },
    { id: 'e-model-openai',   from: 'model-node', to: 'openai-p',    label: 'primary',               direction: 'ltr' },
    { id: 'e-model-anthropic', from: 'model-node', to: 'anthropic-f', label: 'fallback',             direction: 'ltr' },
    { id: 'e-model-wai',      from: 'model-node', to: 'workers-ai-r', label: 'cost tier',            direction: 'ltr' },
    { id: 'e-model-other',    from: 'model-node', to: 'other-f',     label: 'fallback',               direction: 'ltr' },
    { id: 'e-openai-app',     from: 'openai-p',   to: 'app',         label: 'Response',               direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Zero code change — use route name as model',
      product: 'Cloudflare AI Gateway',
      description: 'Your application sends a standard OpenAI-compatible API call, substituting the dynamic route name for the model value (e.g., model: "dynamic/support"). No other code changes are required. All routing logic — providers, fallbacks, limits — lives in AI Gateway and can be updated at any time without a code deployment.',
      why: 'Decoupling routing logic from application code means you can swap providers, add fallbacks, or change cost tiers at runtime — in seconds, from the dashboard — with zero deployment cycles.',
      activeNodes: ['app', 'aig-route'],
      activeEdges: ['e-app-route'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Admin builds routing flow visually',
      product: 'AI Gateway Dynamic Routing',
      description: 'Platform administrators build routing flows in the AI Gateway visual editor: add and connect nodes (conditionals, percentage splits, rate/budget limiters, model targets), configure each node\'s parameters, and save. Each save creates a new versioned draft. Deploy to make it live; instant rollback to any version is available from the Versions tab.',
      why: 'Visual, versioned route configuration gives operations and platform teams control over AI routing policy without requiring engineering changes — enabling safe iteration and instant rollback.',
      activeNodes: ['admin', 'aig-route'],
      activeEdges: ['e-admin-route'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'AI Gateway dispatches to deployed route',
      product: 'Cloudflare AI Gateway',
      description: 'AI Gateway receives the request and identifies the named dynamic route from the model field. The currently deployed version of the route is evaluated. Authentication must be enabled and provider keys configured via BYOK — the gateway uses Secrets Store credentials to call upstream models on behalf of the application.',
      why: 'Named, versioned routes provide a stable contract — your application always calls the same endpoint, while the routing behavior behind it can change instantly.',
      activeNodes: ['aig-route', 'conditional'],
      activeEdges: ['e-route-cond'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Conditional node branches on request context',
      product: 'AI Gateway Dynamic Routing',
      description: 'The Conditional node evaluates an expression against request body fields, headers, or Custom Metadata attached to the request — e.g., user_plan == "paid" routes to a premium model branch; region == "EU" routes to an EU-hosted model. Paid users flow to the Percentage split; free users route directly to rate/budget limits.',
      why: 'Context-aware routing serves premium users a powerful model and free-tier users a cost-optimized one — from the same API endpoint, with no application logic changes.',
      activeNodes: ['conditional', 'percentage', 'rate-budget'],
      activeEdges: ['e-cond-pct', 'e-cond-rb'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Percentage split for A/B testing',
      product: 'AI Gateway Dynamic Routing',
      description: 'The Percentage node distributes traffic probabilistically — e.g., 90% to the current production model, 10% to a new candidate model. Both branches converge downstream into rate/budget limit evaluation. Use for safe model migrations, performance comparisons, or gradual rollouts without splitting application deployments.',
      why: 'A/B testing at the gateway layer — not the application layer — means you can compare models with real production traffic and make data-driven decisions without deploying multiple application versions.',
      activeNodes: ['percentage', 'rate-budget'],
      activeEdges: ['e-pct-rb'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Rate and budget limits with automatic fallback',
      product: 'AI Gateway Dynamic Routing',
      description: 'Rate Limit nodes enforce request count quotas per key per time period. Budget Limit nodes enforce cost quotas. When a limit is exceeded, the flow automatically falls back to the next configured node — a cheaper model, different provider, or a default response — without surfacing a 429 error to the application.',
      why: 'Per-key rate and budget limits prevent runaway consumption from a single user or API key, while automatically routing excess traffic to a fallback — preserving availability without application-level retry logic.',
      activeNodes: ['rate-budget', 'model-node'],
      activeEdges: ['e-rb-model'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Primary provider called',
      product: 'AI Gateway Dynamic Routing',
      description: 'The Model node calls the configured primary provider and model (e.g., OpenAI GPT-4o or o4-mini-high) using the BYOK credential from Secrets Store. If the provider returns an error or exceeds the configured per-request timeout, Dynamic Routing automatically triggers the fallback chain — no client-side retry logic needed.',
      why: 'Automatic provider failover keeps your AI application available during outages, rate limit errors, or capacity events at any single provider.',
      activeNodes: ['model-node', 'openai-p'],
      activeEdges: ['e-model-openai'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Automatic fallback to secondary providers',
      product: 'AI Gateway Dynamic Routing',
      description: 'When the primary provider fails, times out, or is over budget, Dynamic Routing calls fallback model nodes in sequence — Anthropic Claude, Workers AI (on-network, zero egress fees, data stays on Cloudflare), or any other configured provider. The cf-aig-step response header identifies which step successfully served the request.',
      why: 'Multi-provider fallback chains eliminate single points of failure in your AI infrastructure. Workers AI as a fallback tier keeps data on Cloudflare\'s network and avoids provider egress fees entirely.',
      activeNodes: ['model-node', 'anthropic-f', 'workers-ai-r', 'other-f'],
      activeEdges: ['e-model-anthropic', 'e-model-wai', 'e-model-other'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
    {
      title: 'Response returned — routing decision logged',
      product: 'Cloudflare AI Gateway',
      description: 'The response from the successful provider is returned to the application through AI Gateway. All routing decisions, model selections, fallback triggers, and outcomes are logged in AI Gateway Analytics — including which step handled the request (cf-aig-step) and the associated cost and token counts.',
      why: 'Full routing observability lets you measure which models are actually serving traffic, compare latency and cost across providers, and track fallback trigger rates — enabling continuous optimization of your routing policy.',
      activeNodes: ['openai-p', 'app'],
      activeEdges: ['e-openai-app'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/',
    },
  ],
};
