'use client';

import DonutGauge from './DonutGauge';

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
  title?: string;
  description?: string;
  highlight?: string;
  metrics?: Indicator[];
}

const defaultMetrics: Indicator[] = [
  {
    label: 'NSE',
    value: 0.88,
    exclamation: {
      title: 'NSE',
      description: 'Nash-Sutcliffe Efficiency (NSE): 관측값 평균 대비 모델 예측 오차를 비교해 1에 가까울수록 모델이 관측값을 잘 재현함을 의미하는 수문 모형 검증 지표입니다.',
    },
  },
  {
    label: 'KGE',
    value: 0.82,
    exclamation: {
      title: 'KGE',
      description: 'Kling-Gupta Efficiency (KGE): 상관계수, 분산비, 평균비 세 요소를 통합해 모델의 상관성·규모·편향을 동시에 평가하는 종합 성능 지표로, 1에 가까울수록 이상적입니다.',
    },
  },
  {
    label: 'RMSE',
    value: 0.73,
    exclamation: {
      title: 'RMSE',
      description: 'Root Mean Square Error (RMSE): 예측값과 관측값의 차이를 제곱해 평균한 뒤 제곱근을 취한 값으로, 오차의 절대 크기를 나타내며 값이 작을수록 모델의 정확도가 높습니다.',
    },
  },
  /* {
    label: 'R²',
    value: 0.92,
    exclamation: {
      title: 'R²',
      description: '결정계수 (R²): 관측값 변동을 모델이 얼마나 설명하는지를 나타내는 지표로, 1에 가까울수록 모델이 데이터의 분산을 잘 설명하고 높은 적합도를 보입니다.',
    },
  }, */
];

export default function PerformanceIndicators({
  title = '데이터 성능 지표',
  description = '아이콘을 클릭하면 각 지표별 설명을 볼 수 있습니다.',
  highlight = '7일 예측 정확도 94%로 예상됩니다.',
  metrics = defaultMetrics,
}: PerformanceIndicatorsProps) {
  return (
    <section className="performance-indicators">
      <div className="performance-indicators-header">
        <p  className="c-tit03">{title}</p>
        <p className="c-txt-point">{highlight}</p>
        <p className="c-txt01">{description}</p>
      </div>
      <div className="performance-indicators-grid">
        {metrics.map((metric) => (
          <DonutGauge key={metric.label} {...metric} />
        ))}
      </div>
    </section>
  );
}
