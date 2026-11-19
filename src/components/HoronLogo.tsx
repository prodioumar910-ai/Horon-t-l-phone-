import React from 'react';

interface HoronLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  titleTransparent?: boolean;
}

export const HoronLogo: React.FC<HoronLogoProps> = ({
  className = '',
  size = 'md',
  titleTransparent = false,
}) => {
  const badgeSizeClass =
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'lg'
        ? 'w-14 h-14'
        : 'w-11 h-11';

  const textClass =
    size === 'sm'
      ? 'text-sm tracking-[0.14em]'
      : size === 'lg'
        ? 'text-xl tracking-[0.16em]'
        : 'text-base tracking-[0.15em]';

  return (
    <span
      className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none ${className}`}
    >
      <span
        className={`${badgeSizeClass} rounded-full overflow-hidden shrink-0 inline-flex items-center justify-center shadow-[0_4px_14px_rgba(17,19,24,0.16)] ring-1 ring-black/10 transition-opacity duration-300 ${
          titleTransparent ? 'opacity-85' : 'opacity-100'
        }`}
      >
        <img
          src="/assets/horon-logo-circle.png"
          alt="Logo HORON PHONE"
          className="w-full h-full object-cover rounded-full"
        />
      </span>
      <span
        data-horon-logo-title="true"
        className={`font-display font-semibold text-[#111318] uppercase transition-opacity duration-300 ${textClass} ${
          titleTransparent ? 'opacity-0' : 'opacity-100'
        }`}
      >
        HORON PHONE
      </span>
    </span>
  );
};
