# 🥗 NutritionTracker

NutritionTracker is a modern Spring Boot & Web application designed to help users log daily nutrition entries (meals, calories, macros) and track them against personalized nutritional goals.

---

## 📌 Project Management & Live Roadmap

Task tracking and sprint planning are managed natively via **GitHub Issues & GitHub Projects** (v2) and synchronized with **Jira Cloud**.

* 🚀 **[View Live GitHub Issues & Backlog](https://github.com/ec-mentors/project-module-andres-bs12/issues)**
* 📊 **[View Interactive GitHub Project Board (NutritionTracker Board)](https://github.com/users/andres-bs12/projects/3)**
* 🎯 **Jira Cloud Integration:** Project Key `NT`

> 💡 **Task Tracking Workflow:** New features, refactoring, and bug reports are created directly via GitHub Issue Templates (`.github/ISSUE_TEMPLATE`) or GitHub CLI (`gh issue create`). Status changes, pull request merges, and iteration movements update automatically.

---

## 🎯 Sprint Overview

### 🎨 **Sprint 2: Front-End & Security (Aug 03 – Aug 17, 2026)**
- **Goal:** Build the Multi-Page Web Interface matching the Figma design system ("CaloriesTrack Atomic Design v3") and implement Spring Security user data ownership validation.
- **Key Modules:**
  - `NT-74`: Refactor Boilerplate DTOs with Java Records & MapStruct (✅ `Done`)
  - `NT-73`: User Data Ownership Security & IDOR Protection (📅 `To Do`)
  - `NT-33` to `NT-47`: Front-End Layout, Dashboards, Goal Management & REST Client (`app.js`).

### ⚙️ **Sprint 1: Back-End Core (Jul 27 – Aug 10, 2026)**
- **Goal:** Core Spring Boot architecture (Entities, DTOs, Mappers, Repositories, Services, Controllers, and PostgreSQL Schema).
- **Architecture:** Decoupled DTO payload layer (`RequestDTO` / `ResponseDTO`) with `@Component` Mappers and Google OAuth identity linking (`google_id`).

---

## 🧠 Architectural Decision Records (ADRs)

### 💡 ADR-01: Pivot to Google OAuth & Future Telegram Linkage
- **Date:** July 30, 2026 | **Status:** Approved
- **Decision:** Replacing manual email/password auth with Google OAuth eliminates password hashing, reset flows, and email verification overhead while providing a superior one-click user login experience.
- **Identity Linking:** The `User` record in PostgreSQL serves as the core authority. Google OAuth handles Web Auth; Telegram serves as a secondary channel via token pairing (`/start <token>`).

---

## 🗺️ Step-by-Step Execution Guide for Sprint 2

1. **Step 1 (Design System - `NT-34`):** Open `src/main/resources/static/css/styles.css` and define Figma tokens (`:root`) for colors (`#05030d`, `#6417ff`), fonts (`Inter`), glassmorphism, and buttons.
2. **Step 2 (Page 1 - Home - `NT-36`):** Create `src/main/resources/static/index.html` with Header, Kcal remaining hero, 4 KPI cards, Comparison Table, and Latest Entries panel.
3. **Step 3 (Page 2 - Overview - `NT-41`):** Create `src/main/resources/static/overview.html` with Monthly KPI cards and Charts container.
4. **Step 4 (Page 3 - Goal - `NT-45`):** Create `src/main/resources/static/goal.html` with `Goal Settings Panel` form.
5. **Step 5 (REST Integration - `NT-40`, `NT-44`, `NT-47`):** Create `src/main/resources/static/js/app.js` to fetch data from `/api/entry` and `/api/goal`, handle form submissions, and update progress bars dynamically.
