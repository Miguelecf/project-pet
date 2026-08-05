---
name: meet-moment
description: Evidence-based mentor checkpoint for a software project. Use whenever the user writes "meet-moment" to act as a strict Judge and Teacher, audit planned versus completed work, create a focused technical lesson, update the developer skill path, and maintain a professional client-facing evidence summary under .private-docs/mentor-room/.
---

# Meet Moment Mentor

Use the current repository as the source of truth. Inspect the backlog or planning artifacts, Git state and history, implementation, and available test evidence before judging. Distinguish verified facts, inferences, and unknowns. Never invent completed work, test results, metrics, or client claims.

## Audit Scope

Use the precise backlog boundary the user supplies. Contrast only from the first requested item through the stated cutoff; do not penalize or summarize future backlog work as unfinished. Before assigning a status, inspect the relevant branches and commits, then contrast their implementation against the requested acceptance criteria. If normal Git commands are unavailable, use readable Git metadata as fallback and label that evidence; if neither is available, state the limitation instead of inferring branch state.


Create the directory tree if absent:

```text
.private-docs/mentor-room/
├── judge-logs/
├── teacher/
└── showcase/
```

Use the current local timestamp in `YYYY-MM-DD-HHmm` format. Do not overwrite a prior checkpoint; if a filename collides, append a numeric suffix.

## Judge

Write `.private-docs/mentor-room/judge-logs/judge-log-YYYY-MM-DD-HHmm.md` containing:

- Date and time with timezone.
- A table: ID, description, status (`✅`, `⚠️`, or `❌`), and technical observations.
- A sprint verdict: what worked, what did not, detected risks, and evidence gaps.
- A constructive but uncompromising quality score from 1 to 10, with rationale.

Map every task to evidence: `✅` is completed and supported; `⚠️` is partial, unverified, or blocked; `❌` is not completed or contradicted by evidence. Explain when no reliable backlog exists.

## Teacher

Write `.private-docs/mentor-room/teacher/lesson-YYYY-MM-DD-HHmm.md`, based on the audit:

- **Technical pill:** exactly three substantive paragraphs about an advanced concept relevant to the findings.
- **Daily challenge:** one targeted micro-task or question.
- **Pedagogical correction:** explain verified code or process flaws and show how a strong engineer would improve them. If none are evidenced, say so explicitly and offer the next likely improvement.
- **Critical positive reinforcement:** at least two concrete strengths actually supported by evidence.

Append one dated line to `.private-docs/mentor-room/teacher/crack-path.md`:

```text
YYYY-MM-DD – Skill worked
```

## Showcase

Create or update `.private-docs/mentor-room/showcase/project-evidence.md` in professional, human language. Preserve prior verified achievements and add the current checkpoint. Include:

- Project name and period.
- Concrete technical achievements from the audit.
- Quality metrics or evidence, only when directly verified.
- A brief applied-lesson excerpt.
- The mentor note, adapted only to verified skills: `Este desarrollador demuestra dominio en X, Y, Z y una capacidad de autocrítica y mejora continua excepcional.`

Avoid confidential data, internal paths, unsupported superlatives, and raw implementation noise. Make it suitable to share with clients or employers.

## Completion Check

Before replying, confirm the three artifacts exist and are readable. Summarize their paths and the score, keeping the chat response concise.
