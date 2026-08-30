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

## 2026-08-28T12:22:59Z

This is a single self-contained fix; keep it small and focused.

Overhaul the mobile UX and typography hierarchy of the Favorites modal (`ManageFavoritesModal.tsx`) in NutritionTracker, implementing an Apple-style bottom sheet with top drag-indicator, consistent readable typography between search/browse and creation sheets, explicit back navigation from create to search, and polished UX margins.

Working directory: /Users/andresbejarano/dev/NutritionTracker

## Requirements

### R1. Apple-Style iOS Bottom Sheet & Safe Area UX
- On mobile viewports, the favorites modal and create/edit sheet must behave like an iOS bottom sheet modal (`items-end sm:items-center`, `rounded-t-[32px] sm:rounded-[32px]`, `max-h-[86vh]` with top safe spacing from device status bar).
- Include an Apple-style top drag indicator pill (`w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2 mb-1 sm:hidden`).
- Maintain comfortable interior UX margins and padding so content never touches screen borders or is clipped by notches/safe areas.

### R2. Typography Harmonization Between Search/Browse and Create Sheets
- Ensure font sizes in the search/browse view match the legibility of the create sheet:
  - Search bar input & category filter pills: `text-sm sm:text-base font-semibold`.
  - Meal item cards: title `text-sm sm:text-base font-extrabold`, macro chips `text-xs sm:text-sm font-bold`.
  - Action buttons (`+ Log`, `Edit`, `Delete`): comfortable touch targets with crisp readable labels.

### R3. Back Navigation from Create/Edit to Search
- Inside the Create/Edit Favorite overlay, provide a clear "Back" navigation control (e.g. `← Back to Favorites`) in the header and cancel button to return seamlessly to the search/browse list without losing filter context.
- Keep the top-right `✕` button for dismissing the modal entirely.

## Acceptance Criteria

### iOS Sheet Behavior & Layout
- [ ] On mobile screens (<640px), modal sits anchored to the bottom with rounded top corners, top drag pill, and does not push all the way to 100% height (leaving Apple HIG top inset).
- [ ] On desktop screens, modal remains a centered dialog with smooth entrance animation.

### Typography & Readability
- [ ] No sub-12px unreadable microtext in search inputs, category filter pills, or meal list cards.
- [ ] Visual weight and text sizing between Browse mode and Create mode feel coherent and unified.

### Navigation Flow
- [ ] Tapping "Back" or "Cancel" in the Create/Edit sheet returns the user to the Favorites search/browse list.
- [ ] Tapping "✕" closes the modal completely.
