# 🥗 NutritionTracker

NutritionTracker is a modern, high-performance web application and RESTful backend designed to log daily nutrition entries (meals, calories, protein, carbs, fat), track progress against personalized goals, and view interactive monthly analytics.

Built with **Spring Boot 3 (Java 17)** on the backend and **Vite + React 19 + TypeScript + TailwindCSS v4** on the frontend, featuring a custom **Figma Glassmorphism Design System** with **Light & Dark Glass Mode** support.

---

## 📖 Documentation Index

- 📓 **[Backend Learning Journal (docs/learning_journal.md)](docs/learning_journal.md):** Complete architectural decisions, security models, Spring AI deep stubs, and backend development notes.
- 🤖 **[Frontend Learning Journal (frontend/LEARNING_JOURNAL.md)](frontend/LEARNING_JOURNAL.md):** UI takeaways, technical learnings, and AI-assisted frontend development details.
- 🎨 **[Design & UX Documentation (docs/design_and_ux.md)](docs/design_and_ux.md):** Design philosophy, color system rules, Figma evolutions, and mobile touch UX decisions.
- 🧠 **[AI Integration Guide (docs/ai_integration_guide.md)](docs/ai_integration_guide.md):** Multimodal nutrition analysis, Whisper voice integration, and prompt engineering specifications.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TB
    %% Client Tier
    subgraph Clients["📱 Client & Presentation Layer"]
        direction TB
        ReactApp["⚛️ React 19 SPA (Vite 8 + TailwindCSS v4)<br/>• Nutria AI Multimodal Omnibar (Text / Voice / Image)<br/>• Glassmorphism Daily Dashboard & Macro Rings<br/>• Weekly & Monthly Trend Analytics"]
        Telegram["🤖 Telegram Bot Client<br/>• Voice Notes & Quick Meal Logging"]
    end

    %% Security & Gateway
    subgraph Security["🔐 Security & Ingress Gateway"]
        GoogleAuth["🔑 Google Identity Services<br/>(OAuth2 / OIDC)"]
        SecFilterChain["🛡️ Spring Security Filter Chain<br/>• GoogleAuthFilter (Stateless Bearer JWT)<br/>• Method-Level @PreAuthorize IDOR Defense"]
    end

    %% Spring Boot Application Tier
    subgraph Backend["⚙️ Spring Boot 3.4 REST API Layer"]
        direction TB
        subgraph Controllers["REST Controllers"]
            EntryCtrl["/api/entry<br/>EntryController"]
            GoalCtrl["/api/goal<br/>GoalController"]
            UserCtrl["/api/user<br/>UserController"]
            AiCtrl["/api/ai<br/>AiController"]
        end

        subgraph Services["Domain Services & Business Logic"]
            EntrySvc["EntryService<br/>(Macro Calculations & History)"]
            GoalSvc["GoalService<br/>(Goals & Daily Targets)"]
            UserSvc["UserService<br/>(User Profiles & Telegram Sync)"]
            AiMealSvc["AiMealService<br/>(Vision & Text Parsing)"]
            AiAudioSvc["AiAudioService<br/>(Audio Transcription)"]
            AiGoalSvc["AiGoalService<br/>(Goal Formulation Engine)"]
        end
    end

    %% AI Engine Tier
    subgraph AI["🧠 AI Intelligence Engine (Spring AI)"]
        OpenAIGPT["🤖 OpenAI gpt-5.6-luna<br/>• Multimodal Food Image Recognition<br/>• Natural Language Nutritional Parsing<br/>• Structured JSON Output Enforcement"]
        OpenAIWhisper["🎙️ OpenAI whisper-1<br/>• Voice Note Audio Transcription"]
    end

    %% Database Tier
    subgraph Storage["🗄️ Persistence Tier (PostgreSQL)"]
        Postgres[("🐘 PostgreSQL 16 (Spring Data JPA)<br/>• users (Google ID, Profile, Chat ID)<br/>• goal (Macro Targets & Effective Dates)<br/>• entry (Logged Meals, Sources & Nutrients)")]
    end

    %% Client & Gateway Connections
    ReactApp -->|"HTTPS / REST API"| SecFilterChain
    Telegram -->|"Webhooks / Commands"| SecFilterChain
    GoogleAuth -.->|"ID Tokens"| ReactApp
    GoogleAuth -.->|"Token Verification"| SecFilterChain

    %% Ingress to Controllers
    SecFilterChain --> EntryCtrl
    SecFilterChain --> GoalCtrl
    SecFilterChain --> UserCtrl
    SecFilterChain --> AiCtrl

    %% Controllers to Services
    EntryCtrl --> EntrySvc
    GoalCtrl --> GoalSvc
    UserCtrl --> UserSvc
    AiCtrl --> AiMealSvc
    AiCtrl --> AiAudioSvc
    AiCtrl --> AiGoalSvc

    %% AI Integrations
    AiMealSvc -->|"Vision & Prompts"| OpenAIGPT
    AiGoalSvc -->|"User Metrics Prompt"| OpenAIGPT
    AiAudioSvc -->|"Audio Form Data"| OpenAIWhisper
    AiAudioSvc -.->|"Transcribed Text"| AiMealSvc

    %% Persistence Connections
    EntrySvc -->|"JPA / Hibernate"| Postgres
    GoalSvc -->|"JPA / Hibernate"| Postgres
    UserSvc -->|"JPA / Hibernate"| Postgres
```

---

## 🤖 Nutria AI Multimodal Logging Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User / Athlete
    participant UI as ⚛️ React 19 Frontend (Nutria Omnibar)
    participant Sec as 🛡️ Spring Security (GoogleAuthFilter)
    participant AiCtrl as 🎮 AiController (/api/ai/*)
    participant AudioSvc as 🎙️ AiAudioService
    participant MealSvc as 🧠 AiMealService
    participant OpenAI as 🤖 OpenAI (GPT-5.6 Luna / Whisper)
    participant DB as 🐘 PostgreSQL (Spring Data JPA)

    alt Voice Note Logging
        User->>UI: Records voice note ("2 boiled eggs and an avocado")
        UI->>Sec: POST /api/ai/transcribe-audio (multipart/form-data)
        Sec->>AiCtrl: Validates Bearer Token & User Context
        AiCtrl->>AudioSvc: transcribeAudio(audioBytes)
        AudioSvc->>OpenAI: Whisper Audio API call
        OpenAI-->>AudioSvc: Plaintext Transcript
        AudioSvc-->>AiCtrl: Transcript String
        AiCtrl-->>UI: 200 OK + Transcribed Text
    end

    alt Image or Text Meal Parsing
        User->>UI: Uploads food photo or sends text prompt
        UI->>Sec: POST /api/ai/parse-meal-(image|text)
        Sec->>AiCtrl: Validates Bearer Token
        AiCtrl->>MealSvc: parseMealFrom(Image|Text)
        MealSvc->>OpenAI: Spring AI ChatClient (Vision/Text + Structured Schema Prompt)
        OpenAI-->>MealSvc: Structured JSON (mealName, kcal, carbs, fat, protein, confidence)
        MealSvc-->>AiCtrl: AiMealResponseDTO
        AiCtrl-->>UI: 200 OK + AiMealResponseDTO
    end

    User->>UI: Reviews & confirms interactive Meal Draft Card
    UI->>Sec: POST /api/entry (EntryRequestDTO)
    Sec->>DB: Persists Entry with source ("AI_VISION" / "AI_TEXT" / "VOICE")
    DB-->>UI: 201 Created (Live Macro Progress Updated)
```

---

## 🗄️ Database Schema & Data Model

```mermaid
erDiagram
    USERS ||--o{ GOAL : "configures (1:N)"
    USERS ||--o{ ENTRY : "records (1:N)"

    USERS {
        uuid id PK "Primary Key"
        string google_id UK "Google OAuth2 Subject Identifier"
        string email UK "User Email Address"
        string first_name "First Name"
        string last_name "Last Name"
        string role "Role (e.g. USER, ADMIN)"
        bigint telegram_chat_id UK "Linked Telegram Chat ID"
        timestamp created_at "Registration Timestamp"
    }

    GOAL {
        uuid id PK "Primary Key"
        uuid user_id FK "Foreign Key -> USERS.id"
        date start_date "Effective Date (UK with user_id)"
        int kcal "Daily Caloric Target"
        double protein "Protein Goal in Grams"
        double carbs "Carbohydrates Goal in Grams"
        double fat "Fat Goal in Grams"
    }

    ENTRY {
        uuid id PK "Primary Key"
        uuid user_id FK "Foreign Key -> USERS.id"
        string meal_name "Food Item / Meal Description"
        string source "Origin (MANUAL, AI_TEXT, AI_VISION, TELEGRAM)"
        timestamp created_on "Logged Timestamp"
        int kcal "Calories Consumed"
        double protein "Protein in Grams"
        double carbs "Carbohydrates in Grams"
        double fat "Fat in Grams"
    }
```

---

## 💻 Tech Stack & Architecture

### **Backend (Spring Boot 3 / Java 17)**
- **Framework:** Spring Boot 3.4 / Java 17
- **AI Integration:** Spring AI 1.0 + OpenAI `gpt-5.6-luna` (Text & Multimodal Vision) + Whisper `whisper-1` (Voice Note Transcription)
- **Database Persistence:** Spring Data JPA + PostgreSQL (H2 for local dev & automated testing)
- **Security:** Spring Security with OAuth2 / Google Identity Services & `@PreAuthorize` IDOR protection
- **Testing:** JUnit 5, Mockito Deep Stubs, Spring Security Test, MockMvc (**94/94 Unit & Integration Tests Passing - 100% Green**)

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
- OpenAI API Key (Restricted with `Model capabilities: Write` and `Audio: Write`)

### **1. Configure Environment Variables**
```bash
export OPENAI_MEAL_PARSER_KEY="sk-proj-your-openai-api-key"
```
> **Note:** The API key works with any OpenAI model (`gpt-5.6-luna`, `gpt-4o`, `gpt-4o-mini`, etc.) and `whisper-1`. The active model can be customized anytime in `src/main/resources/application.properties`.

### **2. Run Frontend Development Server (Root Command)**
From the project root directory:
```bash
npm run dev
```
- Access locally on Mac: `http://localhost:5173`
- Access on mobile phone (Wi-Fi): `http://<your-local-ip>:5173`

### **3. Run Backend Server (Spring Boot + PostgreSQL)**
In a second terminal window from the project root directory:
```bash
# Run complete unit & integration test suite (94 tests)
./mvnw test

# Start the Spring Boot backend server (runs on port 8080)
./mvnw spring-boot:run
```

### **4. Production Bundle Build (Unified Single-Port Mode)**
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

