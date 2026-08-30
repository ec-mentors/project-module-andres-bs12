import React, { useState } from 'react';
import { X, Sun, Moon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NutritionGoal } from '../../types/nutrition';
import type { 
  OnboardingStep, 
  OnboardingPath, 
  AiOnboardingState, 
  OnboardingCompletionResult 
} from './types';
import { ChoosePathStep } from './ChoosePathStep';
import { AiGoalWizardStep } from './AiGoalWizardStep';
import { GoalReviewStep } from './GoalReviewStep';
import { ManualGoalStep } from './ManualGoalStep';
import { ProcessingStep } from './ProcessingStep';
import { calculateAiNutritionGoal } from './utils';
import { calculateAiGoalRoadmap } from '../../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCompleteOnboarding: (result: OnboardingCompletionResult) => void;
  initialGoal?: NutritionGoal;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

const DEFAULT_AI_STATE: AiOnboardingState = {
  objective: null,
  gender: null,
  age: '',
  currentWeightKg: '',
  targetWeightKg: '',
  heightCm: '',
  activityLevel: null,
  dietPreference: null,
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userId,
  onCompleteOnboarding,
  initialGoal,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('choose-path');
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>('ai');
  const [aiWizardSubStep, setAiWizardSubStep] = useState<number>(1);
  const [aiState, setAiState] = useState<AiOnboardingState>(DEFAULT_AI_STATE);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [isAiCalculationReady, setIsAiCalculationReady] = useState<boolean>(true);
  const [pendingGoal, setPendingGoal] = useState<NutritionGoal>(
    initialGoal || {
      kcal: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    }
  );

  React.useEffect(() => {
    const bgColor = isLight ? '#f8fafc' : '#080808';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('dark', !isLight);
    
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', bgColor);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, isLight]);

  if (!isOpen) return null;

  const getOverallProgress = () => {
    switch (currentStep) {
      case 'choose-path':
        return 20;
      case 'ai-wizard':
        if (aiWizardSubStep === 1) return 40;
        if (aiWizardSubStep === 2) return 60;
        if (aiWizardSubStep === 3) return 80;
        return 90;
      case 'processing':
        return 95;
      case 'goal-review':
        return 100;
      case 'manual-setup':
        return 100;
      default:
        return 20;
    }
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 'choose-path':
        return 'Step 1 of 5: Setup Mode';
      case 'ai-wizard':
        return `Step ${aiWizardSubStep + 1} of 5: Profile & Metrics`;
      case 'processing':
        return 'Step 4 of 5: Calculating Targets';
      case 'goal-review':
        return 'Step 5 of 5: Review & Confirm';
      case 'manual-setup':
        return 'Step 2 of 2: Configure Goals';
      default:
        return 'Step 1 of 5';
    }
  };

  const handleSelectPath = (path: OnboardingPath) => {
    setSelectedPath(path);
    if (path === 'ai') {
      setCurrentStep('ai-wizard');
    } else {
      setCurrentStep('manual-setup');
    }
  };

  const handleAiWizardComplete = async (completedState: AiOnboardingState) => {
    setAiState(completedState);
    setCurrentStep('processing');
    setIsAiCalculationReady(false);

    try {
      const apiRoadmap = await calculateAiGoalRoadmap(userId, completedState);

      if (apiRoadmap && apiRoadmap.kcal) {
        setPendingGoal({
          kcal: apiRoadmap.kcal,
          protein: apiRoadmap.protein,
          carbs: apiRoadmap.carbs,
          fat: apiRoadmap.fat,
          rationale: apiRoadmap.rationale,
        });
      } else {
        const fallbackGoal = calculateAiNutritionGoal(completedState);
        setPendingGoal(fallbackGoal);
      }
    } catch {
      const fallbackGoal = calculateAiNutritionGoal(completedState);
      setPendingGoal(fallbackGoal);
    } finally {
      setIsAiCalculationReady(true);
    }
  };

  const handleProcessingFinished = () => {
    setCurrentStep('goal-review');
  };

  const handleFinalGoalConfirm = (finalGoal: NutritionGoal) => {
    onCompleteOnboarding({
      goal: finalGoal,
      path: selectedPath,
    });
    onClose();
  };

  const handleDesktopCloseRequest = () => {
    if (currentStep === 'choose-path') {
      onClose();
    } else {
      setShowDiscardModal(true);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden transition-colors duration-300 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
      isLight 
        ? 'bg-[#f8fafc] text-slate-900' 
        : 'bg-[#080808] text-white'
    }`}>
      
      {/* FIXED TOP HEADER BAR */}
      <header className={`shrink-0 w-full max-w-xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-3.5 sm:pb-4.5 z-20 border-b ${
        isLight ? 'border-slate-200/80 bg-white/50 backdrop-blur-md' : 'border-white/[0.06] bg-[#080808]/80 backdrop-blur-md'
      }`}>
        
        <div className="flex items-center justify-between mb-3">
          {/* Step Indicator Text */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-zinc-300'}`}>
              {getStepLabel()}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2 rounded-xl transition-all active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                    : 'bg-[#18181b] hover:bg-[#202024] text-zinc-300 border-white/[0.08]'
                }`}
                title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              >
                {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {currentStep !== 'processing' && (
              <button
                type="button"
                onClick={handleDesktopCloseRequest}
                aria-label="Close setup"
                className={`flex p-2 rounded-xl transition-all active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200 shadow-xs'
                    : 'bg-[#18181b] hover:bg-[#202024] text-zinc-400 hover:text-white border-white/[0.08]'
                }`}
                title="Close and discard setup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Progress Bar Line */}
        <div className={`w-full h-1.5 sm:h-2 rounded-full overflow-hidden ${
          isLight ? 'bg-slate-200' : 'bg-[#18181b]'
        }`}>
          <div 
            className={`h-full transition-all duration-300 ease-out ${
              isLight
                ? 'bg-black'
                : 'bg-white'
            }`}
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>

      </header>

      {/* MIDDLE VIEWPORT CONTAINER */}
      <main className="flex-1 w-full max-w-xl mx-auto overflow-hidden flex flex-col z-10 px-3 sm:px-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CHOOSE ONBOARDING PATH */}
          {currentStep === 'choose-path' && (
            <motion.div
              key="choose-path"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <ChoosePathStep
                onSelectPath={handleSelectPath}
                theme={theme}
              />
            </motion.div>
          )}

          {/* STEP 2A: AI WIZARD */}
          {currentStep === 'ai-wizard' && (
            <motion.div
              key="ai-wizard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              <AiGoalWizardStep
                initialData={aiState}
                initialStep={aiWizardSubStep}
                onStepChange={(step) => setAiWizardSubStep(step)}
                onBackToPath={() => setCurrentStep('choose-path')}
                onComplete={handleAiWizardComplete}
                theme={theme}
              />
            </motion.div>
          )}

          {/* STEP 3A: AI PROCESSING STEP */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <ProcessingStep
                path={selectedPath}
                isReady={isAiCalculationReady}
                onFinished={handleProcessingFinished}
                theme={theme}
              />
            </motion.div>
          )}

          {/* STEP 4A: AI GOAL REVIEW & ADJUST */}
          {currentStep === 'goal-review' && (
            <motion.div
              key="goal-review"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              <GoalReviewStep
                calculatedGoal={pendingGoal}
                onBack={() => {
                  setAiWizardSubStep(4);
                  setCurrentStep('ai-wizard');
                }}
                onConfirm={handleFinalGoalConfirm}
                theme={theme}
              />
            </motion.div>
          )}

          {/* STEP 2B: MANUAL GOAL STEP */}
          {currentStep === 'manual-setup' && (
            <motion.div
              key="manual-setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              <ManualGoalStep
                initialGoal={pendingGoal}
                onBackToPath={() => setCurrentStep('choose-path')}
                onComplete={(goal) => {
                  handleFinalGoalConfirm(goal);
                }}
                theme={theme}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* DESKTOP DISCARD CONFIRMATION POP-UP MODAL */}
      <AnimatePresence>
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className={`w-full max-w-sm rounded-[28px] p-6 sm:p-7 border text-center shadow-2xl ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
                  : 'bg-[#121214] border-white/[0.08] text-white shadow-2xl'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Discard Goal Setup?
              </h3>
              <p className={`text-xs sm:text-sm font-medium mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Your personalized nutrition goals will not be saved. You can always configure your goals later in your profile.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-black hover:bg-zinc-800 text-white shadow-md'
                      : 'bg-white hover:bg-zinc-200 text-black font-black'
                  }`}
                >
                  Continue Setup
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-200'
                      : 'bg-white/5 hover:bg-rose-500/15 text-rose-400 border-white/[0.08] hover:border-rose-500/30'
                  }`}
                >
                  Discard & Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
