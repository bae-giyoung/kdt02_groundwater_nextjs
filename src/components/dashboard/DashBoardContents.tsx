'use client';
import CustomTable from "@/components/CustomTable";
import { useEffect, useState } from "react";

type currElevData = {
    "gennum": number,
    "elev": number,
    "wtemp": number,
    "lev": number,
    "ec": number,
    "ymd": number
}

const currElevDataHeaders = {
    "gennum": "관측소",
    "elev": "수위",
    "wtemp": "수온",
    "lev": "뭐지",
    "ec": "뭐지",
    "ymd": "관측일자"
}

export default function DashBoardContents() {
    const [currElevDatas, setCurrElevDatas] = useState<currElevData[]>([]);
    
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
    
            setCurrElevDatas([json]);
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
        {<CustomTable data={currElevDatas} columns={Object.keys(currElevDataHeaders).map((k, v) => {return {"key": k, "label": v}})} />}
    </div>
    </>
  );
}