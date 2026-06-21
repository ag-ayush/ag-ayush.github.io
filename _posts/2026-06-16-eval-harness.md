---
layout: post
title: Your AI Coding Agent Changes Are Running on Vibes
date: 2026-06-16 12:00:00
description: AI coding agents are only half model. The other half is the harness around them, and evals are how teams stop changing that harness by feel.
categories: engineering
tags:
  - ai
  - agents
  - evals
  - engineering
---

We have automated tests for application code. CI pipelines. Coverage gates. Mutation testing. Years of accumulated tooling that tells us whether our software works.

Then we plug in an AI coding agent, update the context files, tweak the tools it can use, and ship changes on feel.

That’s the gap eval harnesses close — where “eval harness” means the measurement system that reruns frozen tasks to check whether changes to the agent harness (context files, tools, permissions, feedback loops, workflow constraints) actually helped.

---

## The Real Problem: No Control Group

The problem isn't that agent output is nondeterministic — though it is. The problem is deeper: **in production, you never get the same scenario twice**.

You update the context files. You apply them to the next PR. That PR is a different problem, a different codebase state, a different developer writing the ticket. You can't know whether your changes helped, hurt, or did nothing — because you changed two variables at once: the agent harness and the problem.

That's not an A/B test. It's not even an experiment.

The eval harness solves this by manufacturing the repeatable scenario on purpose. Freeze the codebase at a known commit. Freeze the task. Freeze the reference solution. Now change only the agent harness, re-run, and compare. Everything else is held constant.

SWE-bench — the benchmark most coding agent vendors cite for capability claims — proved this pattern at scale. Each task is drawn from a real GitHub issue and corresponding pull request, with the repository frozen before the fix landed. An agent gets the issue and the codebase at that pre-fix commit. It never sees the solution. A candidate is resolved when it makes the relevant failing tests pass without breaking the relevant passing tests. Same problem, same benchmark protocol, comparable results.

The insight transfers directly to your own codebase. You don't need a public benchmark. You need frozen copies of real work your team already did.

---

## The Harness Is Half the Agent

A useful shorthand that [Martin Fowler points to in Harness Engineering](https://martinfowler.com/articles/harness-engineering.html):

> Agent = Model + Harness

The model is one component. The context files, constraints, feedback loops, and instructions are the other. That matters because it means the agent by this definition is improvable without touching the model weights.

Teams that treat context files as documentation are missing the point. They are the other half of the agent. Measuring whether changes to them actually help isn't optional — it's the same discipline as measuring whether a code change works. The eval harness is what makes that discipline possible.

---

## Anatomy of an Eval Case

Each eval case needs four things:

**Parent commit.** The repository state before a PR merged. The agent starts here with no knowledge of the solution.

**Prompt.** What should change, written at the ticket level. Avoid file names, class names, and method names unless they were part of the original request — otherwise they leak the answer. The agent should rediscover the implementation from the codebase, the same way a developer would from a well-scoped ticket.

**Golden patch.** The actual merged code. The agent never sees it. Used only as the reference for human or LLM review.

**Mechanical checks.** Deterministic gates — compilation, formatting, architecture tests — that run against the agent's final tree regardless of what the judge says. Code that doesn't compile hasn't passed.

For broad coding tasks, the eval also benefits from an LLM judge: a model that scores the agent's output against the golden patch on a rubric. Verdicts might be `agent-better`, `equivalent`, `reference-better`, or `agent-missed`, each with a confidence level. For narrow bugs with strong tests, deterministic checks may be enough. For maintainability, architecture, and product-fit questions, the judge captures signal the test suite usually misses.

---

## Testing Today's Harness Against Yesterday's Problems

Evals freeze the codebase at an older commit. But you don't want the agent seeing the harness files from six months ago, when the PR merged — you want it seeing _today's_. That's the entire point: you're testing your current harness against historical problems.

The mechanism is an overlay. A repo profile captures the build-system specifics once and copies your current harness files forward from HEAD onto the frozen checkout, then reuses that setup across every eval case for the repo:

{% highlight yaml %}
name: my-service
default_overlay_branch: main
default_overlay_from_head:

- CLAUDE.md # whatever your stack calls its context file
- doc/adr/
  mechanical_checks:
- name: compile
  command: mvn compile -s settings.xml -pl :my-service-app -q -DskipTests
  timeout_seconds: 900
  {% endhighlight %}

The filenames are one ecosystem's. In Claude Code the context file is `CLAUDE.md` or files under `.claude/`; elsewhere it's `AGENTS.md`, a system prompt, or `.cursorrules`. The mechanics don't change — only the filenames.

`default_overlay_from_head` is the field that makes a before/after comparison mean anything. Without it, you'd be testing stale harness files against the frozen problem — measuring history, not the changes you actually want to evaluate.

You should hold the rest of the experiment fixed too: model version, run budget, tool permissions, and judging rubric. Otherwise the harness change gets mixed with model drift, tool drift, and evaluation drift.

---

## Reading the Results

The first run rarely produces a perfect score, and that's fine. What it produces is a baseline.

A typical first result: mechanical checks pass clean — the agent compiled, formatted correctly, cleared the deterministic gates. The LLM judge calls it **reference-better, medium confidence**. The human PR was tighter — fewer abstractions, more targeted changes.

That verdict isn't a failure. It's information. The agent knows the codebase well enough to produce correct, compiling output; it doesn't yet make the same architectural tradeoffs the developer made. You now know where the gap is. Update the context files, re-run this same frozen case, and watch whether the verdict moves.

But before you trust that movement, establish a noise floor. The agent's output is stochastic — run the same case twice with identical inputs and the score will move on its own. So run a few cases with no changes first and measure how much they drift. Any harness-driven delta smaller than that drift isn't signal; it's variance. A consistent shift across multiple cases, in the same direction, larger than the noise floor — that's signal worth acting on.

This is what you don't get without the harness: a fixed reference to move against. Apply new context files to the next real ticket instead, and you're comparing against a different problem and a different solution, with no way to tell the harness change from the luck of the draw.

---

## The Prompt Is the Experiment

The quality of an eval case is bounded by the quality of its prompt.

Augment Code's [research on agent context files](https://www.augmentcode.com/blog/how-to-write-good-agents-dot-md-files) reported swings large enough to rival model choice: the best docs improved output substantially, while the worst docs made it worse than having no `AGENTS.md` at all. The lesson transfers to eval prompts. A prompt that says "fix the widget initialization" and one that explains the protocol change, the backward-compatibility constraint, and what done looks like are measuring different things. Only the second is a real experiment.

The time spent writing a clear, ticket-level, hint-free prompt is the investment that determines what the eval can actually tell you.

The same principle applies to the context files you're trying to improve. Prohibitions without alternatives ("don't instantiate HTTP clients directly") cause agents to over-explore. Pairing them with a prescription ("use the shared `apiClient`") closes the loop. You'll only know if that change helped if you have an eval to run it against.

---

## The Judge Problem

Using an LLM to grade an LLM is the obvious objection, and it's fair. The judge should not be your only gate.

The bias is real. AI21 Labs documented a version of it while studying SWE-bench-style patch selection: an LLM judge developed a preference for "gold-like" patches — minimal, clean — even when a messier solution was functionally correct. Grading form, not function. A rubric that explicitly prioritized correctness and completeness over minimality closed most of that gap.

But the deeper problem: how do you know the judge is calibrated? You're stacking a stochastic evaluator on top of a stochastic agent. Left unchecked, you're adding noise to noise.

The practical answer is calibration. Keep a small set of obvious cases — clear pass, clear fail, equivalent-but-different, correct-but-messy, clean-but-incomplete. Verify the judge handles them before trusting it on ambiguous work. Do this periodically, and whenever the rubric changes. The rubric should be versioned; recalibrate when it changes.

This doesn't need to be statistically perfect on day one. It needs to be intentional. Treat the rubric the same way you'd treat a code review checklist — a living document that improves over time.

---

## Start Small

The first version does not need a platform team. Start with five merged PRs from the last quarter:

- One routine bug fix
- One feature with wiring across multiple files
- One refactor or migration
- One production issue where tests mattered
- One case where architecture judgment mattered

For each case, capture the parent commit, the ticket-level prompt, the golden patch, and the mechanical checks. Run the current harness a few times to establish the noise floor. Then change one harness artifact — an `AGENTS.md`, a workflow instruction, a linter, a tool permission — and rerun the same cases.

The first win is not "agents replace developers." It's knowing where to invest the next hour of harness work.

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

_Further reading:_

- [Harness Engineering — Martin Fowler](https://martinfowler.com/articles/harness-engineering.html)
- [Harness Engineering — OpenAI](https://openai.com/index/harness-engineering/)
- [How to Write Good AGENTS.md Files — Augment Code](https://www.augmentcode.com/blog/how-to-write-good-agents-dot-md-files)
- [Gold-Like Answers Reveal LLM Judge Bias — AI21 Labs](https://www.ai21.com/blog/gold-like-answers-benchmarks/)
- [SWE-bench](https://www.swebench.com/)
