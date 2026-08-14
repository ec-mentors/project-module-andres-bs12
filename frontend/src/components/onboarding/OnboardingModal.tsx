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

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [pendingGoal, setPendingGoal] = useState<NutritionGoal>(
    initialGoal || {
      kcal: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    }
  );

  React.useEffect(() => {
    const bgColor = isLight ? '#f8fafc' : '#090516';
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

  // Calculate live progress percentage that accurately reflects exact step position forward and backward
  // Calculate live progress percentage that accurately reflects exact step position forward and backward in 5-step flow
  const getOverallProgress = () => {
    switch (currentStep) {
      case 'choose-path':
        return 20;
      case 'ai-wizard':
        if (aiWizardSubStep === 1) return 40;
        if (aiWizardSubStep === 2) return 60;
        if (aiWizardSubStep === 3) return 80;
        return 92;
      case 'manual-setup':
        return 75;
      case 'processing':
        return 96;
      case 'goal-review':
        return 100;
      default:
        return 20;
    }
  };

  // Step Text Indicator for top bar (5 Steps)
  const getStepLabel = () => {
    switch (currentStep) {
      case 'choose-path':
        return 'Step 1 of 5 • Choose Setup Method';
      case 'ai-wizard':
        if (aiWizardSubStep === 1) return 'Step 2 of 5 • Primary Objective';
        if (aiWizardSubStep === 2) return 'Step 3 of 5 • Body & Metrics';
        if (aiWizardSubStep === 3) return 'Step 4 of 5 • Activity Level';
        return 'Step 5 of 5 • Dietary Preference';
      case 'manual-setup':
        return 'Step 2 of 5 • Custom Targets';
      case 'processing':
        return 'Step 5 of 5 • Formulating AI Roadmap';
      case 'goal-review':
        return 'Step 5 of 5 • Review & Finalize';
      default:
        return 'Step 1 of 5';
    }
  };

  // Step 1: Choose Path
  const handleSelectPath = (path: OnboardingPath) => {
    setSelectedPath(path);
    if (path === 'ai') {
      setAiWizardSubStep(1);
      setCurrentStep('ai-wizard');
    } else {
      setCurrentStep('manual-setup');
    }
  };

  // Step 2A: AI Wizard Complete -> Trigger Processing Screen
  const handleAiWizardComplete = (data: AiOnboardingState) => {
    setAiState(data);
    const calculated = calculateAiNutritionGoal(data);
    setPendingGoal(calculated);
    setCurrentStep('processing');
  };

  // Step 2B: Manual Setup Complete -> Trigger Processing Screen
  const handleManualGoalComplete = (goal: NutritionGoal) => {
    setPendingGoal(goal);
    setCurrentStep('processing');
  };

  // Processing Finished -> Route to Review (AI) or Dashboard (Manual)
  const handleProcessingFinish = () => {
    if (selectedPath === 'ai') {
      setCurrentStep('goal-review');
    } else {
      onCompleteOnboarding({
        path: selectedPath,
        goal: pendingGoal,
      });
    }
  };

  // When user clicks "Back" in Goal Review -> Return to AI Wizard Step 4!
  const handleBackFromReview = () => {
    setAiWizardSubStep(4);
    setCurrentStep('ai-wizard');
  };

  // Final confirmation from GoalReviewStep -> Save and Go to Dashboard
  const handleGoalReviewConfirm = (finalGoal: NutritionGoal) => {
    setPendingGoal(finalGoal);
    onCompleteOnboarding({
      path: 'ai',
      goal: finalGoal,
    });
  };

  // Desktop Close Request Handler -> Shows Confirmation Pop-up
  const handleDesktopCloseRequest = () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden transition-colors duration-300 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
      isLight 
        ? 'bg-[#f8fafc] text-slate-900' 
        : 'bg-[#090516] text-white'
    }`}>
      
      {/* Background Ambient Glow Accents (Full Page Takeover) */}
      <div className={`fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isLight ? 'bg-[#6417ff]/5' : 'bg-[#6417ff]/18'
      }`} />
      <div className={`fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isLight ? 'bg-purple-200/20' : 'bg-purple-600/12'
      }`} />

      {/* FIXED TOP HEADER BAR (STEP INDICATOR TEXT + PROGRESS LINE + CONTROLS) */}
      <header className="shrink-0 w-full max-w-xl mx-auto px-4 pt-3 sm:pt-5 pb-3 sm:pb-4 z-20">
        
        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          {/* Step Indicator Text */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#6417ff]">
              {getStepLabel()}
            </span>
          </div>

          {/* Right Controls: Theme Toggle + Desktop-only Close Button */}
          <div className="flex items-center space-x-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 text-purple-200 border-white/10'
                }`}
                title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              >
                {isLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}

            {currentStep !== 'processing' && (
              <button
                type="button"
                onClick={handleDesktopCloseRequest}
                aria-label="Close setup"
                className={`hidden sm:flex p-2 rounded-xl transition-all active:scale-95 border ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200 shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white border-white/10'
                }`}
                title="Close and discard setup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Progress Bar Line */}
        <div className={`w-full h-1.5 sm:h-2 rounded-full overflow-hidden ${
          isLight ? 'bg-slate-200' : 'bg-white/10'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-[#6417ff] via-[#8b46ff] to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>

      </header>

      {/* MIDDLE VIEWPORT CONTAINER (FIXED HEIGHT, INTERNALLY MANAGED, NO WINDOW SCROLL) */}
      <main className="flex-1 w-full max-w-xl mx-auto overflow-hidden flex flex-col z-10 px-2 sm:px-4">
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
              className="w-full h-full"
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

          {/* PROCESSING ANIMATION (DEAD CENTERED) */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center my-auto"
            >
              <ProcessingStep
                path={selectedPath}
                onFinished={handleProcessingFinish}
                theme={theme}
              />
            </motion.div>
          )}

          {/* GOAL REVIEW & CONFIRMATION */}
          {currentStep === 'goal-review' && (
            <motion.div
              key="goal-review"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <GoalReviewStep
                calculatedGoal={pendingGoal}
                onBack={handleBackFromReview}
                onConfirm={handleGoalReviewConfirm}
                theme={theme}
              />
            </motion.div>
          )}

          {/* MANUAL GOAL SETUP */}
          {currentStep === 'manual-setup' && (
            <motion.div
              key="manual-setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <ManualGoalStep
                initialGoal={pendingGoal}
                onBackToPath={() => setCurrentStep('choose-path')}
                onComplete={handleManualGoalComplete}
                theme={theme}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* DESKTOP DISCARD CONFIRMATION POP-UP MODAL */}
      <AnimatePresence>
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 border-2 text-center shadow-2xl ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
                  : 'bg-[#150e26] border-white/15 text-white shadow-2xl'
              }`}
            >
              {/* Warning Emblem */}
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <AlertTriangle className="w-7 h-7" />
              </div>

              {/* Title & Description */}
              <h3 className={`text-lg sm:text-xl font-bold tracking-tight mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Discard Goal Setup?
              </h3>
              <p className={`text-xs sm:text-sm font-medium mb-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Your personalized nutrition goals will not be saved. You can always configure your goals later in your profile.
              </p>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className="w-full py-3 rounded-xl bg-[#6417ff] hover:bg-[#530ce8] text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all"
                >
                  Continue Setup
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-red-50 text-red-600 border-slate-200 hover:border-red-200'
                      : 'bg-white/5 hover:bg-red-500/15 text-red-400 border-white/10 hover:border-red-500/30'
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
