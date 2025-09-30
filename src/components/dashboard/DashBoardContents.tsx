'use client';
import { useEffect, useState } from "react";
import CustomTable from "@/components/CustomTable";
import genInfo from "@/data/gennumInfo.json";
import GeoMapCluster from "../GeoMapCluster";

const options = Object.entries(genInfo)
                    .map(([gen, {["측정망명"]: name}]) => ({key: gen, label: name}));

export default function DashBoardContents() {
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
        console.log(json);
    }

    useEffect(() => {
        getCurrFetchDatas();
    }, []);

  return (
    <>
    <div className="section">
        <div className="mb-12">
            검색 영역
        </div>
        <div className="mb-12">
           <CustomTable data={currElevDatas} columns={options.map(header => ({"key": header.key, "label": header.label}))} />
        </div>
        <div className="flex gap-8 mb-12">
            <div>
                <GeoMapCluster mapData={currMapDatas} />
            </div>
            <div></div>
        </div>
    </div>
    </>
  );
}