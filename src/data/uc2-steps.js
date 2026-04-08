/**
 * UC2 — Govern AI Agents & MCP
 * Secure interactions between human users, MCP clients, LLMs, and remote MCP servers
 * via Cloudflare's governance layer: Access (ZTNA), Gateway (DLP), MCP Server Portals,
 * AI Gateway, Worker Isolate (Codemode), and Remote MCP Servers.
 *
 * Key governance principle: Remote MCP servers via Cloudflare are recommended over local
 * installations. Local MCP servers = shadow IT risk with no audit trail.
 * Remote MCP servers = centralized visibility, identity-based access, and audit logging.
 *
 * MCP authorization uses OAuth 2.1. Cloudflare Access acts as the OAuth provider,
 * issuing OAuth ID tokens with user identity attributes for per-tool authorization.
 *
 * DLP for MCP portal traffic is GA — MCP portal traffic can be routed through
 * Cloudflare Gateway for HTTP logging and DLP scanning via Gateway HTTP policies.
 *
 * References:
 *   https://developers.cloudflare.com/agents/model-context-protocol/governance/
 *   https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/
 *   https://developers.cloudflare.com/agents/guides/remote-mcp-server/
 *   https://developers.cloudflare.com/ai-gateway/
 *   https://developers.cloudflare.com/dynamic-workers/
 *   https://developers.cloudflare.com/agents/api-reference/codemode/
 *   https://developers.cloudflare.com/cloudflare-one/traffic-policies/
 *   https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/dlp-policies/
 */

export const uc2 = {
  id: 'uc2',
  title: 'Govern AI Agents',
  subtitle: 'Secure interactions between human users and AI agents via MCP',

  nodes: [
    // Left column — Human, MCP Clients, LLMs, AI Gateway
    {
      id: 'human-user',
      label: 'User',
      sublabel: 'Employee or developer',
      icon: '\u{1F464}',
      type: 'user',
      column: 'left',
      description: 'A human user who interacts with AI agents through MCP client applications.',
    },
    {
      id: 'mcp-clients',
      label: 'MCP Clients',
      sublabel: 'OpenCode, Claude Code',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'MCP host/client applications such as OpenCode, Claude Code, Cursor IDE, or Claude Desktop. These translate user intent into MCP protocol requests sent to remote MCP servers.',
    },
    {
      id: 'llms',
      label: 'LLMs',
      sublabel: 'Claude, Gemini, GPT, etc.',
      icon: '\u{1F916}',
      type: 'ai-service',
      column: 'left',
      description: 'Large Language Models that power the AI agents embedded in MCP clients. The LLM decides which tools to call and generates the tool call parameters.',
    },
    {
      id: 'ai-gateway',
      label: 'AI Gateway',
      sublabel: 'Cost controls, logging',
      icon: '\u{1F4CA}',
      type: 'cloudflare',
      column: 'left',
      product: 'Cloudflare AI Gateway',
      description: 'AI Gateway provides cost controls, rate limiting, caching, and logging for LLM API calls. Tracks token usage, latency, and costs across all AI providers from a unified dashboard.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
    },

    // Center column — Cloudflare governance layer
    {
      id: 'cf-gateway',
      label: 'Cloudflare Gateway',
      sublabel: 'HTTP inspection, DLP',
      icon: '\u{1F6E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Gateway',
      description: 'Secure Web Gateway inspects MCP portal traffic when Gateway routing is enabled. Gateway HTTP policies with DLP profiles detect and block sensitive data in tool inputs/outputs sent to upstream MCP servers. Portal traffic appears in Gateway HTTP logs for unified visibility.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/traffic-policies/',
    },
    {
      id: 'worker-isolate',
      label: 'Worker Isolate',
      sublabel: 'Codemode sandbox',
      icon: '\u{1F4E6}',
      type: 'cloudflare',
      column: 'center',
      product: 'Dynamic Workers / Codemode',
      description: 'Dynamic Workers spin up isolated V8 sandboxes for MCP tool execution via Codemode. The codeMcpServer() wrapper runs each tool call in a sandboxed Worker with network isolation (globalOutbound: null). Tool dispatch uses Workers RPC — the sandbox never holds credentials or makes direct network calls.',
      docsUrl: 'https://developers.cloudflare.com/dynamic-workers/',
    },
    {
      id: 'mcp-portal',
      label: 'MCP Server Portal',
      sublabel: 'Discovery, DLP',
      icon: '\u{1F6AA}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare MCP Server Portal',
      description: 'Centralizes multiple MCP servers onto a single HTTP endpoint. Admins curate tools, turn individual tools on/off, and configure prompt templates per portal. Supports both unauthenticated and OAuth-secured MCP servers. Portal logs provide per-portal and per-server audit views. Gateway routing enables DLP scanning of all portal traffic.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
    },
    {
      id: 'remote-mcp',
      label: 'Remote MCP Servers',
      sublabel: 'Deployed globally',
      icon: '\u{2699}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers',
      description: 'Remote MCP servers deployed on Cloudflare Workers using the Agents SDK (McpAgent class). Built on Durable Objects for stateful execution with built-in SQL database. Supports Streamable HTTP transport and OAuth 2.1 authorization. Remote servers are recommended over local installations — local MCP servers introduce shadow IT risks with no audit trail.',
      docsUrl: 'https://developers.cloudflare.com/agents/guides/remote-mcp-server/',
    },
    {
      id: 'cf-access',
      label: 'ZTNA (Access)',
      sublabel: 'SSO + MFA',
      icon: '\u{1F512}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Access',
      description: 'Zero Trust Network Access with SSO and MFA enforcement. Users authenticate via OIDC/SAML from configured identity providers. For MCP servers, Access acts as the OAuth 2.1 provider — issuing OAuth ID tokens with user identity attributes. Access policies control which users/groups can reach each portal and each individual MCP server. Service tokens (Client ID + Client Secret) enable machine-to-machine authentication.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
    },

    // Right column — Downstream resources
    {
      id: 'saas-mcp',
      label: 'SaaS MCP Servers',
      sublabel: 'Slack, Jira, GitHub',
      icon: '\u{1F4E1}',
      type: 'resource',
      column: 'right',
      description: 'MCP servers for SaaS applications — Slack, Jira, GitHub, and other third-party services accessed via MCP tool invocations through the portal.',
    },
    {
      id: 'internal-services',
      label: 'Internal Services',
      sublabel: 'Databases, APIs',
      icon: '\u{1F3E2}',
      type: 'resource',
      column: 'right',
      description: 'Internal services, databases, private APIs, and self-hosted applications accessed by remote MCP servers running on Cloudflare Workers.',
    },
  ],

  edges: [
    // Left column flow
    { id: 'e-user-clients', from: 'human-user', to: 'mcp-clients', label: '', direction: 'ltr' },
    { id: 'e-clients-gateway', from: 'mcp-clients', to: 'cf-gateway', label: 'MCP request', direction: 'ltr' },
    { id: 'e-llms-aigateway', from: 'llms', to: 'ai-gateway', label: '', direction: 'ltr' },

    // Center column flow
    { id: 'e-gateway-isolate', from: 'cf-gateway', to: 'worker-isolate', label: '', direction: 'ltr' },
    { id: 'e-gateway-portal', from: 'cf-gateway', to: 'mcp-portal', label: 'DLP scan', direction: 'ltr' },
    { id: 'e-portal-remote', from: 'mcp-portal', to: 'remote-mcp', label: '', direction: 'ltr' },
    { id: 'e-access-portal', from: 'cf-access', to: 'mcp-portal', label: 'Policy', direction: 'ltr' },

    // Right column flow
    { id: 'e-remote-saas', from: 'remote-mcp', to: 'saas-mcp', label: 'API call', direction: 'ltr' },
    { id: 'e-remote-internal', from: 'remote-mcp', to: 'internal-services', label: 'API call', direction: 'ltr' },

    // Response path
    { id: 'e-resp-clients', from: 'remote-mcp', to: 'mcp-clients', label: 'Response', direction: 'rtl' },
  ],

  steps: [
    {
      title: 'User connects via MCP client',
      product: 'MCP Protocol',
      description: 'The user opens an MCP client application (OpenCode, Claude Code, Cursor IDE, or Claude Desktop) and connects to the organization\'s MCP Server Portal URL. The MCP client translates user intent into MCP protocol requests.',
      why: 'MCP clients provide the user interface for interacting with remote tools. Using a centralized portal URL instead of configuring individual MCP servers eliminates shadow IT risks from unmanaged local MCP server installations.',
      activeNodes: ['human-user', 'mcp-clients'],
      activeEdges: ['e-user-clients'],
    },
    {
      title: 'LLM calls routed through AI Gateway',
      product: 'Cloudflare AI Gateway',
      description: 'LLM inference calls from the MCP client are routed through AI Gateway for cost controls, rate limiting, caching, and unified logging. AI Gateway tracks token usage, latency, and costs across all AI providers from a single dashboard.',
      why: 'AI Gateway provides visibility and cost control over LLM API usage. Rate limiting prevents abuse, caching reduces redundant calls, and unified analytics show which models and providers agents are using.',
      activeNodes: ['llms', 'ai-gateway'],
      activeEdges: ['e-llms-aigateway'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
      owasp: ['LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Gateway inspects MCP traffic',
      product: 'Cloudflare Gateway',
      description: 'When Gateway routing is enabled on the MCP Server Portal, all MCP protocol traffic passes through Cloudflare Gateway. Gateway HTTP policies with DLP profiles detect and block sensitive data (credentials, financial data, PII) in tool inputs sent to upstream MCP servers. Portal traffic appears in Gateway HTTP logs alongside the rest of the organization\'s HTTP traffic.',
      why: 'Routing MCP portal traffic through Gateway provides inline DLP scanning and HTTP logging without requiring a separate device agent. Gateway HTTP policies explicitly target the upstream MCP server URL to match MCP-specific traffic.',
      activeNodes: ['mcp-clients', 'cf-gateway'],
      activeEdges: ['e-clients-gateway'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/#route-portal-traffic-through-gateway',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'ASI01 Agent Goal Hijack', 'ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'Codemode sandboxes tool execution',
      product: 'Dynamic Workers / Codemode',
      description: 'For MCP servers using Codemode, the codeMcpServer() wrapper runs tool calls inside isolated Dynamic Worker sandboxes. Each execution gets its own V8 isolate with network isolation (globalOutbound: null). Tool dispatch uses Workers RPC — the sandbox never holds credentials or makes direct network calls. The LLM writes JavaScript that calls codemode.toolName(args), saving up to 80% in inference tokens.',
      why: 'Sandboxed execution prevents untrusted code from accessing the network or credentials. Workers RPC bridges the security boundary with type safety. Codemode reduces token costs by letting the LLM write code instead of making individual tool calls.',
      activeNodes: ['cf-gateway', 'worker-isolate'],
      activeEdges: ['e-gateway-isolate'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/codemode/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'MCP Portal routes tool calls',
      product: 'Cloudflare MCP Server Portal',
      description: 'The MCP Server Portal aggregates multiple MCP servers onto a single HTTP endpoint. Admins curate which tools are exposed per portal, turn individual tools on/off, and configure prompt templates. The portal supports both unauthenticated MCP servers and servers secured with any OAuth provider. Per-portal and per-server audit logs capture all tool invocations. Logpush integration exports logs to SIEM tools.',
      why: 'Centralized portal management replaces per-server configuration. Admins control exactly which tools are available — the less external context exposed to the AI model, the better the responses. Audit logging provides compliance-ready visibility into all MCP usage.',
      activeNodes: ['cf-gateway', 'mcp-portal'],
      activeEdges: ['e-gateway-portal'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI02 Tool Misuse & Exploitation', 'ASI04 Agentic Supply Chain Vulnerabilities'],
    },
    {
      title: 'Access enforces identity per tool',
      product: 'Cloudflare Access',
      description: 'Cloudflare Access (ZTNA) enforces SSO + MFA authentication for the portal and per-server Access policies control which users/groups can see and invoke each MCP server\'s tools. Access acts as the OAuth 2.1 provider per the MCP specification, issuing tokens with user identity attributes. Service tokens enable machine-to-machine authentication for automated agent systems.',
      why: 'Zero Trust identity verification ensures only authorized users interact with MCP servers. Per-server Access policies enforce least privilege — even if a user can access the portal, they may not be authorized for every server. OAuth 2.1 integration follows the MCP specification natively.',
      activeNodes: ['cf-access', 'mcp-portal'],
      activeEdges: ['e-access-portal'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
      owasp: ['LLM06:2025 Excessive Agency', 'LLM01:2025 Prompt Injection', 'ASI02 Tool Misuse & Exploitation', 'ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'Remote MCP server executes tool',
      product: 'Cloudflare Workers',
      description: 'The remote MCP server (built with the Agents SDK McpAgent class on Durable Objects) executes the tool call. Each agent instance has its own SQL database for stateful execution. Supports Streamable HTTP transport and OAuth 2.1 authorization. Remote servers connect to SaaS MCP servers (Slack, Jira, GitHub) and internal services (databases, APIs).',
      why: 'Running MCP servers on Cloudflare Workers provides stateful, globally distributed execution with built-in SQL storage. Remote servers are recommended over local installations — local MCP servers introduce shadow IT risks with no audit trail or governance.',
      activeNodes: ['mcp-portal', 'remote-mcp', 'saas-mcp', 'internal-services'],
      activeEdges: ['e-portal-remote', 'e-remote-saas', 'e-remote-internal'],
      docsUrl: 'https://developers.cloudflare.com/agents/guides/remote-mcp-server/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'All interactions logged and audited',
      product: 'Cloudflare Access',
      description: 'All MCP tool invocations are logged by Cloudflare Access with full context: who called which tool, when, with what parameters, and from what device. Portal logs provide per-portal and per-server audit views. Logpush exports logs to third-party SIEM tools for long-term retention. Gateway HTTP logs capture DLP events. AI Gateway logs track LLM usage and costs.',
      why: 'Comprehensive audit logging across Access, Gateway, and AI Gateway is essential for compliance, incident investigation, and understanding how AI agents interact with organizational resources.',
      activeNodes: ['mcp-portal', 'cf-gateway', 'ai-gateway'],
      activeEdges: [],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/#view-portal-logs',
      owasp: ['ASI10 Rogue Agents', 'ASI08 Cascading Failures'],
    },
    {
      title: 'Response returns to user',
      product: 'MCP Protocol',
      description: 'The tool execution result is returned through the remote MCP server, back through the MCP Server Portal, and ultimately presented to the human user in their MCP client. Gateway DLP scans apply to response traffic as well when Gateway routing is enabled.',
      why: 'The complete round-trip is secured and audited. The user receives results knowing that identity, authorization, DLP, and sandboxing policies were enforced at every step.',
      activeNodes: ['remote-mcp', 'mcp-clients', 'human-user'],
      activeEdges: ['e-resp-clients'],
    },
  ],
};
