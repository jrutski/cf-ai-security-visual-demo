/**
 * UC18 — Cloudflare Sandboxes
 * Persistent, isolated environments for AI agents — a real computer with a shell,
 * filesystem, and background processes that starts on demand and resumes from where it left off.
 *
 * Distinct from UC6 (Dynamic Workers / Codemode):
 *   UC6 = ephemeral code execution sandboxes for LLM-generated code (millisecond-start, stateless)
 *   UC18 = persistent, stateful environments agents return to across sessions
 *
 * Key capabilities:
 *   - getSandbox(env.Sandbox, "session-id") — start on demand or resume
 *   - exec(), gitClone()/gitCheckout(), writeFile(), readFile() — filesystem + shell ops
 *   - sandbox.terminal(request) — PTY session over WebSocket (xterm.js compatible)
 *   - createCodeContext({ language }) / runCode() — stateful code interpreter (Python, JS, TS)
 *   - startProcess() / exposePort() / waitForLog() — background servers + preview URLs
 *   - sandbox.watch() — filesystem events via inotify SSE stream
 *   - Snapshots — fast recovery, fork sessions from any point
 *   - Outbound Workers egress proxy — secure credential injection per host
 *   - Active CPU Pricing — only pay for active compute, not idle time
 *
 * References:
 *   https://blog.cloudflare.com/sandbox-ga/
 *   https://blog.cloudflare.com/sandbox-auth/
 *   https://developers.cloudflare.com/sandbox/
 */

export const uc18 = {
  id: 'uc18',
  title: 'Cloudflare Sandboxes',
  subtitle: 'Persistent, isolated AI agent environments with shell, filesystem, background processes, and secure egress',

  nodes: [
    // Left column — agent / developer
    {
      id: 'agent-dev',
      label: 'Agent / Developer',
      sublabel: 'Calls getSandbox() by session ID',
      icon: '\u{1F916}',
      type: 'user',
      column: 'left',
      description: 'An AI agent (or developer) accesses a Cloudflare Sandbox by name via the @cloudflare/sandbox package. If the sandbox is running, it connects immediately. If it\'s sleeping (idle shutdown), it wakes automatically. If it\'s new, it starts on demand. The same session ID always maps to the same sandbox state — agents can resume exactly where they left off across days or weeks. Sandboxes are powered by Cloudflare Containers and billed on Active CPU Pricing (idle time is free).',
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
    },

    // Center column — sandbox stack
    {
      id: 'sandbox-api',
      label: 'Sandbox API',
      sublabel: '@cloudflare/sandbox · Workers binding',
      icon: '\u{1F4E6}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Sandboxes',
      description: 'The Sandbox API is the programmatic interface for controlling the sandbox environment: exec() runs commands and streams output; gitCheckout() clones a remote repository into the sandbox filesystem; writeFile()/readFile() manage files; terminal() upgrades a WebSocket connection into a full PTY session (xterm.js compatible with output buffering for reconnects); createCodeContext()/runCode() provide a stateful code interpreter (Python, JavaScript, TypeScript — state persists across calls, like a Jupyter notebook); startProcess() runs background services; exposePort() returns a public preview URL; watch() returns an SSE stream of filesystem events via inotify.',
      docsUrl: 'https://developers.cloudflare.com/sandbox/api/',
    },
    {
      id: 'sandbox-env',
      label: 'Sandbox Environment',
      sublabel: 'Persistent Linux container · shell · filesystem',
      icon: '\u{1F5A5}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Sandboxes',
      description: 'Each named sandbox is a persistent Linux container with a real shell (PTY), a real filesystem, and the ability to run background processes. State persists across sessions — variables, installed packages, cloned repos, and running services are all preserved between agent invocations. Snapshots let you checkpoint the environment and restore quickly. The sandbox auto-sleeps when idle and wakes on the next request. Higher concurrency limits than previous generations enable fleet-scale agentic deployments.',
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
    },
    {
      id: 'outbound-proxy',
      label: 'Outbound Egress Proxy',
      sublabel: 'Outbound Workers · credential injection',
      icon: '\u{1F510}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Sandboxes',
      description: 'One of the hardest problems in agentic workloads is authentication: agents need to call private APIs, but you cannot trust untrusted agent code with raw credentials. Cloudflare Sandboxes solve this with a programmable outbound egress proxy built from Outbound Workers. Per-host rules intercept outbound requests from the sandbox and inject auth headers (Bearer tokens, API keys, OAuth tokens) at the network layer — the sandbox code never sees the credential value. Rules are defined in a static map or can be modified dynamically at runtime.',
      docsUrl: 'https://blog.cloudflare.com/sandbox-auth/',
    },

    // Right column — external + output
    {
      id: 'preview-url',
      label: 'Preview URL',
      sublabel: 'Live public URL for dev server',
      icon: '\u{1F310}',
      type: 'resource',
      column: 'right',
      description: 'When an agent starts a development server inside a sandbox (e.g., npm run dev), it can call exposePort(3000) to get a live public HTTPS URL the agent can share directly with a human user for review. The agent uses waitForLog() or waitForPort() to sequence work based on real signals from the running program rather than guessing with sleep() calls. This preview URL pattern enables agents that build something and immediately hand it to the user for feedback.',
      docsUrl: 'https://developers.cloudflare.com/sandbox/concepts/preview-urls/',
    },
    {
      id: 'ext-services',
      label: 'External APIs',
      sublabel: 'Authenticated via egress proxy',
      icon: '\u{1F517}',
      type: 'resource',
      column: 'right',
      description: 'Outbound requests from the sandbox pass through the Outbound Workers egress proxy, which injects the correct credentials per host without exposing raw secrets to the sandbox environment. Private internal APIs, third-party services, version control systems — all can be accessed securely. The sandbox code writes normal HTTP requests; the proxy handles all credential management transparently.',
    },
  ],

  edges: [
    { id: 'e-dev-api',       from: 'agent-dev',    to: 'sandbox-api',    label: 'getSandbox("session")',  direction: 'ltr' },
    { id: 'e-api-env',       from: 'sandbox-api',  to: 'sandbox-env',    label: 'Start / resume',         direction: 'ltr' },
    { id: 'e-env-proxy',     from: 'sandbox-env',  to: 'outbound-proxy', label: 'Outbound requests',      direction: 'ltr' },
    { id: 'e-proxy-ext',     from: 'outbound-proxy',to: 'ext-services',  label: 'Inject credentials',     direction: 'ltr' },
    { id: 'e-env-preview',   from: 'sandbox-env',  to: 'preview-url',    label: 'exposePort()',           direction: 'ltr' },
    { id: 'e-env-api',       from: 'sandbox-env',  to: 'sandbox-api',    label: 'exec output / streams',  direction: 'rtl' },
    { id: 'e-api-dev',       from: 'sandbox-api',  to: 'agent-dev',      label: 'Results',                direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Agent requests sandbox by name — starts on demand or resumes',
      product: 'Cloudflare Sandboxes',
      description: 'The agent calls getSandbox(env.Sandbox, "agent-session-47") to get a handle to a named sandbox. If the sandbox is running, it connects immediately. If it\'s sleeping (idle auto-shutdown), it wakes automatically and picks up exactly where it left off. If it\'s new, Cloudflare starts a fresh container on demand. The same session ID always maps to the same persistent state — cloned repositories, installed packages, modified files, and running processes all persist across agent sessions.',
      why: 'Ephemeral execution environments (like UC6\'s Dynamic Workers) are great for isolated code execution but cannot maintain the state an agent needs across a multi-step coding task that spans hours. A persistent sandbox is the agent\'s own workstation — it accumulates context just like a human developer\'s laptop would.',
      activeNodes: ['agent-dev', 'sandbox-api'],
      activeEdges: ['e-dev-api'],
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
    },
    {
      title: 'Sandbox environment starts, resumes, or wakes from snapshot',
      product: 'Cloudflare Sandboxes',
      description: 'The Sandbox environment is a real persistent Linux container with a real filesystem, real shell (PTY), and long-running background processes. Snapshots let the environment checkpoint its state and wake quickly even after an extended sleep period. Active CPU Pricing means idle sandboxes are free — only active compute (CPU wall-clock time) is billed, making it practical to maintain large fleets of dormant agent environments without paying for unused capacity.',
      why: 'Snapshotting solves the cold-start problem for persistent environments: without it, a sandbox that sleeps and wakes would need to reinstall all packages and re-clone all repos from scratch, destroying the value of persistence. Snapshots make the resume fast enough to be practical.',
      activeNodes: ['sandbox-api', 'sandbox-env'],
      activeEdges: ['e-api-env'],
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
    },
    {
      title: 'Agent runs commands, reads/writes files, clones repos',
      product: 'Cloudflare Sandboxes',
      description: 'The agent calls exec("npm", ["test"]) to run the test suite and stream output back in real time; gitCheckout("https://github.com/org/repo") to clone a repository into /workspace; writeFile("/workspace/config.json", content) to modify files; and readFile() to read back results. All operations are available directly from the Worker that created the sandbox — no SSH, no tunnels. exec() output is streamed as it is produced, enabling the agent to react to incremental output rather than waiting for command completion.',
      why: 'Direct API access to filesystem and shell operations removes the request-response transcription overhead of older "tool call → prompt → tool call" loops. The agent can run a test suite, read the failing test output, modify the file, and rerun — all in a tight programmatic loop without re-prompting.',
      activeNodes: ['sandbox-env', 'sandbox-api', 'agent-dev'],
      activeEdges: ['e-env-api', 'e-api-dev'],
      docsUrl: 'https://developers.cloudflare.com/sandbox/api/',
    },
    {
      title: 'PTY terminal and stateful code interpreter',
      product: 'Cloudflare Sandboxes',
      description: 'For interactive workflows, sandbox.terminal() upgrades a WebSocket connection into a full PTY session compatible with xterm.js — output is buffered server-side so reconnecting replays what you missed. For data analysis and scripting, createCodeContext({ language: "python" }) creates a persistent code execution context: variables and imports persist across runCode() calls (like a Jupyter notebook), so the agent can load a CSV in one step and analyze it in the next without re-running setup code. Both Python and JavaScript/TypeScript contexts are supported.',
      why: 'Many code interpreter implementations run each snippet in isolation, discarding state between calls. A stateful context means the agent can build up an analysis session incrementally — load data once, transform it in multiple steps, visualize results — without re-running expensive setup code on every invocation.',
      activeNodes: ['sandbox-api', 'sandbox-env'],
      activeEdges: ['e-api-env', 'e-env-api'],
    },
    {
      title: 'Background processes, filesystem watch, and preview URLs',
      product: 'Cloudflare Sandboxes',
      description: 'The agent calls startProcess("npm run dev") to launch a development server as a background process. It uses waitForLog(/Local:.*localhost:(\\d+)/) to wait for a real readiness signal instead of sleeping blindly. Once ready, exposePort(3000) returns a live public HTTPS URL the agent can share directly with the user for review. sandbox.watch("/workspace/src", { recursive: true }) returns an SSE stream of filesystem change events via Linux inotify — enabling the agent to react to file changes exactly as a human developer would (save a file, rerun the build).',
      why: 'Preview URLs turn the agent from a "code generator" into a "product builder" — it can ship something to a URL and get human feedback in the same conversation. Filesystem watching closes the event-driven development loop that human developers rely on, letting agents participate in build/test cycles rather than just issuing one-shot commands.',
      activeNodes: ['sandbox-env', 'preview-url'],
      activeEdges: ['e-env-preview'],
      docsUrl: 'https://developers.cloudflare.com/sandbox/concepts/preview-urls/',
    },
    {
      title: 'Outbound requests authenticated via egress proxy — zero credential exposure',
      product: 'Cloudflare Sandboxes',
      description: 'When the sandbox makes an outbound request to a private API, the Outbound Workers egress proxy intercepts it. Per-host rules inject credentials (Bearer tokens, API keys, HMAC signatures) at the network layer before the request reaches the destination. The sandbox code never sees the credential value — only the proxy, running in the trusted Worker environment with access to env.SECRET, sees and injects it. Rules can be static (per-hostname in the class definition) or dynamic (modified at runtime based on identity or request context).',
      why: 'Agentic workloads have an authentication paradox: agents need to call private services, but agent code is generated or driven by LLMs and cannot be trusted with raw credentials. Injecting at the network layer means credential leakage through the LLM context is structurally impossible — the sandbox never had the secret to leak.',
      activeNodes: ['sandbox-env', 'outbound-proxy', 'ext-services'],
      activeEdges: ['e-env-proxy', 'e-proxy-ext'],
      docsUrl: 'https://blog.cloudflare.com/sandbox-auth/',
    },
    {
      title: 'Results streamed back — agent iterates or hands off to user',
      product: 'Cloudflare Sandboxes',
      description: 'Command output, code execution results (including matplotlib charts, structured JSON, and Pandas HTML tables), and filesystem event streams are all streamed back to the agent in real time. The agent uses results to iterate — read a failing test, fix the code, rerun the test — or hands off a preview URL and session snapshot to a human user. Snapshots enable session sharing: send a URL, let a colleague fork the session and pick up exactly where the agent left off.',
      why: 'Real-time streaming enables the same tight feedback loops a human developer uses. Without streaming, the agent must wait for a command to complete, losing the ability to react to incremental output (e.g., stopping a long build when it sees the first error).',
      activeNodes: ['sandbox-env', 'sandbox-api', 'agent-dev'],
      activeEdges: ['e-env-api', 'e-api-dev'],
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
    },
  ],
};
