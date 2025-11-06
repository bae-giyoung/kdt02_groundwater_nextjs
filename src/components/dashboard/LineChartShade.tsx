'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { yyyymmToUTC } from '../utils/timeFormatUtils';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';

// Highcharts Exporting, Stock 모듈 임포트: 클라이언트에서 한번만 실행
if (typeof window !== 'undefined') {
  const win = window as typeof window & { 
        Highcharts?: typeof Highcharts; 
        _Highcharts?: typeof Highcharts
    };

  win.Highcharts = win.Highcharts || Highcharts;
  win._Highcharts = win._Highcharts || Highcharts;

  if (!(Highcharts.Chart && (Highcharts.Chart.prototype as any).exportChart)) {
    (ExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (ExportDataModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (OfflineExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
  }
}

// 타입 선언
type Yyyymm = number; // 201501
type SeriesTuple = [Yyyymm, number] // [날짜, 수위]

interface LineChartSeriesData {
    actual: SeriesTuple[]; // [[날짜, 수위],[날짜, 수위],[날짜, 수위], ...]
    predicted: SeriesTuple[];
}

interface BackendSeriesResponse {
    data: { series: LineChartSeriesData }
}

interface LineChartZoomProps {
    baseUrl: string;
    chartTitle?: string;
    defaultWindow?: 12 | 60 | 84 | 120;
    prefetchedData?: BackendSeriesResponse;
}

// 상수 선언
const ZOOM_WINDOWS = [12, 36, 60, 84, 120] as const;

// 미완성: 나중에
const normalizeTuples = (tuples: SeriesTuple[] | undefined) : [number, number][] => {
    if(!tuples) return [];
    return tuples
        .map(([k, v]) => [yyyymmToUTC(k), v] as [number, number])
        .sort((a, b) => a[0] - b[0]); // sort하지 말까?
}

// 최근 N개월
function lastN<T extends [number, number]>(arr: T[], count: number): T[] { // [number, number] 로??????
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
        const actual = normalizeTuples(data.data.series.actual);
        const predicted = normalizeTuples(data.data.series.predicted);
        return {actual, predicted};

    } else {
        console.log('${resp.status}');
        return null;
    }
}

export default function LineChartShade({
    baseUrl,
    chartTitle = '차트 제목',
    defaultWindow = 120,
    prefetchedData,
} : LineChartZoomProps
) {

    const chartRef = useRef<HighchartsReact.RefObject | null>(null);
    const [loading, setLoading] = useState(!prefetchedData);
    const [error, setError] = useState<string | null>(null);
    const [seriesRaw, setSeriesRaw] = useState<LineChartSeriesData>({actual: [], predicted: []});
    const [zoomWindow, setZoomWindow] = useState<typeof ZOOM_WINDOWS[number]>(defaultWindow);

    useEffect(() => {
        //console.log("baseUrl: ", baseUrl);
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

        const runFetchData = async() => {
            try {
                setLoading(true);
                const resp = await fetchData(baseUrl, signal);
                if(resp === null) {
                    setError('Fetch 실패');
                    return;
                }
                setSeriesRaw(resp);
                setError(null);

            } catch(error: any) {
                if(error?.name !== 'AbortError') {
                    setError(error.message || "Fetch 실패");
                }
            } finally {
                setLoading(false);
            }
        }
        runFetchData();

        return () => controller.abort();

    }, [baseUrl, prefetchedData]);

    const slicedSeries = useMemo(() => {
        //console.log("실측 수위의 길이: ", seriesRaw.actual.length);
        return {
            actual: lastN(seriesRaw.actual, zoomWindow),
            predicted: lastN(seriesRaw.predicted, zoomWindow),
        }
    }, [seriesRaw, zoomWindow]);

    const [minY, maxY] = useMemo(() => {
        const all = [...seriesRaw.actual, ...seriesRaw.predicted].map(([_, value]) => value);
        if (!all.length) return [undefined, undefined];
        const min = Math.min(...all);
        const max = Math.max(...all);
        const padding = (max - min) * 0.05 || 1;
        return [min - padding, max + padding];
    }, [seriesRaw]);

    const options = useMemo<Highcharts.Options>(() => ({
        chart: {
            type: 'areaspline',
            zoomType: undefined,
            spacing: [0, 20, 20, 20],
            borderRadius: 15,
            followTouchMove: true,
            panning: {
                enabled: true,
                type: 'x'
            },
            panKey: 'shift'
        },
        title:{
            text: chartTitle,
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
            minPadding: 0,
            maxPadding: 0,
            startOnTick: true,
            endOnTick: true,
            title: {
                text: '날짜',
                style: {
                    opacity: 0
                }
            },
            crosshair: true,
            plotBands: slicedSeries.predicted.length > 0 ? [
                {
                    from: slicedSeries.predicted[0][0],
                    to: slicedSeries.predicted[slicedSeries.predicted.length - 1][0],
                    color: zoomWindow >= 60 ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
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
            },
            min: minY,
            max: maxY,
            startOnTick: false,
            endOnTick: false,
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%Y-%m-%d}: {point.y:.2f}',
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            areaspline: {
                dataLabels: {
                    enabled: true,
                    format: '{y:.2f}',
                    filter: {
                        property: 'y',
                        operator: '>',
                        value: zoomWindow >= 60 ? 105.80 : 0,
                    }
                },
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 3,
                    states: {
                        hover: {
                            enabled: true,
                        }
                    }
                },
            },
            series: {
                turboThreshold: 0,
            }
        },
        exporting: {
            enabled: true,
            filename: chartTitle.replace(/\s+/g, '_'),
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
            contextButtonTitle: '메뉴',
        },
        series: [
            {
                type: 'areaspline',
                name: '실제 수위',
                data: slicedSeries.actual,
                color: '#1976D2',
                fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, 'rgba(25, 118, 210, 0.5)'],
                    [1, 'rgba(25, 118, 210, 0)'],
                ],
                },
                //threshold: null,
                lineWidth: 2,
            },
            {
                type: 'areaspline',
                name: '예측 수위',
                data: slicedSeries.predicted,
                color: '#FFA726',
                fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, 'rgba(255, 167, 38, 0.2)'],
                    [1, 'rgba(255, 167, 38, 0)'],
                ],
                },
                lineWidth: 2,
                dashStyle: 'ShortDash',
            },
        ]
    }), [slicedSeries]);


    const changeZoomWindow = (window: typeof ZOOM_WINDOWS[number]) => {
        setZoomWindow(window);
        chartRef.current?.chart?.reflow(); // 레이아웃용
    }

    return (
        <div className="chart-box mt-6 w-full">
            <div className="chart-zoom-btns ml-20 mb-8">
                {
                    ZOOM_WINDOWS.map(w => (
                        <button key={w} type='button' onClick={() => changeZoomWindow(w)} aria-pressed={zoomWindow === w}>
                            {`${w / 12}년`}
                        </button>
                    ))
                }
            </div>
            <div className='relative'>
                <p className='absolute'>
                    { loading ? '불러오는 중......' : error ?  `오류: ${error}` : null }
                </p>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                    ref={chartRef}
                    containerProps={{className: 'line-chart-container', style: {width: '100%', height: 400}}}
                />
            </div>
        
        </div>
    );
}