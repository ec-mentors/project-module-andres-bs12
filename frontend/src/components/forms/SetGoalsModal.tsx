import React, { useState } from 'react';
import { X, Target, Check, Scale, Flame, Dumbbell, Zap } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

interface SetGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: NutritionGoal;
  onSaveGoal: (goal: NutritionGoal) => void;
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
    name: 'High Protein Cut',
    kcal: 1800,
    protein: 180,
    carbs: 140,
    fat: 55,
    icon: Flame,
    iconColorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'lean_bulk',
    name: 'Hypertrophy Bulk',
    kcal: 2600,
    protein: 190,
    carbs: 320,
    fat: 60,
    icon: Dumbbell,
    iconColorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'keto',
    name: 'Ketogenic Low-Carb',
    kcal: 1900,
    protein: 130,
    carbs: 30,
    fat: 140,
    icon: Zap,
    iconColorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
];

export const SetGoalsModal: React.FC<SetGoalsModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [kcal, setKcal] = useState(currentGoal.kcal);
  const [protein, setProtein] = useState(currentGoal.protein);
  const [carbs, setCarbs] = useState(currentGoal.carbs);
  const [fat, setFat] = useState(currentGoal.fat);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [prevGoal, setPrevGoal] = useState(currentGoal);
  if (prevGoal !== currentGoal) {
    setPrevGoal(currentGoal);
    setKcal(currentGoal.kcal);
    setProtein(currentGoal.protein);
    setCarbs(currentGoal.carbs);
    setFat(currentGoal.fat);
    setSelectedPreset(null);
  }

  if (!isOpen) return null;

  const handleSelectPreset = (preset: Preset) => {
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
    onSaveGoal({
      kcal: Number(kcal) || 2000,
      protein: Number(protein) || 150,
      carbs: Number(carbs) || 200,
      fat: Number(fat) || 65,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border rounded-[32px] p-5 sm:p-7 w-full max-w-lg max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 transition-all custom-scrollbar ${
          isLight
            ? 'bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] [color-scheme:light]'
            : 'bg-[#121214] border-white/[0.08] text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] [color-scheme:dark]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors ${
            isLight
              ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              : 'hover:bg-white/10 text-zinc-400 hover:text-white'
          }`}
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className={`flex items-center space-x-3 mb-4 sm:mb-5 border-b pb-3.5 ${
          isLight ? 'border-slate-200' : 'border-white/[0.08]'
        }`}>
          <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Set Daily Goals
            </h3>
            <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Customize your target calories and macronutrients
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Quick Goal Presets
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full touch-manipulation select-none min-h-[50px] active:scale-[0.98] ${
                      isSelected
                        ? isLight
                          ? 'border-black bg-slate-100/90 ring-1 ring-black/20 shadow-xs'
                          : 'border-white bg-white/10 shadow-xs'
                        : isLight
                        ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100'
                        : 'border-white/[0.08] bg-[#18181b] hover:bg-[#202024] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${p.iconColorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {p.name}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-1.5 transition-all ${
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

          {/* Calorie & Macro Box */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#18181b] border-white/[0.08]'
          }`}>
            {/* KCAL */}
            <div className={`mb-3.5 pb-3.5 border-b ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
              <label className={`block text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-zinc-300'
              }`}>
                Daily Target Calories (Kcal)
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={kcal}
                onChange={(e) => {
                  setKcal(Number(e.target.value));
                  handleCustomChange();
                }}
                className={`w-full border rounded-xl px-3.5 py-3 text-base font-extrabold focus:outline-none min-h-[46px] ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'
                    : 'bg-[#121214] border-white/[0.12] text-white focus:border-orange-400'
                }`}
                required
                min={500}
                max={10000}
                autoComplete="off"
              />
            </div>

            {/* 3 Macro Columns */}
            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
              {/* Protein */}
              <div className="text-center">
                <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 truncate ${
                  isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text
                }`}>
                  {MACRO_COLORS.protein.label} (g)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={protein}
                  onChange={(e) => {
                    setProtein(Number(e.target.value));
                    handleCustomChange();
                  }}
                  className={`w-full text-center border rounded-xl px-2 py-2.5 text-base font-extrabold focus:outline-none min-h-[46px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-violet-500'
                      : 'bg-[#121214] border-white/[0.12] text-white focus:border-violet-400'
                  }`}
                  required
                  min={0}
                  max={1000}
                  autoComplete="off"
                />
                <span className="text-xs font-bold text-zinc-400 mt-1.5 block">
                  {proteinPct}% • {formatCompactNumber(protein * 4)}kcal
                </span>
              </div>

              {/* Carbs */}
              <div className="text-center">
                <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 truncate ${
                  isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text
                }`}>
                  {MACRO_COLORS.carbs.label} (g)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={carbs}
                  onChange={(e) => {
                    setCarbs(Number(e.target.value));
                    handleCustomChange();
                  }}
                  className={`w-full text-center border rounded-xl px-2 py-2.5 text-base font-extrabold focus:outline-none min-h-[46px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-[#121214] border-white/[0.12] text-white focus:border-amber-400'
                  }`}
                  required
                  min={0}
                  max={1000}
                  autoComplete="off"
                />
                <span className="text-xs font-bold text-zinc-400 mt-1.5 block">
                  {carbsPct}% • {formatCompactNumber(carbs * 4)}kcal
                </span>
              </div>

              {/* Fat */}
              <div className="text-center">
                <label className={`block text-xs font-black uppercase tracking-wider mb-1.5 truncate ${
                  isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text
                }`}>
                  {MACRO_COLORS.fat.label} (g)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={fat}
                  onChange={(e) => {
                    setFat(Number(e.target.value));
                    handleCustomChange();
                  }}
                  className={`w-full text-center border rounded-xl px-2 py-2.5 text-base font-extrabold focus:outline-none min-h-[46px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                      : 'bg-[#121214] border-white/[0.12] text-white focus:border-cyan-400'
                  }`}
                  required
                  min={0}
                  max={1000}
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
                <span>Energy Ratio</span>
                <span className="font-extrabold">{formatCompactNumber(calculatedTotalKcal)} kcal</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-[#121214]'}`}>
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
              <div className="flex items-center justify-center space-x-3.5 text-xs font-bold mt-2">
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold active:scale-95 transition-all min-h-[46px] ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-300'
                  : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold active:scale-95 shadow-xs transition-all min-h-[46px] ${
                isLight
                  ? 'text-white bg-black hover:bg-zinc-800 shadow-md'
                  : 'text-black bg-white hover:bg-zinc-200 font-black'
              }`}
            >
              Save Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
