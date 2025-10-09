'use client';
import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState, useMemo } from "react";

// 타입
type FeatureT = [
    feature: string,
    importance: number
]
interface FeatureImportanceDataT {
    stateCode: number, // HTTP Status Code 타입은 없나
    message: string,
    data: FeatureT[]
}

// 상수
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// (삭제 예정 함수)개발중 임시 코드와 엔드포인트: 테스트용 파일을 json으로 변환
const fetchCSVToJSON = async() => {
    const resp = await fetch(`${BASE_URL}/api/v1/dashboard/featureImportance`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-type" : "application/json" },
    });
    if(resp.ok) {
        const json = await resp.json();
        return json.stateCode === 200 ? 'SUCCESS' : 'FAIL';
    }
    else return 'FAIL';
}

// 데이터 가져오기
const fetchData = async() => {
    const resp = await fetch(`${BASE_URL}/api/v1/dashboard/featureImportance`, {
        headers: { "Content-type" : "application/json" },
        method: "GET",
        mode: "cors"
    });
    if(resp.ok) {
        const data = await resp.json();
        return data;
    } else return resp.body; // 정확한 구조 확인
}

export default function FeatureImportancePage() {
    const [data, setData] = useState<FeatureT[]>([]);

    useEffect(() => {
        const data = fetchData().then(res => {
            if(res.stateCode !== 200) return;
            setData(res.data);
        });
    },[]);

    const options = useMemo<Highcharts.Options>(()=> ({
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        title: {
            text: '특성 중요도',
            align: 'left'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: '특성 중요도',
            data: data
        }]

    }), [data]); // 궁금증: 참조타입의 내부 속성이 변화되는 것도 감지하는가?


    return (
        <div>
            <p className="c-tit03">특성 중요도</p>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                containerProps={{style: {width: "100%", height: 400}}}
                immutable
            />
        </div>
    );
}