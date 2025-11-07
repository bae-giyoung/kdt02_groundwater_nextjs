'use client';
import { useMemo } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// 내보내기 기능 나중에 추가

// 타입 선언
type SeriesPoint = {
    name: string;
    y: number | null;
}

type BarChartProps = {
    title?: string;
    categories: string[];
    yLabel?: string;
    xLabel?: string;
    data: SeriesPoint[];
}

export default function BarChart({ 
    title = '막대 그래프', 
    categories, 
    yLabel = '값', 
    xLabel = '항목',
    data,
}: BarChartProps) {
    const options = useMemo(() => ({
        chart: {
            type: 'column',
            spacingTop: 40,
            spacingLeft: 10,
            spacingRight: 20,
            borderRadius: 15,
        },
        title: {
            text: title,
            align: 'left',
        },
        credits: {
            enabled: false,
        },
        xAxis: {
            categories,
            title: {
                text: yLabel,
            },
            lineColor: '#ccc',
            tickColor: '#ccc',
        },
        yAxis: {
            min: 0,
            title: {
                text: xLabel,
            },
            gridLineColor: '#eee',
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>',
        },
        legend: {
            enabled: false,
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                },
            },
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}',
                },
            }
        },
        exporting: {
            enabled: true,
            filename: '전국_지하수위_현황',
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
                    y: -20,
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
                type: 'column',
                name: xLabel,
                data,
                colorByPoint: true,
                colors: [
                    '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#039BE5', '#0288D1',
                ]
            }
        ],
    }), [categories, data]);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={{ className: 'bar-chart-container chart-title-axis-hidden', style: { width: '100%', height: 200 } }}
        />
    );
    
}