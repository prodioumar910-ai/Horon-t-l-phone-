import React from 'react';

export type RibbonVariant =
  | 'story'
  | 'showroom'
  | 'stats'
  | 'quality'
  | 'closing'
  | 'catalog';

interface EdgeGradientRibbonsProps {
  variant: RibbonVariant;
  className?: string;
}

/**
 * Rubans lumineux et ondes de dégradé animées aux bordures extérieures.
 * Le centre reste blanc pur pour une lisibilité parfaite ;
 * les bordures reçoivent des rubans argent/gris perle fluides avec de subtiles touches bleu/orange (1%).
 */
export const EdgeGradientRibbons: React.FC<EdgeGradientRibbonsProps> = ({
  variant,
  className = '',
}) => {
  const configs: Record<
    RibbonVariant,
    {
      leftGradient: string;
      rightGradient: string;
      topArcGradient: string;
      sweepGradient: string;
      leftDuration: string;
      rightDuration: string;
      arcDuration: string;
      sweepDuration: string;
      leftDelay: string;
      rightDelay: string;
    }
  > = {
    story: {
      leftDuration: '12s',
      rightDuration: '10s',
      arcDuration: '14s',
      sweepDuration: '15s',
      leftDelay: '0s',
      rightDelay: '-3s',
      leftGradient:
        'radial-gradient(ellipse 68% 58% at 24% 44%, rgba(182, 190, 206, 0.56) 0%, rgba(23, 105, 224, 0.14) 38%, rgba(220, 225, 234, 0.28) 58%, rgba(255, 255, 255, 0) 78%)',
      rightGradient:
        'radial-gradient(ellipse 68% 58% at 76% 54%, rgba(186, 194, 210, 0.54) 0%, rgba(245, 140, 56, 0.12) 40%, rgba(222, 226, 235, 0.25) 60%, rgba(255, 255, 255, 0) 78%)',
      topArcGradient:
        'radial-gradient(ellipse 64% 46% at 50% 0%, rgba(196, 204, 218, 0.48) 0%, rgba(23, 105, 224, 0.08) 45%, rgba(255, 255, 255, 0) 78%)',
      sweepGradient:
        'linear-gradient(108deg, rgba(198, 205, 219, 0.36) 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0) 72%, rgba(23, 105, 224, 0.09) 100%)',
    },
    showroom: {
      leftDuration: '11s',
      rightDuration: '14s',
      arcDuration: '13s',
      sweepDuration: '12s',
      leftDelay: '-2s',
      rightDelay: '-5s',
      leftGradient:
        'radial-gradient(ellipse 70% 56% at 22% 50%, rgba(184, 192, 208, 0.54) 0%, rgba(23, 105, 224, 0.13) 40%, rgba(220, 224, 232, 0.24) 60%, rgba(255, 255, 255, 0) 78%)',
      rightGradient:
        'radial-gradient(ellipse 70% 56% at 78% 48%, rgba(180, 188, 204, 0.52) 0%, rgba(245, 140, 56, 0.10) 42%, rgba(220, 224, 232, 0.22) 60%, rgba(255, 255, 255, 0) 78%)',
      topArcGradient:
        'radial-gradient(ellipse 60% 42% at 50% 100%, rgba(196, 203, 216, 0.44) 0%, rgba(23, 105, 224, 0.07) 48%, rgba(255, 255, 255, 0) 76%)',
      sweepGradient:
        'linear-gradient(96deg, rgba(202, 209, 222, 0.34) 0%, rgba(255, 255, 255, 0) 26%, rgba(255, 255, 255, 0) 74%, rgba(202, 209, 222, 0.34) 100%)',
    },
    stats: {
      leftDuration: '13s',
      rightDuration: '15s',
      arcDuration: '11s',
      sweepDuration: '14s',
      leftDelay: '-1s',
      rightDelay: '-4s',
      leftGradient:
        'radial-gradient(ellipse 68% 58% at 20% 50%, rgba(178, 186, 202, 0.56) 0%, rgba(245, 140, 56, 0.11) 40%, rgba(218, 223, 232, 0.26) 58%, rgba(255, 255, 255, 0) 78%)',
      rightGradient:
        'radial-gradient(ellipse 68% 58% at 80% 50%, rgba(182, 190, 206, 0.58) 0%, rgba(23, 105, 224, 0.13) 42%, rgba(218, 223, 232, 0.26) 58%, rgba(255, 255, 255, 0) 78%)',
      topArcGradient:
        'radial-gradient(ellipse 62% 45% at 50% 0%, rgba(194, 201, 214, 0.42) 0%, rgba(245, 140, 56, 0.07) 44%, rgba(255, 255, 255, 0) 76%)',
      sweepGradient:
        'linear-gradient(102deg, rgba(196, 203, 217, 0.34) 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0) 72%, rgba(23, 105, 224, 0.08) 100%)',
    },
    quality: {
      leftDuration: '9.5s',
      rightDuration: '13s',
      arcDuration: '12s',
      sweepDuration: '11s',
      leftDelay: '-2.5s',
      rightDelay: '0s',
      leftGradient:
        'radial-gradient(ellipse 68% 56% at 20% 42%, rgba(174, 182, 198, 0.60) 0%, rgba(23, 105, 224, 0.14) 40%, rgba(216, 221, 230, 0.28) 58%, rgba(255, 255, 255, 0) 78%)',
      rightGradient:
        'radial-gradient(ellipse 68% 56% at 80% 58%, rgba(178, 186, 202, 0.56) 0%, rgba(245, 140, 56, 0.11) 42%, rgba(216, 221, 230, 0.26) 58%, rgba(255, 255, 255, 0) 78%)',
      topArcGradient:
        'radial-gradient(ellipse 65% 44% at 50% 100%, rgba(190, 198, 212, 0.46) 0%, rgba(23, 105, 224, 0.08) 46%, rgba(255, 255, 255, 0) 76%)',
      sweepGradient:
        'linear-gradient(112deg, rgba(194, 201, 215, 0.36) 0%, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0) 70%, rgba(194, 201, 215, 0.36) 100%)',
    },
    closing: {
      leftDuration: '8.5s',
      rightDuration: '14.5s',
      arcDuration: '12.5s',
      sweepDuration: '13.5s',
      leftDelay: '-1.5s',
      rightDelay: '-3.5s',
      leftGradient:
        'radial-gradient(ellipse 70% 58% at 22% 48%, rgba(182, 190, 206, 0.56) 0%, rgba(23, 105, 224, 0.13) 40%, rgba(220, 224, 233, 0.24) 58%, rgba(255, 255, 255, 0) 78%)',
      rightGradient:
        'radial-gradient(ellipse 70% 58% at 78% 52%, rgba(184, 192, 208, 0.54) 0%, rgba(245, 140, 56, 0.12) 42%, rgba(220, 224, 233, 0.24) 58%, rgba(255, 255, 255, 0) 78%)',
      topArcGradient:
        'radial-gradient(ellipse 64% 46% at 50% 0%, rgba(196, 204, 218, 0.44) 0%, rgba(245, 140, 56, 0.07) 44%, rgba(255, 255, 255, 0) 76%)',
      sweepGradient:
        'linear-gradient(96deg, rgba(200, 207, 220, 0.34) 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0) 72%, rgba(23, 105, 224, 0.09) 100%)',
    },
    catalog: {
      leftDuration: '10.5s',
      rightDuration: '15.5s',
      arcDuration: '13.5s',
      sweepDuration: '12.5s',
      leftDelay: '0s',
      rightDelay: '-4.5s',
      leftGradient:
        'radial-gradient(ellipse 68% 58% at 20% 36%, rgba(182, 190, 206, 0.52) 0%, rgba(23, 105, 224, 0.12) 40%, rgba(220, 225, 234, 0.24) 58%, rgba(255, 255, 255, 0) 78%)',
      rightGradient:
        'radial-gradient(ellipse 68% 58% at 80% 62%, rgba(184, 192, 208, 0.50) 0%, rgba(245, 140, 56, 0.10) 42%, rgba(220, 225, 234, 0.22) 58%, rgba(255, 255, 255, 0) 78%)',
      topArcGradient:
        'radial-gradient(ellipse 62% 44% at 50% 0%, rgba(196, 204, 218, 0.42) 0%, rgba(23, 105, 224, 0.07) 46%, rgba(255, 255, 255, 0) 76%)',
      sweepGradient:
        'linear-gradient(100deg, rgba(198, 205, 219, 0.30) 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0) 72%, rgba(198, 205, 219, 0.30) 100%)',
    },
  };

  const cfg = configs[variant];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden z-0 ${className}`}
    >
      {/* Onde de dégradé douce glissant d'une bordure à l'autre */}
      <div
        className="edge-motion-layer anim-edge-sweep absolute -inset-y-8 -inset-x-[16%]"
        style={{
          background: cfg.sweepGradient,
          animationDuration: cfg.sweepDuration,
        }}
      />

      {/* Onde incurvée le long de la bordure horizontale supérieure/inférieure */}
      <div
        className="edge-motion-layer anim-edge-arc absolute -top-[18%] left-[8%] right-[8%] h-[42%] rounded-full blur-[42px] sm:blur-[54px]"
        style={{
          background: cfg.topArcGradient,
          animationDuration: cfg.arcDuration,
        }}
      />

      {/* Ruban incurvé animé bord gauche */}
      <div
        className="edge-motion-layer anim-edge-left absolute -left-[16%] sm:-left-[11%] -top-[8%] w-[52vw] min-w-[240px] max-w-[640px] h-[116%] rounded-full blur-[38px] sm:blur-[50px]"
        style={{
          background: cfg.leftGradient,
          animationDuration: cfg.leftDuration,
          animationDelay: cfg.leftDelay,
        }}
      />

      {/* Ruban incurvé animé bord droit */}
      <div
        className="edge-motion-layer anim-edge-right absolute -right-[16%] sm:-right-[11%] -bottom-[8%] w-[52vw] min-w-[240px] max-w-[640px] h-[116%] rounded-full blur-[38px] sm:blur-[50px]"
        style={{
          background: cfg.rightGradient,
          animationDuration: cfg.rightDuration,
          animationDelay: cfg.rightDelay,
        }}
      />
    </div>
  );
};
