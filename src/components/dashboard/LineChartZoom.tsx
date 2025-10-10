'use client';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useState } from 'react';
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

// 타입
type Yyyymm = string; // '201501'
type SeriesTuple = [Yyyymm, number] // [날짜, 수위]

interface LineChartSeriesData {
    actual: SeriesTuple[]; // [[날짜, 수위],[날짜, 수위],[날짜, 수위], ...]
    predicted: SeriesTuple[];
}

interface BackendSeriesResponse {
    data: { series: LineChartSeriesData }
}

// 상수
//const BASE_URL = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ZOOM_WINDOW = [1, 5, 7, 10] as const;

// 함수
const yyyymmToUTC = (yyyymm: Yyyymm) => {
    const date = new Date();
    const yyyymmNum = parseInt(yyyymm);
    date.setFullYear(Math.floor(yyyymmNum / 100));
    date.setMonth(yyyymmNum % 100 - 1);
    return date.toUTCString();
}

const fetchData = async() => {
    //const resp = await fetch(`${BASE_URL}/api/v1/rawdata/longterm?station=1&timestep=monthly&horizons=120`, {
    const resp = await fetch(`${BASE_URL}/api/v1/mockdata/longterm?station=1&timestep=monthly&horizons=120`, {
        headers: { "Content-type" : "application/json" },
        method: "GET",
        mode: "cors"
    }); 

    if(resp.ok){
        const data: BackendSeriesResponse = await resp.json();
        console.log(data);
        data.data.series.actual.forEach(d => d[0] = yyyymmToUTC(d[0]));
        data.data.series.predicted.forEach(d => d[0] = yyyymmToUTC(d[0]));
        
        return data.data.series;
    } else {
        console.log("실패, 실패 사유: ");
        return null;
    }
}

export default function LineChartZoom() {
    const [data, setData] = useState<LineChartSeriesData>({actual: [], predicted: []});
    const [zoomValue, setZoomValue] = useState<number>(10);

    const handleZoom = (e : React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const target = e.target as HTMLButtonElement;
        const value = parseInt(target.value);
        setZoomValue(value);
    };
    
    useEffect(()=>{
        fetchData().then(res => {
            if(res === null) return;
            setData(res);
        }); 
    }, []);

    const options = useMemo<Highcharts.Options>(() => ({
        chart: {
            type: 'line',
            zoomType: 'x',
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
            plotBands: data.predicted.length > 0 ? [
                {
                    from: data.predicted[0][0],
                    to: data.predicted[data.predicted.length - 1][0],
                    color: 'rgba(255, 255, 0, 0.1)'
                },
            ] : undefined,
            plotLines: data.predicted.length > 0 ? [
                {
                    value: data?.predicted[0][0],
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
        exporting: {
            enabled: true,
            filename: '장기 추세 그래프',
            buttons: {
                contextButton: {
                    menuItems: [
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                    ],
                    symbol: 'menu',
                    align: 'right',
                }
            }
        },
        lang: {
            downloadPNG: 'PNG 이미지로 다운로드',
            downloadJPEG: 'JPEG 이미지로 다운로드',
            downloadPDF: 'PDF 파일로 다운로드',
            downloadSVG: 'SVG 이미지로 다운로드',
            contextButtonTitle: '메뉴'
        },
        series: [
            {
                type: 'line',
                name: '실제 수위',
                data: data.actual,
                id: 'actual'
            }, {
                type: 'line',
                name: '예측 수위',
                data: data.predicted,
                color: 'orange',
                id: 'predicted'
            }
        ]
    }), [data]);

    return (
        <div className="chart-box mt-8 w-full">
            <div className="flex justify-start gap-4">
                <button type="button" onClick={handleZoom} value="1">1년</button>
                <button type="button" onClick={handleZoom} value="5">5년</button>
                <button type="button" onClick={handleZoom} value="7">7년</button>
                <button type="button" onClick={handleZoom} value="10">10년</button>
            </div>
            <div>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                    containerProps={{className: 'line-chart-container', style: {width: '100%', height: 400}}}
                />
            </div>
        
        </div>
    );
}