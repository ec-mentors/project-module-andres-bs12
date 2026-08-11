import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { HeroKcalCard } from './components/dashboard/HeroKcalCard';
import { ConsumedVsLeftTable } from './components/dashboard/ConsumedVsLeftTable';
import { LatestEntriesSidebar } from './components/dashboard/LatestEntriesSidebar';
import { SetGoalsModal } from './components/forms/SetGoalsModal';
import { GoogleLoginModal } from './components/auth/GoogleLoginModal';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { SkeletonLoader } from './components/common/SkeletonLoader';
import { SidepopUp } from './components/common/SidepopUp';
import type { ToastMessage } from './components/common/SidepopUp';
import type { UserProfile } from './types/user';
import type { MealEntry, NutritionGoal, CreateMealEntryPayload, SetGoalPayload, DailySummary } from './types/nutrition';
import { api } from './services/api';
import './App.css';

// Default Fallback Goal matching Figma specs
const DEFAULT_GOAL: NutritionGoal = {
  kcal: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

// Initial Demo Entries matching Figma layout when backend has no entries yet
const DEMO_INITIAL_ENTRIES: MealEntry[] = [
  {
    id: 'demo-1',
    mealName: 'Grilled Chicken & Rice',
    source: 'Manual',
    createdOn: new Date().toISOString(),
    kcal: 450,
    protein: 40,
    carbs: 50,
    fat: 10,
  },
  {
    id: 'demo-2',
    mealName: 'Protein Shake',
    source: 'Telegram',
    createdOn: new Date().toISOString(),
    kcal: 250,
    protein: 30,
    carbs: 10,
    fat: 5,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'overview'>('today');
  const [entries, setEntries] = useState<MealEntry[]>(DEMO_INITIAL_ENTRIES);
  const [goal, setGoal] = useState<NutritionGoal>(DEFAULT_GOAL);
  
  // User & Auth State
  const [user, setUser] = useState<UserProfile | null>({
    id: 'google-101',
    email: 'andres.user@gmail.com',
    firstName: 'Andres',
    pictureUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIq9b5g=s96-c',
  });

  // UI Modal & Loading State
  const [isSetGoalsOpen, setIsSetGoalsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // SidepopUp Notification Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 1. INITIAL LOADING SKELETON SIMULATION & BACKEND FETCH
  useEffect(() => {
    async function loadBackendData() {
      try {
        const fetchedEntries = await api.getTodayEntries();
        if (fetchedEntries && fetchedEntries.length > 0) {
          setEntries(fetchedEntries);
        }

        const fetchedGoal = await api.getLatestGoal();
        if (fetchedGoal) {
          setGoal(fetchedGoal);
        }
      } catch (err) {
        console.info('[Frontend] Backend API offline. Using fallback demo state.');
      } finally {
        setTimeout(() => setIsAppLoading(false), 500);
      }
    }

    loadBackendData();
  }, []);

  // 2. COMPUTE DAILY TOTALS ON THE FLY FROM THE ENTRIES ARRAY
  const summary: DailySummary = useMemo(() => {
    return entries.reduce(
      (acc, entry) => ({
        consumedKcal: acc.consumedKcal + (Number(entry.kcal) || 0),
        consumedProtein: acc.consumedProtein + (Number(entry.protein) || 0),
        consumedCarbs: acc.consumedCarbs + (Number(entry.carbs) || 0),
        consumedFat: acc.consumedFat + (Number(entry.fat) || 0),
      }),
      { consumedKcal: 0, consumedProtein: 0, consumedCarbs: 0, consumedFat: 0 }
    );
  }, [entries]);

  // 3. HANDLER: CREATE MEAL (INLINE POST TO SPRING BOOT) -> Triggers Slide-in Toast
  const handleAddMeal = async (payload: CreateMealEntryPayload) => {
    try {
      const newEntry = await api.createEntry(payload);
      setEntries((prev) => [newEntry, ...prev]);
    } catch (err) {
      console.warn('[API Fallback] Backend offline. Adding meal to local state.');
      const localEntry: MealEntry = {
        id: `local-${Date.now()}`,
        mealName: payload.mealName,
        source: payload.source || 'Manual',
        createdOn: new Date().toISOString(),
        kcal: payload.kcal,
        protein: payload.protein,
        carbs: payload.carbs,
        fat: payload.fat,
      };
      setEntries((prev) => [localEntry, ...prev]);
    } finally {
      // Trigger smooth slide-in/slide-out SidepopUp toast
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Meal logged successfully',
        description: 'New meal entry added to your daily progress tracking.',
      });
    }
  };

  // 4. HANDLER: DELETE MEAL (DELETE TO SPRING BOOT)
  const handleDeleteMeal = async (entryId: string) => {
    try {
      if (!entryId.startsWith('demo-') && !entryId.startsWith('local-')) {
        await api.deleteEntry(entryId);
      }
    } catch (err) {
      console.warn('[API Warning] Could not delete entry on backend');
    } finally {
      setEntries((prev) => prev.filter((item) => item.id !== entryId));
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Entry removed',
        description: 'Meal entry was removed from today’s total.',
      });
    }
  };

  // 5. HANDLER: SET GOALS (POST TO SPRING BOOT) -> Triggers Figma SidepopUp
  const handleSaveGoal = async (payload: SetGoalPayload) => {
    try {
      const updatedGoal = await api.createGoal(payload);
      setGoal(updatedGoal);
    } catch (err) {
      console.warn('[API Fallback] Backend offline. Updating goal in local state.');
      setGoal({
        ...goal,
        kcal: payload.kcal,
        protein: payload.protein,
        carbs: payload.carbs,
        fat: payload.fat,
      });
    } finally {
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Goal updated',
        description: "This goal will apply to the meals you've already logged today.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#05030d] text-slate-100 font-sans antialiased pb-16 selection:bg-[#6417ff] selection:text-white relative">
      
      {/* Figma Notification Toast (SidepopUp) with Slide-in / Slide-out */}
      <SidepopUp toast={toast} onClose={() => setToast(null)} />

      {/* Glassmorphism Floating Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetGoals={() => setIsSetGoalsOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area with Smooth Fade & Scale Tab Animation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isAppLoading ? (
          /* Animated Grey Skeleton Screen Loading State */
          <SkeletonLoader />
        ) : (
          <div key={activeTab} className="animate-in fade-in zoom-in-95 duration-300">
            {activeTab === 'today' ? (
              /* Today Dashboard View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Hero Kcal Card + Consumed vs Left Table) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Hero Kcal Card */}
                  <HeroKcalCard
                    summary={summary}
                    goal={goal}
                    onOpenSetGoals={() => setIsSetGoalsOpen(true)}
                  />

                  {/* Consumed vs Left Table */}
                  <ConsumedVsLeftTable summary={summary} goal={goal} />

                </div>

                {/* Right Column (Latest Entries Sidebar with Inline Form) */}
                <div className="lg:col-span-4 h-full">
                  <LatestEntriesSidebar
                    entries={entries}
                    onAddMeal={handleAddMeal}
                    onDeleteMeal={handleDeleteMeal}
                  />
                </div>

              </div>
            ) : (
              /* Overview Analytics Tab View */
              <OverviewDashboard goal={goal} />
            )}
          </div>
        )}
      </main>

      {/* Modal Dialogs */}
      <SetGoalsModal
        isOpen={isSetGoalsOpen}
        onClose={() => setIsSetGoalsOpen(false)}
        currentGoal={goal}
        onSaveGoal={handleSaveGoal}
      />

      <GoogleLoginModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />
    </div>
  );
}

export default App;
