import React, { useState } from 'react';
import { Check, Scale, Flame, Dumbbell, Zap } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

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
    iconColorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
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
    iconColorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'keto',
    name: 'Ketogenic / Low-Carb',
    kcal: 1900,
    protein: 130,
    carbs: 30,
    fat: 140,
    icon: Zap,
    iconColorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
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
      
      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-2 pb-6 custom-scrollbar">
        
        {/* Header - Clear Visual Hierarchy */}
        <div className="pt-3 sm:pt-6 pb-4 sm:pb-6 text-center space-y-1.5">
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Custom Goal Parameters
          </h2>
          <p className={`text-xs sm:text-sm font-medium max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Select a verified preset or directly configure your daily calorie and macronutrient targets.
          </p>
        </div>

        <div className="space-y-4">
          {/* Presets Grid */}
          <div>
            <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Quick Goal Presets
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none min-h-[52px] active:scale-[0.98] ${
                      isSelected
                        ? isLight
                          ? 'border-black bg-slate-100/90 ring-1 ring-black/20 shadow-xs'
                          : 'border-white bg-white/10 shadow-xs'
                        : isLight
                        ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        : 'border-white/[0.08] bg-[#121214] hover:bg-[#18181b] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${p.iconColorClass}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {p.name}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
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
            </div>
          </div>

          {/* Unified Container */}
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-xs'
              : 'bg-[#121214] border-white/[0.08] shadow-md'
          }`}>
            
            {/* Calorie Target Input */}
            <div className={`mb-4 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
              <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
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
                className={`w-full border rounded-xl px-3.5 py-3 text-base font-extrabold focus:outline-none min-h-[46px] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500'
                    : 'bg-[#18181b] border-white/[0.12] text-white focus:border-orange-400'
                }`}
                required
                autoComplete="off"
              />
            </div>

            {/* 3 Macro Inputs */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4">
              <div className="text-center">
                <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 truncate ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
                  {MACRO_COLORS.protein.label} (g)
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
                  className={`w-full text-center border rounded-xl px-2 py-2.5 text-base font-extrabold focus:outline-none min-h-[46px] ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-violet-500'
                      : 'bg-[#18181b] border-white/[0.12] text-white focus:border-violet-400'
                  }`}
                  required
                  autoComplete="off"
                />
                <span className="text-xs font-bold text-zinc-400 mt-1.5 block">
                  {proteinPct}% • {formatCompactNumber(protein * 4)}kcal
                </span>
              </div>

              <div className="text-center">
                <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 truncate ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
                  {MACRO_COLORS.carbs.label} (g)
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
                  className={`w-full text-center border rounded-xl px-2 py-2.5 text-base font-extrabold focus:outline-none min-h-[46px] ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-[#18181b] border-white/[0.12] text-white focus:border-amber-400'
                  }`}
                  required
                  autoComplete="off"
                />
                <span className="text-xs font-bold text-zinc-400 mt-1.5 block">
                  {carbsPct}% • {formatCompactNumber(carbs * 4)}kcal
                </span>
              </div>

              <div className="text-center">
                <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 truncate ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
                  {MACRO_COLORS.fat.label} (g)
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
                  className={`w-full text-center border rounded-xl px-2 py-2.5 text-base font-extrabold focus:outline-none min-h-[46px] ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                      : 'bg-[#18181b] border-white/[0.12] text-white focus:border-cyan-400'
                  }`}
                  required
                  autoComplete="off"
                />
                <span className="text-xs font-bold text-zinc-400 mt-1.5 block">
                  {fatPct}% • {formatCompactNumber(fat * 9)}kcal
                </span>
              </div>
            </div>

            {/* Ratio Breakdown Bar */}
            <div className="pt-1">
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
                <span>Energy Distribution</span>
                <span className="font-extrabold">{formatCompactNumber(calculatedTotalKcal)} kcal</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden flex ${isLight ? 'bg-slate-100' : 'bg-[#18181b]'}`}>
                <div 
                  style={{ width: `${proteinPct}%` }} 
                  className={`h-full ${MACRO_COLORS.protein.bg} transition-all duration-300`}
                />
                <div 
                  style={{ width: `${carbsPct}%` }} 
                  className={`h-full ${MACRO_COLORS.carbs.bg} transition-all duration-300`}
                />
                <div 
                  style={{ width: `${fatPct}%` }} 
                  className={`h-full ${MACRO_COLORS.fat.bg} transition-all duration-300`}
                />
              </div>
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs font-bold mt-2.5">
                <span className={`flex items-center space-x-1.5 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
                  <span className={`w-2 h-2 rounded-full ${MACRO_COLORS.protein.bg} inline-block`} />
                  <span>Protein {proteinPct}%</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
                  <span className={`w-2 h-2 rounded-full ${MACRO_COLORS.carbs.bg} inline-block`} />
                  <span>Carbs {carbsPct}%</span>
                </span>
                <span className={`flex items-center space-x-1.5 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
                  <span className={`w-2 h-2 rounded-full ${MACRO_COLORS.fat.bg} inline-block`} />
                  <span>Fat {fatPct}%</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={`shrink-0 pt-4 pb-4 sm:pb-6 px-2 sm:px-3 flex items-center justify-between relative z-30 touch-manipulation border-t ${
        isLight ? 'bg-[#f8fafc] border-slate-200' : 'bg-[#080808] border-white/[0.08]'
      }`}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBackToPath}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 touch-manipulation select-none min-h-[46px] ${
            isLight
              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              : 'text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white'
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer select-none min-h-[46px] ${
            isLight
              ? 'bg-black hover:bg-zinc-800 text-white shadow-md'
              : 'bg-white hover:bg-zinc-200 text-black font-black'
          }`}
        >
          <span>Save & Apply</span>
        </button>
      </div>

    </div>
  );
};
