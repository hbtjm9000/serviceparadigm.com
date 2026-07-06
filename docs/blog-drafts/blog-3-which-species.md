# Which Species for Which Job? Mapping Agent Architectures to Real Work

Not all L3 agents are the same. Deploying the wrong architecture guarantees failure — regardless of the model or the prompt.

I learned this the hard way. Last year I tried to run a content pipeline through a coding harness — the same architecture that handles individual code tasks beautifully. It was a disaster. The harness was designed for a human reviewing one output at a time, not for processing 500 pieces of content in a batch. I was using the right autonomy level and the wrong species. The result was a tool that worked perfectly for the wrong job.

After studying production deployments across dozens of teams, researcher Nate Jones identified four distinct [agent species](/resources/agent-types). Each is built for a different kind of work. Two systems can both be L3 — fully autonomous, tool-using, iterative — and still fail if one is deployed where the other belongs. Here's the framework I use now.

---

**Species 1: Coding Harness**

The human acts as manager. The agent acts as engineer. You set the task, the agent produces output, you judge the work.

This is the most mature species on the market. Boris Cherny says "coding is solved" — 27 PRs a day from his phone. That's a coding harness at work. Peter Steinberger pushed this further with OpenClaw: running multiple coding harnesses in parallel, each on 20-minute agent cycles, with human review at output. The agent doesn't need to see the whole picture. It needs a bounded task and a clear success criteria.

**Best for:** Individual contributor work, bounded coding tasks, anything where a human can judge quality at the output boundary.

**Key trait:** Single-threaded by default. The human is in the loop at the judgment layer, not at every step. Scaling means running multiple harnesses in parallel, not making one harness more complex.

---

**Species 2: Dark Factory**

A spec goes in. Software comes out. No human reviews intermediate outputs.

This is the assembly line model. You write excellent non-functional requirements, define evaluation criteria, and let the pipeline run. The agent optimizes against your specifications, not against your attention. Human involvement happens at two points: writing the spec and reviewing the evals.

**Best for:** Well-specified, bounded, repetitive production work — automated code migration, bulk refactoring, content pipelines where the format is predictable.

**The risk** is the [3% problem](/insights/blog-2-three-percent-problem) magnified. A dark factory producing 10,000 outputs at 97% correctness creates 300 failures that no human reviewed. This is acceptable only when failures are low-cost or when automated evals catch them before they reach production.

If you can't afford 300 silent failures, this species isn't for you. If your evals are battle-tested and your rollback is reliable, it's the most efficient species available.

---

**Species 3: Auto Research**

Descended from classical machine learning. The agent hill-climbs against a metric — optimizing conversion rate, code quality score, response accuracy, or any quantifiable target.

This is where the "is my problem metric-shaped or software-shaped?" question becomes critical. Auto research only works when success can be measured numerically. If you can't define a metric, you're not doing auto research — you're doing something else and calling it optimization.

**Best for:** A/B test optimization, prompt tuning, hyperparameter search, any problem with a clear score and a large search space.

**Key trait:** The agent iterates autonomously, trying variants and measuring results. Better? Keep. Worse? Discard. Try next. No human judgment required at the iteration level — just at the objective-setting level.

---

**Species 4: Orchestration Framework**

Multiple agents lined up with a coordination layer handing work between them. Writer → editor. Researcher → drafter. Planner → executor.

This is the most complex species and the most commonly over-deployed. The art is finding simple configurations that chain — not building the most sophisticated multi-agent system you can. Jones's rule applies directly: "The art of building good agents is often the art of finding different simple configurations that enable the agent to do the particular work you have in front of you."

**Best for:** Multi-step processes where different steps need different skills and the volume justifies the coordination overhead.

**Critical design question:** "Does the output of step A parse cleanly into step B?" If the answer is no, you don't have an orchestration problem — you have a data format problem. Fix the format first.

**Scale-dependent:** Worth it at 10,000+ tickets. Overkill at 100.

---

**The Selection Cheat Sheet**

| Your situation | Use this species |
|---|---|
| You judge the work; agent executes | Coding Harness |
| You trust the evals and specs; human judges at endpoint | Dark Factory |
| You have a clear metric to optimize | Auto Research |
| You have distinct jobs that chain; scale justifies coordination | Orchestration |

---

**The Common Thread**

Species can hybridize. A common pattern is a dark factory with a human eval check at the end, or a coding harness feeding into an orchestration pipeline. All three frontier model providers have converged their harnesses toward hybrid capabilities — Claude Code added coordinator mode, Codex CLI added gateway integrations, Gemini added agent runtime with tool orchestration. The direction is clear: harnesses are becoming species-agnostic at the feature level.

But every species needs the same foundation: a harness that's replaceable, memory that's portable, and an environment that's owned by you. The species determines what the agent can do. The environment determines whether you can keep doing it when the vendor changes terms.

That's the last problem in this series — and the most important one.

**[Read Part 4: Stop Renting Your AI. Own the Stack. →](/insights/blog-4-stack-ownership)**

---

*We build Automata — autonomous AI agents that handle invoicing, scheduling, procurement, and customer resolution. Self-hosted on Jamaican infrastructure. Not sure which species fits your workflow? [Book a fit call](/automata#cta) and our team will map your work to the right architecture.*
