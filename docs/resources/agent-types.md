# Agent Types — What We Build and Why

**Resource:** Service Paradigm Agent Architecture
**Applies to:** Automata (Ax), Hermes Agent (Ha), and all agent-based offerings
**Purpose:** Define what an AI Agent is, how we classify them, and how our commercial brand maps to the engineering reality.

---

## Preamble: What Is an AI Agent?

An AI Agent is not a person. It is not a chatbot. It is not magic.

An AI Agent is a bounded, engineered system composed of:

**Working Environment** (homedir, data, permissions)
\+ **LLM Model** (inference engine)
\+ **Agent Harness** (agent loop + guardrails + system prompt + core tools)
\+ **Tooling Layer** (skills, plugins, MCP servers)

Remove any one of these components and what remains is not an agent — it is a language model generating text in a vacuum.

This definition matters because the industry has stretched the term "AI Agent" to cover everything from a ChatGPT wrapper to a full production system. We do not. When we say "Agent," we mean the full stack above. When we say "Automata," we mean a commercial product built from that stack.

---

## The Taxonomy: Three Layers

We classify agents across three layers — what the system *is*, what role it *plays*, and what product the customer *buys*.

### Layer 1: Engineering Type (What It Is)

| Type | Definition | Example |
|------|-----------|---------|
| **Task Agent** | Bounded, one-function agent. Executes a defined sequence with tool access and human milestone check-ins. | A Collections Desk automaton that chases overdue invoices — one workflow, clear exit criteria. |
| **Process Agent** | Spans an end-to-end business process (e.g. procure-to-pay). Maintains state across steps. | A Procurement Desk that handles vendor selection → PO creation → delivery tracking → invoice matching. |
| **Orchestration Agent** | Coordinates other agents. Delegates subtasks, aggregates results, routes edge cases. Does not execute tasks directly. | A Directorate automaton that monitors Bureau Desks, escalates exceptions, and reports to the human team lead. |
| **Knowledge Agent** | Specialized in retrieval, synthesis, and explanation from a defined knowledge base. Read-only by default. | An agent that answers employee policy questions from a company handbook — it knows, it doesn't act. |
| **Monitor Agent** | Observes systems, data, or processes and alerts on anomalies. Read-only by design. | An agent that watches transaction volumes and flags unusual patterns before they become problems. |

### Layer 2: Commercial Brand (What Customers Buy)

We market agents under the **Automata (Ax)** brand — workshop and industrial terminology that is precise, non-anthropomorphic, and honest about what the technology delivers.

| Brand Category | Engineering Equivalent | What It Does |
|---------------|----------------------|-------------|
| **Directorate** | Orchestration Agent | Strategic coordination. Sets direction, monitors operations, reports. |
| **Bureau** | Task Agent / Process Agent | Back-office operations. Contains specific Desks below. |
| ├── Collections Desk | Task Agent (invoicing) | Payment chasing, reconciliation, reminders. |
| ├── Schedule Desk | Task Agent (scheduling) | Appointment booking, calendar management. |
| ├── Procurement Desk | Process Agent (procure-to-pay) | Vendor selection, PO creation, delivery tracking. |
| └── Resolution Desk | Task Agent (support) | Customer inquiries, escalation, resolution. |
| **Laboratory** | *Environment* (not an agent type) | Research, training, validation before deployment. |
| **Factory** | *Environment* (not an agent type) | Build and deploy pipelines. |
| **Assembly** | Orchestration Agent (multi-agent) | Coordinate multiple Automata across end-to-end workflows. |

### Layer 3: Delivery Form (How It's Packaged)

| Offering | Engineering Basis | Who It's For |
|----------|-----------------|-------------|
| Single Desk Automata | One Task Agent, one workflow | SMEs with a single pain point |
| Multi-Desk Automata | 2–3 Task/Process Agents, shared Bureau | Growing businesses, 2-3 workflows |
| Full Assembly | Multiple agents + Orchestration Agent | Enterprise, multi-process automation |
| Hermes Agent (Ha) | Full agent stack, self-hosted | Organizations running their own agent infrastructure |

---

## Why This Vocabulary?

We do not use "Digital Employee," "AI Colleague," or "Digital Staff." These terms are imprecise and, per the BCG Henderson Institute, actively harmful — they reduce human accountability, lower review quality, and over-promise what the technology delivers.

Instead, we use:

- **Workshop** language (Bureau, Desk, Factory, Assembly) — implies machines and process, not people
- **Capability-prefixed** engineering types (Task Agent, Process Agent, Orchestration Agent) — says what it does, not what it pretends to be
- **Element symbols** (Ax for Automata) — fits the Periodic Table of Elements brand without collision

When you see "Automata" on this site, read: *an AI Agent built on open infrastructure, self-hosted in Jamaica, with a defined task scope and human verification gates.*

---

## Related Resources

- [**Customer Glossary**](/resources/glossary) — Plain-English definitions of every term we use
- [**Automata (Ax)**](/elements/automata) — The Automata Element page
- [**Hermes Agent (Ha)**](/elements/hermes-agent) — Self-hosted agent infrastructure
