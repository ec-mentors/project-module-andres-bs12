# 📓 NutritionTracker - Learning Journal

This document serves as a development and learning journal to record key concepts, architectural decisions, and notes learned throughout the **NutritionTracker** project.

---

## 📅 2026-08-04 - Refactoring DTO Boilerplate: Java Records, MapStruct Automation & Spring Security Ownership

### 💡 Key Concepts Learned & Architectural Discussions

1. **Java Records (Java 14+) for In-Memory DTOs:**
   - Migrated all Request and Response DTOs (`UserRequestDTO`, `UserResponseDTO`, `GoalRequestDTO`, `GoalResponseDTO`, `EntryRequestDTO`, `EntryResponseDTO`) from Lombok POJOs (`@Data`) to native **Java Records**.
   - Records are immutable, transparent data carriers declared in a single line (e.g. `public record UserRequestDTO(String firstName, String lastName, String email, String googleId) {}`).
   - Replaced getter naming conventions from JavaBeans style (`dto.getFirstName()`) to record accessor syntax (`dto.firstName()`).

2. **Automated Compile-Time Mapping with MapStruct:**
   - Replaced manual setter/getter translation classes with MapStruct declarative interfaces (`@Mapper(componentModel = "spring")`).
   - MapStruct generates high-performance Java implementation code (`GoalMapperImpl.java`) at compile-time without reflection overhead.
   - Configured `pom.xml` using `mapstruct`, `mapstruct-processor`, and `lombok-mapstruct-binding` for seamless compatibility between Lombok `@Entity` classes and MapStruct DTO interfaces.
   - Used `@Mapping(target = "...", ignore = true)` to explicitly declare fields generated server-side (`id`, `createdAt`, `startDate`, `user`) versus client-supplied fields.

3. **Layered Architecture & Responsibilities (DTO vs. Entity vs. Service):**
   - **`RequestDTO` (Input Shield):** Accepts strictly client-permitted parameters, preventing clients from forging primary keys (`id`) or dates (`createdAt`).
   - **`ResponseDTO` (Output Security Filter):** Guarantees that internal database state or sensitive fields are never exposed to external HTTP clients.
   - **`@Entity` (Persistence Layer):** Maps PostgreSQL tables, primary keys (`UUID`), unique constraints, and foreign key relationships (`@ManyToOne`).
   - **`@Service` (Business Brain):** Orchestrates database lookups, applies server-side timestamps (`LocalDateTime.now()`), and delegates pure data conversion to MapStruct (`mapper.toEntity(dto)`).

4. **Spring Security Ownership Validation & IDOR Prevention:**
   - Evaluated **IDOR** (*Insecure Direct Object References*) risks where users could attempt to modify resources belonging to others by manipulating URL path variables (`PUT /api/goal/{id}`).
   - Explored Spring Security `@PreAuthorize` method security with custom evaluation beans (`@goalSecurity.isOwner(#id, authentication)`).
   - Demonstrated how pre-authorization interceptors reject unauthorized access with HTTP `403 Forbidden` prior to executing service layer business logic.

---

## 📅 2026-07-30 - Identity Linking Architecture, JPA `@Column` Deep-Dive & Conventional Commits

### 💡 Key Concepts Learned & Architectural Discussions

1. **Identity Linking Architecture (Google OAuth & Telegram Token Pairing):**
   - A single `User` entity in PostgreSQL serves as the core authority for user data (meals, goals, macros).
   - Switched from traditional Email/Password to Google OAuth: eliminates password hashing (BCrypt), password reset flows, and email confirmation steps, improving UX with one-click login.
   - Confirmed Telegram token pairing (`/start <token>`) remains 100% compatible for Sprint 2 identity linking.

2. **JPA `@Column` Annotation vs. Database Constraints (`schema.sql`):**
   - **Why use `@Column` in Java if SQL already has constraints?**
     - *In-Memory Validation:* Hibernate checks `@Column(nullable = false)` in Java RAM before attempting network I/O or sending SQL queries to PostgreSQL.
     - *DDL Generation:* Tools and test environments (`ddl-auto`) read Java annotations to build tables automatically.
     - *Code Self-Documentation:* Explicitly documents column constraints directly inside `User.java`.
   - **Naming Rules:**
     - For single-word matching fields (e.g., `email`), `name` can be omitted: `@Column(nullable = false, unique = true)`.
     - For multi-word fields converting Java `camelCase` to SQL `snake_case` (e.g., `googleId` $\rightarrow$ `google_id`), specifying `name = "google_id"` guarantees explicit mapping.

3. **Nullable vs. Unique Constraints on Linked Account Identifiers (`telegram_chat_id`):**
   - `telegram_chat_id` must be **`NULLABLE`** (default) because users register via Google on the Web before linking Telegram. Enforcing `NOT NULL` would block new web signups.
   - `telegram_chat_id` must be **`UNIQUE`** (`unique = true`) because no two users can share the same Telegram account.
   - *SQL Insight:* PostgreSQL allows multiple `NULL` values in a `UNIQUE` column because SQL standards treat `NULL` values as non-equal.

4. **Conventional Commits Standard & Workflow Efficiency:**
   - Standard format: `<type>(<scope>): <short description>`.
   - **The Golden Rule (`feat` vs `refactor`):**
     - `feat:` Used when adding a **new capability, field, or endpoint** to the system (e.g., adding `google_id` to `schema.sql` & `User.java`).
     - `refactor:` Used when **reorganizing existing code** without changing external system behavior or API capabilities.
     - `fix:`, `docs:`, `chore:`, `test:` for bug fixes, documentation, build config, and testing respectively.
   - **Workflow Shortcuts:** Combined staging & committing via `git commit -am "msg"` (for tracked files) and `git add . && git commit -m "msg"` or custom Git aliases (`git config --global alias.ac '!git add -A && git commit -m'`).

5. **Development vs. Production Google Token Verification (`verifyAndProcessGoogleToken`):**
   - Implemented `processGoogleAuth(dto)` for direct development testing via Postman.
   - Implemented `verifyAndProcessGoogleToken(googleIdToken)` using `GoogleIdTokenVerifier` (`google-api-client`) to cryptographically verify incoming Google JWT signatures, extract verified `sub` (`googleId`), `email`, `given_name`, `family_name` claims, and delegate to `processGoogleAuth(dto)`.
   - Clarified that when connecting a future Web Frontend button, switching the controller invocation from `processGoogleAuth` to `verifyAndProcessGoogleToken` is the single change required, keeping the database service layer 100% untouched.

### 📝 Notes & AI Mentor Discussions
- Evaluated domain lifecycle of `User` fields: verified that `email` must be retained alongside `google_id` (Google provides email for user display, notifications, and identity checks).
- Recorded Architectural Decision Record (ADR-01) in `README.md` and created Jira tasks `BE-28` through `BE-32` directly via Jira Cloud REST API.
- Verified end-to-end compilation with Maven (`BUILD SUCCESS`) and pushed commits to GitHub.

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
