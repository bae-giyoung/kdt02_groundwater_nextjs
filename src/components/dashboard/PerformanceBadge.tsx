'use client';

// 타입 선언
type BadgeGrade = 'excellent' | 'good' | 'warning';

interface PerformanceBadgeProps {
    value: number,
    label: string
}

// 상수 선언
const BADGE_THEME: Record<BadgeGrade, string> = {
    excellent: 'badge-rank main',
    good: 'badge-rank green',
    warning: 'badge-rank yellow',
}

const GRADE_NAME: Record<BadgeGrade, string> = {
    excellent: '최고',
    good: '좋음',
    warning: '보통',
}

function getBadgeGrade(value: number): BadgeGrade {
    if (value >= 0.95)  return 'excellent';
    if (value >= 0.80) return 'good';
    return 'warning';
}

export default function PerformanceBadge({
    value,
    label,
} : PerformanceBadgeProps
) {
    const grade = getBadgeGrade(value);
    const gradeName = GRADE_NAME[grade];
    const theme = BADGE_THEME[grade];

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full border font-semibold shadow-sm transition ${theme}`}>
                {label}
            </span>
            <span className="text-xs font-medium text-slate-500">{gradeName}</span>
        </div>
    );
}