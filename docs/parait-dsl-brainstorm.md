# ParaIT DSL — Custom Terminology for AI Offerings

**Goal:** Own the vocabulary. Terms that are precise, brandable, and avoid the over-promise trap.

**Pattern convention:** `#CategorySpecific` — compound PascalCase prefixed by domain category.

---

## Category 1: Agent Types (What it is)

| Term | Definition | Settled term considered | Verdict |
|------|-----------|----------------------|---------|
| `#TaskAgent` | A bounded AI that executes a defined sequence of steps with tool access and human milestone check-ins. Does one job function well. | "AI Agent" (settled but vague) | Benefit: "Agent" is industry-recognized, prefixing with "Task" adds precision. Low risk. |
| `#ProcessAgent` | A TaskAgent that spans an end-to-end business process (e.g. procure-to-pay). Manages state across steps. | "Workflow Agent" | Benefit: "Process" clarifies business scope vs technical scope. |
| `#OrchestrationAgent` | An agent that coordinates other agents. Delegates, aggregates, routes. No direct task execution. | "Supervisor Agent", "Router Agent" | Benefit: "Orchestration" is precise and widely understood in tech. |
| `#KnowledgeAgent` | An agent specialized in retrieval, synthesis, and explanation from a defined knowledge base. Not for taking action. | "RAG Agent", "Research Agent" | Benefit: "Knowledge" sets appropriate expectations (it knows, it doesn't do). |
| `#MonitorAgent` | An agent that observes systems, data, or processes and alerts on anomalies. Read-only by default. | None settled | Benefit: Clear scope — watches, doesn't touch. |

## Category 2: Deployment & Ownership (Where it lives)

| Term | Definition | Why this over alternatives |
|------|-----------|--------------------------|
| `#SovereignDeploy` | AI infrastructure deployed on customer-owned hardware or dedicated tenancy in Jamaican/regional data centers. Data never leaves jurisdiction. | Matches our positioning. "Sovereign" is loaded but honest. Use it intentionally. |
| `#StackOwnership` | The practice of owning the full inference + memory + tooling stack rather than renting from a single vendor. Prevents lock-in. | Direct response to the vendor lock-in problem. Brandable as a ParaIT principle. |
| `#HybridInference` | Mix of local (on-prem) and cloud inference depending on task sensitivity, latency requirements, and model size. | Industry term "hybrid" + "inference" — clear, no hype. |

## Category 3: Capabilities (What it does)

| Term | Definition | Notes |
|------|-----------|-------|
| `#AgenticTaskMgmt` | Autonomous task decomposition, scheduling, and execution within defined boundaries. | Hal's example. "Task Management" is familiar; "Agentic" prefix signals autonomy level. |
| `#GuidedExecution` | Human-in-the-loop agent workflow. Agent proposes, human approves, agent executes. | Sets expectations clearly. No autonomy ambiguity. |
| `#ContextScaffolding` | The practice of building structured context stores (AGENTS.md, ground-truth docs, memory graphs) that agents consume. Not the agent itself — the environment it needs. | Useful for consulting/services offering. Teaches clients how to prepare for agents. |
| `#VerificationGate` | A mandatory human review step before agent output becomes action. Explicit, not implicit. | Turns a limitation (agents can't be trusted) into a feature (we design for safety). |

## Category 4: Offerings (Products & Services)

| Term | Definition | Maps to |
|------|-----------|---------|
| `#ParaIT Agents` | Umbrella term for all agent products. #TaskAgents for specific business functions. | Digital Employees replacement |
| `#StackWorks` | Infrastructure consulting: assess, design, deploy the agent stack (inference, memory, tooling, governance). | AI Strategy repositioned |
| `#BootstrappedAgent` | Pre-configured #TaskAgent for a common SME function. 2-week deploy, fixed price. | Packaged AI ($4,999) |
| `#AgentReadiness` | Assessment service: what processes can be agentized, what data is needed, what the governance model looks like. | AI Readiness Assessment |

## Category 5: Principles (Marketing language)

| Term | Tagline use |
|------|------------|
| `#OwnYourStack` | Counter-positioning against vendor lock-in. Core ParaIT differentiator. |
| `#SovereignByDefault` | Default deployment is on Jamaican/self-hosted infra. Cloud is opt-in. |
| `#HumansVerify` | Every agent output has a verification gate. Not a bug — a design principle. |

---

## Next Steps

- Some terms overlap or need merging — feedback sharpens them
- The `#hashtag` pattern works for social, docs, and URLs (`/agents/task-agent`)
- For long-term branding, drop the hash and use natural case: "Task Agent", "Sovereign Deploy", "Stack Ownership"
- Settled terms like "AI Agent" stay when precision isn't critical; custom terms come in where we need differentiation
