import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import Papa from "papaparse";

// 타입
type featureImportanceUnitT = {
    feature: string,
    importance: number
}

// POST: 나중에 지우자!
export async function POST(
    request: NextRequest
) {
    try{
        const csvFilePath = path.join(process.cwd(), "src/data/feature_importance.csv");
        const jsonFilePath = path.join(process.cwd(), "src/data/feature_importance.json");
        const csvData = await fs.readFile(csvFilePath, "utf-8");
        const jsonData = await Papa.parse(csvData, {header: true, dynamicTyping: true});
        await fs.writeFile(jsonFilePath, JSON.stringify(jsonData.data));
        console.log(csvData);
        console.log(jsonData);
        
        return NextResponse.json({stateCode: 200, message: "OK"});
    } catch(error) {
        console.error(error);
        return NextResponse.json({stateCode: 500, message: "Internal Server Error"});
    }
}


// GET
export async function GET(
    request: NextRequest
) {
  try {
    const jsonFilePath = path.join(process.cwd(), "src/data/feature_importance.json");
    const jsonData = await fs.readFile(jsonFilePath, "utf-8");

    // 데이터 가공: 파이차트용
    const data = JSON.parse(jsonData);
    const transforedData = data.map((d : featureImportanceUnitT) => [d.feature, Number(d.importance)]);
    const resp = {
      stateCode: 200,
      message: "OK",
      data: transforedData,
    };

    console.log("========================= 특성 중요도 확인용 ========================");
    console.log("jsonData", jsonData, "typeof jsonData: ", typeof jsonData);
    console.log("data", data, "typeof data: ", typeof data);
    console.log("transforedData", transforedData, "typeof transforedData: ", typeof transforedData);
    console.log("resp", resp, "typeof resp: ", typeof resp);
    // jsonData : fs.readFile(경로, 인코딩)의 결과는 string
    // data: JSON.parse(jsonData)는 Object

    // 자료구조 확인용 temp
    return NextResponse.json(resp);

  } catch(error) {
    return NextResponse.json({stateCode: 500, message: "Internal Server Error"});
  }
}

/* ===================== 데이터 형식 참고용 */
/* 
======= CSV ========
feature,importance
elev_lag_7,0.842421
강수량(mm)_7d_sum,0.117327
elev_lag_30,0.010217
wtemp,0.003284
ec_lag_7,0.003282
month,0.002228
지면온도(°C)_3d_mean,0.002089
강수량(mm)_3d_sum,0.001887
elev_30_sum,0.001724
elev_14_mean,0.00169
elev_30_mean,0.001684
K_times_precip_3,0.001676
ec_lag_30,0.001498
elev_14_sum,0.001458
day,0.001276
month_sin,0.001121
ec_lag_14,0.0009
기온(°C)_3d_mean,0.0007


======= JSON =======
{
  data: [
    { feature: 'elev_lag_7', importance: 0.842421 },
    { feature: '강수량(mm)_7d_sum', importance: 0.117327 },
    { feature: 'elev_lag_30', importance: 0.010217 },
    { feature: 'wtemp', importance: 0.003284 },
    { feature: 'ec_lag_7', importance: 0.003282 },
    { feature: 'month', importance: 0.002228 },
    { feature: '지면온도(°C)_3d_mean', importance: 0.002089 },
    { feature: '강수량(mm)_3d_sum', importance: 0.001887 },
    { feature: 'elev_30_sum', importance: 0.001724 },
    { feature: 'elev_14_mean', importance: 0.00169 },
    { feature: 'elev_30_mean', importance: 0.001684 },
    { feature: 'K_times_precip_3', importance: 0.001676 },
    { feature: 'ec_lag_30', importance: 0.001498 },
    { feature: 'elev_14_sum', importance: 0.001458 },
    { feature: 'day', importance: 0.001276 },
    { feature: 'month_sin', importance: 0.001121 },
    { feature: 'ec_lag_14', importance: 0.0009 },
    { feature: '기온(°C)_3d_mean', importance: 0.0007 }
  ],
  errors: [],
  meta: {
    delimiter: ',',
    linebreak: '\r\n',
    aborted: false,
    truncated: false,
    cursor: 400,
    renamedHeaders: null,
    fields: [ 'feature', 'importance' ]
  }
}
 POST /api/v1/dashboard/featureImportance 200 in 555ms

*/