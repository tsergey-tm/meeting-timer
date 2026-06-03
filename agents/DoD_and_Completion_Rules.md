# Definition of Done (DoD) & Completion Rules

Before marking the task as complete, you must ensure that all code changes meet the highest production-ready standards.
Run all necessary checks and verify the implementation against the following criteria.

## 1. Automated Verification (Linter & Tests)

You must execute the following commands locally and fix any reported issues before final submission:

* **Linting & Type-Checking:** Run `npm run lint`. The project must compile without any TypeScript compiler (tsc) errors
  or warnings, and all ESLint rules must pass.
* **Zero Tolerance for Unused Code:** The build and lint process must be completely clean. There must be **absolutely no
  unused variables, unused functions, or unused imports** left in the code.
* **Unit Tests:** Run `npx vitest run`. All existing and newly added tests must pass with zero failures.

## 2. Code Quality & Architectural Practices

* **FSD Architecture:** Strictly follow Feature-Sliced Design (FSD) methodologies. Place code in the correct layers (
  shared, entities, features, widgets, pages) and slices. Adhere to public API rules (import only via index.ts of a
  slice/segment). Cross-imports between slices on the same layer are strictly forbidden.
* **Testing Requirement:** You must write unit/integration tests using Vitest and React Testing Library for all new
  features, components, and custom hooks. Maintain or improve the overall project test coverage.
* **Zero Dead Code:** Ensure there is no unused, dead, or commented-out code, leftover console.logs, or redundant
  imports remaining in the repository. Every imported module and declared variable must be actively utilized.
* **Modern React & Strict Typing:** Use functional components, hooks, and avoid using `any`. Use precise TypeScript
  interfaces for props, state, and arguments.

## 3. Readability & Maintainability (Human-Centric Code)

* **Self-Documenting Code:** Write expressive code. Use clear, descriptive names for variables, functions, components,
  and files (e.g., `isBillingAddressValid` instead of `chkAddr`).
* **Code Comments:**
* Add JSDoc/TSDoc comments for complex functions, hooks, and component interfaces to explain *why* something is done,
  not just *what* it does.
* Comment on non-obvious logic or performance workarounds. Avoid commenting on self-explanatory code.
* **Consistent Formatting:** Ensure code follows the project's formatting guidelines (Prettier/ESLint). Keep functions
  short (ideally under 50 lines).

## 4. Submission Checklist

Provide a final summary in your last response including:

1. Confirmation that `npm run lint` and `npx vitest run` passed successfully with **zero unused variables/imports**.
2. A brief overview of the files created/changed according to FSD layers.
3. List of new test suites added to cover the changes.
4. Confirmation that all dead code and unused elements have been removed.
