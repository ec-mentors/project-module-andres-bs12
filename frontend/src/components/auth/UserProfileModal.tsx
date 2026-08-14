import React from 'react';
import { X, LogOut, Mail } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  theme?: 'dark' | 'light';
}

export const UserProfileModal: React.FC<React.PropsWithChildren<UserProfileModalProps>> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  React.useEffect(() => {
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
    /* Backdrop Overlay */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overscroll-none touch-none flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Inner Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border-2 rounded-[32px] p-6 sm:p-8 w-full max-w-sm relative animate-in zoom-in-95 duration-200 transition-all text-center ${
          isLight
            ? 'bg-white/95 border-purple-100 text-slate-900 shadow-[0_20px_60px_rgba(100,23,255,0.12)] [color-scheme:light]'
            : 'bg-[#161024] border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] [color-scheme:dark]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isLight
              ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Avatar (Without verified badge icon) */}
        <div className="relative mx-auto w-20 h-20 mb-4 mt-2">
          {user.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={user.firstName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#6417ff] shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#6417ff] flex items-center justify-center font-bold text-3xl text-white shadow-lg">
              {user.firstName.charAt(0)}
            </div>
          )}
        </div>

        {/* User Info */}
        <h3 className={`text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {user.firstName} {user.lastName}
        </h3>
        
        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
          isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-purple-200'
        }`}>
          <Mail className="w-3.5 h-3.5" />
          <span>{user.email}</span>
        </div>

        {/* Sign Out Action Button */}
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-extrabold text-sm border border-red-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
