import type { MealEntry, CreateMealEntryPayload, NutritionGoal, SetGoalPayload, DailySummary } from '../types/nutrition';
import type { UserProfile } from '../types/user';
import type { AiOnboardingState } from '../components/onboarding/types';
import { calculateAiNutritionGoal } from '../components/onboarding/utils';

// Base API URL (Vite dev server proxies /api to http://localhost:8080)
const API_BASE = '/api';


// Today's date string YYYY-MM-DD
const TODAY_STR = new Date().toISOString().split('T')[0];

// Internal In-Memory State initialized clean (no mock data in production)
const AUTH_TOKEN_KEY = 'google_id_token';

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

const authHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = getAuthToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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

  /** POST /api/user/auth/google - Authenticate with Google ID token */
  async authenticateWithGoogle(credentialToken: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE}/user/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: credentialToken,
    });

    if (!response.ok) {
      throw new Error(`Google Authentication failed with status ${response.status}`);
    }

    setAuthToken(credentialToken);

    const user: UserProfile = await response.json();
    return user;
  },

  // --- ENTRIES (Meal Logs) ---
  
  /** GET /api/entry/{userId} - Fetch meals for a user on a specific date */
  async getTodayEntries(userId?: string, dateStr?: string): Promise<MealEntry[]> {
    if (!userId) {
      return [];
    }
    const targetDateStr = dateStr || TODAY_STR;
    try {
      const response = await fetch(`${API_BASE}/entry/${userId}`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        const data: MealEntry[] = await response.json();
        if (Array.isArray(data)) {
          return data.filter((e) => {
            if (!e.createdOn) return true;
            const entryDate = typeof e.createdOn === 'string' ? e.createdOn.split('T')[0] : '';
            return entryDate === targetDateStr;
          });
        }
      }
    } catch {
      console.info('[REST API] Could not fetch entries from server.');
    }
    return [];
  },

  /** GET /api/entry/{userId} - Fetch all meal entries for a user */
  async getAllEntries(userId?: string): Promise<MealEntry[]> {
    if (!userId) return [];
    try {
      const response = await fetch(`${API_BASE}/entry/${userId}`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      console.info('[REST API] Could not fetch entries from server.');
    }
    return [];
  },

  /** POST /api/entry/{userId} - Create a new meal entry */
  async createEntry(payload: CreateMealEntryPayload, userId: string): Promise<MealEntry> {
    const response = await fetch(`${API_BASE}/entry/${userId}`, {
      method: 'POST',
      headers: authHeaders('application/json'),
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
      return await response.json();
    }
    throw new Error(`Failed to create entry with status: ${response.status}`);
  },

  /** DELETE /api/entry/{entryId} - Delete a meal entry */
  async deleteEntry(entryId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/entry/${entryId}`, { 
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch {
      console.info('[REST API] Failed to delete entry from server.');
    }
  },

  // --- GOALS (Nutritional Target Goals) ---

  /** GET /api/goal/user/{userId}/all - Get goals for user */
  async getLatestGoal(userId?: string): Promise<NutritionGoal | null> {
    if (!userId) return null;
    try {
      const response = await fetch(`${API_BASE}/goal/user/${userId}/all`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        const goals: NutritionGoal[] = await response.json();
        if (Array.isArray(goals) && goals.length > 0) {
          return goals[goals.length - 1];
        }
        return null;
      }
    } catch {
      console.info('[REST API] Error fetching goals from server.');
    }
    return null;
  },

  /** POST /api/goal/{userId} - Set or create daily goal */
  async createGoal(payload: SetGoalPayload, userId: string): Promise<NutritionGoal> {
    const response = await fetch(`${API_BASE}/goal/${userId}`, {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify({
        startDate: payload.startDate || TODAY_STR,
        kcal: Number(payload.kcal),
        carbs: Number(payload.carbs),
        fat: Number(payload.fat),
        protein: Number(payload.protein),
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Failed to save goal with status: ${response.status}`);
  },

  // --- AI GOAL ROADMAP (GPT-5.6 Luna Service) ---

  /** POST /api/ai/calculate-goal - Calculate tailored AI goal using GPT-5.6 Luna */
  async calculateAiGoalRoadmap(data: AiOnboardingState): Promise<NutritionGoal> {
    try {
      const response = await fetch(`${API_BASE}/ai/calculate-goal`, {
        method: 'POST',
        headers: authHeaders('application/json'),
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

  // --- MULTIMODAL AI MEAL PARSER (Text, Audio, Photo) ---

  /** POST /api/ai/parse-meal-text - Parse natural language text description into macros */
  async parseMealText(description: string): Promise<AiMealResponseDTO> {
    const response = await fetch(`${API_BASE}/ai/parse-meal-text`, {
      method: 'POST',
      headers: authHeaders('application/json'),
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`Failed to parse meal text with status ${response.status}`);
    }

    return await response.json();
  },

  /** POST /api/ai/parse-meal-audio - Transcribe & parse audio recording into macros */
  async parseMealAudio(audioBlob: Blob): Promise<AiMealResponseDTO> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'meal_audio.webm');

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/ai/parse-meal-audio`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to parse meal audio with status ${response.status}`);
    }

    return await response.json();
  },

  /** POST /api/ai/parse-meal-image - Scan & estimate nutritional breakdown from photo */
  async parseMealImage(imageFile: File | Blob): Promise<AiMealResponseDTO> {
    const formData = new FormData();
    formData.append('image', imageFile, 'meal_photo.jpg');

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/ai/parse-meal-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze meal photo with status ${response.status}`);
    }

    return await response.json();
  },
};

export interface AiMealResponseDTO {
  mealName: string;
  kcal: number;
  carbs: number;
  fat: number;
  protein: number;
  confidenceNote?: string;
}

// Convenience named exports matching App.tsx imports
export const parseMealText = async (description: string): Promise<AiMealResponseDTO> => {
  return await api.parseMealText(description);
};

export const parseMealAudio = async (audioBlob: Blob): Promise<AiMealResponseDTO> => {
  return await api.parseMealAudio(audioBlob);
};

export const parseMealImage = async (imageFile: File | Blob): Promise<AiMealResponseDTO> => {
  return await api.parseMealImage(imageFile);
};

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
  const response = await fetch(`/api/entry/${id}/update`, {
    method: 'PUT',
    headers: authHeaders('application/json'),
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    return await response.json();
  }
  throw new Error(`Failed to update meal entry with status: ${response.status}`);
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
