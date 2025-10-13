'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';

// Highcharts Exporting 임포트: 클라이언트에서 한번만 실행
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
type SeriesTuple = [Yyyymm, number]

interface LineChartSeriesData {
    predicted: SeriesTuple[]; // [[날짜, 수위], ...]
    rain_mm: SeriesTuple[];
    temp_c: SeriesTuple[];
    humidity_pct: SeriesTuple[];
}

interface BackendSeriesResponse {
    data: { series_raw: LineChartSeriesData }
}

interface WeatherGroundwaterTrendChartProps {
    baseUrl: string;
    chartTitle?: string;
    prefetchedData?: BackendSeriesResponse;
}

// 함수
const yyyymmToUTC = (yyyymm: Yyyymm) : number => {
    const yyyymmNum = yyyymm;
    const yyyy = Math.floor(yyyymmNum / 100);
    const mm = (yyyymmNum % 100) - 1;
    return Date.UTC(yyyy, mm, 1);
}

// 날짜 정규화
const normalizeTuples = (tuples: SeriesTuple[] | undefined) : [number, number][] => {
    if(!tuples) return [];
    return tuples
        .map(([k, v]) => [yyyymmToUTC(k), v] as [number, number])
        .sort((a, b) => a[0] - b[0]);
}

// 데이터 요청
const fetchData = async(url: string, signal: AbortSignal) => {
    const resp = await fetch(url, {
        headers: { "Content-type" : "application/json" },
        method: "GET",
        mode: "cors",
        signal
    });

    if(resp.ok){
        const data: BackendSeriesResponse = await resp.json();
        const predicted = normalizeTuples(data.data.series_raw.predicted);
        const rain_mm = normalizeTuples(data.data.series_raw.rain_mm);
        const temp_c = normalizeTuples(data.data.series_raw.temp_c);
        const humidity_pct = normalizeTuples(data.data.series_raw.humidity_pct);
        
        return {predicted, rain_mm, temp_c, humidity_pct};

    } else {
        console.log('${resp.status}');
        return null;
    }
}

// 렌더링
export default function WeatherGroundwaterTrendChart({
    baseUrl,
    chartTitle = '차트 제목',
    prefetchedData,
} : WeatherGroundwaterTrendChartProps
) {
    const chartRef = useRef<HighchartsReact.RefObject | null>(null);
    const [loading, setLoading] = useState(!prefetchedData);
    const [error, setError] = useState<string | null>(null);
    const [seriesRaw, setSeriesRaw] = useState<LineChartSeriesData>({
        predicted: [],
        rain_mm: [],
        temp_c: [],
        humidity_pct: [],
    });

    useEffect(() => {
        console.log("baseUrl: ", baseUrl);
        if(prefetchedData) {
            setSeriesRaw({
                predicted: normalizeTuples(prefetchedData.data?.series_raw?.predicted),
                rain_mm: normalizeTuples(prefetchedData.data?.series_raw?.rain_mm),
                temp_c: normalizeTuples(prefetchedData.data?.series_raw?.temp_c),
                humidity_pct: normalizeTuples(prefetchedData.data?.series_raw?.humidity_pct),
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

    const options = useMemo<Highcharts.Options>(() => ({
        chart: {
            type: 'line',
            zoomType: undefined,
            spacing: [0, 20, 20, 20],
            borderRadius: 15,
            borderColor: '#ccc',
            borderWidth: 1,
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
        },
        yAxis: {
            title: {
                text: '지하 수위'
            },
            startOnTick: true,
            endOnTick: true,
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%Y-%m-%d}: {point.y:.2f}',
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    format: '{y:.2f}',
                },
                marker: {
                    enabled: true,
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
                type: 'column',
                name: '예측 수위',
                data: seriesRaw.predicted,
                color: '#039BE5', // '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#039BE5', '#0288D1',
                //threshold: null,
                lineWidth: 2,
            },
            {
                type: 'line',
                name: '강수량',
                data: seriesRaw.rain_mm,
                //color: '#FFA726',
                lineWidth: 2,
                //dashStyle: 'ShortDash',
            },
            {
                type: 'line',
                name: '기온',
                data: seriesRaw.temp_c,
                lineWidth: 2,
            },
            {
                type: 'line',
                name: '습도',
                data: seriesRaw.humidity_pct,
                lineWidth: 2,
            },
        ]
    }), [seriesRaw]);

    return (
        <div className="chart-box mt-8 w-full">
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