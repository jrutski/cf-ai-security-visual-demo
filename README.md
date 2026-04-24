# Cloudflare AI - Interactive Visual Demo

An interactive, modular frontend web application that visualizes 20 Cloudflare AI use cases across three categories:

- **[AI Security](src/ai-security.html)** (UC1–7) — how Cloudflare secures AI workloads: governing workforce GenAI usage, protecting AI-powered applications, securing self-hosted agents, and orchestrating safe multi-agent communication.
- **[AI Builder](src/ai-builder.html)** (UC8–14, 17–20) — how to build AI applications on Cloudflare: API key management, dynamic routing, RAG pipelines, voice agents, persistent chat, autonomous scheduling, web-browsing agents, and agentic primitives (persistent memory, sandboxes, email, versioned storage).
- **[AI Optimization](src/ai-optimization.html)** (UC15–16) — how Cloudflare's infrastructure optimizes LLM performance: lossless weight compression and the Infire inference engine.

Each use case features a step-through request-flow diagram showing how requests travel through Cloudflare's stack, with per-step explanations of which product acts and why.

## Use Cases

### Secure AI Usage & Applications

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 1 | **Secure Workforce Use of GenAI** | Gateway, Access, DLP (AI Prompt Protection), RBI, CASB, AI Gateway (Secrets Store, Unified Billing) |
| 2 | **Govern AI Agents** | Access (OAuth 2.1, MCP Server Portals), DLP for MCP, Agents SDK (McpAgent), Workers |
| 3 | **Build Securely with AI** | AI Gateway (Caching, Rate Limiting, Guardrails, DLP, Dynamic Routing, Secrets Store, Unified Billing), Workers |
| 4 | **Protect AI-Powered Apps** | DDoS Protection, Bot Management, WAF (Sensitive Data Detection), Rate Limiting, AI Security for Apps (Custom Topics), API Shield |

### Secure AI Infrastructure & Agents

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 5 | **Secure Self-Hosted AI Agents** | Access, Sandbox SDK, AI Gateway (env.AI binding), Secrets Store, Browser Rendering, R2, Workers |
| 6 | **Secure AI Code Execution** | Dynamic Workers (Worker Loader), Codemode, Workers RPC, AI Gateway, Agents SDK |
| 7 | **Secure AI-to-AI Communication** | Agents SDK (Durable Objects), Access + mTLS, MCP Server Portals, Workflows, AI Search, Queues |

### Developing with AI

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 8 | **API Key Management & Unified Billing** | AI Gateway (BYOK, Secrets Store, Unified Billing, Spend Limits, ZDR, Analytics) |
| 9 | **Dynamic Routing** | AI Gateway (Dynamic Routing, Conditional, Percentage Split, Rate/Budget Limits, BYOK) |

### Building AI Applications

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 10 | **RAG Knowledge Base** | AI Search, Vectorize, Workers AI, Workers |
| 11 | **Voice AI Agent** | Agents SDK (@cloudflare/voice), Workers AI (Whisper STT/TTS), Durable Objects |
| 12 | **Persistent AI Chat Agent** | Agents SDK (AIChatAgent), Durable Objects, SQLite State, Workers AI |
| 13 | **Autonomous Scheduled Agent** | Agents SDK (Schedule), Durable Object Alarms, SQLite, Workers AI |
| 14 | **Web-Browsing AI Agent** | Agents SDK, Browser Rendering (CDP), Workers AI, R2 |

### Agentic Primitives

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 17 | **Agent Memory** | Agent Memory, Agents SDK, Workers |
| 18 | **Cloudflare Sandboxes** | Sandboxes, Outbound Workers (egress proxy), Containers |
| 19 | **Email for Agents** | Email Service, Email Routing, Agents SDK, Durable Objects |
| 20 | **Artifacts: Git-Compatible Versioned Storage** | Artifacts, Git Protocol (HTTPS), Workers |

### AI Infrastructure Optimization

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 15 | **Unweight: LLM Weight Compression** *(Research)* | Workers AI, Infire, Unweight |
| 16 | **Workers AI Inference Engine** | Workers AI, Infire, Prompt Caching, Mooncake (KV cache), EAGLE-3 (speculative decoding) |

## How It Works

Each use case presents an interactive diagram with three spatial columns:

- **Left** - Origin actors (human users, AI agents, devices)
- **Center** - Cloudflare control plane (product-specific nodes)
- **Right** - Destination resources (AI services, APIs, internal apps)

Users can:
- **Play** through the flow automatically or step manually with arrow keys
- **Click any node** to see a tooltip with product description and documentation link
- **Read the side panel** for each step's title, acting product, description, and "why it matters" context

Three primary flow archetypes are visualized:
1. **Human -> AI**: User-initiated requests flowing through Cloudflare controls to AI services (UC1, UC4, UC8, UC9, UC10, UC11, UC12, UC17, UC19)
2. **Agentic AI -> Resources**: AI agent-initiated calls flowing through Cloudflare controls to downstream APIs, data, or tools (UC2, UC5, UC13, UC14, UC18, UC20)
3. **Agent -> Agent**: AI-to-AI orchestration with identity, durable execution, and shared infrastructure (UC6, UC7)
4. **Infrastructure / How It Works**: Internal Cloudflare platform optimizations visualized as a pipeline (UC15, UC16)

## Project Structure

```
src/
  index.html                          Landing page (20 use cases across 3 sections)
  ai-security.html                    AI Security section landing (UC1–7)
  ai-builder.html                     AI Builder section landing (UC8–14, 17–20)
  ai-optimization.html                AI Optimization section landing (UC15–16)
  use-cases/
    uc1-genai-workforce.html          UC1: Secure Workforce Use of GenAI
    uc2-govern-agents.html            UC2: Govern AI Agents (MCP)
    uc3-build-with-ai.html            UC3: Build Securely with AI
    uc4-protect-ai-apps.html          UC4: Protect AI-Powered Apps
    uc5-self-hosted-agents.html       UC5: Secure Self-Hosted AI Agents
    uc6-code-execution.html           UC6: Secure AI Code Execution
    uc7-multi-agent.html              UC7: Secure AI-to-AI Communication
    uc8-unified-billing.html          UC8: API Key Management & Unified Billing
    uc9-dynamic-routing.html          UC9: Dynamic Routing
    uc10-rag.html                     UC10: RAG Knowledge Base
    uc11-voice-agent.html             UC11: Voice AI Agent
    uc12-ai-chat.html                 UC12: Persistent AI Chat Agent
    uc13-scheduled-agent.html         UC13: Autonomous Scheduled Agent
    uc14-browser-agent.html           UC14: Web-Browsing AI Agent
    uc15-unweight.html                UC15: Unweight: LLM Weight Compression
    uc16-inference-engine.html        UC16: Workers AI Inference Engine
    uc17-agent-memory.html            UC17: Agent Memory
    uc18-sandboxes.html               UC18: Cloudflare Sandboxes
    uc19-email-agents.html            UC19: Email for Agents
    uc20-artifacts.html               UC20: Artifacts: Git-Compatible Versioned Storage
  components/
    flow-engine.js                    Shared step-through animation controller
    tooltip.js                        Per-node contextual overlay
    legend.js                         Product legend renderer
  styles/
    base.css                          Reset, typography, utilities
    theme.css                         Design tokens (Cloudflare orange #F38020)
    diagram.css                       Diagram layout, nodes, edges, panel
  data/
    uc1-steps.js                      UC1 nodes, edges, step definitions
    uc2-steps.js                      UC2 nodes, edges, step definitions
    uc3-steps.js                      UC3 nodes, edges, step definitions
    uc4-steps.js                      UC4 nodes, edges, step definitions
    uc5-steps.js                      UC5 nodes, edges, step definitions
    uc6-steps.js                      UC6 nodes, edges, step definitions
    uc7-steps.js                      UC7 nodes, edges, step definitions
    uc8-steps.js                      UC8 nodes, edges, step definitions
    uc9-steps.js                      UC9 nodes, edges, step definitions
    uc10-steps.js                     UC10 nodes, edges, step definitions
    uc11-steps.js                     UC11 nodes, edges, step definitions
    uc12-steps.js                     UC12 nodes, edges, step definitions
    uc13-steps.js                     UC13 nodes, edges, step definitions
    uc14-steps.js                     UC14 nodes, edges, step definitions
    uc15-steps.js                     UC15 nodes, edges, step definitions
    uc16-steps.js                     UC16 nodes, edges, step definitions
    uc17-steps.js                     UC17 nodes, edges, step definitions
    uc18-steps.js                     UC18 nodes, edges, step definitions
    uc19-steps.js                     UC19 nodes, edges, step definitions
    uc20-steps.js                     UC20 nodes, edges, step definitions
wrangler.jsonc                        Cloudflare Workers Static Assets config
package.json
scripts/
  configure.js                        Pre-deploy: replaces SITE_URL across all files
```

## Architecture

- **Vanilla JS** - No frameworks, no build step. ES modules loaded natively in the browser.
- **Modular** - Adding a new use case requires only a new `ucN-steps.js` data file and a new HTML page. Zero changes to the shared engine.
- **FlowEngine** is fully reusable: feed it `{ steps, nodes, edges }` and it renders the complete interactive diagram with SVG edge paths, animated packet dots, and step-through controls.

## Deployment

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jrutski/cf-ai-security-visual-demo)

This project deploys as a purely static site via [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/). No Worker script is needed - Wrangler serves the `src/` directory directly from Cloudflare's edge network.

```jsonc
// wrangler.jsonc
{
  "name": "cf-ai-security-visual-demo",
  "compatibility_date": "2026-03-01",
  "assets": {
    "directory": "./src"
  }
}
```

### Commands

```bash
npm install         # Install dependencies (wrangler)
npm run dev         # Start local development server
npm run configure   # Substitute SITE_URL across all files (see below)
npm run deploy      # Configure domain (if SITE_URL set) then deploy
```

### Deploying Your Own Fork

There are two ways to deploy a fork — choose whichever fits your workflow:

#### Option 1 — "Deploy to Cloudflare" button (easiest)

Click the button above. Cloudflare's web UI will walk you through authenticating and deploying directly from GitHub. No local tooling, no auth tokens, no SSL issues. The domain will default to a `*.workers.dev` subdomain.

#### Option 2 — Local `npm run deploy`

All domain references (canonical URLs, OG meta tags, sitemap, robots.txt, and `wrangler.jsonc` routes) are automatically updated by a pre-deploy script. You never need to edit any HTML or config files manually.

```bash
cp .env.example .env
# Set SITE_URL and CLOUDFLARE_API_TOKEN in .env
npm run deploy
```

**Authentication:** Wrangler needs Cloudflare credentials. Either run `wrangler login` once (opens a browser), or set `CLOUDFLARE_API_TOKEN` in your `.env` file (recommended for automation and corporate networks):

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create a token using the **"Edit Cloudflare Workers"** template
3. Add to `.env`: `CLOUDFLARE_API_TOKEN=your_token_here`

> **Corporate / managed networks:** If `wrangler login` fails with an SSL certificate error, the API token approach bypasses the OAuth flow entirely and resolves the issue.

If `SITE_URL` is not set, the domain configure step is skipped and files remain unchanged.

> **Note:** The `routes` entry in `wrangler.jsonc` binds the Worker to a custom domain in the Cloudflare dashboard. Remove it if deploying to a `*.workers.dev` subdomain instead.

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#F38020` | Cloudflare-like orange - active elements, CTAs |
| Background | `#0d1117` | Dark theme background |
| User nodes | `#3B82F6` | Users, devices |
| Cloudflare nodes | `#F38020` | Cloudflare products |
| AI Service nodes | `#10B981` | External AI providers |
| Resource nodes | `#8B5CF6` | APIs, databases, internal services |
| Coming Soon | `#EAB308` | Features in development |
| Font | Inter / system-sans | |

## OWASP Framework Mappings

Each use case step includes OWASP risk labels in the step info panel, mapping Cloudflare products to the specific threats they mitigate. Two frameworks are referenced:

### OWASP Top 10 for LLMs 2025

The industry-standard risk taxonomy for Large Language Model applications. Labels use the format `LLM01:2025 Prompt Injection`.

- **Official page**: https://genai.owasp.org/llm-top-10/
- **Full document**: https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/

### OWASP Top 10 for Agentic Applications 2026

Covers risks specific to autonomous AI agent systems — tool misuse, identity abuse, supply chain attacks, and cascading failures. Labels use the format `ASI01 Agent Goal Hijack`.

- **Official page**: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

UC2 (Govern AI Agents) and UC7 (Secure AI-to-AI Communication) have the most ASI labels as the primary agentic use cases. UC5 and UC6 map sandbox isolation to ASI05 (Unexpected Code Execution). All use cases include selective labels where applicable threats exist.

## References

> Use [Cloudflare MCP Servers](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/) for better LLM research and accuracy.

**AI Security**
- [Cloudflare AI Security](https://www.cloudflare.com/ai-security/)
- [Holistic AI Security Learning Path](https://developers.cloudflare.com/learning-paths/holistic-ai-security/concepts/)
- [AI Security for Apps](https://developers.cloudflare.com/waf/detections/ai-security-for-apps/)
- [Cloudflare One AI Security Analytics](https://developers.cloudflare.com/cloudflare-one/insights/analytics/ai-security/)

**AI Gateway & Agents**
- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway Worker Binding Methods](https://developers.cloudflare.com/ai-gateway/integrations/worker-binding-methods/)
- [AI Gateway BYOK (Secrets Store)](https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/)
- [AI Gateway Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/)
- [AI Gateway Dynamic Routing](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)
- [Agents SDK](https://developers.cloudflare.com/agents/)
- [AIChatAgent](https://developers.cloudflare.com/agents/api-reference/chat-agents/)
- [Voice Agents](https://developers.cloudflare.com/agents/api-reference/voice/)
- [Schedule Tasks](https://developers.cloudflare.com/agents/api-reference/schedule-tasks/)
- [Browse the Web (Browser Tools)](https://developers.cloudflare.com/agents/api-reference/browse-the-web/)
- [MCP Server Portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)

**Agentic Primitives**
- [Agent Memory](https://developers.cloudflare.com/agents/concepts/memory/)
- [Cloudflare Sandboxes](https://developers.cloudflare.com/sandbox/)
- [Cloudflare Email Service (blog)](https://blog.cloudflare.com/email-for-agents)
- [Artifacts](https://developers.cloudflare.com/artifacts/)
- [Artifacts (blog)](https://blog.cloudflare.com/artifacts-git-for-agents-beta)

**Developer Platform**
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Codemode](https://developers.cloudflare.com/agents/api-reference/codemode/)
- [Workflows](https://developers.cloudflare.com/workflows/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Workers AI Prompt Caching](https://developers.cloudflare.com/workers-ai/features/prompt-caching/)
- [Browser Rendering](https://developers.cloudflare.com/browser-rendering/)

**AI Optimization**
- [Unweight: LLM Weight Compression (blog)](https://blog.cloudflare.com/unweight-tensor-compression/)
- [High-Performance LLMs / Infire (blog)](https://blog.cloudflare.com/high-performance-llms/)

**Infrastructure**
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Ruleset Engine Phases](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)
- [mTLS on Cloudflare](https://developers.cloudflare.com/learning-paths/mtls/concepts/mtls-cloudflare/)
- [Service Tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/)
- [Moltworker Blog Post](https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/)
- [Dynamic Workers Blog Post](https://blog.cloudflare.com/dynamic-workers/)

**OWASP Frameworks**
- [OWASP Top 10 for LLMs 2025](https://genai.owasp.org/llm-top-10/)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)

* * * 

## Disclaimer

**This project is for educational and demonstration purposes only.** 

It is not affiliated with, endorsed by, or officially associated with Cloudflare, Inc. All product names, logos, and brands referenced are property of their respective owners. The information presented in the diagrams is based on publicly available documentation and may not reflect the most current product capabilities or configurations. Always refer to the [official Cloudflare documentation](https://developers.cloudflare.com/) for authoritative and up-to-date information.
