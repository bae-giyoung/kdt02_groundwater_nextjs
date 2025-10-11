'use client';
import { useEffect, useMemo, useState, useRef, use } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';

// Highcharts Exporting 모듈 임포트: 클라이언트에서 한번만 실행
if (typeof window !== 'undefined') {
  const win = window as typeof window & { Highcharts?: typeof Highcharts; _Highcharts?: typeof Highcharts };

  win.Highcharts = win.Highcharts || Highcharts;
  win._Highcharts = win._Highcharts || Highcharts;

  if (!(Highcharts.Chart && (Highcharts.Chart.prototype as any).exportChart)) {
    (ExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (ExportDataModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (OfflineExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
  }
}

// 타입 선언
type Yyyymm = string; // '201501'
type SeriesTuple = [Yyyymm, number] // [날짜, 수위] /////////!!!!!!! number빼던가

interface LineChartSeriesData {
    actual: SeriesTuple[]; // [[날짜, 수위],[날짜, 수위],[날짜, 수위], ...]
    predicted: SeriesTuple[];
}

interface BackendSeriesResponse {
    data: { series: LineChartSeriesData }
}

interface LineChartZoomProps {
    baseUrl: string;
    window?: 12 | 60 | 84 | 120;
    prefetchedData?: BackendSeriesResponse;
}

// 상수 선언
const ZOOM_WINDOWS = [12, 60, 84, 120] as const;

// 함수
const yyyymmToUTC = (yyyymm: Yyyymm) => {
    const date = new Date();
    const yyyymmNum = parseInt(yyyymm);
    date.setFullYear(Math.floor(yyyymmNum / 100));
    date.setMonth(yyyymmNum % 100 - 1);
    return date.toUTCString();
}

// 미완성: 나중에
const normalizeTuples = (tuples: SeriesTuple[]) => {
    return tuples;
}

// 최근 N개월
function lastN<T extends [string, number]>(arr: T[], count: number): T[] { // [number, number] 로??????
    if(!count) return [];
    const start = Math.max(0, arr.length - count);
    return arr.slice(start);
}

const fetchData = async(url: string, signal: AbortSignal) => {
    const resp = await fetch(url, {
        headers: { "Content-type" : "application/json" },
        method: "GET",
        mode: "cors",
        signal
    });

    if(resp.ok){
        const data: BackendSeriesResponse = await resp.json();
        console.log(data);
        data.data.series.actual.forEach(d => d[0] = yyyymmToUTC(d[0])); // normalizeTuple로
        data.data.series.predicted.forEach(d => d[0] = yyyymmToUTC(d[0])); // normalizeTuple로
        
        return data.data.series;
    } else {
        console.log('${resp.status}');
        return null;
    }
}

export default function LineChartZoom({
    baseUrl,
    window = 120,
    prefetchedData,
} : LineChartZoomProps
) {

    const chartRef = useRef<HighchartsReact.RefObject | null>(null);
    const [loading, setLoading] = useState(!prefetchedData);
    const [error, setError] = useState<string | null>(null);
    const [seriesRaw, setSeriesRaw] = useState<LineChartSeriesData>({actual: [], predicted: []});
    const [zoomWindow, setZoomWindow] = useState<typeof ZOOM_WINDOWS[number]>(window);

    useEffect(() => {
        if(prefetchedData) {
            setSeriesRaw({
                actual: normalizeTuples(prefetchedData.data?.series?.actual),
                predicted: normalizeTuples(prefetchedData.data?.series?.predicted),
            });
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        try {
            setLoading(true);
            fetchData(baseUrl, signal).then(res => {
                if(res === null) {
                    throw new Error('Fetch 실패');
                } else {
                    setSeriesRaw(res);
                    setError(null);
                }
            });

        } catch(error: any) {
            if(error?.name !== 'AbortError') {
                setError(error.message || "Fetch 실패");
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();

    }, [baseUrl, prefetchedData]);

    const slicedSeries = useMemo(() => {
        console.log("실측 수위의 길이: ", seriesRaw.actual.length);
        return {
            actual: lastN(seriesRaw.actual, zoomWindow),
            predicted: lastN(seriesRaw.predicted, zoomWindow),
        }
    }, [seriesRaw, zoomWindow]);

    

    const options = useMemo<Highcharts.Options>(() => ({
        chart: {
            type: 'line',
            zoomType: undefined,
            spacint: [16, 16, 8, 8],
            followTouchMove: true,
            panning: {
                enabled: true,
                type: 'x'
            },
            panKey: 'shift'
        },
        title: {
            text: '장기 추세 그래프',
            align: 'left'
        },
        legend: {
            enabled: true
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                month: '%Y년 %m월',
                year: '%Y년'
            },
            title: {
                text: '날짜'
            },
            labels: {
                rotation: -45,
            },
            crosshair: true,
            plotBands: slicedSeries.predicted.length > 0 ? [
                {
                    from: slicedSeries.predicted[0][0],
                    to: slicedSeries.predicted[slicedSeries.predicted.length - 1][0],
                    color: 'rgba(255, 255, 0, 0.1)'
                },
            ] : undefined,
            plotLines: slicedSeries.predicted.length > 0 ? [
                {
                    value: slicedSeries?.predicted[0][0],
                    width: 2,
                    color: 'orange',
                    dashStyle: 'ShortDash',
                }
            ] : undefined,
        },
        yAxis: {
            title: {
                text: '지하 수위'
            }
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%Y-%m-%d}: {point.y:.2f}',
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0,
            }
        },
        exporting: {
            enabled: true,
            filename: '지하수위 장기추세(2014-2023)',
            buttons: {
                contextButton: {
                    theme: {
                        stroke: "#ccc",
                        "stroke-width": 1.5,
                        fill: "#ffffff",
                    },
                    menuItems: [
                        'viewFullscreen',
                        'printChart',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS',
                    ],
                    symbol: 'menu',
                    align: 'right',
                }
            }
        },
        lang: {
            viewFullscreen: '크게 보기',
            printChart: '차트 인쇄',
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
                type: 'line',
                name: '실측 수위',
                data: slicedSeries.actual,
                id: 'actual'
            }, {
                type: 'line',
                name: '예측 수위',
                data: slicedSeries.predicted,
                color: 'orange',
                id: 'predicted'
            }
        ]
    }), [slicedSeries]);

    const changeZoomWindow = (window: typeof ZOOM_WINDOWS[number]) => {
        setZoomWindow(window);
        console.log(window);
        // 소프트 스크롤 추가 고려!
        // chartRef.current?.chart?.reflow();
    }

    return (
        <div className="chart-box mt-8 w-full">
            <div className="flex justify-start gap-4">
                {
                    ZOOM_WINDOWS.map(w => (
                        <button key={w} onClick={() => changeZoomWindow(w)}
                            aria-pressed={zoomWindow === w}
                        >
                            {`${w / 12}년`}
                        </button>
                    ))
                }
            </div>
            <div>
                <p className=''>
                    { loading ? '불러오는 중......' : error ?  `오류: ${error}` : null }
                </p>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                    containerProps={{className: 'line-chart-container', style: {width: '100%', height: 400}}}
                />
            </div>
        
        </div>
    );
}