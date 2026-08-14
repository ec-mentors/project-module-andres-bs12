import React, { useState } from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';

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
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto h-full flex flex-col justify-between text-left animate-in fade-in duration-300">
      
      {/* Scrollable Middle Content with Breathable Bottom Padding */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-1 pb-8 sm:pb-10 custom-scrollbar">
        {/* Header with Restored Tag, Strong Hierarchy & Breathable Spacing */}
        <div className="pt-3 sm:pt-5 mb-5 sm:mb-7 text-center">
          {/* Restored Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#6417ff]/15 text-[#6417ff] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3 border border-[#6417ff]/25 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Target Formulation</span>
          </div>

          {/* Section Title */}
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 sm:mb-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Review Your Generated Goals
          </h2>

          {/* Subtitle */}
          <p className={`text-xs sm:text-sm font-normal max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Here are your calculated daily targets. Fine-tune any metric or launch directly into your dashboard.
          </p>
        </div>

        {/* Unified Single Container for Energy Target & Macros */}
        <div className={`p-4 sm:p-6 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#150e26]/80 border-white/10 shadow-md'
        }`}>
          
          {/* Calorie Target Section */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Daily Target Calories (Kcal)
              </label>
              <span className="text-xs font-bold text-[#6417ff]">
                Recommended
              </span>
            </div>
            <input
              type="number"
              min={800}
              max={10000}
              value={kcal}
              onChange={(e) => setKcal(Number(e.target.value))}
              className={`w-full border rounded-xl px-3.5 py-2 text-sm sm:text-base font-bold focus:outline-none focus:border-[#6417ff] ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-[#0f0a1d] border-white/15 text-white'
              }`}
              required
            />
          </div>

          {/* 3 Symmetrical Macronutrient Inputs */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {/* Protein */}
            <div className="text-center">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min={0}
                max={600}
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className={`w-full text-center border rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#0f0a1d] border-white/15 text-white'
                }`}
                required
              />
              <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                {protein * 4} kcal ({proteinPct}%)
              </span>
            </div>

            {/* Carbs */}
            <div className="text-center">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className={`w-full text-center border rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#0f0a1d] border-white/15 text-white'
                }`}
                required
              />
              <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                {carbs * 4} kcal ({carbsPct}%)
              </span>
            </div>

            {/* Fat */}
            <div className="text-center">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                min={0}
                max={400}
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className={`w-full text-center border rounded-xl px-2 py-2 text-base font-bold focus:outline-none focus:border-rose-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#0f0a1d] border-white/15 text-white'
                }`}
                required
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
          onClick={onBack}
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
          <Rocket className="w-4 h-4" />
          <span>Launch Dashboard</span>
        </button>
      </div>

    </div>
  );
};
