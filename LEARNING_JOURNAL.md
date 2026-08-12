# 📖 NutritionTracker Frontend - Learning Journal, Architecture & Design Decisions (ADR)

This document captures the **Frontend Component Architecture**, **Design Philosophy**, **Architectural Decisions (ADR)**, and **UX Evolution** of the NutritionTracker Frontend. It details how the React + Vite + TypeScript application works, how it connects to the Spring Boot REST API, and why specific design decisions evolved beyond initial Figma mockups.

---

## 🏗️ Frontend Component & Data Flow Architecture

The frontend source code is structured inside `frontend/src/`:

```
frontend/src/
├── App.tsx                        # Root Application Layout & State Synchronizer
├── main.tsx                       # React 19 Entry Point & Global Stylesheet Loader
├── index.css                      # Tailwind v4 Base & Global CSS Resets
├── App.css                        # Custom Scrollbars & Input Number Spinner Resets
├── types/
│   ├── nutrition.ts               # TypeScript DTOs (MealEntry, NutritionGoal, DailySummary)
│   └── user.ts                    # UserProfile DTO
├── services/
│   └── api.ts                     # Type-Safe REST Client API Service for Spring Boot Controllers
└── components/
    ├── layout/
    │   └── Header.tsx             # Glass Navigation Bar & Theme Selector
    ├── dashboard/
    │   ├── HeroKcalCard.tsx       # Kcal Overview, Donut SVG Rings & Fixed Date Navigator
    │   ├── ConsumedVsLeftTable.tsx# Nutrient Progress Table (Neutral Left Column)
    │   └── LatestEntriesSidebar.tsx# Meal Entry Feed, Inline Add/Edit & Touch Delete UX
    ├── overview/
    │   └── OverviewDashboard.tsx  # Monthly/Weekly Analytics Bar Chart & Top 4 KPI Cards
    ├── forms/
    │   └── SetGoalsModal.tsx      # Target Kcal/Macro Goal Editor Modal (Light Glass Support)
    ├── auth/
    │   ├── GoogleLoginModal.tsx   # Google OAuth Identity Modal
    │   ├── AuthModal.tsx          # Login Flow Component
    │   └── UserProfileModal.tsx   # User Settings Modal
    └── common/
        └── SidepopUp.tsx          # Figma Notification Toast Banner
```

---

## 🎨 Design Philosophy & Glassmorphism System

NutritionTracker combines modern **Dark Glassmorphism** and **Light Glassmorphism** themes with an 8px spatial grid, high-contrast typography, and smooth micro-interactions.

- **Dark Glass Mode (`#05030d` base):** Deep violet-charcoal glass cards (`#161024` with `border-white/10`) featuring soft ambient glows (`shadow-[0_16px_40px_rgba(0,0,0,0.5)]`).
- **Light Glass Mode (`#f8fafc` base):** Soft, desaturated white glass cards (`bg-white/95` with `backdrop-blur-sm` and `border-slate-200/80`) featuring subtle ambient shadows (`shadow-[0_4px_20px_rgba(0,0,0,0.03)]`) and gentle lavender hover borders (`hover:border-[#6417ff]/25`).

---

## 🚀 Key Architectural Decisions & Figma Evolutions

### 1. 🎯 Strict Multi-Macro Goal Math (85%–115% Target Zone)
- **Problem in Figma Prototype:** Early mockups treated any intake above 100% as "100% complete," ignoring over-consumption.
- **Architectural Decision:** Implemented strict nutritional compliance logic:
  - **Goal Met (`85%` to `115%`):** Highlighted in official **Brand Purple (`#6417ff`)**.
  - **Goal Exceeded (`>115%`):** Highlighted in **Rose Red (`#f43f5e`)**. Over-consuming calories by 400% is unhealthy and cannot be marked as "Goal Hit".
  - **In Progress (`<85%`):** Rendered in neutral slate (`stroke-slate-300` in Light mode, `stroke-white/15` in Dark mode).

### 2. 🌹 Unified Rose Red Exceeded Alert Palette
- **Problem:** Previous iterations mixed multiple shades of red, amber, and orange for warning states.
- **Decision:** Unified all exceeded states across Donut SVG rings, headline badges, bar chart columns, and table progress indicators to a single cohesive **Rose Red (`rose-500` / `#f43f5e`)**.

### 3. ⚖️ Constant Neutral "Left" Table Column
- **Problem:** Changing text colors in the "Left" column caused visual confusion.
- **Decision:** The "Left" column in the *Consumed vs Left* table remains a **constant neutral slate** (`text-slate-700` in Light mode, `text-slate-300` in Dark mode). Only the *Progress* column reflects color status.

### 4. 📐 Fixed-Width Date Navigator Pill (`195px`)
- **Problem:** Date string length changes (e.g., "Today" vs "Wed, Aug 12") caused `<` and `>` arrow buttons to shift horizontally during rapid navigation, resulting in bad UX.
- **Decision:** Fixed the date navigator pill width to `w-full sm:w-[195px] flex items-center justify-between`. The arrow buttons remain pinned in the exact same pixel position regardless of date text length.

### 5. 📱 Mobile Touch Delete UX & Safety Confirmations
- **Problem:** On mobile touchscreens, hover-only action icons (`group-hover:opacity-100`) were invisible, and deleting an entry had no safety confirmation.
- **Decision:**
  - Made edit and delete action buttons **always visible on mobile touch viewports** (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`).
  - Added an **inline confirmation dialog** (`"Delete [Meal Name]?"` / `"This action cannot be undone"`) with explicit `Yes, Delete` (Rose Red) and `Cancel` (Slate) buttons.
  - Added a prominent red `Delete` button inside the inline edit form.

### 6. 💎 Minimalist Vector Iconography System
- **Problem:** Multi-colored realistic emojis (`🌟`, `🥩`, `🔥`, `🍞`, `🥑`) created visual clutter and inconsistency across dropdowns and KPI cards.
- **Decision:** Replaced all emojis with unified **Lucide vector icons** (`Edit3`, `Target`, `TrendingUp`, `Flame`, `Award`, `Calendar`, `ChevronLeft`, `ChevronRight`). Icon colors are centralized to neutral slate in Light mode (`text-slate-700`) and luminous lavender in Dark mode (`text-purple-200`).

### 7. 🌊 Left-to-Right Staggered Wave Theme Transition
- **Problem:** Toggling between Light and Dark mode flipped all page colors simultaneously, creating a harsh screen flash.
- **Decision:** Applied staggered animation delays (`delay-0`, `delay-75`, `delay-150`) to the main cards in the *Today* view (`HeroKcalCard` ➔ `ConsumedVsLeftTable` ➔ `LatestEntriesSidebar`). Colors transition in a smooth wave from left to right, matching the transition in the *Overview* tab.

### 8. 🚫 Global Number Input Stepper Arrow Reset
- **Problem:** Browser native up/down spinner arrows on `<input type="number">` fields caused accidental value changes on hover/scroll.
- **Decision:** Added global `@layer base` CSS resets in `index.css` and `App.css`:
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

## 📱 Mobile Device Testing & Access Guide

### How to View & Test on Your Mobile Phone (iPhone / Android)

1. **Connect Mobile Phone to the Same Wi-Fi Network:**
   Ensure your mobile phone is connected to the exact same Wi-Fi network as your computer.

2. **Launch Network-Exposed Dev Server:**
   From the project directory, run:
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

3. **Open the Network IP URL in Mobile Browser:**
   - Open **Safari** (iOS) or **Chrome** (Android) on your phone.
   - Enter your computer's local Wi-Fi IP address in the address bar:
     **`http://10.0.0.207:5173`** *(or `http://<your-mac-ip>:5173`)*.

4. **📱 Optional - Add to Home Screen (Native PWA Feel):**
   - **iOS Safari:** Tap the **Share** button ➔ Select **Add to Home Screen**.
   - **Android Chrome:** Tap the 3-dots menu ➔ Select **Add to Home Screen**.
   - The app will now open full-screen without browser bars, feeling like a native iOS/Android application!

---

## 🛠️ How to Run & Verify Production Build

### 1. Run Production Build Check
```bash
npm --prefix frontend run build
```
- Compiles the TypeScript + Vite bundle into `src/main/resources/static` for Spring Boot serving in **< 200ms** with 0 errors and 0 warnings.
