import React from 'react';
import { motion } from 'motion/react';

interface AnimatedSectionTitleProps {
  eyebrow?: string;
  title: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  titleClassName?: string;
  eyebrowClassName?: string;
  replayOnScroll?: boolean;
  reducedMotion?: boolean;
  accentLine?: boolean;
}

export const AnimatedSectionTitle: React.FC<AnimatedSectionTitleProps> = ({
  eyebrow,
  title,
  align = 'left',
  as = 'h2',
  titleClassName = '',
  eyebrowClassName = '',
  replayOnScroll = false,
  reducedMotion = false,
  accentLine = false,
}) => {
  const HeadingTag = as;
  const alignClasses = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  if (reducedMotion) {
    return (
      <div className={`flex flex-col ${alignClasses}`}>
        {eyebrow && (
          <p
            className={`text-xs font-medium tracking-[0.18em] text-[#1769E0] uppercase ${eyebrowClassName}`}
          >
            {eyebrow}
          </p>
        )}
        <HeadingTag className={titleClassName}>{title}</HeadingTag>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${alignClasses}`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 8, letterSpacing: '0.24em' }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: '0.18em' }}
          viewport={{ once: !replayOnScroll, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`text-xs font-medium tracking-[0.18em] text-[#1769E0] uppercase ${eyebrowClassName}`}
        >
          {eyebrow}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: !replayOnScroll, amount: 0.3 }}
        transition={{ duration: 0.78, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <HeadingTag className={titleClassName}>{title}</HeadingTag>
      </motion.div>

      {accentLine && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: !replayOnScroll, amount: 0.35 }}
          transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-3 h-[1.5px] w-14 rounded-full bg-gradient-to-r from-[#1769E0]/60 via-[#94A3B8]/50 to-transparent ${
            align === 'center' ? 'origin-center' : 'origin-left'
          }`}
        />
      )}
    </div>
  );
};

export type DividerMicroVariant =
  | 'orb-sweep'
  | 'harmonic-bars'
  | 'scroll-chevron'
  | 'signal-rings'
  | 'compass-arc'
  | 'horizon-fade';

interface SectionMicroDividerProps {
  variant: DividerMicroVariant;
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Bande de micro-animation distincte entre chaque section du site.
 * Respecte prefers-reduced-motion et l'équilibre visuel gris perle / argent / 1 % bleu-orange.
 */
export const SectionMicroDivider: React.FC<SectionMicroDividerProps> = ({
  variant,
  reducedMotion = false,
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`relative z-10 w-full h-12 flex items-center justify-center overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* Ligne argentée très douce en arrière-plan */}
      <div className="absolute inset-x-[10%] sm:inset-x-[18%] h-px bg-gradient-to-r from-transparent via-[#D9DEE8] to-transparent" />

      {/* 1. Orbe lumineux glissant le long d'un fil argenté (Story -> Marques) */}
      {variant === 'orb-sweep' && (
        <div className="relative w-56 sm:w-80 h-6 flex items-center justify-center overflow-hidden">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#CBD2DF] to-transparent" />
          {!reducedMotion && (
            <motion.span
              className="absolute w-10 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#1769E0]/75 to-[#F58C38]/55 blur-[0.4px]"
              animate={{ x: [-130, 130], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      )}

      {/* 2. Barres harmoniques de mesure (Marques -> Stats) */}
      {variant === 'harmonic-bars' && (
        <div className="relative px-4 py-1.5 rounded-full bg-white/85 border border-[#E6E9F0] flex items-center gap-1.5 shadow-[0_2px_10px_rgba(17,19,24,0.03)]">
          {[0.55, 0.9, 1, 0.75, 0.5].map((heightRatio, idx) => (
            <motion.span
              key={idx}
              className={`w-[3px] rounded-full ${
                idx === 2 ? 'bg-[#10B981]/75' : 'bg-[#94A3B8]/65'
              }`}
              style={{ height: `${Math.round(heightRatio * 14)}px` }}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      scaleY: [0.45, 1.15, 0.45],
                      opacity: [0.55, 1, 0.55],
                    }
              }
              transition={{
                duration: 1.8,
                delay: idx * 0.16,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Chevrons fluides descendants (Stats -> Pourquoi HORON / Vidéo) */}
      {variant === 'scroll-chevron' && (
        <div className="relative px-3.5 py-1 rounded-full bg-white/85 border border-[#E6E9F0] flex flex-col items-center justify-center">
          {[0, 1].map((idx) => (
            <motion.svg
              key={idx}
              width="14"
              height="7"
              viewBox="0 0 14 7"
              fill="none"
              className={idx === 1 ? '-mt-1' : ''}
              animate={
                reducedMotion
                  ? undefined
                  : { y: [0, 2.5, 0], opacity: [0.35, 1, 0.35] }
              }
              transition={{
                duration: 1.9,
                delay: idx * 0.25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path
                d="M2 1.5L7 5.5L12 1.5"
                stroke={idx === 0 ? '#1769E0' : '#94A3B8'}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ))}
        </div>
      )}

      {/* 4. Ondes concentriques de signal vocal (Vidéo -> Contact Conseillers) */}
      {variant === 'signal-rings' && (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {!reducedMotion &&
            [0, 1].map((idx) => (
              <motion.span
                key={idx}
                className="absolute w-7 h-7 rounded-full border border-[#1769E0]/45"
                animate={{ scale: [0.55, 1.45], opacity: [0.75, 0] }}
                transition={{
                  duration: 2.4,
                  delay: idx * 1.1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          <span className="relative w-2.5 h-2.5 rounded-full bg-[#1769E0] shadow-[0_0_10px_rgba(23,105,224,0.45)]" />
        </div>
      )}

      {/* 5. Arc boussole & points convergents (Contact -> Localisation) */}
      {variant === 'compass-arc' && (
        <div className="relative px-4 py-1 rounded-full bg-white/90 border border-[#E6E9F0] flex items-center gap-3 shadow-[0_2px_10px_rgba(17,19,24,0.03)]">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"
            animate={reducedMotion ? undefined : { x: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            animate={reducedMotion ? undefined : { rotate: [0, 18, -12, 0] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="8" cy="8" r="6.2" stroke="#CBD2DF" strokeWidth="1.2" />
            <path
              d="M8 3.2L9.8 8L8 12.8L6.2 8L8 3.2Z"
              fill="#1769E0"
              fillOpacity="0.85"
            />
          </motion.svg>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#F58C38]/80"
            animate={reducedMotion ? undefined : { x: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* 6. Lueur d'horizon argentée (Localisation -> Pied de page) */}
      {variant === 'horizon-fade' && (
        <div className="relative w-64 sm:w-96 h-4 flex items-center justify-center overflow-hidden">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C7CFDD] to-transparent" />
          {!reducedMotion && (
            <motion.span
              className="absolute w-20 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_rgba(23,105,224,0.35)]"
              animate={{ x: [-160, 160], opacity: [0, 0.95, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      )}
    </div>
  );
};
