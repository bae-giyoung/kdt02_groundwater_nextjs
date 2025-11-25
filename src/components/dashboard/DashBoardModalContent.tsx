'use client';
import { useEffect, useMemo, useState } from "react";
import type { GenInfoKey } from "@/types/uiTypes";
import LineChartShadeZoom, { LineChartBackendResponse } from "./LineChartShadeZoom";
import ForecastSummaryPanel, { SummaryApiResponse } from "./ForecastSummaryPanel";
import WeatherGroundwaterTrendChart, { WeatherGroundwaterBackendResponse } from "./WeatherGroundwaterTrendChart";
import FeatureImportance from "./FeatureImportance";

// 타입 선언
type ModalTabKey = 'trend' | 'summary' | 'weather';

type DashboardModalContentProps = {
    station: GenInfoKey;
    stationId: string;
    stationName?: string;
    longTermUrl: string;
    weatherUrl: string;
};

type PrefetchKey = 'longTerm' | 'weather' | 'summary';

type RequestState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

// 함수
function createRequestState<T>(): RequestState<T> {
    return {
        data: null,
        loading: true,
        error: null,
    };
}


// 컴포넌트
export default function DashboardModalContent ({
    station,
    stationId,
    stationName,
    longTermUrl,
    weatherUrl,
}: DashboardModalContentProps) {
    const [activeTab, setActiveTab] = useState<ModalTabKey>('weather');
    const [reloadKey, setReloadKey] = useState(0);
    const [prefetchState, setPrefetchState] = useState(() => ({
        longTerm: createRequestState<LineChartBackendResponse>(),
        weather: createRequestState<WeatherGroundwaterBackendResponse>(),
        summary: createRequestState<SummaryApiResponse>(),
    }));

    const summaryUrl = useMemo(() => (
        `/java/api/v1/rawdata/summary/predict?station=${stationId}&timestep=monthly&horizons=36`
    ), [stationId]);
    
    const displayName = stationName || "해당 관측소";
    
    const tabs: Array<{ key: ModalTabKey; label: string }> = [
        { key: 'trend', label: '장기 추세' },
        { key: 'weather', label: '기상-예측 상관' },
        { key: 'summary', label: '예측 요약' },
    ];
    
    const handleReloadPrefetch = () => {
        setReloadKey((prev) => prev + 1);
    };

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const initialState = {
            longTerm: createRequestState<LineChartBackendResponse>(),
            weather: createRequestState<WeatherGroundwaterBackendResponse>(),
            summary: createRequestState<SummaryApiResponse>(),
        };

        setPrefetchState(initialState);

        const fetchJson = async <T,>(url: string): Promise<T> => {
            const resp = await fetch(url, {
                headers: { "Content-type": "application/json" },
                method: "GET",
                mode: "cors",
                signal: controller.signal,
            });
            if (!resp.ok) {
                throw new Error(`요청 실패 (${resp.status})`);
            }
            return resp.json() as Promise<T>;
        };

        const updateState = <T,>(key: PrefetchKey, next: Partial<RequestState<T>>) => {
            setPrefetchState((prev) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    ...next,
                },
            }) as typeof prev);
        };

        const startFetch = <T,>(key: PrefetchKey, fetcher: () => Promise<T>) => {
            fetcher()
                .then((data) => {
                    if (!mounted) {
                        return;
                    }
                    updateState<T>(key, { data, loading: false, error: null });
                })
                .catch((error) => {
                    if (!mounted) {
                        return;
                    }
                    if (error instanceof DOMException && error.name === 'AbortError') {
                        return;
                    }
                    const message = error instanceof Error ? error.message : '데이터 요청 중 오류가 발생했습니다.';
                    updateState<T>(key, { data: null, loading: false, error: message });
                });
        };

        startFetch('longTerm', () => fetchJson<LineChartBackendResponse>(longTermUrl));
        startFetch('weather', () => fetchJson<WeatherGroundwaterBackendResponse>(weatherUrl));
        startFetch('summary', () => fetchJson<SummaryApiResponse>(summaryUrl));

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [longTermUrl, summaryUrl, weatherUrl, reloadKey]);

    const renderInfoBlock = (message: string) => (
        <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-md">
            <p className="c-txt03 text-gray-600">{message}</p>
        </div>
    );

    const renderErrorBlock = (message: string) => (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md flex flex-col gap-4 items-center">
            <p className="c-txt03 text-red-600">{message}</p>
            <button type="button" className="btn-style-4 px-4 py-2" onClick={handleReloadPrefetch}>
                다시 시도
            </button>
        </div>
    );

    const renderTrendPanel = () => {
        const state = prefetchState.longTerm;
        if (state.loading) { // 로직 컴포넌트 안에서 수행하게 바꾸기
            return (
            <div className="chart-box w-full">
                <div className='relative'>
                    <div className="flex justify-center items-center h-[450px] w-full bg-gray-100 rounded mb-3 animate-pulse">
                        {renderInfoBlock('장기 수위 데이터를 불러오는 중입니다...')}
                    </div>
                </div>
            </div>
            );
        }
        if (state.error) {
            return renderErrorBlock(`장기 수위 데이터 요청 실패: ${state.error}`);
        }
        if (!state.data) {
            return renderInfoBlock('표시할 데이터가 없습니다.');
        }
        return (
            <LineChartShadeZoom
                baseUrl={longTermUrl}
                chartTitle="장기 추세 그래프(2014 ~ 2023)"
                prefetchedData={state.data}
            />
        );
    };

    const renderWeatherPanel = () => {
        const state = prefetchState.weather;
        if (state.loading) {
            return (
            <div className="chart-box mt-6 w-full">
                <div className='relative'>
                    <div className="flex justify-center items-center h-[450px] w-full bg-gray-100 rounded mb-3 animate-pulse">
                        {renderInfoBlock('기상-수위 데이터를 불러오는 중입니다...')}
                    </div>
                </div>
            </div>
            );;
        }
        if (state.error) {
            return renderErrorBlock(`기상-예측 데이터 요청 실패: ${state.error}`);
        }
        if (!state.data) {
            return renderInfoBlock('표시할 데이터가 없습니다.');
        }
        return (
            <div className="flex gap-6 lg:flex-row flex-col">
                <div className="w-full lg:w-2/3">
                    <WeatherGroundwaterTrendChart
                        baseUrl={weatherUrl}
                        chartTitle="기상-예측 수위 그래프"
                        prefetchedData={state.data}
                    />
                </div>
                <div className="w-full lg:w-1/3 d-group">
                    <FeatureImportance stationCode={station} />
                </div>
            </div>
        );
    };

    const renderSummaryPanel = () => {
        const state = prefetchState.summary;
        if (state.loading) { // 로딩 중
            return renderInfoBlock('성과 요약 데이터를 불러오는 중입니다...');
        }
        if (state.error) {
            return renderErrorBlock(`성과 요약 데이터 요청 실패: ${state.error}`);
        }
        if (!state.data) {
            return renderInfoBlock('표시할 데이터가 없습니다.');
        }
        return (
            <ForecastSummaryPanel
                station={`${stationId}`}
                stationName={stationName}
                prefetchedData={state.data}
            />
        );
    };

    return (
        <div className="w-full d-group flex flex-col gap-8 lg:flex-row" id="dashboard-station-modal">
            <div className="w-full flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {tabs.map(({ key, label }) => {
                        const isActive = activeTab === key;
                        const buttonClass = [
                            "modal-tab-button",
                            "font-medium",
                            "transition-all",
                            isActive ? "modal-tab-button-active" : "modal-tab-button-inactive",
                        ].join(" ");

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={buttonClass}
                                aria-pressed={isActive}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                {activeTab === 'trend' && (
                    <div className="w-full d-group space-y-4">
                        <div className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <p className="c-tit03">
                                <span className="c-txt-point">{displayName}</span> 지하수위 장기 추세 및 예측 수위 (2014 ~ 2023)
                            </p>
                            <span className="gray-92 c-txt03">10년간 월별 평균 지하수위 추이(단위: el.m)</span>
                        </div>
                        {renderTrendPanel()}
                    </div>
                )}
                {activeTab === 'summary' && renderSummaryPanel()}
                {activeTab === 'weather' && (
                    <div className="w-full d-group space-y-4">
                        <p className="c-tit03">
                            <span className="c-txt-point">{displayName}</span> 기상-예측 수위 시각화
                        </p>
                        {renderWeatherPanel()}
                    </div>
                )}
            </div>
        </div>
    );
};
