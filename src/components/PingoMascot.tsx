import React from 'react';

interface PingoMascotProps {
  mood?: 'happy' | 'calm' | 'alert' | 'sleeping' | 'celebrating';
  size?: number;
  className?: string;
}

export const PingoMascot: React.FC<PingoMascotProps> = ({
  mood = 'calm',
  size = 64,
  className = '',
}) => {
  return (
    <svg
      id="pingo-mascot-svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-label="Pingo - Mascote de Finanças"
    >
      <defs>
        <linearGradient id="pingoGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.6" stopColor="#159FEF" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <radialGradient id="pingoCheek" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#F5DFC5" stopOpacity="0.8" />
          <stop offset="1" stopColor="#F5DFC5" stopOpacity="0" />
        </radialGradient>
        <filter id="pingoShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0B1D30" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Droplet Body */}
      <path
        d="M50 12 C50 12, 18 52, 18 68 C18 83 32 94 50 94 C68 94 82 83 82 68 C82 52, 50 12, 50 12 Z"
        fill="url(#pingoGrad)"
        filter="url(#pingoShadow)"
      />

      {/* Gloss / Light Reflection */}
      <path
        d="M40 24 C40 24, 26 48, 26 62 C26 68, 30 74, 34 76 C32 72, 30 65, 32 58 C35 48, 44 32, 44 32 C44 32, 42 26, 40 24 Z"
        fill="#FFFFFF"
        opacity="0.45"
      />

      {/* Rosy Cheeks */}
      <circle cx="34" cy="69" r="6" fill="url(#pingoCheek)" />
      <circle cx="66" cy="69" r="6" fill="url(#pingoCheek)" />

      {/* Facial Expressions based on Mood */}
      {mood === 'sleeping' && (
        <g id="face-sleeping">
          {/* Closed peaceful eyes */}
          <path d="M33 60 Q38 64 43 60" stroke="#102A43" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M57 60 Q62 64 67 60" stroke="#102A43" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Subtle tiny sleeping mouth */}
          <path d="M48 68 Q50 70 52 68" stroke="#102A43" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Zzz sparkles */}
          <text x="72" y="32" fill="#F5B82E" fontSize="11" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="79" y="24" fill="#F5B82E" fontSize="8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </g>
      )}

      {mood === 'calm' && (
        <g id="face-calm">
          {/* Friendly happy curved eyes */}
          <path d="M34 59 Q39 53 44 59" stroke="#102A43" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M56 59 Q61 53 66 59" stroke="#102A43" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          {/* Gentle Smile */}
          <path d="M44 68 Q50 74 56 68" stroke="#102A43" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {mood === 'happy' && (
        <g id="face-happy">
          {/* Big Sparkly Eyes */}
          <circle cx="38" cy="58" r="4.5" fill="#102A43" />
          <circle cx="36.5" cy="56.5" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="58" r="4.5" fill="#102A43" />
          <circle cx="60.5" cy="56.5" r="1.5" fill="#FFFFFF" />
          {/* Wide Happy Smile */}
          <path d="M42 66 Q50 76 58 66 Z" fill="#102A43" />
          <path d="M46 71 Q50 75 54 71" fill="#FF5A5F" />
        </g>
      )}

      {mood === 'alert' && (
        <g id="face-alert">
          {/* Curious round eyes */}
          <circle cx="38" cy="57" r="4.5" fill="#102A43" />
          <circle cx="36.5" cy="55.5" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="57" r="4.5" fill="#102A43" />
          <circle cx="60.5" cy="55.5" r="1.5" fill="#FFFFFF" />
          {/* Small "o" mouth */}
          <ellipse cx="50" cy="69" rx="3" ry="4" fill="#102A43" />
        </g>
      )}

      {mood === 'celebrating' && (
        <g id="face-celebrating">
          {/* Cheerful squinting eyes */}
          <path d="M33 58 L43 56" stroke="#102A43" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M33 58 L43 60" stroke="#102A43" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M67 58 L57 56" stroke="#102A43" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M67 58 L57 60" stroke="#102A43" strokeWidth="2.8" strokeLinecap="round" />
          {/* Joyful open mouth */}
          <path d="M42 66 Q50 76 58 66 Z" fill="#102A43" />
          {/* Golden Stars */}
          <polygon points="20,28 22,33 27,33 23,36 25,41 20,38 15,41 17,36 13,33 18,33" fill="#F5B82E" />
          <polygon points="80,38 82,42 86,42 83,45 84,49 80,46 76,49 77,45 74,42 78,42" fill="#F5B82E" />
        </g>
      )}
    </svg>
  );
};
