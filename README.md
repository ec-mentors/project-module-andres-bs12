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

### 🔒 **Sprint 2: DTO Refactoring & Security Ownership (Aug 03 – Aug 10, 2026)**
- **Goal:** Modernize DTO layer and implement Spring Security user data ownership validation.
- **Tasks & Milestone:** `Milestone: Sprint2`
  - Refactor Boilerplate DTOs with Java Records & MapStruct (✅ `Done` - Issue #12)
  - Investigate and Implement User Data Ownership Security / IDOR Protection (✅ `Done` - Issue #11)

### 🎨 **Sprint 3: Front-End Architecture & REST Client (Aug 10 – Aug 24, 2026)**
- **Goal:** Build the Multi-Page Web Interface matching the Figma design system ("CaloriesTrack Atomic Design v3") and connect UI components to REST API endpoints.
- **Tasks & Milestone:** `Milestone: Sprint3`
  - Design System, Figma Design Tokens (`styles.css`), Header & Layout Components (Issues #14 - #16)
  - Page 1: Home / Daily Dashboard & Kcal Hero, Macro Cards, Comparison Table, Side Panel (Issues #17 - #21)
  - Page 2: Overview / Analytics Dashboard, Monthly Balance KPI, Charts Container (Issues #22 - #25)
  - Page 3: Goal Settings Panel Form & REST API Client Integration (Issues #26 - #28)

### ⚙️ **Sprint 1: Back-End Core (Jul 27 – Aug 10, 2026)**
- **Goal:** Core Spring Boot architecture (Entities, DTOs, Mappers, Repositories, Services, Controllers, and PostgreSQL Schema).
- **Architecture:** Decoupled DTO payload layer (`RequestDTO` / `ResponseDTO`) with `@Component` Mappers and Google OAuth identity linking (`google_id`).

---

## 🧠 Architectural Decision Records (ADRs)

### 💡 ADR-01: Pivot to Google OAuth & Future Telegram Linkage
- **Date:** July 30, 2026 | **Status:** Approved
- **Decision:** Replacing manual email/password auth with Google OAuth eliminates password hashing, reset flows, and email verification overhead while providing a superior one-click user login experience.
- **Identity Linking:** The `User` record in PostgreSQL serves as the core authority. Google OAuth handles Web Auth; Telegram serves as a secondary channel via token pairing (`/start <token>`).

### 💡 ADR-02: User Data Ownership & IDOR Protection via Spring Security `@PreAuthorize` & `UserPrincipal`
- **Date:** August 5, 2026 | **Status:** Approved
- **Context & Critical Realization:** Initially attempted passing `requestingUserId` as an HTTP URL parameter (`@RequestParam`). However, critical analysis revealed a severe **IDOR (Insecure Direct Object Reference)** vulnerability: any malicious user could spoof the `userId` in the URL parameter to access or alter private records belonging to another user.
- **Key Learning & Solution:** Realized that user identity must never be trusted from unverified request parameters. Implemented a domain-specific `UserPrincipal` wrapper implementing `UserDetails`. Delegated record-level authorization to Spring Security (`@EnableMethodSecurity` + `@PreAuthorize("@entrySecurity.isOwner(#entryId, principal)")`), performing a 100% type-safe `UUID` to `UUID` comparison against the cryptographically verified security context in memory.

---

## 🗺️ Step-by-Step Execution Guide for Sprint 2

1. **Step 1 (Design System - `NT-34`):** Open `src/main/resources/static/css/styles.css` and define Figma tokens (`:root`) for colors (`#05030d`, `#6417ff`), fonts (`Inter`), glassmorphism, and buttons.
2. **Step 2 (Page 1 - Home - `NT-36`):** Create `src/main/resources/static/index.html` with Header, Kcal remaining hero, 4 KPI cards, Comparison Table, and Latest Entries panel.
3. **Step 3 (Page 2 - Overview - `NT-41`):** Create `src/main/resources/static/overview.html` with Monthly KPI cards and Charts container.
4. **Step 4 (Page 3 - Goal - `NT-45`):** Create `src/main/resources/static/goal.html` with `Goal Settings Panel` form.
5. **Step 5 (REST Integration - `NT-40`, `NT-44`, `NT-47`):** Create `src/main/resources/static/js/app.js` to fetch data from `/api/entry` and `/api/goal`, handle form submissions, and update progress bars dynamically.
