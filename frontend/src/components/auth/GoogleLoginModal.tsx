import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [authError, setAuthError] = useState<string | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = useCallback(async (response: { credential?: string }) => {
    if (!response.credential) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const authenticatedUser = await api.authenticateWithGoogle(response.credential);
      onLoginSuccess(authenticatedUser);
      onClose();
    } catch (err: unknown) {
      console.error('Google Auth Failed', err);
      setAuthError('Google sign-in verification failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }, [onLoginSuccess, onClose]);

  const initGoogleOAuth = useCallback(() => {
    if (!window.google || !googleClientId || !googleButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
    });

    // Clear prior GIS markup to avoid stacked white wrappers on re-init
    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      // outline avoids the white iframe chrome that filled_black gets under dark color-scheme
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: 320,
      text: 'signin_with',
      logo_alignment: 'left',
      locale: 'en',
    });
  }, [googleClientId, handleGoogleCredentialResponse]);

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
      // Wait a tick so the ref is mounted after isOpen=true render
      const t = window.setTimeout(() => initGoogleOAuth(), 0);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, googleClientId, initGoogleOAuth]);

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
        className={`border rounded-[32px] max-w-md w-full p-8 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#121214] border-white/[0.08] text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Close Button */}
        {!isGate && (
          <button
            onClick={onClose}
            aria-label="Close login modal"
            className={`absolute top-6 right-6 p-2 rounded-full transition-all ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Lock Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'
        }`}>
          <Lock className="w-7 h-7" />
        </div>

        <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Welcome to NutritionTracker
        </h3>
        <p className={`text-sm leading-relaxed max-w-xs mx-auto mb-8 font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          Sign in with Google to sync your meals, customize daily macro goals, and track your nutrition progress.
        </p>

        {/* Official Native Google SDK Button Container */}
        <div className="flex flex-col items-center justify-center min-h-[44px] my-2">
          <div
            ref={googleButtonRef}
            className="google-gsi-btn flex justify-center items-center w-full max-w-[320px] min-h-[44px] rounded-full"
          />
          
          {isLoggingIn && (
            <p className="text-xs font-semibold text-zinc-400 mt-3 animate-pulse">
              Verifying Google credentials...
            </p>
          )}

          {authError && (
            <p className="text-xs font-semibold text-rose-500 mt-3">
              {authError}
            </p>
          )}
        </div>

        {/* Demo / Developer Preview Button */}
        <div className={`mt-4 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.08]'}`}>
          <button
            onClick={() => {
              onLoginSuccess({
                id: 'demo-user-preview',
                email: 'andres@nutritiontracker.dev',
                firstName: 'Andrés',
                lastName: 'Bejarano',
                pictureUrl: '',
              });
              onClose();
            }}
            className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs active:scale-95 ${
              isLight
                ? 'text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                : 'text-zinc-200 bg-[#18181b] hover:bg-[#202024] hover:text-white border border-white/[0.08]'
            }`}
          >
            <span>⚡ Explore UI in Demo Mode</span>
          </button>
        </div>

        {/* Security / Privacy Footer */}
        <p className={`text-xs font-medium mt-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          Protected by Spring Security IDOR Authorization (ADR-02)
          {' · '}
          <a href="/privacy.html" className="underline hover:opacity-80">Privacy Policy</a>
        </p>

      </div>
    </div>
  );
};
