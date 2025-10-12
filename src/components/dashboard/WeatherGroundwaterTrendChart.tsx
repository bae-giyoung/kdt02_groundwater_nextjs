'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';

// Highcharts Exporting 임포트: 클라이언트에서 한번만 실행
if (typeof window !== 'undefined') {
  const win = window as typeof window & { 
        Highcharts?: typeof Highcharts; 
        _Highcharts?: typeof Highcharts
    };

  win.Highcharts = win.Highcharts || Highcharts;
  win._Highcharts = win._Highcharts || Highcharts;

  if (!(Highcharts.Chart && (Highcharts.Chart.prototype as any).exportChart)) {
    (ExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (ExportDataModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (OfflineExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
  }
}

// 타입 선언
type Yyyymm = number; // 201501
type SeriesTuple = [Yyyymm, number]

interface LineChartSeriesData {
    predicted: SeriesTuple[]; // [[날짜, 수위], ...]
    rain_mm: SeriesTuple[];
    temp_c: SeriesTuple[];
    humidity_pct: SeriesTuple[];
}

interface BackendSeriesResponse {
    data: { series_raw: LineChartSeriesData }
}

interface WeatherGroundwaterTrendChartProps {
    baseUrl: string;
    chartTitle?: string;
    prefetchedData?: BackendSeriesResponse;
}

// 함수
const yyyymmToUTC = (yyyymm: Yyyymm) : number => {
    const yyyymmNum = yyyymm;
    const yyyy = Math.floor(yyyymmNum / 100);
    const mm = (yyyymmNum % 100) - 1;
    return Date.UTC(yyyy, mm, 1);
}

// 날짜 정규화
const normalizeTuples = (tuples: SeriesTuple[] | undefined) : [number, number][] => {
    if(!tuples) return [];
    return tuples
        .map(([k, v]) => [yyyymmToUTC(k), v] as [number, number])
        .sort((a, b) => a[0] - b[0]);
}

// 데이터 요청
const fetchData = async(url: string, signal: AbortSignal) => {
    const resp = await fetch(url, {
        headers: { "Content-type" : "application/json" },
        method: "GET",
        mode: "cors",
        signal
    });

    if(resp.ok){
        const data: BackendSeriesResponse = await resp.json();
        const predicted = normalizeTuples(data.data.series_raw.predicted);
        const rain_mm = normalizeTuples(data.data.series_raw.rain_mm);
        const temp_c = normalizeTuples(data.data.series_raw.temp_c);
        const humidity_pct = normalizeTuples(data.data.series_raw.humidity_pct);
        
        return {predicted, rain_mm, temp_c, humidity_pct};

    } else {
        console.log('${resp.status}');
        return null;
    }
}

// 렌더링
export default function WeatherGroundwaterTrendChart({
    baseUrl,
    chartTitle = '차트 제목',
    prefetchedData,
} : WeatherGroundwaterTrendChartProps
) {
  return (
    <div>
      
    </div>
  );
}