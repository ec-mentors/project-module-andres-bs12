# 📓 NutritionTracker - Learning Journal

This document serves as a development and learning journal to record key concepts, architectural decisions, and notes learned throughout the **NutritionTracker** project.

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

---

## 📅 YYYY-MM-DD - [Day Title]

### 💡 Key Concepts Learned
- [Write what you learned today...]

### 📝 Notes & AI Discussions
- [Write notes from your discussions...]
