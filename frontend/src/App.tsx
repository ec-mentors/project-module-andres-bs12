import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HeroKcalCard } from './components/dashboard/HeroKcalCard';
import { ConsumedVsLeftTable } from './components/dashboard/ConsumedVsLeftTable';
import { LatestEntriesSidebar } from './components/dashboard/LatestEntriesSidebar';
import { SetGoalsModal } from './components/forms/SetGoalsModal';
import { GoogleLoginModal } from './components/auth/GoogleLoginModal';
import { OverviewDashboard } from './components/overview/OverviewDashboard';

import type { UserProfile } from './types/user';
import type { MealEntry, NutritionGoal, DailySummary, CreateMealEntryPayload } from './types/nutrition';
import { fetchTodayEntries, createMealEntry, updateMealEntry, deleteMealEntry, fetchTodaySummary, fetchGoal, updateGoal, DEMO_USER_ID } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'overview'>('today');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [isSetGoalsOpen, setIsSetGoalsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Selected Date State (Defaults to Today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Data state
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [goal, setGoal] = useState<NutritionGoal>({
    kcal: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  const [summary, setSummary] = useState<DailySummary>({
    consumedKcal: 0,
    consumedProtein: 0,
    consumedFat: 0,
    consumedCarbs: 0,
  });

  const [loading, setLoading] = useState(true);

  // Theme Synchronizer
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = theme === 'light';

  // Synchronize document.body and html background color to fix overscroll rubberband black bars
  useEffect(() => {
    const bgColor = isLight ? '#f8fafc' : '#05030d';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
  }, [isLight]);

  // Default demo user UUID matching Spring Boot PostgreSQL UUID schema
  const userId: string = user?.id || DEMO_USER_ID;

  // 1. Initial load for User Goal with First-Time Onboarding Prompt
  useEffect(() => {
    async function loadGoals() {
      try {
        const fetchedGoal = await fetchGoal(userId);
        if (fetchedGoal) {
          setGoal(fetchedGoal);
        } else {
          // ONBOARDING UX: User has 0 goals in PostgreSQL -> Prompt Set Goals modal automatically!
          setIsSetGoalsOpen(true);
        }
      } catch (err) {
        console.error('Error fetching initial goals:', err);
      }
    }
    loadGoals();
  }, [userId]);

  // 2. Load Entries and Daily Summary whenever selectedDate or userId changes
  useEffect(() => {
    async function loadDataForDate() {
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        const [fetchedEntries, fetchedSummary] = await Promise.all([
          fetchTodayEntries(userId, dateStr),
          fetchTodaySummary(userId, dateStr),
        ]);

        setEntries(fetchedEntries);
        setSummary(fetchedSummary);
      } catch (err) {
        console.error('Error fetching data for date:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDataForDate();
  }, [userId, selectedDate]);

  // Filter entries specifically for the currently active selectedDate
  const visibleEntries = entries.filter((e) => {
    if (!e.createdOn) return true;
    const entryDate = new Date(e.createdOn);
    return entryDate.toDateString() === selectedDate.toDateString();
  });

  // Handle Add Meal
  const handleAddMeal = async (payload: CreateMealEntryPayload) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await createMealEntry(userId, { ...payload, createdOn: dateStr });
      
      const [updatedEntries, updatedSummary] = await Promise.all([
        fetchTodayEntries(userId, dateStr),
        fetchTodaySummary(userId, dateStr),
      ]);
      setEntries(updatedEntries);
      setSummary(updatedSummary);
    } catch (err) {
      console.error('Failed to create meal entry:', err);
    }
  };

  // Handle Update Meal
  const handleUpdateMeal = async (id: string, payload: CreateMealEntryPayload) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await updateMealEntry(id, payload);

      const [updatedEntries, updatedSummary] = await Promise.all([
        fetchTodayEntries(userId, dateStr),
        fetchTodaySummary(userId, dateStr),
      ]);
      setEntries(updatedEntries);
      setSummary(updatedSummary);
    } catch (err) {
      console.error('Failed to update meal entry:', err);
    }
  };

  // Handle Delete Meal
  const handleDeleteMeal = async (id: string) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await deleteMealEntry(id);

      const [updatedEntries, updatedSummary] = await Promise.all([
        fetchTodayEntries(userId, dateStr),
        fetchTodaySummary(userId, dateStr),
      ]);
      setEntries(updatedEntries);
      setSummary(updatedSummary);
    } catch (err) {
      console.error('Failed to delete meal entry:', err);
    }
  };

  // Handle Save Goal
  const handleSaveGoal = async (newGoal: NutritionGoal) => {
    try {
      setGoal(newGoal);
      await updateGoal(userId, newGoal);
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const handleGoogleSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
  };

  const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();
  const selectedDateFormatted = isTodaySelected
    ? `Today, ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
    : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`min-h-screen transition-all duration-500 ease-out font-sans flex flex-col selection:bg-[#6417ff] selection:text-white ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#05030d] text-white'
    }`}>
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetGoals={() => setIsSetGoalsOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2 sm:pt-4">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6417ff]" />
          </div>
        ) : (
          <div className="transition-all duration-500 ease-out">
            {activeTab === 'today' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT MAIN COLUMN */}
                <div className="lg:col-span-8 flex flex-col space-y-8 order-1">
                  
                  {/* Hero Kcal Card (STAGGER DELAY 0) */}
                  <div className="transition-all duration-500 ease-out delay-0 animate-in fade-in slide-in-from-bottom-4">
                    <HeroKcalCard
                      summary={summary}
                      goal={goal}
                      onOpenSetGoals={() => setIsSetGoalsOpen(true)}
                      selectedDate={selectedDate}
                      onDateChange={(newDate) => setSelectedDate(newDate)}
                      theme={theme}
                    />
                  </div>

                  {/* MOBILE INTERMEDIATE PLACEHOLDER FOR SIDEBAR */}
                  <div className="block lg:hidden order-2 transition-all duration-500 ease-out delay-75">
                    <LatestEntriesSidebar
                      entries={visibleEntries}
                      onAddMeal={handleAddMeal}
                      onUpdateMeal={handleUpdateMeal}
                      onDeleteMeal={handleDeleteMeal}
                      selectedDateFormatted={selectedDateFormatted}
                      theme={theme}
                    />
                  </div>

                  {/* Consumed vs Left Table (STAGGER DELAY 75) */}
                  <div className="transition-all duration-500 ease-out delay-75 animate-in fade-in slide-in-from-bottom-5 order-3 lg:order-2">
                    <ConsumedVsLeftTable summary={summary} goal={goal} selectedDate={selectedDate} theme={theme} />
                  </div>

                </div>

                {/* DESKTOP RIGHT SIDEBAR (STAGGER DELAY 150) */}
                <div className="hidden lg:flex lg:col-span-4 h-full flex-col order-2 transition-all duration-500 ease-out delay-150 animate-in fade-in slide-in-from-bottom-6">
                  <LatestEntriesSidebar
                    entries={visibleEntries}
                    onAddMeal={handleAddMeal}
                    onUpdateMeal={handleUpdateMeal}
                    onDeleteMeal={handleDeleteMeal}
                    selectedDateFormatted={selectedDateFormatted}
                    theme={theme}
                  />
                </div>

              </div>
            ) : (
              /* Overview Analytics Tab View */
              <OverviewDashboard goal={goal} entries={entries} theme={theme} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SetGoalsModal
        isOpen={isSetGoalsOpen}
        onClose={() => setIsSetGoalsOpen(false)}
        currentGoal={goal}
        onSaveGoal={handleSaveGoal}
        theme={theme}
      />

      <GoogleLoginModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleGoogleSuccess}
      />
    </div>
  );
}

export default App;
