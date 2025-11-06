'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiaExclamationCircleSolid } from "react-icons/lia";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidQuageModule from 'highcharts/modules/solid-gauge';

// Highcharts 모듈 임포트: 클라이언트에서 한번만 실행
if (typeof window !== 'undefined') {
  const win = window as typeof window & { 
    Highcharts?: typeof Highcharts; 
    _Highcharts?: typeof Highcharts; 
    _solidGaugeLoaded?: boolean;
  };

  win.Highcharts = win.Highcharts || Highcharts;
  win._Highcharts = win._Highcharts || Highcharts;

  if(!win._solidGaugeLoaded) {
    if (!(Highcharts as any).seriesTypes.gauge) {
      (HighchartsMore as unknown as (H: typeof Highcharts) => void)(Highcharts);
    }

    if (!(Highcharts as any).seriesTypes.solidgauge) {
      (SolidQuageModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    }
    win._solidGaugeLoaded = true;
  }
}

// 타입 선언
type GaugeGrade = 'excellent' | 'good' | 'warning';
interface ExclamationInfo {
  title: string;
  description: string;
}

interface DonutGaugeProps {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  exclamation?: ExclamationInfo;
}

// 컬러
const BADGE_THEME: Record<GaugeGrade, Array<number | string>[]> = {
    excellent: [[0, '#1e88e5'], [1, '#B3E5FC55']],
    good: [[0, '#80CBC4'], [1, '#80CBC455']],
    warning: [[0, '#FFB74D'], [1, '#ffcc8074']], //#fb8c00
}

function getGaugeGrade(value: number, label: string): GaugeGrade {
    if (value >= 0.95)  return 'excellent';
    if (value >= 0.80) return 'good';
    return 'warning';
}

// 렌더링
export default function DonutGauge({
  label,
  value,
  max = 1,
  suffix = '',
  exclamation,
}: DonutGaugeProps) {
  const modalId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const guageGrade = getGaugeGrade(value, label);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 모달창
  const modalPortal =
    isMounted && exclamation && isOpen
      ? createPortal(
          <div className="donut-modal" role="dialog" aria-modal="true" aria-labelledby={`modal-${modalId}`}>
            <div className="donut-modal-backdrop" onClick={() => setIsOpen(false)} />
            <div className="donut-modal-content">
              <div className="donut-modal-header">
                <h3 id={modalId}>{exclamation.title}</h3>
                <button
                  type="button"
                  className="donut-modal-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="설명 닫기"
                >
                  <span>닫기</span>
                </button>
              </div>
              <p className="donut-modal-body">{exclamation.description}</p>
            </div>
          </div>,
          document.body
        )
      : null;


  // 차트 옵션
  const options = useMemo(() => {
    return {
      chart: {
        type: 'solidgauge', 
        backgroundColor: 'transparent',
        height: 100,
      },
      title: {
        text: undefined,
      },
      tooltip: {
        enabled: true,
      },
      credits: {
        enabled: false,
      },
      pane: {
        startAngle: -135,
        endAngle: 135,
        background: {
          outerRadius: '120%',
          innerRadius: '90%',
          shape: 'arc',
          borderWidth: 0,
          borderColor: '#efefef',
          backgroundColor: '#efefef', // 트랙
        },
      },
      yAxis: {
        min: 0,
        max: 1,
        lineWidth: 0,
        tickPositions: [],
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: false,
            useHTML: true,
            borderWidth: 0,
            y: -15,
            align: 'center',
          },
          linecap: 'round',
          stickyTracking: false,
          rounded: true,
        },
      },
      exporting: {
        enabled: false,
      },
      series: [
        {
          type: 'solidgauge',
          name: label,
          data: [
            {
              y: Math.floor(value*1000)/1000,
              radius: '120%',
              innerRadius: '90%',
              color: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1,
                },
                stops: BADGE_THEME[guageGrade],
              },
            }
          ],
          tooltip: {
            enabled: true,
            valueSuffix: suffix,
          },
        },
      ],
    }
  }, [label, value, exclamation, max, suffix]);

  return (
    <div className="donut-card">
      <div className="donut-card-header text-cener">
        <span className="donut-card-label">{label}</span>
        {exclamation && (
          <button type="button" className="exclamation-icon" aria-label={`${label} 지표 설명 열기`} onClick={() => setIsOpen(true)}>
            <LiaExclamationCircleSolid color="#222" size={40} />
          </button>
        )}
      </div>
      <div className="donut-card-chart">
        <div className="donut-card-value">
          <span>{Math.floor(value*100)/100}</span>
          {suffix && <span className="donut-card-suffix">{suffix}</span>}
        </div>
        <HighchartsReact 
          highcharts={Highcharts} 
          options={options} 
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
      {modalPortal}
    </div>
  );
}