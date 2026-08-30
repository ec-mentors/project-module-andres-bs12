/** Shared typography tokens for favorites feature */
export const favoritesTypography = {
  modalTitle: 'text-lg sm:text-xl font-bold',
  sectionLabel: 'text-xs sm:text-sm font-semibold uppercase tracking-wide',
  bodyText: 'text-sm font-semibold',
  buttonText: 'text-sm font-semibold',
  barButtonText: 'text-xs sm:text-sm font-semibold',
  ctaText: 'text-sm sm:text-base font-bold',
  pillText: 'text-sm sm:text-base font-semibold',
  footerTip: 'text-sm sm:text-base font-medium',
  macroLabel: 'text-[10px] sm:text-xs font-semibold tracking-wider uppercase',
  macroValue: 'text-xs sm:text-sm font-bold',
} as const;

/** Minimum touch target height for mobile (44px per Apple HIG) */
export const TOUCH_TARGET_MIN = 'min-h-[44px]';

/** Compact bar touch target — 36px mobile, 44px sm+ (matches omnibar-adjacent density) */
export const TOUCH_TARGET_BAR = 'min-h-[36px] sm:min-h-[44px]';

/** Prominent CTA touch target (48px) for primary actions like Import from Favorites */
export const TOUCH_TARGET_CTA = 'min-h-[48px]';
