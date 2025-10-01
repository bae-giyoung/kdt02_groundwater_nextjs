'use client';
import { useEffect, useState } from "react";
import CustomTable from "@/components/CustomTable";
import genInfo from "@/data/gennumInfo.json";
import GeoMapCluster from "../GeoMapCluster";
import StationInfoBox from "../StationInfoBox";
import FeatureImportancePage from "./FeatureImportance";

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
    <div className="section d-section">
        <div className="mb-12 d-group">
            <div className="flex gap-5 justify-end mb-12">
                <label htmlFor="period-select">기간 선택</label>
                <select name="period-select" id="period-select" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-[200px] justify-between">
                    <option value="1" defaultValue="selected">당일</option>
                    <option value="7">7일</option>
                    <option value="7">14일</option>
                    <option value="7">30일</option>
                </select>

                <label htmlFor="gen-select">관측소 선택</label>
                <select name="gen-select" id="gen-select" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-[200px] justify-between">
                    {
                        options.map(({key, label}, idx)=> (
                            idx == 0
                                ? <option key={key} value={key} defaultValue="selected">{label}</option>
                                : <option key={key} value={key}>{label}</option>
                        ))
                    }
                </select>
            </div>
            <p>지하 수위 현황</p>
            <CustomTable data={currElevDatas} columns={options.map(header => ({"key": header.key, "label": header.label}))} />
        </div>
        <div className="flex gap-8 mb-12">
            <div className="w-full d-group">
                <GeoMapCluster mapData={currMapDatas} />
            </div>
            <div className="w-full d-group">
                <div>
                    <StationInfoBox stationCode={station} />
                    <FeatureImportancePage />
                </div>
            </div>
        </div>
    </div>
    </>
  );
}