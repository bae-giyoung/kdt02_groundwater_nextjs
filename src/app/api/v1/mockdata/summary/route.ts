import { NextRequest, NextResponse } from 'next/server';

// [백엔트 URL - 3년 예측 요약(월별)]
// http://10.125.121.211:8080/api/v1/rawdata/summary/predict?station=1&timestep=monthly&horizons=36


type MockRow = [number, number, number, number, number];

const baseRows: MockRow[] = [
  [1, 202210, 105.52356, 105.52806, 0.0045],
  [1, 202211, 105.34889, 105.34706, 0.00183],
  [1, 202212, 105.22437, 105.21767, 0.0067],
  [1, 202301, 105.19151, 105.18313, 0.00838],
  [1, 202302, 105.14629, 105.13758, 0.00871],
  [1, 202303, 105.15216, 105.14237, 0.00979],
  [1, 202304, 105.23515, 105.22404, 0.01111],
  [1, 202305, 105.53776, 105.53333, 0.00443],
  [1, 202306, 105.72078, 105.72236, 0.00158],
  [1, 202307, 106.15873, 106.16094, 0.00221],
  [1, 202308, 105.96557, 105.96907, 0.0035],
  [1, 202309, 105.92297, 105.9276, 0.00463],
  [1, 202310, 105.62127, 105.62489, 0.00362],
  [1, 202311, 105.51768, 105.52138, 0.0037],
  [1, 202312, 105.55457, 105.55545, 0.00088],
];

const secondaryRows: MockRow[] = baseRows.map(([station, yyyymm, obs, pred]) => [
  station,
  yyyymm,
  obs * 1.001,
  pred * 0.999,
  Math.abs(pred - obs) * 1.05,
]);

const mockResponses = [
  {
    table: {
      table_data_3y: baseRows,
      columns: ['station', 'yyyymm', 'observed', 'predicted', 'mean_error'],
    },
    metrics: {
      RMSE: 0.075748354,
      R2: 0.92311292886734,
      KGE: 0.916392163649712,
      NSE: 0.92311292886734,
    },
  },
  {
    table: {
      table_data_3y: secondaryRows,
      columns: ['station', 'yyyymm', 'observed', 'predicted', 'mean_error'],
    },
    metrics: {
      RMSE: 0.082345612,
      R2: 0.901223178,
      KGE: 0.902145331,
      NSE: 0.901223178,
    },
  },
];

function getSearchParams(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const station = params.get('station') ?? '1';
  const timestep = params.get('timestep') ?? 'monthly';
  const horizons = params.get('horizons') ?? '36';
  return { station, timestep, horizons };
}

export async function GET(request: NextRequest) {
  const { station } = getSearchParams(request);
  const index = Math.abs(Number.parseInt(station, 10)) % mockResponses.length;
  const payload = mockResponses[index] ?? mockResponses[0];
  return NextResponse.json(payload);
}
