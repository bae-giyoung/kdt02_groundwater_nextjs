'use client';

import Image from 'next/image';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

interface ExclamationInfo {
  title: string;
  description: string;
}

interface DonutGaugeProps {
  label: string;
  value: number;
  exclamation?: ExclamationInfo;
  suffix?: string;
  gradient?: {
    from: string;
    to: string;
  };
}

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_ANGLE = 60; // degrees
const GAP_LENGTH = (CIRCUMFERENCE * GAP_ANGLE) / 360;
const AVAILABLE_LENGTH = CIRCUMFERENCE - GAP_LENGTH;
const DASH_OFFSET = GAP_LENGTH / 2;

export default function DonutGauge({
  label,
  value,
  exclamation,
  suffix = '',
  gradient = { from: '#CDEAF8', to: '#6EC1E4' },
}: DonutGaugeProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const fillLength = AVAILABLE_LENGTH * clamped;
  const gradientId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modal = mounted && exclamation && open
    ? createPortal(
        <div className="donut-modal" role="dialog" aria-modal="true" aria-labelledby={`modal-${gradientId}`}>
          <div className="donut-modal-backdrop" onClick={() => setOpen(false)} />
          <div className="donut-modal-content">
            <div className="donut-modal-header">
              <p id={`modal-${gradientId}`}>{exclamation.title}</p>
              <button type="button" className="donut-modal-close" onClick={() => setOpen(false)} aria-label="설명 닫기">
                <span>모달창 닫기</span>
              </button>
            </div>
            <p className="donut-modal-body">{exclamation.description}</p>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="donut-card">
      <div className="donut-card-header">
        <span className="donut-card-label">{label}</span>
        {exclamation && (
          <button
            type="button"
            className="exclamation-icon"
            aria-label={`${label} 지표 설명 열기`}
            onClick={() => setOpen(true)}
          >
            <Image src="assets/icon_exclamation.svg" width={26} height={26} alt="" />
          </button>
        )}
      </div>
      <div className="donut-card-chart">
        <svg className="donut-gauge" viewBox="0 0 140 140" role="img" aria-label={`${label} ${value}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
          </defs>

          <g transform="translate(70 70)">
            <circle
              className="donut-gauge-track"
              r={RADIUS}
              fill="none"
              stroke="#E6EBF0"
              strokeWidth="14"
              strokeDasharray={`${AVAILABLE_LENGTH} ${GAP_LENGTH}`}
              strokeDashoffset={DASH_OFFSET}
              strokeLinecap="round"
            />
            <circle
              className="donut-gauge-fill"
              r={RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="14"
              strokeDasharray={`${fillLength} ${CIRCUMFERENCE - fillLength}`}
              strokeDashoffset={DASH_OFFSET}
              strokeLinecap="round"
            />
          </g>
        </svg>
        <div className="donut-card-value">
          <span>{clamped.toFixed(2)}</span>
          {suffix && <span className="donut-card-suffix">{suffix}</span>}
        </div>
      </div>
      {modal}
    </div>
  );
}
