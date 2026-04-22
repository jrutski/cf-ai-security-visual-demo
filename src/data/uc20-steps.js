/**
 * UC20 — Artifacts: Git-Compatible Versioned Storage
 * Git-native versioned storage built for agents, developers, and automations.
 * Create, fork, diff, and time-travel across repos — code, config, session state, or any data.
 *
 * Key capabilities:
 *   - env.ARTIFACTS.import({ source, target }) — clone from GitHub/GitLab or any Git remote
 *   - env.ARTIFACTS.get("name") — get handle to a repo by name
 *   - repo.fork("name", { readOnly? }) — create isolated copy, returns { remote, token }
 *   - remote + token → authenticated HTTPS Git URL usable by any Git client or agent
 *   - Standard Git protocol over HTTPS (push, pull, commit, branch, clone, diff)
 *   - REST API + TypeScript/Python/Go SDKs for non-Git clients
 *   - ArtifactFS for large repositories
 *   - Use cases: source control, session state, config versioning, data versioning
 *
 * Status: Beta
 *
 * References:
 *   https://blog.cloudflare.com/artifacts-git-for-agents-beta
 *   https://developers.cloudflare.com/artifacts/
 */

export const uc20 = {
  id: 'uc20',
  title: 'Artifacts: Git-Compatible Versioned Storage',
  subtitle: 'Git-native versioned repos for agents — import, fork, commit, and time-travel code, config, and session state',

  nodes: [
    // Left column — agent / developer
    {
      id: 'agent-dev',
      label: 'Agent / Developer',
      sublabel: 'Workers binding · REST API · Git client',
      icon: '\u{1F916}',
      type: 'user',
      column: 'left',
      description: 'An AI agent or developer accesses Artifacts through a Workers binding (env.ARTIFACTS), the REST API, or a standard Git client using the authenticated HTTPS remote URL. The Git protocol is the primary interface — agents already know Git deeply from training data, so no new primitives to learn. Cloudflare also provides TypeScript, Python, and Go SDKs and an isomorphic-git integration for agents that prefer a programmatic API over raw Git commands.',
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },

    // Center column — artifacts stack
    {
      id: 'artifacts-binding',
      label: 'Artifacts Binding',
      sublabel: 'env.ARTIFACTS · import / get / fork',
      icon: '\u{1F4E6}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Artifacts',
      description: 'The Artifacts binding provides three primary operations: import() clones a repo from any Git remote (GitHub, GitLab, Bitbucket, or any HTTPS Git URL) into Cloudflare\'s managed storage; get("name") returns a handle to a previously created repo by name; fork("name", options) creates an isolated copy — optionally read-only — that the agent can work with independently. Import is idempotent: re-importing the same source URL will update the repo. All operations are available via Workers binding in Cloudflare Workers, or via the REST API from any language.',
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
    {
      id: 'artifacts-repo',
      label: 'Artifacts Repo',
      sublabel: 'Versioned · immutable history · ArtifactFS',
      icon: '\u{1F4C1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Artifacts',
      description: 'An Artifacts repo is a Git repository managed in Cloudflare\'s global storage, built on ArtifactFS for large-repo scalability. Repos maintain full Git history — every commit is immutable, addressable by SHA, and accessible for diff, blame, and time-travel. Agents can create tens of millions of repos (e.g., one per agent session, one per customer, one per deployment). Repos store any data that benefits from versioning: source code, configuration, session prompts and agent history, dataset snapshots, or generated content.',
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
    {
      id: 'git-protocol',
      label: 'Git Protocol (HTTPS)',
      sublabel: 'Authenticated remote URL for any Git client',
      icon: '\u{1F517}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Artifacts',
      description: 'Every Artifacts repo (and fork) exposes an authenticated HTTPS Git remote URL (remote) and a scoped access token (token). Any standard Git client can use these credentials — git clone, git push, git pull, git diff — without installing any Cloudflare-specific tooling. AI coding agents that know Git (Claude Code, Cursor, OpenCode) can push, pull, and commit to Artifacts repos using standard Git commands. Non-Git clients use the Artifacts REST API or TypeScript/Python/Go SDKs for programmatic access.',
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },

    // Right column — consumers
    {
      id: 'forked-repo',
      label: 'Forked Repo',
      sublabel: 'Isolated · sandboxed · shareable',
      icon: '\u{1F500}',
      type: 'resource',
      column: 'right',
      description: 'A forked repo is an isolated copy of the source repo created at a specific commit. Forks can be read-only (for review or sharing without mutation risk) or read-write (for isolated agent work). Forks return their own authenticated remote URL and token. Cloudflare uses forks internally to share agent sessions: send a URL to a colleague, they fork the session and pick up exactly where you left off. Read-only forks are useful for CI/CD review pipelines, code review agents, or parallel analysis tasks.',
    },
    {
      id: 'git-clients',
      label: 'Git Clients / CI',
      sublabel: 'Any Git tool, CI system, or agent',
      icon: '\u{1F4BB}',
      type: 'resource',
      column: 'right',
      description: 'The authenticated HTTPS remote URL returned by import() or fork() works with any Git client: standard git CLI, GitHub Desktop, VS Code source control, any CI/CD system that speaks Git. AI coding agents (Claude Code, Cursor, OpenCode) can use this URL directly — they speak Git natively and don\'t need Artifacts-specific integration. For environments without Git (serverless functions, Lambda, edge runtimes), the REST API or SDK provide the same capabilities.',
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
  ],

  edges: [
    { id: 'e-dev-binding',   from: 'agent-dev',       to: 'artifacts-binding', label: 'import() / get() / fork()', direction: 'ltr' },
    { id: 'e-binding-repo',  from: 'artifacts-binding',to: 'artifacts-repo',   label: 'Create / update repo',      direction: 'ltr' },
    { id: 'e-repo-git',      from: 'artifacts-repo',  to: 'git-protocol',      label: 'Serve HTTPS remote',        direction: 'ltr' },
    { id: 'e-git-clients',   from: 'git-protocol',    to: 'git-clients',       label: 'push / pull / commit',      direction: 'ltr' },
    { id: 'e-repo-fork',     from: 'artifacts-repo',  to: 'forked-repo',       label: 'fork(readOnly: true)',      direction: 'ltr' },
    { id: 'e-fork-dev',      from: 'forked-repo',     to: 'agent-dev',         label: 'Isolated copy URL',         direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Agent imports a repo from a remote Git source',
      product: 'Cloudflare Artifacts',
      description: 'The agent calls env.ARTIFACTS.import({ source: { url: "https://github.com/org/repo", branch: "main" }, target: { name: "workers-sdk" } }) to clone a repository from GitHub (or any Git remote) into Cloudflare\'s managed storage. Import is idempotent — calling it again on the same source updates the repo. The operation returns a remote URL and token once the clone completes. Artifacts can be created from any HTTPS Git remote, including private repositories when combined with access tokens.',
      why: 'Rather than cloning directly into a Sandbox or an agent\'s memory, Artifacts creates a managed, versioned copy in Cloudflare\'s global storage — immutable history, deduplication, ArtifactFS scaling. This is the source of truth the agent and all its forks will reference.',
      activeNodes: ['agent-dev', 'artifacts-binding'],
      activeEdges: ['e-dev-binding'],
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
    {
      title: 'Artifacts stores a versioned repo in global managed storage',
      product: 'Cloudflare Artifacts',
      description: 'Artifacts creates and manages the repo in Cloudflare\'s global storage, built on ArtifactFS for large-repository scalability. Every commit in the repo\'s history is immutable and addressable by SHA. Repos can store any data that benefits from versioning: source code, per-customer configuration, session prompts and agent conversation history, dataset snapshots, or generated outputs. Cloudflare runs millions of these repos internally — one per agent session — to persist sandbox state and prompt history without block storage.',
      why: 'Block storage (like a persistent disk) is expensive, doesn\'t version, and doesn\'t support forking or sharing. Git objects are content-addressed and deduplicated — two repos that share 80% of their files don\'t store 160% of the data. ArtifactFS scales this to tens of millions of repos.',
      activeNodes: ['artifacts-binding', 'artifacts-repo'],
      activeEdges: ['e-binding-repo'],
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
    {
      title: 'Repo serves an authenticated HTTPS Git remote URL',
      product: 'Cloudflare Artifacts',
      description: 'Every Artifacts repo (including forks) exposes a remote URL and a scoped token. These are standard Git credentials — the remote URL is a valid HTTPS Git endpoint that speaks the Git smart HTTP protocol. Any git clone, git push, or git pull command works without any Cloudflare-specific tooling installed. The token is scoped to the specific repo and can be read-only or read-write, providing least-privilege access for review agents and CI pipelines.',
      why: 'Using standard Git protocol instead of a proprietary API avoids the bootstrap problem: AI models already know Git deeply from training data. The agent can immediately start using push/pull/commit/branch without learning a new API or consuming token budget on new documentation.',
      activeNodes: ['artifacts-repo', 'git-protocol'],
      activeEdges: ['e-repo-git'],
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
    {
      title: 'Agent forks the repo for isolated, sandboxed work',
      product: 'Cloudflare Artifacts',
      description: 'The agent calls repo.fork("workers-sdk-review", { readOnly: true }) to create an isolated copy at the current HEAD commit. The fork gets its own remote URL and token. Read-only forks prevent the agent from accidentally modifying the source while still giving it full read access to history, diffs, and file contents. Read-write forks let the agent work independently — making commits, creating branches, running CI — without affecting the source repo until an explicit merge.',
      why: 'Forking is the right primitive for agentic work: the agent gets a safe playground that is structurally isolated from production without duplicating storage (Git objects are shared). Multiple agents can fork the same repo concurrently — for parallel code review, multiple analysis tracks, or A/B experimentation — without any coordination.',
      activeNodes: ['artifacts-repo', 'forked-repo'],
      activeEdges: ['e-repo-fork'],
    },
    {
      title: 'Any Git client uses the authenticated remote URL',
      product: 'Cloudflare Artifacts',
      description: 'The remote URL and token returned by import() or fork() work with any standard Git client: git CLI, VS Code, GitHub Desktop, any CI system. AI coding agents (Claude Code, Cursor, OpenCode) can push commits and pull updates using the same Git commands they already know. For environments without Git (serverless functions, edge runtimes, Lambda), the REST API and TypeScript/Python/Go SDKs provide the same commit/read/diff operations with a simple programmatic API.',
      why: 'Universal compatibility means no integration tax. The agent already knows git push. CI already knows git clone. No new SDK to install, no new CLI to learn, no new protocol to document. Any system that speaks HTTPS Git can participate in the versioning workflow.',
      activeNodes: ['git-protocol', 'git-clients'],
      activeEdges: ['e-git-clients'],
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
    {
      title: 'Forked session shared for collaboration or review',
      product: 'Cloudflare Artifacts',
      description: 'Cloudflare uses Artifacts internally to persist the state of every agent coding session: filesystem state and prompt history are committed to a per-session repo after each turn. This enables session sharing: send a colleague the fork URL and they can resume from exactly that point in the conversation and filesystem state. Read-only forks let reviewers inspect agent work without mutation risk. The fork URL is the collaboration primitive — no special access provisioning, no shared state conflicts.',
      why: 'Session persistence and sharing solve two critical pain points in agentic workflows: (1) long-running tasks interrupted by disconnects or failures can resume from the last committed checkpoint; (2) debugging agent behavior requires being able to reproduce the exact state at the moment of failure — which is exactly what a committed fork provides.',
      activeNodes: ['forked-repo', 'agent-dev'],
      activeEdges: ['e-fork-dev'],
    },
    {
      title: 'Agent commits, diffs, and time-travels through history',
      product: 'Cloudflare Artifacts',
      description: 'The agent uses standard Git operations to manage versioned state: git commit stores code, configuration, or session data with a human-readable message; git diff shows exactly what changed between any two commits; git log provides a full audit trail; git checkout rolls back to any previous state. For non-source-control use cases — per-customer config versioning, dataset snapshots, generated content archives — the same Git semantics apply without any schema or API changes. The REST API provides these operations as JSON calls for agents that prefer programmatic access.',
      why: 'Git\'s data model was designed for exactly the problem agents face: tracking state over time, reverting bad changes, understanding what changed and when, forking from any point. Using Git as the versioned storage model for agent session state means this entire ecosystem of tooling — diff viewers, blame, log, bisect — applies to agent debugging for free.',
      activeNodes: ['agent-dev', 'artifacts-binding', 'artifacts-repo'],
      activeEdges: ['e-dev-binding', 'e-binding-repo'],
      docsUrl: 'https://developers.cloudflare.com/artifacts/',
    },
  ],
};
