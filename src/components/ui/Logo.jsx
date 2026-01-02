import React from 'react';

const Logo = ({ variant = "brand", className = "" }) => {
  const isMinimal = variant === "minimal";

  return (
    <svg
      viewBox={isMinimal ? "0 0 32 32" : "0 0 135 30"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${isMinimal ? "h-12 w-12" : "h-16 w-auto -mb-3"} ${className}`}
    >
      <defs>
        <linearGradient id="walletBody" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" offset="0%" />
          <stop stopColor="#3730A3" offset="100%" />
        </linearGradient>
        <linearGradient id="walletFlap" x1="4" y1="10" x2="28" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" offset="0%" />
          <stop stopColor="#4F46E5" offset="100%" />
        </linearGradient>
        <radialGradient id="coinShine" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(4)">
          <stop stopColor="#FCD34D" offset="0%" />
          <stop stopColor="#F59E0B" offset="100%" />
        </radialGradient>
      </defs>

      {/* ICON GROUP */}
      <g>
        <ellipse cx="16" cy="27" rx="12" ry="3" fill="#312E81" fillOpacity="0.2" />
        <path d="M4 10C4 7.79 5.79 6 8 6H24C26.21 6 28 7.79 28 10V22C28 24.21 26.21 26 24 26H8C5.79 26 4 24.21 4 22V10Z" transform="translate(0, 2)" fill="#3730A3" />
        <path d="M4 10C4 7.79 5.79 6 8 6H24C26.21 6 28 7.79 28 10V22C28 24.21 26.21 26 24 26H8C5.79 26 4 24.21 4 22V10Z" fill="url(#walletBody)" />
        <path d="M4 10C4 7.79 5.79 6 8 6H24C26.21 6 28 7.79 28 10V15C28 17.21 26.21 19 24 19H8C5.79 19 4 17.21 4 15V10Z" fill="url(#walletFlap)" />
        <circle cx="16" cy="17" r="4.5" fill="#D97706" />
        <circle cx="16" cy="16" r="4" fill="url(#coinShine)" />
        <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="white" fillOpacity="0.5" />
      </g>

      {/* TEXT GROUP */}
      {!isMinimal && (
        <text 
          x="35" 
          y="22" 
          fontFamily="Arial, sans-serif" 
          fontWeight="bold" 
          fontSize="19.5"
          // Removed className here so it doesn't force color on children
        >
          {/* 1. Hisaab: Changes Color (Dark Slate <-> Soft Grey) */}
          <tspan className="fill-[#1E293B] dark:fill-[#CBD5E1] transition-colors duration-200">
            Hisaab
          </tspan>

          {/* 2. Se: Always Blue (Hardcoded fill attribute wins) */}
          <tspan fill="#4F46E5">
            Se
          </tspan>
        </text>
      )}
    </svg>
  );
};

export default Logo;