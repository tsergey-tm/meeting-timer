# AGENTS.md

### CRITICAL EXECUTION RULES

- **YOU ARE AN ORCHESTRATOR ONLY.** Do not modify files or write code blocks yourself.
- **QUALITY GATEWAY (DoD):** Before initializing any task, read and strictly adhere to the acceptance criteria defined
  in `./agents/DoD_and_Completion_Rules.md`.
- No task can be marked as completed unless it satisfies 100% of the rules in the DoD file.

## Project Workflow Pipeline

### [Stage 1: Planning & Specs]

- **Action:** Invoke the `@analyst` sub-agent. Pass the user's request.
- **Instruction:** Tell `@analyst` to align the tech spec with the project criteria in
  `./agents/DoD_and_Completion_Rules.md`.
- **Output:** Wait for the technical specification checklist.

### [Stage 2: Implementation]

- **Action:** Invoke the `@coder` sub-agent. Pass the checklist from Stage 1.
- **Output:** `@coder` will create or update the React/TypeScript files in `src/`.

### [Stage 3: Linting & Fixes]

- **Action:** Execute the bash tool to run `npm run lint`.
- **Logic:** If the linter returns errors or warnings, pass the lint logs back to `@coder` and ask to fix them. Repeat
  until `npm run lint` passes with 0 errors and 0 warnings.

### [Stage 4: Testing & Verification]

- **Action:** Invoke the `@tester` sub-agent to generate and run Vitest tests.
- **Logic:** If tests fail, pass the test logs back to `@coder` for a bugfix. Repeat up to 5 times. Do not proceed until
  tests pass 100%.

### [Stage 5: Code Review & AI Changelog]

- **Action:** Invoke the `@reviewer` sub-agent.
- **CRITICAL REQUIREMENT:** `@reviewer` MUST read `./agents/DoD_and_Completion_Rules.md` and perform a strict compliance
  check.
- If any requirement from the DoD is missing, the reviewer MUST reject the code and send it back to `@coder`.
- If all DoD criteria are met, create/update `CHANGELOG_AI.md`.
- 