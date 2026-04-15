/**
 * UC8 — API Key Management & Unified Billing
 * Centralize AI provider credential management and billing through AI Gateway.
 *
 * Two credential models:
 *   1. BYOK (Bring Your Own Key) — store keys in Cloudflare Secrets Store, reference by name
 *   2. Unified Billing — Cloudflare manages provider credentials; single Cloudflare invoice
 *
 * Both paths support spend limits (daily/weekly/monthly) and Zero Data Retention (ZDR).
 *
 * References:
 *   https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/
 *   https://developers.cloudflare.com/ai-gateway/features/unified-billing/
 *   https://developers.cloudflare.com/ai-gateway/configuration/authentication/
 */

export const uc8 = {
  id: 'uc8',
  title: 'API Key Management & Unified Billing',
  subtitle: 'Centralize AI provider credentials and billing through a single Cloudflare control plane',

  nodes: [
    // Left column — Developer / Application
    {
      id: 'app-dev',
      label: 'App / Developer',
      sublabel: 'No provider keys in code',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'Your application or developer sends LLM requests to AI Gateway using only a Cloudflare API token (cf-aig-authorization). No per-provider API keys are required in application code, environment variables, or CI/CD pipelines.',
    },
    // Center column — AI Gateway credential & billing layer
    {
      id: 'aig',
      label: 'AI Gateway',
      sublabel: 'Authenticated unified endpoint',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare AI Gateway',
      description: 'AI Gateway receives all LLM requests through a single authenticated endpoint. Authentication requires only a Cloudflare API token (cf-aig-authorization header). AI Gateway then resolves the provider credential — either from Secrets Store (BYOK) or Cloudflare-managed (Unified Billing) — and forwards the request transparently.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/configuration/authentication/',
    },
    {
      id: 'byok',
      label: 'BYOK / Secrets Store',
      sublabel: 'Your keys, securely stored',
      icon: '\u{1F511}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway BYOK',
      description: 'Bring Your Own Key (BYOK): store provider API keys in Cloudflare Secrets Store and reference them by name in AI Gateway Provider Keys (e.g., ANTHROPIC_KEY_1). The gateway injects the key at request time — the application never sees the key value. Supports easy key rotation without code changes, and enables per-key rate/budget controls via Dynamic Routing.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/',
    },
    {
      id: 'unified-billing',
      label: 'Unified Billing',
      sublabel: 'Cloudflare-managed credentials',
      icon: '\u{1F4B3}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Unified Billing',
      description: 'Unified Billing eliminates provider API keys entirely. Load credits into your Cloudflare account; AI Gateway uses Cloudflare-managed provider credentials automatically. A single Cloudflare invoice covers all AI spend across OpenAI, Anthropic, Google AI Studio, xAI, and Groq. Supports auto top-up to prevent service interruptions.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/unified-billing/',
    },
    {
      id: 'spend-limits',
      label: 'Spend Limits & ZDR',
      sublabel: 'Budgets + Zero Data Retention',
      icon: '\u{1F6E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Spend Limits',
      description: 'Set spend limits on Unified Billing credits — daily, weekly, or monthly caps. When a limit is reached, AI Gateway automatically stops processing requests until the period resets or the limit is raised. Zero Data Retention (ZDR) routes Unified Billing traffic through provider endpoints that do not retain prompts or responses. ZDR is currently supported for OpenAI and Anthropic.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/unified-billing/',
    },
    {
      id: 'analytics',
      label: 'Analytics & Cost Logs',
      sublabel: 'Usage, cost, token tracking',
      icon: '\u{1F4CA}',
      type: 'cloudflare',
      column: 'center',
      product: 'AI Gateway Analytics',
      description: 'AI Gateway logs every request with provider, model, token counts (input + output), latency, cost, and cache status. Unified Billing requests show credit deductions in real time via the Credits Available dashboard. Use Logpush to export logs to R2, S3, Datadog, or your SIEM for cost attribution and audit.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/observability/analytics/',
    },
    // Right column — Providers supported by Unified Billing and BYOK
    {
      id: 'openai',
      label: 'OpenAI',
      sublabel: 'GPT-4o, o4-mini, etc.',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'OpenAI — supported by both BYOK and Unified Billing. ZDR is available for Unified Billing OpenAI requests, routing through provider endpoints that do not retain data.',
    },
    {
      id: 'anthropic',
      label: 'Anthropic',
      sublabel: 'Claude Sonnet, Opus',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Anthropic — supported by both BYOK and Unified Billing. ZDR is available for Unified Billing Anthropic requests.',
    },
    {
      id: 'google-ai',
      label: 'Google AI Studio',
      sublabel: 'Gemini models',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Google AI Studio — supported by both BYOK and Unified Billing. Use Gemini 2.5 Pro and other Gemini models via AI Gateway\'s unified endpoint (compat/chat/completions).',
    },
    {
      id: 'xai',
      label: 'xAI',
      sublabel: 'Grok models',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'xAI (Grok) — supported by both BYOK and Unified Billing.',
    },
    {
      id: 'groq',
      label: 'Groq',
      sublabel: 'Ultra-fast inference',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Groq — supported by both BYOK and Unified Billing. High-speed inference for latency-sensitive applications.',
    },
  ],

  edges: [
    { id: 'e-app-aig',        from: 'app-dev',        to: 'aig',            label: 'cf-aig-authorization', direction: 'ltr' },
    { id: 'e-aig-byok',       from: 'aig',            to: 'byok',           label: 'BYOK path',            direction: 'ltr' },
    { id: 'e-aig-ub',         from: 'aig',            to: 'unified-billing', label: '',                    direction: 'ltr' },
    { id: 'e-byok-spend',     from: 'byok',           to: 'spend-limits',   label: '',                     direction: 'ltr' },
    { id: 'e-ub-spend',       from: 'unified-billing', to: 'spend-limits',  label: 'Unified Billing',      direction: 'ltr' },
    { id: 'e-spend-openai',   from: 'spend-limits',   to: 'openai',         label: '',                     direction: 'ltr' },
    { id: 'e-spend-anthropic', from: 'spend-limits',  to: 'anthropic',      label: '',                     direction: 'ltr' },
    { id: 'e-spend-google',   from: 'spend-limits',   to: 'google-ai',      label: '',                     direction: 'ltr' },
    { id: 'e-spend-xai',      from: 'spend-limits',   to: 'xai',            label: '',                     direction: 'ltr' },
    { id: 'e-spend-groq',     from: 'spend-limits',   to: 'groq',           label: '',                     direction: 'ltr' },
    { id: 'e-openai-analytics', from: 'openai',       to: 'analytics',      label: 'Usage + cost',         direction: 'rtl' },
    { id: 'e-analytics-app',  from: 'analytics',      to: 'app-dev',        label: 'Response',             direction: 'rtl' },
  ],

  steps: [
    {
      title: 'App sends request — no provider API key required',
      product: 'Cloudflare AI Gateway',
      description: 'Your application sends an LLM request to the AI Gateway unified endpoint, authenticated only with a Cloudflare API token (cf-aig-authorization header). No per-provider API keys are required in application code, environment variables, or CI/CD pipelines. Only the base URL changes — full API compatibility is preserved.',
      why: 'Removing provider keys from application code eliminates a major credential leak vector — no keys in Git history, leaked env files, or compromised CI runners.',
      activeNodes: ['app-dev', 'aig'],
      activeEdges: ['e-app-aig'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/configuration/authentication/',
    },
    {
      title: 'BYOK: provider keys stored in Secrets Store',
      product: 'AI Gateway BYOK',
      description: 'With Bring Your Own Key (BYOK), your provider API keys are stored in Cloudflare Secrets Store and referenced by name in the AI Gateway Provider Keys section (e.g., ANTHROPIC_KEY_1). The gateway injects the credential at request time — the application code never receives or handles the key value. Key rotation requires no application changes.',
      why: 'Secrets Store centralizes credential management: one place to rotate, audit, and control access to every AI provider key across all your applications. Per-key rate and budget controls are unlocked via Dynamic Routing.',
      activeNodes: ['aig', 'byok'],
      activeEdges: ['e-aig-byok'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/',
    },
    {
      title: 'Unified Billing: Cloudflare manages provider credentials',
      product: 'AI Gateway Unified Billing',
      description: 'With Unified Billing, load credits into your Cloudflare account. AI Gateway uses Cloudflare-managed provider credentials automatically — you never need to create or manage API keys with OpenAI, Anthropic, Google AI Studio, xAI, or Groq directly. A single Cloudflare invoice covers all AI provider spend. Auto top-up prevents unexpected service interruptions when credits run low.',
      why: 'Unified Billing eliminates the operational burden of managing credentials across 5+ AI providers — one account, one bill, one place to manage spending limits.',
      activeNodes: ['aig', 'unified-billing'],
      activeEdges: ['e-aig-ub'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/unified-billing/',
    },
    {
      title: 'Spend limits prevent unexpected charges',
      product: 'AI Gateway Spend Limits',
      description: 'Spend limits cap Unified Billing credit consumption on a daily, weekly, or monthly basis. When a limit is reached, AI Gateway automatically stops processing requests until the period resets or you raise the limit. Auto top-up can reload credits automatically to prevent service interruption when a soft threshold is crossed.',
      why: 'Runaway AI agents, traffic spikes, or misconfigured applications can generate massive unexpected bills. Spend limits provide a hard financial guardrail without requiring any application-side logic.',
      activeNodes: ['byok', 'unified-billing', 'spend-limits'],
      activeEdges: ['e-byok-spend', 'e-ub-spend'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/unified-billing/',
    },
    {
      title: 'Zero Data Retention (ZDR) for compliant workloads',
      product: 'AI Gateway Unified Billing',
      description: 'Zero Data Retention (ZDR) routes Unified Billing traffic through provider endpoints configured to not retain prompts or responses at the provider level. Enable at the gateway level via the ZDR setting, or override per-request with the cf-aig-zdr: true header. Currently supported for OpenAI and Anthropic with Unified Billing credentials. ZDR does not control AI Gateway\'s own logging — configure that separately.',
      why: 'For compliance-sensitive workloads (healthcare, legal, finance), ZDR provides assurance that prompts and responses are not retained by the AI provider — without managing separate provider accounts or custom data processing agreements.',
      activeNodes: ['spend-limits', 'openai', 'anthropic'],
      activeEdges: ['e-spend-openai', 'e-spend-anthropic'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/unified-billing/',
    },
    {
      title: 'Request forwarded to provider with injected credentials',
      product: 'Cloudflare AI Gateway',
      description: 'AI Gateway forwards the request to the selected provider with the appropriate credentials injected — either pulled from Secrets Store (BYOK) or Cloudflare-managed (Unified Billing). The provider receives a standard authenticated request. The application\'s integration is indistinguishable from a direct provider call.',
      why: 'Transparent credential injection preserves full provider API compatibility — no changes to request structure, model names, or response format. The application simply changed a base URL.',
      activeNodes: ['spend-limits', 'openai', 'anthropic', 'google-ai', 'xai', 'groq'],
      activeEdges: ['e-spend-openai', 'e-spend-anthropic', 'e-spend-google', 'e-spend-xai', 'e-spend-groq'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
    },
    {
      title: 'Usage and cost logged to Analytics',
      product: 'AI Gateway Analytics',
      description: 'Every request is logged with provider, model, token counts (input + output), latency, cost in credits (Unified Billing), and cache status. The Credits Available card in the AI Gateway dashboard shows remaining balance in real time. Logpush streams logs to R2, S3, Datadog, or your SIEM for cost attribution, chargeback reporting, and audit.',
      why: 'Centralized cost and usage analytics across all AI providers gives engineering and finance teams visibility into AI spend — without polling each provider\'s billing API or reconciling multiple invoices.',
      activeNodes: ['openai', 'analytics', 'app-dev'],
      activeEdges: ['e-openai-analytics', 'e-analytics-app'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/observability/analytics/',
    },
  ],
};
