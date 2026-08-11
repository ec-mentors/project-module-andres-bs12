import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleSimulateGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Simulate Google OAuth response
      await new Promise((res) => setTimeout(res, 800));

      const mockGoogleUser: UserProfile = {
        id: 'user-google-101',
        email: 'andres.user@gmail.com',
        firstName: 'Andres',
        lastName: 'Bejarano',
        pictureUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIq9b5g=s96-c',
        role: 'USER',
      };

      onLoginSuccess(mockGoogleUser);
      onClose();
    } catch (err) {
      console.error('Google Auth Failed', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
      <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-[#e8e2f1] relative animate-in fade-in zoom-in duration-200 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Badge */}
        <div className="w-16 h-16 bg-[#eee6ff] text-[#6417ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#6417ff]/10">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-[#0f172a] mb-2">
          Welcome to NutritionTracker
        </h3>
        <p className="text-xs font-semibold text-[#5f6573] max-w-xs mx-auto mb-8">
          Sign in with Google to sync your meals, set daily macro goals, and save your historical logs safely in Spring Boot.
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={handleSimulateGoogleLogin}
          disabled={isLoggingIn}
          className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center space-x-3 shadow-xl transition-all border border-slate-700 disabled:opacity-50"
        >
          {/* Google Color G SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isLoggingIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <p className="text-[11px] font-medium text-[#94a3b8] mt-6">
          Protected by Spring Security IDOR Authorization (ADR-02)
        </p>
      </div>
    </div>
  );
};
