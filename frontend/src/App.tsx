import { useState, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { NutriaChatFeed, type ChatMessage } from './components/chat/NutriaChatFeed';
import { HeroKcalCard } from './components/dashboard/HeroKcalCard';
import { ConsumedVsLeftTable } from './components/dashboard/ConsumedVsLeftTable';
import { LatestEntriesSidebar } from './components/dashboard/LatestEntriesSidebar';
import { SetGoalsModal } from './components/forms/SetGoalsModal';
import { GoogleLoginModal } from './components/auth/GoogleLoginModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { ManageFavoritesModal } from './components/chat/ManageFavoritesModal';

import type { UserProfile } from './types/user';
import type { MealEntry, NutritionGoal, DailySummary, CreateMealEntryPayload } from './types/nutrition';
import type { FavoriteMeal, CreateFavoriteMealPayload } from './types/favoriteMeal';
import type { OnboardingCompletionResult } from './components/onboarding/types';
import { 
  fetchAllEntries,
  fetchTodayEntries,
  createMealEntry, 
  updateMealEntry, 
  deleteMealEntry, 
  fetchGoal, 
  updateGoal,
  clearAuthToken,
  fetchFavorites,
  createFavoriteMeal,
  updateFavoriteMeal,
  removeFavoriteMeal,
} from './services/api';
import { toLocalYmd } from './utils/dateLocal';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'nutria' | 'overview'>('nutria');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isGlobalFavoritesOpen, setIsGlobalFavoritesOpen] = useState(false);

  // Smart Header visibility on Overview scroll
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== 'overview') {
        setIsHeaderVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current + 15) {
        // Scrolling down -> hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current - 15) {
        // Scrolling up -> reveal header
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Persistent Chat Messages across tab navigation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'nutria',
      type: 'text',
      text: "Hello! I'm Nutria, your precision nutrition assistant. ✨ Tell me what you ate, record a voice note, or snap a photo of your meal to instantly estimate and log your macros.",
      timestamp: 'Just now',
    },
  ]);

  // Modals state
  const [isSetGoalsOpen, setIsSetGoalsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Selected Date State (Defaults to Today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Data state — `entries` = all history (charts); `dayEntries` = selected day (Meal Intake)
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [dayEntries, setDayEntries] = useState<MealEntry[]>([]);
  const [goal, setGoal] = useState<NutritionGoal>({
    kcal: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  
// ----- Favorite Meal Handlers -----
  const handleAddFavorite = async(payload: CreateFavoriteMealPayload) => {
    if (!userId) return;

    try{ 
      // BE call to create new favorite
      const newFavorite = await createFavoriteMeal(userId, payload);
      // Update local state, prev = current favorites, newFavorite = new favorite meal
      setFavorites((prev) => [newFavorite, ...prev]);
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  };


  const handleUpdateFavorite = async(id: string, payload: CreateFavoriteMealPayload) => {
    if (!userId) return;

    try {
      const updatedFavorite = await updateFavoriteMeal(id, payload);
      setFavorites((prev) =>
        prev.map((fav) => (fav.id === id ? updatedFavorite : fav))
      );
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  
  const handleDeleteFavorite = async(id: string) => {
    if (!userId) return;

  try {
    await removeFavoriteMeal(id);
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  } catch (err) {
    console.error('Failed to delete favorite:', err);
  }
  };

  const [, setSummary] = useState<DailySummary>({
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
    const bgColor = isLight ? '#f8fafc' : '#080808';
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

  // Active user ID from real authenticated session
  const userId: string = user?.id || '';

  // Tab change handler ensuring window scroll is reset instantly
  const handleTabChange = (tab: 'nutria' | 'overview') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Scroll & Viewport Lock: Keep body from window-scrolling on Mobile in Nutria chat view
  useEffect(() => {
    if (activeTab === 'nutria') {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      if (!isOnboardingOpen && !isAuthOpen && !isProfileOpen && !isSetGoalsOpen) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }
  }, [activeTab, isOnboardingOpen, isAuthOpen, isProfileOpen, isSetGoalsOpen]);

  // Initial load for User Goal
  useEffect(() => {
    async function loadGoals() {
      if (!userId) return;
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

  // Load all favorites
  useEffect(() => {
    async function loadFavorites() {
      if (!userId) {
        setFavorites([]);
        return;
      }

      try {
        const data = await fetchFavorites(userId);
        setFavorites(data || []);
      } catch (err) {
        console.error('Error fetching Favorites:', err);
      }
    }
    loadFavorites();
  }, [userId]);

  // Load all entries + day entries + daily summary whenever selectedDate or userId changes
  useEffect(() => {
    async function loadDataForDate() {
      if (!userId) {
        setEntries([]);
        setDayEntries([]);
        setSummary({
          consumedKcal: 0,
          consumedProtein: 0,
          consumedFat: 0,
          consumedCarbs: 0,
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const dateStr = toLocalYmd(selectedDate);
        
        // Same dayEntries array feeds Meal Intake AND Daily Progress (no divergent filters)
        const [fetchedAll, fetchedDay] = await Promise.all([
          fetchAllEntries(userId),
          fetchTodayEntries(userId, dateStr),
        ]);

        setEntries(fetchedAll || []);
        setDayEntries(fetchedDay || []);
        setSummary({
          consumedKcal: (fetchedDay || []).reduce((s, e) => s + (Number(e.kcal) || 0), 0),
          consumedProtein: (fetchedDay || []).reduce((s, e) => s + (Number(e.protein) || 0), 0),
          consumedFat: (fetchedDay || []).reduce((s, e) => s + (Number(e.fat) || 0), 0),
          consumedCarbs: (fetchedDay || []).reduce((s, e) => s + (Number(e.carbs) || 0), 0),
        });
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

  const refreshEntriesForSelectedDate = async () => {
    if (!userId) return;
    const dateStr = toLocalYmd(selectedDate);
    const [updatedAll, updatedDay] = await Promise.all([
      fetchAllEntries(userId),
      fetchTodayEntries(userId, dateStr),
    ]);
    setEntries(updatedAll || []);
    setDayEntries(updatedDay || []);
    setSummary({
      consumedKcal: (updatedDay || []).reduce((s, e) => s + (Number(e.kcal) || 0), 0),
      consumedProtein: (updatedDay || []).reduce((s, e) => s + (Number(e.protein) || 0), 0),
      consumedFat: (updatedDay || []).reduce((s, e) => s + (Number(e.fat) || 0), 0),
      consumedCarbs: (updatedDay || []).reduce((s, e) => s + (Number(e.carbs) || 0), 0),
    });
  };

  // Handle Add Meal
  const handleAddMeal = async (payload: CreateMealEntryPayload) => {
    await createMealEntry(userId, payload);
    await refreshEntriesForSelectedDate();
  };

  // Handle Update Meal
  const handleUpdateMeal = async (id: string, payload: CreateMealEntryPayload) => {
    await updateMealEntry(id, payload);
    await refreshEntriesForSelectedDate();
  };

  // Handle Delete Meal
  const handleDeleteMeal = async (id: string) => {
    await deleteMealEntry(id);
    await refreshEntriesForSelectedDate();
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
  const handleGoogleSuccess = async (loggedUser: UserProfile) => {
    setUser(loggedUser);
    setIsAuthOpen(false);

    if (!loggedUser.id) {
      console.error('Authenticated user has no id; skipping goal lookup');
      return;
    }

    const onboardedKey = `onboarded_${loggedUser.id}`;

    try {
      // Check if user already has an established goal in PostgreSQL
      const existingGoal = await fetchGoal(loggedUser.id);
      if (existingGoal) {
        setGoal(existingGoal);
        localStorage.setItem(onboardedKey, 'true');
        setToastMessage({
          title: `Welcome back, ${loggedUser.firstName}!`,
          desc: 'Your goals and meal progress are loaded.',
        });
        return;
      }

      // Truly empty goals list (HTTP 200) → first-time setup
      // If we previously completed onboarding but goals are missing, do not force the wizard again
      if (localStorage.getItem(onboardedKey) === 'true') {
        setToastMessage({
          title: `Welcome back, ${loggedUser.firstName}!`,
          desc: 'Could not load saved goals. You can set them from the header.',
        });
        return;
      }

      // Returning users (entries or favorites) without onboarded_* must not see first-time wizard
      try {
        const [existingEntries, existingFavorites] = await Promise.all([
          fetchAllEntries(loggedUser.id),
          fetchFavorites(loggedUser.id),
        ]);
        const looksReturning =
          (existingEntries?.length ?? 0) > 0 || (existingFavorites?.length ?? 0) > 0;
        if (looksReturning) {
          localStorage.setItem(onboardedKey, 'true');
          setToastMessage({
            title: `Welcome back, ${loggedUser.firstName}!`,
            desc: 'Could not load saved goals. You can set them from the header.',
          });
          return;
        }
      } catch {
        // ignore heuristic errors — fall through to onboarding only for true first-time users
      }

      setIsOnboardingOpen(true);
    } catch (err) {
      // Network/auth errors must not reopen onboarding (returning users often lack onboarded_* until first successful goal load)
      console.error('Error verifying user goals upon login:', err);
      setToastMessage({
        title: `Welcome, ${loggedUser.firstName}!`,
        desc: 'Signed in, but goals could not be loaded. Try refreshing or use Set goals.',
      });
    }
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
    await refreshEntriesForSelectedDate();
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false);
    setToastMessage({
      title: '🎉 Setup Complete!',
      desc: result.path === 'ai'
        ? `Your AI-personalized roadmap (${result.goal.kcal} kcal) is active.`
        : `Your custom goal (${result.goal.kcal} kcal) has been configured.`,
    });
  };

  // Handle Sign Out -> Direct redirect back to Login Modal & Wipe state
  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setEntries([]);
    setDayEntries([]);
    setSummary({
      consumedKcal: 0,
      consumedProtein: 0,
      consumedFat: 0,
      consumedCarbs: 0,
    });
    setIsAuthOpen(true);
    setToastMessage({
      title: 'Signed Out',
      desc: 'You have been safely signed out. Please sign in to continue.',
    });
  };

  // Strict Auth Guard: If not logged in, enforce the Login Screen (no dashboard access)
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 font-sans ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
      }`}>
        <GoogleLoginModal
          isOpen={true}
          onClose={() => {}}
          onLoginSuccess={handleGoogleSuccess}
          theme={theme}
          isGate={true}
        />
      </div>
    );
  }

  // Full-Screen Exclusive View for Onboarding (Completely eliminates background DOM & double scrollbars)
  if (isOnboardingOpen) {
    return (
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userId={userId}
        onCompleteOnboarding={handleOnboardingComplete}
        initialGoal={goal}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();
  const selectedDateFormatted = isTodaySelected
    ? `Today, ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
    : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // One list feeds Meal Intake AND Daily Progress (same day fetch, local calendar filter).
  const mealsToShow = dayEntries;
  const displaySummary: DailySummary = {
    consumedKcal: mealsToShow.reduce((s, e) => s + (Number(e.kcal) || 0), 0),
    consumedProtein: mealsToShow.reduce((s, e) => s + (Number(e.protein) || 0), 0),
    consumedFat: mealsToShow.reduce((s, e) => s + (Number(e.fat) || 0), 0),
    consumedCarbs: mealsToShow.reduce((s, e) => s + (Number(e.carbs) || 0), 0),
  };

  return (
    <div className={`transition-colors duration-300 font-sans flex flex-col selection:bg-white selection:text-black ${
      activeTab === 'nutria' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
    } ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
              : 'bg-[#141416]/95 border-white/[0.12] text-white shadow-black/80'
          }`}>
            <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white/10 text-white'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black">{toastMessage.title}</h4>
              <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {toastMessage.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
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
        isVisible={isHeaderVisible}
      />

      {/* Main Container */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 ${
        activeTab === 'nutria'
          ? 'overflow-hidden flex flex-col min-h-0 pt-6 sm:pt-8 pb-2 sm:pb-3'
          : 'pt-6 sm:pt-8 pb-16'
      }`}>
        <div className={`w-full ${activeTab === 'nutria' ? 'flex-1 h-full flex flex-col overflow-hidden min-h-0' : ''}`}>
        {activeTab === 'nutria' ? (
          <NutriaChatFeed
            userId={userId}
            messages={chatMessages}
            setMessages={setChatMessages}
            summary={displaySummary}
            goal={goal}
            onAddMeal={handleAddMeal}
            onOpenSetGoals={() => setIsSetGoalsOpen(true)}
            favorites={favorites}
            onAddFavorite={handleAddFavorite}
            onUpdateFavorite={handleUpdateFavorite}
            onDeleteFavorite={handleDeleteFavorite}
            theme={theme}
          />
        ) : (
            /* Overview Tab: Combined Daily Progress Dashboard & Analytics */
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* TOP SECTION: Daily Goal & Logged Meals (Migrated from Today) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* LEFT MAIN COLUMN */}
                <div className="lg:col-span-8 flex flex-col space-y-8 order-1">
                  
                  {/* Hero Kcal Card */}
                  <div className="transition-all duration-500 ease-out">
                    <HeroKcalCard
                      summary={displaySummary}
                      goal={goal}
                      onOpenSetGoals={() => setIsSetGoalsOpen(true)}
                      selectedDate={selectedDate}
                      onDateChange={(newDate) => setSelectedDate(newDate)}
                      theme={theme}
                      isLoading={loading}
                    />
                  </div>

                  {/* MOBILE INTERMEDIATE SIDEBAR */}
                  <div className="block lg:hidden order-2 transition-all duration-500 ease-out">
                    <LatestEntriesSidebar
                      userId={userId}
                      entries={mealsToShow}
                      favorites={favorites}
                      onAddMeal={handleAddMeal}
                      onUpdateMeal={handleUpdateMeal}
                      onDeleteMeal={handleDeleteMeal}
                      onAddFavorite={handleAddFavorite}
                      onUpdateFavorite={handleUpdateFavorite}
                      onDeleteFavorite={handleDeleteFavorite}
                      selectedDateFormatted={selectedDateFormatted}
                      theme={theme}
                      isLoading={loading}
                    />
                  </div>

                  {/* Consumed vs Left Table */}
                  <div className="transition-all duration-500 ease-out order-3 lg:order-2">
                    <ConsumedVsLeftTable
                      summary={displaySummary}
                      goal={goal}
                      selectedDate={selectedDate}
                      theme={theme}
                      isLoading={loading}
                    />
                  </div>

                </div>

                {/* DESKTOP RIGHT SIDEBAR (height matches left column via items-stretch) */}
                <div className="hidden lg:block lg:col-span-4 relative order-2 transition-all duration-500 ease-out">
                  <div className="absolute inset-0">
                    <LatestEntriesSidebar
                      userId={userId}
                      entries={mealsToShow}
                      favorites={favorites}
                      onAddMeal={handleAddMeal}
                      onUpdateMeal={handleUpdateMeal}
                      onDeleteMeal={handleDeleteMeal}
                      onAddFavorite={handleAddFavorite}
                      onUpdateFavorite={handleUpdateFavorite}
                      onDeleteFavorite={handleDeleteFavorite}
                      selectedDateFormatted={selectedDateFormatted}
                      theme={theme}
                      isLoading={loading}
                    />
                  </div>
                </div>

              </div>

              {/* SEPARATOR DIVIDER */}
              <div className={`h-px w-full ${isLight ? 'bg-slate-200/80' : 'bg-white/10'}`} />

              {/* BOTTOM SECTION: 7-Day & 31-Day Intake Trends */}
              <div>
                <OverviewDashboard goal={goal} entries={entries} theme={theme} isLoading={loading} />
              </div>

            </div>
        )}
        </div>
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
          onOpenManageFavorites={() => setIsGlobalFavoritesOpen(true)}
          theme={theme}
        />
      )}

      {/* Global Manage Favorites Modal (opened from Profile) */}
      <ManageFavoritesModal
        isOpen={isGlobalFavoritesOpen}
        onClose={() => setIsGlobalFavoritesOpen(false)}
        userId={userId}
        favorites={favorites}
        onAddFavorite={handleAddFavorite}
        onUpdateFavorite={handleUpdateFavorite}
        onDeleteFavorite={handleDeleteFavorite}
        theme={theme}
      />

    </div>
  );
}

export default App;
