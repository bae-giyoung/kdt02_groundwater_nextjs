'use client';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennumInfo.json";
import { useEffect, useMemo, useState } from 'react';

export default function GeoMapCluster ({mapData} : {mapData: Record<string, string | number>}) {
  const [points, setPoints] = useState<any[]>([]);
  const GenGeoInfo = Object.entries(genInfo).map(([gen, info]) => ({
                      code: gen,
                      name: info["측정망명"],
                      lat: Number(info["위도"]),
                      lon: Number(info["경도"]),
                      value: 0
                    }));

  useEffect(()=>{
    const pointsWidthVal = GenGeoInfo.map(info => {
      info.value = mapData[info.code];console.log(mapData[info.code]); return info;
    }); // 여기 타압스크립트 에러
    console.log(pointsWidthVal);
    
    setPoints(pointsWidthVal);
  },[]);
  
  useEffect(()=>{
    console.log(points);
  },[points]);

  if(!points) return null;

  
  const options = useMemo<Highcharts.Options>(() => ({
    chart: {
      map: krAll as any
    },
    title: {
      text: '관측망 지하수위 현황', align: 'left'
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
          fill: 'transparent',
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
    colorKey: 'value',
    plotOptions: {
      mappoint: {
        cluster: {
          enabled: true,
          allowOverlap: false, //
          layoutAlgorithm: {type: 'grid', gridSize: 70},
          zones: [
            {from: 0, to: 99, marker: {radius: 12}},
            {from: 100, to: 199, marker: {radius: 16}},
            {from: 200, to: 500, marker: {radius: 20}},
          ],
        },
      }
    },
    series: [
      { // 베이스 지도 레이어
        type: 'map',
        name: '전국 지하수 측정망 지도',
        borderColor: "#ffffff",
        nullColor: "#50A3DDaa",
        colors: ["#50A3DDaa","#A1D6F6"],
        //colorByPoint: true,
        //enableMouseTracking: true,
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
        color: "#FFB67A",
        marker: {lineWidth: 1, lineColor: '#fff', symbol: 'mapmarker', radius: 7},
        dataLabels: {verticalAlign: 'top'}
      } as Highcharts.SeriesMappointOptions
    ],
    tooltip: {
      headerFormat: '',
      pointFormatter: function() {
        const p = this as any;
        return `<b>${p.name}</b> (${p.code})<br/>위도: ${p.lat.toFixed(1)}, lon: ${p.lon.toFixed(1)}`
              + (typeof p.value === 'number' ? `<br/>value: ${Highcharts.numberFormat(p.value,1)}` : '');
      }
    }
  }), [points]);


  return (
    <div style={{width: "100%", height: 600}} id="geo-map-cluster">
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