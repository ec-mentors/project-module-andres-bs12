import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles,
  Flame, 
  Dumbbell, 
  HeartPulse, 
  Trophy, 
  Coffee,
  Footprints,
  Zap,
  Leaf,
  Scale,
  Egg,
  Check,
  ShieldAlert
} from 'lucide-react';
import type { 
  AiOnboardingState, 
  PrimaryObjective, 
  ActivityLevel, 
  DietPreference 
} from './types';

interface AiGoalWizardStepProps {
  initialData: AiOnboardingState;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onBackToPath: () => void;
  onComplete: (data: AiOnboardingState) => void;
  theme?: 'dark' | 'light';
}

export const AiGoalWizardStep: React.FC<AiGoalWizardStepProps> = ({
  initialData,
  initialStep = 1,
  onStepChange,
  onBackToPath,
  onComplete,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(1);
  const [formData, setFormData] = useState<AiOnboardingState>(initialData);

  const totalSteps = 4;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  const updateField = <K extends keyof AiOnboardingState>(field: K, value: AiOnboardingState[K]) => {
    (document.activeElement as HTMLElement)?.blur();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    if (currentStep === 1) return formData.objective !== null;
    if (currentStep === 2) {
      return (
        formData.gender !== null &&
        formData.age !== '' &&
        Number(formData.age) > 0 &&
        formData.heightCm !== '' &&
        Number(formData.heightCm) > 0 &&
        formData.currentWeightKg !== '' &&
        Number(formData.currentWeightKg) > 0 &&
        formData.targetWeightKg !== '' &&
        Number(formData.targetWeightKg) > 0
      );
    }
    if (currentStep === 3) return formData.activityLevel !== null;
    if (currentStep === 4) return formData.dietPreference !== null;
    return true;
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isStepValid()) return;
    (document.activeElement as HTMLElement)?.blur();

    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    (document.activeElement as HTMLElement)?.blur();
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    } else {
      onBackToPath();
    }
  };

  const stepTitles = [
    { title: 'Primary Objective', desc: 'What is your main nutrition goal?' },
    { title: 'Body & Profile Stats', desc: 'Enter your metrics to calculate your basal metabolic rate (BMR)' },
    { title: 'Daily Activity Level', desc: 'How active is your weekly lifestyle?' },
    { title: 'Dietary Preference', desc: 'Choose your preferred macronutrient balance' },
  ];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -20 : 20,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <div className="w-full max-w-xl mx-auto h-full flex flex-col justify-between text-left">
      
      {/* Scrollable Middle Content with Breathable Bottom Padding */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-1 pb-8 sm:pb-10 custom-scrollbar">
        
        {/* Header Info with Restored Tag, Strong Hierarchy & Breathable Spacing */}
        <div className="pt-3 sm:pt-5 mb-5 sm:mb-7 text-center">
          {/* Restored Tag with Refined Spacing (5-step onboarding flow) */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#6417ff]/15 text-[#6417ff] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3 border border-[#6417ff]/25 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {currentStep + 1} of 5</span>
          </div>

          {/* Section Title: Prominent, Legible Typography */}
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 sm:mb-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {stepTitles[currentStep - 1].title}
          </h2>

          {/* Subtitle: Breathable Margin and Relaxed Line Height */}
          <p className={`text-xs sm:text-sm font-normal max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {stepTitles[currentStep - 1].desc}
          </p>
        </div>

      {/* Step Content */}
      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 1: PRIMARY OBJECTIVE */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-3"
            >
              {[
                {
                  id: 'fat_loss' as PrimaryObjective,
                  title: 'Fat Loss / Cutting',
                  desc: 'Caloric deficit to shed body fat while preserving lean muscle mass.',
                  icon: Flame,
                  colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
                },
                {
                  id: 'muscle_gain' as PrimaryObjective,
                  title: 'Muscle Growth / Lean Bulk',
                  desc: 'Strategic caloric surplus with high protein for hypertrophy.',
                  icon: Dumbbell,
                  colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
                },
                {
                  id: 'maintenance' as PrimaryObjective,
                  title: 'Weight Maintenance & Vitality',
                  desc: 'Equal energy balance to maintain weight and sustain daily energy.',
                  icon: HeartPulse,
                  colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
                },
                {
                  id: 'athletic_performance' as PrimaryObjective,
                  title: 'Athletic Performance & Fuel',
                  desc: 'High glycogen replenishment and endurance recovery for training.',
                  icon: Trophy,
                  colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
                },
              ].map((obj) => {
                const Icon = obj.icon;
                const isSelected = formData.objective === obj.id;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => updateField('objective', obj.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff]/10 shadow-md ring-1 ring-[#6417ff]/30'
                        : isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-white/10 bg-[#150e26]/80 hover:bg-[#1f153a] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl border ${obj.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {obj.title}
                        </h4>
                        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {obj.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff] text-white'
                        : isLight
                        ? 'border-slate-300'
                        : 'border-white/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* STEP 2: BODY & PROFILE STATS */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <form onSubmit={handleNext} className="space-y-4">
                {/* Gender Selection */}
                <div>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Biological Profile
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'male', label: 'Male' },
                      { id: 'female', label: 'Female' },
                      { id: 'other', label: 'Other' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateField('gender', g.id as 'male' | 'female' | 'other')}
                        className={`py-3 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                          formData.gender === g.id
                            ? 'border-[#6417ff] bg-[#6417ff]/15 text-[#6417ff]'
                            : isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-white/10 bg-[#150e26] text-slate-300 hover:bg-[#1f153a]'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age & Height */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min={14}
                      max={120}
                      placeholder="e.g. 28"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:border-[#6417ff] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-[#150e26] border-white/15 text-white placeholder:text-slate-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={250}
                      placeholder="e.g. 175"
                      value={formData.heightCm}
                      onChange={(e) => updateField('heightCm', e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:border-[#6417ff] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-[#150e26] border-white/15 text-white placeholder:text-slate-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Current Weight & Target Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Current Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={30}
                      max={300}
                      placeholder="e.g. 78"
                      value={formData.currentWeightKg}
                      onChange={(e) => updateField('currentWeightKg', e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:border-[#6417ff] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-[#150e26] border-white/15 text-white placeholder:text-slate-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={30}
                      max={300}
                      placeholder="e.g. 74"
                      value={formData.targetWeightKg}
                      onChange={(e) => updateField('targetWeightKg', e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:border-[#6417ff] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-[#150e26] border-white/15 text-white placeholder:text-slate-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Disclaimer */}
                <div className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  <p className="leading-snug">
                    <span className="font-semibold">Note:</span> These values are used to calculate nutritional energy estimates and do not constitute medical advice.
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: DAILY ACTIVITY LEVEL */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-3"
            >
              {[
                {
                  id: 'sedentary' as ActivityLevel,
                  title: 'Sedentary',
                  desc: 'Desk job, minimal movement, < 3,000 steps/day.',
                  badge: '1.2x TDEE',
                  icon: Coffee,
                  colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
                },
                {
                  id: 'light' as ActivityLevel,
                  title: 'Lightly Active',
                  desc: 'Light daily walking, 1-2 light workout sessions weekly.',
                  badge: '1.38x TDEE',
                  icon: Footprints,
                  colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                },
                {
                  id: 'moderate' as ActivityLevel,
                  title: 'Moderately Active',
                  desc: 'Consistent exercise 3-5 days/week (gym, running, sports).',
                  badge: '1.55x TDEE',
                  icon: Flame,
                  colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                },
                {
                  id: 'very_active' as ActivityLevel,
                  title: 'Very Active / High Intensity',
                  desc: 'Heavy strength training or athletic conditioning 6+ days/week.',
                  badge: '1.73x TDEE',
                  icon: Zap,
                  colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                },
              ].map((act) => {
                const Icon = act.icon;
                const isSelected = formData.activityLevel === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => updateField('activityLevel', act.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff]/10 shadow-md ring-1 ring-[#6417ff]/30'
                        : isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-white/10 bg-[#150e26]/80 hover:bg-[#1f153a] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl border ${act.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {act.title}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${act.colorClass}`}>
                            {act.badge}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {act.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff] text-white'
                        : isLight
                        ? 'border-slate-300'
                        : 'border-white/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* STEP 4: DIETARY PREFERENCE */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-3"
            >
              {[
                {
                  id: 'balanced' as DietPreference,
                  title: 'Standard Balanced',
                  desc: 'Versatile balance (~45% Carbs, 25% Protein, 30% Fat) for flexible everyday nutrition.',
                  icon: Scale,
                  colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
                },
                {
                  id: 'high_protein' as DietPreference,
                  title: 'High Protein Focused',
                  desc: 'Higher protein density (~35% Protein, 40% Carbs, 25% Fat) to protect muscle tissue.',
                  icon: Dumbbell,
                  colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                },
                {
                  id: 'low_carb' as DietPreference,
                  title: 'Low Carb / Keto Friendly',
                  desc: 'Reduced carbs and higher healthy fats (~20% Carbs, 30% Protein, 50% Fats).',
                  icon: Egg,
                  colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                },
                {
                  id: 'plant_based' as DietPreference,
                  title: 'Plant-Forward / High Energy',
                  desc: 'Wholesome complex carbs and clean plant fats (~55% Carbs, 25% Protein, 20% Fat).',
                  icon: Leaf,
                  colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                },
              ].map((diet) => {
                const Icon = diet.icon;
                const isSelected = formData.dietPreference === diet.id;
                return (
                  <button
                    key={diet.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => updateField('dietPreference', diet.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff]/10 shadow-md ring-1 ring-[#6417ff]/30'
                        : isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-white/10 bg-[#150e26]/80 hover:bg-[#1f153a] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl border ${diet.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {diet.title}
                        </h4>
                        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {diet.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff] text-white'
                        : isLight
                        ? 'border-slate-300'
                        : 'border-white/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      </div>

      {/* FIXED REVOLUT-STYLE BOTTOM ACTION BAR (Exact same position across all sub-steps & devices) */}
      <div className={`shrink-0 pt-4 pb-3 sm:pb-4 px-1 sm:px-2 flex items-center justify-between relative z-30 touch-manipulation ${
        isLight ? 'bg-[#f8fafc]' : 'bg-[#090516]'
      }`}>
        {/* Soft Feathered Top Divider */}
        <div className={`absolute top-0 inset-x-0 h-[1px] pointer-events-none ${
          isLight
            ? 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
        }`} />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleBack}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 touch-manipulation select-none ${
            isLight
              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              : 'text-slate-300 bg-white/5 hover:bg-white/10'
          }`}
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          disabled={!isStepValid()}
          onClick={() => handleNext()}
          className="px-6 py-3 rounded-2xl bg-[#6417ff] hover:bg-[#530ce8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-[#6417ff]/20 active:scale-95 transition-all touch-manipulation cursor-pointer select-none"
        >
          <span>{currentStep === totalSteps ? 'Calculate AI Roadmap' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
