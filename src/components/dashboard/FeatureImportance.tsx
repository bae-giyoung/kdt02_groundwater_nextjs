'use client';
import { useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

export default function FeatureImportancePage() {
    useEffect(() => {
        /* 개발중에만 사용하는 코드(원천 데이터 부족): csv => json으로 바꿀 때만 사용하는 코드 */
        /* try {
            const result = fetchCSVToJSON();
            if(result == 'SUCCESS') console.log('임시 CSV 파일을 JSON파일로 전환 성공, 추후 확정 파일로 전환');
            else console.log('CSV 파일 전환 실패');
        } catch (error) {
            console.error("CSV 파일 전환 실패", error);
        } */

    },[]);


    return (
        <div>
            특성 중요도
        </div>
    );
}