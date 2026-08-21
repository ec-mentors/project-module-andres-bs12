# 📘 Integration Plan: Favorite Meals & Meal Type Categorization

## 1. Executive Summary & Objectives

### Purpose
Introduce **Meal Type Categorization** (`BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`) and a dedicated **Favorite Meals** system to NutritionTracker. This enables users to group their daily intake systematically and log recurring meals in Nutria AI with a single tap.

### Current Implementation Scope
- **Current Phase (Phase 1)**: **Backend Implementation** (Spring Boot 3.4+, Spring AI `gpt-5.6-luna`, PostgreSQL, JPA, REST DTOs, Unit Tests).
- **Subsequent Phase (Phase 2)**: **Frontend Integration Guide** (React 19, TypeScript, Tailwind v4 horizontal pill carousel and 1-tap logging).

---

## 2. Architecture & Domain Model Design

```
+--------------------------------------------------------------------------------+
|                                 DOMAIN ENTITIES                                |
+--------------------------------------------------------------------------------+
|                                                                                |
|   +--------------------------+               +-----------------------------+   |
|   |         User             | 1           * |            Entry            |   |
|   |--------------------------|---------------|-----------------------------|   |
|   | id: UUID                 |               | id: UUID                    |   |
|   | email: String            |               | mealName: String            |   |
|   +--------------------------+               | mealType: MealType [NEW]    |   |
|                 | 1                          | kcal, protein, carbs, fat   |   |
|                 |                            | createdOn: LocalDateTime    |   |
|                 | *                          +-----------------------------+   |
|   +-----------------------------+                                              |
|   |        FavoriteMeal         | [NEW ENTITY]                                 |
|   |-----------------------------|                                              |
|   | id: UUID                    |                                              |
|   | mealName: String            |                                              |
|   | mealType: MealType          |                                              |
|   | kcal, protein, carbs, fat   |                                              |
|   | createdAt: LocalDateTime    |                                              |
|   +-----------------------------+                                              |
|                                                                                |
+--------------------------------------------------------------------------------+
```

### Architectural Principles:
1. **Decoupled Lifecycle**: `FavoriteMeal` represents a reusable **meal template**, completely separated from `Entry` (which represents a historical intake timestamp). Deleting a logged meal does NOT delete a saved favorite.
2. **Mandatory Categorization with Graceful Fallbacks**: Every `Entry` must have a valid `MealType`. If not explicitly provided, the system infers it automatically using the local time window.

---

## 3. Detailed Specifications

### Step 1: Add `MealType` Enum
Create a strongly typed Java Enum in package `com.project.NutritionTracker.enums`:

```java
package com.project.NutritionTracker.enums;

public enum MealType {
    BREAKFAST,
    LUNCH,
    DINNER,
    SNACK
}
```

---

### Step 2: Create `FavoriteMeal` Entity & Database Migration
Create a new JPA entity `FavoriteMeal` mapped to PostgreSQL table `favorite_meal`:

#### SQL Schema (`schema.sql`):
```sql
CREATE TABLE IF NOT EXISTS favorite_meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    meal_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    kcal INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_meal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_favorite_meal_user ON favorite_meal(user_id);
```

#### JPA Entity (`FavoriteMeal.java`):
- Fields: `UUID id`, `@ManyToOne User user`, `String mealName`, `@Enumerated(EnumType.STRING) MealType mealType`, `int kcal`, `int protein`, `int carbs`, `int fat`, `LocalDateTime createdAt`.

---

### Step 3: Update `Entry` Entity
Add `mealType` to `Entry.java`:

#### SQL Schema Update:
```sql
ALTER TABLE entry ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50) NOT NULL DEFAULT 'LUNCH';
```

#### JPA Entity (`Entry.java`):
```java
@Enumerated(EnumType.STRING)
@Column(name = "meal_type", nullable = false)
private MealType mealType;
```

---

### Step 4: Update Data Transfer Objects (DTOs) & Mappers

#### 1. Entry DTOs:
- **`EntryRequestDTO`**:
  ```java
  public record EntryRequestDTO(
      @NotBlank String mealName,
      MealType mealType, // Optional in payload; defaults to time-based fallback if null
      @Min(0) Integer kcal,
      @Min(0) Integer protein,
      @Min(0) Integer carbs,
      @Min(0) Integer fat,
      LocalDateTime createdOn,
      String source
  ) {}
  ```
- **`EntryResponseDTO`**:
  ```java
  public record EntryResponseDTO(
      UUID id,
      String mealName,
      MealType mealType,
      Integer kcal,
      Integer protein,
      Integer carbs,
      Integer fat,
      LocalDateTime createdOn,
      String source
  ) {}
  ```

#### 2. Favorite Meal DTOs:
- **`FavoriteMealRequestDTO`**:
  ```java
  public record FavoriteMealRequestDTO(
      @NotBlank String mealName,
      @NotNull MealType mealType,
      @Min(0) Integer kcal,
      @Min(0) Integer protein,
      @Min(0) Integer carbs,
      @Min(0) Integer fat
  ) {}
  ```
- **`FavoriteMealResponseDTO`**:
  ```java
  public record FavoriteMealResponseDTO(
      UUID id,
      String mealName,
      MealType mealType,
      Integer kcal,
      Integer protein,
      Integer carbs,
      Integer fat,
      LocalDateTime createdAt
  ) {}
  ```

#### 3. AI DTO (`AiMealResponseDTO`):
```java
public record AiMealResponseDTO(
    String mealName,
    MealType mealType, // Inferred by GPT-5.6 Luna
    Integer kcal,
    Integer protein,
    Integer carbs,
    Integer fat,
    String confidenceNote
) {}
```

---

### Step 5: Update Spring AI System Prompt (`AiMealService.java`)
Calibrate the system prompt for `gpt-5.6-luna` to include semantic meal classification:

```text
You are Nutria AI, a precision clinical nutrition intelligence assistant.
Analyze the user's meal and extract:
1. mealName: Concise, appetizing title.
2. mealType: Inferred strictly from food items (BREAKFAST, LUNCH, DINNER, SNACK).
   - Eggs, pancakes, toast, coffee, oats -> BREAKFAST
   - Rice, pasta, chicken, hearty bowls -> LUNCH
   - Soups, fish, salads, light dinners -> DINNER
   - Smoothies, fruits, protein bars, nuts -> SNACK
3. kcal, protein, carbs, fat: Numeric macronutrient breakdown in grams.
4. confidenceNote: Clarification question if uncertain, or confidence note.
```

---

### Step 6: Fallback Time Range Logic (`EntryService.java`)
When `mealType` is null in an entry request, evaluate the current timestamp:

| Local Time Window | Inferred `MealType` |
| :--- | :--- |
| **05:00 - 11:59** | `BREAKFAST` |
| **12:00 - 16:59** | `LUNCH` |
| **17:00 - 21:59** | `DINNER` |
| **22:00 - 04:59** | `SNACK` |

---

### Step 7: REST API Endpoints (`FavoriteMealController.java`)

| Method | Endpoint | Description | Security (`@PreAuthorize`) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/favorite-meal/{userId}` | Create new favorite meal | `#userId == principal.id` |
| `GET` | `/api/favorite-meal/user/{userId}` | Get all favorites for user | `#userId == principal.id` |
| `DELETE` | `/api/favorite-meal/{id}` | Delete favorite meal by ID | `@favoriteMealSecurity.isOwner(#id, principal)` |

---

## 4. Frontend Integration Guide (Phase 2 Learning Roadmap)

*Note: For reference when ready to implement React UI components.*

1. **Nutria Chat Favorite Pills**:
   - Render horizontal scroll row (`overflow-x-auto no-scrollbar`) immediately above `SmartOmnibar`.
   - Filter pills dynamically to match the current time of day (`currentMealType`).
2. **1-Tap Quick Logging**:
   - Clicking a pill triggers `onAddMeal` or renders a pre-filled `MealDraftCard` ready for immediate confirmation.
3. **Star Button (`⭐`) on Meal Cards**:
   - Add favorite toggle button on `MealDraftCard` and `LatestEntriesSidebar` to save any logged meal to `/api/favorite-meal/{userId}` with one click.
