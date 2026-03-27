/**
 * UC2 — Govern AI Agents (Human <-> AI Agent <-> Resources)
 * Cloudflare Access (MCP Server Portals), DLP for MCP (coming soon), Remote MCP Servers on Workers
 *
 * Key governance principle: Remote MCP servers via Cloudflare are recommended over local
 * installations. Local MCP servers = shadow IT risk with no audit trail.
 * Remote MCP servers = centralized visibility, identity-based access, and audit logging.
 *
 * MCP authorization uses OAuth 2.1. Cloudflare Access acts as the OAuth provider,
 * issuing OAuth ID tokens with user identity attributes for per-tool authorization.
 *
 * References:
 *   https://developers.cloudflare.com/agents/model-context-protocol/governance/
 *   https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/
 *   https://developers.cloudflare.com/agents/guides/remote-mcp-server/
 */

export const uc2 = {
  id: 'uc2',
  title: 'Govern AI Agents',
  subtitle: 'Secure interactions between human users and AI agents via MCP',

  nodes: [
    // Left column — Human / AI Client
    {
      id: 'human-user',
      label: 'Human User',
      sublabel: 'MCP client (Claude, Cursor, etc.)',
      icon: '\u{1F464}',
      type: 'user',
      column: 'left',
      description: 'A human user connecting via an MCP host/client application such as Claude Desktop, Cursor IDE, or a custom MCP client.',
    },
    {
      id: 'ai-agent',
      label: 'AI Agent',
      sublabel: 'LLM-powered assistant',
      icon: '\u{1F916}',
      type: 'ai-service',
      column: 'left',
      description: 'An AI agent (embedded in the MCP host) that sends tool call requests to MCP servers on behalf of the user.',
    },
    // Center column — Cloudflare
    {
      id: 'cf-access',
      label: 'Cloudflare Access',
      sublabel: 'OIDC / SAML authentication',
      icon: '\u{1F512}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Access',
      description: 'Zero Trust authentication and authorization. Users authenticate via OIDC/SAML from configured identity providers. For MCP servers, Access acts as the OAuth 2.1 provider — issuing OAuth ID tokens with user identity attributes. Service tokens (Client ID + Client Secret) enable machine-to-machine authentication for automated agent systems.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
    },
    {
      id: 'mcp-portal',
      label: 'MCP Server Portal',
      sublabel: 'Centralized MCP gateway',
      icon: '\u{1F6AA}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare MCP Server Portal',
      description: 'Centralizes multiple MCP servers onto a single HTTP endpoint. Admins curate tools, turn individual tools on/off, and configure prompt templates per portal. Supports both unauthenticated and OAuth-secured MCP servers. Portal logs provide per-portal and per-server audit views of all tool invocations.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
    },
    {
      id: 'access-policy',
      label: 'Access Policy',
      sublabel: 'Per-tool authorization',
      icon: '\u{1F6E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Access',
      description: 'Access policies are re-evaluated per tool invocation. Controls which tools each user/group can invoke, with audit logging of individual requests.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
    },
    {
      id: 'dlp-mcp',
      label: 'DLP for MCP',
      sublabel: 'Tool input/output scanning',
      icon: '\u{1F50D}',
      type: 'coming-soon',
      column: 'center',
      comingSoon: true,
      product: 'Cloudflare DLP for MCP Portal (Coming Soon)',
      description: 'Data Loss Prevention scanning for MCP tool inputs and outputs. Will detect sensitive data flowing through MCP tool invocations. Currently in development.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/',
    },
    {
      id: 'mcp-server',
      label: 'MCP Server',
      sublabel: 'Running on Workers',
      icon: '\u{2699}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers',
      description: 'Remote MCP server deployed on Cloudflare Workers using the Agents SDK (McpAgent class). Built on Durable Objects for stateful execution with built-in SQL database. Supports Streamable HTTP transport and OAuth 2.1 authorization. Remote servers are recommended over local installations — local MCP servers introduce shadow IT risks with no audit trail.',
      docsUrl: 'https://developers.cloudflare.com/agents/model-context-protocol/',
    },
    // Right column — Resources (specific examples per visual inspiration)
    {
      id: 'saas-apps',
      label: 'SaaS Apps',
      sublabel: 'Slack, Google Drive, GitHub',
      icon: '\u{1F4E1}',
      type: 'resource',
      column: 'right',
      description: 'MCP servers for SaaS applications — Slack, Google Drive, GitHub, and other third-party services accessed via MCP tool invocations.',
    },
    {
      id: 'self-hosted',
      label: 'Self-Hosted Apps',
      sublabel: 'Confluence, internal wikis',
      icon: '\u{1F3E2}',
      type: 'resource',
      column: 'right',
      description: 'MCP servers for self-hosted applications — Confluence, internal wikis, databases, and private APIs within your infrastructure.',
    },
    {
      id: 'custom-workers',
      label: 'Custom Apps',
      sublabel: 'Built on Workers',
      icon: '\u{2601}',
      type: 'cloudflare',
      column: 'right',
      product: 'Cloudflare Workers',
      description: 'Custom MCP servers built and deployed on Cloudflare Workers. Connect to internal APIs, databases, or other backend services with global low-latency execution.',
      docsUrl: 'https://developers.cloudflare.com/agents/model-context-protocol/',
    },
  ],

  edges: [
    { id: 'e-human-access', from: 'human-user', to: 'cf-access', label: 'OIDC/SAML', direction: 'ltr' },
    { id: 'e-access-portal', from: 'cf-access', to: 'mcp-portal', label: 'Token', direction: 'ltr' },
    { id: 'e-agent-portal', from: 'ai-agent', to: 'mcp-portal', label: 'Tool call', direction: 'ltr' },
    { id: 'e-portal-policy', from: 'mcp-portal', to: 'access-policy', label: '', direction: 'ltr' },
    { id: 'e-policy-dlp', from: 'access-policy', to: 'dlp-mcp', label: '', direction: 'ltr' },
    { id: 'e-dlp-server', from: 'dlp-mcp', to: 'mcp-server', label: '', direction: 'ltr' },
    { id: 'e-server-saas', from: 'mcp-server', to: 'saas-apps', label: 'API call', direction: 'ltr' },
    { id: 'e-server-hosted', from: 'mcp-server', to: 'self-hosted', label: 'API call', direction: 'ltr' },
    { id: 'e-server-custom', from: 'mcp-server', to: 'custom-workers', label: 'API call', direction: 'ltr' },
    { id: 'e-resp-agent', from: 'mcp-server', to: 'ai-agent', label: 'Response', direction: 'rtl' },
  ],

  steps: [
    {
      title: 'User authenticates via Access',
      product: 'Cloudflare Access',
      description: 'The human user authenticates through Cloudflare Access using their organization\'s identity provider (OIDC/SAML). For MCP servers, Access acts as the OAuth 2.1 provider per the MCP specification. Service tokens (Client ID + Client Secret) are available for machine-to-machine agent authentication.',
      why: 'Zero Trust authentication ensures only verified users from your organization can interact with MCP servers. OAuth 2.1 integration follows the MCP specification natively. Service tokens enable headless agent authentication.',
      activeNodes: ['human-user', 'cf-access'],
      activeEdges: ['e-human-access'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
      owasp: ['ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'Access issues session token',
      product: 'Cloudflare Access',
      description: 'Access issues a short-lived token and enforces session policies. The token encodes the user\'s identity, group memberships, and authorized scopes.',
      why: 'Short-lived tokens minimize the window of exposure. Session policies ensure continuous verification rather than one-time authentication.',
      activeNodes: ['cf-access', 'mcp-portal'],
      activeEdges: ['e-access-portal'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
    },
    {
      title: 'User connects to MCP Portal',
      product: 'Cloudflare MCP Server Portal',
      description: 'The user\'s MCP client connects to the MCP Server Portal — a centralized HTTP endpoint that aggregates multiple MCP servers. The portal presents curated tools and prompt templates configured by admins. Individual tools can be turned on/off. Remote MCP servers are recommended over local installations to avoid shadow IT risks.',
      why: 'MCP Portals centralize management — a single URL replaces configuring each MCP server individually. Admins control exactly which tools are exposed with per-tool toggles. Local MCP servers are shadow IT; remote servers through Cloudflare provide full visibility and control.',
      activeNodes: ['ai-agent', 'mcp-portal'],
      activeEdges: ['e-agent-portal'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI02 Tool Misuse & Exploitation', 'ASI04 Agentic Supply Chain Vulnerabilities'],
    },
    {
      title: 'AI agent sends tool call',
      product: 'MCP Protocol',
      description: 'The AI agent (LLM) sends a tool call request to the MCP server via the portal. The request specifies which tool to invoke and with what parameters.',
      why: 'MCP standardizes how AI agents interact with external tools. The portal acts as a secure gateway, ensuring all tool calls pass through Cloudflare controls.',
      activeNodes: ['mcp-portal', 'access-policy'],
      activeEdges: ['e-portal-policy'],
    },
    {
      title: 'Access policy re-evaluated per tool',
      product: 'Cloudflare Access',
      description: 'Access policies are re-evaluated for each individual tool invocation. This ensures the user is authorized to use the specific tool being called, not just the portal.',
      why: 'Per-tool authorization prevents privilege escalation. Even if a user can access the portal, they may not be authorized for every tool — policies enforce least privilege.',
      activeNodes: ['access-policy', 'dlp-mcp'],
      activeEdges: ['e-policy-dlp'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
      owasp: ['LLM06:2025 Excessive Agency', 'LLM01:2025 Prompt Injection', 'ASI02 Tool Misuse & Exploitation', 'ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'DLP scans tool inputs/outputs',
      product: 'Cloudflare DLP (Coming Soon)',
      description: 'Data Loss Prevention will scan tool inputs and outputs for sensitive data flowing through MCP tool invocations. This feature is currently in development.',
      why: 'MCP tool calls can move significant data between AI agents and resources. DLP ensures sensitive data doesn\'t leak through agentic workflows.',
      activeNodes: ['dlp-mcp', 'mcp-server'],
      activeEdges: ['e-dlp-server'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'ASI01 Agent Goal Hijack', 'ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'MCP server executes tool call',
      product: 'Cloudflare Workers',
      description: 'The MCP server (built with the Agents SDK McpAgent class on Durable Objects) executes the tool call — connecting to SaaS apps (Slack, GitHub), self-hosted apps (Confluence), or custom Workers-based services. Each agent instance has its own SQL database for stateful execution. Workers isolate runtime provides sandboxed execution.',
      why: 'Running MCP servers on Cloudflare Workers with the Agents SDK provides stateful, globally distributed execution with built-in SQL storage, WebSocket connections, and task scheduling — all in an isolated runtime environment.',
      activeNodes: ['mcp-server', 'saas-apps', 'self-hosted', 'custom-workers'],
      activeEdges: ['e-server-saas', 'e-server-hosted', 'e-server-custom'],
      docsUrl: 'https://developers.cloudflare.com/agents/model-context-protocol/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'Agentic calls logged and audited',
      product: 'Cloudflare Access',
      description: 'All MCP tool invocations are logged by Cloudflare Access with full context: who called which tool, when, with what parameters, and from what device. Portal logs provide per-portal and per-server audit views. Prompts and responses made through the portal are captured for compliance.',
      why: 'Comprehensive audit logging with per-portal and per-server views is essential for compliance, incident investigation, and understanding how AI agents interact with organizational resources.',
      activeNodes: ['mcp-server', 'mcp-portal'],
      activeEdges: [],
      owasp: ['ASI10 Rogue Agents', 'ASI08 Cascading Failures'],
    },
    {
      title: 'Response returns to user',
      product: 'MCP Protocol',
      description: 'The tool execution result is returned through the MCP server to the AI agent, and ultimately presented to the human user in their MCP client.',
      why: 'The complete round-trip is secured and audited. The user receives results knowing that identity, authorization, and data protection policies were enforced at every step.',
      activeNodes: ['mcp-server', 'ai-agent', 'human-user'],
      activeEdges: ['e-resp-agent'],
    },
  ],
};
