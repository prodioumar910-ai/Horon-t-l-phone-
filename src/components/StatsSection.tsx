import React, { useEffect, useState } from 'react';
import { PeakChart } from './ui/peak-chart.tsx';
import { EdgeGradientRibbons } from './EdgeGradientRibbons.tsx';
import { AnimatedSectionTitle } from './ui/SectionMotion.tsx';

const FRENCH_PERIODS = ['Semaine', 'Mois', 'Année'];

const SATISFACTION_SERIES: Record<
  string,
  { data: number[]; labels: string[]; value: number; caption: string }
> = {
  Semaine: {
    data: [92, 94, 95, 97, 98, 99, 100],
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    value: 100,
    caption: 'Satisfaction vérifiée · Semaine',
  },
  Mois: {
    data: [
      89, 90, 91, 92, 92, 93, 94, 94, 95, 95, 96, 96, 97, 98, 99, 100,
      100, 99, 98, 98, 99, 99, 100, 100, 99, 99, 100, 100, 100, 100,
    ],
    labels: Array.from({ length: 30 }, (_, i) => `Jour ${i + 1}`),
    value: 100,
    caption: 'Satisfaction vérifiée · Bamako',
  },
  Année: {
    data: [91, 92, 93, 94, 95, 96, 97, 98, 98, 99, 100, 100],
    labels: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
    value: 100,
    caption: 'Satisfaction vérifiée · Annuelle',
  },
};

const SERVICE_QUALITY_SERIES: Record<
  string,
  { data: number[]; labels: string[]; value: number; caption: string }
> = {
  Semaine: {
    data: [94, 95, 96, 97, 99, 100, 100],
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    value: 100,
    caption: 'Accompagnement client · Semaine',
  },
  Mois: {
    data: [
      91, 92, 93, 94, 95, 95, 96, 97, 97, 98, 99, 99, 100, 100, 100, 100,
    ],
    labels: Array.from({ length: 16 }, (_, i) => `Jour ${i * 2 + 1}`),
    value: 100,
    caption: "Accompagnement d'excellence",
  },
  Année: {
    data: [90, 92, 94, 95, 96, 97, 98, 98, 99, 99, 100, 100],
    labels: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
    value: 100,
    caption: 'Service après-vente certifié',
  },
};

function computeHorizontalCardWidth() {
  if (typeof window === 'undefined') return 360;
  const vw = window.innerWidth;
  // Toujours garder les 2 cartes côte à côte horizontalement, sans débordement sur mobile
  const containerWidth = Math.min(vw - 32, 1216);
  const horizontalGap = vw < 640 ? 14 : 44;
  const innerPadding = vw < 640 ? 28 : 80;
  const available = (containerWidth - innerPadding - horizontalGap) / 2;
  return Math.max(146, Math.min(390, Math.round(available)));
}

export const StatsSection: React.FC<{ reducedMotion?: boolean }> = ({
  reducedMotion = false,
}) => {
  const [cardWidth, setCardWidth] = useState(computeHorizontalCardWidth);
  const [satisfactionPeriod, setSatisfactionPeriod] = useState<string>('Mois');
  const [servicePeriod, setServicePeriod] = useState<string>('Mois');

  useEffect(() => {
    const onResize = () => setCardWidth(computeHorizontalCardWidth());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const satisfaction =
    SATISFACTION_SERIES[satisfactionPeriod] ?? SATISFACTION_SERIES.Mois;
  const service =
    SERVICE_QUALITY_SERIES[servicePeriod] ?? SERVICE_QUALITY_SERIES.Mois;

  return (
    <section
      id="stats-section"
      aria-label="Statistiques en direct HORON PHONE"
      className="relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 horon-surface-pearl"
    >
      <EdgeGradientRibbons variant="stats" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#F2F4F7]/90 to-transparent z-[1]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#EFF1F5]/90 to-transparent z-[1]"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div
          className="relative w-full flex flex-row flex-nowrap items-center justify-center overflow-hidden mx-auto px-3.5 py-7 sm:px-10 sm:py-14"
          style={{
            borderRadius: 'clamp(20px, 3vw, 34px)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            background:
              'linear-gradient(135deg, rgba(236, 253, 245, 0.68) 0%, rgba(167, 243, 208, 0.30) 50%, rgba(209, 250, 229, 0.56) 100%)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            boxShadow:
              '0 22px 54px rgba(16, 185, 129, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
            gap: cardWidth < 220 ? 14 : Math.round(cardWidth * 0.14),
          }}
        >
          <div className="flex flex-col items-center">
            <AnimatedSectionTitle
              align="center"
              as="h3"
              title="Taux de satisfaction"
              reducedMotion={reducedMotion}
              titleClassName="mb-3 sm:mb-4 font-display text-xs sm:text-base lg:text-lg font-semibold text-[#111318] text-center tracking-tight"
            />
            <PeakChart
              variant="crystal-green"
              width={cardWidth}
              data={satisfaction.data}
              labels={satisfaction.labels}
              value={satisfaction.value}
              valueSuffix="%"
              title=""
              caption={satisfaction.caption}
              updatedText="Données à jour"
              periods={FRENCH_PERIODS}
              period={satisfactionPeriod}
              onPeriodChange={setSatisfactionPeriod}
            />
          </div>

          <div className="flex flex-col items-center">
            <AnimatedSectionTitle
              align="center"
              as="h3"
              title="Qualité du service client"
              reducedMotion={reducedMotion}
              titleClassName="mb-3 sm:mb-4 font-display text-xs sm:text-base lg:text-lg font-semibold text-[#111318] text-center tracking-tight"
            />
            <PeakChart
              variant="crystal-green"
              width={cardWidth}
              data={service.data}
              labels={service.labels}
              value={service.value}
              valueSuffix="%"
              title=""
              caption={service.caption}
              updatedText="En direct"
              periods={FRENCH_PERIODS}
              period={servicePeriod}
              onPeriodChange={setServicePeriod}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
