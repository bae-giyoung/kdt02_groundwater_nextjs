'use client';
import { useMemo, useState } from 'react';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import krAll from '@highcharts/map-collection/countries/kr/kr-all.topo.json';
import genInfo from "@/data/gennum_info.json";
import type { GenInfoKey, SensitivityDataset, SensitivityRecord } from '@/types/uiTypes';

// 타입 선언
interface StatusPoint {
    id: string;
    name: string;
    lat: number;
    lon: number;
    value: number;
    status: number;
    percentiles: {
        p10: number;
        p25: number;
        p75: number;
        p90: number;
    };
}

interface GeoMapProps {
    statusData: StatusPoint[];
    sensitivityData: SensitivityDataset | null;
    sensitivityLoading?: boolean;
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

// 민감도 정보
const buildSensitivityMap = (sensitivityData: SensitivityDataset | null) => {
    const map = new Map<GenInfoKey, SensitivityRecord>();
    const records = sensitivityData?.stations_analisys;
    if (!records) return map;

    records.forEach((record, idx) => {
        const numericStation = Number(record.station);
        const mappedKey = Number.isFinite(numericStation) && numericStation > 0
            ? (GEN_CODES[numericStation - 1] as GenInfoKey)
            : (GEN_CODES[idx] as GenInfoKey);

        if (mappedKey) {
            map.set(mappedKey, record);
        }
    });

    return map;
};

const getSensitivityGeoInfo = (sensitivityData: SensitivityDataset | null) => {
    const sensitivityMap = buildSensitivityMap(sensitivityData);

    return Object.entries(genInfo).map(([gen, info]) => {
        const analisys = sensitivityMap.get(gen as GenInfoKey);

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
            case "강수민감형":
                colorValue = 0;
                break;
            case "가뭄취약형":
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
        { from: 0, to: 0, color: '#4DB6AC', name: '정상' },
        { from: 1, to: 1, color: '#FFB74D', name: '경고' },
        { from: 2, to: 2, color: '#E57373', name: '위험' }
    ]
};

const sensitivityColorAxis: Highcharts.ColorAxisOptions = {
    dataClasses: [
        { from: 0, to: 0, color: '#4A90E2', name: '강수민감형' },
        { from: 1, to: 1, color: '#E94E77', name: '가뭄취약형' },
        { from: 2, to: 2, color: '#FFB74D', name: '복합형' },
    ]
};

// 범례 설정
const sensitivityLegendData = [
  {
    color: "#4A90E2",
    title: "강수민감형",
    description: "강우 시 수위 상승폭이 크고, 가뭄 시 하강폭이 상대적으로 작은 관측소(함양이 빠른 지역)",
  },
  {
    color: "#E94E77",
    title: "가뭄취약형",
    description: "가뭄 시 쉬위 하강폭이 크고, 강우 시 상승폭이 상대적으로 작은 관측소(취수가 빠른 지역)",
  },
  {
    color: "#FFB74D",
    title: "복합형",
    description: "두 반응의 차이가 작아, 강우가뭄에 모두 유사한 수준으로 반응하는 관측소",
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

// 컴포넌트
export default function GeoMap (
    {statusData, sensitivityData, sensitivityLoading, mappointDesc, handleClick} 
    : GeoMapProps
) {
  const [ mapType, setMapType ] = useState<'elevation' | 'sensitivity'>('elevation');
  
  // 현재 지하수위 데이터
  const elevationPoints = useMemo(() => {
    if (!statusData || statusData.length === 0) {
      return [];
    }

    const pointsWithRelativeLevel = statusData.map(p => {
      if (!p.percentiles || typeof p.percentiles.p25 !== 'number' || typeof p.percentiles.p75 !== 'number') {
        return { ...p, relativeLevel: 0 };
      }
      const midNormal = (p.percentiles.p25 + p.percentiles.p75) / 2;
      return { ...p, relativeLevel: p.value - midNormal };
    });

    const relativeLevels = pointsWithRelativeLevel.map(p => p.relativeLevel);
    const minRelativeLevel = Math.min(...relativeLevels);
    const maxRelativeLevel = Math.max(...relativeLevels);
    const range = maxRelativeLevel - minRelativeLevel;

    return pointsWithRelativeLevel.map(point => {
      const zValue = range > 0 ? 1 + ((point.relativeLevel - minRelativeLevel) / range) * 99 : 50;

      return {
        ...point,
        code: point.id,
        z: zValue,
      };
    });
  }, [statusData]);

  // 민감도 데이터
  const sensitivityPoints = useMemo(() => getSensitivityGeoInfo(sensitivityData), [sensitivityData]);
  
  // 툴팁 설정 - 지하수위 현황
  const elevationTooltip = {
    useHTML: true,
    headerFormat: '<b>{point.name}</b><br/>',
    pointFormatter: function() {
      const p = this as any;
      const statusText = p.status === 0 ? '<span style="color:#4DB6AC;">정상</span>' 
                     : p.status === 1 ? '<span style="color:#FFB74D;">경고</span>' 
                     : '<span style="color:#E57373;">위험</span>';

      if (typeof p.value !== 'number' || !p.percentiles) return '';

      return `
        <div style="font-size: 12px; margin-top: 5px;">
          <span>- 현재 수위: <b>${Highcharts.numberFormat(p.value, 2)} el.m</b></span><br/>
          <span>- 상태: ${statusText}</span><br/>
          <span>- 동월 정상 범위: ${Highcharts.numberFormat(p.percentiles.p25, 2)} el.m ~ ${Highcharts.numberFormat(p.percentiles.p75, 2)} el.m</span><br/>
          <small style="color: #666;">(과거 10년 동월 수위 분포 기준)</small>
        </div>
      `;
    }
  }

  // 툴팁 설정 - 민감도 분석
  const sensitivityTooltip = {
    headerFormat: '<b>{point.name}</b><br/>',
    pointFormatter: function() {
      const p = this as any;
      const sensitiveTypeText = p.colorValue === 0 ? '<span style="color:#4A90E2;">강수민감형</span>' 
                     : p.colorValue === 1 ? '<span style="color:#E94E77;">가뭄취약형</span>' 
                     : p.colorValue === 2 ? '<span style="color:#FFB74D;">복합형</span>'
                     : '<span>민감도 분석 결과 없음</span>';

      return `
        유형: ${sensitiveTypeText}<br/>
        강수 상승폭: ${Highcharts.numberFormat(p.increase_if_rainfall, 4)} el.m<br/>
        가뭄 하강폭: ${Highcharts.numberFormat(p.decrease_if_drought, 4)} el.m<br/>
        변동폭: ${Highcharts.numberFormat(p.range_variation, 4)} el.m
      `
    }
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
            colorKey: mapType === 'elevation' ? 'status' : 'colorValue', // 'z' -> 'status'로 변경
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
        containerProps={{style: {width: "100%", height: 640}}}
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
