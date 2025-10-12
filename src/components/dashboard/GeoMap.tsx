'use client';
import { useMemo } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennumInfo.json";
import type { GenInfoKey } from '@/types/uiTypes';

// 타입 선언
interface GeoMapProps {
    mapData: Record<string, Record<string, number | null>>, 
    period: string,
    mappointDesc: string,
    handleClick?: (stationCode: GenInfoKey) => void,
}

interface GeoPoint extends Highcharts.Point {
    code: string,
    name: string,
    lat: number,
    lon: number,
    z: number
}

// 지도 색상
const geoFeatures = Highcharts.geojson(krAll, 'map') as Highcharts.GeoJSONFeature[];
const geoColorPallete = ["#E8F5E9", "#DDEFE0", "#C8E0C9", "#D6ECEA"];

const pickColor = (idx: number) => {
    return geoColorPallete[idx % geoColorPallete.length];
};

const mapRegions = geoFeatures.map((feature, idx) => ({
    'hc-key': feature.properties['hc-key'],
    color: pickColor(idx)
}));

// mappoint 정보, 측정소별
const getGenGeoInfo = (mapData: Record<string, Record<string, number | null>>, period: string) => {
    const targetZName = "elevMean" + period;
    return Object.entries(genInfo).map(([gen, info]) => ({
        code: gen,
        name: info["측정망명"],
        lat: Number(info["lat"]),
        lon: Number(info["lon"]),
        z: mapData[gen]?.[targetZName] ?? null
    }));
}

export default function GeoMap (
    {mapData, period, mappointDesc, handleClick} 
    : GeoMapProps
) {
  const points = useMemo(() => getGenGeoInfo(mapData, period ?? "1"), [mapData, period]);
  
  const options = useMemo<Highcharts.Options>(() => ({
    chart: {
      map: krAll as any
    },
    title: undefined,
    credits: {
        enabled: false
    },
    mapNavigation: {
      enabled: true,
      enableDoubleClickZoom: true,
      enableMouseWheelZoom: true,
      enableTouchZoom: true,
      mouseWheelSensitivity: 1.1,
      buttonOptions: {
        alignTo: 'plotBox',
        align: 'right',
        x: -10,
        y: -10,
        theme: {
          fill: '#ffffff',
          'stroke-width': 1,
          stroke: '#ccc',
          r: 6,
          style: {fontSize: '14px'}
        }
      },
    },
    mapView: {
      zoom: 8.1
    },
    colorAxis: {
        dataClasses: [
            { to: 99, color: '#FFB74D', name: '경고' },
            { from: 100, to: 299, color: '#4DB6AC', name: '정상' },
            { from: 300, color: '#E57373', name: '위험' },
        ]
    },
    plotOptions: {
        map: {
            states: {
                inactive: { opacity: 0.6 },
                hover: { borderColor: "#888" }
            }
        },
        mapbubble: {
            minSize: '4%',
            maxSize: '18%',
            states: {
                inactive: {
                    opacity: 0.8,
                },
            }
        },
        mappoint: {
            states: {
                inactive: { opacity: 1 },
                hover: { 
                    halo: { size: 10, opacity: 1 },
                }
            },
            cursor: 'pointer',
            point: {
                events: {
                    click: function(e){
                        e.preventDefault();
                        if(handleClick) {
                            const point = this as GeoPoint;
                            handleClick(point.code as GenInfoKey);
                        }
                    }
                },
            }
        },
    } as Highcharts.PlotOptions,
    series: [
      {
        type: 'map',
        name: '대한민국 지하수 측정망 지도',
        data: mapRegions,
        joinBy: 'hc-key',
        showInLegend: false,
        enableMouseTracking: false
      } as Highcharts.SeriesMapOptions,
      {
        type: 'mapbubble',
        name: '측정망',
        data: points,
        colorKey: 'z',
        nullColor: 'transparent',
        enableMouseTracking: false,
        zIndex: 1
      } as Highcharts.SeriesMapbubbleOptions,
      {
        type: 'mappoint',
        name: '측정망',
        data: points,
        enableMouseTracking: true,
        accessibility: {
          point: {
            descriptionFormat: '{name}, 측정소 코드 {code}'
          }
        },
        color: "#FFB67A",
        marker: {lineWidth: 1, lineColor: '#000', symbol: 'diamond', radius: 7},
        dataLabels: {verticalAlign: 'top'},
        zIndex: 2
      } as Highcharts.SeriesMappointOptions
    ],
    tooltip: {
      headerFormat: '',
      pointFormatter: function() {
        const p = this as any;
        return `<b>${p.name}</b>`
              + (typeof p.z === 'number' ? `<br/>${mappointDesc}: ${Highcharts.numberFormat(p.z, 3)}` : '');
      }
    }
  }), [points, mappointDesc]);


  return (
    <div style={{width: "100%"}} id="geo-map-bubble">
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
        containerProps={{style: {width: "100%", height: 700}}}
        immutable
      />
    </div>
  );
}