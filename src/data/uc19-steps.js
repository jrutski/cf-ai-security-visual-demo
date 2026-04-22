/**
 * UC19 — Email for Agents (Cloudflare Email Service)
 * Multi-channel AI agents that live in the inbox: receive, parse, process, and reply
 * to email natively — without external SMTP providers or API key management.
 *
 * Key capabilities:
 *   - env.EMAIL.send() — Workers binding, no API keys or secrets management
 *   - Auto-configured SPF/DKIM/DMARC for deliverability
 *   - Agents SDK onEmail hook — receive inbound email in Agent class
 *   - routeAgentEmail() + createAddressBasedEmailResolver() — address-based routing
 *   - HMAC-SHA256 signed reply routing headers — secure reply-to-exact-instance
 *   - State persists via Durable Objects (this.setState) — inbox as agent memory
 *   - Agents can kick off async workflows, Queues, and background tasks
 *   - MCP server, Wrangler CLI, REST API, TypeScript/Python/Go SDKs for external agents
 *
 * Status: Public beta
 *
 * References:
 *   https://blog.cloudflare.com/email-for-agents
 *   https://developers.cloudflare.com/agents/api-reference/agents-api/
 *   https://developers.cloudflare.com/email-routing/
 */

export const uc19 = {
  id: 'uc19',
  title: 'Email for Agents',
  subtitle: 'Receive, process, and reply to email natively from AI agents via Cloudflare Email Service',

  nodes: [
    // Left column — user
    {
      id: 'user-inbox',
      label: 'User',
      sublabel: 'Sends email to agent address',
      icon: '\u{1F4E7}',
      type: 'user',
      column: 'left',
      description: 'A user sends an email to an agent-owned address such as support@yourdomain.com or sales@yourdomain.com. The email address is provisioned by Cloudflare Email Routing — no separate inbox, mail server, or SMTP relay is required. Sub-addressing ([email protected]) is supported for routing to different agent namespaces and instances within the same domain. Users interact with the agent through normal email clients — no special integration on their side.',
      docsUrl: 'https://developers.cloudflare.com/email-routing/',
    },

    // Center column — Cloudflare email stack
    {
      id: 'email-routing',
      label: 'Cloudflare Email Routing',
      sublabel: 'Routes by address to agent instances',
      icon: '\u{1F4EC}',
      type: 'cloudflare',
      column: 'center',
      product: 'Email Routing',
      description: 'Cloudflare Email Routing (free, available for all zones) receives inbound email for your domain and routes it to a Worker for processing. The routeAgentEmail() function and createAddressBasedEmailResolver() in the Agents SDK map email addresses to agent class instances automatically — support@domain → SupportAgent, sales@domain → SalesAgent. Sub-addressing routes to different agent namespaces within the same class.',
      docsUrl: 'https://developers.cloudflare.com/email-routing/',
    },
    {
      id: 'agent-instance',
      label: 'Agent Instance',
      sublabel: 'Durable Object · onEmail hook · state',
      icon: '\u{1F916}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK + Email Service',
      description: 'The agent class extends Agent from the Agents SDK and implements an onEmail(email) hook. When email arrives, the hook fires: the agent calls email.getRaw() to get the raw MIME message, parses it with PostalMime, and persists ticket state via this.setState(). Because agents are backed by Durable Objects, state persists across emails — the agent remembers conversation history, contact information, and prior context without a separate database. The agent can then kick off async background work (Queues, other Workers) and reply either synchronously or asynchronously.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/agents-api/',
    },
    {
      id: 'email-service',
      label: 'Cloudflare Email Service',
      sublabel: 'env.EMAIL.send() · DKIM/SPF auto-configured',
      icon: '\u{1F4E4}',
      type: 'cloudflare',
      column: 'center',
      product: 'Email Service',
      description: 'Cloudflare Email Service (now in public beta) enables agents to send outbound email via a native Workers binding — env.EMAIL.send() — with no API keys, no secrets management, and no SMTP configuration. SPF, DKIM, and DMARC records are configured automatically when you add your domain, ensuring deliverability. HMAC-SHA256 signed reply routing headers ensure that replies to a sent email route back to the exact agent instance that sent it — preventing header-forging attacks that could route emails to arbitrary agent instances. Accessible via Workers binding, MCP server, Wrangler CLI, or REST API.',
      docsUrl: 'https://blog.cloudflare.com/email-for-agents',
    },

    // Right column — outputs
    {
      id: 'background-work',
      label: 'Background Tasks',
      sublabel: 'Queues · Workers · async workflows',
      icon: '\u{1F504}',
      type: 'resource',
      column: 'right',
      description: 'After processing inbound email, the agent can kick off long-running background work: place a message on a Queue, trigger another Worker to query databases or call APIs, run a multi-step analysis, or schedule a follow-up response. Because this work happens asynchronously, the agent can receive a message, spend an hour processing data, check multiple external systems, and then reply with a complete answer — not just a chatbot acknowledgement. This is the fundamental difference between a chatbot and an agent: an agent acts on its own timeline.',
    },
    {
      id: 'email-reply',
      label: 'Email Reply',
      sublabel: 'Authenticated, globally delivered',
      icon: '\u{1F4E8}',
      type: 'resource',
      column: 'right',
      description: 'The agent sends a reply via env.EMAIL.send() with the original messageId as inReplyTo. HMAC-SHA256 signed routing headers ensure the reply comes from the correct agent instance. Cloudflare Email Service\'s global network delivers the email with low latency worldwide. Because the email is sent from a Cloudflare-managed domain with auto-configured authentication records, it arrives in the inbox rather than the spam folder — no third-party SMTP warmup or deliverability management required.',
    },
  ],

  edges: [
    { id: 'e-user-routing',    from: 'user-inbox',     to: 'email-routing',   label: 'Inbound email',           direction: 'ltr' },
    { id: 'e-routing-agent',   from: 'email-routing',  to: 'agent-instance',  label: 'Route by address',        direction: 'ltr' },
    { id: 'e-agent-work',      from: 'agent-instance', to: 'background-work', label: 'Async processing',        direction: 'ltr' },
    { id: 'e-agent-send',      from: 'agent-instance', to: 'email-service',   label: 'env.EMAIL.send()',        direction: 'ltr' },
    { id: 'e-send-reply',      from: 'email-service',  to: 'email-reply',     label: 'Deliver reply',           direction: 'ltr' },
    { id: 'e-reply-user',      from: 'email-reply',    to: 'user-inbox',      label: 'Reply to user',           direction: 'rtl' },
    { id: 'e-work-send',       from: 'background-work',to: 'email-service',   label: 'Send after async work',   direction: 'ltr' },
  ],

  steps: [
    {
      title: 'User sends email to agent-owned address',
      product: 'Email Routing',
      description: 'A user sends an email to support@yourdomain.com (or any address on your Cloudflare-managed domain). The address is provisioned through Cloudflare Email Routing — no mail server, no inbox provider, no SMTP relay needed. Sub-addressing works too: [email protected] routes to the "pro-tier" namespace. From the user\'s perspective, this is a normal email to a normal address. From the agent\'s perspective, an inbound message is about to trigger a real workflow.',
      why: 'Email remains the dominant business communication channel. Making agents email-native means meeting users where they already are — no app download, no special signup, no new interface to learn. The inbox becomes the agent\'s primary interface.',
      activeNodes: ['user-inbox', 'email-routing'],
      activeEdges: ['e-user-routing'],
      docsUrl: 'https://developers.cloudflare.com/email-routing/',
    },
    {
      title: 'Email Routing delivers to the correct agent instance',
      product: 'Email Routing + Agents SDK',
      description: 'Cloudflare Email Routing receives the inbound message and delivers it to your Worker\'s email() export handler. The routeAgentEmail() function reads the destination address and uses createAddressBasedEmailResolver() to route it to the right Agent class instance — support@domain → SupportAgent, sales@domain → SalesAgent. Each address maps to a unique Durable Object instance, so each "inbox" is a separate, persistent agent with its own state and conversation history.',
      why: 'Address-based routing is built into the SDK so you don\'t need to write address-parsing logic. The pattern "one email address = one agent instance" means each inbox is a stateful, persistent entity that remembers its entire history — not a stateless function that forgets everything after each message.',
      activeNodes: ['email-routing', 'agent-instance'],
      activeEdges: ['e-routing-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/agents-api/',
    },
    {
      title: 'Agent parses email and persists state',
      product: 'Agents SDK',
      description: 'The agent\'s onEmail(email) hook fires. The agent calls email.getRaw() to retrieve the raw MIME message, parses it with PostalMime (subject, body, attachments, message-id), and persists the ticket state via this.setState(). Because agents are backed by Durable Objects, this state survives forever — the agent remembers the user\'s name, company, prior issues, and conversation thread across all future emails without a separate database. Multiple agent instances never share state; each inbox address gets its own isolated Durable Object.',
      why: 'Persistent state transforms email from stateless trigger-response into a stateful conversation. The agent treating an email thread as a unified conversation — remembering prior context, tracking issue status, recognizing returning users — is fundamentally different from a webhook-fired Lambda that processes each email in complete isolation.',
      activeNodes: ['email-routing', 'agent-instance'],
      activeEdges: ['e-routing-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/agents-api/',
    },
    {
      title: 'Agent kicks off async background work',
      product: 'Agents SDK',
      description: 'After receiving the email, the agent kicks off long-running background work: place a message on a Cloudflare Queue for processing by another Worker, query external APIs, run database lookups, call an LLM for classification or summarization, or trigger a multi-step pipeline. The onEmail hook doesn\'t need to wait for this work to complete before returning — the agent can send an immediate acknowledgement and then reply with a full answer once the async work finishes, potentially hours later.',
      why: 'A chatbot must reply in the moment or not at all. An agent can think, act, and communicate on its own timeline. The difference is async: the ability to receive a message, orchestrate work across many services, and reply when the work is done — not when the HTTP connection times out.',
      activeNodes: ['agent-instance', 'background-work'],
      activeEdges: ['e-agent-work'],
    },
    {
      title: 'Agent sends reply via Email Service binding',
      product: 'Email Service',
      description: 'The agent calls this.sendEmail({ binding: this.env.EMAIL, from, to, inReplyTo, subject, text }) to send a reply. No SMTP configuration, no API keys, no secret rotation — the email binding handles authentication transparently. HMAC-SHA256 signed routing headers are embedded in the outgoing email, ensuring that when the user replies to the agent\'s email, it routes back to the exact same Durable Object instance that handled the original message — not an arbitrary new instance that has no context.',
      why: 'HMAC-signed reply routing is a security requirement that most "email for agents" solutions don\'t address. Without it, a malicious user could forge reply headers to route messages to arbitrary agent instances, potentially accessing other users\' data or state.',
      activeNodes: ['agent-instance', 'email-service'],
      activeEdges: ['e-agent-send'],
      docsUrl: 'https://blog.cloudflare.com/email-for-agents',
    },
    {
      title: 'Background work completes, agent sends full answer',
      product: 'Agents SDK + Email Service',
      description: 'After background processing completes (data fetched, analysis run, systems queried), the agent (or the Queue consumer Worker) calls env.EMAIL.send() to deliver the full response. This might happen seconds, minutes, or hours after the original message — whichever is appropriate for the task. The response is threaded correctly (inReplyTo header), routed to the correct instance, and sent from the authenticated domain with full deliverability.',
      why: 'Async replies break the synchronous request-response mental model of webhooks and change the quality of what agents can do. Instead of generating a placeholder response and deferring to a human, the agent can do real work — query three APIs, synthesize results, draft a detailed reply — and send it when it\'s actually ready.',
      activeNodes: ['background-work', 'email-service', 'email-reply'],
      activeEdges: ['e-work-send', 'e-send-reply'],
    },
    {
      title: 'Reply delivered to user — authenticated, threaded, globally delivered',
      product: 'Email Service',
      description: 'Cloudflare Email Service delivers the reply via its global network. When you add your domain, SPF, DKIM, and DMARC records are configured automatically — your emails arrive in the inbox, not the spam folder, without warmup periods or third-party deliverability services. Email Routing (for inbound) and Email Service (for outbound) together provide bidirectional email within a single platform. External agents (not running on Workers) can access Email Service via the REST API or TypeScript, Python, and Go SDKs — and via the Cloudflare MCP server or Wrangler CLI.',
      why: 'Deliverability is usually the hard part of email infrastructure. Auto-configured authentication records remove a common deployment failure mode. Running inbound and outbound through the same platform means reply threading, instance routing, and state persistence all work together without stitching multiple services.',
      activeNodes: ['email-service', 'email-reply', 'user-inbox'],
      activeEdges: ['e-send-reply', 'e-reply-user'],
      docsUrl: 'https://blog.cloudflare.com/email-for-agents',
    },
  ],
};
