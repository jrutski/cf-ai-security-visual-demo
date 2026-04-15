/**
 * UC13 — Autonomous / Scheduled Agent
 * Build agents that schedule their own work — delayed, datetime, cron, or interval —
 * using Durable Object alarms and SQLite-persisted task queues.
 *
 * Four scheduling modes:
 *   - Delayed: schedule(60, "taskName", payload) — runs in N seconds
 *   - Datetime: schedule(new Date("2025-06-01T09:00:00Z"), "taskName", payload)
 *   - Cron: schedule("0 8 * * *", "taskName", payload) — runs on cron expression
 *   - Interval: scheduleEvery(30, "taskName", payload) — recurring every N seconds
 *
 * References:
 *   https://developers.cloudflare.com/agents/api-reference/schedule-tasks/
 *   https://developers.cloudflare.com/agents/
 *   https://developers.cloudflare.com/workers-ai/
 */

export const uc13 = {
  id: 'uc13',
  title: 'Autonomous Scheduled Agent',
  subtitle: 'Build agents that schedule and execute their own work — delayed, cron, interval, or AI-planned',

  nodes: [
    // Left column — triggers
    {
      id: 'user-trigger',
      label: 'User / Application',
      sublabel: 'HTTP request, initial instruction',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'A user or calling application sends an HTTP request to the Agent Worker to initiate a task or give an instruction — e.g., "Send a weekly digest every Monday at 8am" or "Retry this job in 30 minutes". The agent processes the instruction, registers the appropriate schedule, and immediately returns — the actual work runs asynchronously at the scheduled time.',
    },
    {
      id: 'llm-planner',
      label: 'LLM Planner',
      sublabel: 'AI-assisted schedule extraction',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'left',
      description: 'For natural language scheduling instructions ("send the report next Tuesday at 9am"), the Agents SDK provides getSchedulePrompt() to generate a system prompt that instructs the LLM to extract a structured schedule (delay/datetime/cron/interval) from free-text. The scheduleSchema (Zod) validates the LLM output before the schedule is registered.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    // Center column — Agent scheduling and execution
    {
      id: 'agent',
      label: 'Agent',
      sublabel: 'Durable Object, persistent state',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Agents SDK',
      description: 'The Agent is a Durable Object with the full Agents SDK. It receives the initial instruction, registers schedules via this.schedule() or this.scheduleEvery(), and stores all scheduled tasks in SQLite. The agent instance hibernates between executions — it consumes no CPU or memory while waiting — and is woken by Durable Object alarms at exactly the right time.',
      docsUrl: 'https://developers.cloudflare.com/agents/',
    },
    {
      id: 'task-scheduler',
      label: 'Task Scheduler',
      sublabel: 'SQLite task store + DO alarms',
      icon: '\u23F2',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Schedule)',
      description: 'Tasks are stored in a SQLite table within the Durable Object and triggered via Durable Object alarms — the platform wakes the agent at precisely the scheduled time. Four scheduling modes: delayed (N seconds from now), datetime (specific UTC timestamp), cron (cron expression), and interval (every N seconds). Schedules survive agent restarts, deploys, and hibernation.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    {
      id: 'task-runner',
      label: 'Task Runner',
      sublabel: 'Named callbacks, retry, backoff',
      icon: '\u25B6',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Schedule)',
      description: 'When a Durable Object alarm fires, the Task Runner invokes the named callback method on the Agent class with the stored payload. The agent can call any service from within the callback: AI inference (Workers AI, external LLMs), external APIs, Cloudflare bindings (R2, D1, KV, Queues), or even schedule follow-on tasks. Exponential backoff retry patterns can be implemented with reschedule-from-callback.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    // Right column — downstream systems
    {
      id: 'workers-ai-task',
      label: 'Workers AI',
      sublabel: 'AI inference within scheduled tasks',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'right',
      description: 'Scheduled task callbacks can run AI inference — summarizing overnight data, classifying incoming documents, generating reports — via Workers AI (on-network, zero egress) or external providers via AI Gateway. The agent wakes up, calls the LLM with fresh data, stores the result, and goes back to sleep.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'ext-services',
      label: 'External Services',
      sublabel: 'APIs, notifications, databases',
      icon: '\u{1F4E6}',
      type: 'resource',
      column: 'right',
      description: 'Task callbacks have full access to outbound HTTP, Cloudflare Queues (async handoff), R2 (file storage and retrieval), D1 (relational data), KV (fast reads), and any external API. Examples: daily digest emails via SendGrid, Slack notifications, database backups, webhook triggers, or report uploads to R2.',
    },
  ],

  edges: [
    { id: 'e-user-agent',       from: 'user-trigger',    to: 'agent',          label: 'Initial instruction',    direction: 'ltr' },
    { id: 'e-llm-agent',        from: 'llm-planner',     to: 'agent',          label: 'Parsed schedule',        direction: 'ltr' },
    { id: 'e-agent-scheduler',  from: 'agent',           to: 'task-scheduler', label: 'this.schedule()',        direction: 'ltr' },
    { id: 'e-scheduler-runner', from: 'task-scheduler',  to: 'task-runner',    label: 'DO alarm fires',         direction: 'ltr' },
    { id: 'e-runner-wai',       from: 'task-runner',     to: 'workers-ai-task', label: 'AI inference',          direction: 'ltr' },
    { id: 'e-runner-ext',       from: 'task-runner',     to: 'ext-services',   label: 'API / notification',     direction: 'ltr' },
    { id: 'e-runner-scheduler', from: 'task-runner',     to: 'task-scheduler', label: 'Reschedule / retry',     direction: 'rtl' },
    { id: 'e-runner-user',      from: 'task-runner',     to: 'user-trigger',   label: 'Result / callback',      direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Instruction received — schedule registered',
      product: 'Cloudflare Agents SDK',
      description: 'The user or application sends an HTTP request to the Agent Worker with an instruction. The agent registers the appropriate schedule via this.schedule() (delayed, datetime, or cron) or this.scheduleEvery() (recurring interval). The task is stored in SQLite with the callback name and serialized payload. The agent returns immediately — task execution is fully asynchronous.',
      why: 'Decoupling task registration from execution means the calling application gets an immediate response and continues — no long-running HTTP connections, no polling. The agent owns the execution timeline.',
      activeNodes: ['user-trigger', 'agent'],
      activeEdges: ['e-user-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    {
      title: 'Natural language scheduling via LLM',
      product: 'Agents SDK (Schedule)',
      description: 'For free-text scheduling instructions ("send the report every Monday at 9am"), getSchedulePrompt() generates a structured prompt that instructs the LLM to extract scheduling intent. The LLM output is validated against scheduleSchema (Zod) to produce a typed schedule object (type: "cron", value: "0 9 * * 1") before this.schedule() is called. Any LLM can be used for this extraction step.',
      why: 'Natural language scheduling makes agent configuration accessible to non-technical users — they describe what they want in plain English and the agent translates it to a precise schedule.',
      activeNodes: ['llm-planner', 'agent'],
      activeEdges: ['e-llm-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    {
      title: 'Tasks persisted in SQLite with DO alarms',
      product: 'Agents SDK (Schedule)',
      description: 'Registered schedules are stored in a SQLite table in the Durable Object with their type, trigger time, callback name, and payload. The Durable Object alarm subsystem manages waking the agent at the right time — there is no external cron service, no polling loop, no always-on process. The agent hibernates between executions, consuming zero CPU and memory. Schedules survive restarts and deploys.',
      why: 'DO alarm-backed persistence means scheduled tasks can\'t be lost. The platform is responsible for delivery — even if the agent is replaced, the alarm fires and the task runs.',
      activeNodes: ['agent', 'task-scheduler'],
      activeEdges: ['e-agent-scheduler'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    {
      title: 'Durable Object alarm fires — task executed',
      product: 'Agents SDK (Schedule)',
      description: 'At the scheduled time, the Cloudflare platform fires a Durable Object alarm, waking the agent. The Task Runner retrieves all due tasks from SQLite and invokes the named callback methods in order with their stored payloads. Multiple due tasks are executed in sequence. The agent has full access to all Worker bindings (AI, R2, D1, KV, Queues, Fetch) during callback execution.',
      why: 'DO alarms are a fundamental Cloudflare primitive — they are guaranteed to fire even if the agent hibernated, were deployed, or the request that registered them completed long ago. This is serverless scheduling with durable delivery.',
      activeNodes: ['task-scheduler', 'task-runner'],
      activeEdges: ['e-scheduler-runner'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    {
      title: 'AI inference within scheduled task',
      product: 'Cloudflare Workers AI',
      description: 'Callbacks can run AI inference as part of their work — summarizing new data since the last run, classifying incoming documents, generating personalized digests, or running a reasoning loop. Workers AI (on-network, zero egress) keeps inference costs low for recurring tasks. AI Gateway adds caching so identical scheduled summarizations served from cache.',
      why: 'AI-powered scheduled tasks create a new category: agents that continuously monitor, analyze, and act on data without a human initiating each run. Examples: nightly data quality checks, hourly market summaries, weekly personalized reports.',
      activeNodes: ['task-runner', 'workers-ai-task'],
      activeEdges: ['e-runner-wai'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      title: 'External services called — results stored',
      product: 'Agents SDK (Schedule)',
      description: 'The task callback sends notifications (email, Slack, SMS), writes results to R2 or D1, pushes events to Queues for downstream processing, or calls external webhooks. Results are stored in the agent\'s SQLite state, making them available to subsequent LLM calls or to the user when they next query the agent.',
      why: 'Combining scheduled AI reasoning with external service calls enables fully autonomous agentic workflows — the agent wakes up, thinks, acts, stores results, and notifies stakeholders without any human initiation.',
      activeNodes: ['task-runner', 'ext-services'],
      activeEdges: ['e-runner-ext'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
    {
      title: 'Reschedule, retry, or self-destruct',
      product: 'Agents SDK (Schedule)',
      description: 'From within a callback, the agent can reschedule itself (shift a future task), schedule a follow-on task, implement exponential backoff retry on failure, or cancel all schedules (self-destructing agent). The rescheduling pattern enables adaptive agents that adjust their own schedule based on outcomes — e.g., backing off on API rate limit errors, accelerating when new data arrives.',
      why: 'Self-managed scheduling makes agents truly autonomous — they can adapt their own execution timeline based on runtime conditions without any external orchestration layer.',
      activeNodes: ['task-runner', 'task-scheduler'],
      activeEdges: ['e-runner-scheduler'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/schedule-tasks/',
    },
  ],
};
