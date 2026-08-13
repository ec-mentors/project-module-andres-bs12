# 🥗 NutritionTracker

NutritionTracker is a modern, high-performance web application and RESTful backend designed to log daily nutrition entries (meals, calories, protein, carbs, fat), track progress against personalized goals, and view interactive monthly analytics.

Built with **Spring Boot 3 (Java 17)** on the backend and **Vite + React 19 + TypeScript + TailwindCSS v4** on the frontend, featuring a custom **Figma Glassmorphism Design System** with **Light & Dark Glass Mode** support.

---

## 📖 Documentation Index

- 🤖 **[Learning Journal & AI Reflections (LEARNING_JOURNAL.md)](frontend/LEARNING_JOURNAL.md):** Personal takeaways, technical learnings, and AI-assisted frontend development details.
- 🎨 **[Design & UX Documentation (docs/design_and_ux.md)](docs/design_and_ux.md):** Design philosophy, color system rules, Figma evolutions, and mobile touch UX decisions.

---

## 🗄️ Database Schema & Data Model

```mermaid
erDiagram
    USER ||--o{ GOAL : "defines (1:N)"
    USER ||--o{ ENTRY : "logs (1:N)"

    USER {
        uuid id PK
        string google_id UK
        string email UK
        string first_name
        string last_name
        string role
        bigint telegram_chat_id
        timestamp created_at
    }

    GOAL {
        uuid id PK
        uuid user_id FK
        date start_date
        int kcal
        int protein
        int carbs
        int fat
    }

    ENTRY {
        uuid id PK
        uuid user_id FK
        string meal_name
        timestamp logged_at
        int kcal
        int protein
        int carbs
        int fat
    }
```

---

## 💻 Tech Stack & Architecture

### **Backend (Spring Boot 3 / Java 17)**
- **Framework:** Spring Boot 3.4 / Java 17
- **Database Persistence:** Spring Data JPA + PostgreSQL (H2 for local dev & automated testing)
- **Security:** Spring Security with OAuth2 / Google Identity Services & `@PreAuthorize` IDOR protection
- **Testing:** JUnit 5, Mockito, Spring Security Test (**74/74 Unit & Integration Tests Passing**)

### **Frontend (Vite + React + TypeScript + TailwindCSS)**
- **UI Architecture:** Vite 8, React 19, TypeScript 5.8, TailwindCSS v4, Lucide React Icons
- **Development Method:** AI-Assisted Pair Programming (Google Antigravity / Gemini AI)
- **REST Client & State:** Type-safe API client wrapper (`services/api.ts`) connecting React components to Spring Boot REST endpoints

---

## 🚀 Getting Started & How to Run

### **Prerequisites**
- Java 17 or higher
- Node.js 18+ and npm
- Maven 3.8+

### **1. Run Frontend Development Server (Root Command)**
From the project root directory:
```bash
npm run dev
```
- Access locally on Mac: `http://localhost:5173`
- Access on mobile phone (Wi-Fi): `http://<your-local-ip>:5173` (e.g. `http://10.0.0.207:5173`)

### **2. Run Backend Server (Spring Boot + PostgreSQL)**
In a second terminal window from the project root directory:
```bash
# Run unit & integration test suite (74 tests)
./mvnw test

# Start the Spring Boot backend server (runs on port 8080)
./mvnw spring-boot:run
```

### **3. Production Bundle Build (Unified Single-Port Mode)**
To compile the static React frontend into Spring Boot's static resources:
```bash
npm run build
```
Emits compiled static assets directly to `src/main/resources/static/`. Running `./mvnw spring-boot:run` will serve both the REST API and the React SPA natively on `http://localhost:8080`.

---

## 📌 Project Management & Sprints

Task tracking and sprint planning are managed via **GitHub Issues & Projects** and synchronized with **Jira Cloud**.

* 🚀 **[View Live GitHub Issues & Backlog](https://github.com/ec-mentors/project-module-andres-bs12/issues)**
* 📊 **[View Interactive GitHub Project Board](https://github.com/users/andres-bs12/projects/3)**

---

## 📄 License
This project is open-source and developed for the NutritionTracker module.
