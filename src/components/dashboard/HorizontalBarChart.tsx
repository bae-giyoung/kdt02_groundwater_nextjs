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
  const options: Highcharts.Options = useMemo(() => {
    const isDrought = title.includes('가뭄');
    const chartColors = isDrought
      ? ['#ff6361', '#ff8278', '#ffa091', '#ffbcae', '#ffd7cc'].reverse()
      : ['#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB'].reverse();

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
      },
      plotOptions: {
        bar: {
          colorByPoint: true,
          dataLabels: {
            enabled: true,
            format: '{point.y:.2f}'
          },
        },
      },
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
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

  return <HighchartsReact highcharts={Highcharts} options={options} containerProps={{style: {width: "100%", height: 200}}} />;
}
