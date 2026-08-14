import React, { useState } from 'react';
import { Check, Sparkles, Scale, Flame, Dumbbell, Zap } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';

interface ManualGoalStepProps {
  initialGoal?: NutritionGoal;
  onBackToPath: () => void;
  onComplete: (goal: NutritionGoal) => void;
  theme?: 'dark' | 'light';
}

interface Preset {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass: string;
}

const PRESETS: Preset[] = [
  {
    id: 'balanced',
    name: 'Balanced Lifestyle',
    kcal: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    icon: Scale,
    iconColorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    id: 'high_protein_cut',
    name: 'High Protein Deficit',
    kcal: 1800,
    protein: 180,
    carbs: 140,
    fat: 55,
    icon: Flame,
    iconColorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'lean_bulk',
    name: 'Hypertrophy / Bulk',
    kcal: 2600,
    protein: 190,
    carbs: 320,
    fat: 60,
    icon: Dumbbell,
    iconColorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'keto',
    name: 'Ketogenic / Low-Carb',
    kcal: 1900,
    protein: 130,
    carbs: 30,
    fat: 140,
    icon: Zap,
    iconColorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

export const ManualGoalStep: React.FC<ManualGoalStepProps> = ({
  initialGoal,
  onBackToPath,
  onComplete,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const [kcal, setKcal] = useState(initialGoal?.kcal || 2000);
  const [protein, setProtein] = useState(initialGoal?.protein || 150);
  const [carbs, setCarbs] = useState(initialGoal?.carbs || 200);
  const [fat, setFat] = useState(initialGoal?.fat || 65);
  const [selectedPreset, setSelectedPreset] = useState<string | null>('balanced');

  const handleSelectPreset = (preset: Preset) => {
    (document.activeElement as HTMLElement)?.blur();
    setSelectedPreset(preset.id);
    setKcal(preset.kcal);
    setProtein(preset.protein);
    setCarbs(preset.carbs);
    setFat(preset.fat);
  };

  const handleCustomChange = () => {
    setSelectedPreset(null);
  };

  // Math for macro caloric split
  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const calculatedTotalKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinPct = calculatedTotalKcal > 0 ? Math.round((proteinKcal / calculatedTotalKcal) * 100) : 0;
  const carbsPct = calculatedTotalKcal > 0 ? Math.round((carbsKcal / calculatedTotalKcal) * 100) : 0;
  const fatPct = calculatedTotalKcal > 0 ? Math.round((fatKcal / calculatedTotalKcal) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();
    onComplete({
      kcal: Number(kcal) || 2000,
      protein: Number(protein) || 150,
      carbs: Number(carbs) || 200,
      fat: Number(fat) || 65,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto h-full flex flex-col justify-between text-left animate-in fade-in duration-300">
      
      {/* Scrollable Middle Content with Breathable Bottom Padding */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-1 pb-8 sm:pb-10 custom-scrollbar">
        
        {/* Header with Professional UX Hierarchy & Spacing */}
        <div className="pt-2 sm:pt-3 mb-4 sm:mb-6 text-center">
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Custom Goal Parameters
          </h2>
          <p className={`text-xs sm:text-sm font-normal max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Select a verified preset or directly configure your daily calorie and macronutrient targets.
          </p>
        </div>

        <div className="space-y-4">
          {/* Presets Grid */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Quick Goal Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#6417ff] bg-[#6417ff]/15 ring-1 ring-[#6417ff]/30 shadow-md'
                        : isLight
                        ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        : 'border-white/10 bg-[#150e26]/80 hover:bg-[#1d1338] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl border ${p.iconColorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs sm:text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {p.name}
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all ${
                      isSelected
                        ? 'bg-[#6417ff] text-white ring-2 ring-[#6417ff]/40'
                        : isLight
                        ? 'border-2 border-slate-300'
                        : 'border-2 border-white/25'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Single Container for Calorie Target & Macro Inputs */}
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-[#150e26]/80 border-white/10 shadow-md'
          }`}>
            
            {/* Calorie Target Input */}
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Daily Target Calories (Kcal)
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={800}
                max={10000}
                value={kcal}
                onChange={(e) => {
                  setKcal(Number(e.target.value));
                  handleCustomChange();
                }}
                className={`w-full border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold focus:outline-none focus:border-[#6417ff] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#0f0a1d] border-white/15 text-white'
                }`}
                required
                autoComplete="off"
              />
            </div>

            {/* 3 Macro Inputs */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="text-center">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  max={600}
                  value={protein}
                  onChange={(e) => {
                    setProtein(Number(e.target.value));
                    handleCustomChange();
                  }}
                  className={`w-full text-center border rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0f0a1d] border-white/15 text-white'
                  }`}
                  required
                  autoComplete="off"
                />
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  {protein * 4} kcal ({proteinPct}%)
                </span>
              </div>

              <div className="text-center">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  max={1000}
                  value={carbs}
                  onChange={(e) => {
                    setCarbs(Number(e.target.value));
                    handleCustomChange();
                  }}
                  className={`w-full text-center border rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-amber-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0f0a1d] border-white/15 text-white'
                  }`}
                  required
                  autoComplete="off"
                />
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  {carbs * 4} kcal ({carbsPct}%)
                </span>
              </div>

              <div className="text-center">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  max={400}
                  value={fat}
                  onChange={(e) => {
                    setFat(Number(e.target.value));
                    handleCustomChange();
                  }}
                  className={`w-full text-center border rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-rose-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0f0a1d] border-white/15 text-white'
                  }`}
                  required
                  autoComplete="off"
                />
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  {fat * 9} kcal ({fatPct}%)
                </span>
              </div>
            </div>

            {/* Symmetrical Macro Ratio Breakdown Bar */}
            <div className="pt-1">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Energy Distribution</span>
                <span>Total: {calculatedTotalKcal} kcal</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden flex ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div 
                  style={{ width: `${proteinPct}%` }} 
                  className="h-full bg-blue-500 transition-all duration-300"
                  title={`Protein: ${proteinPct}%`}
                />
                <div 
                  style={{ width: `${carbsPct}%` }} 
                  className="h-full bg-amber-500 transition-all duration-300"
                  title={`Carbs: ${carbsPct}%`}
                />
                <div 
                  style={{ width: `${fatPct}%` }} 
                  className="h-full bg-rose-500 transition-all duration-300"
                  title={`Fat: ${fatPct}%`}
                />
              </div>
              <div className="flex items-center justify-center space-x-4 text-[11px] font-semibold mt-2">
                <span className="flex items-center space-x-1 text-blue-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                  <span>Protein {proteinPct}%</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span>Carbs {carbsPct}%</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  <span>Fat {fatPct}%</span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* FIXED REVOLUT-STYLE BOTTOM ACTION BAR (Exact same position across all devices) */}
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
          onClick={onBackToPath}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 touch-manipulation select-none ${
            isLight
              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              : 'text-slate-300 bg-white/5 hover:bg-white/10'
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSubmit}
          className="px-6 py-3 rounded-2xl bg-[#6417ff] hover:bg-[#530ce8] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-[#6417ff]/20 active:scale-95 transition-all touch-manipulation cursor-pointer select-none"
        >
          <Sparkles className="w-4 h-4" />
          <span>Save & Continue</span>
        </button>
      </div>

    </div>
  );
};
