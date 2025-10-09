'use client';
import { useEffect, useState } from "react";
import CustomTable from "@/components/CustomTable";
import genInfo from "@/data/gennumInfo.json";
import GeoMap from "./GeoMap";
import StationInfoBox from "../StationInfoBox";
import FeatureImportancePage from "./FeatureImportance";
import LineChartZoom from "./LineChartZoom";
import LineChartShade from "./LineChartShade";
import logoSrc from "../../../public/assets/logo_mulalim.svg";
import Image from "next/image";
import DashboardNavi from "./DashboardNavi";
import CustomButton from "../CustomButton";
import PerformanceIndicators from "./PerformanceIndicators";

const options = Object.entries(genInfo).map(([gen, { ["측정망명"]: name }]) => ({ key: gen, label: name }));

export default function DashBoardContents() {
    const [station, setStation] = useState<string>("5724"); // 검증용 기본값
    const [currElevDatas, setCurrElevDatas] = useState<Record<string, string>[]>([]);
    const [currMapDatas, setCurrMapDatas] = useState<Record<string, number>>({});
    
    const getCurrFetchDatas = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const resp = await fetch(`${baseUrl}/api/v1/dashboard/currentElev`, {
            method: "GET",
            mode: "cors",
            headers: { "Content-type": "application/json" },
        });
        const json = await resp.json();
        setCurrElevDatas(json.table);
        setCurrMapDatas(json.geomap);
    };

    useEffect(() => {
        getCurrFetchDatas();
    }, []);

    return (
        <>
            <div className="section d-section flex flex-col lg:flex-row gap-8 mb-12">
                <DashboardNavi
                    className="relative dash-navi-container d-group m-0 w-full lg:w-36 lg:shrink-0 flex flex-col gap-5 lg:justify-between"
                    pinned={
                        <div id="dashboard-navi" className="h-auto flex flex-row lg:flex-col gap-5 justify-end pt-7 transition-transform duration-150">
                            <div className="logo-box w-full flex justify-center  shrink-0">
                                <Image src={logoSrc} width={50} height={50} alt="로고" />
                            </div>

                            <div className="period-box lg:pt-12 shrink-0">
                                <label htmlFor="period-select">기간 선택</label>
                                <select
                                    onChange={(e) => { console.log(e.target.value); }}
                                    name="period-select"
                                    id="period-select"
                                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-between"
                                >
                                    <option value="1" defaultValue="selected">1일</option>
                                    <option value="7">7일</option>
                                    <option value="14">14일</option>
                                    <option value="30">30일</option>
                                </select>
                            </div>

                            <div className="gen-box shrink-0">
                                <label htmlFor="gen-select">관측소 선택</label>
                                <select
                                    onChange={(e) => { setStation(e.target.value); }}
                                    name="gen-select"
                                    id="gen-select"
                                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-between"
                                >
                                    {
                                        options.map(({ key, label }, idx) => (
                                            idx === 0
                                                ? <option key={key} value={key} defaultValue="selected">{label}</option>
                                                : <option key={key} value={key}>{label}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="btn-box shrink-0 flex items-center lg:flex-col">
                                <CustomButton caption="PNG로 저장" bType="button" bStyle="btn-style-3 h-full max-h-12 mr-4 lg:w-full lg:mb-4 lg:mr-0" />
                                <CustomButton caption="PDF로 저장" bType="button" bStyle="btn-style-3 h-full max-h-12 mr-4 lg:w-full lg:mb-4 lg:mr-0" />
                                <CustomButton caption="페이지 인쇄" bType="button" bStyle="btn-style-3 h-full max-h-12 lg:w-full" />
                            </div>
                        </div>
                    }
                    footer={
                        <div className="info-bar">
                            인포메이션 바 영역
                        </div>
                    }
                />
                <div className="w-full">
                    <div className="mb-12 d-group">
                        <p className="flex justify-between gap-2">
                            <span className="c-tit03">전국 대표 관측망 지하수위 현황</span>
                            <span>(평균)</span>
                        </p>
                        <CustomTable data={currElevDatas} columns={options.map(header => ({ "key": header.key, "label": header.label }))} />
                    </div>
                    <div className="flex gap-8 mb-12">
                        <div className="w-full d-group">
                            <p className="c-tit03">전국 대표 관측망 지도</p>
                            <GeoMap mapData={currMapDatas} handleClick={setStation} />
                        </div>
                        <div className="w-full d-group">
                            <div>
                                <StationInfoBox stationCode={station} />
                                {/* <div>해당 관측소의 최근 30일 지하수 그래프와 최근 10년간 월별 평균 수위</div> */}
                                <PerformanceIndicators />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-8 w-full d-group mb-12">
                        <div className="w-2/3">
                            <p className="c-tit03">수위 추세 그래프 (2014 ~ 2023)</p>
                            <LineChartZoom />
                        </div>
                        <div className="w-1/3">
                            수위 2차 지표 차트
                            <LineChartShade />
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="w-full d-group">
                            <div>수위 3차 지표 차트</div>
                            <div>수위 3차 지표 차트</div>
                            <div>수위 3차 지표 차트</div>
                        </div>
                        <div className="w-full d-group">
                            수위 자료 요약
                        </div>
                        <div className="w-full d-group">
                            <FeatureImportancePage />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
