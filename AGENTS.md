# Agent Guidelines - NutritionTracker

This repository contains **NutritionTracker**, a full-stack precision nutrition tracking application powered by Spring Boot, Spring AI (`gpt-5.6-luna`), PostgreSQL, React 19, TypeScript, and TailwindCSS v4.

---

## 🛑 Critical System Invariants (DO NOT VIOLATE)

### 1. Database & Environment Configuration
- **Native PostgreSQL**: Runs locally on `localhost:5432` (database: `nutrition_tracker`, user: `andresbejarano`).
- **Never switch to H2 or alter `application.properties` database settings** unless explicitly asked.
- **OpenAI Model**: Configured with `gpt-5.6-luna` in `application.properties`. This model is valid and functional in this setup; **do not alter the model name**.

### 2. UI Debugging & CSS Invariants (Rule: First-Principle Inspection)
- **Check CSS Base Rules First**: When any UI element, card, or container disappears, renders blank, or collapses:
  1. **Always inspect the raw CSS definitions** in `index.css`, `App.css`, or Tailwind utilities for rules like `display: none`, `visibility: hidden`, `height: 0`, or malformed selectors (e.g. `.no-scrollbar` targeting the whole element rather than `::-webkit-scrollbar`).
  2. **Do NOT guess complex architectural causes** (e.g., flexbox calculations, Framer Motion lifecycle bugs, or state machine rewrites) before verifying the exact computed CSS properties on the DOM node.
- **Strict UI Scope**: Never add unrequested buttons (e.g., extra Cancel buttons in headers) or redesign working layouts.
- **Reference Working History**: When investigating a regression, always check `git log` and `git show <commit>:<file>` to inspect the exact working design and behavior before proposing changes.

---

## 📁 Repository Structure
- `src/main/java/com/project/NutritionTracker/`: Spring Boot REST API (`/api/entry`, `/api/goal`, `/api/user`, `/api/ai`).
- `frontend/src/`: React 19 SPA (Vite + Tailwind v4 + Framer Motion).
  - `components/chat/`: Nutria AI multimodal chat (`NutriaChatFeed.tsx`, `SmartOmnibar.tsx`, `MealDraftCard.tsx`).
  - `components/dashboard/`: Daily analytics and meal intake sidebar (`LatestEntriesSidebar.tsx`, `HeroKcalCard.tsx`, `ConsumedVsLeftTable.tsx`).
  - `components/overview/`: Weekly & monthly macro trends (`OverviewDashboard.tsx`).
  - `services/api.ts`: REST client connecting React to Spring Boot endpoints.
- `docs/`: Architectural documentation and learning journals (`learning_journal.md`, `design_and_ux.md`, `ai_integration_guide.md`).
