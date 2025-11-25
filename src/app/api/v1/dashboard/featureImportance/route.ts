import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import Papa from "papaparse";
import { getStationId } from "@/lib/stationUtils";

// 타입
interface FeatureImportanceUnitT {
    feature: string;
    importance: number
}

// POST: csv를 json파일로 만들기 위한 임시 endpoint
export async function POST() {
    try{

      const csvFilePath = path.join(process.cwd(), `src/data/feature_importances_12.csv`);
      const jsonFilePath = path.join(process.cwd(), `src/data/feature_importances_12.json`);
      const csvData = await fs.readFile(csvFilePath, "utf-8");
      const jsonData = await Papa.parse(csvData, {header: true, dynamicTyping: true});
      await fs.writeFile(jsonFilePath, JSON.stringify(jsonData.data));
      
      return NextResponse.json({stateCode: 200, message: "OK"});
    } catch(error) {
      console.error(error);
      return NextResponse.json(
        { stateCode: 500, message: "Internal Server Error" },
        { status: 500 }
      );
    }
}


// GET
export async function GET(
    request: NextRequest
) {
  const params = request.nextUrl.searchParams;
  const stationCode = params.get("stationCode");

  // stationCode 없으면 return
  if (!stationCode) {
    return NextResponse.json(
      { message: "stationCode is required" },
      { status: 400 }
    );
  }

  const stationId = getStationId(stationCode);

  // 매핑되는 stationId 없으면 return
  if (stationId === null) {
    return NextResponse.json(
      { message: "Invalid stationCode" },
      { status: 400 }
    );
  }

  try {
    const jsonFilePath = path.join(process.cwd(), `src/data/feature_importances_${stationId}.json`);
    const jsonData = await fs.readFile(jsonFilePath, "utf-8");
    const parsedData: FeatureImportanceUnitT[] = JSON.parse(jsonData);

    const transformedData = parsedData.map(item => [item.feature, item.importance]);

    const resp = {
      stateCode: 200,
      message: "OK",
      data: {
        [stationCode]: transformedData,
      },
    };

    return NextResponse.json(resp);

  } catch (error: unknown) {
    console.error("Error in featureImportance GET route:", error);
    
    // error가 code 속성을 가진 객체인지 확인하는 타입 가드
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ message: `해당하는 파일을 찾을 수 없습니다. stationCode: ${stationCode ?? 'Unknown'}` }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}