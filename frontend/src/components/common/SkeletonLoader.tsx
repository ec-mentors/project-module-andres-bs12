import React from 'react';

interface SkeletonLoaderProps {
  theme?: 'dark' | 'light';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  const cardBg = isLight
    ? 'bg-white/95 border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
    : 'bg-slate-900/60 border-slate-800';

  const blockBg = isLight ? 'bg-slate-200' : 'bg-slate-800';
  const blockBgMuted = isLight ? 'bg-slate-100' : 'bg-slate-800/50';
  const blockBgDarker = isLight ? 'bg-slate-300' : 'bg-slate-700';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-pulse">
      {/* Top message badge */}
      <div className="flex justify-center mb-8">
        <div className={`border px-6 py-2 rounded-full text-xs font-semibold flex items-center space-x-2 ${
          isLight
            ? 'bg-slate-100/90 border-slate-300/80 text-slate-700 shadow-xs'
            : 'bg-[#18181b] border-white/10 text-slate-400'
        }`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Preparing your personalized nutrition dashboard...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Card Skeleton */}
          <div className={`rounded-[32px] p-8 border space-y-6 ${cardBg}`}>
            <div className="space-y-3">
              <div className={`h-14 w-36 ${blockBg} rounded-2xl`} />
              <div className={`h-5 w-48 ${blockBg} rounded-xl`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${blockBgMuted} rounded-[24px] p-4 h-24 flex items-center justify-between border ${isLight ? 'border-slate-200' : 'border-slate-700/40'}`}>
                  <div className="space-y-2">
                    <div className={`h-3 w-12 ${blockBgDarker} rounded`} />
                    <div className={`h-6 w-16 ${blockBgDarker} rounded-lg`} />
                  </div>
                  <div className={`w-12 h-12 rounded-full ${blockBgDarker}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Consumed vs Left Table Skeleton */}
          <div className={`rounded-[32px] p-8 border space-y-4 ${cardBg}`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`h-8 w-48 ${blockBg} rounded-xl`} />
              <div className={`h-4 w-32 ${blockBg} rounded-lg`} />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-14 ${blockBgMuted} rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`} />
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4">
          <div className={`rounded-[32px] p-6 border space-y-6 ${cardBg}`}>
            <div className="flex justify-between items-center">
              <div className={`h-7 w-36 ${blockBg} rounded-xl`} />
              <div className={`w-10 h-10 rounded-full ${blockBg}`} />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-32 ${blockBgMuted} rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
