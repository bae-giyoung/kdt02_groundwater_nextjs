'use client';
import genInfo from "@/data/gennumInfo.json"; // 중복으로 import인데 나중에 생각
import type { GenInfoKey } from '@/types/uiTypes';

export default function StationInfoBox({stationCode} : {stationCode: GenInfoKey}) {
    const station = genInfo[stationCode];
    return (
        <div className="overflow-x-auto">
            <p className="c-tit03">관측소 정보</p>
            <div className="table-style02 table-container">
                <table className="min-w-full text-sm text-left">
                    <colgroup>
                        <col width={"15%"} />
                        <col width={"30%"} />
                        <col width={"15%"} />
                        <col width={"30%"} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th scope="row">측정망명</th>
                            <td>{station["측정망명"]}</td>
                            <th scope="row">종류</th>
                            <td>{station["종류"]}</td>
                        </tr>
                        <tr>
                            <th scope="row">대권역</th>
                            <td>{station["대권역"]}</td>
                            <th scope="row">중권역</th>
                            <td>{station["중권역"]}</td>
                        </tr>
                        <tr>
                            <th scope="row">설치년도</th>
                            <td>{station["설치년도"]}</td>
                            <th scope="row">설치심도</th>
                            <td>{station["설치심도"]}</td>
                        </tr>
                        <tr>
                            <th scope="row">수리전도도(cm/sec)</th>
                            <td>{station["수리전도도(cm/sec)"]}</td>
                            <th scope="row">표고(EL.m)</th>
                            <td>{station["표고(EL.m)"]}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* 
"5724": {
    "대권역": "섬진강",
    "중권역": "요천",
    "종류": "국가관리측정망",
    "측정망명": "남원도통",
    "주소": "전북특별자치도 남원시 도통동 554",
    "lat": "35.41968333",
    "lon": "127.4004639",
    "설치년도": "19951227",
    "설치심도": "20",
    "수리전도도(cm/sec)": "0.0132",
    "표고(EL.m)": "108.29"
},
*/