# Your AI Coding Agent Changes Are Running on Vibes

We have automated tests for application code. CI pipelines. Coverage gates. Mutation testing. Years of accumulated tooling that tells us whether our software works.

Then we plug in an AI coding agent, update the context files, and ship changes on feel.

That's the gap eval harnesses close.

---

## The Real Problem: No Control Group

The problem isn't that agent output is nondeterministic — though it is. The problem is deeper: **in production, you never get the same scenario twice**.

You update the context files. You apply them to the next PR. That PR is a different problem, a different codebase state, a different developer writing the ticket. You can't know whether your changes helped, hurt, or did nothing — because you changed two variables at once: the harness and the problem.

That's not an A/B test. It's not even an experiment.

The eval harness solves this by manufacturing the repeatable scenario on purpose. Freeze the codebase at a known commit. Freeze the task. Freeze the reference solution. Now change only the harness, re-run, and compare. Everything else is held constant.

One honest caveat up front, because the whole argument rests on it: freezing the codebase, the task, and the reference makes the *benchmark* deterministic. It does not make the *agent* deterministic — run the same case twice and the score will drift a little on its own. So the claim isn't "deterministic before versus after." It's narrower and more defensible: the benchmark is fixed, so a consistent shift in scores is attributable to the one thing that changed — the harness. (Separating that shift from natural variance comes later, once we have scores in hand.)

SWE-bench — the benchmark most coding agent vendors cite for capability claims — proved this pattern at scale. Each task instance is a real GitHub issue, frozen before its PR merged. An agent gets the issue and the codebase at that exact commit. It never sees the solution. Pass rate on the "fail-to-pass" tests is the score. Same problem, any harness, always comparable.

The insight transfers directly to your own codebase. You don't need a public benchmark. You need frozen copies of real work your team already did.

---

## The Harness Is Half the Agent

Martin Fowler's framing from [Harness Engineering](https://martinfowler.com/articles/harness-engineering.html):

> **"Agent = Model + Harness"**

The model is one component. The context files, constraints, feedback loops, and instructions are the other. That matters because it means the harness is improvable — and improvements are measurable — without touching the model weights.

Teams that treat context files as documentation are missing the point. They are the other half of the agent. Measuring whether changes to them actually help isn't optional — it's the same discipline as measuring whether a code change works. The eval harness is what makes that discipline possible.

---

## Anatomy of an Eval Case

Each eval case needs four things:

**Parent commit.** The repository state before a PR merged. The agent starts here with no knowledge of the solution.

**Prompt.** What should change, written at the ticket level. No file names, no class names, no method names — those leak the answer. The agent rediscovers the implementation from the codebase, the same way a developer would from a well-scoped ticket.

**Golden patch.** The actual merged code. The agent never sees it. Used only by the judge.

**Mechanical checks.** Deterministic gates — compilation, formatting, architecture tests — that run against the agent's final tree regardless of what the judge says. Code that doesn't compile hasn't passed.

The eval also needs an LLM judge: a model that scores the agent's output against the golden patch on a rubric. Verdicts: `agent-better`, `equivalent`, `reference-better`, or `agent-missed`, each with a confidence level.

---

## Testing Today's Harness Against Yesterday's Problems

Evals freeze the codebase at an older commit. But you don't want the agent seeing the harness files from six months ago, when the PR merged — you want it seeing *today's*. That's the entire point: you're testing your current harness against historical problems.

The mechanism is an overlay. A repo profile captures the build-system specifics once and copies your current harness files forward from HEAD onto the frozen checkout, then reuses that setup across every eval case for the repo:

```yaml
name: my-service
default_overlay_branch: main
default_overlay_from_head:
  - CLAUDE.md    # whatever your stack calls its context file
  - doc/adr/
mechanical_checks:
  - name: compile
    command: mvn compile -s settings.xml -pl :my-service-app -q -DskipTests
    timeout_seconds: 900
```

The filenames are one ecosystem's. In Claude Code the context file is `CLAUDE.md` or files under `.claude/`; elsewhere it's `AGENTS.md`, a system prompt, or `.cursorrules`. The mechanics don't change — only the filenames.

`default_overlay_from_head` is the field that makes a before/after comparison mean anything. Without it, you'd be testing stale harness files against the frozen problem — measuring history, not the changes you actually want to evaluate.

---

## Reading the Results

The first run rarely produces a perfect score, and that's fine. What it produces is a baseline.

A typical first result: mechanical checks pass clean — the agent compiled, formatted correctly, cleared the deterministic gates. The LLM judge calls it **reference-better, medium confidence**. The human PR was tighter — fewer abstractions, more targeted changes.

That verdict isn't a failure. It's information. The agent knows the codebase well enough to produce correct, compiling output; it doesn't yet make the same architectural tradeoffs the developer made. You now know where the gap is. Update the context files, re-run this same frozen case, and watch whether the verdict moves.

But before you trust that movement, establish a noise floor. The agent's output is stochastic — run the same case twice with identical inputs and the score will move on its own. So run a few cases with no changes first and measure how much they drift. Any artifact-driven delta smaller than that drift isn't signal; it's variance. A consistent shift across multiple cases, in the same direction, larger than the noise floor — that's signal worth acting on.

This is what you don't get without the harness: a fixed reference to move against. Apply new context files to the next real ticket instead, and you're comparing against a different problem and a different solution, with no way to tell the harness change from the luck of the draw.

---

## The Prompt Is the Experiment

The quality of an eval case is bounded by the quality of its prompt.

Augment Code's [research on agent context files](https://www.augmentcode.com/blog/how-to-write-good-agents-dot-md-files) quantified this: documentation quality explains variance in agent output equivalent to model upgrades — in both directions. The pattern holds for eval prompts. A prompt that says "fix the widget initialization" and one that explains the protocol change, the backward-compatibility constraint, and what done looks like are measuring different things. Only the second is a real experiment.

The time spent writing a clear, ticket-level, hint-free prompt is the investment that determines what the eval can actually tell you.

The same principle applies to the context files you're trying to improve. Prohibitions without alternatives ("don't instantiate HTTP clients directly") cause agents to over-explore. Pairing them with a prescription ("use the shared `apiClient`") closes the loop. You'll only know if that change helped if you have an eval to run it against.

---

## The Judge Problem

Using an LLM to grade an LLM is the obvious objection, and it's fair.

The bias is real. AI21 Labs documented it on SWE-bench: judges develop a preference for "gold-like" patches — minimal, clean — even when a messier solution is functionally correct. Grading form, not function. A rubric that explicitly prioritized correctness over minimality closed most of that gap.

But the deeper problem: how do you know the judge is calibrated? You're stacking a stochastic evaluator on top of a stochastic agent. Left unchecked, you're adding noise to noise.

The practical answer is spot-checking. Pick a case with a known, obvious outcome — one where the agent clearly solved the problem and one where it clearly didn't. Verify the judge agrees. Do this periodically, and whenever the rubric changes. The rubric should be versioned; recalibrate when it changes.

This doesn't need to be rigorous. It needs to be intentional. Treat the rubric the same way you'd treat a code review checklist — a living document that improves over time.

---

## This Compounds

The value of each eval case added is not linear. The first gives you a baseline. The second lets you compare across problem types. The fifth makes individual run variance matter less. The tenth gives you enough signal to detect regressions from model version changes alone.

Teams that invest in eval infrastructure compound. Every case added makes the next harness change safer to ship. Those that treat it as an afterthought make context changes by feel indefinitely.

The discipline is the same one that made unit testing standard practice — not the first test, but the hundredth.

---

## What This Isn't

Eval harnesses measure whether an agent can reproduce a known-good solution given a clear prompt. They don't:

- Test on genuinely novel problems
- Replace human code review
- Guarantee production safety
- Cover adversarial inputs

They're a measurement tool. The signal is directional. Acting on it still requires judgment.

But the alternative — shipping harness changes with no signal at all — isn't disciplined. It's guessing.

---

*Further reading:*
- [Harness Engineering — Martin Fowler](https://martinfowler.com/articles/harness-engineering.html)
- [Harness Engineering — OpenAI](https://openai.com/index/harness-engineering/)
- [How to Write Good AGENTS.md Files — Augment Code](https://www.augmentcode.com/blog/how-to-write-good-agents-dot-md-files)
- [Gold-Like Answers Reveal LLM Judge Bias — AI21 Labs](https://www.ai21.com/blog/gold-like-answers-benchmarks/)
- [SWE-bench](https://www.swebench.com/)
