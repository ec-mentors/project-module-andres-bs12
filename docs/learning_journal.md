# 📓 NutritionTracker - Learning Journal

This document serves as a development and learning journal to record key concepts, architectural decisions, and notes learned throughout the **NutritionTracker** project.

---

## 📅 2026-07-29 - REST Controllers, HTTP Status Codes & Postman Testing

### 💡 Key Concepts Learned

1. **Spring Boot REST Controllers (`@RestController` & `@RequestMapping`):**
   - Built dedicated controllers for all 3 domain modules: `UserController`, `GoalController`, `EntryController`.
   - Used `@RequestMapping("/api/...")` to set clean, standardized base URL paths.

2. **HTTP Verbs & REST Naming Conventions:**
   - **`POST` (`@PostMapping`):** Resource creation (e.g. `POST /api/user`). Returns `201 Created` with a `Location` header pointing to `/api/user/{id}`.
   - **`GET` (`@GetMapping`):** Resource retrieval. Returns `200 OK` with JSON payload. Avoided sending JSON bodies in `GET` requests; used `@PathVariable` for IDs and `@RequestParam` for query filters (e.g., `?email=...` or `?date=...`).
   - **`PUT` (`@PutMapping`):** Resource updating. Combines `@PathVariable UUID id` and `@RequestBody DTO dto` to update records cleanly.
   - **`DELETE` (`@DeleteMapping`):** Resource deletion. Returns `204 No Content` (`ResponseEntity.noContent().build()`) since no body payload is returned.

3. **HTTP Exception Handling & Status Codes:**
   - **`415 Unsupported Media Type`:** Triggered when Postman sends `text/plain` instead of selecting `raw -> JSON` (`Content-Type: application/json`).
   - **`405 Method Not Allowed`:** Occurs when calling an endpoint with the wrong HTTP verb (e.g., sending `POST` to a `@GetMapping` route).
   - **`404 Not Found`:** Returned when the URL path or resource ID does not match any route or database record.

4. **JSON Naming & Mapping (CamelCase vs Snake_Case):**
   - Jackson maps JSON keys directly to Java DTO variable names.
   - JSON keys sent from clients must match exact DTO camelCase field names (e.g. `mealName`, not `meal_name`), preventing null value database constraint failures.

---

## 📅 2026-07-28 - Repositories, Service Layer & Git Branching Tricks

### 💡 Key Concepts Learned

1. **Spring Data JPA Repositories (`JpaRepository<Entity, UUID>`):**
   - Repositories are interfaces extending `JpaRepository<Entity, UUID>`, providing automatic CRUD methods (`save`, `findById`, `findAll`, `delete`) without writing manual SQL queries.
   - **Derived Query Methods:** Spring Data JPA automatically generates SQL queries based on method signature names:
     - `findByEmail(String email)` in `UserRepository`.
     - `findByUserAndStartDate(User user, LocalDate startDate)` in `GoalRepository`.
     - `findByUser(User user)` in `EntryRepository`.

2. **Git Trick: Create and Switch to a New Branch in One Single Command (`git checkout -b <branch-name>`):**
   - The command `git checkout -b <new-branch-name>` simultaneously **creates a new branch** AND **switches your working context to it** in one single step.
   - **Moving Uncommitted Work:** If you accidentally start writing code on `main` before creating your feature branch, **do NOT worry**. As long as you haven't committed the changes yet, running `git checkout -b <new-branch-name>` creates the new branch and safely moves all your uncommitted edits over to it in one command, leaving `main` completely clean!

3. **Spring Boot Service Layer Architecture (`@Service`):**
   - **Orchestration:** The `@Service` class acts as the business brain connecting Mappers, Repositories, and Validation rules.
   - **Direct `@Service` Classes:** Pragmatic design choice to create direct `@Service` classes (`UserService`, `GoalService`, `EntryService`) without unnecessary interfaces, keeping the code clean and easy to navigate.
   - **Root vs Dependent Entities:** Root entities like `User` map directly via `mapper.toEntity(dto)`, whereas dependent entities like `Entry` and `Goal` have their parent `User` attached in the Service (`entry.setUser(user)`).
   - **Single Query with `orElseThrow()`:** `repository.findById(id).orElseThrow(() -> new NotFoundException(...))` executes a single DB query instead of double-querying with `isPresent()`.

---

## 📅 2026-07-27 - Database Architecture, JPA Entities, DTOs & Mappers

### 💡 Key Concepts Learned

1. **`SERIAL` vs `UUID` in PostgreSQL:**
   - `SERIAL` is a PostgreSQL syntax shortcut for auto-incrementing integers (`1, 2, 3...`).
   - `UUID` (128-bit) generates globally unique, unguessable identifiers (`a0eebc99-9c0b...`), preventing URL resource enumeration attacks (`/api/entries/uuid` instead of `/api/entries/42`).
   - Generated automatically in PostgreSQL using `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.

2. **Constraint `CONSTRAINT uk_user_goal_date UNIQUE (user_id, start_date)`:**
   - Ensures that the **combination** of `user_id` and `start_date` is unique across the `goal` table.
   - Guarantees that a user can only have **one target goal per date**.
   - If a user updates their goal twice on the same day, the system performs an `UPDATE` instead of creating a duplicate record (`INSERT`).
   - Reflected in Java JPA using `@Table(uniqueConstraints = {@UniqueConstraint(name = "...", columnNames = {"user_id", "start_date"})})`.

3. **Date Mapping in Java (`java.time.LocalDate` vs `java.util.Date`):**
   - For SQL `DATE` columns (date only without time), modern Java 8+ uses **`java.time.LocalDate`** (avoiding legacy `java.util.Date`).

4. **Object-Oriented Relationships with `@ManyToOne`:**
   - In SQL, we think in terms of Foreign Key columns (`user_id`).
   - In Java JPA, we think in terms of Objects: `private User user;` annotated with `@ManyToOne` and `@JoinColumn(name = "user_id")`.
   - Allows direct object navigation in Java: `goal.getUser().getFirstName()`.
   - Does NOT create a 3rd table; it simply creates the `user_id` FK column inside the `goal` table.

5. **DTO Architecture (Data Transfer Objects):**
   - **`RequestDTO`**: Used for incoming HTTP payloads. Contains only client-editable fields, preventing users from forging IDs or timestamps.
   - **`ResponseDTO`**: Used for outgoing HTTP responses. Excludes sensitive data (like `passwordHash`) and prevents JSON circular reference errors (`StackOverflowError`).

6. **Dedicated Mapper Component Pattern:**
   - Decided to use dedicated `@Component` classes (e.g. `EntryMapper`, `GoalMapper`, `UserMapper`) to translate between Entities and DTOs.
   - Keeps the Service layer clean, readable, and decoupled from mapping logic.

7. **Git Workflow: Merging `main` into a Feature Branch:**
   - **Step 1:** Save/commit pending work on feature branch (`git add . && git commit -m "wip"` or `git stash`).
   - **Step 2:** Update local `main` branch from GitHub (`git checkout main && git pull origin main`).
   - **Step 3:** Switch back to feature branch and merge `main` (`git checkout <feature-branch> && git merge main --no-edit`).

---

## 📅 YYYY-MM-DD - [Day Title]

### 💡 Key Concepts Learned
- [Write what you learned today...]

### 📝 Notes & AI Discussions
- [Write notes from your discussions...]
