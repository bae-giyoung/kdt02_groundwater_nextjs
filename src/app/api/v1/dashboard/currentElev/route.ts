import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GROUNDWATER_API_KEY;
const BASE_URL = "https://www.gims.go.kr/api/data/observationStationService/getGroundwaterMonitoringNetwork";
const GENNUMS = ["5724", "9879", "11746", "11777", "65056", "73515", "73538", "82031", "82049", "84020", "514307", "514310"];

type UnitFromOpenApiT = {
    gennum: string,
    elev: string,
    wtemp: string,
    lev: string,
    ec: string,
    ymd: string
}

type ResponseDataT = {
    table: Record<string, string | number | null>[],
    geomap: Record<string, number>
}

function getSearchParams(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const begindate = params.get("begindate") ?? "20250929";
    const enddate = params.get("enddate") ?? "20250929";
    return { begindate, enddate }
}

// 각 관측소별 fetch 요청
async function fetchFromEachStation(gennum: string, begindate: string, enddate: string) {
    if(!API_KEY) throw new Error("Missing API KEY");
    // [TODO]
    // 캐시되어이있으면 그대로 사용 vs client에서 저장해두고 재 클릭은 얼리 리턴, 캐싱할지 고민
    // 0시에 데이터 없는 경우도 생각

    const url = `${BASE_URL}?KEY=${API_KEY}&type=JSON&gennum=${gennum}&begindate=${begindate}&enddate=${enddate}`;

    const resp = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {"Content-type" : "application/json"},
    });
    if(!resp.ok) throw new Error(`OPEN API 오류 ${resp.status}`);
    const json = await resp.json();
    return (json.response?.resultData ?? []); //UnitFromOpenApiT[]
}

// 테이블용 데이터로 가공
function transformToTableData(oriData: Record<string, UnitFromOpenApiT[]>) {
    const dateSet = new Set<string>();
    for(const unitRows of Object.values(oriData)) { // UnitfromOpenApiT[]
        unitRows.forEach(v => dateSet.add(v.ymd));
    }
    const dates = Array.from(dateSet).sort();

    const tableData = dates.map(date => {
        const row: Record<string, string | number | null> = { ymd: date };
        for(const [gen, unitRows] of Object.entries(oriData)) {
            const foundRow = unitRows.find(obj => obj.ymd === date);
            if(foundRow) {
                row[gen] = Number(foundRow.elev);
            } else {
                row[gen] = null;
            }
        }
        return row;
    });
    return tableData;
}

// 지도용 데이터 가공
function transformToGeoMapData(oriData: Record<string, UnitFromOpenApiT[]>) {
        const data: Record<string, number> = {};
        Object.entries(oriData).forEach((d) => data[d[0]] = d[1].reduce((acc, unit) => Number(acc) + Number(unit.elev), Number(d[1][0].elev))/d[1].length);
        return data;
}

// GET
export async function GET(
    request: NextRequest
) {
    const { begindate, enddate } = getSearchParams(request);
    const gennumList = GENNUMS;
    const responseData : ResponseDataT = {table: [], geomap: {}};

    /* try { */
        // 관측소별 현황 데이터 받아오기: entries의 배열로
        const entires = await Promise.all( // => allSettled로
            gennumList.map(gen => 
                fetchFromEachStation(gen, begindate, enddate)
                .then(unitRows => [gen, unitRows])
            )
        );
        // 데이터 가공: entries를 객체로
        const dataByStation: Record<string, UnitFromOpenApiT[]> = Object.fromEntries(entires);
        //console.log(dataByStation); // 관측소별 전체 데이터 묶음

        // 데이블 데이터
        responseData.table = transformToTableData(dataByStation);

        // 지도 데이터
        responseData.geomap = transformToGeoMapData(dataByStation);
        console.log("=================== 지도데이터 ================================================");
        console.log(responseData.geomap);

        return NextResponse.json(responseData);

    /* } catch(error) {
        return NextResponse.json({errorCode: 502, message: "OPEN API 오류 또는 네트워크 에러"});
    } */
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