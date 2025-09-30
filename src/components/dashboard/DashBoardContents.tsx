'use client';
import { useEffect, useState } from "react";
import CustomTable from "@/components/CustomTable";
import genInfo from "@/data/gennumInfo.json";

type currElevDataType = {
    string: string
}

const currElevDataHeaders = Object.keys(genInfo);

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
    
            /* ========================== 매우 복잡 반드시 간단하게 고쳐야 함!!!!!!! ============================ */
            const newDataObject = {}
            // 클라이언트가 아닌 next 서버에서 가공하는 것으로 바꾸자
            json.forEach(item => newDataObject[item[0]["gennum"]] = item[0]["elev"]);
            console.log(newDataObject);
            setCurrElevDatas([newDataObject]);
            // {5724: '105.79', 9879: '201.97', 11746: '55.22', 11777: '77.52', 65056: '80.65', 73515: '140.85', 73538: '125.5', 82031: '224.059', 82049: '214.352', 84020: '28.223', 514307: '3.03', 514310: '113.65'}
            /* ============================================================================================= */
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
        {<CustomTable data={currElevDatas} columns={currElevDataHeaders.map((genCode, idx) => {return {"key": genCode, "label": genInfo[genCode]["측정망명"]}})} />}
    </div>
    <div className="section">
        지도 영역
    </div>
    </>
  );
}