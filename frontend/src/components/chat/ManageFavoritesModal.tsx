import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Sparkles, 
  Mic, 
  Camera, 
  Image as ImageIcon, 
  Send, 
  Loader2,
  ArrowLeft,
  Search
} from 'lucide-react';
import type { FavoriteMeal, CreateFavoriteMealPayload, MealType } from '../../types/favoriteMeal';
import type { CreateMealEntryPayload } from '../../types/nutrition';
import { MACRO_COLORS } from '../../utils/macroTokens';
import { parseMealText, parseMealAudio, parseMealImage, getApiErrorUserMessage } from '../../services/api';
import { MEAL_TYPE_LABELS, getCurrentTimeMealType, SortDropdown, MealTypeFormSelect, favoritesTypography, FavoritesModalHeader, type SortOption } from './favorites';

interface ManageFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  favorites: FavoriteMeal[];
  onAddFavorite: (payload: CreateFavoriteMealPayload) => void;
  onUpdateFavorite: (id: string, payload: CreateFavoriteMealPayload) => void;
  onDeleteFavorite: (id: string) => void;
  onLogMeal?: (payload: CreateMealEntryPayload) => void;
  theme?: 'dark' | 'light';
}

export const ManageFavoritesModal: React.FC<ManageFavoritesModalProps> = ({
  isOpen,
  onClose,
  userId,
  favorites,
  onAddFavorite,
  onUpdateFavorite,
  onDeleteFavorite,
  onLogMeal,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [activeFilter, setActiveFilter] = useState<'ALL' | MealType>(getCurrentTimeMealType());
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // AI Omnibar in Modal State
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiRecording, setIsAiRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form State for creating/editing
  const [formMealName, setFormMealName] = useState('');
  const [formMealType, setFormMealType] = useState<MealType>(getCurrentTimeMealType());
  const [formKcal, setFormKcal] = useState('');
  const [formProtein, setFormProtein] = useState('');
  const [formCarbs, setFormCarbs] = useState('');
  const [formFat, setFormFat] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Close attachment menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(target)) {
        setIsAttachmentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveFilter(getCurrentTimeMealType());
      setFormMealType(getCurrentTimeMealType());
      setSearchQuery('');
      setIsCreating(false);
      setEditingId(null);
      setIsAttachmentMenuOpen(false);
    }
  }

  const cleanupVoiceRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsAiRecording(false);
    setRecordingSeconds(0);
  }, []);

  const handleBackToBrowse = useCallback(() => {
    setFormMealName('');
    setFormMealType(getCurrentTimeMealType());
    setFormKcal('');
    setFormProtein('');
    setFormCarbs('');
    setFormFat('');
    setErrorMessage('');
    setAiInputText('');
    setIsCreating(false);
    setEditingId(null);
    setIsAttachmentMenuOpen(false);
    cleanupVoiceRecording();
  }, [cleanupVoiceRecording]);

  useEffect(() => {
    return () => cleanupVoiceRecording();
  }, [cleanupVoiceRecording]);

  // Lock background scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreating || editingId) {
          handleBackToBrowse();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isCreating, editingId, handleBackToBrowse, onClose]);

  const handleStartCreate = () => {
    handleBackToBrowse();
    setIsCreating(true);
  };

  const handleStartEdit = (fav: FavoriteMeal) => {
    handleBackToBrowse();
    setEditingId(fav.id);
    setFormMealName(fav.mealName);
    setFormMealType(fav.mealType);
    setFormKcal(String(fav.kcal));
    setFormProtein(String(fav.protein));
    setFormCarbs(String(fav.carbs));
    setFormFat(String(fav.fat));
  };

  // --- AI HANDLERS (TEXT, AUDIO, PHOTO) ---
  const handleAiParseText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setErrorMessage('');
    try {
      const res = await parseMealText(userId, aiInputText.trim());
      setFormMealName(res.mealName || aiInputText.trim());
      setFormKcal(String(res.kcal || 0));
      setFormProtein(String(res.protein || 0));
      setFormCarbs(String(res.carbs || 0));
      setFormFat(String(res.fat || 0));
    } catch (err) {
      setErrorMessage(
        getApiErrorUserMessage(err, 'Could not analyze meal description. Please fill in macros manually.')
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStartVoiceRecording = async () => {
    if (isAiLoading || isAiRecording) return;
    setIsAttachmentMenuOpen(false);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(250);
      setIsAiRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access was denied or not supported.');
    }
  };

  const handleStopAndSendVoice = () => {
    if (!mediaRecorderRef.current || !isAiRecording) return;
    setIsAiLoading(true);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      cleanupVoiceRecording();

      try {
        const audioFile = new File([audioBlob], `voice-fav-${Date.now()}.webm`, { type: 'audio/webm' });
        const res = await parseMealAudio(userId, audioFile);
        setFormMealName(res.mealName || 'Voice Estimated Meal');
        setFormKcal(String(res.kcal || 0));
        setFormProtein(String(res.protein || 0));
        setFormCarbs(String(res.carbs || 0));
        setFormFat(String(res.fat || 0));
      } catch (err) {
        setErrorMessage(
          getApiErrorUserMessage(err, 'Could not transcribe audio note. Please describe in text.')
        );
      } finally {
        setIsAiLoading(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsAttachmentMenuOpen(false);
      setIsAiLoading(true);
      setErrorMessage('');
      try {
        const res = await parseMealImage(userId, file);
        setFormMealName(res.mealName || 'Photo Estimated Meal');
        setFormKcal(String(res.kcal || 0));
        setFormProtein(String(res.protein || 0));
        setFormCarbs(String(res.carbs || 0));
        setFormFat(String(res.fat || 0));
      } catch (err) {
        setErrorMessage(
          getApiErrorUserMessage(err, 'Could not analyze photo. Please describe in text.')
        );
      } finally {
        setIsAiLoading(false);
        e.target.value = '';
      }
    }
  };

  const canSave = formMealName.trim().length > 0;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) {
      setErrorMessage('Please enter a meal title.');
      return;
    }

    const payload: CreateFavoriteMealPayload = {
      mealName: formMealName.trim(),
      mealType: formMealType,
      kcal: Math.round(Number(formKcal) || 0),
      protein: Number(formProtein) || 0,
      carbs: Number(formCarbs) || 0,
      fat: Number(formFat) || 0,
    };

    if (editingId) {
      onUpdateFavorite(editingId, payload);
    } else {
      onAddFavorite(payload);
    }

    handleBackToBrowse();
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredFavorites = favorites.filter((fav) => {
    const matchesCategory =
    activeFilter === 'ALL'
      ? true
      : String(fav.mealType || '').toUpperCase() === String(activeFilter || '').toUpperCase();
    const matchesSearch = !searchQuery.trim() || fav.mealName.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (sortBy === 'name_asc') return a.mealName.localeCompare(b.mealName);
    if (sortBy === 'name_desc') return b.mealName.localeCompare(a.mealName);
    if (sortBy === 'date_desc') return (b.createdAt || '').localeCompare(a.createdAt || '');
    if (sortBy === 'date_asc') return (a.createdAt || '').localeCompare(b.createdAt || '');
    return 0;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden file & camera inputs for AI Omnibar */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />

      {/* Main iOS Bottom Sheet Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`rounded-t-[32px] sm:rounded-[32px] max-w-3xl w-full h-[92dvh] max-h-[92dvh] sm:h-[620px] sm:max-h-[88vh] flex flex-col shadow-2xl border-t sm:border border-x-0 sm:border-x border-b-0 sm:border-b relative overflow-hidden animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:duration-200 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10 [color-scheme:light]'
              : 'bg-[#121214] border-white/[0.08] text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] [color-scheme:dark]'
          }`}
        >
          <FavoritesModalHeader
            title="Favorite Meals"
            subtitle="Manage your favorite meals"
            theme={theme}
            onClose={onClose}
          />

          {/* Scrollable Body (Search, Filters, Favorites List) */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto flex-1 min-h-0 space-y-3 sm:space-y-4 no-scrollbar">
            {/* Search Bar + New Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 sm:w-4.5 sm:h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isLight ? 'text-slate-400' : 'text-zinc-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search favorite meals..."
                  className={`w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-2xl text-sm sm:text-base font-semibold border focus:outline-none transition-all ${
                    isLight
                      ? 'bg-slate-100/80 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400'
                      : 'bg-[#18181b] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-white/20 focus:bg-[#202024]'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors cursor-pointer ${
                      isLight ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* New Favorite Button */}
              <button
                type="button"
                onClick={handleStartCreate}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 ${
                  isLight
                    ? 'bg-black hover:bg-zinc-800 text-white'
                    : 'bg-white hover:bg-zinc-200 text-black'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">New Favorite</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* CATEGORY PILLS & SORT ROW */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                {(['ALL', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const).map((type) => {
                  const isActive = activeFilter === type;
                  const label = type === 'ALL' ? 'All' : MEAL_TYPE_LABELS[type].label;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveFilter(type)}
                      className={`px-3.5 py-1.5 rounded-full text-sm sm:text-base font-semibold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? isLight
                            ? 'bg-black text-white shadow-xs font-bold'
                            : 'bg-white text-black font-extrabold shadow-sm'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-[#18181b] text-zinc-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort Filter Dropdown */}
              <div className="shrink-0 ml-auto">
                <SortDropdown
                  selectedSort={sortBy}
                  onSortChange={setSortBy}
                  theme={theme}
                  placement="bottom"
                />
              </div>
            </div>

            {/* LIST OF SAVED FAVORITES */}
            <div className="space-y-2.5 pt-1">
              {sortedFavorites.length === 0 ? (
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className={`w-full p-8 sm:p-10 text-center rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer active:scale-[0.99] group ${
                    isLight
                      ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-700'
                      : 'bg-[#151518]/60 hover:bg-[#18181c] border-white/10 hover:border-white/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 shadow-xs ${
                    isLight ? 'bg-slate-200 text-slate-900' : 'bg-white/10 text-white'
                  }`}>
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold">
                    {searchQuery ? `No favorites matching "${searchQuery}"` : 'No favorite meals in this category'}
                  </p>
                  <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {searchQuery ? 'Try another search term or tap to create a new favorite' : 'Tap here to add a new favorite meal'}
                  </p>
                </button>
              ) : (
                sortedFavorites.map((fav) => (
                  <div
                    key={fav.id}
                    role={onLogMeal ? 'button' : undefined}
                    tabIndex={onLogMeal ? 0 : undefined}
                    onClick={() => {
                      if (!onLogMeal) return;
                      onLogMeal({
                        mealName: fav.mealName,
                        kcal: Number(fav.kcal) || 0,
                        protein: Number(fav.protein) || 0,
                        carbs: Number(fav.carbs) || 0,
                        fat: Number(fav.fat) || 0,
                        source: 'MANUAL',
                      });
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (!onLogMeal) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onLogMeal({
                          mealName: fav.mealName,
                          kcal: Number(fav.kcal) || 0,
                          protein: Number(fav.protein) || 0,
                          carbs: Number(fav.carbs) || 0,
                          fat: Number(fav.fat) || 0,
                          source: 'MANUAL',
                        });
                        onClose();
                      }
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      onLogMeal ? 'cursor-pointer' : ''
                    } ${
                      isLight
                        ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                        : 'bg-[#18181b] border-white/[0.08] hover:border-white/[0.14]'
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-extrabold truncate">{fav.mealName}</h4>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-zinc-400'
                        }`}>
                          {MEAL_TYPE_LABELS[fav.mealType].label}
                        </span>
                      </div>

                      {/* Macro Tokens */}
                      <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-1.5 text-xs sm:text-sm font-bold">
                        <span className={isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}>
                          {fav.kcal} <span className="text-xs font-bold opacity-80">KCAL</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className={isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}>
                          {fav.protein}g <span className="text-xs font-bold opacity-80">PRO</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className={isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}>
                          {fav.carbs}g <span className="text-xs font-bold opacity-80">CAR</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className={isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}>
                          {fav.fat}g <span className="text-xs font-bold opacity-80">FAT</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {onLogMeal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLogMeal({
                              mealName: fav.mealName,
                              kcal: Number(fav.kcal) || 0,
                              protein: Number(fav.protein) || 0,
                              carbs: Number(fav.carbs) || 0,
                              fat: Number(fav.fat) || 0,
                              source: 'MANUAL',
                            });
                            onClose();
                          }}
                          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer min-h-[36px] ${
                            isLight
                              ? 'bg-black text-white hover:bg-zinc-800'
                              : 'bg-white text-black hover:bg-zinc-200'
                          }`}
                          title="Log this meal"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Log</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(fav);
                        }}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                          isLight
                            ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                            : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                        }`}
                        title="Edit Meal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFavorite(fav.id);
                        }}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Delete Favorite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Tip */}
          <div className={`px-4 py-3 sm:px-6 sm:py-4 border-t text-center shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141416]'
          }`}>
            <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {onLogMeal
                ? '💡 Tap a favorite (or "Log") to add it to your daily intake, or tap "+ New Favorite" to create one.'
                : '💡 Tapping a favorite chip in the chat logs it with 1 single click.'}
            </p>
          </div>

          {/* CREATING OR EDITING DEDICATED POPUP SHEET OVERLAY */}
          {(isCreating || editingId) && (
            <div className={`absolute inset-0 z-30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:duration-150 ${
              isLight ? 'bg-white text-slate-900 [color-scheme:light]' : 'bg-[#121214] text-white [color-scheme:dark]'
            }`}>
              <FavoritesModalHeader
                title={editingId ? 'Edit Favorite Meal' : 'Create New Favorite'}
                subtitle={
                  editingId
                    ? 'Update your saved favorite meal'
                    : 'Add a favorite manually or with NutrIA'
                }
                theme={theme}
                onClose={onClose}
              />

              {/* Back below header */}
              <div className="shrink-0 px-4 pt-2 pb-2">
                <button
                  type="button"
                  onClick={handleBackToBrowse}
                  className={`min-h-[44px] px-1 -ml-1 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                    isLight
                      ? 'hover:bg-slate-200 text-slate-700'
                      : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                  }`}
                  title="Back to Favorites"
                  aria-label="Back to Favorites"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  <span className="text-xs sm:text-sm font-bold">
                    <span className="hidden sm:inline">Back to Favorites</span>
                    <span className="sm:hidden">Back</span>
                  </span>
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 no-scrollbar">
                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs sm:text-sm font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* 🧠 AI SMART OMNIBAR GENERATOR (Single Clean Capsule) */}
                {!editingId && (
                  <div className="relative space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <label className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wide ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Calculate with NutrIA
                      </label>
                    </div>

                    {/* ATTACHMENT POPOVER MENU */}
                    {isAttachmentMenuOpen && (
                      <div
                        ref={attachmentMenuRef}
                        className={`absolute bottom-full mb-2 left-2 z-40 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[180px] ${
                          isLight
                            ? 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-900/10'
                            : 'bg-[#18181b]/98 border-white/[0.12] text-white shadow-black/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachmentMenuOpen(false);
                            cameraInputRef.current?.click();
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                            isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#222226] text-zinc-200 hover:text-white'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                          <span>Take Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAttachmentMenuOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                            isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#222226] text-zinc-200 hover:text-white'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                          <span>Photo Library</span>
                        </button>
                      </div>
                    )}

                    {/* AI Capsule - Single clean border with no double wrapper */}
                    <div className={`p-2 rounded-2xl border flex items-center space-x-2 shadow-xs ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#18181b] border-white/[0.12] text-white'
                    }`}>
                      {/* Voice Recording Mode */}
                      {isAiRecording ? (
                        <div className="flex-1 flex items-center justify-between px-2 py-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-xs sm:text-sm font-mono font-bold">Recording... {recordingSeconds}s</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={cleanupVoiceRecording}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 text-xs sm:text-sm font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleStopAndSendVoice}
                              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-sm cursor-pointer ${
                                isLight ? 'bg-black text-white' : 'bg-white text-black'
                              }`}
                            >
                              Analyze
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Input Mode with '+' Unified Attachment */
                        <form onSubmit={handleAiParseText} className="flex-1 flex items-center space-x-2 px-1">
                          <button
                            type="button"
                            onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                            disabled={isAiLoading}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                              isAttachmentMenuOpen
                                ? isLight ? 'bg-black text-white border-black' : 'bg-white text-black border-white'
                                : isLight ? 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-[#202024] hover:bg-[#28282e] text-zinc-300 border-white/[0.08]'
                            }`}
                            title="Add photo or camera"
                          >
                            <Plus className={`w-4 h-4 transition-transform ${isAttachmentMenuOpen ? 'rotate-45' : ''}`} />
                          </button>

                          <input
                            type="text"
                            value={aiInputText}
                            onChange={(e) => setAiInputText(e.target.value)}
                            disabled={isAiLoading}
                            placeholder="Describe meal with AI (e.g. 2 eggs & toast)..."
                            className={`flex-1 bg-transparent px-2.5 py-1.5 text-sm sm:text-base font-semibold focus:outline-none placeholder:text-zinc-500 ${
                              isLight ? 'text-slate-900' : 'text-white'
                            }`}
                          />

                          <button
                            type="button"
                            onClick={handleStartVoiceRecording}
                            disabled={isAiLoading}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                              isLight ? 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-[#202024] hover:bg-[#28282e] text-zinc-300 border-white/[0.08]'
                            }`}
                            title="Speak voice note"
                          >
                            <Mic className="w-4 h-4" />
                          </button>

                          <button
                            type="submit"
                            disabled={!aiInputText.trim() || isAiLoading}
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all shadow-sm shrink-0 ${
                              aiInputText.trim() && !isAiLoading
                                ? isLight ? 'bg-black text-white cursor-pointer' : 'bg-white text-black cursor-pointer'
                                : 'opacity-30 cursor-not-allowed bg-zinc-700 text-zinc-400'
                            }`}
                          >
                            {isAiLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* Divider: ---- or enter manually ---- */}
                {!editingId && (
                  <div className="relative flex items-center py-2 sm:py-3">
                    <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`} />
                    <span className={`flex-shrink mx-3 text-xs sm:text-sm font-black uppercase tracking-wider ${
                      isLight ? 'text-slate-500' : 'text-zinc-400'
                    }`}>
                      or enter manually
                    </span>
                    <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`} />
                  </div>
                )}

                {/* MEAL FIELDS & MACROS FORM */}
                <form onSubmit={handleSaveSubmit} className="space-y-3 sm:space-y-4 pt-0.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="sm:col-span-2">
                      <label className={`block text-xs sm:text-sm font-extrabold mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Meal Title
                      </label>
                      <input
                        type="text"
                        value={formMealName}
                        onChange={(e) => setFormMealName(e.target.value)}
                        placeholder="e.g. Oatmeal & Berries Bowl"
                        className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-bold border focus:outline-none ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500'
                            : 'bg-[#121214] border-white/[0.1] text-white focus:border-white/30'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs sm:text-sm font-extrabold mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Category
                      </label>
                      <MealTypeFormSelect
                        value={formMealType}
                        onChange={setFormMealType}
                        theme={theme}
                        placement="bottom"
                      />
                    </div>
                  </div>

                  {/* Macro Inputs Grid — 4 Columns in single row */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <div>
                      <label className={`block text-xs sm:text-sm font-black uppercase mb-1 text-center truncate ${
                        isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text
                      }`}>
                        <span className="hidden sm:inline">Calories</span>
                        <span className="sm:hidden">Kcal</span>
                      </label>
                      <input
                        type="number"
                        value={formKcal}
                        onChange={(e) => setFormKcal(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-black border focus:outline-none text-center ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121214] border-white/[0.1] text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs sm:text-sm font-black uppercase mb-1 text-center truncate ${
                        isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text
                      }`}>
                        <span className="hidden sm:inline">Protein (g)</span>
                        <span className="sm:hidden">Prot (g)</span>
                      </label>
                      <input
                        type="number"
                        value={formProtein}
                        onChange={(e) => setFormProtein(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-black border focus:outline-none text-center ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121214] border-white/[0.1] text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs sm:text-sm font-black uppercase mb-1 text-center truncate ${
                        isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text
                      }`}>
                        <span className="hidden sm:inline">Carbs (g)</span>
                        <span className="sm:hidden">Carb (g)</span>
                      </label>
                      <input
                        type="number"
                        value={formCarbs}
                        onChange={(e) => setFormCarbs(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-black border focus:outline-none text-center ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121214] border-white/[0.1] text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs sm:text-sm font-black uppercase mb-1 text-center truncate ${
                        isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text
                      }`}>
                        <span className="hidden sm:inline">Fat (g)</span>
                        <span className="sm:hidden">Fat (g)</span>
                      </label>
                      <input
                        type="number"
                        value={formFat}
                        onChange={(e) => setFormFat(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-black border focus:outline-none text-center ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121214] border-white/[0.1] text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-2 sm:pt-3">
                    <button
                      type="button"
                      onClick={handleBackToBrowse}
                      className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/15 text-zinc-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!canSave}
                      className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-sm flex items-center space-x-2 ${
                        canSave
                          ? `active:scale-95 cursor-pointer ${isLight ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'}`
                          : `opacity-40 cursor-not-allowed ${isLight ? 'bg-black text-white' : 'bg-white text-black'}`
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{editingId ? 'Save Changes' : 'Save Favorite'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer Help Tip */}
              <div className={`px-4 py-3 sm:px-6 sm:py-4 border-t text-center shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141416]'
              }`}>
                <p className={`${favoritesTypography.footerTip} ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {editingId
                    ? '💡 Changes update your saved favorite preset.'
                    : '💡 Describe with NutrIA or fill in the form manually.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
