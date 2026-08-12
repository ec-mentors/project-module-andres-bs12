# 🥗 NutritionTracker

NutritionTracker is a modern, high-performance web application and RESTful backend designed to log daily nutrition entries (meals, calories, protein, carbs, fat), track progress against personalized goals, and view interactive monthly analytics.

Built with **Spring Boot 3 (Java 17)** on the backend and **Vite + React 19 + TypeScript + TailwindCSS v4** on the frontend, featuring a custom **Figma Glassmorphism Design System** with **Light & Dark Glass Mode** support.

---

## 📖 Documentation Index

- 🤖 **[Learning Journal & AI Reflections (LEARNING_JOURNAL.md)](LEARNING_JOURNAL.md):** Personal takeaways, technical learnings, and AI-assisted frontend development details.
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

## 🚀 Getting Started & Local Development

### **Prerequisites**
- Java 17 or higher
- Node.js 18+ and npm
- Maven 3.8+

### **1. Run Backend (Spring Boot)**
```bash
# Clone the repository
git clone https://github.com/ec-mentors/project-module-andres-bs12.git
cd NutritionTracker

# Compile and run unit tests (74 tests)
./mvnw test

# Start the Spring Boot backend server (runs on port 8080)
./mvnw spring-boot:run
```

### **2. Run Frontend (Vite + React)**
In a second terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server exposed to local network (runs on port 5173)
npm run dev -- --host 0.0.0.0 --port 5173
```

### **3. Production Bundle Build**
To build the static frontend bundle for Spring Boot serving:
```bash
npm --prefix frontend run build
```
Emits static assets directly to `src/main/resources/static/`, allowing Spring Boot to serve the SPA natively.

---

## 📌 Project Management & Sprints

Task tracking and sprint planning are managed via **GitHub Issues & Projects** and synchronized with **Jira Cloud**.

* 🚀 **[View Live GitHub Issues & Backlog](https://github.com/ec-mentors/project-module-andres-bs12/issues)**
* 📊 **[View Interactive GitHub Project Board](https://github.com/users/andres-bs12/projects/3)**

---

## 📄 License
This project is open-source and developed for the NutritionTracker module.
