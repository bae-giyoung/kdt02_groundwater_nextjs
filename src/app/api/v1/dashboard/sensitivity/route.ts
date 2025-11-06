import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "src/data/predict_analysis.json");
        const json = readFileSync(filePath, "utf8");
        const data = JSON.parse(json);

        if(data && data.stations_analisys) {
            const recordWithType = data.stations_analisys.map((record: any) => {
                const rainfall_val = parseFloat(record.increase_if_rainfall) ?? 0;
                const drought_val = parseFloat(record.decrease_if_drought) ?? 0;

                const diff = Math.abs((rainfall_val*1000 - drought_val*1000) / 1000);
                let type: string;

                // 복합형/강수형/가뭄형
                if(diff < 0.05) {
                    type = "복합형";
                } else if(rainfall_val > drought_val) {
                    type = "강수형";
                } else {
                    type = "가뭄형";
                }

                return {
                    ...record,
                    sensitive_type: type,
                }
            });

            data.stations_analisys = recordWithType;
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("민감도 파일을 읽고 가공하는 작업 중 오류 발생: ", error);
        return NextResponse.json({ code: 500, message: "Next Route에서 민감도 가공 작업 중 오류 발생" }, { status: 500 });
    }
}