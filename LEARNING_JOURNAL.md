# 📖 NutritionTracker - Learning Journal & Personal Reflections

This document captures key takeaways, technical learnings, and personal insights gained while building the **NutritionTracker** application.

---

## 🤖 AI-Assisted Frontend Development 

The frontend of NutritionTracker was developed using **AI-Assisted Pair Programming)** powered by **Google Antigravity I**.

### Key Insights from AI Pair Programming:
- **Rapid UI Prototyping:** Utilizing AI enabled rapid iteration of component layouts, glassmorphism design tokens, and complex CSS utilities in TailwindCSS v4.
- **Continuous Refinement & Pair Programming:** Working iteratively with the AI assistant allowed real-time fixes for mobile touch UX, number spinner arrow resets, date pill width stabilization, and color desaturation.
- **Architectural Quality Control:** While AI generated initial component structures, strict manual review ensured type safety, defensive mathematical clamping (`85%–115%` goal compliance), and seamless REST API integration with Spring Boot.

---

## 🧠 Key Technical Learnings

### 1. Modern React 19 + TypeScript + Tailwind v4
- Learned to structure modern React single-page applications using TypeScript interfaces matching Spring Boot DTOs (`MealEntry`, `NutritionGoal`, `DailySummary`).
- Understood Tailwind v4 configuration (`@import "tailwindcss";`), `@layer base` resets, and custom utility classes.

### 2. Glassmorphism Design Tokens & Dark/Light Modes
- Implemented dual-theme switching with dynamic body background synchronization (`#f8fafc` vs `#05030d`) to eliminate overscroll rubberband artifacts on mobile browsers.
- Mastered backdrop-blur performance tuning (`backdrop-blur-sm` in Light mode vs `backdrop-blur-2xl` in Dark mode).

### 3. Mobile Touch UX Optimization
- Learned that desktop hover states (`group-hover:opacity-100`) do not translate to touch devices, requiring explicit mobile viewport rules (`opacity-100 sm:opacity-0`).
- Implemented mobile viewport zoom resets (`font-size: 16px !important` on iOS inputs) to prevent unwanted browser auto-zooming.
- Applied responsive grid techniques and `flex items-baseline` to enforce strict layout symmetry and typography hierarchy in dense mobile dashboards.

### 4. REST API Integration & Spring Boot Synergy
- Built a clean, type-safe API client service (`services/api.ts`) connecting React components to Spring Boot controllers (`EntryController`, `GoalController`, `UserController`).
- Configured Vite build output to emit compiled bundle assets directly into `src/main/resources/static/`, enabling Spring Boot to serve the SPA natively.

---

## 📄 Related Documentation
- 🎨 **[Design & UX Documentation](docs/design_and_ux.md):** Detailed breakdown of design philosophy, color system, and Figma evolutions.
- 📘 **[Project README](README.md):** Architecture overview, database schema, tech stack, and setup guide.
