'use client';
import { useEffect, useState, useMemo } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';
import apiRoutes from "@/lib/apiRoutes";

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
type FeatureT = [
    feature: string,
    importance: number
]

// 컬러
const mutedPalette = [
  '#87d4cc', '#FFE082', '#1976D2', '#A5D6A7', '#80DEEA',
  '#D1C4E9', '#F8BBD0', '#CFD8DC',
  '#4CAF50', '#FFB300', '#4DD0E1',
  '#B39DDB', '#EC6F8B', '#90A4AE',
  '#388E3C', '#FB8C00', '#00ACC1',
  '#7E57C2', '#D81B60', '#607D8B',
]

// 데이터 가져오기 :
const fetchData = async(stationCode: string) => {
    const resp = await fetch(`${apiRoutes.featureImportance()}?stationCode=${stationCode}`, {
        headers: { "Content-type" : "application/json" },
        method: "GET",
    });
    if(resp.ok) {
        const data = await resp.json();
        return data;
    } else return resp.body;
}

// 컴포넌트
export default function FeatureImportance({
    chartTitle = '주요 영향 변수 분석',
    stationCode = '84020',
} : {
    chartTitle?: string,
    stationCode: string,
}) {
    const [allData, setAllData] = useState<Record<string, FeatureT[]>>({}); // Record<"stationCode", [["name", 0.05], .....]>

    useEffect(() => {
        fetchData(stationCode).then(res => {
            if(res.stateCode !== 200) return;
            setAllData(res.data);
        });
    },[]);

    const options = useMemo<Highcharts.Options>(()=> ({
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 400,
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        tooltip: {
            headerFormat: '{series.name}<br/>',
            pointFormat: '<b>{point.name}: {point.percentage:.1f}%</b>'
        },
        title: {
            text: chartTitle,
            align: 'left',
        },
        credits: {
            enabled: false
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        colors: mutedPalette,
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    distance: -5,
                    format: '{point.name}',
                    filter: {
                        property: 'percentage',
                        operator: '>',
                        value: 5
                    },
                    state: {
                        hover: {
                            enabled: true
                        }
                    }
                },
                showInLegend: true
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
            contextButtonTitle: '메뉴'
        },
        series: [{
            type: 'pie',
            name: '특성 중요도',
            data: allData?.[stationCode]
        }]

    }), [allData, stationCode]);


    return (
        <div>
            <p className="c-tit03">주요 영향 변수 분석</p>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                containerProps={{className: 'pie-chart-container', style: {width: "100%", height: "100%"}}}
                immutable
            />
        </div>
    );
}