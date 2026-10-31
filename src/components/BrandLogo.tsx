import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = false,
  theme = 'light',
}) => {
  const dim =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-11 h-11';

  return (
    <span className="inline-flex items-center gap-2.5 select-none shrink-0">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dim} shrink-0 drop-shadow-xs transition-transform duration-150 group-hover:scale-105`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="mn-logo-bg"
            x1="6"
            y1="6"
            x2="58"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient
            id="mn-logo-cap"
            x1="12"
            y1="10"
            x2="52"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
        </defs>

        {/* Outer Mechanical Key Housing */}
        <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#mn-logo-bg)" />
        <rect
          x="4.75"
          y="4.75"
          width="54.5"
          height="54.5"
          rx="14.25"
          stroke="#7DD3FC"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />

        {/* Sculpted Top Keycap Surface */}
        <rect x="11" y="10" width="42" height="38" rx="9.5" fill="url(#mn-logo-cap)" />

        {/* Symmetric Finger Wave Crest (Symbolizing 10-Finger Harmony) */}
        <rect x="16.5" y="24.5" width="3" height="8.5" rx="1.5" fill="#0F172A" />
        <rect x="21.5" y="20" width="3" height="13" rx="1.5" fill="#0F172A" />
        <rect x="26.5" y="16.5" width="3" height="16.5" rx="1.5" fill="#0284C7" />
        <rect x="31.5" y="19" width="3" height="14" rx="1.5" fill="#0284C7" />
        <rect x="36.5" y="16.5" width="3" height="16.5" rx="1.5" fill="#0284C7" />
        <rect x="41.5" y="20" width="3" height="13" rx="1.5" fill="#0F172A" />
        <rect x="46.5" y="24.5" width="3" height="8.5" rx="1.5" fill="#0F172A" />

        {/* Dual Tactile Home-Row Bumps (F & J Anchors) */}
        <rect x="23.5" y="40" width="6.5" height="2.5" rx="1.25" fill="#0284C7" />
        <rect x="34" y="40" width="6.5" height="2.5" rx="1.25" fill="#0284C7" />

        {/* Bottom Thumb Spacebar Accent */}
        <rect x="20" y="53" width="24" height="2.6" rx="1.3" fill="#7DD3FC" />
      </svg>

      {showWordmark && (
        <span className="flex flex-col text-left leading-none">
          <span
            className={`text-base font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Mười Ngón
          </span>
          <span
            className={`text-[11px] font-medium mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Luyện gõ 10 ngón
          </span>
        </span>
      )}
    </span>
  );
};
