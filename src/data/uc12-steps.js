/**
 * UC12 — Persistent AI Chat Agent
 * Build stateful AI chat with automatic message persistence, resumable streams,
 * and real-time state sync to React clients via useAgentChat.
 *
 * Key capabilities:
 *   - AIChatAgent: Durable Object with built-in SQLite message history
 *   - Resumable streams: reconnect mid-stream without losing the response
 *   - Real-time state sync: agent state changes pushed to connected clients
 *   - Server-side + client-side tools with human-in-the-loop approval
 *   - Any LLM provider: Workers AI, OpenAI, Anthropic, Gemini
 *
 * References:
 *   https://developers.cloudflare.com/agents/api-reference/chat-agents/
 *   https://developers.cloudflare.com/agents/
 *   https://developers.cloudflare.com/workers-ai/
 */

export const uc12 = {
  id: 'uc12',
  title: 'Persistent AI Chat Agent',
  subtitle: 'Stateful AI chat with automatic message persistence, resumable streams, and real-time sync',

  nodes: [
    // Left column — client
    {
      id: 'browser-client',
      label: 'Browser Client',
      sublabel: 'useAgentChat React hook',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'The browser app uses the useAgentChat React hook from @cloudflare/agents/react to connect to the AIChatAgent instance. The hook handles WebSocket connection management, message streaming, real-time state sync, and tool approval UI. Connecting the same userId to the same agent instance resumes the full conversation with complete history.',
    },
    // Center column — AIChatAgent pipeline
    {
      id: 'aichatagent',
      label: 'AIChatAgent',
      sublabel: 'Durable Object, per-user persistent instance',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (AIChatAgent)',
      description: 'AIChatAgent extends Agent with full AI chat functionality: automatic message persistence to SQLite, streaming AI responses via WebSocket or SSE, resumable streams on reconnect, and the onChatMessage() lifecycle hook for LLM calls. Each user or session gets a dedicated Durable Object instance — state is fully isolated and globally consistent.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },
    {
      id: 'sqlite-state',
      label: 'SQLite State',
      sublabel: 'Message history, custom agent state',
      icon: '\u{1F5C4}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (State)',
      description: 'Every AIChatAgent instance has a built-in SQLite database persisting the full message thread (user messages, tool calls, tool results, assistant responses) and arbitrary custom state (user preferences, context flags, metadata). State survives restarts, deploys, and connection drops. Custom state changes are pushed to all connected clients in real time via onStateUpdate.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/',
    },
    {
      id: 'stream-mgr',
      label: 'Streaming',
      sublabel: 'WebSocket / SSE, resumable streams',
      icon: '\u{1F4E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Streaming)',
      description: 'AI responses stream to the client token-by-token over WebSocket or Server-Sent Events. If the client disconnects mid-stream (network drop, tab switch), the stream is buffered in the Durable Object and resumes automatically on reconnect — the user sees the rest of the response without it restarting from the beginning.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/http-sse/',
    },
    {
      id: 'llm-chat',
      label: 'LLM Inference',
      sublabel: 'onChatMessage: any provider',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers AI',
      description: 'The onChatMessage() callback receives the latest user message with full conversation history from SQLite. Use Workers AI (via createWorkersAI provider + AI SDK streamText), OpenAI, Anthropic, or any AI SDK-compatible provider. Tool definitions (server-side and client-side) are passed to the LLM and executed automatically or with human-in-the-loop approval.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },
    // Right column — tools + LLM providers
    {
      id: 'tools',
      label: 'Tools',
      sublabel: 'Server + client-side, human-in-the-loop',
      icon: '\u{1F527}',
      type: 'resource',
      column: 'right',
      description: 'Server-side tools run in the Durable Object (database queries, API calls, file operations). Client-side tools run in the browser (DOM manipulation, local storage, clipboard). Human-in-the-loop tools pause execution and send an approval request to the connected client — the user confirms or rejects before the action runs. Tool results are persisted to SQLite.',
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/human-in-the-loop/',
    },
    {
      id: 'llm-providers',
      label: 'LLM Providers',
      sublabel: 'Workers AI, OpenAI, Anthropic, Gemini',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'AIChatAgent works with any AI SDK-compatible LLM: Workers AI (on-network, zero egress), OpenAI (GPT-4o, o4-mini), Anthropic (Claude), Google Gemini, and others. Swap providers by changing the createWorkersAI() call — the message persistence, streaming, and tool infrastructure is provider-agnostic.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/using-ai-models/',
    },
  ],

  edges: [
    { id: 'e-client-agent',    from: 'browser-client', to: 'aichatagent',   label: 'WebSocket / SSE',         direction: 'ltr' },
    { id: 'e-agent-sqlite',    from: 'aichatagent',    to: 'sqlite-state',  label: 'Persist messages',        direction: 'ltr' },
    { id: 'e-agent-stream',    from: 'aichatagent',    to: 'stream-mgr',    label: '',                        direction: 'ltr' },
    { id: 'e-stream-llm',      from: 'stream-mgr',     to: 'llm-chat',      label: 'History + message',       direction: 'ltr' },
    { id: 'e-llm-tools',       from: 'llm-chat',       to: 'tools',         label: 'Tool calls',              direction: 'ltr' },
    { id: 'e-llm-providers',   from: 'llm-chat',       to: 'llm-providers', label: 'Inference',               direction: 'ltr' },
    { id: 'e-tools-llm',       from: 'tools',          to: 'llm-chat',      label: 'Tool results',            direction: 'rtl' },
    { id: 'e-stream-client',   from: 'stream-mgr',     to: 'browser-client', label: 'Token stream',           direction: 'rtl' },
    { id: 'e-sqlite-client',   from: 'sqlite-state',   to: 'browser-client', label: 'State sync',             direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Client connects — conversation resumed',
      product: 'Agents SDK (AIChatAgent)',
      description: 'The browser app connects to the AIChatAgent Durable Object instance via useAgentChat, passing a userId or session ID. If this agent instance has prior history, it is loaded from SQLite and the full conversation context is immediately available. Disconnecting and reconnecting (mobile, tab switch) always resumes the same conversation — no session management code needed.',
      why: 'Per-user Durable Object instances mean conversations are truly persistent — not stored in a database you maintain but in a managed, globally-consistent stateful compute instance that is always available at the user\'s nearest edge PoP.',
      activeNodes: ['browser-client', 'aichatagent'],
      activeEdges: ['e-client-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },
    {
      title: 'User message persisted to SQLite',
      product: 'Agents SDK (State)',
      description: 'The incoming user message is automatically appended to the message thread in the Durable Object\'s built-in SQLite database before any LLM call. Tool calls and results, assistant responses, and custom metadata are all stored in the same SQLite instance. Custom state (user preferences, context flags) can be updated and is pushed to all connected clients in real time via onStateUpdate.',
      why: 'Automatic message persistence means you never lose a conversation turn due to a crash, timeout, or code error. Every interaction is durably recorded before processing begins.',
      activeNodes: ['aichatagent', 'sqlite-state'],
      activeEdges: ['e-agent-sqlite'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/',
    },
    {
      title: 'Streaming response initiated',
      product: 'Agents SDK (Streaming)',
      description: 'The AIChatAgent passes the full conversation history from SQLite to the LLM via onChatMessage(). The LLM response streams token-by-token back through the stream manager to the client. If the client disconnects mid-stream, the in-progress response is buffered in the Durable Object. On reconnect, the stream resumes from the interruption point automatically.',
      why: 'Resumable streams solve a common UX problem: users on mobile or flaky connections losing partial responses. The stream always completes — even across disconnects.',
      activeNodes: ['aichatagent', 'stream-mgr', 'browser-client'],
      activeEdges: ['e-agent-stream', 'e-stream-client'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/http-sse/',
    },
    {
      title: 'LLM called with full conversation context',
      product: 'Cloudflare Workers AI',
      description: 'onChatMessage() receives the complete message array from SQLite (user messages, assistant messages, tool results) and calls the configured LLM via the AI SDK streamText() function. Supported providers: Workers AI (createWorkersAI binding), OpenAI, Anthropic (Claude), Google Gemini, and any AI SDK-compatible model. Tool definitions are included in the LLM call.',
      why: 'Passing the full conversation history on every turn means the LLM has complete context — it can reference earlier parts of the conversation, recall tool results from previous turns, and maintain consistent persona across a long session.',
      activeNodes: ['stream-mgr', 'llm-chat', 'llm-providers'],
      activeEdges: ['e-stream-llm', 'e-llm-providers'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'Server-side tools executed',
      product: 'Agents SDK (Tools)',
      description: 'When the LLM requests a tool call, the Agents SDK executes the server-side tool in the Durable Object: database queries, external API calls, file operations, Cloudflare service bindings (R2, D1, KV). The tool result is appended to the message history in SQLite and passed back to the LLM for the next generation step.',
      why: 'Server-side tools run in the same Durable Object as the conversation state — they have direct access to the agent\'s SQLite database and full service bindings without additional network hops.',
      activeNodes: ['llm-chat', 'tools'],
      activeEdges: ['e-llm-tools', 'e-tools-llm'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },
    {
      title: 'Human-in-the-loop approval for sensitive actions',
      product: 'Agents SDK (Human-in-the-loop)',
      description: 'Tools marked for human-in-the-loop approval pause execution and send a confirmation request to the connected browser client. The user sees the proposed action (e.g., "Delete 47 files from project X") and approves or rejects it. On approval, execution continues; on rejection, the LLM receives the rejection and can propose an alternative. This pattern is critical for irreversible or high-impact agent actions.',
      why: 'Human-in-the-loop approval gives users control over what the agent actually does — preventing autonomous actions from having unintended consequences on real systems without user awareness.',
      activeNodes: ['tools', 'browser-client'],
      activeEdges: ['e-tools-llm'],
      docsUrl: 'https://developers.cloudflare.com/agents/concepts/human-in-the-loop/',
    },
    {
      title: 'Client-side tools + real-time state sync',
      product: 'Agents SDK (AIChatAgent)',
      description: 'Client-side tools run in the browser (DOM manipulation, clipboard, local storage) and are invoked by the LLM but executed on the client — the Durable Object sends a tool invocation message and waits for the client\'s result. Separately, custom agent state changes (updated preferences, new context flags) are pushed to all connected clients in real time via the onStateUpdate callback in useAgentChat.',
      why: 'Client-side tools enable AI-driven UI manipulation — the agent can read the current DOM state, update UI elements, or interact with browser APIs as part of its tool set, opening up entirely new categories of agentic UX.',
      activeNodes: ['sqlite-state', 'browser-client'],
      activeEdges: ['e-sqlite-client'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },
  ],
};
