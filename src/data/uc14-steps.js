/**
 * UC14 — Web-Browsing AI Agent
 * Give AI agents full Chrome DevTools Protocol (CDP) access via Browser Rendering
 * and the @cloudflare/codemode browser tools integration.
 *
 * Capabilities:
 *   - Inspect DOM structure, computed styles, accessibility tree
 *   - Scrape structured data from rendered JavaScript-heavy pages
 *   - Capture screenshots and PDFs (stored in R2)
 *   - Profile Core Web Vitals, network waterfalls, JS performance
 *   - Execute JavaScript in page context (cdp.send)
 *   - Debug frontend issues — console errors, network requests
 *
 * References:
 *   https://developers.cloudflare.com/agents/api-reference/browse-the-web/
 *   https://developers.cloudflare.com/browser-rendering/
 *   https://developers.cloudflare.com/agents/
 */

export const uc14 = {
  id: 'uc14',
  title: 'Web-Browsing AI Agent',
  subtitle: 'Give AI agents full Chrome DevTools Protocol access via Browser Rendering',

  nodes: [
    // Left column — user / orchestrator
    {
      id: 'user-request',
      label: 'User / Orchestrator',
      sublabel: 'Natural language task',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'A user, developer, or parent orchestrator sends a natural language web task to the AI Agent: "Extract all product prices from this page", "Take a screenshot of the homepage and summarize visual issues", "Monitor this competitor\'s pricing page daily", or "Test whether this form submits correctly". The agent determines which browser tools to use autonomously.',
    },
    // Center column — agent + browser pipeline
    {
      id: 'ai-agent',
      label: 'AI Agent',
      sublabel: 'Agents SDK, reasoning + tool loop',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Agents SDK',
      description: 'The Agent (Durable Object) runs a ReAct-style reasoning loop: observe the task, select a browser tool (navigate, screenshot, extract, scrape), observe the result, reason about next steps, repeat. State (current URL, extracted data, task progress) is persisted to SQLite across turns. The agent can use MCP servers or call external APIs alongside browser tools.',
      docsUrl: 'https://developers.cloudflare.com/agents/',
    },
    {
      id: 'browser-tools',
      label: 'Browser Tools',
      sublabel: '@cloudflare/codemode CDP integration',
      icon: '\u{1F9F0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Browser Tools)',
      description: 'createBrowserTools() from @cloudflare/codemode exposes a set of LLM-callable tools: navigate to URL, get page content (DOM/text), screenshot, PDF export, execute JavaScript, inspect accessibility tree, get network log, and raw CDP access via cdp.send(). Tools are passed to streamText() and invoked automatically by the LLM during the reasoning loop.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/browse-the-web/',
    },
    {
      id: 'browser-rendering',
      label: 'Browser Rendering',
      sublabel: 'Headless Chrome, full JS execution',
      icon: '\u{1F310}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Browser Rendering',
      description: 'Cloudflare Browser Rendering provides managed headless Chrome instances accessible via a Workers binding (env.BROWSER). Pages render with full JavaScript execution — React, Vue, Angular, and other SPA frameworks are fully rendered before content extraction. CDP access via the puppeteer-core-compatible API or raw cdp.send() enables any browser automation action.',
      docsUrl: 'https://developers.cloudflare.com/browser-rendering/',
    },
    {
      id: 'llm-reason',
      label: 'LLM Reasoning',
      sublabel: 'Tool selection, content analysis',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers AI',
      description: 'The LLM drives the agent\'s reasoning loop: given the task and current browser state (page content, screenshot description, previous tool results), it decides which tool to call next. For content analysis (extract prices, summarize visual layout, identify errors), the LLM processes the DOM or screenshot output. Workers AI on-network or external providers via AI Gateway.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    // Right column — web targets + artifact storage
    {
      id: 'target-web',
      label: 'Target Websites',
      sublabel: 'Any public or internal URL',
      icon: '\u{1F30D}',
      type: 'resource',
      column: 'right',
      description: 'The Browser Rendering instance navigates to any URL — public websites, internal applications, localhost (for development testing), or Cloudflare-hosted pages. JavaScript-heavy SPAs, pages behind auth (via cookie injection), and dynamically loaded content are fully supported since the full Chrome rendering engine executes the page.',
    },
    {
      id: 'artifacts',
      label: 'R2 / Artifacts',
      sublabel: 'Screenshots, PDFs, extracted data',
      icon: '\u{1F5BC}',
      type: 'resource',
      column: 'right',
      description: 'Screenshots and PDFs captured by the agent are stored in R2 for persistent access. Extracted structured data (prices, contacts, content) can be written to D1, KV, or R2. The agent can store intermediate results in its own SQLite state for multi-step scraping tasks. R2 provides durable, globally accessible artifact storage at no egress cost.',
      docsUrl: 'https://developers.cloudflare.com/r2/',
    },
  ],

  edges: [
    { id: 'e-user-agent',      from: 'user-request',      to: 'ai-agent',          label: 'Web task',             direction: 'ltr' },
    { id: 'e-agent-tools',     from: 'ai-agent',          to: 'browser-tools',     label: 'Tool invocation',      direction: 'ltr' },
    { id: 'e-tools-rendering', from: 'browser-tools',     to: 'browser-rendering', label: 'CDP commands',         direction: 'ltr' },
    { id: 'e-rendering-web',   from: 'browser-rendering', to: 'target-web',        label: 'HTTP / navigate',      direction: 'ltr' },
    { id: 'e-web-rendering',   from: 'target-web',        to: 'browser-rendering', label: 'Rendered page',        direction: 'rtl' },
    { id: 'e-rendering-tools', from: 'browser-rendering', to: 'browser-tools',     label: 'DOM / screenshot',     direction: 'rtl' },
    { id: 'e-tools-llm',       from: 'browser-tools',     to: 'llm-reason',        label: 'Tool results',         direction: 'ltr' },
    { id: 'e-llm-tools',       from: 'llm-reason',        to: 'browser-tools',     label: 'Next tool call',       direction: 'rtl' },
    { id: 'e-tools-artifacts', from: 'browser-tools',     to: 'artifacts',         label: 'Store screenshot/data', direction: 'ltr' },
    { id: 'e-agent-user',      from: 'ai-agent',          to: 'user-request',      label: 'Task result',          direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Web task sent to AI Agent',
      product: 'Cloudflare Agents SDK',
      description: 'The user sends a natural language web task to the Agent Worker: extract data from a page, take a screenshot, test a form, monitor a URL for changes, or debug a frontend issue. The agent stores the task in SQLite and begins the reasoning loop — deciding which browser tools to invoke to complete the task.',
      why: 'Natural language task specification means you describe the goal, not the steps. The agent determines the correct sequence of browser actions autonomously — adapting when pages change without requiring updated scraping rules.',
      activeNodes: ['user-request', 'ai-agent'],
      activeEdges: ['e-user-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/',
    },
    {
      title: 'Browser tools configured and invoked',
      product: 'Agents SDK (Browser Tools)',
      description: 'createBrowserTools() from @cloudflare/codemode creates a set of LLM-callable tools bound to the Browser Rendering instance. Available tools: navigate, getPageContent (full DOM text), screenshot (base64 PNG), exportPDF, executeScript, getAccessibilityTree, getNetworkLog, and raw cdp.send() for any CDP method. Tools are passed to streamText() and invoked by the LLM as needed.',
      why: 'LLM-callable browser tools bridge natural language reasoning to precise browser automation — the agent decides what to do and the tools provide the exact CDP primitives to do it.',
      activeNodes: ['ai-agent', 'browser-tools'],
      activeEdges: ['e-agent-tools'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/browse-the-web/',
    },
    {
      title: 'Headless Chrome renders the target page',
      product: 'Cloudflare Browser Rendering',
      description: 'Browser Tools issue CDP commands to the managed headless Chrome instance via the Browser Rendering binding (env.BROWSER). The Chrome instance navigates to the target URL and renders the full page — executing JavaScript, loading dynamic content, running SPA frameworks. For pages requiring authentication, cookies or localStorage can be injected before navigation.',
      why: 'Full JavaScript rendering is essential for modern web applications. Without it, scrapers and automation tools only see skeleton HTML — React, Vue, and Angular apps require full JS execution to expose their actual content.',
      activeNodes: ['browser-tools', 'browser-rendering'],
      activeEdges: ['e-tools-rendering'],
      docsUrl: 'https://developers.cloudflare.com/browser-rendering/',
    },
    {
      title: 'Page fetched — DOM and content extracted',
      product: 'Cloudflare Browser Rendering',
      description: 'The Browser Rendering instance fetches the target page, executes all JavaScript, and exposes the rendered DOM via CDP. Browser Tools extract page content in the most useful format for the task: full DOM text for content analysis, accessibility tree for form interactions, network log for performance debugging, or raw CDP responses for advanced scenarios.',
      why: 'CDP access to the live rendered DOM gives the agent the same view of the page as a human browser user — including dynamically generated content, computed styles, and JavaScript-driven state.',
      activeNodes: ['browser-rendering', 'target-web'],
      activeEdges: ['e-rendering-web', 'e-web-rendering', 'e-rendering-tools'],
      docsUrl: 'https://developers.cloudflare.com/browser-rendering/',
    },
    {
      title: 'LLM analyzes browser output',
      product: 'Cloudflare Workers AI',
      description: 'Browser tool results (page content, screenshot description, DOM excerpts) are returned to the LLM for analysis. The LLM extracts structured data (prices, contacts, form fields), identifies visual issues (layout bugs, missing elements, accessibility violations), or determines the next browser action needed. Workers AI or an external LLM via AI Gateway processes the content.',
      why: 'LLM-powered content analysis eliminates brittle CSS selectors and XPath expressions — the agent understands the semantic meaning of page content and extracts what you asked for even when the page layout changes.',
      activeNodes: ['browser-tools', 'llm-reason'],
      activeEdges: ['e-tools-llm', 'e-llm-tools'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'Screenshots and data stored in R2',
      product: 'Cloudflare Browser Rendering',
      description: 'Screenshots (PNG) and PDF exports are stored in R2 for persistent, globally accessible artifact storage. Extracted structured data can be written to D1, KV, or R2 depending on access patterns. For monitoring use cases (run on a schedule via UC13), the agent compares the current screenshot or extracted data against a previous version stored in R2 to detect changes.',
      why: 'R2 storage for browser artifacts enables powerful workflows: visual regression testing (diff screenshots), competitive intelligence archives, regulatory compliance snapshots, and web monitoring baselines — all with zero egress fees.',
      activeNodes: ['browser-tools', 'artifacts'],
      activeEdges: ['e-tools-artifacts'],
      docsUrl: 'https://developers.cloudflare.com/r2/',
    },
    {
      title: 'Task result returned to user',
      product: 'Cloudflare Agents SDK',
      description: 'When the LLM determines the task is complete, the Agent returns the final result: extracted data, summary, screenshot URL, test outcome, or monitoring report. For multi-step tasks, intermediate results are stored in SQLite and available to subsequent calls. The full browser interaction log (tools called, pages visited, data extracted) is persisted in the agent\'s state.',
      why: 'Fully autonomous web task completion with a single natural language instruction reduces complex web automation to a conversation — no scraping code, no selector maintenance, no brittle automation scripts to update when pages change.',
      activeNodes: ['ai-agent', 'user-request'],
      activeEdges: ['e-agent-user'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/browse-the-web/',
    },
  ],
};
