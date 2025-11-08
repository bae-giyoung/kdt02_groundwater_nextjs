'use client';

import { useMemo, type ReactNode } from 'react';
import genInfo from '@/data/gennumInfo.json';
import type { GenInfoKey, SensitivityRecord, StatusPoint } from '@/types/uiTypes';
import { FiMapPin, FiCompass, FiDroplet, FiTrendingUp, FiActivity } from 'react-icons/fi';

type StationInfoCardProps = {
    stationCode: GenInfoKey;
    stationName?: string;
    statusData?: StatusPoint | null;
    sensitivityData?: SensitivityRecord | null;
    children?: ReactNode;
};

type StationRecord = (typeof genInfo)[GenInfoKey];

type LevelStatus = '매우 높음' | '높음' | '보통' | '낮음' | '매우 낮음';
type SensitivityDisplayType = '강수 민감형' | '가뭄 취약형' | '복합 민감형';

const LEVEL_STATUS_THEME: Record<LevelStatus, string> = {
    '매우 높음': 'border border-[#E57373]/50 bg-[#E57373]/15 text-[#E57373]',
    '높음': 'border border-[#FFB74D]/60 bg-[#FFB74D]/20 text-[#D97706]',
    '보통': 'border border-[#4DB6AC]/60 bg-[#4DB6AC]/20 text-[#0F766E]',
    '낮음': 'border border-[#4DB6AC]/40 bg-[#4DB6AC]/15 text-[#0D9488]',
    '매우 낮음': 'border border-[#4DB6AC]/25 bg-[#4DB6AC]/10 text-[#0F766E]',
};

const SENSITIVITY_THEME: Record<SensitivityDisplayType, string> = {
    '강수 민감형': 'border border-[#4A90E2]/50 bg-[#4A90E2]/15 text-[#1D4ED8]',
    '가뭄 취약형': 'border border-[#E94E77]/40 bg-[#E94E77]/15 text-[#BE185D]',
    '복합 민감형': 'border border-[#FFB74D]/60 bg-[#FFB74D]/20 text-[#D97706]',
};

const formatCoordinate = (value?: string, digits = 5) => {
    if (!value) return '-';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(digits) : value;
};

const formatNumber = (value?: string | number | null, digits = 2) => {
    if (value == null) return '-';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(digits) : typeof value === 'string' ? value : '-';
};

const formatDate = (value?: string) => {
    if (!value) return '-';
    const numeric = value.replace(/\D/g, '');
    if (numeric.length === 8) return `${numeric.slice(0, 4)}-${numeric.slice(4, 6)}-${numeric.slice(6, 8)}`;
    if (numeric.length === 6) return `${numeric.slice(0, 4)}-${numeric.slice(4, 6)}`;
    return value;
};

const getLevelStatus = (value: number, percentiles: StatusPoint['percentiles']): LevelStatus => {
    const { p10, p25, p75, p90 } = percentiles;
    if (value > p90) return '매우 높음';
    if (value > p75) return '높음';
    if (value >= p25) return '보통';
    if (value >= p10) return '낮음';
    return '매우 낮음';
};

const mapSensitivityType = (type?: string): SensitivityDisplayType | undefined => {
    if (type === '강수형') return '강수 민감형';
    if (type === '가뭄형') return '가뭄 취약형';
    if (type === '복합형') return '복합 민감형';
    return undefined;
};

export default function StationInfoCard({
    stationCode,
    stationName,
    statusData,
    sensitivityData,
    children,
}: StationInfoCardProps) {
    const station: StationRecord | undefined = genInfo[stationCode];
    const fallbackName = stationName || '해당 관측소';

    if (!station) {
        return (
            <div className="station-info-card d-group border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                선택한 관측소 정보를 불러올 수 없습니다.
            </div>
        );
    }

    const displayName = station['측정망명'] || fallbackName;
    const regionBadges = [station['대권역'], station['중권역']].filter(Boolean);

    const levelSummary = useMemo(() => {
        if (!statusData || typeof statusData.value !== 'number' || !statusData.percentiles) {
            return null;
        }
        const statusLabel = getLevelStatus(statusData.value, statusData.percentiles);
        return {
            statusLabel,
            badgeClass: LEVEL_STATUS_THEME[statusLabel],
            latestValue: `${statusData.value.toFixed(2)} m`,
            rangeText:
                statusData.minElev != null && statusData.maxElev != null
                    ? `${statusData.minElev.toFixed(2)} ~ ${statusData.maxElev.toFixed(2)} m`
                    : '-',
            percentileText: `${statusData.percentiles.p25.toFixed(2)} ~ ${statusData.percentiles.p75.toFixed(2)} m`,
        };
    }, [statusData]);

    const sensitivitySummary = useMemo(() => {
        if (!sensitivityData) {
            return null;
        }
        const type = mapSensitivityType(sensitivityData.sensitive_type);
        return {
            type,
            badgeClass: type ? SENSITIVITY_THEME[type] : undefined,
            increase: `${sensitivityData.increase_if_rainfall.toFixed(4)} m`,
            decrease: `${sensitivityData.decrease_if_drought.toFixed(4)} m`,
            variation: sensitivityData.range_variation?.toFixed(4),
        };
    }, [sensitivityData]);

    return (
        <section className="d-group station-info-card w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                <span className="c-tit03"><b className="c-txt-point">{displayName}</b> 관측소 정보</span>
                <div className="flex flex-col items-start gap-2 text-sm text-black/90 md:items-end">
                    {/* <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                        <FiCompass className="text-lg" />
                        {station['종류'] ?? '-'}
                    </span> */}
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                        {regionBadges.length ? (
                            regionBadges.map((badge) => (
                                <span
                                    key={badge}
                                    className="rounded-full border border-blue-700/40 bg-blue-400/10 px-2.5 py-0.5"
                                >
                                    {badge}
                                </span>
                            ))
                        ) : (
                            <span className="rounded-full border border-blue-700/40 bg-blue-400/10 px-2.5 py-0.5">
                                지역 정보 없음
                            </span>
                        )}
                    </div>
                </div>
            </p>

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <FiMapPin className="text-lg text-sky-500" />
                            <p className="text-sm font-semibold text-slate-700">위치 정보</p>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <p className="font-medium text-slate-900">{station['주소'] ?? '-'}</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500">위도 (lat)</p>
                                    <p className="font-semibold text-slate-800">{formatCoordinate(station.lat)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">경도 (lon)</p>
                                    <p className="font-semibold text-slate-800">{formatCoordinate(station.lon)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <FiDroplet className="text-lg text-emerald-500" />
                            <p className="text-sm font-semibold text-slate-700">지층 특성</p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-slate-500">설치일</p>
                                <p className="font-semibold text-slate-800">{formatDate(station['설치년도'])}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">설치심도 (m)</p>
                                <p className="font-semibold text-slate-800">{formatNumber(station['설치심도'], 1)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">표고 (EL.m)</p>
                                <p className="font-semibold text-slate-800">{formatNumber(station['표고(EL.m)'], 2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">수리전도도 (cm/sec)</p>
                                <p className="font-semibold text-slate-800">{station['수리전도도(cm/sec)'] ?? '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700">
                                <FiTrendingUp className="text-lg text-amber-500" />
                                <p className="text-sm font-semibold">지하수 상태</p>
                            </div>
                            {levelSummary ? (
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelSummary.badgeClass}`}>
                                    {levelSummary.statusLabel}
                                </span>
                            ) : (
                                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                                    데이터 없음
                                </span>
                            )}
                        </div>
                        {levelSummary ? (
                            <div className="mt-4 space-y-2 text-sm text-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">최신 수위</span>
                                    <span className="font-semibold text-slate-900">{levelSummary.latestValue}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                                    <span className="text-slate-500">30일 관측 범위</span>
                                    <span className="font-semibold text-slate-900">{levelSummary.rangeText}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                                    <span className="text-slate-500">이달 정상 범위</span>
                                    <span className="font-semibold text-slate-900">{levelSummary.percentileText}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-500">최근 지하수 상태 데이터를 불러올 수 없습니다.</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700">
                                <FiActivity className="text-lg text-violet-500" />
                                <p className="text-sm font-semibold">민감도 분석</p>
                            </div>
                            {sensitivitySummary?.type ? (
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sensitivitySummary.badgeClass}`}>
                                    {sensitivitySummary.type}
                                </span>
                            ) : (
                                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                                    데이터 없음
                                </span>
                            )}
                        </div>
                        {sensitivitySummary ? (
                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">강수 시 상승폭</span>
                                    <span className="font-semibold text-slate-900">{sensitivitySummary.increase}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                                    <span className="text-slate-500">가뭄 시 하강폭</span>
                                    <span className="font-semibold text-slate-900">{sensitivitySummary.decrease}</span>
                                </div>
                                {sensitivitySummary.variation && (
                                    <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                                        <span className="text-slate-500">변동 폭</span>
                                        <span className="font-semibold text-slate-900">{sensitivitySummary.variation} m</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-500">민감도 분석 데이터가 아직 준비되지 않았습니다.</p>
                        )}
                    </div>
                </div>

                {children}
            </div>
        </section>
    );
}
