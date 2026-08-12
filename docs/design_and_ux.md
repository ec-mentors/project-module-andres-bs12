# 🎨 NutritionTracker - Design System & UX Documentation

This document contains all design decisions, UI aesthetics, color palettes, and UX refinements implemented across the **NutritionTracker** application.

---

## 💎 Design Philosophy: Glassmorphism Architecture

NutritionTracker implements a custom **Dual-Glassmorphism System** combining high-end visual aesthetics with responsive mobile usability:

- **Dark Glass Mode (`#05030d` base):** Deep violet-charcoal glass containers (`bg-[#161024]` with `border-white/10`) featuring soft ambient glows (`shadow-[0_16px_40px_rgba(0,0,0,0.5)]`).
- **Light Glass Mode (`#f8fafc` base):** Soft, desaturated white glass cards (`bg-white/95` with `backdrop-blur-sm` and `border-slate-200/80`) featuring subtle ambient shadows (`shadow-[0_4px_20px_rgba(0,0,0,0.03)]`) and gentle lavender hover borders (`hover:border-[#6417ff]/25`).

---

## 🎨 Strict Color Palette Rules

1. **Brand Purple (`#6417ff`):**
   - Used for active navigation pills, primary action buttons, and target compliance states when goals are met (`85%` to `115%`).
2. **Rose Red (`rose-500` / `#f43f5e`):**
   - Unified alert color used across Donut SVG rings, headline badges, bar chart columns, and table progress indicators whenever a macro goal is **exceeded (`>115%`)**. Over-consuming calories is unhealthy and never marked as "Goal Hit".
3. **Constant Neutral Slate:**
   - The "Left" column in the *Consumed vs Left* table remains a **constant neutral slate** (`text-slate-700` in Light mode, `text-slate-300` in Dark mode) to avoid cognitive overload. Only the *Progress* column reflects color status.

---

## 📐 Figma Prototype Deviations & UX Improvements

### 1. Fixed-Width Date Navigator Pill (`195px`)
- **Problem:** Dynamic date text length changes (e.g., "Today" vs "Wed, Aug 12") caused `<` and `>` arrow buttons to shift horizontally, resulting in arrow jumping during rapid navigation.
- **Solution:** Fixed the date navigator pill width to `w-full sm:w-[195px] flex items-center justify-between`. The arrow buttons remain pinned in the exact same pixel position regardless of date text length.

### 2. Mobile Touch Delete UX & Safety Confirmation
- **Problem:** Hover-only action icons (`group-hover:opacity-100`) were invisible on touchscreens, and deleting an entry lacked safety confirmations.
- **Solution:**
  - Action icons are **always visible on mobile touch viewports** (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`).
  - Added an **inline confirmation dialog** (`"Delete [Meal Name]?"` / `"This action cannot be undone"`) with explicit `Yes, Delete` (Rose Red) and `Cancel` (Slate) buttons.
  - Added a prominent red `Delete` button inside the inline edit form.

### 3. Minimalist Vector Iconography System
- **Problem:** Multi-colored realistic emojis created visual clutter and inconsistency across dropdowns and KPI cards.
- **Solution:** Replaced all emojis with unified **Lucide vector icons** (`Edit3`, `Target`, `TrendingUp`, `Flame`, `Award`, `Calendar`, `ChevronLeft`, `ChevronRight`). Icon colors are centralized to neutral slate in Light mode (`text-slate-700`) and luminous lavender in Dark mode (`text-purple-200`).

### 4. Left-to-Right Staggered Wave Theme Transition
- **Problem:** Toggling between Light and Dark mode flipped all page colors simultaneously, creating a harsh screen flash.
- **Solution:** Applied staggered animation delays (`delay-0`, `delay-75`, `delay-150`) to the main cards in the *Today* view (`HeroKcalCard` ➔ `ConsumedVsLeftTable` ➔ `LatestEntriesSidebar`). Colors transition in a smooth wave from left to right, matching the transition in the *Overview* tab.

### 5. Global Number Input Stepper Arrow Reset
- **Problem:** Native browser up/down spinner arrows on `<input type="number">` fields caused accidental value changes on hover/scroll.
- **Solution:** Added global `@layer base` CSS resets in `index.css` and `App.css`:
  ```css
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-clear-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
    display: none !important;
  }
  input[type="number"] {
    -moz-appearance: textfield !important;
    appearance: textfield !important;
  }
  ```
