'use client';
import { useEffect, useState, useMemo } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ExportingModule from 'highcharts/modules/exporting';
import ExportDataModule from 'highcharts/modules/export-data';
import OfflineExportingModule from 'highcharts/modules/offline-exporting';

// Highcharts Exporting 모듈 임포트: 클라이언트에서 한번만 실행
if (typeof window !== 'undefined') {
  const win = window as typeof window & { Highcharts?: typeof Highcharts; _Highcharts?: typeof Highcharts };

  win.Highcharts = win.Highcharts || Highcharts;
  win._Highcharts = win._Highcharts || Highcharts;

  if (!(Highcharts.Chart && (Highcharts.Chart.prototype as any).exportChart)) {
    (ExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (ExportDataModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
    (OfflineExportingModule as unknown as (H: typeof Highcharts) => void)(Highcharts);
  }
}

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
            align: 'left',
        },
        credits: {
            enabled: false
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
        exporting: {
            enabled: true,
            filename: '기상-지하수위 상관 그래프',
            buttons: {
                contextButton: {
                    menuItems: [
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                    ],
                    symbol: 'menu',
                    align: 'right',
                }
            }
        },
        lang: {
            downloadPNG: 'PNG 이미지로 다운로드',
            downloadJPEG: 'JPEG 이미지로 다운로드',
            downloadPDF: 'PDF 파일로 다운로드',
            downloadSVG: 'SVG 이미지로 다운로드',
            contextButtonTitle: '메뉴'
        },
        series: [{
            type: 'pie',
            name: '특성 중요도',
            data: data
        }]

    }), [data]);


    return (
        <div>
            <p className="c-tit03">특성 중요도</p>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                containerProps={{className: 'pie-chart-container', style: {width: "100%", height: 400}}}
                immutable
            />
        </div>
    );
}