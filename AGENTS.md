# AGENTS.md

## Project Workflow Pipeline

CRITICAL: Every development request MUST go through a multi-agent pipeline. Do not write code directly without passing
all stages in order.

### [Stage 1: Planning & Specs]

- ALWAYS start by invoking the `@analyst` sub-agent.
- The analyst must break down the React component structure, state management, and TypeScript types, then output a
  strict Markdown checklist.

### [Stage 2: Implementation]

- Pass the analyst's checklist to the primary execution agent (`build` mode).
- Write clean, modular React components using TypeScript. Ensure strict typing (no `any`).

### [Stage 3: Linting & Code Style]

- CRITICAL: Run the linter using the Bash tool (`npm run lint`).
- If there are linting errors or warnings, the execution agent MUST fix them immediately.
- Do not proceed to testing until the linter runs with ZERO errors and ZERO warnings.

### [Stage 4: Testing & Verification]

- Delegate test creation to the `@tester` sub-agent.
- The tester MUST generate unit/component tests using Vitest and React Testing Library.
- CRITICAL: Execute tests using the Bash tool (`npx vitest run`).
- If tests fail, send logs back to the implementation stage. Repeat up to 5 times. Do not proceed until tests pass 100%.

### [Stage 5: Code Review & AI Changelog]

- Once tests pass, invoke the `@reviewer` sub-agent.
- The reviewer will check for React anti-patterns, SOLID violations, and architecture.
- Apply the reviewer's fixes, re-run the linter and tests one final time.
- **CRITICAL:** The system MUST check for the existence of `CHANGELOG_AI.md` in the root folder. If it does not exist,
  create it. Append a structured Markdown entry documenting the changes made in this session.

## Setup & Verification Commands

- **Build Command:** `npm run build`
- **Lint Command:** `npm run lint`
- **Test Command:** `npx vitest run`
