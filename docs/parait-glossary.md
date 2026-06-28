# ParaIT Glossary — Agent Terminology

**Purpose:** Define our own vocabulary with precision. These terms replace industry hype-language. They are what we mean when we talk about what we build.

---

## A

**AI Agent**
An autonomous system composed of: Working Environment (homedir, data, permissions) + LLM Model (inference engine) + Agent Harness (agent loop + guardrails + system prompt + core tools) + Tooling (skills, plugins, MCP servers). An AI Agent handles tasks, not jobs. It requires guardrails, human-in-the-loop verification, and a defined tool scope. Without these, it is unreliable.

**Agent Harness**
The runtime layer that wraps an LLM model with: execution loop, guardrails, system prompt, core toolset, and a tooling interface for skills/plugins/MCP. The harness is where safety, limits, and governance are enforced. It is not optional.

**Agentic Task Management (#AgenticTaskMgmt)**
Autonomous decomposition, scheduling, and execution of a defined task sequence within bounded scope. The agent selects tools and iterates on output. Human reviews at milestone gates.

---

## B

**Bootstrapped Agent**
A pre-configured AI Agent for a common business function. Delivered in 2 weeks at a fixed price. Includes working environment, harness configuration, and one trained task loop.

---

## G

**Guided Execution**
A human-in-the-loop agent workflow. The agent proposes a plan, the human approves it, the agent executes, the human verifies the result. No autonomy ambiguity.

---

## H

**Harness Engineering**
The discipline of designing environments, constraints, and feedback loops that make AI agents reliable in production. Distinct from prompt engineering (which optimizes the model's input) and context engineering (which optimizes the context window). Harness engineering optimizes the entire runtime infrastructure around the model.

**Harness Washing**
Calling a prompt template, tool collection, or simple automation an "agent harness" when it lacks runtime execution, guardrails, or observability. Analogous to "AI washing" — applying a trendy label to something that doesn't meet the definition.

**Hybrid Inference**
Mixed deployment of inference workloads across local (on-prem, self-hosted) and cloud infrastructure, selected per-task based on sensitivity, latency, and model size.

---

## M

**Meta-Governance**
The use of AI governance agents to monitor, evaluate, and intervene in the behavior of operational AI agent fleets. A layered architecture: operational agents execute tasks, governance agents enforce policy, humans set policy and review exceptions. Addresses the "Three-Way Governance Dilemma" — human governance is too slow, static policy cannot adapt, and agent self-governance lacks accountability.

---

## O

**Orchestration Agent**
An agent that coordinates other agents. Delegates subtasks, aggregates results, routes edge cases. Does not execute tasks directly.

---

## P

**Process Agent**
A Task Agent that spans an end-to-end business process (e.g. procure-to-pay, order-to-cash). Maintains state across steps and hands off between sub-agents.

**Policy-as-Code**
Encoding governance rules as executable policies that the agent harness enforces at runtime, rather than as static documents or training guidelines. The practical answer to "how do you govern something that acts autonomously?" — you don't govern the agent's decisions, you govern the harness that constrains them.

---

## S

**Sovereign Deploy (#SovereignDeploy)**
AI infrastructure deployed on customer-owned hardware or dedicated tenancy in Jamaican/regional data centers. Data never leaves jurisdiction. The default deployment model, not a premium option.

**Stack Ownership**
The practice of owning the full inference + memory + tooling stack rather than renting from a single vendor. Prevents lock-in, enables vendor pivots, and preserves bargaining power.

**Skill Issue**
An agent failure caused by harness configuration, not model capability. The agent didn't know a convention because nobody wrote it down as a skill. The agent used the wrong tool because the skill didn't specify which tool to use. The "skill issue" reframe (HumanLayer, 2026) treats every failure as an opportunity to tighten the harness.

---

## T

**Task Agent**
A bounded AI Agent that executes a defined sequence of steps with tool access and human milestone check-ins. Does one function well. The basic unit of agent deployment.

**Tooling Layer**
The set of capabilities an agent can call: skills (reusable procedures), plugins (third-party integrations), and MCP servers (external tool protocols). The tooling layer defines what the agent is allowed to do.

---

## V

**Verification Gate**
A mandatory human review step before agent output becomes action. Explicit, not implicit. Built into the harness, not left to the agent's judgment.
