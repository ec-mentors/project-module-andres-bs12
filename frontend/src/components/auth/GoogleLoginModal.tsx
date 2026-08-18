import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import type { UserProfile } from '../../types/user';
import { api } from '../../services/api';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  theme?: 'dark' | 'light';
  isGate?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  theme = 'dark',
  isGate = false,
}) => {
  const isLight = theme === 'light';
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    const scriptId = 'google-jssdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleOAuth();
      document.body.appendChild(script);
    } else if (window.google) {
      initGoogleOAuth();
    }
  }, [isOpen, googleClientId]);

  const initGoogleOAuth = () => {
    if (!window.google || !googleClientId) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
    });

    const buttonDiv = document.getElementById('google-button-container');
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: isLight ? 'outline' : 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 320,
      });
    }
  };

  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const authenticatedUser = await api.authenticateWithGoogle(response.credential);
      onLoginSuccess(authenticatedUser);
      onClose();
    } catch (err: any) {
      console.error('Google Auth Failed', err);
      setAuthError('Google sign-in verification failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overscroll-none touch-none animate-in fade-in duration-200">
      <div 
        className={`rounded-[32px] max-w-md w-full p-8 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center ${
          isLight
            ? 'bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] [color-scheme:light]'
            : 'bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.4)] [color-scheme:light]'
        }`}
      >
        {/* Close Button (Hidden when acting as mandatory login gate) */}
        {!isGate && (
          <button
            onClick={onClose}
            aria-label="Close login modal"
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Lock Icon in soft squircle */}
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-[#6417ff]" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Welcome to NutritionTracker
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 max-w-xs mx-auto mb-8 font-medium">
          Sign in with Google to sync your meals, customize daily macro goals, and track your nutrition progress.
        </p>

        {/* Official Native Google SDK Button Container */}
        <div className="flex flex-col items-center justify-center min-h-[44px] my-2">
          <div id="google-button-container" className="flex justify-center" />
          
          {isLoggingIn && (
            <p className="text-xs font-semibold text-[#6417ff] mt-3 animate-pulse">
              Verifying Google credentials...
            </p>
          )}

          {authError && (
            <p className="text-xs font-semibold text-rose-500 mt-3">
              {authError}
            </p>
          )}
        </div>

        {/* Security / Privacy Footer */}
        <p className="text-xs font-medium text-slate-400 mt-6">
          Protected by Spring Security IDOR Authorization (ADR-02)
        </p>

      </div>
    </div>
  );
};
