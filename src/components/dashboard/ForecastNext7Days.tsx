'use client';
import { useMemo, useEffect, useState } from 'react';
import genInfo from "@/data/gennum_info.json";
import type { GenInfoKey } from '@/types/uiTypes';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { userInfoAtom } from '@/atoms/atoms';


//** 상수 선언  */
const GEN_CODES = Object.keys(genInfo);

// 타입 선언
type ForecastPoint = {
    datetime: string;
    predicted_elev: number;
    lower_approx: number;
    upper_approx: number;
}

type ForecastResponse = {
    station: number;
    num_predictions: number;
    latest_elev: number;
    predicted_values: ForecastPoint[];
}

type Next7Forecast = {
    station: string;
    latestObserved: {observed_elev: number, datetime: string};
    forecast: ForecastPoint[];
    summary: {
        day7: {predicted: number, delta_m: number};
        range_m: number;
        trend: 'up' | 'down' | 'flat';
        generatedAt: string;
    }
    note: string;
}

// 렌더링 설정
function trendLabel(t: 'up' | 'down' | 'flat') {
    return t === 'up' ? '상승' : t === 'down' ? '하락' : '보합';
}

function trendColor(t: 'up' | 'down' | 'flat') {
    return t === 'up' ? '#ffaf5f' : t === 'down' ? '#4fa3d1' : '#66c7bf';
}

// 예측 데이터 받아오기
async function fetchForecast(station: string) {
    const response = await fetch(`/ml/api/v1/model/forecast?station=${station}`, { // 개발중: 나중에 url 반드시 숨겨야함!
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    // 실패 시
    if(!response.ok) { // 상태코드별로 다 분기 나중에.. - ml에 명세서대로 해달라고 전달하기. 404, 500
        const error = new Error('AI 모델이 예측에 실패했습니다.');
        (error as any).status = response.status;
        throw error;
    }

    // 성공 시
    return await (response.json());
}

// 예측 데이터 가공
function buildForecastData(data: ForecastResponse, station: string): Next7Forecast | null {
    if(!data.predicted_values || data.predicted_values.length === 0) {
        console.error("데이터 없음, 관측소코드: ", station);
        return null;
    }

    const forecast: ForecastPoint[] = data.predicted_values;
    const latest = data.latest_elev;
    
    const day7Predicted = forecast[forecast.length - 1].predicted_elev; // 7일후 예측값
    const delta = Number((day7Predicted - latest).toFixed(3)); // 7일후 변화량! 7일후 예측 뱃지 부분
    const range = Number(Math.max(...forecast.map(f => f.predicted_elev)) - Math.min(...forecast.map(f => f.predicted_elev))).toFixed(3); // 예상 변동폭
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'; // 추세
    
    return {
        station: station,
        latestObserved: {observed_elev: latest, datetime: forecast[0].datetime},
        forecast,
        summary: {
            day7: {predicted: day7Predicted, delta_m: delta},
            range_m: Number(range),
            trend,
            generatedAt: new Date().toISOString(),
        },
        note: '데이터 출처: 국가지하수정보센터 「국가지하수측정자료조회서비스」, AI 모델 예측 데이터',
    };
}

// 컴포넌트
export default function ForecastNext7Days({
    stationCode = '84020',
    stationName = '화성팔탄'
} : {
    stationCode?: GenInfoKey;
    stationName?: string;
}) {
    const [forecastData, setForecastData] = useState<Next7Forecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userInfo = useAtomValue(userInfoAtom);

    // 데이터 받아오기
    useEffect(() => {
        // 사용자 인증 후 fetch
        if(!userInfo) return;

        let alive = true;
        
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const stationId = `${GEN_CODES.indexOf(stationCode) + 1}`;
                const result = await fetchForecast(stationId);
                if(alive) {
                    const buildedData = buildForecastData(result, stationId);
                    if(buildedData) {
                        setForecastData(buildedData);
                    } else {
                        setError("해당 관측소의 예측 데이터를 찾을 수 없습니다.");
                    }
                }
            } catch(error: any) {
                if(alive) {
                    switch (error.status) {
                        case 404:
                            setError("해당 관측소의 예측 데이터를 찾을 수 없습니다.");
                            break;
                        case 500:
                            setError("AI 모델 서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                            break;
                        default:
                            setError("데이터를 불러오는 중 오류가 발생했습니다.");
                            break;
                    }
                    console.error(error);
                }
            } finally {
                if(alive) setLoading(false);
            }

        }

        fetchData();
            
        return () => {
            alive = false;
        }
    }, [stationCode, userInfo]);

    // Highcharts 옵션
    const options = useMemo<Highcharts.Options>(() => {
        if(!forecastData) return {}; // 여기 괜찮은지 확인!
        const categories = forecastData.forecast?.map(f => f.datetime.slice(5,16)); // 'MM-DD'
        const pred = forecastData.forecast?.map(f => f.predicted_elev);
        const lo = forecastData.forecast?.map(f => f.lower_approx);
        const hi = forecastData.forecast?.map(f => f.upper_approx);

        return {
            chart: {
                type: 'line',
                height: 220, // 160
                spacing: [8, 8, 8, 8]
            },
            title: {
                text: ''
            },
            xAxis: {
                //type: 'datetime',
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
                    text: '수위(el.m)',
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
            lang: {
                viewFullscreen: '크게 보기',
                downloadPNG: 'PNG 이미지로 다운로드',
                downloadJPEG: 'JPEG 이미지로 다운로드',
                downloadPDF: 'PDF 파일로 다운로드',
                downloadSVG: 'SVG 이미지로 다운로드',
                downloadCSV: 'CSV 파일로 다운로드',
                downloadXLS: 'XLS 파일로 다운로드',
                contextButtonTitle: '메뉴'
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

    // 에러 발생시 렌더링
    if (error) {
        return (
            <div className="" id="forecast-7days-container">
                <div className="c-tit03">
                    <span className="c-txt-point">{stationName || "해당 관측소"}</span> 향후 7일 지하수위 예측
                </div>
                <div className="text-red-600 text-sm min-h-80">로드 실패: {error}</div>
            </div>
        );
    }

    // 사용자 인증 전 렌더링
    if (!userInfo) {
        return (
            <div className="" id="forecast-7days-container">
                <div className="c-tit03">
                    <span className="c-txt-point">{stationName || "해당 관측소"}</span> 향후 7일 지하수위 예측
                </div>
                <div className="flex justify-center items-center min-h-80 bg-gray-50 rounded-2xl">
                    <Link href={"/login"} className="btn-style-4" >로그인 후 이용 가능</Link>
                </div>
            </div>
        )
    }

    // 로딩중 렌더링
    if (!forecastData || loading) {
        return (
            <div className="" id="forecast-7days-container">
                <div className="c-tit03">
                    <span className="c-txt-point">{stationName || "해당 관측소"}</span> 향후 7일 지하수위 예측
                </div>
                {/* 스켈레톤 */}
                <div className="h-5 w-48 bg-gray-200/60 rounded mb-1 animate-pulse" />
                <div className="h-5 w-64 bg-gray-200/60 rounded mb-3 animate-pulse" />
                <div className="h-[220px] w-full bg-gray-100 rounded mb-3 animate-pulse" />
                <div className="h-6 w-64 bg-gray-200/60 rounded animate-pulse" />
                <div className="h-[16px] w-64 bg-gray-200/60 rounded mt-3 animate-pulse" />
            </div>
        );
    }

    const trend = trendLabel(forecastData.summary.trend);

    // 렌더링
    return (
        <div id="forecast-7days-container">
            <div className="flex items-end justify-between">
                <div className="c-tit03">
                    <span className="c-txt-point">{stationName || "해당 관측소"}</span> 향후 7일 지하수위 예측
                </div>
                <span className="text-xs text-gray-500 text-right">단위: el.m</span>
            </div>

            <div className="text-sm text-gray-700 mb-1">
                최신 관측: <b>{forecastData.latestObserved?.observed_elev?.toFixed(2)} el.m</b> ({forecastData.latestObserved.datetime})
            </div>
            <div className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                7일 후 예측: <b>{forecastData.summary.day7.predicted.toFixed(2)} el.m</b>
                <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: trendColor(forecastData.summary.trend), color: '#fff' }}
                aria-label={`7일 후 ${trend} ${forecastData.summary.day7.delta_m.toFixed(2)}el.m`}
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
                전 구간 변동폭 {forecastData.summary.range_m.toFixed(2)} el.m
                </span>
                <span className="px-2 py-1 rounded-full bg-[#ffe1b8] text-[#412200]">
                {trend} 추세
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                예측 7일
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