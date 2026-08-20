# Original User Request

## 2026-08-20T19:40:51Z

This is a single self-contained UI/design system update; keep it small and focused.

Unify and correct element color handling across dark and light modes, preserve native element colors when goals are exceeded (do not turn red), and invert light mode primary color to clean monochrome/black (inverse of dark mode) by replacing all purple `#6417ff` primary styling.

Working directory: /Users/andresbejarano/dev/NutritionTracker
Integrity mode: development

## Requirements

### R1. Preserve Native Element Colors on Goal Exceeded (No Red Override)
- When any nutrient (Fat, Protein, Carbs, Calories) exceeds 100% / 115%, its charts, donut progress rings, vertical bars, and progress indicators MUST retain the nutrient's native element color (Fat: Cyan `#06b6d4`, Protein: Violet `#8b5cf6`, Carbs: Amber `#f59e0b`, Calories: Vibrant Orange `#f97316`).
- Remove all red (`#f43f5e` / `bg-rose-500` / `stroke-rose-500`) overrides on macro rings, chart bars, and table progress bars for exceeded states.

### R2. Invert Light Mode Primary Color (Monochrome Inverse of Dark Mode, No Purple)
- In Light mode, eliminate all brand purple `#6417ff` (and related purple shades) used as the primary action/button color.
- Make Light mode the clean inverse of Dark mode:
  - Dark mode: Dark background (`#080808`), card (`#121214`), primary button: `bg-white text-black font-extrabold hover:bg-zinc-200`.
  - Light mode: Light background (`#f8fafc`), card (`bg-white`), primary button: `bg-black text-white font-extrabold hover:bg-zinc-800` (or `bg-slate-900 text-white`).
  - Active pill / tab / step indicators in Light mode: inverted `bg-black text-white` (instead of `bg-[#6417ff] text-white`).
  - Form focus rings and active selection borders in Light mode: clean neutral / dark rings (instead of `border-[#6417ff]`).

### R3. Dedicated Calories Color Synthesis Across Light and Dark
- Ensure Calories (`kcal`) consistently uses its dedicated vibrant energy orange token (`#f97316`, `text-orange-400` in dark, `text-orange-600` in light, `bg-orange-500`) across all cards, charts, donuts, tables, forms, and draft chips in both light and dark themes (never plain white or purple).

## Acceptance Criteria

### Color Uniformity & Exceeded Integrity
- [ ] In `HeroKcalCard.tsx`, donut progress rings for Fat, Protein, Carbs, and Calories stay in their respective element colors even when >100% (Fat is cyan `#06b6d4`, not red `#f43f5e`).
- [ ] In `OverviewDashboard.tsx`, vertical bar charts maintain the selected macro's element color on days that exceed goals.
- [ ] In `ConsumedVsLeftTable.tsx`, progress bars and percentage text retain nutrient element colors when exceeded.

### Light Mode Inversion (No #6417ff)
- [ ] `CURSOR_THEME.light.primaryButton`, `pillActive`, and all modal CTA buttons in light mode use black/dark slate primary styling (`bg-black text-white` / `bg-slate-900 text-white`) instead of `bg-[#6417ff]`.
- [ ] In onboarding and setup flows (`OnboardingModal`, `ChoosePathStep`, `AiGoalWizardStep`, `GoalReviewStep`, `ManualGoalStep`, `SetGoalsModal`), selected cards and active step indicators in light mode use clean inverted monochrome styling instead of purple.
- [ ] Zero occurrences of `#6417ff` remaining in the active UI codebase.

### Build Verification
- [ ] `npm run build` inside `frontend/` succeeds with 0 TypeScript compilation errors.
