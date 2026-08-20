import React, { useState } from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

interface GoalReviewStepProps {
  calculatedGoal: NutritionGoal;
  onBack: () => void;
  onConfirm: (finalGoal: NutritionGoal) => void;
  theme?: 'dark' | 'light';
}

export const GoalReviewStep: React.FC<GoalReviewStepProps> = ({
  calculatedGoal,
  onBack,
  onConfirm,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const [kcal, setKcal] = useState(calculatedGoal.kcal);
  const [protein, setProtein] = useState(calculatedGoal.protein);
  const [carbs, setCarbs] = useState(calculatedGoal.carbs);
  const [fat, setFat] = useState(calculatedGoal.fat);

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
    onConfirm({
      kcal: Number(kcal) || 2000,
      protein: Number(protein) || 150,
      carbs: Number(carbs) || 200,
      fat: Number(fat) || 65,
      rationale: calculatedGoal.rationale,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto h-full flex flex-col justify-between text-left animate-in fade-in duration-300">
      
      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-2 pb-6 custom-scrollbar">
        
        {/* Header - Clear Visual Hierarchy */}
        <div className="pt-3 sm:pt-6 pb-4 sm:pb-6 text-center space-y-1.5">
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Review Your Generated Goals
          </h2>

          <p className={`text-xs sm:text-sm font-medium max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Here are your calculated daily targets. Fine-tune any metric or launch directly into your dashboard.
          </p>
        </div>

        {/* AI Strategy Insight Card */}
        {calculatedGoal.rationale && (
          <div className={`mb-3.5 sm:mb-4 p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-xs'
              : 'bg-[#18181b] border-white/[0.08] text-zinc-200 shadow-md'
          }`}>
            <div className="flex items-center space-x-2 mb-1.5">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                isLight ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white/10 text-white border-white/20'
              }`}>
                <Sparkles className="w-3 h-3" />
              </div>
              <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                NutriAI Strategy
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-normal leading-relaxed ${
              isLight ? 'text-slate-700' : 'text-zinc-300'
            }`}>
              {calculatedGoal.rationale}
            </p>
          </div>
        )}

        {/* Target & Macros Container */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-xs'
            : 'bg-[#121214] border-white/[0.08] shadow-md'
        }`}>
          
          {/* Calorie Target Section */}
          <div className={`mb-4 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Daily Target Calories (Kcal)
              </label>
              <span className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900 font-extrabold' : 'text-zinc-400'}`}>
                Recommended
              </span>
            </div>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={800}
              max={10000}
              value={kcal}
              onChange={(e) => setKcal(Number(e.target.value))}
              className={`w-full border rounded-xl px-3.5 py-3 text-base font-extrabold focus:outline-none min-h-[46px] ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500'
                  : 'bg-[#18181b] border-white/[0.12] text-white focus:border-orange-400'
              }`}
              required
              autoComplete="off"
            />
          </div>

          {/* 3 Symmetrical Macronutrient Inputs */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4">
            {/* Protein */}
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
                onChange={(e) => setProtein(Number(e.target.value))}
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

            {/* Carbs */}
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
                onChange={(e) => setCarbs(Number(e.target.value))}
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

            {/* Fat */}
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
                onChange={(e) => setFat(Number(e.target.value))}
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

          {/* Symmetrical Macro Ratio Breakdown Bar */}
          <div className="pt-1">
            <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
              <span>Energy Distribution</span>
              <span className="font-extrabold">{formatCompactNumber(calculatedTotalKcal)} kcal</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden flex ${isLight ? 'bg-slate-100' : 'bg-[#18181b]'}`}>
              <div 
                style={{ width: `${proteinPct}%` }} 
                className={`h-full ${MACRO_COLORS.protein.bg} transition-all duration-300`}
                title={`Protein: ${proteinPct}%`}
              />
              <div 
                style={{ width: `${carbsPct}%` }} 
                className={`h-full ${MACRO_COLORS.carbs.bg} transition-all duration-300`}
                title={`Carbs: ${carbsPct}%`}
              />
              <div 
                style={{ width: `${fatPct}%` }} 
                className={`h-full ${MACRO_COLORS.fat.bg} transition-all duration-300`}
                title={`Fat: ${fatPct}%`}
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

      {/* Bottom Action Bar */}
      <div className={`shrink-0 pt-4 pb-4 sm:pb-6 px-2 sm:px-3 flex items-center justify-between relative z-30 touch-manipulation border-t ${
        isLight ? 'bg-[#f8fafc] border-slate-200' : 'bg-[#080808] border-white/[0.08]'
      }`}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBack}
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
          <Rocket className="w-4 h-4" />
          <span>Launch Dashboard</span>
        </button>
      </div>

    </div>
  );
};
