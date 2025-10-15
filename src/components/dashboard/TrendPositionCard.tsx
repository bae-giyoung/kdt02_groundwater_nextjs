'use client';

import { useMemo } from "react";

type TrendMetric = {
    position: number | null;
    latestElev: number | null;
    latestYmd: string | null;
    minElev: number | null;
    maxElev: number | null;
};

interface TrendPositionCardProps {
    metric?: TrendMetric;
    stationName?: string | null;
    windowDays: number;
}

function formatElev(value: number | null | undefined) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
    }
    return Math.round(value * 1000) / 1000;
}

function formatYmd(ymd: string | null | undefined) {
    if (typeof ymd !== "string" || ymd.length !== 8) {
        return null;
    }
    return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

export default function TrendPositionCard({ metric, stationName, windowDays }: TrendPositionCardProps) {
    const summary = useMemo(() => {
        const fallbackName = stationName || "해당 관측소";
        const percent = metric?.position != null ? Math.round(metric.position * 100) : null;

        const latestValue = formatElev(metric?.latestElev);
        const minValue = formatElev(metric?.minElev);
        const maxValue = formatElev(metric?.maxElev);
        const latestYmd = formatYmd(metric?.latestYmd);

        const latestDisplay = (() => {
            if (latestValue && latestYmd) return `${latestValue} el.m (${latestYmd})`;
            if (latestValue) return `${latestValue} el.m`;
            if (latestYmd) return latestYmd;
            return "-";
        })();

        const rangeDisplay = (() => {
            const minText = minValue ? `${minValue} el.m` : null;
            const maxText = maxValue ? `${maxValue} el.m` : null;
            if (minText && maxText) return `${minText} ~ ${maxText}`;
            return minText || maxText || "-";
        })();

        if (percent === null) {
            return {
                valueText: "데이터 부족",
                arrow: "■",
                label: "데이터 부족",
                valueClass: "text-slate-400",
                message: `${fallbackName}의 최근 ${windowDays}일 자료가 부족해 상대 위치를 계산할 수 없습니다.`,
                latestDisplay,
                rangeDisplay,
            };
        }

        if (percent >= 66) {
            return {
                valueText: `${percent}%`,
                arrow: "▲",
                label: "상단 구간",
                valueClass: "text-rose-500",
                message: `${fallbackName}의 수위가 최근 ${windowDays}일 범위의 최고치에 가깝습니다.`,
                latestDisplay,
                rangeDisplay,
            };
        }

        if (percent <= 33) {
            return {
                valueText: `${percent}%`,
                arrow: "▼",
                label: "하단 구간",
                valueClass: "text-sky-500",
                message: `${fallbackName}의 수위가 최근 ${windowDays}일 범위의 최저치에 가깝습니다.`,
                latestDisplay,
                rangeDisplay,
            };
        }

        return {
            valueText: `${percent}%`,
            arrow: "▶",
            label: "중간 구간",
            valueClass: "text-amber-600",
            message: `${fallbackName}의 수위가 최근 ${windowDays}일 범위의 중간 수준입니다.`,
            latestDisplay,
            rangeDisplay,
        };
    }, [metric, stationName, windowDays]);

    return (
        <div>
            <p className="c-tit03 mb-2">
                <span className="c-txt-point">{stationName || "해당 관측소"}</span> 지하수위 현황 
                <span className="text-lg text-slate-600"> (최근 {windowDays}일 내 상대 위치)</span>
            </p>
            <div className="flex justify-between">
                <div className="flex items-baseline gap-3">
                    <span className={`text-4xl font-bold ${summary.valueClass}`}>{summary.valueText}</span>
                    <span className="text-base text-slate-600 font-bold">
                        {summary.arrow} {summary.label}
                    </span>
                </div>
                <div className="gauge-container w-full max-w-64">
                    <div className="gauge-bar">
                        <div className="gauge-fill animate-pulse fill-mode-none repeat-1" style={{maxWidth: Number.isFinite(parseInt(summary.valueText)) ? `${summary.valueText}` : 0, animation: 'gauge-animation 1s linear'}}></div>
                        <div className="gauge-marker" style={{left: Number.isFinite(parseInt(summary.valueText)) ? `${summary.valueText}` : 0 }}></div>
                    </div>
                </div>
            </div>
            <p className="c-txt02.inline mt-2 text-gray-600 border-b-2 border-slate-200 pb-2">{summary.message}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
                <div>
                    <dt className="font-bold text-gray-800">최신값</dt>
                    <dd>{summary.latestDisplay}</dd>
                </div>
                <div>
                    <dt className="font-bold text-gray-800">관측 구간</dt>
                    <dd>{summary.rangeDisplay}</dd>
                </div>
            </dl>
        </div>
    );
}
