import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface HorizontalBarChartProps {
  title: string;
  data: {
    name: string;
    y: number;
    color?: string;
  }[];
}

export default function HorizontalBarChart({ title, data }: HorizontalBarChartProps) {
  
    // HighCarts 옵션
    const options: Highcharts.Options = useMemo(() => {
        const isDrought = title.includes('가뭄');
        const isRainfall = title.includes('강수');
        const chartColors = isDrought
          ? ['#ff6361', '#ff8278', '#ffa091', '#ffbcae', '#ffd7cc'].reverse()
          : isRainfall ? ['#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB'].reverse()
          : ["#C8E6C9", "#A5D6A7", "#81C784", "#4DB6AC", "#26A69A"];
        const tooltipTitle = isDrought ? '가뭄시 하강폭' : isRainfall ? '강수시 상승폭' : '변동폭';

        return {
            chart: {
                type: 'bar',
            },
            colors: chartColors,
            title: {
                text: title,
            },
            xAxis: {
                categories: data.map(d => d.name),
                title: {
                    text: '',
                },
            },
            yAxis: {
                min: 0,
                title: {
                    text: '',
                },
            },
            labels: {
                overflow: 'justify',
            },
            tooltip: {
                valueDecimals: 2,
                headerFormat: `<b>${tooltipTitle}</b>: `,
                pointFormat: '<b>{point.y:.3f}</b>'
            },
            plotOptions: {
                bar: {
                    colorByPoint: true,
                    dataLabels: {
                      enabled: true,
                      format: '{point.y:.3f}'
                    },
                },
            },
            legend: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            exporting: {
                enabled: true,
                filename: `${title.replace(/\s+/g, '_')}`,
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
                            'downloadCSV',
                            'downloadXLS',
                        ],
                        symbol: 'menu',
                        align: 'right',
                        y: -10,
                    }
                }
            },
            lang: {
                viewFullscreen: '크게 보기',
                downloadPNG: 'PNG 이미지로 다운로드',
                downloadJPEG: 'JPEG 이미지로 다운로드',
                downloadCSV: 'CSV 파일로 다운로드',
                downloadXLS: 'XLS 파일로 다운로드',
                contextButtonTitle: '메뉴'
            },
            series: [
                {
                    type: 'bar',
                    name: title,
                    data: data,
                },
            ],
        };
    }, [title, data]);

    // 렌더링
    return <HighchartsReact highcharts={Highcharts} options={options} containerProps={{style: {width: "100%", height: 200}}} />;
}
