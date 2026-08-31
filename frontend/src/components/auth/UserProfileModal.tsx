import React from 'react';
import { X, LogOut, Mail, Bookmark, Send } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  onOpenManageFavorites?: () => void;
  theme?: 'dark' | 'light';
}

export const UserProfileModal: React.FC<React.PropsWithChildren<UserProfileModalProps>> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenManageFavorites,
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

        const handleConnectTelegram = () => {
          const botUserName = import.meta.env.VITE_TELEGRAM_BOT_NAME || `NutritionTracker_2Bot`;

          if (user.telegramChatId) {
            // If connected opens chat with the user
            window.open(`https://t.me/${botUserName}`, `_blank`);
          } else {
            // If not connected, opens Deep Link with the UUID to connect the user
            window.open(`https://t.me/${botUserName}?start=${user.id}`, `_blank`);
          }
        };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overscroll-none touch-none flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border rounded-[32px] p-6 sm:p-8 w-full max-w-sm relative animate-in zoom-in-95 duration-200 transition-all text-center ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.12)] [color-scheme:light]'
            : 'bg-[#121214] border-white/[0.08] text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] [color-scheme:dark]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isLight
              ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              : 'hover:bg-white/10 text-zinc-400 hover:text-white'
          }`}
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <div className="relative mx-auto w-20 h-20 mb-4 mt-2">
          {user.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={user.firstName}
              className={`w-20 h-20 rounded-full object-cover border-2 shadow-lg ${
                isLight ? 'border-slate-400' : 'border-white/20'
              }`}
            />
          ) : (
            <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl shadow-lg ${
              isLight ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
              {user.firstName.charAt(0)}
            </div>
          )}
        </div>

        {/* User Info */}
        <h3 className={`text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {user.firstName} {user.lastName}
        </h3>
        
        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
          isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#18181b] text-zinc-300'
        }`}>
          <Mail className="w-3.5 h-3.5" />
          <span>{user.email}</span>
        </div>

        {/* Manage Favorites Action Button */}
        {onOpenManageFavorites && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManageFavorites();
            }}
            className={`w-full py-3 rounded-2xl font-bold text-sm border transition-all active:scale-95 flex items-center justify-center space-x-2 mb-2.5 cursor-pointer shadow-2xs ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
                : 'bg-white/5 hover:bg-white/10 text-white border-white/[0.08]'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Manage Favorites</span>
          </button>
        )}

        {/* Telegram Chat Action Button */}
        <button
          type="button"
          onClick={handleConnectTelegram}
          className={`w-full py-3 rounded-2xl font-bold text-sm border transition-all active:scale-95 flex items-center justify-center space-x-2 mb-2.5 cursor-pointer shadow-2xs ${
            user.telegramChatId
              ?  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-[#229ED9]/10 text-[#229ED9] border-[#229ED9]/20 hover:bg-[#229ED9]/20'
          }`}
        >
          <Send className="w-4 h-4 text-blue-500" />
          <span>{user.telegramChatId ? 'Telegram connected' : 'Link telegram'}</span>
          </button>


        {/* Sign Out Action Button */}
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-extrabold text-sm border border-rose-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
