import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  brandLabel?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  brandLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F6F8] via-[#E9EBEF] to-[#F5F6F8] text-[#A6ABB3] p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Smartphone className="w-10 h-10 stroke-[1.5] text-[#20242C]/50" />
        <span className="mt-2 text-xs font-medium text-[#20242C]/60 text-center line-clamp-1">
          {brandLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
