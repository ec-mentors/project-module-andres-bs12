# 📓 NutritionTracker - Learning Journal

This document serves as a development and learning journal to record key concepts, architectural decisions, and notes learned throughout the **NutritionTracker** project.

---

## 📅 2026-08-14 - Google OAuth2 Integration, 5-Step AI/Manual Onboarding & Mobile WebKit Viewport Architecture

### 💡 Key Concepts Learned & Architectural Decisions

1. **Google OAuth2 Authentication Lifecycle & User Profile Modal:**
   - Implemented a dedicated Google Login modal (`GoogleLoginModal.tsx`) and User Profile settings modal (`UserProfileModal.tsx`) with instant demo user fallback and token handling.
   - Connected user profile states dynamically with header navigation and goal formulation.

2. **5-Step Onboarding Architecture (`OnboardingModal.tsx`):**
   - Designed a full-screen exclusive takeover (`h-[100dvh] max-h-[100dvh] overflow-hidden`) that guarantees zero double scrollbars.
   - Built a dual-path onboarding setup:
     - **Path A (AI Setup):** 4 metabolic calculation sub-steps (Primary Objective, Body Stats, Activity Level, Dietary Preference) producing personalized BMR/TDEE targets.
     - **Path B (Manual Setup):** Direct macro and calorie configuration with verified presets (Balanced, High Protein Deficit, Hypertrophy Bulk, Keto).
   - Synchronized a 5-step progress bar and tag pill indicators across all views.

3. **Solving the "Keyboard Dismiss Click-Eater" in Mobile WebKit:**
   - *The Problem:* When an input was focused on mobile, tapping a button or preset card triggered an input blur, collapsing the virtual keyboard and shifting the viewport by ~350px between `touchstart` and `touchend`. The browser cancelled the `click` event because the touch coordinates moved under the finger.
   - *The Solution:* Attached `onMouseDown={(e) => e.preventDefault()}` on interactive buttons and preset cards + added `touch-action: manipulation`. This anchors coordinates during the tap, executes the action immediately, and dismisses the keyboard via programmatic `blur()`.

4. **Action Bar Layer Isolation & Eliminating Kinetic Scroll Interference:**
   - *The Problem:* Transparent action bars allowed scrolling lists to pass beneath action buttons. When touching a button while list inertia was stopping, WebKit's hit-test engine absorbed the click as a "stop scrolling" gesture.
   - *The Solution:* Isolated the action bar with `z-30`, solid theme background (`bg-[#090516]` / `bg-[#f8fafc]`), `touch-manipulation`, and generous `pb-8 sm:pb-10` padding on the scrollable container.

5. **Resolving the Chained Modal `overflow: hidden` Lock Trap:**
   - *The Problem:* When `GoogleLoginModal` closed and immediately opened `OnboardingModal`, `document.body.style.overflow` captured `'hidden'` as `prevOverflow`. When onboarding finished, it restored `'hidden'` to the body, permanently locking vertical scrolling on the Dashboard.
   - *The Solution:* Ensured all modals explicitly reset `document.body.style.overflow = ''` upon closing/unmounting and added a scroll guardian in `App.tsx`.

6. **Mobile Safari Theme Overscroll & `<meta name="theme-color">` Sync:**
   - Synchronized `html.light`, `body.light` with `#f8fafc` and dynamically updated `<meta name="theme-color">` on every theme change to completely eliminate dark canvas seams during pull-to-refresh.

7. **Apple-Style Inline Skeleton Loading & Zero-Flash Transitions:**
   - *The Problem:* Toggling dates in the *Today* view unmounted the entire dashboard to render a spinning logo, creating a disorienting full-screen flash.
   - *The Solution:* Maintained permanent container DOM stability (`HeroKcalCard`, `ConsumedVsLeftTable`, `LatestEntriesSidebar`) and passed `isLoading` props to display soft-rounded Apple-style pulsing skeleton placeholders in-place (`animate-pulse bg-slate-200` in Light mode / `bg-white/10` in Dark mode) without shifting layout coordinates.

8. **Mobile Native Numeric Keypad & Typing Blur Isolation:**
   - *The Problem:* In Step 2 (Body & Profile Stats), typing a single digit caused the keyboard to dismiss because `updateField` was calling `blur()` on every state change. Additionally, mobile browsers were showing the full alphanumeric keyboard.
   - *The Solution:* Removed `blur()` from keystroke change handlers so multi-digit typing stays active, and added `inputMode="numeric"` / `inputMode="decimal"` with `pattern="[0-9]*"` so mobile devices automatically open the 10-key numeric keypad.

---

## 📅 2026-08-13 - (Sprint 3) - Server Deployment on AWS EC2 with Nginx Reverse Proxy & GitHub Deploy Keys (Ticket #533)

### 💡 Key Concepts Learned & Architectural Decisions

1. **Secure Server Authentication via GitHub Deploy Keys (ED25519):**
   - Instead of storing personal user credentials or Personal Access Tokens (PATs) on remote cloud instances, created an SSH key pair (`ssh-keygen -t ed25519`) directly on the EC2 instance and registered the public key as a read-only **Deploy Key** on GitHub (`https://github.com/.../settings/keys`).
   - *Key Realization:* Asymmetric cryptography (Private Key stays on EC2, Public Key stays on GitHub) guarantees isolated, passwordless repository access (`git clone git@github.com:...`) without exposing personal GitHub account privileges or organization-wide access.

2. **Nginx Reverse Proxy Architecture:**
   - Configured Nginx as a reverse proxy listening on Port `80` (HTTP) and forwarding internal traffic to the Spring Boot Docker container listening on Port `8080` (`proxy_pass http://localhost:8080`).
   - *Key Realization:* Nginx acts as the single public entry point ("the digital doorman"), allowing clean domain/IP routing without exposing internal application ports directly to the internet.

3. **Production Container Orchestration (`docker-compose.prod.yml`):**
   - Created a dedicated production Docker Compose configuration running the full-stack container (`nutrition-tracker-prod`) with `restart: always` and passing environment variables connecting to the Amazon RDS PostgreSQL instance (`SPRING_DATASOURCE_URL=jdbc:postgresql://<RDS_ENDPOINT>:5432/postgres`).

4. **Live Cloud Deployment & End-to-End Verification:**
   - Successfully deployed and verified the live application running on AWS EC2 (`http://3.64.127.238`), serving the React frontend and connecting seamlessly to the PostgreSQL database on AWS RDS.

---

## 📅 2026-08-13 - (Sprint 3) - Multi-Stage Dockerfile & Local Container Orchestration with Docker Compose (Ticket #532)

### 💡 Key Concepts Learned & Architectural Decisions

1. **Single-Bundle Full-Stack Containerization Strategy:**
   - Designed a 3-stage `Dockerfile`:
     - **Stage 1 (`frontend-builder`)**: Uses `node:20-alpine` to compile React/Vite into static HTML/JS/CSS assets.
     - **Stage 2 (`backend-builder`)**: Uses `maven:3.9-eclipse-temurin-17` to copy compiled frontend assets directly into Spring Boot's `src/main/resources/static/` directory before packaging the executable `.jar`.
     - **Stage 3 (`runtime`)**: Uses `eclipse-temurin:17-jre` for a lightweight, production-ready runtime container (~180MB).
   - *Key Realization:* Bundling static assets into Spring Boot eliminates the need for a separate frontend web server in development/testing, reducing infrastructure footprint while maintaining complete separation during source development.

2. **Vite Output Path Integration (`vite.config.ts`):**
   - Discovered that Vite was configured to output directly to `../src/main/resources/static`. Adjusted the Dockerfile `COPY --from=frontend-builder /app/src/main/resources/static ./src/main/resources/static` step accordingly.

3. **ARM64 (Apple Silicon) & x86_64 Cross-Platform Compatibility:**
   - Selected `eclipse-temurin:17-jre` to ensure seamless native multi-architecture support across both Apple Silicon Macs (`arm64`) and AWS EC2 Linux instances (`amd64`).

4. **Testing Strategy in CI/CD vs Docker Build (`-DskipTests`):**
   - Understood that `-DskipTests` in Docker build stages prevents build failures caused by missing external database instances during image creation. Comprehensive unit/integration tests run prior to image build in the CI/CD pipeline (e.g. GitHub Actions).

5. **Local Orchestration with `docker-compose.yml`:**
   - Configured `docker-compose.yml` with a `db` (PostgreSQL 16) service and `app` service, using healthchecks (`pg_isready`) and dependency ordering (`depends_on.condition: service_healthy`) to ensure the database initializes before Spring Boot starts.

---

## 📅 2026-08-13 - (Sprint 3) - Cloud Infrastructure Provisioning with AWS EC2, RDS PostgreSQL & Security Groups (Ticket #531)

### 💡 Key Concepts Learned & Architectural Decisions

1. **Decoupled Cloud Architecture (EC2 + RDS Separation):**
   - Separated the web application compute layer (Amazon EC2 `t3.micro` with Ubuntu 24.04 LTS) from the database layer (Amazon RDS PostgreSQL `db.t3.micro`).
   - *Key Realization:* Isolating database storage on RDS ensures application updates, restarts, or server migrations on EC2 do not risk data loss or corruption.

2. **AWS Free Tier Resource Scoping:**
   - Both `t3.micro` EC2 (750 hrs/month) and `db.t3.micro` RDS PostgreSQL (750 hrs/month + 20 GB SSD) fit 100% within the AWS Free Tier, incurring $0.00 cost while providing a production-equivalent environment.

3. **VPC Region Scoping & Latency Optimization:**
   - Realized that resources must be provisioned within the same AWS Region (`eu-central-1` Frankfurt). Cross-region communication causes high network latency and prevents Security Group ID referencing.

4. **Security Group Referencing & Principle of Least Privilege:**
   - **EC2 Inbound Rules:** Port `22` (SSH for administration), Port `80` (HTTP web traffic), Port `443` (HTTPS secure traffic).
   - **RDS Inbound Rules:** Restricted Port `5432` (PostgreSQL) exclusively to the Security Group ID of the EC2 instance (`sg-053ea28a1dd9ff624`). The database is kept completely private from public internet access.
   - *Key Realization:* Referencing Security Group IDs instead of IP CIDR ranges allows dynamic EC2 IP updates without breaking database authorization rules.

5. **SSH Key Pair Security (`.pem` Permissions):**
   - Learned that SSH clients enforce `400` read-only permissions (`chmod 400 ~/.ssh/nutrition-tracker-key.pem`) to prevent unauthorized process access to private keys.

6. **End-to-End Connectivity Verification (`psql`):**
   - Successfully verified network routing and credentials from the Ubuntu EC2 terminal to the RDS PostgreSQL instance using `psql -h <endpoint> -U postgres -d postgres`.

---

## 📅 2026-08-10 - (Sprint 3) - Controller Layer Unit Testing with @WebMvcTest & MockMvc 

### 💡 Key Concepts Learned & Architectural Decisions

1. **Web Layer Slicing with `@WebMvcTest`:**
   - `@WebMvcTest(UserController.class)` loads ONLY Spring MVC components (Controllers, `GlobalExceptionHandler`, Jackson Converters) without scanning `@Service` or `@Repository` beans. This keeps unit tests running in milliseconds.
   - `@AutoConfigureMockMvc(addFilters = false)` disables Spring Security filter evaluation during unit testing to isolate controller mapping and serialization logic.

2. **Filter Component Scanning & Constructor Dependencies (`GoogleAuthFilter`):**
   - *Key Realization:* `@WebMvcTest` automatically scans all `Filter` beans annotated with `@Component` (such as `GoogleAuthFilter`). Since `GoogleAuthFilter` requires `UserRepository` in its constructor, Spring fails to start the test context (`NoSuchBeanDefinitionException`) unless `@MockitoBean private UserRepository userRepository;` is provided as a mock dependency.

3. **HTTP Request Simulation with `MockMvc`:**
   - **Path Variables (`@PathVariable`):** Passed using template syntax: `get("/api/user/{id}", sampleId)`.
   - **Query Parameters (`@RequestParam`):** Passed using `.param("email", sampleEmail)`.
   - **JSON Request Bodies (`@RequestBody`):** Sent using `.contentType(MediaType.APPLICATION_JSON)` and serialized via `objectMapper.writeValueAsString(requestDTO)`.
   - **Plain Text Payloads:** Sent using `.contentType(MediaType.TEXT_PLAIN)` for raw string bodies like Google ID Tokens (`POST /api/user/auth/google`).

4. **JSON Response Assertions with `jsonPath`:**
   - **Single Object:** Evaluates properties using `jsonPath("$.firstName").value("John")`.
   - **JSON Arrays (`GET /api/user`):** Evaluates list size using `jsonPath("$.length()").value(2)` and indexes elements using `jsonPath("$[0].firstName")` and `jsonPath("$[1].firstName")`.

5. **Jackson 3 / Spring Boot 4 Import Package Convention:**
   - In Spring Boot 4 / Jackson 3.x, the `ObjectMapper` package path was moved from `com.fasterxml.jackson.databind.ObjectMapper` to `tools.jackson.databind.ObjectMapper`.

6. **Controller Test Scope vs. Service Business Rules:**
   - Controller tests verify HTTP routing, status codes (`200 OK`, `404 Not Found`), and JSON serialization.
   - Noticed that `updateUser` in `UserService` only updates `firstName` and `lastName` while preserving `email`. Mock responses in controller tests (`UserResponseDTO`) reflect this behavior accurately.

7. **HTTP Response Status Codes Across REST Endpoints:**
   - **`GET` / `PUT`:** Evaluates `200 OK` (`status().isOk()`).
   - **`POST` Creation:** Evaluates `201 Created` (`status().isCreated()`) and asserts the `Location` response header (`.andExpect(header().string("Location", "/api/.../" + id))`).
   - **`DELETE` Removal:** Evaluates `204 No Content` (`status().isNoContent()`) with no payload returned.

8. **Testing `void` Service Methods (`removeEntry`):**
   - For `void` return service methods, no `when(...)` setup is needed for happy path tests because Mockito mocks perform no operation by default for `void` methods.
   - For exception testing on `void` methods, Mockito syntax uses `doThrow(new NotFoundException(...)).when(service).removeEntry(id)`.

9. **Mockito Argument Matchers All-or-Nothing Rule (`eq` & `any`):**
   - When mocking or verifying methods with multiple parameters (e.g. `updateUser(id, dto)` or `updateGoal(id, dto)`), if a matcher (`any(...)` or `isNull()`) is used for one parameter, all other parameters must also use matchers (e.g. `eq(id)`). Mixing raw values with matchers throws `InvalidUseOfMatchersException`.

10. **Sprint 3 Controller Test Suite Completion:**
    - Achieved 100% unit test coverage across all three REST Controllers: `UserControllerTest`, `EntryControllerTest`, and `GoalControllerTest`.

---

## 📅 2026-08-07 - Service Layer Unit Testing with Mockito & JUnit 5 (Sprint 2)

### 💡 Key Concepts Learned & Architectural Decisions

1. **Unit Testing vs. Integration Testing in Spring Boot:**
   - **Unit Tests (Mockito):** Test a single class (`UserService`, `GoalService`, `EntryService`) in complete isolation without launching the Spring Boot application context (`@SpringBootTest`). Uses `@ExtendWith(MockitoExtension.class)` and `@Mock` dependencies. Runs in milliseconds.
   - **Integration Tests (`@SpringBootTest` / `@WebMvcTest`):** Test the interaction between multiple layers (Controller + Service + Repository + Database / HTTP Request-Response pipeline).

2. **The "Why Mock?" Realization & Given-When-Then Pattern:**
   - *Core Concept:* Mocking dependencies (`repository`, `mapper`) does not "hardcode" the test away. Instead, mocks isolate the external world so the test evaluates the **exact Java business logic, edge-case validation, exception throwing, and call orchestration inside the Service class**.
   - *AAA Pattern:*
     - **Given (`when(...).thenReturn(...)`):** Sets up controlled responses for mock dependencies.
     - **When (`service.method(...)`):** Executes the actual real Java code inside the service.
     - **Then (`assertEquals`, `assertThrows`, `verify`):** Asserts return values, verifies exception throwing, and ensures mock methods were invoked the expected number of times (`times(1)`, `never()`).

3. **`ArgumentCaptor` for Dynamic State & Date Verification:**
   - When services mutate entity state before saving (e.g. `goal.setStartDate(LocalDate.now())` or `entry.setCreatedOn(LocalDateTime.now())`), `ArgumentCaptor<T>` captures the exact object passed to `repository.save(captor.capture())` for detailed attribute assertions.

4. **Testing `void` Methods (`removeEntry`):**
   - For `void` return methods, unit tests verify call interactions on `@Mock` objects using `verify(repository, times(1)).deleteById(id)` for success paths and `verify(repository, never()).deleteById(any())` when exceptions are thrown.

5. **Comprehensive Service Test Coverage (45 Unit Tests):**
   - **`UserServiceTest` (17 tests):** Tests `findByEmail`, `findById`, `findByGoogleId`, `updateUser`, `getAllUsers`, `processGoogleAuth`.
   - **`GoalServiceTest` (12 tests):** Tests `createGoal`, `getGoalByUserAndDate`, `findAllGoalsByUser`, `updateGoal`.
   - **`EntryServiceTest` (16 tests):** Tests `findByUser`, `createEntry`, `removeEntry`, `findTodayEntriesByUser`, `updateEntry`.

---

## 📅 2026-08-05 - User Data Ownership Security (IDOR Protection), Google OAuth2 Filter & Role-Based Access Control (RBAC)

### 💡 Key Concepts Learned & Architectural Decisions

1. **IDOR (Insecure Direct Object Reference) Vulnerability & Parameter Spoofing:**
   - *Critical Realization:* Passing `requestingUserId` as an unverified URL parameter (`@RequestParam`) or request body field is a severe security flaw. Any malicious user could change `?userId=uuid_of_victim` to modify or access private records belonging to someone else.
   - *Solution:* User identity must **never** be trusted from client-controlled URL parameters. Identity must be extracted cryptographically from the server-validated security context (`SecurityContextHolder`).

2. **Custom Domain Principal (`UserPrincipal` implementing `UserDetails`):**
   - Created a domain-specific wrapper class `UserPrincipal` that wraps the JPA `User` entity.
   - Added a direct `getId()` getter returning the PostgreSQL `UUID`, enabling **100% type-safe `UUID` to `UUID` comparisons** (`principal.getId().equals(entry.getUser().getId())`) without reflection or string conversion overhead.

3. **Method-Level Authorization with Spring Security `@PreAuthorize` & SpEL:**
   - Enabled `@EnableMethodSecurity` in `SecurityConfig.java`.
   - Built dedicated domain evaluator beans (`EntrySecurity`, `GoalSecurity`) registered with `@Component("entrySecurity")`.
   - Used SpEL expressions to intercept method execution prior to service business logic:
     - Record ownership checks: `@PreAuthorize("isAuthenticated() && @entrySecurity.isOwner(#id, principal)")`.
     - Self-identity checks: `@PreAuthorize("isAuthenticated() && #userId == principal.id")`.

4. **Real Google OAuth2 Filter (`GoogleAuthFilter`):**
   - Created `GoogleAuthFilter` extending `OncePerRequestFilter` to intercept incoming `Authorization: Bearer <GOOGLE_ID_TOKEN>` headers.
   - Decoded and verified Google JWT signatures using `userService.verifyAndProcessGoogleToken(googleIdToken)`.
   - Loaded/created the user in PostgreSQL, wrapped it in `UserPrincipal`, and stored it in `SecurityContextHolder.getContext().setAuthentication(auth)` for the duration of the HTTP request.

5. **Role-Based Access Control (RBAC) vs. Hardcoded Credentials Antipattern:**
   - *Discussion:* Evaluated hardcoding specific admin email strings in `@PreAuthorize("principal.username == 'admin@example.com'")`.
   - *Security Analysis:* Hardcoding specific emails or credentials directly in Java annotations is a security antipattern (*Hardcoded Credentials* / *Security Through Obscurity*). It leaks admin identities in open-source repositories and requires recompiling the app if an email changes.
   - *Enterprise Solution:* Use standard Spring Security Roles (`hasRole('ADMIN')`) backed by `GrantedAuthority` (`SimpleGrantedAuthority("ROLE_ADMIN")`). Roles decouple security logic from specific identity strings, enabling dynamic, environment-based administration in PostgreSQL.

6. **Origin & Extraction of User Emails (`email` field):**
   - *Where does the email come from?* User email addresses originate directly from Google's cryptographically signed ID Token (`id_token`).
   - *Extraction Flow:* When authenticating via Google OAuth2, `GoogleIdTokenVerifier` validates the token signature, and `idToken.getPayload().getEmail()` extracts the verified email. This email is stored in PostgreSQL (`users.email`) and accessed via `user.getEmail()` / `UserPrincipal.getUsername()`.

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
