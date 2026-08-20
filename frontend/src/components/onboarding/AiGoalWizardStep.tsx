import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
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
      
      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-2 pb-6 custom-scrollbar">
        
        {/* Header Info - Clear Visual Hierarchy */}
        <div className="pt-3 sm:pt-6 pb-4 sm:pb-6 text-center space-y-1.5">
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {stepTitles[currentStep - 1].title}
          </h2>

          <p className={`text-xs sm:text-sm font-medium max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
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
              className="space-y-3 sm:space-y-3.5"
            >
              {[
                {
                  id: 'fat_loss' as PrimaryObjective,
                  title: 'Fat Loss / Cutting',
                  desc: 'Caloric deficit to shed fat while preserving lean muscle mass.',
                  icon: Flame,
                  colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                },
                {
                  id: 'muscle_gain' as PrimaryObjective,
                  title: 'Muscle Growth / Lean Bulk',
                  desc: 'Strategic caloric surplus with high protein for hypertrophy.',
                  icon: Dumbbell,
                  colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
                },
                {
                  id: 'maintenance' as PrimaryObjective,
                  title: 'Weight Maintenance & Vitality',
                  desc: 'Equal energy balance to sustain weight and daily energy.',
                  icon: HeartPulse,
                  colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                },
                {
                  id: 'athletic_performance' as PrimaryObjective,
                  title: 'Athletic Performance & Fuel',
                  desc: 'High glycogen replenishment and endurance recovery for training.',
                  icon: Trophy,
                  colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
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
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? isLight
                          ? 'border-black bg-slate-100/90 shadow-xs ring-1 ring-black/20'
                          : 'border-white bg-white/10 shadow-xs'
                        : isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-white/[0.08] bg-[#121214] hover:bg-[#18181b] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${obj.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm sm:text-base font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {obj.title}
                        </h4>
                        <p className={`text-xs sm:text-sm mt-0.5 leading-snug truncate ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                          {obj.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? isLight ? 'border-black bg-black text-white' : 'border-white bg-white text-black'
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
                  <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    Biological Profile
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'male', label: 'Male' },
                      { id: 'female', label: 'Female' },
                      { id: 'other', label: 'Other' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateField('gender', g.id as 'male' | 'female' | 'other')}
                        className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                          formData.gender === g.id
                            ? isLight
                              ? 'border-black bg-black text-white font-black shadow-xs'
                              : 'border-white bg-white text-black font-black'
                            : isLight
                            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-white/[0.08] bg-[#18181b] text-zinc-300 hover:bg-[#202024]'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Quantitative Metric Inputs */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Age */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      Age (Years)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        enterKeyHint="next"
                        min={14}
                        max={120}
                        placeholder="28"
                        value={formData.age}
                        onChange={(e) => updateField('age', e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full border rounded-xl px-3.5 py-3 text-base font-bold focus:outline-none pr-9 ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500'
                            : 'bg-[#18181b] border-white/[0.12] text-white placeholder:text-zinc-500 focus:border-white/30'
                        }`}
                        required
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                        yrs
                      </span>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      Height (cm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        enterKeyHint="next"
                        min={100}
                        max={250}
                        placeholder="175"
                        value={formData.heightCm}
                        onChange={(e) => updateField('heightCm', e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full border rounded-xl px-3.5 py-3 text-base font-bold focus:outline-none pr-9 ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500'
                            : 'bg-[#18181b] border-white/[0.12] text-white placeholder:text-zinc-500 focus:border-white/30'
                        }`}
                        required
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Current Weight */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      Current Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        enterKeyHint="next"
                        min={30}
                        max={300}
                        placeholder="78"
                        value={formData.currentWeightKg}
                        onChange={(e) => updateField('currentWeightKg', e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full border rounded-xl px-3.5 py-3 text-base font-bold focus:outline-none pr-9 ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500'
                            : 'bg-[#18181b] border-white/[0.12] text-white placeholder:text-zinc-500 focus:border-white/30'
                        }`}
                        required
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Target Weight */}
                  <div>
                    <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      Target Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        enterKeyHint="done"
                        min={30}
                        max={300}
                        placeholder="74"
                        value={formData.targetWeightKg}
                        onChange={(e) => updateField('targetWeightKg', e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full border rounded-xl px-3.5 py-3 text-base font-bold focus:outline-none pr-9 ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500'
                            : 'bg-[#18181b] border-white/[0.12] text-white placeholder:text-zinc-500 focus:border-white/30'
                        }`}
                        required
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Disclaimer */}
                <div className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs sm:text-sm ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600'
                    : 'bg-[#18181b] border-white/[0.08] text-zinc-400'
                }`}>
                  <ShieldAlert className="w-4 h-4 shrink-0 text-zinc-400" />
                  <p className="leading-snug">
                    <span className="font-semibold">Note:</span> Used for energy calculations only, not medical advice.
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
              className="space-y-3 sm:space-y-3.5"
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
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? isLight
                          ? 'border-black bg-slate-100/90 shadow-xs ring-1 ring-black/20'
                          : 'border-white bg-white/10 shadow-xs'
                        : isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-white/[0.08] bg-[#121214] hover:bg-[#18181b] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${act.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm sm:text-base font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {act.title}
                          </h4>
                          <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${act.colorClass}`}>
                            {act.badge}
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm mt-0.5 leading-snug truncate ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                          {act.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? isLight ? 'border-black bg-black text-white' : 'border-white bg-white text-black'
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
              className="space-y-3 sm:space-y-3.5"
            >
              {[
                {
                  id: 'balanced' as DietPreference,
                  title: 'Standard Balanced',
                  desc: '~45% Carbs • 25% Protein • 30% Fat for everyday energy.',
                  icon: Scale,
                  colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
                },
                {
                  id: 'high_protein' as DietPreference,
                  title: 'High Protein Focused',
                  desc: '~35% Protein • 40% Carbs • 25% Fat to protect muscle.',
                  icon: Dumbbell,
                  colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
                },
                {
                  id: 'low_carb' as DietPreference,
                  title: 'Low Carb / Keto Friendly',
                  desc: '~20% Carbs • 30% Protein • 50% Fats for keto balance.',
                  icon: Egg,
                  colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                },
                {
                  id: 'plant_based' as DietPreference,
                  title: 'Plant-Forward / High Energy',
                  desc: '~55% Carbs • 25% Protein • 20% Fat with whole plant foods.',
                  icon: Leaf,
                  colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
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
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? isLight
                          ? 'border-black bg-slate-100/90 shadow-xs ring-1 ring-black/20'
                          : 'border-white bg-white/10 shadow-xs'
                        : isLight
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-white/[0.08] bg-[#121214] hover:bg-[#18181b] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${diet.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm sm:text-base font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {diet.title}
                        </h4>
                        <p className={`text-xs sm:text-sm mt-0.5 leading-snug truncate ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                          {diet.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected
                        ? isLight ? 'border-black bg-black text-white' : 'border-white bg-white text-black'
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

      {/* Bottom Action Bar */}
      <div className={`shrink-0 pt-4 pb-4 sm:pb-6 px-2 sm:px-3 flex items-center justify-between relative z-30 touch-manipulation border-t ${
        isLight ? 'bg-[#f8fafc] border-slate-200' : 'bg-[#080808] border-white/[0.08]'
      }`}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleBack}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 touch-manipulation select-none min-h-[46px] ${
            isLight
              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              : 'text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white'
          }`}
        >
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          disabled={!isStepValid()}
          onClick={() => handleNext()}
          className={`px-6 py-3 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-extrabold flex items-center space-x-2 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer select-none min-h-[46px] ${
            isLight
              ? 'bg-black hover:bg-zinc-800 text-white shadow-md'
              : 'bg-white hover:bg-zinc-200 text-black font-black'
          }`}
        >
          <span>{currentStep === totalSteps ? 'Calculate AI Roadmap' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
