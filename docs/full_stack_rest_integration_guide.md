# 🎓 Frontend-to-Backend Connection Guide: Connecting React to Your Spring Boot API

A practical, first-principles tutorial on how to wire your React 19 + TypeScript frontend to your existing Spring Boot backend (`/api/favorite-meal/...`), handle asynchronous state, and maintain robust data synchronization.

---

## 📑 Table of Contents
1. [The Big Picture: What Happens on the Wire](#1-the-big-picture-what-happens-on-the-wire)
2. [Your Existing Backend Inventory](#2-your-existing-backend-inventory)
3. [Step 1: The TypeScript Contract (`types/favoriteMeal.ts`)](#3-step-1-the-typescript-contract)
4. [Step 2: The API Client Layer (`services/api.ts`)](#4-step-2-the-api-client-layer)
5. [Step 3: React State Synchronization (`App.tsx`)](#5-step-3-react-state-synchronization)
6. [Step 4: Writing the CRUD Action Handlers](#6-step-4-writing-the-crud-action-handlers)
7. [Step 5: Optimistic vs. Pessimistic UI Updates & Sequence Protocol](#7-step-5-optimistic-vs-pessimistic-ui-updates--sequence-protocol)
8. [Step 6: Testing & Debugging with Browser Network Tools](#8-step-6-testing--debugging-with-browser-network-tools)
9. [Self-Check Questions & Deep Dives](#9-self-check-questions--deep-dives)

---

## 1. The Big Picture: What Happens on the Wire

When a user interacts with your React application, data moves across four distinct architectural tiers:

<div align="center">
<svg role="img" aria-labelledby="arch-title arch-desc" viewBox="0 0 1000 520" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 960px; height: auto; display: block; margin: 1rem 0; border: 1px solid rgba(45,49,66,0.12); border-radius: 8px; background: #ffffff;">
  <title id="arch-title">Full-Stack Architecture and Data Flow</title>
  <desc id="arch-desc">System topology connecting React frontend state, api client fetch layer, Spring Boot controllers, services, repositories, and PostgreSQL database.</desc>

  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#4f5d75"/>
    </marker>
    <marker id="arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#eb6c36"/>
    </marker>
    <marker id="arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2e5aa8"/>
    </marker>
  </defs>

  <!-- 1. Background -->
  <rect width="100%" height="100%" fill="#f5f5f5"/>

  <!-- 2. Zone Containers (z-order: behind arrows & nodes) -->
  <!-- Zone A: Client Tier -->
  <rect x="24" y="24" width="288" height="420" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
  <rect x="36" y="28" width="136" height="16" rx="2" fill="#f5f5f5"/>
  <text x="104" y="40" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.12em">FRONTEND CLIENT TIER</text>

  <!-- Zone B: Network Wire & Auth Boundary -->
  <rect x="340" y="24" width="180" height="420" rx="8" fill="rgba(235,108,54,0.02)" stroke="rgba(235,108,54,0.30)" stroke-width="0.8" stroke-dasharray="4,4"/>
  <rect x="352" y="28" width="156" height="16" rx="2" fill="#f5f5f5"/>
  <text x="430" y="40" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.12em">AUTH &amp; NETWORK PROXY</text>

  <!-- Zone C: Backend Application Tier -->
  <rect x="548" y="24" width="244" height="420" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
  <rect x="560" y="28" width="144" height="16" rx="2" fill="#f5f5f5"/>
  <text x="632" y="40" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.12em">SPRING BOOT 3 REST TIER</text>

  <!-- Zone D: Persistence Tier -->
  <rect x="820" y="24" width="156" height="420" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
  <rect x="832" y="28" width="124" height="16" rx="2" fill="#f5f5f5"/>
  <text x="894" y="40" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.12em">PERSISTENCE STORAGE</text>

  <!-- 3. Connectors & Paths (drawn before nodes) -->
  <!-- Flow 1: UI to State -->
  <path d="M 168,136 V 176" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="144" y="148" width="48" height="12" rx="2" fill="#f5f5f5"/>
  <text x="168" y="157" fill="#7a8399" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">ACTION</text>

  <!-- Flow 2: State to API Client -->
  <path d="M 168,252 V 292" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="140" y="264" width="56" height="12" rx="2" fill="#f5f5f5"/>
  <text x="168" y="273" fill="#7a8399" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">DISPATCH</text>

  <!-- Flow 3: API Client to Network Gateway -->
  <path d="M 284,332 H 360" fill="none" stroke="#2e5aa8" stroke-width="1.2" marker-end="url(#arrow-link)"/>
  <rect x="296" y="318" width="56" height="12" rx="2" fill="#f5f5f5"/>
  <text x="324" y="327" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">FETCH()</text>

  <!-- Flow 4: Gateway to Controller -->
  <path d="M 496,332 H 568" fill="none" stroke="#eb6c36" stroke-width="1.2" marker-end="url(#arrow-accent)"/>
  <rect x="508" y="318" width="48" height="12" rx="2" fill="#f5f5f5"/>
  <text x="532" y="327" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">BEARER</text>

  <!-- Flow 5: Controller to Service -->
  <path d="M 670,292 V 252" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="644" y="264" width="52" height="12" rx="2" fill="#f5f5f5"/>
  <text x="670" y="273" fill="#7a8399" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">DELEGATE</text>

  <!-- Flow 6: Service to Repository -->
  <path d="M 670,176 V 136" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="640" y="148" width="60" height="12" rx="2" fill="#f5f5f5"/>
  <text x="670" y="157" fill="#7a8399" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">JPA QUERY</text>

  <!-- Flow 7: Repository to PostgreSQL Database -->
  <path d="M 772,96 H 840" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="784" y="82" width="48" height="12" rx="2" fill="#f5f5f5"/>
  <text x="808" y="91" fill="#7a8399" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.06em">SQL/TCP</text>

  <!-- 4. Node Boxes -->
  <!-- Node 1: React UI Components -->
  <rect x="52" y="60" width="232" height="76" rx="6" fill="#f5f5f5"/>
  <rect x="52" y="60" width="232" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
  <rect x="60" y="68" width="40" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.4)" stroke-width="0.8"/>
  <text x="80" y="77" fill="rgba(45,49,66,0.8)" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">REACT</text>
  <text x="168" y="96" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">UI Components</text>
  <text x="168" y="116" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">NutriaChatFeed · MealDraftCard</text>

  <!-- Node 2: React State -->
  <rect x="52" y="176" width="232" height="76" rx="6" fill="#f5f5f5"/>
  <rect x="52" y="176" width="232" height="76" rx="6" fill="rgba(45,49,66,0.05)" stroke="#4f5d75" stroke-width="1"/>
  <rect x="60" y="184" width="40" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.4)" stroke-width="0.8"/>
  <text x="80" y="193" fill="rgba(45,49,66,0.8)" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">STATE</text>
  <text x="168" y="212" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">React State &amp; Hooks</text>
  <text x="168" y="232" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">useState&lt;FavoriteMeal[]&gt; · useEffect</text>

  <!-- Node 3: API Client -->
  <rect x="52" y="292" width="232" height="80" rx="6" fill="#f5f5f5"/>
  <rect x="52" y="292" width="232" height="80" rx="6" fill="#ffffff" stroke="#2e5aa8" stroke-width="1.2"/>
  <rect x="60" y="300" width="44" height="12" rx="2" fill="transparent" stroke="rgba(46,90,168,0.5)" stroke-width="0.8"/>
  <text x="82" y="309" fill="#2e5aa8" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">CLIENT</text>
  <text x="168" y="328" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">REST Client Service</text>
  <text x="168" y="348" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">src/services/api.ts · fetch()</text>

  <!-- Node 4: Network Gateway & Proxy -->
  <rect x="360" y="292" width="136" height="80" rx="6" fill="#f5f5f5"/>
  <rect x="360" y="292" width="136" height="80" rx="6" fill="rgba(235,108,54,0.05)" stroke="#eb6c36" stroke-width="1.2"/>
  <rect x="368" y="300" width="44" height="12" rx="2" fill="transparent" stroke="rgba(235,108,54,0.5)" stroke-width="0.8"/>
  <text x="390" y="309" fill="#eb6c36" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">GATEWAY</text>
  <text x="428" y="328" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Vite Proxy</text>
  <text x="428" y="348" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">:5173 /api → :8080</text>

  <!-- Node 5: Spring Boot Controller (Focal Accent) -->
  <rect x="568" y="292" width="204" height="80" rx="6" fill="#f5f5f5"/>
  <rect x="568" y="292" width="204" height="80" rx="6" fill="rgba(235,108,54,0.08)" stroke="#eb6c36" stroke-width="1.2"/>
  <rect x="576" y="300" width="60" height="12" rx="2" fill="transparent" stroke="rgba(235,108,54,0.5)" stroke-width="0.8"/>
  <text x="606" y="309" fill="#eb6c36" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">CONTROLLER</text>
  <text x="670" y="328" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">FavoriteMealController</text>
  <text x="670" y="348" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">/api/favorite-meal/*</text>

  <!-- Node 6: Spring Service -->
  <rect x="568" y="176" width="204" height="76" rx="6" fill="#f5f5f5"/>
  <rect x="568" y="176" width="204" height="76" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
  <rect x="576" y="184" width="48" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.4)" stroke-width="0.8"/>
  <text x="600" y="193" fill="rgba(45,49,66,0.8)" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">SERVICE</text>
  <text x="670" y="212" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">FavoriteMealService</text>
  <text x="670" y="232" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">@PreAuthorize · @Transactional</text>

  <!-- Node 7: JPA Repository -->
  <rect x="568" y="60" width="204" height="76" rx="6" fill="#f5f5f5"/>
  <rect x="568" y="60" width="204" height="76" rx="6" fill="rgba(45,49,66,0.05)" stroke="#4f5d75" stroke-width="1"/>
  <rect x="576" y="68" width="56" height="12" rx="2" fill="transparent" stroke="rgba(45,49,66,0.4)" stroke-width="0.8"/>
  <text x="604" y="77" fill="rgba(45,49,66,0.8)" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">REPOSITORY</text>
  <text x="670" y="96" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">FavoriteMealRepository</text>
  <text x="670" y="116" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Spring Data JPA · UUID</text>

  <!-- Node 8: PostgreSQL Database (Focal Accent 2) -->
  <rect x="840" y="60" width="124" height="76" rx="6" fill="#f5f5f5"/>
  <rect x="840" y="60" width="124" height="76" rx="6" fill="rgba(235,108,54,0.05)" stroke="#eb6c36" stroke-width="1"/>
  <rect x="848" y="68" width="48" height="12" rx="2" fill="transparent" stroke="rgba(235,108,54,0.4)" stroke-width="0.8"/>
  <text x="872" y="77" fill="#eb6c36" font-size="7" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.08em">DATABASE</text>
  <text x="902" y="96" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">PostgreSQL</text>
  <text x="902" y="116" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">favorite_meals:5432</text>

  <!-- 5. Legend Strip -->
  <line x1="24" y1="468" x2="976" y2="468" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
  <text x="24" y="492" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LEGEND</text>

  <!-- Legend Items -->
  <rect x="100" y="484" width="12" height="12" rx="2" fill="rgba(235,108,54,0.08)" stroke="#eb6c36" stroke-width="1"/>
  <text x="120" y="493" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Focal REST / DB</text>

  <rect x="250" y="484" width="12" height="12" rx="2" fill="#ffffff" stroke="#2e5aa8" stroke-width="1"/>
  <text x="270" y="493" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">API Client (fetch)</text>

  <rect x="410" y="484" width="12" height="12" rx="2" fill="rgba(45,49,66,0.05)" stroke="#4f5d75" stroke-width="1"/>
  <text x="430" y="493" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">State &amp; Repositories</text>

  <line x1="570" y1="490" x2="590" y2="490" stroke="#2e5aa8" stroke-width="1.2" marker-end="url(#arrow-link)"/>
  <text x="600" y="493" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">HTTP Request</text>

  <line x1="720" y1="490" x2="740" y2="490" stroke="#eb6c36" stroke-width="1.2" marker-end="url(#arrow-accent)"/>
  <text x="750" y="493" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Bearer Authenticated</text>

  <line x1="880" y1="490" x2="900" y2="490" stroke="#4f5d75" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="910" y="493" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Trust Boundary</text>
</svg>
</div>

### Why do we need an API Client layer (`api.ts`)?
- **Separation of Concerns**: Your UI components (buttons, modals, cards) shouldn't care about HTTP headers, status codes, or URL paths. They only care about calling `fetchFavorites()` and getting data.
- **Centralized Authentication**: If the auth token changes or headers need adjustment, you update it in **one** place (`api.ts`), not in 20 different components.
- **Type Safety**: Ensures every network response is strictly validated against TypeScript interfaces before reaching your UI components.

---

## 2. Your Existing Backend Inventory

Here is the exact contract from your existing `FavoriteMealController.java` and DTOs:

| HTTP Method | Endpoint Path | Description | Request Body | Response Body |
|---|---|---|---|---|
| `GET` | `/api/favorite-meal/get-all/{userId}` | Fetch all favorites for a user | *None* | `List<FavoriteMealResponseDTO>` |
| `POST` | `/api/favorite-meal/create/{userId}` | Create a new favorite meal | `FavoriteMealRequestDTO` | `FavoriteMealResponseDTO` (201) |
| `PUT` | `/api/favorite-meal/update/{fMealId}` | Update an existing favorite | `FavoriteMealRequestDTO` | `FavoriteMealResponseDTO` (200) |
| `DELETE` | `/api/favorite-meal/remove/{fMealId}` | Delete a favorite meal | *None* | *Empty* (204 No Content) |
| `POST` | `/api/favorite-meal/convert/{userId}` | Convert an existing entry to favorite | `Entry` object | `FavoriteMealResponseDTO` (200) |

### JSON Field Names (camelCase):
- `mealName` (string)
- `mealType` (`"BREAKFAST"` \| `"LUNCH"` \| `"DINNER"` \| `"SNACK"`)
- `kcal` (number)
- `protein` (number)
- `carbs` (number)
- `fat` (number)

---

## 3. Step 1: The TypeScript Contract

In `frontend/src/types/favoriteMeal.ts`, ensure you have the types that mirror your Java records:

```typescript
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

// Matches Java FavoriteMealResponseDTO
export interface FavoriteMeal {
  id: string;          // Maps from Java UUID
  mealName: string;
  mealType: MealType;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt?: string;  // Maps from Java LocalDate (e.g. "2026-08-28")
}

// Matches Java FavoriteMealRequestDTO
export interface CreateFavoriteMealPayload {
  mealName: string;
  mealType: MealType;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
```

---

## 4. Step 2: The API Client Layer (`frontend/src/services/api.ts`)

Let's break down **where** in your project to write these functions and **how** each line works.

### 📍 Location 1: Import Types at the Top of `frontend/src/services/api.ts`
Open [`frontend/src/services/api.ts`](file:///Users/andresbejarano/dev/NutritionTracker/frontend/src/services/api.ts) and add the `FavoriteMeal` import at **Line 2**:

```typescript
import type { MealEntry, CreateMealEntryPayload, NutritionGoal, SetGoalPayload, DailySummary } from '../types/nutrition';
import type { FavoriteMeal, CreateFavoriteMealPayload } from '../types/favoriteMeal'; // <--- ADD THIS LINE
import type { UserProfile } from '../types/user';
```

---

### 📍 Location 2: Add Functions at the Bottom of `frontend/src/services/api.ts`
Scroll to the **very bottom** of [`frontend/src/services/api.ts`](file:///Users/andresbejarano/dev/NutritionTracker/frontend/src/services/api.ts) (after `updateGoal`, around **Line 375**) and add the following 4 exported functions:

---

### Function 1: Fetching All Favorites (`GET`)
**File**: `frontend/src/services/api.ts` (at the bottom)

```typescript
export const fetchFavorites = async (userId?: string): Promise<FavoriteMeal[]> => {
  // 1. Guard clause: If user is not logged in, return empty array immediately
  if (!userId) return [];

  // 2. Perform HTTP GET request to your Spring Boot endpoint
  const response = await fetch(`/api/favorite-meal/get-all/${userId}`, {
    method: 'GET',
    headers: authHeaders(), // Sends Authorization: Bearer <token>
  });

  // 3. Check HTTP Status
  if (!response.ok) {
    throw new Error(`Failed to fetch favorites: HTTP ${response.status}`);
  }

  // 4. Parse JSON stream into JavaScript array
  return await response.json();
};
```

> [!TIP]
> **Why `response.ok`?**
> `fetch()` in JavaScript only rejects its Promise on network failure (e.g., DNS failure, offline). If the server returns `404 Not Found` or `500 Server Error`, `fetch()` still resolves! That's why you must check `response.ok` (`status >= 200 && status < 300`).

---

### Function 2: Creating a Favorite (`POST`)
**File**: `frontend/src/services/api.ts` (at the bottom)

```typescript
export const createFavoriteMeal = async (
  userId: string, 
  payload: CreateFavoriteMealPayload
): Promise<FavoriteMeal> => {
  if (!userId) {
    throw new Error('User ID is required to create a favorite meal');
  }

  const response = await fetch(`/api/favorite-meal/create/${userId}`, {
    method: 'POST',
    headers: authHeaders('application/json'), // Sets Content-Type: application/json + Bearer token
    body: JSON.stringify(payload),           // Serializes JS object to JSON string
  });

  if (!response.ok) {
    throw new Error(`Failed to create favorite meal: HTTP ${response.status}`);
  }

  // Returns the newly created meal with its server-generated UUID
  return await response.json();
};
```

---

### Function 3: Updating a Favorite (`PUT`)
**File**: `frontend/src/services/api.ts` (at the bottom)

```typescript
export const updateFavoriteMeal = async (
  fMealId: string, 
  payload: CreateFavoriteMealPayload
): Promise<FavoriteMeal> => {
  const response = await fetch(`/api/favorite-meal/update/${fMealId}`, {
    method: 'PUT',
    headers: authHeaders('application/json'),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update favorite meal: HTTP ${response.status}`);
  }

  return await response.json();
};
```

---

### Function 4: Deleting a Favorite (`DELETE`)
**File**: `frontend/src/services/api.ts` (at the bottom)

```typescript
export const deleteFavoriteMeal = async (fMealId: string): Promise<void> => {
  const response = await fetch(`/api/favorite-meal/remove/${fMealId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  // CRITICAL: Spring Boot returns HTTP 204 No Content for successful deletes.
  // Calling response.json() on an empty body will crash with a SyntaxError!
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to remove favorite: HTTP ${response.status}`);
  }
};
```

---

### 📍 Location 3: How `App.tsx` imports these functions
Once written in `api.ts`, you import them at the top of [`frontend/src/App.tsx`](file:///Users/andresbejarano/dev/NutritionTracker/frontend/src/App.tsx) around **Line 26**:

```typescript
import { 
  fetchAllEntries,
  fetchTodayEntries,
  createMealEntry, 
  updateMealEntry, 
  deleteMealEntry, 
  fetchGoal, 
  updateGoal,
  fetchFavorites,      // <--- IMPORTED FROM api.ts
  createFavoriteMeal,  // <--- IMPORTED FROM api.ts
  updateFavoriteMeal,  // <--- IMPORTED FROM api.ts
  deleteFavoriteMeal,  // <--- IMPORTED FROM api.ts
  clearAuthToken,
} from './services/api';
```

---

## 5. Step 3: React State Synchronization (`App.tsx`)

In React, the single source of truth for favorites lives in `App.tsx`:

```typescript
// 1. Declare state (starts empty)
const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);

// 2. Fetch from backend when user logs in or userId changes
useEffect(() => {
  async function loadFavorites() {
    if (!userId) {
      setFavorites([]); // Clear state if logged out
      return;
    }

    try {
      const data = await fetchFavorites(userId);
      setFavorites(data);
    } catch (err) {
      console.error('Error loading favorites from backend:', err);
    }
  }

  loadFavorites();
}, [userId]); // Re-runs automatically whenever userId changes
```

---

## 6. Step 4: Writing the CRUD Action Handlers

These handlers are passed as props to child components (`LatestEntriesSidebar`, `ManageFavoritesModal`, `NutriaChatFeed`):

### 1. Adding a Favorite:
```typescript
const handleAddFavorite = async (payload: CreateFavoriteMealPayload) => {
  if (!userId) return;

  try {
    // 1. Call server API
    const newFavorite = await createFavoriteMeal(userId, payload);
    // 2. Append to React state
    setFavorites((prev) => [newFavorite, ...prev]);
  } catch (err) {
    console.error('Failed to create favorite on server:', err);
  }
};
```

### 2. Updating a Favorite:
```typescript
const handleUpdateFavorite = async (id: string, payload: CreateFavoriteMealPayload) => {
  try {
    // 1. Call server API
    const updated = await updateFavoriteMeal(id, payload);
    // 2. Replace the item in state by matching ID
    setFavorites((prev) =>
      prev.map((fav) => (fav.id === id ? updated : fav))
    );
  } catch (err) {
    console.error('Failed to update favorite on server:', err);
  }
};
```

### 3. Deleting a Favorite:
```typescript
const handleDeleteFavorite = async (id: string) => {
  try {
    // 1. Call server API
    await deleteFavoriteMeal(id);
    // 2. Remove from state by filtering out ID
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  } catch (err) {
    console.error('Failed to delete favorite on server:', err);
  }
};
```

---

## 7. Step 5: Optimistic vs. Pessimistic UI Updates & Sequence Protocol

<div align="center">
<svg role="img" aria-labelledby="seq-title seq-desc" viewBox="0 0 1000 620" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 960px; height: auto; display: block; margin: 1.5rem 0; border: 1px solid rgba(45,49,66,0.12); border-radius: 8px; background: #ffffff;">
  <title id="seq-title">Favorite Meals Sequence Diagram</title>
  <desc id="seq-desc">Time-ordered sequence showing asynchronous message flow between User, React UI, API Client, Spring Boot Controllers, and PostgreSQL database.</desc>

  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#4f5d75"/>
    </marker>
    <marker id="arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#eb6c36"/>
    </marker>
    <marker id="arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2e5aa8"/>
    </marker>
  </defs>

  <!-- 1. Background -->
  <rect width="100%" height="100%" fill="#f5f5f5"/>

  <!-- 2. Lifelines (x = 100, 300, 500, 700, 900) -->
  <line x1="100" y1="72" x2="100" y2="540" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="300" y1="72" x2="300" y2="540" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="500" y1="72" x2="500" y2="540" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="700" y1="72" x2="700" y2="540" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="900" y1="72" x2="900" y2="540" stroke="#4f5d75" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- 3. Activation Bars -->
  <rect x="96" y="104" width="8" height="240" rx="2" fill="rgba(45,49,66,0.12)" stroke="#4f5d75" stroke-width="0.8"/>
  <rect x="296" y="108" width="8" height="236" rx="2" fill="rgba(45,49,66,0.12)" stroke="#4f5d75" stroke-width="0.8"/>
  <rect x="496" y="140" width="8" height="172" rx="2" fill="rgba(46,90,168,0.15)" stroke="#2e5aa8" stroke-width="0.8"/>
  <rect x="696" y="172" width="8" height="108" rx="2" fill="rgba(235,108,54,0.15)" stroke="#eb6c36" stroke-width="0.8"/>
  <rect x="896" y="204" width="8" height="44" rx="2" fill="rgba(45,49,66,0.12)" stroke="#4f5d75" stroke-width="0.8"/>

  <!-- 4. Combined Fragment: Optimistic Delete with Rollback -->
  <rect x="40" y="372" width="920" height="156" rx="4" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.22)" stroke-width="1"/>
  <rect x="40" y="372" width="48" height="16" rx="2" fill="#f5f5f5" stroke="rgba(45,49,66,0.22)" stroke-width="1"/>
  <text x="64" y="384" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle" letter-spacing="0.12em">OPT</text>
  <text x="96" y="384" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" letter-spacing="0.04em">[on delete with error rollback]</text>

  <rect x="96" y="400" width="8" height="116" rx="2" fill="rgba(45,49,66,0.12)" stroke="#4f5d75" stroke-width="0.8"/>
  <rect x="296" y="400" width="8" height="116" rx="2" fill="rgba(45,49,66,0.12)" stroke="#4f5d75" stroke-width="0.8"/>
  <rect x="496" y="432" width="8" height="68" rx="2" fill="rgba(46,90,168,0.15)" stroke="#2e5aa8" stroke-width="0.8"/>
  <rect x="696" y="460" width="8" height="32" rx="2" fill="rgba(235,108,54,0.15)" stroke="#eb6c36" stroke-width="0.8"/>

  <!-- 5. Messages & Sequence Flows -->
  <line x1="104" y1="116" x2="296" y2="116" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="156" y="102" width="88" height="12" rx="2" fill="#f5f5f5"/>
  <text x="200" y="111" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">1. SAVE FAVORITE</text>

  <line x1="304" y1="148" x2="496" y2="148" stroke="#2e5aa8" stroke-width="1.2" marker-end="url(#arrow-link)"/>
  <rect x="340" y="134" width="120" height="12" rx="2" fill="#f5f5f5"/>
  <text x="400" y="143" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">2. createFavoriteMeal()</text>

  <line x1="504" y1="180" x2="696" y2="180" stroke="#eb6c36" stroke-width="1.2" marker-end="url(#arrow-accent)"/>
  <rect x="540" y="166" width="120" height="12" rx="2" fill="#f5f5f5"/>
  <text x="600" y="175" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">3. POST /create/{userId}</text>

  <line x1="704" y1="212" x2="896" y2="212" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="748" y="198" width="104" height="12" rx="2" fill="#f5f5f5"/>
  <text x="800" y="207" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">4. INSERT INTO meals</text>

  <line x1="896" y1="244" x2="704" y2="244" stroke="#4f5d75" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow)"/>
  <rect x="748" y="230" width="104" height="12" rx="2" fill="#f5f5f5"/>
  <text x="800" y="239" fill="#7a8399" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">5. Row UUID created</text>

  <line x1="696" y1="276" x2="504" y2="276" stroke="#eb6c36" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-accent)"/>
  <rect x="548" y="262" width="104" height="12" rx="2" fill="#f5f5f5"/>
  <text x="600" y="271" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">6. HTTP 201 Created</text>

  <line x1="496" y1="308" x2="304" y2="308" stroke="#2e5aa8" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-link)"/>
  <rect x="348" y="294" width="104" height="12" rx="2" fill="#f5f5f5"/>
  <text x="400" y="303" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">7. Promise.resolve()</text>

  <path d="M 304,324 H 332 V 340 H 304" fill="none" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="340" y="326" width="112" height="12" rx="2" fill="#f5f5f5"/>
  <text x="396" y="335" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">8. setFavorites([new])</text>

  <!-- Fragment Messages -->
  <line x1="104" y1="412" x2="296" y2="412" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="152" y="398" width="96" height="12" rx="2" fill="#f5f5f5"/>
  <text x="200" y="407" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">9. DELETE FAVORITE</text>

  <path d="M 304,420 H 328 V 436 H 304" fill="none" stroke="#eb6c36" stroke-width="1.2" marker-end="url(#arrow-accent)"/>
  <rect x="336" y="422" width="128" height="12" rx="2" fill="#f5f5f5"/>
  <text x="400" y="431" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">10. 0ms Instant UI vanish</text>

  <line x1="304" y1="452" x2="496" y2="452" stroke="#2e5aa8" stroke-width="1.2" marker-end="url(#arrow-link)"/>
  <rect x="340" y="438" width="120" height="12" rx="2" fill="#f5f5f5"/>
  <text x="400" y="447" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">11. deleteFavoriteMeal()</text>

  <line x1="504" y1="472" x2="696" y2="472" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="540" y="458" width="120" height="12" rx="2" fill="#f5f5f5"/>
  <text x="600" y="467" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">12. DELETE /remove/{id}</text>

  <line x1="696" y1="492" x2="504" y2="492" stroke="#eb6c36" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow-accent)"/>
  <rect x="544" y="478" width="112" height="12" rx="2" fill="#f5f5f5"/>
  <text x="600" y="487" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">13. HTTP 500 Network Err</text>

  <path d="M 304,500 H 332 V 516 H 304" fill="none" stroke="#2d3142" stroke-width="1.2" marker-end="url(#arrow)"/>
  <rect x="340" y="502" width="128" height="12" rx="2" fill="#f5f5f5"/>
  <text x="404" y="511" fill="#2d3142" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">14. Rollback: set(prev)</text>

  <!-- 6. Actor Header Boxes -->
  <rect x="40" y="24" width="120" height="48" rx="6" fill="#f5f5f5"/>
  <rect x="40" y="24" width="120" height="48" rx="6" fill="#ffffff" stroke="#2d3142" stroke-width="1"/>
  <text x="100" y="46" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">User</text>
  <text x="100" y="60" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">Browser Client</text>

  <rect x="232" y="24" width="136" height="48" rx="6" fill="#f5f5f5"/>
  <rect x="232" y="24" width="136" height="48" rx="6" fill="rgba(45,49,66,0.05)" stroke="#4f5d75" stroke-width="1"/>
  <text x="300" y="46" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">React UI &amp; State</text>
  <text x="300" y="60" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">App.tsx / Hooks</text>

  <rect x="432" y="24" width="136" height="48" rx="6" fill="#f5f5f5"/>
  <rect x="432" y="24" width="136" height="48" rx="6" fill="#ffffff" stroke="#2e5aa8" stroke-width="1.2"/>
  <text x="500" y="46" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">API Client Layer</text>
  <text x="500" y="60" fill="#2e5aa8" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">src/services/api.ts</text>

  <rect x="620" y="24" width="160" height="48" rx="6" fill="#f5f5f5"/>
  <rect x="620" y="24" width="160" height="48" rx="6" fill="rgba(235,108,54,0.08)" stroke="#eb6c36" stroke-width="1.2"/>
  <text x="700" y="46" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">Spring REST &amp; Service</text>
  <text x="700" y="60" fill="#eb6c36" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">FavoriteMealController</text>

  <rect x="832" y="24" width="136" height="48" rx="6" fill="#f5f5f5"/>
  <rect x="832" y="24" width="136" height="48" rx="6" fill="rgba(45,49,66,0.05)" stroke="#4f5d75" stroke-width="1"/>
  <text x="900" y="46" fill="#2d3142" font-size="12" font-weight="600" font-family="'Geist', sans-serif" text-anchor="middle">PostgreSQL DB</text>
  <text x="900" y="60" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" text-anchor="middle">favorite_meals</text>

  <!-- 7. Legend Strip -->
  <line x1="24" y1="568" x2="976" y2="568" stroke="rgba(45,49,66,0.12)" stroke-width="0.8"/>
  <text x="24" y="592" fill="#4f5d75" font-size="8" font-family="'Geist Mono', monospace" letter-spacing="0.14em">LEGEND</text>

  <line x1="100" y1="590" x2="120" y2="590" stroke="#4f5d75" stroke-width="1.2" marker-end="url(#arrow)"/>
  <text x="130" y="593" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Sync Method Call</text>

  <line x1="260" y1="590" x2="280" y2="590" stroke="#2e5aa8" stroke-width="1.2" marker-end="url(#arrow-link)"/>
  <text x="290" y="593" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">API Fetch Request</text>

  <line x1="420" y1="590" x2="440" y2="590" stroke="#eb6c36" stroke-width="1.2" marker-end="url(#arrow-accent)"/>
  <text x="450" y="593" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Authenticated HTTP</text>

  <line x1="590" y1="590" x2="610" y2="590" stroke="#4f5d75" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrow)"/>
  <text x="620" y="593" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Return / Response</text>

  <rect x="750" y="584" width="20" height="12" rx="2" fill="rgba(45,49,66,0.05)" stroke="rgba(45,49,66,0.3)" stroke-width="0.8"/>
  <text x="780" y="593" fill="#2d3142" font-size="8" font-family="'Geist', sans-serif">Combined Fragment (OPT)</text>
</svg>
</div>

### What is the difference?

| Strategy | Behavior | Best Used For |
|---|---|---|
| **Pessimistic** (Standard) | Wait for server HTTP 200/204 before updating state. | Creating new records, financial checkouts, dangerous edits. |
| **Optimistic** (Instant UX) | Update state instantly (0ms latency). If the server fails, roll back to the previous state. | Deleting items, toggling stars/likes, quick toggles. |

### How to write an Optimistic Delete with Rollback:
```typescript
const handleDeleteFavoriteOptimistic = async (id: string) => {
  // 1. Save snapshot of current state before modifying
  const previousFavorites = favorites;

  // 2. Instant UI update (User sees item vanish immediately)
  setFavorites((prev) => prev.filter((fav) => fav.id !== id));

  try {
    // 3. Make HTTP request in background
    await deleteFavoriteMeal(id);
  } catch (err) {
    // 4. Server failed! Restore previous snapshot
    console.error('Server failed to delete item. Rolling back UI...');
    setFavorites(previousFavorites);
    alert('Failed to remove favorite meal. Restored.');
  }
};
```

---

## 8. Step 6: Testing & Debugging with Browser Network Tools

When you test your integration, open Chrome/Brave/Safari DevTools (`F12` or `Cmd + Option + I`) and click the **Network** tab:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Name                      │ Status │ Method │ Type  │ Initiator │ Size   │ Time        │
├───────────────────────────┼────────┼────────┼───────┼───────────┼────────┼─────────────┤
│ get-all/uuid-123          │ 200 OK │ GET    │ fetch │ api.ts:18 │ 1.2 kB │ 12 ms       │
│ create/uuid-123           │ 201    │ POST   │ fetch │ api.ts:32 │ 450 B  │ 24 ms       │
│ remove/uuid-456           │ 204    │ DELETE │ fetch │ api.ts:58 │ 0 B    │ 15 ms       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### What to check when a request fails:
1. **Status 401 / 403 Forbidden**:
   - Inspect the request **Headers**. Is `Authorization: Bearer <token>` present?
   - In Spring Boot, check `@PreAuthorize("isAuthenticated() && #userId == principal.id")`.
2. **Status 400 Bad Request**:
   - Click the request $\rightarrow$ **Payload**.
   - Check if any required field (`mealName`, `kcal`, `protein`, `carbs`, `fat`, `mealType`) is `null` or misspelled.
3. **Status 404 Not Found**:
   - Check the URL path. Is it `/api/favorite-meal/...` (with hyphen) matching `@RequestMapping("/api/favorite-meal")`?

---

## 9. Self-Check Questions & Deep Dives

1. **Why does Vite proxy `/api` to `http://localhost:8080` in development?**
   - *Answer*: Browsers block JavaScript from making cross-origin requests between different ports (`5173` vs `8080`). The Vite proxy forwards requests locally from the same origin, avoiding CORS issues.

2. **Why does `setFavorites((prev) => ...)` use a functional update instead of `setFavorites(newArray)`?**
   - *Answer*: Functional updates guarantee you are working with the freshest state snapshot, preventing race conditions when multiple actions happen quickly.

3. **What happens if you click "+ Log" on a favorite meal?**
   - *Answer*: It doesn't modify `/api/favorite-meal`. Instead, it converts the preset's macros into a payload and sends `POST /api/entry/{userId}` to record a new entry in today's meal intake table!

---

*You now have the complete architectural and practical knowledge to write the frontend connection code yourself!*
