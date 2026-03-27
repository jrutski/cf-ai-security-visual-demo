# Cloudflare AI Security - Interactive Visual Demo

An interactive, modular frontend web application that visualizes 7 Cloudflare AI security use cases. Each use case features a step-through request-flow diagram showing how requests travel through Cloudflare's stack, with per-step explanations of which product acts and why.

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
1. **Human -> AI**: User-initiated requests flowing through Cloudflare controls to AI services (UC1, UC4)
2. **Agentic AI -> Resources**: AI agent-initiated calls flowing through Cloudflare controls to downstream APIs, data, or tools (UC2, UC5)
3. **Agent -> Agent**: AI-to-AI orchestration with identity, durable execution, and shared infrastructure (UC6, UC7)

## Project Structure

```
src/
  index.html                          Landing page with 7 use case cards
  use-cases/
    uc1-genai-workforce.html          UC1: Secure Workforce Use of GenAI
    uc2-govern-agents.html            UC2: Govern AI Agents (MCP)
    uc3-build-with-ai.html            UC3: Build Securely with AI
    uc4-protect-ai-apps.html          UC4: Protect AI-Powered Apps
    uc5-self-hosted-agents.html       UC5: Secure Self-Hosted AI Agents
    uc6-code-execution.html           UC6: Secure AI Code Execution
    uc7-multi-agent.html              UC7: Secure AI-to-AI Communication
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
wrangler.jsonc                        Cloudflare Workers Static Assets config
package.json
```

## Architecture

- **Vanilla JS** - No frameworks, no build step. ES modules loaded natively in the browser.
- **Modular** - Adding a new use case requires only a new `ucN-steps.js` data file and a new HTML page. Zero changes to the shared engine.
- **FlowEngine** is fully reusable: feed it `{ steps, nodes, edges }` and it renders the complete interactive diagram with SVG edge paths, animated packet dots, and step-through controls.

## Deployment

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/DavidJKTofan/cf-ai-security-visual-demo)

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
npm run deploy      # Deploy to Cloudflare Workers
```

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
- [Agents SDK](https://developers.cloudflare.com/agents/)
- [MCP Server Portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)

**Developer Platform**
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Codemode](https://developers.cloudflare.com/agents/api-reference/codemode/)
- [Sandbox SDK](https://developers.cloudflare.com/sandbox/)
- [Workflows](https://developers.cloudflare.com/workflows/)
- [AI Search](https://developers.cloudflare.com/ai-search/)

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
