'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';
import StockModule from 'highcharts/modules/stock';

// Highcharts Exporting, Stock 모듈 임포트: 클라이언트에서 한번만 실행
if (typeof window !== 'undefined') {
  const win = window as typeof window & { 
        Highcharts?: typeof Highcharts; 
        _Highcharts?: typeof Highcharts 
        _stockModuleLoaded?: boolean;
    };

  win.Highcharts = win.Highcharts || Highcharts;
  win._Highcharts = win._Highcharts || Highcharts;

  if (!(Highcharts.Chart && (Highcharts.Chart.prototype as any).exportChart)) {
    (ExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (ExportDataModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (OfflineExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
  }

  if(!win._stockModuleLoaded) {
    if (!(Highcharts.Chart && (Highcharts as any).StockChart)) {
      (StockModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    }
    win._stockModuleLoaded = true;
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

interface RangeSelectorClickEvent extends Event {
    button?: {
        count?: number;
    }
}

// 상수 선언
const ZOOM_WINDOWS = [12, 36, 60, 84, 120] as const;

// 함수
const yyyymmToUTC = (yyyymm: Yyyymm) : number => {
    const yyyymmNum = yyyymm;
    const yyyy = Math.floor(yyyymmNum / 100);
    const mm = (yyyymmNum % 100) - 1;
    return Date.UTC(yyyy, mm, 1);
}

// 미완성: 나중에
const normalizeTuples = (tuples: SeriesTuple[] | undefined) : [number, number][] => {
    if(!tuples) return [];
    return tuples
        .map(([k, v]) => [yyyymmToUTC(k), v] as [number, number])
        .sort((a, b) => a[0] - b[0]); // sort하지 말까?
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

export default function LineChartShadeZoom({
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

    // 데이터 받아오기
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

    // areaspline용
    const [minY, maxY] = useMemo(() => {
        const all = [...seriesRaw.actual, ...seriesRaw.predicted].map(([_, value]) => value);
        if (!all.length) return [undefined, undefined];
        const min = Math.min(...all);
        const max = Math.max(...all);
        const padding = (max - min) * 0.05 || 1;
        return [min - padding, max + padding];
    }, [seriesRaw]);

    // 차트 옵션
    const options = useMemo<Highcharts.Options>(() => ({
        chart: {
            type: 'areaspline',
            zoomType: undefined,
            spacing: [40, 20, 20, 20],
            borderRadius: 15,
            followTouchMove: true,
            panning: {
                enabled: true,
                type: 'x'
            },
            panKey: 'shift'
        },
        /* navigator: {
            enabled: true,
            outlineColor: '#1976D2',
            outlineWidth: 1,
            maskFill: 'rgba(50, 100, 255, 0.3)',
            handles: {
                backgroundColor: '#1976D2',
                borderColor: '#1976D2',
                width: 8,
                symbols: ['squarehandles', 'arrowhandles']
            },
            series: {
                type: 'column',
                color: '#1976D2',
                pointPlacement: 'on'
            }
        }, */
        rangeSelector: {
            enabled: true,
            floating: true,
            allButtonsEnabled: true,
            inputEnabled: false, // true
            inputDateFormat: '%Y-%m-%d',
            inputPosition: {
                align: 'left',
                x: 0,
                y: -40,
            },
            inputBoxBorderColor: 'gray',
            inputBoxWidth: 120,
            inputBoxHeight: 18,
            inputStyle: {
                color: '#222222',
                fontWeight: 'bold'
            },
            labelStyle: {
                color: '#222222',
                fontWeight: 'bold'
            },
            buttonPosition: {
                align: 'right',
                x: 0,
                y: -40,
            },
            buttons: [
                /* {type: 'year', count: 1, text: '1년', events: {click: (e) => {e.preventDefault(); setZoomWindow(12)}}},
                {type: 'year', count: 3, text: '3년', events: {click: (e) => {e.preventDefault(); setZoomWindow(36)}}},
                {type: 'year', count: 5, text: '5년', events: {click: (e) => {e.preventDefault(); setZoomWindow(60)}}},
                {type: 'year', count: 7, text: '7년', events: {click: (e) => {e.preventDefault(); setZoomWindow(84)}}},
                {type: 'year', count: 10, text: '10년', events: {click: (e) => {e.preventDefault(); setZoomWindow(120)}}}, */
                {type: 'year', count: 1, text: '1년'},
                {type: 'year', count: 3, text: '3년'},
                {type: 'year', count: 5, text: '5년'},
                {type: 'year', count: 7, text: '7년'},
                {type: 'year', count: 10, text: '10년'},
            ],
            buttonTheme: {
                width: 60,
            },
            selected: 4,
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
            plotBands: seriesRaw.predicted.length > 0 ? [
                {
                    from: seriesRaw.predicted[0][0],
                    to: seriesRaw.predicted[seriesRaw.predicted.length - 1][0],
                    color: zoomWindow >= 60 ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
                },
            ] : undefined,
            plotLines: seriesRaw.predicted.length > 0 ? [
                {
                    value: seriesRaw?.predicted[0][0],
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
        series: [
            {
                type: 'areaspline',
                name: '실제 수위',
                data: seriesRaw.actual,
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
                data: seriesRaw.predicted,
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
    }), [seriesRaw, zoomWindow]);

    Highcharts.setOptions({
        lang: {
            viewFullscreen: '크게 보기',
            downloadPNG: 'PNG 이미지로 다운로드',
            downloadJPEG: 'JPEG 이미지로 다운로드',
            downloadPDF: 'PDF 파일로 다운로드',
            downloadSVG: 'SVG 이미지로 다운로드',
            downloadCSV: 'CSV 파일로 다운로드',
            downloadXLS: 'XLS 파일로 다운로드',
            contextButtonTitle: '메뉴',
            rangeSelectorZoom: '기간 선택',
            rangeSelectorFrom: '',
            rangeSelectorTo: '',
        },
    });

    return (
        <div className="chart-box mt-6 w-full">
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