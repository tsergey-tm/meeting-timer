# AGENTS.md

## Project Workflow Pipeline

CRITICAL: Every development request MUST go through a 4-stage multi-agent pipeline. Do not write code directly without
passing all stages in order.

### [Stage 1: Planning & Specs]

- ALWAYS start by invoking the `@analyst` sub-agent.
- The analyst must break down the React component structure, state management, and TypeScript types, then output a
  strict Markdown checklist.

### [Stage 2: Implementation]

- Pass the analyst's checklist to the primary execution agent (`build` mode).
- Write clean, modular React components using TypeScript. Ensure strict typing (no `any`).

### [Stage 3: Testing & Verification]

- Delegate test creation to the `@tester` sub-agent.
- The tester MUST generate unit/component tests using Vitest and React Testing Library.
- CRITICAL: Execute tests using the Bash tool (`npm run test:run` or `npx vitest run`).
- If tests fail, send logs back to the implementation stage. Repeat up to 5 times. Do not proceed until tests pass 100%.

### [Stage 4: Code Review]

- Once tests pass, invoke the `@reviewer` sub-agent.
- The reviewer will check for React anti-patterns (e.g., missing keys, unnecessary re-renders) and TypeScript types
  quality.
- Apply the reviewer's fixes, re-run tests one final time, and finalize the work tree.

### [Stage 5: Logging]

- After a successful review and passing of tests, write a short summary of the work done at the beginning of the
  `CHANGELOG_AI.md` file in English.

## Setup & Verification Commands

- **Build Command:** `npm run build`
- **Test Command:** `npx vitest run`
