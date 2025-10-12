import { NextResponse, NextRequest } from "next/server";

// /api/v1/rawdata/summary/weather?station=1


const mockData1 = `
{
  "data" : {
      "series_raw": {
           "predicted": [[202101, 105.24], [202102, 105.54], [202103, 105.44], [202104, 105.24],[202105, 105.14], [202106, 105.24], [202107, 105.14], [202108, 105.34], [202109, 105.24], [202110, 105.54], [202111, 105.44], [202112, 105.24]],
           "rain_mm": [[202101, 105.24], [202102, 105.54], [202103, 105.44], [202104, 105.24],[202105, 105.14], [202106, 105.24], [202107, 105.14], [202108, 105.34], [202109, 105.24], [202110, 105.54], [202111, 105.44], [202112, 105.24]],
           "temp_c": [[202101, 105.24], [202102, 105.54], [202103, 105.44], [202104, 105.24],[202105, 105.14], [202106, 105.24], [202107, 105.14], [202108, 105.34], [202109, 105.24], [202110, 105.54], [202111, 105.44], [202112, 105.24]],
           "humidity_pct": [[202101, 105.24], [202102, 105.54], [202103, 105.44], [202104, 105.24],[202105, 105.14], [202106, 105.24], [202107, 105.14], [202108, 105.34], [202109, 105.24], [202110, 105.54], [202111, 105.44], [202112, 105.24]]
      }
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
           "humidity_pct": [[202509, 105.53], [202510, 105.53]]
      }
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