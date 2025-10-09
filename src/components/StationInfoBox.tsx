'use client';
import genInfo from "@/data/gennumInfo.json"; // 중복으로 import인데 나중에 생각

export default function StationInfoBox({stationCode} : {stationCode: string}) {
    const station = genInfo[stationCode]; // 타입스크립트 에러
    return (
        <div className="overflow-x-auto">
            <p className="c-tit03"><span className="point-c-01">{station["측정망명"]}</span> 관측소 정보</p>
            <div className="table-container">
                <table className="min-w-full border-collapse border text-sm text-left">
                    <colgroup>
                        <col width={"15%"} />
                        <col width={"30%"} />
                        <col width={"15%"} />
                        <col width={"30%"} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">측정망명</th>
                            <td className="border px-3 py-2 bg-white">{station["측정망명"]}</td>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">종류</th>
                            <td className="border px-3 py-2 bg-white">{station["종류"]}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">대권역</th>
                            <td className="border px-3 py-2 bg-white">{station["대권역"]}</td>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">중권역</th>
                            <td className="border px-3 py-2 bg-white">{station["중권역"]}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">주소</th>
                            <td colSpan={3} className="border px-3 py-2">{station["주소"]}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">위도</th>
                            <td className="border px-3 py-2 bg-white">{station["lat"]}</td>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">경도</th>
                            <td className="border px-3 py-2 bg-white">{station["lon"]}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">설치년도</th>
                            <td className="border px-3 py-2 bg-white">{station["설치년도"]}</td>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">설치심도</th>
                            <td className="border px-3 py-2 bg-white">{station["설치심도"]}</td>
                        </tr>
                        <tr>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">수리전도도(cm/sec)</th>
                            <td className="border px-3 py-2 bg-white">{station["수리전도도(cm/sec)"]}</td>
                            <th scope="row" className="bg-gray-ed border px-3 py-2 font-medium">표고(EL.m)</th>
                            <td className="border px-3 py-2 bg-white">{station["표고(EL.m)"]}</td>
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