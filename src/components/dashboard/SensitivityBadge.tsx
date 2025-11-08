'use client';

// 타입 선언
type SensitivityType = '강수민감형' | '가뭄취약형' | '복합형';

interface SensitivityBadgeProps {
    type: SensitivityType;
}

// 테마 정의
const BADGE_THEME: Record<SensitivityType, string> = {
    '강수민감형': 'border-blue-300 bg-blue-50 text-blue-600',
    '가뭄취약형': 'border-pink-300 bg-pink-50 text-pink-600',
    '복합형': 'border-amber-300 bg-amber-50 text-amber-600',
}

export default function SensitivityBadge({ type } : SensitivityBadgeProps) {
    const theme = BADGE_THEME[type];

    return (
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-semibold transition ${theme}`}>
            {type}
        </span>
    );
}
