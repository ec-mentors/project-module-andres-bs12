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

function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'overview'>('today');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Clean Production State: Starts 100% empty until user logs meals or fetches from backend
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [goal, setGoal] = useState<NutritionGoal>(DEFAULT_GOAL);
  
  // User Auth State: Starts null (unauthenticated clean state)
  const [user, setUser] = useState<UserProfile | null>(null);

  // UI Modal & Loading State
  const [isSetGoalsOpen, setIsSetGoalsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // SidepopUp Notification Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 1. INITIAL CLEAN BACKEND DATA FETCH
  useEffect(() => {
    async function loadBackendData() {
      try {
        const fetchedEntries = await api.getTodayEntries();
        if (fetchedEntries && Array.isArray(fetchedEntries)) {
          setEntries(fetchedEntries);
        }

        const fetchedGoal = await api.getLatestGoal();
        if (fetchedGoal) {
          setGoal(fetchedGoal);
        }
      } catch (err) {
        console.info('[Frontend] Backend API offline. Ready for user entries.');
      } finally {
        setTimeout(() => setIsAppLoading(false), 400);
      }
    }

    loadBackendData();
  }, []);

  // 2. DYNAMICALLY FILTER ENTRIES FOR THE CURRENTLY SELECTED DATE
  const visibleEntries = useMemo(() => {
    const selectedDateStr = selectedDate.toDateString();
    return entries.filter((item) => {
      if (!item.createdOn) return true;
      return new Date(item.createdOn).toDateString() === selectedDateStr;
    });
  }, [entries, selectedDate]);

  // 3. COMPUTE DAILY TOTALS ON THE FLY FROM VISIBLE ENTRIES FOR THE SELECTED DATE
  const summary: DailySummary = useMemo(() => {
    return visibleEntries.reduce(
      (acc, entry) => ({
        consumedKcal: acc.consumedKcal + (Number(entry.kcal) || 0),
        consumedProtein: acc.consumedProtein + (Number(entry.protein) || 0),
        consumedCarbs: acc.consumedCarbs + (Number(entry.carbs) || 0),
        consumedFat: acc.consumedFat + (Number(entry.fat) || 0),
      }),
      { consumedKcal: 0, consumedProtein: 0, consumedCarbs: 0, consumedFat: 0 }
    );
  }, [visibleEntries]);

  // 4. HANDLER: CREATE MEAL (POST TO SPRING BOOT REST API)
  const handleAddMeal = async (payload: CreateMealEntryPayload) => {
    const mealTimestamp = new Date(selectedDate);
    const now = new Date();
    mealTimestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    try {
      const newEntry = await api.createEntry(payload);
      const entryWithSelectedDate = {
        ...newEntry,
        createdOn: mealTimestamp.toISOString(),
      };
      setEntries((prev) => [entryWithSelectedDate, ...prev]);
    } catch (err) {
      console.warn('[API Fallback] Backend offline. Adding meal to local state.');
      const localEntry: MealEntry = {
        id: `local-${Date.now()}`,
        mealName: payload.mealName,
        source: payload.source || 'Manual',
        createdOn: mealTimestamp.toISOString(),
        kcal: payload.kcal,
        protein: payload.protein,
        carbs: payload.carbs,
        fat: payload.fat,
      };
      setEntries((prev) => [localEntry, ...prev]);
    } finally {
      const isToday = selectedDate.toDateString() === new Date().toDateString();
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Meal logged successfully',
        description: isToday
          ? 'New meal entry added to your daily progress tracking.'
          : `Meal logged for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
      });
    }
  };

  // 5. HANDLER: UPDATE MEAL (PUT TO SPRING BOOT REST API)
  const handleUpdateMeal = async (id: string, payload: CreateMealEntryPayload) => {
    try {
      if (!id.startsWith('local-')) {
        await fetch(`/api/entry/${id}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.warn('[API Warning] Could not update meal on backend');
    } finally {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                mealName: payload.mealName,
                kcal: payload.kcal,
                protein: payload.protein,
                carbs: payload.carbs,
                fat: payload.fat,
              }
            : item
        )
      );
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Meal updated',
        description: 'Meal entry values updated successfully.',
      });
    }
  };

  // 6. HANDLER: DELETE MEAL (DELETE TO SPRING BOOT REST API)
  const handleDeleteMeal = async (entryId: string) => {
    try {
      if (!entryId.startsWith('local-')) {
        await api.deleteEntry(entryId);
      }
    } catch (err) {
      console.warn('[API Warning] Could not delete entry on backend');
    } finally {
      setEntries((prev) => prev.filter((item) => item.id !== entryId));
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Entry removed',
        description: 'Meal entry was removed from total.',
      });
    }
  };

  // 7. HANDLER: SET GOALS (POST TO SPRING BOOT REST API)
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

  const selectedDateFormatted = selectedDate.toDateString() === new Date().toDateString()
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#05030d] text-slate-100 font-sans antialiased pb-16 selection:bg-[#6417ff] selection:text-white relative">
      
      {/* Figma Notification Toast (SidepopUp) */}
      <SidepopUp toast={toast} onClose={() => setToast(null)} />

      {/* Glassmorphism Floating Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetGoals={() => setIsSetGoalsOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isAppLoading ? (
          /* Animated Grey Skeleton Screen Loading State */
          <SkeletonLoader />
        ) : (
          <div key={activeTab} className="animate-in fade-in duration-300">
            {activeTab === 'today' ? (
              /* Today Dashboard View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Hero Kcal Card + Consumed vs Left Table) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Hero Kcal Card */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <HeroKcalCard
                      summary={summary}
                      goal={goal}
                      onOpenSetGoals={() => setIsSetGoalsOpen(true)}
                      selectedDate={selectedDate}
                      onDateChange={(newDate) => setSelectedDate(newDate)}
                    />
                  </div>

                  {/* Consumed vs Left Table */}
                  <div className="animate-in fade-in slide-in-from-bottom-5 duration-600 delay-100">
                    <ConsumedVsLeftTable summary={summary} goal={goal} />
                  </div>

                </div>

                {/* Right Column (Latest Entries Sidebar) */}
                <div className="lg:col-span-4 h-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                  <LatestEntriesSidebar
                    entries={visibleEntries}
                    onAddMeal={handleAddMeal}
                    onUpdateMeal={handleUpdateMeal}
                    onDeleteMeal={handleDeleteMeal}
                    selectedDateFormatted={selectedDateFormatted}
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
