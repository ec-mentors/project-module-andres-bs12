import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import type { NutritionGoal, SetGoalPayload } from '../../types/nutrition';

interface SetGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: NutritionGoal;
  onSaveGoal: (payload: SetGoalPayload) => Promise<void>;
}

export const SetGoalsModal: React.FC<SetGoalsModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal,
}) => {
  const [kcal, setKcal] = useState(String(currentGoal.kcal || 2000));
  const [protein, setProtein] = useState(String(currentGoal.protein || 150));
  const [carbs, setCarbs] = useState(String(currentGoal.carbs || 200));
  const [fat, setFat] = useState(String(currentGoal.fat || 65));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSaveGoal({
        kcal: Number(kcal) || 2000,
        protein: Number(protein) || 150,
        carbs: Number(carbs) || 200,
        fat: Number(fat) || 65,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating target goals');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-[#e8e2f1] relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-[#eee6ff] text-[#6417ff] rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0f172a]">Set Daily Goals</h3>
            <p className="text-xs font-semibold text-[#94a3b8]">Configure target macros in Spring Boot</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
              Target Daily Calories (Kcal)
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              required
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                required
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                required
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                min="0"
                required
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-[#e8e2f1] text-xs font-bold text-[#5f6573] hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#6417ff] hover:bg-[#5400e9] text-white text-xs font-bold shadow-lg shadow-[#6417ff]/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Update Goals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
