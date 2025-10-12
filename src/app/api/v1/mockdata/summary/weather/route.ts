import { NextResponse, NextRequest } from "next/server";

// /api/v1/rawdata/summary/weather?station=1


const mockData1 = `
{
  "data" : {
      "series_raw": {
           "predicted": [[202509, 105.54], [202510, 105.54]],
           "rain_mm": [[202509, 105.54], [202510, 105.54]],
           "temp_c": [[202509, 105.53], [202510, 105.53]],
           "humidity_pct": [[202509, 105.53], [202510, 105.53]],
      },
  }
}
`;

const mockData2 = `
{
  "data" : {
      "series_raw": {
           "predicted": [[202509, 105.54], [202510, 105.54]],
           "rain_mm": [[202509, 105.54], [202510, 105.54]],
           "temp_c": [[202509, 105.53], [202510, 105.53]],
           "humidity_pct": [[202509, 105.53], [202510, 105.53]],
      },
  }
}
`;

//?station=1
function getSearchParams(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const station = params.get("station") ?? "1";
    return { station }
}

export async function GET(
    request : NextRequest
) {
    const { station } = getSearchParams(request);

    const data = Number(station) % 2 == 0 ? JSON.parse(mockData2) : JSON.parse(mockData1);

    return NextResponse.json(data);
}