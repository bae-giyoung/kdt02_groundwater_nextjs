'use client';
import { useEffect, useState } from "react";
import CustomTable from "@/components/CustomTable";
import genInfo from "@/data/gennumInfo.json";

type currElevDataType = {
    string: string
}

const currElevDataHeaders = Object.keys(genInfo).map(gen => [gen, genInfo[gen]["측정망명"]]);

export default function DashBoardContents() {
    const [currElevDatas, setCurrElevDatas] = useState<currElevDataType[]>([]);
    
        const getCurrElevDatas = async() => {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const resp = await fetch(`${baseUrl}/api/v1/dashboard/currentElev`, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-type" : "application/json",
                },
            });
            const json = await resp.json();
            console.log(json);
            setCurrElevDatas(json);
        }
    
        useEffect(() => {
            getCurrElevDatas();
        }, []);

  return (
    <>
    <div className="section">
        검색 영역
    </div>
    <div className="section">
        {<CustomTable data={currElevDatas} columns={currElevDataHeaders.map(header => {return {"key": header[0], "label": header[1]}})} />}
    </div>
    <div className="section">
        지도 영역
    </div>
    </>
  );
}