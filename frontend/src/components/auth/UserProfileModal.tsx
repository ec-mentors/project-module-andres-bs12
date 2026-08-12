import React from 'react';
import { X, LogOut, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<React.PropsWithChildren<UserProfileModalProps>> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    /* Backdrop Overlay - Clicking outside closes modal */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Inner Modal Card - Stops propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#161024] border-2 border-white/15 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/10">
          {user.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt={user.firstName}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#6417ff] shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#6417ff] flex items-center justify-center font-bold text-2xl text-white shadow-md">
              {user.firstName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-1.5">
              <span>{user.firstName} {user.lastName}</span>
              <ShieldCheck className="w-4 h-4 text-purple-300" />
            </h3>
            <p className="text-xs text-purple-300 font-semibold">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6417ff]/20 text-[#6417ff] border border-[#6417ff]/30">
              Authenticated User
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#231a38] border border-white/10 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>User ID:</span>
              <span className="font-mono text-white truncate max-w-[180px]">{user.id || user.googleId || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Auth Provider:</span>
              <span className="font-semibold text-white uppercase">Google OAuth</span>
            </div>
          </div>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-extrabold text-sm border border-red-500/30 transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
