import React from 'react';

interface BrandLogoProps {
  brandName: string;
  deviceStyle?: 'apple' | 'samsung' | 'tecno' | 'infinix' | 'xiaomi';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandName,
  deviceStyle,
  className = '',
}) => {
  const lower = brandName.toLowerCase();
  const key =
    deviceStyle ||
    (lower.includes('apple')
      ? 'apple'
      : lower.includes('samsung')
        ? 'samsung'
        : lower.includes('tecno')
          ? 'tecno'
          : lower.includes('infinix')
            ? 'infinix'
            : lower.includes('xiaomi') || lower.includes('redmi')
              ? 'xiaomi'
              : 'custom');

  if (key === 'apple') {
    return (
      <span className={`inline-flex items-center gap-2 text-[#111318] ${className}`}>
        <svg
          width="24"
          height="28"
          viewBox="0 0 24 28"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M19.66 14.84c-.03-2.99 2.44-4.43 2.55-4.5-1.39-2.03-3.55-2.31-4.32-2.34-1.82-.19-3.58 1.09-4.51 1.09-.94 0-2.37-1.07-3.91-1.04-2 .03-3.86 1.18-4.89 2.98-2.11 3.66-.54 9.07 1.49 12.04 1 1.45 2.18 3.07 3.74 3.01 1.51-.06 2.09-.97 3.92-.97 1.82 0 2.35.97 3.94.94 1.63-.03 2.66-1.46 3.64-2.92 1.16-1.69 1.63-3.34 1.66-3.43-.04-.02-3.28-1.26-3.31-4.86ZM16.69 5.95c.82-1 1.38-2.38 1.23-3.77-1.19.05-2.65.79-3.5 1.79-.76.88-1.43 2.3-1.26 3.65 1.33.1 2.7-.67 3.53-1.67Z" />
        </svg>
        <span className="font-display font-semibold text-base tracking-tight">
          Apple
        </span>
      </span>
    );
  }

  if (key === 'samsung') {
    return (
      <span className={`inline-flex items-center text-[#111318] ${className}`}>
        <svg
          width="118"
          height="24"
          viewBox="0 0 118 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Samsung"
        >
          <text
            x="59"
            y="17"
            textAnchor="middle"
            fill="currentColor"
            fontFamily="Sora, sans-serif"
            fontWeight="700"
            fontSize="15.5"
            letterSpacing="2.4"
          >
            SAMSUNG
          </text>
        </svg>
      </span>
    );
  }

  if (key === 'tecno') {
    return (
      <span className={`inline-flex items-center gap-2 text-[#111318] ${className}`}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 8.5H17M12 8.5V16.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-display font-bold text-base tracking-[0.14em]">
          TECNO
        </span>
      </span>
    );
  }

  if (key === 'infinix') {
    return (
      <span className={`inline-flex items-center gap-2 text-[#111318] ${className}`}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M5 17L10.5 7M13.5 17L19 7"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2" fill="#1769E0" />
        </svg>
        <span className="font-display font-semibold text-base tracking-[0.06em]">
          Infinix
        </span>
      </span>
    );
  }

  if (key === 'xiaomi') {
    return (
      <span className={`inline-flex items-center gap-2 text-[#111318] ${className}`}>
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="1.5" y="1.5" width="23" height="23" rx="7" fill="currentColor" />
          <path
            d="M7.5 17V10.5C7.5 9.67 8.17 9 9 9H12.5C13.33 9 14 9.67 14 10.5V17M10.8 11.8V17M17.5 9V17"
            stroke="#FFFFFF"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-display font-semibold text-sm tracking-tight">
          Xiaomi · Redmi
        </span>
      </span>
    );
  }

  return (
    <span className={`font-display font-semibold text-base text-[#111318] ${className}`}>
      {brandName}
    </span>
  );
};
