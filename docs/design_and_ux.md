# 🎨 NutritionTracker - Design System & UX Documentation

This document contains all design decisions, UI aesthetics, color palettes, and UX refinements implemented across the **NutritionTracker** application.

---

## 💎 Design Philosophy: Glassmorphism Architecture

NutritionTracker implements a custom **Dual-Glassmorphism System** combining high-end visual aesthetics with responsive mobile usability:

- **Dark Glass Mode (`#080808` base):** Deep obsidian glass containers (`bg-[#121214]` with `border-white/[0.08]`) featuring soft ambient glows (`shadow-[0_8px_30px_rgba(0,0,0,0.6)]`).
- **Light Glass Mode (`#f8fafc` base):** Soft, desaturated white glass cards (`bg-white/95` with `backdrop-blur-sm` and `border-slate-200/80`) featuring subtle ambient shadows (`shadow-[0_4px_20px_rgba(0,0,0,0.03)]`) and clean neutral hover borders (`hover:border-slate-300`).

---

## 🎨 Strict Color Palette Rules

1. **Monochrome Inverted Primary:**
   - Dark mode primary buttons & active pills: `bg-white text-black font-extrabold hover:bg-zinc-200`.
   - Light mode primary buttons & active pills: `bg-black text-white font-extrabold hover:bg-zinc-800` (clean monochrome inverse of dark mode, no purple).
2. **Dedicated Macro Tokens & Goal Exceeded Color Integrity:**
   - Nutrient native element colors:
     - **Protein:** Electric Violet (`#8b5cf6` / `text-violet-400` in dark, `text-violet-700` in light, `bg-violet-500`)
     - **Carbs:** Warm Amber (`#f59e0b` / `text-amber-400` in dark, `text-amber-700` in light, `bg-amber-500`)
     - **Fat:** Electric Cyan (`#06b6d4` / `text-cyan-400` in dark, `text-cyan-700` in light, `bg-cyan-400`)
     - **Calories:** Energy Coral / Orange (`#f97316` / `text-orange-400` in dark, `text-orange-600` in light, `bg-orange-500`)
   - When any nutrient exceeds 100% / 115%, its charts, donut progress rings, vertical bars, and progress indicators MUST retain the nutrient's native element color (no red `#f43f5e` / `bg-rose-500` override).
3. **Constant Neutral Slate:**
   - The "Left" column in the *Consumed vs Left* table remains a **constant neutral slate** (`text-slate-700` in Light mode, `text-zinc-400` in Dark mode) to avoid cognitive overload. Only the *Progress* column reflects color status.

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

---

## 🚀 5-Step Onboarding Architecture & Revolut-Style Mobile Flow

### 6. Full-Screen Exclusive Onboarding Viewport
- **Architecture:** The Onboarding experience is rendered as a clean, full-screen exclusive takeover (`h-[100dvh] max-h-[100dvh] overflow-hidden`) with fixed header, internally scrollable form body, and pinned action bar.
- **Step Breakdown:**
  - **Step 1 of 5:** *Choose Setup Method* (`ChoosePathStep.tsx` - 20% progress)
  - **Step 2 of 5:** *Primary Objective* (`AiGoalWizardStep.tsx` - 40% progress)
  - **Step 3 of 5:** *Body & Metrics* (`AiGoalWizardStep.tsx` - 60% progress)
  - **Step 4 of 5:** *Daily Activity Level* (`AiGoalWizardStep.tsx` - 80% progress)
  - **Step 5 of 5:** *Dietary Preference* (`AiGoalWizardStep.tsx` - 92% progress)
  - **Finalization:** *Review & Finalize* (`GoalReviewStep.tsx` - 100% progress)
- **Ergonomics:**
  - On mobile, the AI-Powered Setup button is positioned at the bottom, directly in the comfortable thumb zone.
  - Features an organic diffuse AI glow aura (`blur-[8px]` with conic gradient sweep).
  - All dividing lines feature soft feathered fades (`bg-gradient-to-r from-transparent via-... to-transparent`).

---

## 📱 Mobile WebKit & Touch Usability Engineering

### 7. Virtual Keyboard Dismissal ("Tap Eater") Immunity
- **Problem:** When an `<input type="number">` is focused, tapping a button or preset card triggered an input blur, collapsing the virtual keyboard and shifting the viewport by ~350px between `touchstart` and `touchend`, causing the browser to cancel the `click` event.
- **Solution:**
  - Attached `onMouseDown={(e) => e.preventDefault()}` to all buttons, action bars, and preset cards.
  - Added `touch-action: manipulation` across interactive controls.
  - Screen coordinates remain anchored during the tap; the action executes instantly, and the keyboard is dismissed gracefully via programmatic `blur()`.

### 8. Action Bar Layer Isolation & Zero Touch Ghosting
- **Problem:** Transparent action bars (`bg-transparent`) allowed scrolling items to pass beneath the action buttons. Touch hit-testing in iOS Safari overlapped between the button and underlying cards, causing scroll momentum to cancel button clicks.
- **Solution:**
  - Pinned action bar with `z-30` and solid theme background (`bg-[#090516]` Dark / `bg-[#f8fafc]` Light).
  - Added `touch-manipulation` and `select-none`.
  - Added generous `pb-8 sm:pb-10` padding to scrollable containers, ensuring a 40px breathable gap above the action bar.

### 9. Theme Overscroll & Safari Background Seams
- **Problem:** Pull-to-refresh overscroll in Safari exposed dark background canvases in light mode.
- **Solution:** Synchronized `html.light`, `body.light` (`#f8fafc`) and dynamically updated `<meta name="theme-color">` on every theme change.

### 10. Apple-Style Inline Skeleton Shimmers & Zero-Flash Date Navigation
- **Problem:** Changing dates in the *Today* view caused a harsh full-page screen flash and unmounted all dashboard cards to display a full-page spinner (`animate-spin`).
- **Solution:**
  - Removed full-page unmount takeovers; card boxes (`HeroKcalCard`, `ConsumedVsLeftTable`, `LatestEntriesSidebar`, `OverviewDashboard`) remain **100% physically anchored and mounted** in the DOM.
  - Implemented Apple-style soft-rounded pulsing skeleton placeholders (`animate-pulse bg-slate-200` in Light mode / `bg-white/10` in Dark mode) inside the exact number, donut, and meal card slots.
  - Date navigation buttons (`<` / `>`) remain responsive and stable with zero layout jumping.
