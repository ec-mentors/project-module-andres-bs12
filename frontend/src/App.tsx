import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HeroKcalCard } from './components/dashboard/HeroKcalCard';
import { ConsumedVsLeftTable } from './components/dashboard/ConsumedVsLeftTable';
import { LatestEntriesSidebar } from './components/dashboard/LatestEntriesSidebar';
import { SetGoalsModal } from './components/forms/SetGoalsModal';
import { GoogleLoginModal } from './components/auth/GoogleLoginModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { OverviewDashboard } from './components/overview/OverviewDashboard';

import type { UserProfile } from './types/user';
import type { MealEntry, NutritionGoal, DailySummary, CreateMealEntryPayload } from './types/nutrition';
import type { OnboardingCompletionResult } from './components/onboarding/types';
import { 
  fetchTodayEntries, 
  createMealEntry, 
  updateMealEntry, 
  deleteMealEntry, 
  fetchTodaySummary, 
  fetchGoal, 
  updateGoal, 
  DEMO_USER_ID 
} from './services/api';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'overview'>('today');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [isSetGoalsOpen, setIsSetGoalsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

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

  // Synchronize document.body, html background color and theme-color meta to eliminate dark overscroll rubberband
  useEffect(() => {
    const bgColor = isLight ? '#f8fafc' : '#090516';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', bgColor);
  }, [isLight]);

  // Scroll Guardian: Ensure body and document vertical scroll are 100% active on dashboard
  useEffect(() => {
    if (!isOnboardingOpen && !isAuthOpen && !isProfileOpen && !isSetGoalsOpen) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isOnboardingOpen, isAuthOpen, isProfileOpen, isSetGoalsOpen]);

  // Default demo user UUID matching Spring Boot PostgreSQL UUID schema
  const userId: string = user?.id || DEMO_USER_ID;

  // Initial load for User Goal
  useEffect(() => {
    async function loadGoals() {
      try {
        const fetchedGoal = await fetchGoal(userId);
        if (fetchedGoal) {
          setGoal(fetchedGoal);
        }
      } catch (err) {
        console.error('Error fetching initial goals:', err);
      }
    }
    loadGoals();
  }, [userId]);

  // Load Entries and Daily Summary whenever selectedDate or userId changes
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

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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
      setToastMessage({
        title: 'Goals Updated',
        desc: `New target: ${newGoal.kcal} kcal (${newGoal.protein}g P • ${newGoal.carbs}g C • ${newGoal.fat}g F)`,
      });
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  // Handle Google OAuth Login Success
  const handleGoogleSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    setIsAuthOpen(false);

    // Testing Mode: Always launch onboarding to decide how to create goal
    setIsOnboardingOpen(true);
  };

  // Handle Onboarding Completion (AI or Manual)
  const handleOnboardingComplete = async (result: OnboardingCompletionResult) => {
    setIsOnboardingOpen(false);
    setLoading(true);
    if (user) {
      const userKey = `onboarded_${user.id || user.email}`;
      localStorage.setItem(userKey, 'true');
    }
    await handleSaveGoal(result.goal);
    // Simulate dashboard initialization loading animation
    const dateStr = selectedDate.toISOString().split('T')[0];
    const [updatedEntries, updatedSummary] = await Promise.all([
      fetchTodayEntries(userId, dateStr),
      fetchTodaySummary(userId, dateStr),
    ]);
    setEntries(updatedEntries);
    setSummary(updatedSummary);
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false);
    setToastMessage({
      title: '🎉 Setup Complete!',
      desc: result.path === 'ai'
        ? `Your AI-personalized roadmap (${result.goal.kcal} kcal) is active.`
        : `Your custom goal (${result.goal.kcal} kcal) has been configured.`,
    });
  };

  // Handle Sign Out -> Direct redirect back to Login Modal
  const handleLogout = () => {
    setUser(null);
    setIsAuthOpen(true);
    setToastMessage({
      title: 'Signed Out',
      desc: 'You have been safely signed out. Please sign in to continue.',
    });
  };

  const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();
  const selectedDateFormatted = isTodaySelected
    ? `Today, ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
    : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // Full-Screen Exclusive View for Onboarding (Completely eliminates background DOM & double scrollbars)
  if (isOnboardingOpen) {
    return (
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompleteOnboarding={handleOnboardingComplete}
        initialGoal={goal}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-out font-sans flex flex-col selection:bg-[#6417ff] selection:text-white ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#05030d] text-white'
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`p-4 rounded-2xl border-2 flex items-center space-x-3.5 shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'bg-white/95 border-purple-200 text-slate-900 shadow-purple-900/10'
              : 'bg-[#161024]/95 border-[#6417ff]/40 text-white shadow-black/80'
          }`}>
            <div className="p-2 rounded-xl bg-[#6417ff]/20 text-[#6417ff] border border-[#6417ff]/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black">{toastMessage.title}</h4>
              <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {toastMessage.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetGoals={() => setIsSetGoalsOpen(true)}
        user={user}
        onOpenAuth={() => {
          if (user) {
            setIsProfileOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }}
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
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
                  <div className="block lg:hidden order-2 transition-all duration-500 ease-out delay-100">
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
                  <div className="transition-all duration-500 ease-out delay-[200ms] lg:delay-75 animate-in fade-in slide-in-from-bottom-5 order-3 lg:order-2">
                    <ConsumedVsLeftTable summary={summary} goal={goal} selectedDate={selectedDate} theme={theme} />
                  </div>

                </div>

                {/* DESKTOP RIGHT SIDEBAR (STAGGER DELAY 150) */}
                <div className="hidden lg:block lg:col-span-4 relative order-2 transition-all duration-500 ease-out delay-150 animate-in fade-in slide-in-from-bottom-6">
                  <div className="absolute inset-0">
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

              </div>
            ) : (
              /* Overview Analytics Tab View */
              <OverviewDashboard goal={goal} entries={entries} theme={theme} />
            )}
          </div>
        )}
      </main>

      {/* Set Goals Modal */}
      <SetGoalsModal
        isOpen={isSetGoalsOpen}
        onClose={() => setIsSetGoalsOpen(false)}
        currentGoal={goal}
        onSaveGoal={handleSaveGoal}
        theme={theme}
      />

      {/* Google OAuth Login Modal */}
      <GoogleLoginModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleGoogleSuccess}
        theme={theme}
      />

      {/* Authenticated User Profile Modal */}
      {user && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onLogout={handleLogout}
          theme={theme}
        />
      )}

      {/* Multi-Step First-Time Onboarding Modal (Goal Setup) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompleteOnboarding={handleOnboardingComplete}
        initialGoal={goal}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

    </div>
  );
}

export default App;
