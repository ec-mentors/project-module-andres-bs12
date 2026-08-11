import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import type { CreateMealEntryPayload } from '../../types/nutrition';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (payload: CreateMealEntryPayload) => Promise<void>;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
}) => {
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      setErrorMsg('Please enter a meal name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onAddMeal({
        mealName: mealName.trim(),
        source: 'MANUAL',
        kcal: Number(kcal) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      // Reset form
      setMealName('');
      setKcal('');
      setProtein('');
      setCarbs('');
      setFat('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating meal entry');
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
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0f172a]">Log New Meal</h3>
            <p className="text-xs font-semibold text-[#94a3b8]">Add meal entry to Spring Boot DB</p>
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
              Meal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grilled Chicken & Quinoa"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                Calories (Kcal)
              </label>
              <input
                type="number"
                min="0"
                placeholder="450"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="40"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8e2f1] bg-[#faf8fc] text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
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
                placeholder="15"
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
              {isSubmitting ? 'Saving...' : 'Save Meal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
