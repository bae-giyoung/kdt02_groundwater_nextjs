import { NextRequest, NextResponse } from "next/server";
import type { DashboardTableData, DashboardTableRow, DashboardTableDiffRow } from "@/types/uiTypes";
// 다시 작성하며 생각 정리중......!


// 상수 선언
const API_KEY = process.env.GROUNDWATER_API_KEY;
const BASE_URL = "https://www.gims.go.kr/api/data/observationStationService/getGroundwaterMonitoringNetwork";
const GENNUMS = ["5724", "9879", "11746", "11777", "65056", "73515", "73538", "82031", "82049", "84020", "514307", "514310"] as const;
const DEFAULT_DAYS = 30;
const MIN_DAYS = 1;
const MAX_DAYS = 365;

// 타입 선언
type UnitFromOpenApiT = {
    gennum: string,
    elev: string,
    wtemp: string,
    lev: string,
    ec: string,
    ymd: string
}

type TrendMetricT = {
    position: number | null,
    latestElev: number | null,
    latestYmd: string | null,
    minElev: number | null,
    maxElev: number | null,
}

type ResponseDataT = {
    table: DashboardTableData,
    geomap: Record<string, Record<string, number | null>>,
    trend: Record<string, TrendMetricT>
}

// 기본 30일, 최소 1일, 최대 365일 제한. 현재 30일만 사용하지만 확장성 고려.
function parseDaysParam(daysParam: string | null) {
    if(!daysParam) return DEFAULT_DAYS;
    const parsed = Number(daysParam);

    if(!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        return DEFAULT_DAYS;
    }

    if(parsed < MIN_DAYS) {
        return MIN_DAYS;
    }

    if(parsed > MAX_DAYS) {
        return MAX_DAYS;
    }

    return parsed;
}

function formatDateToParam(date: Date) {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return `${year}${month}${day}`;
}

// OPEN API용 Params : 오늘로부터 (days - 1)일전까지
function getApiParams(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const days = parseDaysParam(params.get("days"));
    const today = new Date();

    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
    const begindate = formatDateToParam(start);
    const enddate = formatDateToParam(today);

    return { begindate: begindate, enddate: enddate };
}


// 각 관측소별 fetch 요청
async function fetchFromEachStation(gennum: string, begindate: string, enddate: string) {
    if(!API_KEY) throw new Error("Missing API_KEY");

    const url = `${BASE_URL}?KEY=${API_KEY}&type=JSON&gennum=${gennum}&begindate=${begindate}&enddate=${enddate}`;
    const resp = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(!resp.ok) throw new Error(`OPEN API 오류: ${resp.status}`);
    const json = await resp.json();

    return (json.response?.resultData ?? []); // UnitFromOpenApiT[];
}


// 테이블용 데이터로 가공
function transformToTableData(rawData: Record<string, UnitFromOpenApiT[]>) {
    // 날짜 Set생성 : 결측일 있기 때문에 해야겠네...
    const dateSet = new Set<string>();
    for(const unitRows of Object.values(rawData)) { // unitRows: UnitFromOpenApiT[];
        unitRows.forEach(unit => dateSet.add(unit.ymd));
    }
    const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));

    // 현황 데이터 O(n*n*nlogn) => 나중에 고칠 방법!
    const tableRows = dates.map((date, dateIdx) => {
        const tableRow: Record<string, Array<(string | number | null)> | string> = { ymd: date };

        // OPEN API에서 순서 보장하고 있다.=>!!!!!!! Join
        for(const [gen, unitRows] of Object.entries(rawData)) {
            const foundRow = unitRows.find(unit => unit.ymd === date);
            if(foundRow) {
                const elev = foundRow.elev;
    
                if(foundRow.ymd === dates[0]) {
                    tableRow[gen] = [elev, null];
                } else {
                    tableRow[gen] = [elev, ];
                }
            } else {
                tableRow[gen] = []; // null이 아니게 되었음 영향받는 것들 생각
            }
        }
        return tableRow;
    });

    // Diff 데이터 : 그냥 Diff랑 현황 하나의 배열로 묶자! 바꾸자!
    const tableDiffRows = dates.map(date => {
        const tableDiffRow: Record<string, string | number | null> = { ymd: date };
        tableRows.map((row, idx) => {
            if(row === null) return;

            // TODO 검토해봐야함
            //tableDiffRow.ymd = row.ymd;
            if(idx === 0) {
                GENNUMS.map((gen, idx) => {
                    tableDiffRow[gen] = null;
                });
            } else {
                const prevRow = tableRows[idx - 1];
                GENNUMS.map((gen, idx) => {
                    tableDiffRow[gen] = Number(prevRow[gen]) - Number(row[gen]);
                });
            };
        });
        return tableDiffRow;
    });

    return { tableRows: tableRows, tableDiffRows: tableDiffRows };
}

// 최근 N일 평균 지하수위
function averageLatest(units: number[], windowSize: number): number | null {
    if(units.length === 0) return null;
    
    const count = Math.min(windowSize, units.length);
    let sum = 0;

    // units는 과거 -> 최신 순서
    for(let i = units.length - count; i < units.length; i+= 1) {
        sum += units[i];
    }

    return Number((sum / count).toFixed(3));
}

// 지도용 데이터 가공
function transformToGeoMapData(rawData: Record<string, UnitFromOpenApiT[]>) {
    const geoMapData: Record<string, Record<string, number | null>> = {};

    for (const [gen, units] of Object.entries(rawData)) {
        const allElevs = units.map(unit => Number(unit.elev)).filter(value => Number.isFinite(value));
        if (allElevs.length === 0) {
            geoMapData[gen] = {elevMean1: null, elevMean7: null, elevMean14: null, elevMean30: null};
            continue;
        }

        geoMapData[gen] = {
            elevMean1: averageLatest(allElevs, 1),
            elevMean7: averageLatest(allElevs, 7),
            elevMean14: averageLatest(allElevs, 14),
            elevMean30: averageLatest(allElevs, 30),
        };
    }

    return geoMapData;
}


// 추세용 데이터 가공
function transformToTrendData(rawData: Record<string, UnitFromOpenApiT[]>) {
    const trendData: Record<string, TrendMetricT> = {};

    for(const [gen, units] of Object.entries(rawData)) {
        const validUnits = units.map(unit => {
            const elevNum = Number(unit.elev);
            return Number.isFinite(elevNum) ? { ...unit, elevNum } : null;
        }).filter((unit): unit is UnitFromOpenApiT & { elevNum: number } => {
            return unit !== null;
        });

        if(validUnits.length === 0) {
            trendData[gen] = {
                position: null,
                latestElev: null,
                latestYmd: null,
                minElev: null,
                maxElev: null,
            };
            continue; // 매우 중요!
        };

        const sortedUnits = [...validUnits].sort((a, b) => a.ymd.localeCompare(b.ymd));
        const latestUnit = sortedUnits[sortedUnits.length - 1];
        const elevations = sortedUnits.map(unit => unit.elevNum);
        const minElev = elevations.reduce((acc, cur) => Math.min(acc, cur), elevations[0]);
        const maxElev = elevations.reduce((acc, cur) => Math.max(acc, cur), elevations[0]);

        let position: number | null = null;
        if(sortedUnits.length >= 2 && maxElev !== minElev) {
            const positionRatio = (latestUnit.elevNum - minElev) / (maxElev - minElev);
            position = Math.max(0, Math.min(1, positionRatio));
        } else {
            position = 0.5;
        }

        trendData[gen] = {
            position: position,
            latestElev: latestUnit.elevNum ?? null,
            latestYmd: latestUnit.ymd ?? null,
            minElev: minElev,
            maxElev: maxElev,
        }
    }
    return trendData;
}

export async function GET(
    request: NextRequest
) {
    const {begindate, enddate} = getApiParams(request);
    const gennumList = GENNUMS;
    const responseData: ResponseDataT = {table: {}, geomap: {}, trend: {}};

    try {
        // 관측소별 일별 지하수 측정자료 받아오기
        const entries: (string | UnitFromOpenApiT[])[][] = await Promise.all( // => 시간 되면 allSetteled 고려
            gennumList.map((gen: string) =>
                fetchFromEachStation(gen, begindate, enddate)
                .then((units: UnitFromOpenApiT[]) => [gen, units])
            )
        );
        //console.log("=================== Fetch12번의 결과 entries의 배열로 ================================================");
        //console.log(entries);

        // 데이터 가공: 관측소별 전체 데이터 묶음 (entries를 객체로)
        const dataByStation: Record<string, UnitFromOpenApiT[]> = Object.fromEntries(entries);
        //console.log("=================== 관측소별 데이터로 바꾼것 dataByStation ================================================");
        //console.log(dataByStation);

        // 데이블 데이터
        responseData.table = transformToTableData(dataByStation);
        console.log("=================== 테이블데이터 ================================================");
        console.log(responseData.table);

        // 지도 데이터
        responseData.geomap = transformToGeoMapData(dataByStation);
        //console.log("=================== 지도데이터 ================================================");
        //console.log(responseData.geomap);

        // 추세 데이터
        responseData.trend = transformToTrendData(dataByStation);
        //console.log("=================== 추세 데이터 ================================================");
        //console.log(responseData.trend);

        return NextResponse.json(responseData);

    } catch(error) {
        return NextResponse.json({errorCode: 502, message: "OPEN API 오류 또는 네트워크 에러"});
    }   
}


/* ========================== REST API 명세서 작성중 ============================ */
// [현재 필요 데이터]
// = 지하수위 현황 테이블
// 일평균: [{5724: '105.79', 9879: '201.97', 11746: '55.22', ..., ymd: '20250929'}]
// 1일(일 단위 open api), 7일(일 단위 open api), 14일(일 단위 open api), 30일(일 단위 open api), 1년(년 단위 open api), 7년?(년 단위 open api) => 확장
// 확장하게 되면: [{5724: '105.79', 9879: '201.97', 11746: '55.22', ...}, {5724: '105.79', 9879: '201.97', 11746: '55.22', ...}, {5724: '105.79', 9879: '201.97', 11746: '55.22', ...}, ...]
// = 지도용
// 어떻게 가공할지 고민중
/* ============================================================================ */

// OPEN API에서 받아오는 데이터 형식
// json.response.resultData 부분만
// 관측소1, 1일치 받을때
/* 
[
  {
    gennum: '5724',
    elev: '105.79',
    wtemp: '16.05',
    lev: '2.54',
    ec: '1220',
    ymd: '20250929'
  }
]
 */

// 관측소1, 3일치 받을때
/* 
[
  {
    gennum: '5724',
    elev: '105.79',
    wtemp: '16.05',
    lev: '2.54',
    ec: '1220',
    ymd: '20250929'
  },
  {
    gennum: '5724',
    elev: '105.79',
    wtemp: '16.05',
    lev: '2.54',
    ec: '1220',
    ymd: '20250929'
  },
  {
    gennum: '5724',
    elev: '105.79',
    wtemp: '16.05',
    lev: '2.54',
    ec: '1220',
    ymd: '20250929'
  }
]
 */