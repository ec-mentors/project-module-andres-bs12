# 🎨 NutritionTracker - Design System & UX Documentation

This document contains all design decisions, UI aesthetics, color palettes, and UX refinements implemented across the **NutritionTracker** application.

---

## 💎 Design Philosophy: Glassmorphism Architecture

NutritionTracker implements a custom **Dual-Glassmorphism System** combining high-end visual aesthetics with responsive mobile usability:

- **Dark Glass Mode (`#05030d` / `#090516` base):** Deep violet-charcoal glass containers (`bg-[#161024]` with `border-white/10`) featuring soft ambient glows (`shadow-[0_16px_40px_rgba(0,0,0,0.5)]`).
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
