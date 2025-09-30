'use client';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennumInfo.json";
import { useMemo, useState } from 'react';

const GenGeoInfo = Object.entries(genInfo)
                        .map(([gen, info]) => ({
                          code: gen,
                          name: info["측정망명"],
                          lat: Number(info["위도"]),
                          lon: Number(info["경도"]),
                          elev: 0
                        }));

export default function GeoMapCluster ({mapData}: Record<string, number>) {
  /* const [ready, setReady] = useState(false); */
  const [points, setPoints] = useState<any[]>(GenGeoInfo);
  //console.log(GenGeoInfo);
  
  /* if(!ready) return null; */ // 로딩 에니메이션

  const options = useMemo<Highcharts.Options>(() => ({
    chart: {
      map: krAll as any
    },
    title: {
      text: '지하수위 현황', align: 'left'
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
          fill: '#fff',
          'stroke-width': 1,
          stroke: '#ccc',
          r: 6,
          style: {fontSize: '14px'}
        }
      },
    },
    mapView: {
      zoom: 7.7
    },
    colorAxis: {min: 0, max: 500},
    series: [
      { // 베이스 지도 레이어
        type: 'map',
        name: '전국 지하수 측정망 지도',
        borderColor: "#a0a0a0",
        nullColor: "#E8EBEF",
        showInLegend: false
      } as Highcharts.SeriesMapOptions,
      {// 포인트 마커 레이어
        type: 'mappoint',
        name: '측정망',
        enableMouseTracking: true,
        accessibility: {
          point: {
            descriptionFormat: '{name}, 측정소코드: {code}'
          }
        },
        data: points,
        color: Highcharts.getOptions().colors?.[5],
        marker: {lineWidth: 1, lineColor: '#fff', symbol: 'mapmarker', radius: 8},
        dataLabels: {verticalAlign: 'top'}
      } as Highcharts.SeriesMappointOptions
    ],
    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b><br>지하수위: {point.elev}(m), 위도: {point.lat:.2f}, 경도: {point.lon:.2f}'
    }
  }), [points]);


  return (
    <div style={{width: "100%", height: 600}}>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
        containerProps={{style: {width: "100%", height: 600}}}
        immutable
      />
    </div>
  );
}