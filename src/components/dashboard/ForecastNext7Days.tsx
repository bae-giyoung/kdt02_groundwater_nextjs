'use client';
import { useMemo, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// 타입 선언
type DailyObs = {
    date: string,
    elev: number,
}

type StationObsPayload = {
    station: string;
    stationName: string;
    observed: DailyObs[];
    sourceNote: string;
}

type ForecastPoint = {
    date: string;
    predicted: number;
    lo_m: number;
    hi_m: number;
}

type Next7Forecast = {
    station: string;
    latestObserved: DailyObs;
    forecast: ForecastPoint[];
    summary: {
        day7: {predicted: number, delta_m: number};
        range_m: number;
        trend: 'up' | 'down' | 'flat';
        generatedAt: string;
    }
    note: string;
}

// 목업 데이터
function buildMockForecast(p: StationObsPayload): Next7Forecast {
    const obs = [...p.observed].slice(-3);
    const latest = obs[obs.length - 1];

    // 선형 추세 흉내(일간 기울기)
    let slope = 0;
    if(obs.length >= 2) {
        const l = obs.length;
        const dy = obs[l - 1].elev - obs[l - 2].elev;
        slope = dy; // 1일간 변화량, 나중에는 l일변화량 / (l - 1)
    }

    // 7일 예측
    const start = new Date(latest.date);
    const band = 0.06; // 신뢰 밴드 흉내, 나중에 모델개발 파트와 논의.
    const forecast: ForecastPoint[] = Array.from({length: 7}, (_, i) => { // 7번 반복
        const d = new Date(start);
        d.setDate(d.getDate() + (i + 1));
        const pred = latest.elev + slope * (i + 1);
        return {
            date: d.toISOString().slice(0, 10),
            predicted: Number(pred.toFixed(3)),
            lo_m: Number((pred - band).toFixed(3)),
            hi_m: Number((pred + band).toFixed(3)),
        }
    });
    
    const day7 = forecast[6];
    const delta = Number((day7.predicted - latest.elev).toFixed(3)); // 7일 변화량
    const range = Number(Math.max(...forecast.map(f => f.predicted)) - Math.min(...forecast.map(f => f.predicted))).toFixed(3);
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

    return {
        station: p.station,
        latestObserved: latest,
        forecast,
        summary: {
            day7: {predicted: day7.predicted, delta_m: delta},
            range_m: Number(range),
            trend,
            generatedAt: new Date().toISOString(),
        },
        note: `${p.sourceNote}`,
    };
}

// 목업 데이터용 로딩 흉내내기: 나중에
function fetchMockStationObs(station: string, stationName: string): Promise<StationObsPayload> {
    const baseElev = 105.72; // 목업용
    const today = new Date();
    const observed: DailyObs[] = [-2, -1, 0].map(off => { // 2일 전~오늘, 3일치
        const d = new Date(today);
        d.setDate(d.getDate() + off);

        // 변동 흉내
        const level = baseElev + off * 0.02; // 하루에 0.02m 변동
        return {
            date: d.toISOString().slice(0, 10),
            elev: Number(level.toFixed(3)),
        }
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                station,
                stationName,
                observed,
                sourceNote: '데이터 출처: 국가지하수정보센터, 「국가지하수측정자료조회서비스 (일자료)」, AI 모델 예측 데이터',
            });
        }, 1000);
    });
}

// 설정
function trendLabel(t: 'up' | 'down' | 'flat') {
    return t === 'up' ? '상승' : t === 'down' ? '하락' : '보합';
}

function trendColor(t: 'up' | 'down' | 'flat') {
    return t === 'up' ? '#ffaf5f' : t === 'down' ? '#4fa3d1' : '#66c7bf';
}

export default function ForecastNext7Days({
    station = '5724',
    stationName = '남원도통'
} : {
    station?: string;
    stationName?: string;
}) {
    const [forecastData, setForecastData] = useState<Next7Forecast>({} as any);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // 지연 로딩, 목업용 fetch
    useEffect(() => {
        let alive = true;
        setLoading(true);
        fetchMockStationObs(station, stationName)
            .then(payload => alive && setForecastData(buildMockForecast(payload)))
            .catch(err => alive && setError(err.message))
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        }
    }, [station, stationName]);

    // props로 주입받는 방식으로 바꾸는 것이 좋을까?
    const options = useMemo<Highcharts.Options>(() => {
        if(!forecastData) return {};
        const categories = forecastData.forecast?.map(f => f.date.slice(5)); // 'MM-DD'
        const pred = forecastData.forecast?.map(f => f.predicted);
        const lo = forecastData.forecast?.map(f => f.lo_m);
        const hi = forecastData.forecast?.map(f => f.hi_m);

        return {
            chart: {
                //type: 'line',
                height: 160,
                spacing: [8, 8, 8, 8]
            },
            title: {
                text: ''
            },
            xAxis: {
                categories,
                tickLength: 0,
                labels: {
                    style: {
                        fontSize: '11px',
                    }
                },
            },
            yAxis: {
                title: {
                    text: '수위(m)',
                },
                gridLineWidth: 0,
                labels: {
                    style: {
                        fontSize: '11px',
                    }
                },
            },
            legend: {
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
            },
            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.3f}</b><br/>',
            },
            credits: {
                enabled: false,
            },
            exporting: {
                enabled: true,
                filename: stationName + '_향후_7일_예측',
                buttons: {
                    contextButton: {
                        theme: {
                            stroke: "#ccc",
                            "stroke-width": 1.5,
                            fill: "#ffffff",
                        },
                        menuItems: [
                            'viewFullscreen',
                            'downloadPNG',
                            'downloadJPEG',
                            'downloadPDF',
                            'downloadSVG',
                            'downloadCSV',
                            'downloadXLS',
                        ],
                        symbol: 'menu',
                        align: 'right',
                        x: 0,
                        y: 0,
                    }
                }
            },
            series: [
                {
                    type: 'arearange',
                    name: '신뢰구간',
                    data: lo?.map((l, i) => [i, l, hi[i]]), // [[인덱스, 저, 고],[요소3개],...],
                    color: '#bcecf3',
                    fillOpacity: 0.3,
                    lineWidth: 0,
                    zIndex: 0,
                },
                {
                    type: 'line',
                    name: '예측',
                    data: pred?.map((p, i) => [categories[i], p]), // (v, i) => [i, v]
                    color: '#66c7bf',
                    lineWidth: 2,
                    zIndex: 3,
                    marker: {
                        enabled: false,
                    }
                }
            ]
        }
    }, [forecastData]);

    if (error) {
        return (
            <div className="rounded-2xl p-4 bg-white/60 shadow">
                <div className="c-tit03">지하수위 향후 7일 예측</div>
                <div className="text-red-600 text-sm">로드 실패: {error}</div>
            </div>
        );
    }

    if (loading || !forecastData) {
        return (
            <div className="rounded-2xl p-4 bg-white/60 shadow">
                <div className="c-tit03">지하수위 향후 7일 예측</div>
                {/* 스켈레톤 */}
                <div className="h-4 w-48 bg-gray-200/60 rounded mb-2 animate-pulse" />
                <div className="h-4 w-64 bg-gray-200/60 rounded mb-4 animate-pulse" />
                <div className="h-[160px] w-full bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    const trend = trendLabel(forecastData.summary.trend);


    return (
        <div id="forecast-7days-container">
            <div className="flex items-end justify-between">
                <div className="c-tit03">향후 7일 지하수위 예측</div>
                <span className="text-xs text-gray-500">단위: m</span>
            </div>

            <div className="text-sm text-gray-700 mb-1">
                최신 관측: <b>{forecastData.latestObserved.elev.toFixed(2)} m</b> ({forecastData.latestObserved.date})
            </div>
            <div className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                7일 후 예측: <b>{forecastData.summary.day7.predicted.toFixed(2)} m</b>
                <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: trendColor(forecastData.summary.trend), color: '#fff' }}
                aria-label={`7일 후 ${trend} ${forecastData.summary.day7.delta_m.toFixed(2)}미터`}
                >
                {forecastData.summary.day7.delta_m >= 0 ? '▲' : '▼'} {forecastData.summary.day7.delta_m.toFixed(2)}
                </span>
            </div>

            {/* 미니 차트 */}
            <div className="mb-3">
                {Highcharts && HighchartsReact && (
                <HighchartsReact highcharts={Highcharts} options={options} />
                )}
            </div>

            {/* 작은 KPI 배지 */}
            <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-[#c9f4e6] text-[#063a46]">
                예상 변동폭 {forecastData.summary.range_m.toFixed(2)} m
                </span>
                <span className="px-2 py-1 rounded-full bg-[#ffe1b8] text-[#412200]">
                {trend} 추세
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                예측 7포인트
                </span>
            </div>

            <div className="mt-3 text-[11px] text-gray-500">
                업데이트: {new Date(forecastData.summary.generatedAt).toLocaleString('ko-KR')}
                <span className="mx-2">•</span>
                {forecastData.note}
            </div>
        </div>
    );
}