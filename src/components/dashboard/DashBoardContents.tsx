'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom } from 'jotai';
import { openModalAtom } from '@/atoms/atoms';
import CurrentTable from "./CurrentTable";
import genInfo from "@/data/gennum_info.json";
import GeoMap from "./GeoMap";
import logoSrc from "../../../public/assets/logo_mulalim.svg";
import Image from "next/image";
import DashboardNavi from "./DashboardNavi";
import CustomButton from "../CustomButton";
import { LiaExclamationCircleSolid } from "react-icons/lia";
import type { GenInfoKey, StatusPoint } from "@/types/uiTypes";
import BarChart from "./BarChart";
import type { DashboardTableData, DashboardTableRow, DashboardTableDiffRow, SensitivityRecord } from "@/types/uiTypes";
import ForecastNext7Days from "./ForecastNext7Days";
import { useFetchSensitivityData } from "@/hooks/useFetchSensitivityData";
import HorizontalBarChart from "./HorizontalBarChart";
import DashboardModalContent from "./DashBoardModalContent";
import StationInfoCard from "./StationInfoCard";
import apiRoutes from "@/lib/apiRoutes";

/**
 * 설명 적어두자
 * *********************************************************************************************************************
 * @ 
 * @ 
 * @ 
 * @
*/

// 상수 선언
const options = Object.entries(genInfo).map(([gen, { ["측정망명"]: name }]) => ({ key: gen, label: name }));
const GEN_CODES = Object.keys(genInfo);
const GEN_NAMES = Object.values(genInfo).map(({ ["측정망명"]: name }) => name);
const CAPTURE_TARGET_NOT_FOUND = 'CAPTURE_TARGET_NOT_FOUND';
const TABLE_WINDOW_DAYS = 30;

// 타입 선언
type TrendMetricT = {
    position: number | null;
    latestElev: number | null;
    latestYmd: string | null;
    minElev: number | null;
    maxElev: number | null;
};

type DashboardApiResponse = {
    table?: DashboardTableData;
    barChart?: Record<string, Record<string, number | null>>; 
    groundwaterStatus?: StatusPoint[];
};


// 컴포넌트
export default function DashBoardContents() {
    const [station, setStation] = useState<GenInfoKey>("84020");
    const [period, setPeriod] = useState<string>("1");
    const [currElevDatas, setCurrElevDatas] = useState<DashboardTableRow[]>([]);
    const [currElevDiffDatas, setCurrElevDiffDatas] = useState<DashboardTableDiffRow[]>([]);
    const [currBarChartDatas, setCurrBarChartDatas] = useState<Record<string, Record<string, number | null>>>({});
    const [groundwaterStatusData, setGroundwaterStatusData] = useState<StatusPoint[]>([]); // 지도 상태

    const { data: sensitivityData, loading: sensitivityLoading } = useFetchSensitivityData();
    const [isAsc, setIsAsc] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openModal = useSetAtom(openModalAtom);
    const contentRef = useRef<HTMLDivElement | null>(null);
    
    // 현재 관측소명
    const stationName = genInfo[station]?.["측정망명"];
    const stationId = `${GEN_CODES.indexOf(station) + 1}`;

    // 현재 관측소의 지하수위 경향성 지표
    const selectedStatusData = useMemo(() => {
        if (!groundwaterStatusData || !station) return null;
        return groundwaterStatusData.find(d => d.id === station) || null;
    }, [groundwaterStatusData, station]);

    // 현재 관측소의 민감도
    const sensitivityRecordMap = useMemo(() => {
        if (!sensitivityData?.stations_analisys) return null;
        const map = new Map<GenInfoKey, SensitivityRecord>();
        sensitivityData.stations_analisys.forEach((record, idx) => {
            const numericStation = Number(record.station);
            const mappedKey = Number.isFinite(numericStation) && numericStation > 0
                ? (GEN_CODES[numericStation - 1] as GenInfoKey)
                : (GEN_CODES[idx] as GenInfoKey);
            if (mappedKey) {
                map.set(mappedKey, record);
            }
        });
        return map;
    }, [sensitivityData]);

    const selectedSensitivityData = useMemo(() => {
        if (!sensitivityRecordMap) return null;
        return sensitivityRecordMap.get(station) ?? null;
    }, [sensitivityRecordMap, station]);

    // API URL 모음
    const longTermUrl = apiRoutes.longTerm(stationId);
    const weatherUrl = apiRoutes.weather(stationId);

    // 가뭄 취약 통계 Top-5 데이터
    const droughtData = useMemo(() => {
        if(!sensitivityData) return [];
        return sensitivityData.top5_drought_decrease.map(d => ({
            name: genInfo[(GEN_CODES[Number(d.station) - 1] as GenInfoKey)]?.["측정망명"],
            y: d.decrease_if_drought
        }));
    }, [sensitivityData]);

    // 강수 민감 통계 Top-5 데이터
    const rainData = useMemo(() => {
        if(!sensitivityData) return [];
        return sensitivityData?.top5_rainfall_increase.map(d => ({
            name: genInfo[(GEN_CODES[Number(d.station) - 1] as GenInfoKey)]?.["측정망명"],
            y: d.increase_if_rainfall
        }));
    }, [sensitivityData]);

    // 변동폭 통계 Top-5 데이터
    const variationData = useMemo(() => {
        if(!sensitivityData) return [];
        return sensitivityData?.top5_largest_variation.map(d => ({
            name: genInfo[(GEN_CODES[Number(d.station) - 1] as GenInfoKey)]?.["측정망명"],
            y: d.range_variation
        }));
    }, [sensitivityData]);
    
    // 지하수위 현황 Bar 차트
    const displayedBarChartData = useMemo(() => {
        return options.map(({ key, label }) => {
            return { name: label, y: currBarChartDatas[key]?.["elevMean" + period] ?? null }
        });
    }, [currBarChartDatas, period]);

    // 지하수위 현황 테이블
    const tableColumns = useMemo(() => [{ key: "ymd", label: "기준일" }, ...options], []);

    const displayedTable = useMemo(() => {
        if (!currElevDatas) return;

        const limit = Number(period);
        const rows = (() => {
            if (!Number.isFinite(limit) || limit <= 0) {  
                return currElevDatas;
            }
            if (currElevDatas.length <= limit) {
                return currElevDatas;
            }
            return currElevDatas.slice(-limit);
        })();

        return rows?.map((row) => {
            const ymd = row.ymd;
            if (typeof ymd === "string" && ymd.length === 8) {
                const formatted = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
                return { ...row, ymd: formatted };
            }
            return row;
        });
    }, [currElevDatas, period]);

    const sortedTable = useMemo(() : DashboardTableRow[] | void => {
        
        if(!displayedTable) return;
        
        const copied = [...displayedTable];
        copied.sort((a, b) => {
            const aYmd = typeof a.ymd === "string" ? a.ymd : "";
            const bYmd = typeof b.ymd === "string" ? b.ymd : "";
            if (isAsc) {
                return aYmd.localeCompare(bYmd);
            }
            return bYmd.localeCompare(aYmd);
        });
        return copied;
    }, [displayedTable, isAsc]);

    const displayedDiffTable = useMemo(() => {
        if (!currElevDiffDatas) return;

        const limit = Number(period);
        const rows = (() => {
            if (!Number.isFinite(limit) || limit <= 0) {
                return currElevDiffDatas;
            }
            if (currElevDiffDatas.length <= limit) {
                return currElevDiffDatas;
            }
            return currElevDiffDatas.slice(-limit);
        })();

        return rows?.map((row) => {
            const ymd = row.ymd;
            if (typeof ymd === "string" && ymd.length === 8) {
                const formatted = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
                return { ...row, ymd: formatted };
            }
            return row;
        });
    }, [currElevDiffDatas, period]);

    const sortedDiffTable = useMemo(() : DashboardTableRow[] | void => {
        if(!displayedDiffTable) return;

        const copied = [...displayedDiffTable];
        copied.sort((a, b) => {
            const aYmd = typeof a.ymd === "string" ? a.ymd : "";
            const bYmd = typeof b.ymd === "string" ? b.ymd : "";
            if (isAsc) {
                return aYmd.localeCompare(bYmd);
            }
            return bYmd.localeCompare(aYmd);
        });
        return copied;
    }, [displayedDiffTable, isAsc]);
    /////////////////////////////////////////////////

    // 현황 테이블 csv로 다운로드
    const handleDownloadCSV = () => {
        if(!displayedTable) return;

        const headers = [...tableColumns].map(({ key, label}) => label);
        const rows = [...displayedTable].map((row) => {
            return [
                row.ymd,
                ...options.map(({ key }) => row[key])
            ]
        });

        const tableRows = [
            headers,
            ...rows
        ];

        const BOM = '\uFEFF';
        const csv = BOM + tableRows.map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const today = new Date().toISOString().slice(0, 10);
         link.download = '일평균_지하수위_현황_'+today+'.csv';
        link.click();
        URL.revokeObjectURL(url); // 반드시 참조 해제!!
    };
    
    // 이미지 캡쳐 함수
    const captureContentImage = useCallback(async () => {
        const target = contentRef.current;

        if (!target) {
            throw new Error(CAPTURE_TARGET_NOT_FOUND);
        }

        const { toPng } = await import('html-to-image');
        const width = target.scrollWidth;
        const height = target.scrollHeight;

        const dataUrl = await toPng(target, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            width,
            height,
            style: {
                margin: '0',
                width: `${width}px`,
                height: `${height}px`,
                transform: 'scale(1)',
                transformOrigin: 'top left',
            },
        });

        return { dataUrl, width, height };
    }, []);

    // 대시보드 이미지로 저장 함수
    const handleSavePng = useCallback(async () => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const { dataUrl } = await captureContentImage();

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `dashboard-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            link.click();
            link.remove();
        } catch (error) {
            if (error instanceof Error && error.message === CAPTURE_TARGET_NOT_FOUND) {
                window.alert('저장할 대상을 찾을 수 없습니다.');
                return;
            }

            console.error('PNG export failed', error);
            window.alert('PNG 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }, [captureContentImage]);

    // 대시보드 PDF로 저장 함수
    const handleSavePdf = useCallback(async () => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const [{ dataUrl, width, height }, { jsPDF }] = await Promise.all([
                captureContentImage(),
                import('jspdf'),
            ]);

            const orientation = width >= height ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation,
                unit: 'px',
                format: [width, height],
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
            pdf.save(`dashboard-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);
        } catch (error) {
            if (error instanceof Error && error.message === CAPTURE_TARGET_NOT_FOUND) {
                window.alert('저장할 대상을 찾을 수 없습니다.');
                return;
            }

            console.error('PDF export failed', error);
            window.alert('PDF 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }, [captureContentImage]);

    // 관측소 상세 모달창 설정
    const handleOpenModal = () => {
        openModal(
            <p className="c-tit03">
                관측소 정보 및 분석
            </p>
            ,
            <DashboardModalContent
                station={station}
                stationId={stationId}
                stationName={stationName}
                longTermUrl={longTermUrl}
                weatherUrl={weatherUrl}
            />
        );
    };
    
    // OPEN API: 일별 지하수위 데이터
    const getCurrFetchDatas = useCallback(async () => {
        try {
            const resp = await fetch(apiRoutes.currentElev(TABLE_WINDOW_DAYS));

            if (!resp.ok) {
                throw new Error(`failed to fetch dashboard data: ${resp.status}`);
            }

            const data = await resp.json();

            setCurrElevDatas(data.table?.tableRows ?? []);
            setCurrElevDiffDatas(data.table?.tableDiffRows ?? []);
            setCurrBarChartDatas(data.barChart ?? {});
            setGroundwaterStatusData(data.groundwaterStatus ?? []);

        } catch (error) {
            console.error("failed to fetch dashboard data", error);
            setCurrElevDatas([]);
            setCurrElevDiffDatas([]);
            setCurrBarChartDatas({});
            setGroundwaterStatusData([]);
        }
    }, []);

    useEffect(() => {
        getCurrFetchDatas();
    }, [getCurrFetchDatas]);

    // 렌더링
    return (
        <>
            <div ref={contentRef} id="dashboard" className="section d-section flex flex-col lg:flex-row gap-6 mb-6">
                <DashboardNavi
                    className="relative dash-navi-container d-group m-0 lg:shrink-0 flex flex-col gap-5 lg:justify-between"
                    pinned={
                        <div id="dashboard-navi" className="h-auto flex flex-row lg:flex-col gap-2 sm:gap-7 justify-end pt-7 transition-transform duration-150">
                            <div className="logo-box w-full justify-center shrink-0 hidden md:flex">
                                <Image src={logoSrc} width={50} height={50} alt="로고" />
                            </div>

                            <div className="flex flex-row gap-2 md:gap-6 w-full max-w-4/5 sm:max-w-3/5 lg:max-w-none lg:flex-col lg:py-10 lg:border-t-2 lg:border-b-2 shrink-0">
                                <div className="period-box w-full">
                                    <label htmlFor="period-select"><span className="c-stit01 block">기간 선택</span></label>
                                    <select
                                        onChange={(e) => { setPeriod(e.target.value); }}
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

                                <div className="gen-box w-full">
                                    <label htmlFor="gen-select"><span className="c-stit01 block">관측소 선택</span></label>
                                    <select
                                        value={station}
                                        onChange={(e) => { setStation(e.target.value as GenInfoKey); }}
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
                            </div>

                            <div className="btn-box max-w-1/5 sm:max-w-none shrink-0 flex items-center lg:items-start gap-1 lg:gap-4 flex-col sm:flex-row lg:flex-col">
                                <p className="c-stit01 hidden lg:block">다운로드</p>
                                <CustomButton caption="PNG저장" bType="button" bStyle="btn-style-3 h-full max-h-12 w-full" handler={handleSavePng} />
                                <CustomButton caption="PDF저장" bType="button" bStyle="btn-style-3 h-full max-h-12 w-full" handler={handleSavePdf} />
                            </div>
                        </div>
                    }
                    footer={
                        <div className="info-bar flex justify-center">
                            <LiaExclamationCircleSolid color="#222" size={40} />
                        </div>
                    }
                />
                <div className="dash-contents">
                    {/* 전국 지하수위 현황 */}
                    <div className="w-full d-group mb-6">
                        <p className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <span className="c-tit03">전국 관측소 지하수위 현황</span>
                            <CustomButton handler={handleDownloadCSV} caption="csv 다운로드" bType="button" bStyle="btn-style-3" />
                        </p>
                        <p className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <span className="c-stit02">
                                <b className="text-sky-500">{period == "1" ? "금일" : `${period}일`}</b> 평균 지하수위
                            </span>
                            <span className="gray-92 text-xs">일평균 수위(el.m)</span>
                        </p>
                        <div className="d-sgroup mb-2">
                            <BarChart data={displayedBarChartData} categories={GEN_NAMES} title={period == "1" ? "금일 평균 지하수위" : `최근 ${period}일 평균 지하수위`} xLabel="지하수위(el.m)" yLabel="관측소명" />
                        </div>
                        <ul className="c-list01 text-right mb-2">
                            <li className="inline-block">데이터 출처: 국가지하수정보센터, 「국가지하수측정자료조회서비스 (일자료)」</li>
                        </ul>
                        <div className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <p className="flex items-start gap-4">
                                <span className="c-stit02">일별 지하수위 현황</span>
                                <CustomButton handler={() => setIsAsc(!isAsc)} caption={isAsc ? '최신순' : '과거순'} bType="button" bStyle="btn-style-5 -mt-0.5" />
                                <CustomButton handler={() => setIsModalOpen(true)} caption="일별 수위 크게 보기" bType="button" bStyle="btn-style-5 -mt-0.5" />
                            </p>
                            <p className="gray-92 text-right text-xs">일평균 수위(el.m), 전일 대비 증감(el.m)</p>
                        </div>
                        <CurrentTable data={sortedTable && sortedTable.length > 0 ? sortedTable : []} dataDiff={sortedDiffTable && sortedDiffTable.length > 0 ? sortedDiffTable : []} columns={tableColumns} emphasis={station} />
                    </div>

                    {/* 중간 섹션 - 지도, 예측 */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
                        <div className="w-full lg:w-1/2 d-group">
                            <p className="c-tit03">전국 관측망</p>
                            <GeoMap statusData={groundwaterStatusData} sensitivityData={sensitivityData} handleClick={setStation} mappointDesc={`최근 ${period}일 평균 지하수위`} />
                        </div>
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-full d-group flex flex-col gap-6">
                                <StationInfoCard
                                    stationCode={station}
                                    stationName={stationName}
                                    statusData={selectedStatusData}
                                    sensitivityData={selectedSensitivityData}
                                >
                                    <CustomButton handler={handleOpenModal} caption="관측소 AI 분석 리포트 확인" bType="button" bStyle="btn-style-1 w-full"/>
                                </StationInfoCard>
                                <ForecastNext7Days stationCode={station} stationName={stationName}/>
                                {/* <PerformanceIndicators stationCode={station} /> */}
                            </div>
                        </div>
                    </div>

                    
                    {/* 민감도 통계 */}
                    <div className="flex flex-col lg:flex-row gap-6 mt-6">
                        <div className="w-full d-group">
                            <HorizontalBarChart title="가뭄 취약 관측소 Top 5" data={droughtData} />
                        </div>
                        <div className="w-full d-group">
                            <HorizontalBarChart title="강수 민감 관측소 Top 5" data={rainData} />
                        </div>
                        <div className="w-full d-group">
                            <HorizontalBarChart title="변동폭 Top 5" data={variationData} />
                        </div>
                    </div>
                </div>
            </div>
            {
                isModalOpen && (
                    <div className="donut-modal curr-modal" role="dialog" aria-modal="true">
                        <div className="donut-modal-backdrop" onClick={() => setIsModalOpen(false)} />
                            <div className="donut-modal-content">
                            <div className="donut-modal-header">
                                <p className="flex items-center gap-4">
                                    <span className="c-tit03 inline-block">일별 지하수위 현황</span>
                                    <CustomButton handler={() => setIsAsc(!isAsc)} caption={isAsc ? '최신순' : '과거순'} bType="button" bStyle="btn-style-6" />
                                    <CustomButton handler={handleDownloadCSV} caption="csv 다운로드" bType="button" bStyle="btn-style-4" />
                                </p>
                                <CustomButton handler={() => {setIsModalOpen(false);}} caption="닫기" bStyle="donut-modal-close" bType="button" />
                            </div>
                            <div className="donut-modal-body">
                                <p className="gray-92 text-right">일평균 수위(el.m), 전일 대비 증감(el.m)</p>
                                <CurrentTable data={sortedTable && sortedTable.length > 0 ? sortedTable : []} dataDiff={sortedDiffTable && sortedDiffTable.length > 0 ? sortedDiffTable : []} columns={tableColumns} />
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
