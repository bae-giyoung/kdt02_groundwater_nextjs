import { NextRequest, NextResponse } from "next/server";

type currentElevParamType = {
    gennum?: string,
    begindate?: string,
    enddate?: string,
}

export async function GET(
    request: NextRequest,
    {params} : {params: Promise<currentElevParamType>}
) {
    const baseUrl = "https://www.gims.go.kr/api/data/observationStationService/getGroundwaterMonitoringNetwork";
    const apiKey = process.env.NEXT_PUBLIC_GROUNDWATER_API_KEY;
    //const gennum = "65004";
    const begindate = "20250929";
    const enddate = "20250929";
    const allGennum = ["5724", "9879", "11746", "11777", "65056", "73515", "73538", "82031", "82049", "84020", "514307", "514310"];
    const allElev = [];
    
    try {
        for(const gen of allGennum) { // 이러면 안되는데 multiGennum 지원하는지 api 명세 찾아보기 => 공공데이터 센터 화재로 추후 확인
            const url = `${baseUrl}?KEY=${apiKey}&type=JSON&gennum=${gen}&begindate=${begindate}&enddate=${enddate}`;
            const resp = await fetch(url, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-type" : "application/json",
                },
            });
            const json = await resp.json();
            allElev.push(json.response.resultData);
            //console.log(json.response.resultData);
        }

        return NextResponse.json(allElev);

    } catch (error) {
        return NextResponse.json({"errorCode": 404, "message": "OPEN API의 문제로 데이터를 받아올 수 없습니다."}); // 에러 코드 찾아보기
    }

}