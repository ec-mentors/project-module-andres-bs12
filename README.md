# NutritionTracker

NutritionTracker is a Spring Boot application designed to help users log their daily nutrition entries (meals, calories, macros) and track them against custom daily nutritional goals.

---

## 🎯 Sprint 1: Back-End Roadmap (Jira Project: NT | Parent Epic: `BE S1` - `NT-55`)

**Sprint Duration:** July 27, 2026 – August 10, 2026  
**Goal:** Implement core Spring Boot architecture (Entities, DTOs, Mappers, Repositories, Services, Controllers, and Database Schema).

> 💡 **Architectural Decision:** Using DTOs (`RequestDTO` and `ResponseDTO`) along with dedicated `@Component` Mappers (`UserMapper`, `GoalMapper`, `EntryMapper`) to decouple the public API payload layer from JPA database entities.

### 📋 Sprint 1 Backlog & Tasks (Jira Project: NT)

| Issue Key | Summary | Component | Status | Due Date |
| :--- | :--- | :--- | :---: | :---: |
| **`NT-8`** | Create a diagram | Documentation & DB | ✅ `Done` | Jul 27, 2026 |
| **`NT-4`** | Add entities | Models (`User`, `Goal`, `Entry`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-7` | *Create User entity* | Model (`User.java`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-6` | *Create Goal entity* | Model (`Goal.java`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-5` | *Create Entry entity* | Model (`Entry.java`) | ✅ `Done` | Jul 27, 2026 |
| **`NT-10`** | Add dtos | DTO Layer | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-11` | *Create User DTO* | DTO (`UserRequestDTO`, `UserResponseDTO`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-12` | *Create Goal DTO* | DTO (`GoalRequestDTO`, `GoalResponseDTO`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-13` | *Create Entry DTO* | DTO (`EntryRequestDTO`, `EntryResponseDTO`) | ✅ `Done` | Jul 27, 2026 |
| **`NT-21`** | Add mappers | Mapper Layer | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-22` | *Create User Mapper* | Mapper (`UserMapper.java`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-23` | *Create Goal Mapper* | Mapper (`GoalMapper.java`) | ✅ `Done` | Jul 27, 2026 |
| ↳ `NT-24` | *Create Entry Mapper* | Mapper (`EntryMapper.java`) | ✅ `Done` | Jul 27, 2026 |
| **`NT-14`** | Add repository | Repository Layer | ✅ `Done` | Jul 28, 2026 |
| ↳ `NT-15` | *Create User Repository* | JPA (`UserRepository`) | ✅ `Done` | Jul 28, 2026 |
| ↳ `NT-17` | *Create Goal Repository* | JPA (`GoalRepository`) | ✅ `Done` | Jul 28, 2026 |
| ↳ `NT-16` | *Create Entry Repository* | JPA (`EntryRepository`) | ✅ `Done` | Jul 28, 2026 |
| **`NT-18`** | Add service | Service Layer | ✅ `Done` | Jul 28, 2026 |
| ↳ `NT-25` | *Create User Service* | Service (`UserService.java`) | ✅ `Done` | Jul 28, 2026 |
| ↳ `NT-26` | *Create Goal Service* | Service (`GoalService.java`) | ✅ `Done` | Jul 28, 2026 |
| ↳ `NT-27` | *Create Entry Service* | Service (`EntryService.java`) | ✅ `Done` | Jul 28, 2026 |
| **`NT-19`** | Add controller | REST Controller Layer | ✅ `Done` | Jul 29, 2026 |
| ↳ `NT-28` | *Create User Controller* | REST (`UserController.java`) | ✅ `Done` | Jul 29, 2026 |
| ↳ `NT-29` | *Create Goal Controller* | REST (`GoalController.java`) | ✅ `Done` | Jul 29, 2026 |
| ↳ `NT-30` | *Create Entry Controller* | REST (`EntryController.java`) | ✅ `Done` | Jul 29, 2026 |
| **`NT-20`** | Get presentation ready | Project Delivery | ✅ `Done` | Jul 31, 2026 |
| **`NT-65`** | BE Testing Setup & Verification | Back-End Testing | 📅 `To Do` | Aug 05, 2026 |
| ↳ `NT-66` | *Setup H2 Test DB Config* | Test Config (`pom.xml`) | 📅 `To Do` | Aug 03, 2026 |
| ↳ `NT-67` | *Create UserRepositoryTest* | Repository Test (`@DataJpaTest`) | 📅 `To Do` | Aug 04, 2026 |
| ↳ `NT-68` | *Create GoalRepositoryTest* | Repository Test (`@DataJpaTest`) | 📅 `To Do` | Aug 04, 2026 |
| ↳ `NT-69` | *Create EntryRepositoryTest* | Repository Test (`@DataJpaTest`) | 📅 `To Do` | Aug 04, 2026 |
| ↳ `NT-70` | *Create Service Layer Unit Tests* | Service Test (`Mockito`) | 📅 `To Do` | Aug 05, 2026 |

---

### 🧠 Architectural Decision Record (ADR-01): Pivot to Google OAuth & Future Telegram Linkage

**Date:** July 30, 2026  
**Status:** Approved  

#### ❓ Context & Questions Raised:
During Sprint 1, two architectural questions were evaluated:
1. Is traditional Email/Password authentication optimal, or is Google OAuth ("Log in with Google") significantly better for UX?
2. If we pivot to Google OAuth now, will it remain compatible with the planned Telegram Bot integration in Sprint 2?

#### 💡 Decision & Rationale:
- **Pivot to Google OAuth:** Replacing manual email/password auth with Google OAuth eliminates password hashing, reset flows, and email verification overhead while providing a superior one-click user login experience.
- **Identity Linking & Telegram Compatibility:** In our domain model, the `User` record in PostgreSQL is the core authority. Google OAuth serves as the Web Authentication Provider, whereas Telegram will serve as a Communication Channel.
- **Sprint 2 Telegram Scope:** Telegram integration will be implemented in Sprint 2 using a temporary token pairing mechanism (`/start <token>`). This ADR ensures the database schema (`google_id`, `telegram_chat_id`) is pre-configured in Sprint 1 without implementing Telegram logic yet.

---

## 🎨 Sprint 2: Front-End Roadmap (Jira Project: NT | Parent Epic: `FE S2` - `NT-71`)

**Sprint Duration:** August 03, 2026 – August 17, 2026  
**Goal:** Implement the Multi-Page Web Application matching the exact Figma design system ("CaloriesTrack Atomic Design v3").

> 💡 **Sequential Dependencies:** Every task in Jira Cloud is linked with native blocker dependencies (`is blocked by` / `blocks`). Tasks must be executed in order from `NT-33` down to `NT-47`.

### 📋 Sprint 2 Backlog & Tasks (Jira Project: NT)

| Issue Key | Summary | Component | Status | Due Date |
| :--- | :--- | :--- | :---: | :---: |
| **`NT-74`** | Refactor Boilerplate DTOs with Java Records & MapStruct | Back-End / DTOs | ✅ `Done` | Aug 04, 2026 |
| **`NT-73`** | Investigate & Implement User Data Ownership Security (IDOR Protection) | Back-End / Security | 📅 `To Do` | Aug 07, 2026 |
| **`NT-33`** | Design System & Global Layout Setup | Frontend / Assets | ⏳ `In Progress` | Aug 03, 2026 |
| ↳ `NT-34` | *Setup Figma Design Tokens CSS (`styles.css`)* | Styles (`css/styles.css`) | ⏳ `In Progress` | Aug 03, 2026 |
| ↳ `NT-35` | *Build Shared Navigation Header Component* | HTML Component | ⏳ `In Progress` | Aug 04, 2026 |
| **`NT-36`** | Page 1: Home / Daily Dashboard (`index.html`) | Frontend / Page 1 | 📅 `To Do` | Aug 06, 2026 |
| ↳ `NT-37` | *Build Kcal Remaining Hero & 4 Macro KPI Cards* | UI Component | 📅 `To Do` | Aug 05, 2026 |
| ↳ `NT-38` | *Build Goal vs Actual Comparison Table* | UI Component | 📅 `To Do` | Aug 05, 2026 |
| ↳ `NT-39` | *Build Latest Entries Side Panel* | UI Component | 📅 `To Do` | Aug 06, 2026 |
| ↳ `NT-40` | *Connect Home page JS to REST API* | JavaScript (`app.js`) | 📅 `To Do` | Aug 06, 2026 |
| **`NT-41`** | Page 2: Overview / Analytics Dashboard (`overview.html`) | Frontend / Page 2 | 📅 `To Do` | Aug 09, 2026 |
| ↳ `NT-42` | *Build Monthly Balance KPI Row Cards* | UI Component | 📅 `To Do` | Aug 08, 2026 |
| ↳ `NT-43` | *Build Charts Container (Macro Distribution & Trend)* | Charts Component | 📅 `To Do` | Aug 08, 2026 |
| ↳ `NT-44` | *Connect Overview JS to Analytics REST Data* | JavaScript (`overview.js`) | 📅 `To Do` | Aug 09, 2026 |
| **`NT-45`** | Page 3: Set Goal Management (`goal.html`) | Frontend / Page 3 | 📅 `To Do` | Aug 11, 2026 |
| ↳ `NT-46` | *Build Goal Settings Panel Form* | UI Component | 📅 `To Do` | Aug 10, 2026 |
| ↳ `NT-47` | *Connect Goal Form to REST API* | JavaScript (`goal.js`) | 📅 `To Do` | Aug 11, 2026 |

---

### 🗺️ Step-by-Step Execution Guide for Sprint 2

To build this yourself step-by-step, follow this recommended sequence:

1. **Step 1 (Design System - `NT-34`):** Open `src/main/resources/static/css/styles.css` and define the Figma variables (`:root`) for colors (`#05030d`, `#6417ff`), fonts (`Inter`), glassmorphism cards, and buttons.
2. **Step 2 (Page 1 - Home - `NT-36`):** Create `src/main/resources/static/index.html` with the Header, Kcal remaining hero, 4 KPI cards, Comparison Table, and Latest Entries panel.
3. **Step 3 (Page 2 - Overview - `NT-41`):** Create `src/main/resources/static/overview.html` with the Monthly KPI cards and Charts container.
4. **Step 4 (Page 3 - Goal - `NT-45`):** Create `src/main/resources/static/goal.html` with the `Goal Settings Panel` form.
5. **Step 5 (REST Integration - `NT-40`, `NT-44`, `NT-47`):** Create `src/main/resources/static/js/app.js` to fetch data from `/api/entry` and `/api/goal`, handle form submissions, and update progress bars dynamically.
