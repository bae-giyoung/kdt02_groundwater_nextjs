'use client';
import { useEffect, useState } from "react";
import CustomTable from "@/components/CustomTable";
import genInfo from "@/data/gennumInfo.json";
import GeoMapCluster from "../GeoMapCluster";
import StationInfoBox from "../StationInfoBox";
import FeatureImportancePage from "./FeatureImportance";
import LineChartZoom from "./LineChartZoom";

const options = Object.entries(genInfo).map(([gen, {["측정망명"]: name}]) => ({key: gen, label: name}));

export default function DashBoardContents() {
    const [station, setStation] = useState<string>("5724"); // 검색영역에서 사용할 것
    const [currElevDatas, setCurrElevDatas] = useState<Record<string, string>[]>([]);
    const [currMapDatas, setCurrMapDatas] = useState<Record<string, number>>({});
    
    const getCurrFetchDatas = async() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const resp = await fetch(`${baseUrl}/api/v1/dashboard/currentElev`, {
            method: "GET",
            mode: "cors",
            headers: { "Content-type" : "application/json" },
        });
        const json = await resp.json();
        setCurrElevDatas(json.table);
        setCurrMapDatas(json.geomap);
        //console.log(json);
    }     

    useEffect(() => {
        getCurrFetchDatas();
    }, []);

  return (
    <>
    <div className="section d-section flex flex-col lg:flex-row gap-8 mb-12">
        <div className="dash-navi d-group m-0 w-full lg:w-36 lg:shrink-0 flex flex-col gap-5 lg:justify-between">
            <div className="flex flex-row lg:flex-col gap-5 justify-end">
                <div>
                    <label htmlFor="period-select">기간 선택</label>
                    <select onChange={(e) => {console.log(e.target.value)}} name="period-select" id="period-select" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-[200px] justify-between">
                        <option value="1" defaultValue="selected">당일</option>
                        <option value="7">7일</option>
                        <option value="14">14일</option>
                        <option value="30">30일</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="gen-select">관측소 선택</label>
                    <select onChange={(e) => {console.log(e.target.value)}} name="gen-select" id="gen-select" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-[200px] justify-between">
                        {
                            options.map(({key, label}, idx)=> (
                                idx == 0
                                    ? <option key={key} value={key} defaultValue="selected">{label}</option>
                                    : <option key={key} value={key}>{label}</option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    버튼 모음
                    다운로드 2종, p 버튼
                </div>
            </div>
            <div>
                인포메이션 호버 아이콘
            </div>
        </div>
        <div className="w-full">
            <div className="mb-12 d-group">
                <p className="flex justify-between gap-2">
                    <span>지하수위 현황</span>
                    <span>(일 평균)</span>
                </p>
                <CustomTable data={currElevDatas} columns={options.map(header => ({"key": header.key, "label": header.label}))} />
            </div>
            <div className="flex gap-8 mb-12">
                <div className="w-full d-group">
                    <GeoMapCluster mapData={currMapDatas} />
                </div>
                <div className="w-full d-group">
                    <div>
                        <StationInfoBox stationCode={station} />
                        <div>해당 관측소의 최근 30일 지하수위 그래프</div>
                    </div>
                </div>
            </div>
            <div className="flex gap-8 w-full d-group mb-12">
                <div className="w-2/3">
                    <p className="c-tit03">장기 추세 그래프 (2014 ~ 2023)</p>
                    <LineChartZoom />
                </div>
                <div className="w-1/3">
                    여기 2개 정도 넣기
                    <FeatureImportancePage />
                </div>
            </div>
            <div className="flex gap-8">
                <div className="w-full d-group">
                    <div>여기 3개 정도 넣기</div>
                    <div>여기 3개 정도 넣기</div>
                    <div>여기 3개 정도 넣기</div>
                </div>
                <div className="w-full d-group">여기 넣을 것</div>
                <div className="w-full d-group">여기 넣을 것</div>
            </div>
        </div>
    </div>
    </>
  );
}