import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-pulse">
      {/* Top message badge */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#15111c]/60 border border-white/10 px-6 py-2 rounded-full text-xs font-semibold text-slate-400 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Preparing your personalized nutrition dashboard...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Card Skeleton */}
          <div className="bg-slate-900/60 rounded-[32px] p-8 border border-slate-800 space-y-6">
            <div className="space-y-3">
              <div className="h-14 w-36 bg-slate-800 rounded-2xl" />
              <div className="h-5 w-48 bg-slate-800/80 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-800/50 rounded-[24px] p-4 h-24 flex items-center justify-between border border-slate-700/40">
                  <div className="space-y-2">
                    <div className="h-3 w-12 bg-slate-700 rounded" />
                    <div className="h-6 w-16 bg-slate-700 rounded-lg" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-700" />
                </div>
              ))}
            </div>
          </div>

          {/* Consumed vs Left Table Skeleton */}
          <div className="bg-slate-900/60 rounded-[32px] p-8 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-48 bg-slate-800 rounded-xl" />
              <div className="h-4 w-32 bg-slate-800/60 rounded-lg" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-800/40 rounded-2xl border border-slate-800/60" />
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900/60 rounded-[32px] p-6 border border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-7 w-36 bg-slate-800 rounded-xl" />
              <div className="w-10 h-10 rounded-full bg-slate-800" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800/40 rounded-2xl border border-slate-800/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
