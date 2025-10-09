'use client';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennumInfo.json";
import { useMemo } from 'react';

// 타입 선언
interface GeoMapProps {
    mapData: Record<string, number>, 
    handleClick?: () => void
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
// ["#F4E3C2", "#E3D4B9", "#D6C4A0", "#C5B59C", "#B3A58B", "#9F9982"]
// ["#E1F5FE", "#B3E5FC", "#A5D6F9", "#81C6EA", "#6BAEDB"]
// ["#E8F5E9", "#C8E6C9", "#A5D6A7", "#B2DFDB", "#80CBC4"]
// ["#F2F8F3", "#DDEFE0", "#C8E0C9", "#D6ECEA", "#A9D5D1"]

const pickColor = (idx: number) => {
    return geoColorPallete[idx % geoColorPallete.length];
};

const mapRegions = geoFeatures.map((feature, idx) => ({
    'hc-key': feature.properties['hc-key'],
    color: pickColor(idx)
}));

// mappoint 정보, 측정소별
const getGenGeoInfo = (mapData: Record<string, number>) => {
    return Object.entries(genInfo).map(([gen, info]) => ({
        code: gen,
        name: info["측정망명"],
        lat: Number(info["lat"]),
        lon: Number(info["lon"]),
        z: mapData[gen] ?? 0
    }));
}

export default function GeoMap (
    {mapData, handleClick} 
    : GeoMapProps
) {
  const points = useMemo(() => getGenGeoInfo(mapData), [mapData]);
  
  const options = useMemo<Highcharts.Options>(() => ({
    chart: {
      map: krAll as any
    },
    title: undefined,
    /* title: {
      text: '관측망 지하수위 현황', align: 'left'
    }, */
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
          fill: 'transparent',
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
                        const point = this as GeoPoint;
                        console.log('clicked', point.code);
                        //handleClick(point.code);
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
              + (typeof p.z === 'number' ? `<br/>지하수위: ${Highcharts.numberFormat(p.z, 1)}` : '');
      }
    }
  }), [points]);


  return (
    <div style={{width: "100%", height: 800}} id="geo-map-bubble">
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
        containerProps={{style: {width: "100%", height: 800}}}
        immutable
      />
    </div>
  );
}