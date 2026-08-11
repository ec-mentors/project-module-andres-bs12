import type { MealEntry, CreateMealEntryPayload, NutritionGoal, SetGoalPayload } from '../types/nutrition';

// Base API URL (Vite dev server proxies /api to http://localhost:8080)
const API_BASE = '/api';

// Fallback Demo User UUID when no backend user session is set
export const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

/**
 * REST Client Service for NutritionTracker
 * Connects React Frontend to Spring Boot Controllers:
 * - EntryController (/api/entry)
 * - GoalController (/api/goal)
 * - UserController (/api/user)
 */

export const api = {
  // --- ENTRIES (Meal Logs) ---
  
  /** GET /api/entry/{userId}/today - Fetch today's meals for a user */
  async getTodayEntries(userId: string = DEMO_USER_ID): Promise<MealEntry[]> {
    try {
      const response = await fetch(`${API_BASE}/entry/${userId}/today`);
      if (!response.ok) {
        console.warn(`[API] Failed to fetch today entries (${response.status}). Using fallback array.`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('[API Error] getTodayEntries:', error);
      return [];
    }
  },

  /** GET /api/entry/{userId} - Fetch all meal entries for a user */
  async getAllEntries(userId: string = DEMO_USER_ID): Promise<MealEntry[]> {
    try {
      const response = await fetch(`${API_BASE}/entry/${userId}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('[API Error] getAllEntries:', error);
      return [];
    }
  },

  /** POST /api/entry/{userId} - Create a new meal entry */
  async createEntry(payload: CreateMealEntryPayload, userId: string = DEMO_USER_ID): Promise<MealEntry> {
    const response = await fetch(`${API_BASE}/entry/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mealName: payload.mealName,
        source: payload.source || 'MANUAL',
        kcal: Number(payload.kcal),
        carbs: Number(payload.carbs),
        fat: Number(payload.fat),
        protein: Number(payload.protein),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create entry: ${response.statusText}`);
    }

    return await response.json();
  },

  /** DELETE /api/entry/{entryId} - Delete a meal entry */
  async deleteEntry(entryId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/entry/${entryId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete entry: ${response.statusText}`);
    }
  },

  // --- GOALS (Nutritional Target Goals) ---

  /** GET /api/goal/user/{userId}/all - Get goals for user */
  async getLatestGoal(userId: string = DEMO_USER_ID): Promise<NutritionGoal | null> {
    try {
      const response = await fetch(`${API_BASE}/goal/user/${userId}/all`);
      if (!response.ok) return null;
      const goals: NutritionGoal[] = await response.json();
      return goals.length > 0 ? goals[goals.length - 1] : null;
    } catch (error) {
      console.error('[API Error] getLatestGoal:', error);
      return null;
    }
  },

  /** POST /api/goal/{userId} - Set or create daily goal */
  async createGoal(payload: SetGoalPayload, userId: string = DEMO_USER_ID): Promise<NutritionGoal> {
    const response = await fetch(`${API_BASE}/goal/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: payload.startDate || new Date().toISOString().split('T')[0],
        kcal: Number(payload.kcal),
        carbs: Number(payload.carbs),
        fat: Number(payload.fat),
        protein: Number(payload.protein),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set goal: ${response.statusText}`);
    }

    return await response.json();
  },
};
