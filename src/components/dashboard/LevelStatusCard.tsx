'use client';

import { useMemo } from 'react';
import type { StatusPoint } from '@/types/uiTypes';

interface LevelStatusCardProps {
  statusData: StatusPoint | null;
}

type LevelStatus = '매우 높음' | '높음' | '보통' | '낮음' | '매우 낮음';

const STATUS_THEME: Record<LevelStatus, string> = {
    '매우 높음': 'text-red-500',
    '높음': 'text-orange-500',
    '보통': 'text-green-500',
    '낮음': 'text-sky-500',
    '매우 낮음': 'text-blue-600',
};

function getLevelStatus(value: number, percentiles: StatusPoint['percentiles']): LevelStatus {
    const { p10, p25, p75, p90 } = percentiles;
    if (value > p90) return '매우 높음';
    if (value > p75) return '높음';
    if (value >= p25) return '보통';
    if (value >= p10) return '낮음';
    return '매우 낮음';
}

export default function LevelStatusCard({ statusData }: LevelStatusCardProps) {
  const status = useMemo(() => {
    if (!statusData?.value || !statusData?.percentiles) return null;
    return getLevelStatus(statusData.value, statusData.percentiles);
  }, [statusData]);

  if (!statusData) {
    return (
      <div className="d-sgroup flex items-center justify-center h-[150px]">
        <p className="text-slate-400">지하수위 현황을 보려면 관측소를 선택하세요.</p>
      </div>
    );
  }

  const { value, minElev, maxElev, percentiles } = statusData;

  return (
    <div className="d-sgroup h-[150px] flex flex-col justify-between p-4">
      <div className="flex justify-between items-start">
        <p className="c-tit04">지하수위 현황</p>
        {status && <span className={`font-bold text-lg ${STATUS_THEME[status]}`}>{status}</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className='col-span-2'>
            <span className="font-semibold text-slate-600">최신 수위:</span>
            <span className="ml-2 font-bold text-base text-slate-800">{value.toFixed(2)}</span>
            <span className="text-slate-500"> m</span>
        </div>
        <div>
            <span className="font-semibold text-slate-600">30일 관측:</span>
            <span className="ml-2 text-slate-800">{minElev?.toFixed(2)} ~ {maxElev?.toFixed(2)} m</span>
        </div>
        <div>
            <span className="font-semibold text-slate-600">동월 정상:</span>
            <span className="ml-2 text-slate-800">{percentiles.p25.toFixed(2)} ~ {percentiles.p75.toFixed(2)} m</span>
        </div>
      </div>
    </div>
  );
}
