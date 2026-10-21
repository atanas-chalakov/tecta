# AI Assistant Guidelines (`AGENTS.md`)

This file provides architectural context, commands, and conventions for AI coding assistants working in this repository.

## 1. Project Overview & Architecture
- **Description**: **Tecta** — High-performance (120fps) visual website builder studio combining Webflow's CSS box-model precision with Wix-style pre-built section templates.
- **Core Stack**: TypeScript (strict), React 19, Vite, Tailwind CSS, Zustand (O(1) normalized store), Constructable `CSSStyleSheet` Direct-CSSOM Engine.
- **Primary Architecture**:
  - Entry points: `src/main.tsx`, `src/App.tsx`, `src/components/`
  - Business logic & compilers: `src/services/` (`cssomEngine.ts`, `htmlExporter.ts`)
  - Domain schema & templates: `src/domain/` (`schema.ts`, `templates.ts`)
  - State & persistence: `src/store/` (`documentStore.ts`)

---

## 2. Environment & Tooling
This repository uses `mise` for deterministic tool versioning. Run `mise install` upon checkout.
- Runtimes defined in: `.mise.toml`
- Package manager: `pnpm`

---

## 3. Essential Commands
Always verify changes using these commands:

| Action | Command |
| :--- | :--- |
| **Install Dependencies** | `pnpm install` |
| **Run Dev Server** | `pnpm dev` |
| **Run Linter / Typecheck** | `pnpm typecheck` |
| **Build Production Bundle** | `pnpm build` |
| **Run Test Suite** | `pnpm test` |
| **Run Single Test** | `pnpm test <path>` |

---

## 4. Coding Conventions & Best Practices
- **Zero-Lag Canvas Rule**: Never trigger full-tree React re-renders during pointer drag/scrubbing. Use `cssomEngine.setTransientStyle()` during pointer movement and commit to `documentStore` on `pointerup`.
- **Type Safety**: Avoid using `any` (TypeScript). Explicit types on public functions and AST nodes.
- **Fail Fast & Defensive**: Validate inputs at boundary layers (JSON import/export, storage hydration).
- **Keep it Minimal**: Only add dependencies when strictly necessary. Prefer standard Web APIs (`CSSStyleSheet`, `requestAnimationFrame`, `ResizeObserver`).

---

## 5. Agent Workflow Rules
1. **Never commit secrets**: Do not write `.env` files or credentials into version control.
2. **Verify before finishing**: Always run the project's typecheck and test commands after modifying code.
3. **Preserve existing style**: Do not perform sweeping refactors on untouched files unless explicitly requested.
