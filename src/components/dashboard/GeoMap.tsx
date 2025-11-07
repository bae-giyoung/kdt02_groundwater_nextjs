'use client';
import { useMemo, useState } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennumInfo.json";
import type { GenInfoKey, SensitivityDataset } from '@/types/uiTypes';

// 타입 선언
interface GeoMapProps {
    mapData: Record<string, Record<string, number | null>>;
    sensitivityData: SensitivityDataset | null;
    sensitivityLoading?: boolean;
    period: string;
    mappointDesc: string;
    handleClick?: (stationCode: GenInfoKey) => void;
}

interface GeoPoint extends Highcharts.Point {
    code: string,
    name: string,
    lat: number,
    lon: number,
    z: number,
    sensitive_type?: string,
}

// 상수
const GEN_CODES = Object.keys(genInfo);

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

// 지하수위 mappoint 정보, 측정소별
const getGenGeoInfo = (mapData: Record<string, Record<string, number | null>>, period: string) => {
    const targetZName = "elevMean" + period;
    return Object.entries(genInfo).map(([gen, info]) => ({
        code: gen,
        name: info["측정망명"] || "해당 관측소",
        lat: Number(info["lat"]),
        lon: Number(info["lon"]),
        z: mapData[gen]?.[targetZName] ?? null
    }));
};

// 민감도 정보
const getSensitivityGeoInfo = (sensitivityData: SensitivityDataset | null) => {
    if(!sensitivityData || !sensitivityData.stations_analisys) return [];
    return Object.entries(genInfo).map(([gen, info]) => {
        const stationIndex = GEN_CODES.indexOf(gen);
        const analisys = sensitivityData.stations_analisys[stationIndex];

        if(!analisys) {
            return {
                code: gen,
                name: info?.["측정망명"] || "해당 관측소",
                lat: Number(info?.["lat"]),
                lon: Number(info?.["lon"]),
                z: null,
                colorValue: -1,
                sensitive_type: null,
            }
        }

        let colorValue;
        switch(analisys.sensitive_type) {
            case "강수형":
                colorValue = 0;
                break;
            case "가뭄형":
                colorValue = 1;
                break;
            case "복합형":
                colorValue = 2;
                break;
            default:
                colorValue = -1;
        }

        return {
          code: gen,
          name: info?.["측정망명"] || "해당 관측소",
          lat: Number(info?.["lat"]),
          lon: Number(info?.["lon"]),
          z: analisys?.range_variation ?? null,
          colorValue: colorValue,
          sensitive_type: analisys?.sensitive_type ?? null,
          increase_if_rainfall: analisys?.increase_if_rainfall ?? null,
          decrease_if_drought: analisys?.decrease_if_drought ?? null,
          range_variation: analisys?.range_variation ?? null,
        }
    });
};

// 버블 컬러 설정
const elevationColorAxis: Highcharts.ColorAxisOptions = {
    dataClasses: [
        { to: 99, color: '#FFB74D', name: '경고' },
        { from: 100, to: 299, color: '#4DB6AC', name: '정상' },
        { from: 300, color: '#E57373', name: '위험' },
    ]
};

const sensitivityColorAxis: Highcharts.ColorAxisOptions = {
    dataClasses: [
        { from: 0, to: 0, color: '#4A90E2', name: '강수형' },
        { from: 1, to: 1, color: '#E94E77', name: '가뭄형' },
        { from: 2, to: 2, color: '#FFB74D', name: '복합형' },
    ]
};

// 컴포넌트
const sensitivityLegendData = [
    {
      color: "#4A90E2",
      title: "강수형",
      description: "강우 시 수위 상승폭이 크고, 가뭄 시 하강폭이 상대적으로 작은 관측소(함양이 빠른 지역)",
    },
    {
      color: "#E94E77",
      title: "가뭄형",
      description: "가뭄 시 쉬위 하강폭이 크고, 강우 시 상승폭이 상대적으로 작은 관측소(취수가 빠른 지역)",
    },
    {
      color: "#FFB74D",
      title: "복합형",
      description: "두 반응의 차이가 작어, 강우&middot;가뭄에 모두 유사한 수준으로 반응하는 관측소",
    },
  ];

  const elevationLegendData = [
    {
      color: "#E57373",
      title: "위험",
      description: "상위/하위 10% 구간",
    },
    {
      color: "#FFB74D",
      title: "경고",
      description: "10~25% 구간",
    },
    {
      color: "#4DB6AC",
      title: "정상",
      description: "25~75% 구간",
    },
  ];

export default function GeoMap (
    {mapData, sensitivityData, sensitivityLoading, period, mappointDesc, handleClick} 
    : GeoMapProps
) {
  const [ mapType, setMapType ] = useState<'elevation' | 'sensitivity'>('elevation');
  
  const elevationPoints = useMemo(() => getGenGeoInfo(mapData, period ?? "1"), [mapData, period]);
  const sensitivityPoints = useMemo(() => getSensitivityGeoInfo(sensitivityData), [sensitivityData]);
  
  // 툴팁 설정
  const elevationTooltip = {
    headerFormat: '',
    pointFormatter: function() {
      const p = this as any;
      return `<b>${p.name}</b>`
            + (typeof p.z === 'number' ? `<br/>${currentMappointDesc}: ${Highcharts.numberFormat(p.z, 3)}` : '');
    }
  }

  const sensitivityTooltip = {
    headerFormat: '',
    pointFormat: `
      <b>{point.name}</b><br/>
      유형: {point.sensitive_type}<br/>
      강수 상승폭: {point.increase_if_rainfall:.2f} el.m<br/>
      가뭄 하강폭: {point.decrease_if_drought:.2f} el.m<br/>
      변동폭: {point.range_variation:.2f} el.m
    `
  }

  const points = mapType === 'elevation' ? elevationPoints : sensitivityPoints;
  const currentMappointDesc = mapType === 'elevation' ? mappointDesc : '민감도 유형 및 변동폭';
  const currentColorAxis = mapType === 'elevation' ? elevationColorAxis : sensitivityColorAxis;
  const currentTooltip = mapType === 'elevation' ? elevationTooltip : sensitivityTooltip;
  
  const options = useMemo<Highcharts.Options>(() => ({
    chart: {
      map: krAll as any,
      borderRadius: 20,
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
        verticalAlign: 'bottom',
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
      zoom: 7.7
    },
    colorAxis: currentColorAxis,
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
            colorKey: mapType === 'elevation' ? 'z' : 'colorValue',
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
    tooltip: currentTooltip
  }), [points, currentMappointDesc, currentColorAxis, mapType]);



  return (
    <div style={{width: "100%"}} id="geo-map-bubble" className="d-sgroup relative">
      <div className="pointer-events-auto absolute right-3 top-8 flex flex-col gap-2 rounded-md bg-white/90 p-3 text-sm shadow z-10">
        <span className="font-medium text-slate-700">지표 선택</span>
        <label className="cursor-pointer flex items-center gap-2">
          <input type="radio" name="mapType" value="elevation" 
            checked={mapType === 'elevation'} 
            onChange={() => setMapType('elevation')} />
            지하수위 현황
        </label>
        <label className="cursor-pointer flex items-center gap-2">
          <input type="radio" name="mapType" value="sensitivity" 
            checked={mapType === 'sensitivity'} 
            onChange={() => setMapType('sensitivity')} />
            민감도 분석
        </label>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
        containerProps={{style: {width: "100%", height: 540}}}
        immutable
      />
      {
        mapType === 'elevation'
        ? <>
          <ul className="c-list01 mt-2">
              <li>데이터 출처: 국가지하수정보센터, 「국가지하수측정자료조회서비스 (일자료)」</li>
          </ul>
          <div className="info-box mt-5 max-h-26 overflow-y-auto" style={{ marginBottom: 0, fontSize: '12px'}}>
              <div className="text-xs">
                  <b>관측소별 지하수위 ‘경고/위험/정상’ 구분 기준</b>은  
                  각 관측소의 <b>최근 10년간 월평균 수위 분포를 기반으로</b> 설정됩니다.  
                  <br />
                  {elevationLegendData.map((item, index) => (
                    <p key={index}>
                      - <b style={{color: item.color}}>{item.title}</b>: {item.description}
                      <br />
                    </p>
                  ))}
              </div>
          </div>
        </>
        : <>
          <ul className="c-list01 mt-2">
              <li>데이터 출처: AI 모델 분석</li>
          </ul>
          <div className="info-box mt-5 max-h-26 overflow-y-auto" style={{ marginBottom: 0, fontSize: '12px'}}>
              <div className="text-xs">
                  <b>관측소별 민감도</b>는 기상 변화(강우/가뭄)에 따라 지하수위가 변동하는 법위를 나타냅니다.  
                  민갑도(버블의 크기)가 높을 수록 외부 요인에 의해 수위가 크게 변동할 수 있음을 의미합니다.
                  <br />
                  {sensitivityLegendData.map((item, index) => (
                    <p key={index}>
                      - <b style={{color: item.color}}>{item.title}:</b> {item.description}
                      <br />
                    </p>
                  ))}
              </div>
          </div>
        </>
      }
    </div>
  );
}