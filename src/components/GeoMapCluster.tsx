'use client';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennumInfo.json";
import { useEffect, useMemo, useState } from 'react';

const GenGeoInfo = Object.entries(genInfo).map(([gen, info]) => ({
  code: gen,
  name: info["측정망명"],
  lat: Number(info["lat"]),
  lon: Number(info["lon"]),
  z: 0
}));

export default function GeoMapCluster ({mapData} : {mapData: Record<string, number>}) {
  const [points, setPoints] = useState<any[]>(GenGeoInfo);

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') {
        return;
      }

      const globalScope = window as typeof window & {
        Highcharts?: typeof Highcharts;
        _Highcharts?: typeof Highcharts;
      };

      if (!globalScope.Highcharts) {
        globalScope.Highcharts = Highcharts;
        (globalScope as any)._Highcharts = Highcharts;
      }

      const hasClusterSupport =
        !!((Highcharts.seriesTypes as any)?.mappoint?.prototype?.cluster ??
        (Highcharts as any)?.Series?.prototype?.cluster);

      if (hasClusterSupport) {
        return;
      }

      try {
        await import('highcharts/modules/marker-clusters');
      } catch (error) {
        console.error('Failed to load marker clusters module', error);
      }
    })();
  }, []);

  useEffect(() => {
    const pointsWidthVal = GenGeoInfo.map(info => {info.z = mapData[info.code]; return info});
    setPoints(pointsWidthVal);
  }, [mapData]);
  
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
      zoom: 7.5
    },
    colorAxis: {min: 0, max: 500},
    colorKey: 'z',
    plotOptions: {
      mappoint: {
        cluster: {
          enabled: true,
          allowOverlap: false,
          layoutAlgorithm: {type: 'grid', gridSize: 70},
          zones: [
            {from: 0, to: 99, marker: {radius: 30}},
            {from: 100, to: 199, marker: {radius: 50}},
            {from: 200, to: 500, marker: {radius: 70}},
          ],
        },
      }
    },
    series: [
      {
        type: 'map',
        name: '대한민국 지하수 측정망 지도',
        borderColor: "#ffffff",
        nullColor: "#50A3DDaa",
        colors: ["#50A3DDaa","#A1D6F6"],
        showInLegend: false
      } as Highcharts.SeriesMapOptions,
      {
        type: 'mappoint',
        name: '측정망',
        enableMouseTracking: true,
        accessibility: {
          point: {
            descriptionFormat: '{name}, 측정소 코드 {code}'
          }
        },
        data: points,
        color: "#FFB67A",
        //marker: {lineWidth: 1, lineColor: '#fff', symbol: 'mapmarker', radius: 7},
        dataLabels: {verticalAlign: 'top'}
      } as Highcharts.SeriesMappointOptions
    ],
    tooltip: {
      headerFormat: '',
      pointFormatter: function() {
        const p = this as any;
        return `<b>${p.name}</b> (${p.code})<br/>lat: ${p.lat.toFixed(1)}, lon: ${p.lon.toFixed(1)}`
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
