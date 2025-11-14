import { NextRequest, NextResponse } from "next/server";
import type { DashboardTableData } from "@/types/uiTypes";
import thresholds from "@/data/groundwater_monthly_thresholds_2014_2020.json";
import stationInfo from "@/data/gennum_info.json";

// =============================================================================
// 상수 선언
// ======================================================================
const API_KEY = process.env.GROUNDWATER_API_KEY;
const BASE_URL = "https://www.gims.go.kr/api/data/observationStationService/getGroundwaterMonitoringNetwork";
const GENNUMS = Object.keys(stationInfo);
const DEFAULT_DAYS = 30;
const MIN_DAYS = 1;
const MAX_DAYS = 365;

// =============================================================================
// 타입 선언
// ======================================================================

// Open API 원본 데이터 타입
type UnitFromOpenApiT = {
    gennum: string, elev: string, wtemp: string, lev: string, ec: string, ymd: string
}

// 최종 응답 데이터 타입
type ResponseDataT = {
    table: DashboardTableData,
    barChart: Record<string, Record<string, number | null>>,
    groundwaterStatus: StatusPoint[]
}

// groundwaterStatus 타입들
type StationInfo = { "측정망명": string; lat: string; lon: string; };
type StationInfoData = Record<string, StationInfo>;
interface PercentileData { p10: number; p25: number; p75: number; p90: number; n: number; }
interface MonthlyPercentiles { [key: string]: PercentileData; }
interface StatusPoint {
    id: string;
    name: string;
    lat: number;
    lon: number;
    value: number;
    status: number;
    percentiles: PercentileData;
    minElev: number;
    maxElev: number;
}

// =============================================================================
// util 함수
// ======================================================================

function parseDaysParam(daysParam: string | null) {
    if(!daysParam) return DEFAULT_DAYS;
    const parsed = Number(daysParam);
    if(!Number.isFinite(parsed) || !Number.isInteger(parsed)) return DEFAULT_DAYS;
    if(parsed < MIN_DAYS) return MIN_DAYS;
    if(parsed > MAX_DAYS) return MAX_DAYS;
    return parsed;
}

function formatDateToParam(date: Date) {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}${month}${day}`;
}

function getApiParams(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const days = parseDaysParam(params.get("days"));
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
    return { begindate: formatDateToParam(start), enddate: formatDateToParam(today) };
}

// 각 관측소별 fetch 요청
async function fetchFromEachStation(gennum: string, begindate: string, enddate: string) {
    if(!API_KEY) throw new Error("Missing API_KEY");
    const url = `${BASE_URL}?KEY=${API_KEY}&type=JSON&gennum=${gennum}&begindate=${begindate}&enddate=${enddate}`;
    const resp = await fetch(url);
    if(!resp.ok) throw new Error(`OPEN API 오류: ${resp.status}`);
    const json = await resp.json();
    return (json.response?.resultData ?? []);
}

// groundwaterStatus 상태 계산 함수
const getStatus = (currentLevel: number, percentiles: PercentileData) => {
    const { p10, p25, p75, p90 } = percentiles;
    if (currentLevel < p10 || currentLevel > p90) return 2; // 위험
    if ((currentLevel >= p10 && currentLevel < p25) || (currentLevel > p75 && currentLevel <= p90)) return 1; // 경고
    return 0; // 정상
};

// =============================================================================
// 데이터 가공 함수
// ======================================================================

// 현황 table용 데이터
function transformToTableData(rawData: Record<string, UnitFromOpenApiT[]>) {
    const dateSet = new Set<string>();
    Object.values(rawData).forEach(rows => rows.forEach(unit => dateSet.add(unit.ymd)));
    const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));

    const tableRows = dates.map(date => {
        const row: Record<string, string | number | null> = { ymd: date };
        for(const [gen, unitRows] of Object.entries(rawData)) {
            const found = unitRows.find(unit => unit.ymd === date);
            row[gen] = found ? Number(found.elev) : null;
        }
        return row;
    });

    const tableRowsByDate = new Map(tableRows.map(row => [row.ymd as string, row]));
    const tableDiffRows = tableRows.map(row => {
        const diffRow: Record<string, string | number | null> = { ymd: row.ymd };
        const currentDate = new Date(parseInt((row.ymd as string).slice(0,4)), parseInt((row.ymd as string).slice(4,6)) - 1, parseInt((row.ymd as string).slice(6,8)));
        currentDate.setDate(currentDate.getDate() - 1);
        const prevDateStr = formatDateToParam(currentDate);
        const prevRow = tableRowsByDate.get(prevDateStr);

        if (prevRow) {
            GENNUMS.forEach(gen => {
                const currentVal = row[gen];
                const prevVal = prevRow[gen];
                if (typeof currentVal === "number" && typeof prevVal === "number") {
                    diffRow[gen] = (currentVal * 1000 - prevVal * 1000) / 1000;
                } else {
                    diffRow[gen] = null;
                }
            });
        }
        return diffRow;
    });

    return { tableRows, tableDiffRows };
}

//
function averageLatest(units: number[], windowSize: number): number | null {
    if(units.length === 0) return null;
    const count = Math.min(windowSize, units.length);
    let sum = 0;
    for(let i = units.length - count; i < units.length; i++) sum += units[i];
    return Number((sum / count).toFixed(3));
}

// ChartBar용 데이터로 가공
function transformToBarChartData(rawData: Record<string, UnitFromOpenApiT[]>) {
    const barChartData: Record<string, Record<string, number | null>> = {};
    for (const [gen, units] of Object.entries(rawData)) {
        const allElevs = units.map(unit => Number(unit.elev)).filter(Number.isFinite);
        barChartData[gen] = {
            elevMean1: averageLatest(allElevs, 1),
            elevMean7: averageLatest(allElevs, 7),
            elevMean14: averageLatest(allElevs, 14),
            elevMean30: averageLatest(allElevs, 30),
        };
    }
    return barChartData;
}

// GroundwaterStatus용 데이터로 가공
function transformToGroundwaterStatus(rawData: Record<string, UnitFromOpenApiT[]>) {
    const currentMonth = (new Date().getMonth() + 1).toString();
    const stationCodes = Object.keys(stationInfo);

    const statusData = thresholds.stations.map(station => {
        const stationIndex = parseInt(station.id, 10) - 1;
        if (stationIndex < 0 || stationIndex >= stationCodes.length) return null;
        
        const code = stationCodes[stationIndex];
        const sInfo = (stationInfo as StationInfoData)[code];
        const stationData = rawData[code];

        if (!sInfo || !stationData || stationData.length === 0) return null;

        // 1. 날짜순으로 정렬
        const sortedStationData = [...stationData].sort((a, b) => a.ymd.localeCompare(b.ymd));
        
        // 2. 사용가능한 모든 30일 데이터로부터 최소값과 최대값 계산
        const elevations = sortedStationData.map(d => Number(d.elev)).filter(Number.isFinite);
        if (elevations.length === 0) return null;

        const minElev = Math.min(...elevations);
        const maxElev = Math.max(...elevations);

        // 3. 최신값
        const latestData = sortedStationData[sortedStationData.length - 1];
        const currentLevel = Number(latestData.elev);
        if (!Number.isFinite(currentLevel)) return null;

        // 4. 백분위수와 상태값
        const monthPercentiles = (station.monthly_percentiles as MonthlyPercentiles)[currentMonth];
        if (!monthPercentiles) return null;

        const status = getStatus(currentLevel, monthPercentiles);

        return {
            id: code,
            name: sInfo["측정망명"],
            lat: parseFloat(sInfo.lat),
            lon: parseFloat(sInfo.lon),
            value: currentLevel,
            status: status,
            percentiles: monthPercentiles,
            minElev: minElev,
            maxElev: maxElev,
        };
    }).filter((p): p is StatusPoint => p !== null);

    return statusData;
}


// =============================================================================
// GET 핸들러
// ======================================================================
export async function GET(request: NextRequest) {
    const { begindate, enddate } = getApiParams(request);

    try {
        // settledResults => [{ status: 'fulfilled', value: [ '5724', [Array] ] }, ... ]
        const settledResults = await Promise.allSettled(
            GENNUMS.map((gen: string) =>
                fetchFromEachStation(gen, begindate, enddate)
                    .then((units: UnitFromOpenApiT[]): [string, UnitFromOpenApiT[]] => [gen, units])
            )
        );

        // 성공한 것만 추려서 객체로 변환 => [['5724', [{gennum:'5724', elev:'105.76',..,ymd:'20251010'}, ...], ...], [..], ...]
        const entriesWithFallbacks = settledResults.map((result, idx) => 
            result.status === "fulfilled" ? result.value : [GENNUMS[idx], []]
        ); // 나중에 fallback 형식으로 전부 보내서 에러 테스트하기 => 반드시

        // 관측소별 데이터로 변환 dataByStation => {'5724': [{gennum:'5724', elev:'105.76',..,ymd:'20251010'}, {}, ...], '514310': [...], ...}
        const dataByStation: Record<string, UnitFromOpenApiT[]> = Object.fromEntries(entriesWithFallbacks);
        
        // 실패한 항목 로깅하기
        settledResults.forEach((result, idx) => {
            if (result.status === "rejected") {
                console.log(`Station ${GENNUMS[idx]} 에러: ${result.reason}`);
            }
        });

        // 응답 데이터
        const responseData: ResponseDataT = {
            table: transformToTableData(dataByStation),
            barChart: transformToBarChartData(dataByStation),
            groundwaterStatus: transformToGroundwaterStatus(dataByStation)
        };

        return NextResponse.json(responseData);

    } catch(error) {
        console.error("currentElev API 에러:", error);
        return NextResponse.json({ errorCode: 502, message: "OPEN API 오류 또는 네트워크 에러" }, { status: 500 });
    }   
}

// =============================================================================
// [ 데이터 구조 확인용 기록 ] 
/* 
dataByStation
'514307': [
    {
      gennum: '514307',
      elev: '3.03',
      wtemp: '16.06',
      lev: '5.35',
      ec: '416',
      ymd: '20251010'
    },
    ...생략...
    {
      gennum: '514310',
      elev: '113.33',
      wtemp: '15.32',
      lev: '3.42',
      ec: '337',
      ymd: '20251107'
    },
  ]
}

*/

// ======================================================================