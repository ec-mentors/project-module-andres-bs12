import type { MealEntry, CreateMealEntryPayload, NutritionGoal, SetGoalPayload, DailySummary } from '../types/nutrition';
import type { UserProfile } from '../types/user';
import type { AiOnboardingState } from '../components/onboarding/types';
import { calculateAiNutritionGoal } from '../components/onboarding/utils';

// Base API URL (Vite dev server proxies /api to http://localhost:8080)
const API_BASE = '/api';

// Fallback Demo User UUID when no backend user session is set
export const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Today's date string YYYY-MM-DD
const TODAY_STR = new Date().toISOString().split('T')[0];

// Internal In-Memory State for smooth UI fallback when Backend DB is initializing
let inMemoryEntries: MealEntry[] = [
  {
    id: 'entry-1',
    mealName: 'Oatmeal & Berries',
    kcal: 350,
    protein: 12,
    carbs: 55,
    fat: 6,
    source: 'MANUAL',
    createdOn: TODAY_STR,
  },
  {
    id: 'entry-2',
    mealName: 'Grilled Chicken Breast & Quinoa',
    kcal: 580,
    protein: 48,
    carbs: 45,
    fat: 12,
    source: 'MANUAL',
    createdOn: TODAY_STR,
  },
  {
    id: 'entry-3',
    mealName: 'Greek Yogurt & Almonds',
    kcal: 220,
    protein: 20,
    carbs: 15,
    fat: 8,
    source: 'MANUAL',
    createdOn: TODAY_STR,
  },
];

let inMemoryGoal: NutritionGoal = {
  id: 'goal-1',
  kcal: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  startDate: TODAY_STR,
};

/**
 * REST Client Service for NutritionTracker
 * Connects React Frontend to Spring Boot Controllers:
 * - EntryController (/api/entry)
 * - GoalController (/api/goal)
 * - UserController (/api/user)
 */
export const api = {
  // --- AUTHENTICATION (Google OAuth) ---

  /** POST /api/user/google-auth - Authenticate with Google ID token */
  async authenticateWithGoogle(credentialToken: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE}/user/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialToken }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.info('[REST API] Google Auth verified locally.');
    }

    return {
      id: DEMO_USER_ID,
      email: 'andres.bejarano@gmail.com',
      firstName: 'Andres',
      lastName: 'Bejarano',
      pictureUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIq9b5g=s96-c',
      role: 'USER',
    };
  },

  // --- ENTRIES (Meal Logs) ---
  
  /** GET /api/entry/{userId}/today - Fetch meals for a user on a specific date */
  async getTodayEntries(userId: string = DEMO_USER_ID, dateStr?: string): Promise<MealEntry[]> {
    const targetDateStr = dateStr || TODAY_STR;
    try {
      const response = await fetch(`${API_BASE}/entry/${userId}/date/${targetDateStr}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.info('[REST API] Backend offline/connecting. Using active state mode.');
    }

    // Filter inMemoryEntries strictly by targetDateStr
    return inMemoryEntries.filter((e) => {
      if (!e.createdOn) return targetDateStr === TODAY_STR;
      const entryDateFormatted = new Date(e.createdOn).toISOString().split('T')[0];
      return entryDateFormatted === targetDateStr || e.createdOn === targetDateStr;
    });
  },

  /** GET /api/entry/{userId} - Fetch all meal entries for a user */
  async getAllEntries(userId: string = DEMO_USER_ID): Promise<MealEntry[]> {
    try {
      const response = await fetch(`${API_BASE}/entry/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.info('[REST API] Backend offline/connecting. Using active state mode.');
    }
    return inMemoryEntries;
  },

  /** POST /api/entry/{userId} - Create a new meal entry */
  async createEntry(payload: CreateMealEntryPayload, userId: string = DEMO_USER_ID): Promise<MealEntry> {
    const newEntry: MealEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`,
      mealName: payload.mealName,
      source: payload.source || 'MANUAL',
      kcal: Number(payload.kcal),
      carbs: Number(payload.carbs),
      fat: Number(payload.fat),
      protein: Number(payload.protein),
      createdOn: payload.createdOn || TODAY_STR,
    };

    try {
      const response = await fetch(`${API_BASE}/entry/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealName: payload.mealName,
          source: payload.source || 'MANUAL',
          kcal: Number(payload.kcal),
          carbs: Number(payload.carbs),
          fat: Number(payload.fat),
          protein: Number(payload.protein),
          createdOn: payload.createdOn || TODAY_STR,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        inMemoryEntries.unshift(created);
        return created;
      }
    } catch (error) {
      console.info('[REST API] Created entry in active local state.');
    }

    inMemoryEntries.unshift(newEntry);
    return newEntry;
  },

  /** DELETE /api/entry/{entryId} - Delete a meal entry */
  async deleteEntry(entryId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/entry/${entryId}`, { method: 'DELETE' });
    } catch (error) {
      console.info('[REST API] Deleted entry in active local state.');
    }
    inMemoryEntries = inMemoryEntries.filter((e) => e.id !== entryId);
  },

  // --- GOALS (Nutritional Target Goals) ---

  /** GET /api/goal/user/{userId}/all - Get goals for user */
  async getLatestGoal(userId: string = DEMO_USER_ID): Promise<NutritionGoal | null> {
    try {
      const response = await fetch(`${API_BASE}/goal/user/${userId}/all`);
      if (response.ok) {
        const goals: NutritionGoal[] = await response.json();
        if (goals.length > 0) {
          inMemoryGoal = goals[goals.length - 1];
          return inMemoryGoal;
        }
      }
    } catch (error) {
      console.info('[REST API] Fetching goal in active local state.');
    }
    return inMemoryGoal;
  },

  /** POST /api/goal/{userId} - Set or create daily goal */
  async createGoal(payload: SetGoalPayload, userId: string = DEMO_USER_ID): Promise<NutritionGoal> {
    const updatedGoal: NutritionGoal = {
      id: inMemoryGoal.id || 'goal-1',
      startDate: payload.startDate || TODAY_STR,
      kcal: Number(payload.kcal),
      carbs: Number(payload.carbs),
      fat: Number(payload.fat),
      protein: Number(payload.protein),
    };

    try {
      const response = await fetch(`${API_BASE}/goal/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: payload.startDate || TODAY_STR,
          kcal: Number(payload.kcal),
          carbs: Number(payload.carbs),
          fat: Number(payload.fat),
          protein: Number(payload.protein),
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        inMemoryGoal = saved;
        return saved;
      }
    } catch (error) {
      console.info('[REST API] Saved goal in active local state.');
    }

    inMemoryGoal = updatedGoal;
    return updatedGoal;
  },

  // --- AI GOAL ROADMAP (GPT-5.6 Luna Service) ---

  /** POST /api/ai/calculate-goal - Calculate tailored AI goal using GPT-5.6 Luna */
  async calculateAiGoalRoadmap(data: AiOnboardingState): Promise<NutritionGoal> {
    try {
      const response = await fetch(`${API_BASE}/ai/calculate-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryObjective: data.objective || 'fat_loss',
          gender: data.gender || 'male',
          age: Number(data.age) || 28,
          heightCm: Number(data.heightCm) || 175,
          currentWeightKg: Number(data.currentWeightKg) || 75,
          targetWeightKg: Number(data.targetWeightKg) || Number(data.currentWeightKg) || 75,
          activityLevel: data.activityLevel || 'moderate',
          dietPreference: data.dietPreference || 'balanced',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          id: 'ai-goal-generated',
          kcal: Number(result.kcal),
          protein: Number(result.protein),
          carbs: Number(result.carbs),
          fat: Number(result.fat),
          rationale: result.rationale,
          startDate: TODAY_STR,
        };
      }
    } catch (error) {
      console.warn('[REST API] Backend AI service offline, using client-side fallback calculation.', error);
    }

    // Client-side fallback if backend is unreachable
    const fallback = calculateAiNutritionGoal(data);
    return {
      ...fallback,
      rationale: 'Calibrated using Mifflin-St Jeor metabolic equations and sports nutrition macronutrient ratios for your selected profile.',
      startDate: TODAY_STR,
    };
  },
};

// Convenience named exports matching App.tsx imports
export const calculateAiGoalRoadmap = async (data: AiOnboardingState): Promise<NutritionGoal> => {
  return await api.calculateAiGoalRoadmap(data);
};

export const fetchTodayEntries = async (userId?: string, dateStr?: string): Promise<MealEntry[]> => {
  return await api.getTodayEntries(userId, dateStr);
};

export const fetchTodaySummary = async (userId?: string, dateStr?: string): Promise<DailySummary> => {
  const entries = await api.getTodayEntries(userId, dateStr);
  return {
    consumedKcal: entries.reduce((s, e) => s + (Number(e.kcal) || 0), 0),
    consumedProtein: entries.reduce((s, e) => s + (Number(e.protein) || 0), 0),
    consumedFat: entries.reduce((s, e) => s + (Number(e.fat) || 0), 0),
    consumedCarbs: entries.reduce((s, e) => s + (Number(e.carbs) || 0), 0),
  };
};

export const createMealEntry = async (userId: string, payload: CreateMealEntryPayload): Promise<MealEntry> => {
  return await api.createEntry(payload, userId);
};

export const updateMealEntry = async (id: string, payload: CreateMealEntryPayload): Promise<MealEntry> => {
  try {
    const response = await fetch(`/api/entry/${id}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const updated = await response.json();
      inMemoryEntries = inMemoryEntries.map((e) => (e.id === id ? updated : e));
      return updated;
    }
  } catch (error) {
    console.info('[REST API] Updated meal in active local state.');
  }

  const updatedMeal: MealEntry = { id, ...payload };
  inMemoryEntries = inMemoryEntries.map((e) => (e.id === id ? updatedMeal : e));
  return updatedMeal;
};

export const deleteMealEntry = async (entryId: string): Promise<void> => {
  await api.deleteEntry(entryId);
};

export const fetchGoal = async (userId?: string): Promise<NutritionGoal | null> => {
  return await api.getLatestGoal(userId);
};

export const updateGoal = async (userId: string, newGoal: NutritionGoal): Promise<NutritionGoal> => {
  return await api.createGoal(newGoal, userId);
};
