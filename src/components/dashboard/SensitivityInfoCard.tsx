'use client';

import type { SensitivityRecord } from '@/types/uiTypes';
import SensitivityBadge from "./SensitivityBadge";

interface SensitivityInfoCardProps {
  sensitivityData: SensitivityRecord | null;
}

type DisplaySensitivityType = '강수민감형' | '가뭄취약형' | '복합형';

// API 데이터('강수형')를 UI 표시용 텍스트('강수민감형')로 변환
function mapSensitivityType(type: string | undefined): DisplaySensitivityType | undefined {
    if (type === '강수형') return '강수민감형';
    if (type === '가뭄형') return '가뭄취약형';
    if (type === '복합형') return '복합형';
    return undefined;
}

export default function SensitivityInfoCard({ sensitivityData }: SensitivityInfoCardProps) {
  
  const displayType = mapSensitivityType(sensitivityData?.sensitive_type);

  if (!sensitivityData) {
    return (
      <div className="d-sgroup flex items-center justify-center h-[150px]">
        <p className="text-slate-400">민감도 분석을 보려면 관측소를 선택하세요.</p>
      </div>
    );
  }

  const { increase_if_rainfall, decrease_if_drought } = sensitivityData;

  return (
    <div className="d-sgroup h-[150px] flex flex-col justify-between p-4">
      <div className="flex justify-between items-start">
        <p className="c-tit04">민감도 분석</p>
        {displayType && <SensitivityBadge type={displayType} />}
      </div>
      
      <div className="grid grid-cols-1 gap-y-1 text-sm">
        <div>
            <span className="font-semibold text-slate-600">강수 시 상승폭:</span>
            <span className="ml-2 font-bold text-base text-slate-800">{increase_if_rainfall.toFixed(4)}</span>
            <span className="text-slate-500"> m</span>
        </div>
        <div>
            <span className="font-semibold text-slate-600">가뭄 시 하강폭:</span>
            <span className="ml-2 font-bold text-base text-slate-800">{decrease_if_drought.toFixed(4)}</span>
            <span className="text-slate-500"> m</span>
        </div>
      </div>
    </div>
  );
}
