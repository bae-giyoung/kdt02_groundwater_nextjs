'use client';

import { useMemo } from 'react';
import DonutGauge from './DonutGauge';
import genInfo from '@/data/gennumInfo.json';

interface Indicator {
  label: string;
  value: number;
  suffix?: string;
  exclamation?: {
    title: string;
    description: string;
  };
}

interface PerformanceIndicatorsProps {
  stationCode?: string;
  title?: string;
  description?: string;
  highlight?: string;
  metrics?: Indicator[];
}

const METRIC_CONFIG = [
  {
    key: 'NSE',
    label: 'NSE',
    defaultValue: 0.82,
    description: 'Nash-Sutcliffe Efficiency (NSE): 관측값 평균 대비 모델 예측 오차를 비교해 1에 가까울수록 모델이 관측값을 잘 재현함을 의미하는 수문 모형 검증 지표입니다.',
  },
  {
    key: 'KGE',
    label: 'KGE',
    defaultValue: 0.84,
    description: 'Kling-Gupta Efficiency (KGE): 상관계수, 분산비, 평균비 세 요소를 통합해 모델의 상관성·규모·편향을 동시에 평가하는 종합 성능 지표로, 1에 가까울수록 이상적입니다.',
  },
  {
    key: 'RMSE',
    label: 'RMSE',
    defaultValue: 0.76,
    description: 'Root Mean Square Error (RMSE): 예측값과 관측값의 차이를 제곱해 평균한 뒤 제곱근을 취한 값으로, 오차의 절대 크기를 나타내며 값이 작을수록 모델의 정확도가 높습니다.',
  },
  {
    key: 'R2',
    label: 'R²',
    defaultValue: 0.88,
    description: '결정계수 (R²): 관측값 변동을 모델이 얼마나 설명하는지를 나타내는 지표로, 1에 가까울수록 모델이 데이터의 분산을 잘 설명하고 높은 적합도를 보입니다.',
  },
] as const;

const DEFAULT_METRICS: Indicator[] = METRIC_CONFIG.map(({ label, defaultValue, description }) => ({
  label,
  value: defaultValue,
  exclamation: { title: label, description },
}));

type GenInfo = typeof genInfo;

function buildMetrics(stationCode?: string): Indicator[] {
  if (!stationCode) return DEFAULT_METRICS;

  const stationData = (genInfo as GenInfo)[stationCode];
  if (!stationData) return DEFAULT_METRICS;

  return METRIC_CONFIG.map(({ key, label, defaultValue, description }) => {
    const raw = (stationData as Record<string, unknown>)[key];
    const numeric = Number(raw);
    const value = Number.isFinite(numeric) ? numeric : defaultValue;
    return {
      label,
      value,
      exclamation: { title: label, description },
    };
  });
}

export default function PerformanceIndicators({
  stationCode,
  title = '데이터 성능 지표',
  description = '아이콘을 클릭하면 각 지표별 설명을 볼 수 있습니다.',
  highlight = '7일 예측 정확도 94%로 예상됩니다.',
  metrics,
}: PerformanceIndicatorsProps) {
  const resolvedMetrics = useMemo(
    () => (metrics && metrics.length > 0 ? metrics : buildMetrics(stationCode)),
    [metrics, stationCode]
  );

  return (
    <section className="performance-indicators">
      <div className="performance-indicators-header">
        <p  className="c-tit03">{title}</p>
        <p className="c-txt-point">{highlight}</p>
        <p className="c-txt01">{description}</p>
      </div>
      <div className="performance-indicators-grid">
        {resolvedMetrics.map((metric) => (
          <DonutGauge key={metric.label} {...metric} />
        ))}
      </div>
    </section>
  );
}
