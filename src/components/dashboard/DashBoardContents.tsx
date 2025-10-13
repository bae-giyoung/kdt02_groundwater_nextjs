'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomTable from "@/components/CustomTable";
import CurrentTable from "./CurrentTable";
import genInfo from "@/data/gennumInfo.json";
import GeoMap from "./GeoMap";
import StationInfoBox from "../StationInfoBox";
import FeatureImportancePage from "./FeatureImportance";
import LineChartShade from "./LineChartShade";
import logoSrc from "../../../public/assets/logo_mulalim.svg";
import Image from "next/image";
import DashboardNavi from "./DashboardNavi";
import CustomButton from "../CustomButton";
import PerformanceIndicators from "./PerformanceIndicators";
import TrendPositionCard from "./TrendPositionCard";
import { LiaExclamationCircleSolid } from "react-icons/lia";
import type { GenInfoKey } from "@/types/uiTypes";
import BarChart from "./BarChart";
import WeatherGroundwaterTrendChart from "./WeatherGroundwaterTrendChart";
import LineChartShadeZoom from "./LineChartShadeZoom";
import type { DashboardTableData, DashboardTableRow, DashboardTableDiffRow } from "@/types/uiTypes";

// 상수 선언
const options = Object.entries(genInfo).map(([gen, { ["측정망명"]: name }]) => ({ key: gen, label: name }));
const GEN_CODES = Object.keys(genInfo);
const GEN_NAMES = Object.values(genInfo).map(({ ["측정망명"]: name }) => name);
const CAPTURE_TARGET_NOT_FOUND = 'CAPTURE_TARGET_NOT_FOUND';
const TABLE_WINDOW_DAYS = 30;
const BASE_SPRING_URL = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    geomap?: Record<string, Record<string, number | null>>;
    trend?: Record<string, TrendMetricT>;
};


// 임시: 하드코딩용 데이터 모음
const rainSensitiveTop5 = [
    { rank: 1, name: '남원도통', metricLabel: '강수 민감도', metricValue: '0.92', note: '짧은 시간 강수에 즉시 반응' },
    { rank: 2, name: '거창거창', metricLabel: '강수 민감도', metricValue: '0.89', note: '장마철 대응 관측 지점' },
    { rank: 3, name: '원주문막', metricLabel: '강수 민감도', metricValue: '0.86', note: '내수 침수 위험 지역' },
    { rank: 4, name: '곡성입면', metricLabel: '강수 민감도', metricValue: '0.82', note: '태풍 여름철 모니터링' },
    { rank: 5, name: '순창순창', metricLabel: '강수 민감도', metricValue: '0.79', note: '난류 영향 해안 관측소' },
];

const droughtStableTop5 = [
    { rank: 1, name: '금산금산', metricLabel: '지하수 변동폭', metricValue: '±0.07m', note: '평년 대비 안정 유지' },
    { rank: 2, name: '안동길안', metricLabel: '지하수 변동폭', metricValue: '±0.09m', note: '대체 수자원 확보 지점' },
    { rank: 3, name: '순창쌍치', metricLabel: '지하수 변동폭', metricValue: '±0.11m', note: '산간 지역 기저 유량 유지' },
    { rank: 4, name: '함양병곡', metricLabel: '지하수 변동폭', metricValue: '±0.13m', note: '생활·농업용 안정 공급' },
    { rank: 5, name: '화성팔탄', metricLabel: '지하수 변동폭', metricValue: '±0.15m', note: '도시 가뭄 대응 관측소' },
];

const rmseTop5 = [
    { rank: 1, name: '영암영암', metricLabel: 'RMSE', metricValue: '0.68 m' },
    { rank: 2, name: '순창쌍치', metricLabel: 'RMSE', metricValue: '0.74 m' },
    { rank: 3, name: '남원도통', metricLabel: 'RMSE', metricValue: '0.77 m' },
    { rank: 4, name: '곡성입면', metricLabel: 'RMSE', metricValue: '0.81 m' },
    { rank: 5, name: '임실오수', metricLabel: 'RMSE', metricValue: '0.84 m' },
];

export default function DashBoardContents() {
    const [station, setStation] = useState<GenInfoKey>("5724");
    const [period, setPeriod] = useState<string>("1");
    const [currElevDatas, setCurrElevDatas] = useState<DashboardTableRow[]>([]);
    const [currElevDiffDatas, setCurrElevDiffDatas] = useState<DashboardTableDiffRow[]>([]);
    const [currMapDatas, setCurrMapDatas] = useState<Record<string, Record<string, number | null>>>({});
    const [trendMetrics, setTrendMetrics] = useState<Record<string, TrendMetricT>>({});
    const [isAsc, setIsAsc] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    
    // 현재 관측소명, 현재 관측소의 경향성 지표
    const stationName = genInfo[station]?.["측정망명"];
    const stationTrend = trendMetrics[station];
    const summaryHeaders = [{key: "관측소", label: "관측소"}, {key: "년도", label: "년도"}, {key: "실측값", label: "실측값"}, {key: "예측값", label: "예측값"}, {key: "오차평균", label: "오차평균"}];

    // URLS
    // 장기 추세
    const longTermUrl = `${BASE_SPRING_URL}/api/v1/rawdata/longterm?station=${GEN_CODES.indexOf(station) + 1}&timestep=monthly&horizons=120`;
    //const longTermUrl = `${BASE_URL}/api/v1/mockdata/longterm?station=${GEN_CODES.indexOf(station) + 1}&timestep=monthly&horizons=120`;
    //const weatherUrl = `${BASE_URL}/api/v1/mockdata/summary/weather?station=${GEN_CODES.indexOf(station) + 1}`;
    const weatherUrl = `${BASE_SPRING_URL}/api/v1/rawdata/summary/weather?station=${GEN_CODES.indexOf(station) + 1}`;
    
    // 현황 바 차트
    const displayedBarChartData = useMemo(() => {
        return options.map(({ key, label }) => {
            return { name: label, y: currMapDatas[key]?.["elevMean" + period] ?? null }
        });
    }, [currMapDatas, period]);

    // 현황 테이블
    const tableColumns = useMemo(() => [{ key: "ymd", label: "기준일" }, ...options], []);
    console.log("tableColumns", tableColumns);

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
    
    // OPEN API: 일별 지하수위 데이터
    const getCurrFetchDatas = useCallback(async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        try {
            const resp = await fetch(`${baseUrl}/api/v1/dashboard/currentElev?days=${TABLE_WINDOW_DAYS}`, {
                method: "GET",
                mode: "cors",
                headers: { "Content-type": "application/json" },
            });
            if (!resp.ok) {
                throw new Error(`failed to fetch current data: ${resp.status}`);
            }
            const json: DashboardApiResponse = await resp.json();
            setCurrElevDatas(json.table?.tableRows ?? []);
            setCurrElevDiffDatas(json.table?.tableRows ?? []);
            setCurrMapDatas(json.geomap ?? {});
            setTrendMetrics(json.trend ?? {});
        } catch (error) {
            console.error("failed to fetch current data", error);
            setCurrElevDatas([]);
            setCurrElevDiffDatas([]);
            setCurrMapDatas({});
            setTrendMetrics({});
        }
    }, []);

    useEffect(() => {
        getCurrFetchDatas();
    }, [getCurrFetchDatas]);

    return (
        <>
            <div ref={contentRef} className="section d-section flex flex-col lg:flex-row gap-8 mb-12">
                <DashboardNavi
                    className="relative dash-navi-container d-group m-0 lg:shrink-0 flex flex-col gap-5 lg:justify-between"
                    pinned={
                        <div id="dashboard-navi" className="h-auto flex flex-row lg:flex-col gap-7 justify-end pt-7 transition-transform duration-150">
                            <div className="logo-box w-full flex justify-center  shrink-0">
                                <Image src={logoSrc} width={50} height={50} alt="로고" />
                            </div>

                            <div className="flex flex-row gap-6 w-full max-w-3/5 lg:max-w-none lg:flex-col lg:py-10 lg:border-t-2 lg:border-b-2 shrink-0">
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

                            <div className="btn-box max-w-1/4 lg:max-w-none shrink-0 flex items-center lg:items-start flex-col md:flex-row lg:flex-col">
                                <p className="c-stit01 hidden lg:block">다운로드</p>
                                <CustomButton caption="PNG저장" bType="button" bStyle="btn-style-3 h-full max-h-12 mr-0 lg:w-full lg:mb-4 lg:mr-0 md:mr-4 text-xl" handler={handleSavePng} />
                                <CustomButton caption="PDF저장" bType="button" bStyle="btn-style-3 h-full max-h-12 mr-0 lg:w-full lg:mb-4 lg:mr-0 md:mr-4 text-xl" handler={handleSavePdf} />
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
                    <div className="dash-cont-top mb-12 d-group">
                        <p className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <span className="c-tit03">전국 관측소 지하수위 현황</span>
                            <CustomButton handler={handleDownloadCSV} caption="csv 다운로드" bType="button" bStyle="btn-style-4" />
                        </p>
                        <p className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <span className="c-stit02">
                                <b className="text-sky-500">{period == "1" ? "금일" : `${period}일`}</b> 평균 지하수위
                            </span>
                            <span className="gray-92 text-xs">일평균 수위(m)</span>
                        </p>
                        <div className="rounded-xl border-style-2 mb-6">
                            <BarChart data={displayedBarChartData} categories={GEN_NAMES} title={period == "1" ? "금일 평균 지하수위" : `최근 ${period}일 평균 지하수위`} xLabel="지하수위(m)" yLabel="관측소명" />
                        </div>
                        <div className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <p className="flex items-start gap-4">
                                <span className="c-stit02">일별 지하수위 현황</span>
                                <CustomButton handler={() => setIsAsc(!isAsc)} caption={isAsc ? '최신순' : '과거순'} bType="button" bStyle="btn-style-5 -mt-0.5" />
                                <CustomButton handler={() => setIsModalOpen(true)} caption="일별 수위 크게 보기" bType="button" bStyle="btn-style-5 -mt-0.5" />
                            </p>
                            <p className="gray-92 text-right text-xs">일평균 수위(m), 전일 대비 증감(m)</p>
                        </div>
                        <CurrentTable data={sortedTable && sortedTable.length > 0 ? sortedTable : []} dataDiff={currElevDiffDatas} columns={tableColumns} emphasis={station} />
                        <ul className="c-list01 text-right">
                            <li className="inline-block">데이터 출처: 국가지하수정보센터, 「국가지하수측정자료조회서비스 (일자료)」</li>
                        </ul>
                    </div>
                    <div className="flex gap-8 mb-12">
                        <div className="w-full d-group">
                            <p className="c-tit03">전국 관측망</p>
                            <p className="c-txt01">지도의 각 관측소를 클릭하면 해당 관측소의 정보를 확인하실 수 있습니다.</p>
                            <GeoMap mapData={currMapDatas} period={period} handleClick={setStation} mappointDesc={`최근 ${period}일 평균 지하수위`} />
                            <ul className="c-list01 mt-2">
                                <li>데이터 출처: 국가지하수정보센터, 「국가지하수측정자료조회서비스 (일자료)」</li>
                            </ul>
                            <div className="info-box mt-5 max-h-20 overflow-y-auto" style={{ marginBottom: 0, fontSize: '12px'}}>
                                <p className="text-xs">
                                    <b>관측소별 지하수위 ‘경고/위험/정상’ 구분 기준</b>은  
                                    각 관측소의 <b>최근 10년간 월평균 수위 분포를 기반으로</b> 설정됩니다.  
                                    <br />- 상위/하위 <b>10% 구간은 ‘위험’</b>,  
                                    <br />- <b>10~25% 구간은 ‘경고’</b>,  
                                    <br />- <b>25~75% 구간은 ‘정상 범위’</b>로 분류됩니다.
                                </p>
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-8">
                            <div className="w-full d-group">
                                <TrendPositionCard metric={stationTrend} stationName={stationName} windowDays={TABLE_WINDOW_DAYS} />
                            </div>
                            <div className="w-full d-group">
                                <div>
                                    <StationInfoBox stationCode={station} />
                                    <PerformanceIndicators stationCode={station} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full d-group mb-12">
                        <div className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                            <p className="c-tit03">
                                <span className="c-txt-point">{stationName || "해당 관측소"}</span> 장기 추세 그래프 (2014 ~ 2023)
                            </p>
                            <span className="gray-92">지난 10년간 월별 평균 지하수위 추이</span>
                        </div>
                        <div className="rounded-xl border-style-2 mb-6 bg-white">
                            {/* <LineChartShade baseUrl={longTermUrl} chartTitle="장기 추세 그래프(2014 ~ 2023)" /> */}
                            <LineChartShadeZoom baseUrl={longTermUrl} chartTitle="장기 추세 그래프(2014 ~ 2023)" />
                        </div>
                        <div className="w-full">
                            <p className="flex justify-between items-center gap-4 mb-2">
                                <span className="c-stit02 inline-block">예측 요약</span>
                                <CustomButton handler={handleDownloadCSV} caption="csv 다운로드" bType="button" bStyle="btn-style-3 -mt-2" />
                            </p>
                            <CustomTable data={[]} columns={summaryHeaders} />
                        </div>
                    </div>
                    <div className="flex gap-8 flex-col lg:flex-row w-full mb-12">
                        <div className="lg:w-2/3 d-group">
                            <p className="c-tit03">
                                <span className="c-txt-point">{stationName || "해당 관측소"}</span> 기상-수위 상관관계 (3년, 데이터 미정)
                            </p>
                            <WeatherGroundwaterTrendChart baseUrl={weatherUrl} />
                        </div>
                        <div className="lg:w-1/3 d-group">
                            <FeatureImportancePage chartTitle={stationName + " 주요 영향 변수 분석" || "주요 영향 변수 분석"} />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full d-group list-card">
                            <p className="c-tit03"><span className="c-txt-point">가뭄 안정</span> 관측소 Top 5</p>
                            <ul className="ranking-list">
                                {droughtStableTop5.map(({ rank, name, metricLabel, metricValue, note }) => (
                                    <li key={`drought-${rank}`} className="ranking-item">
                                        <span className={`ranking-rank${rank <= 3 ? ' ranking-rank-top' : ''}`}>{rank.toString().padStart(2, '0')}</span>
                                        <div className="ranking-content">
                                            <div className="ranking-header">
                                                <span className="ranking-name">{name}</span>
                                                <span className="ranking-metric">
                                                    <span className="ranking-metric-label">{metricLabel}</span>
                                                    <span className="ranking-metric-value">{metricValue}</span>
                                                </span>
                                            </div>
                                            {note && <span className="ranking-note">{note}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full d-group list-card">
                            <p className="c-tit03"><span className="c-txt-point">강수 민감</span> 관측소 Top 5</p>
                            <ul className="ranking-list">
                                {rainSensitiveTop5.map(({ rank, name, metricLabel, metricValue, note }) => (
                                    <li key={`rain-${rank}`} className="ranking-item">
                                        <span className={`ranking-rank${rank <= 3 ? ' ranking-rank-top' : ''}`}>{rank.toString().padStart(2, '0')}</span>
                                        <div className="ranking-content">
                                            <div className="ranking-header">
                                                <span className="ranking-name">{name}</span>
                                                <span className="ranking-metric">
                                                    <span className="ranking-metric-label">{metricLabel}</span>
                                                    <span className="ranking-metric-value">{metricValue}</span>
                                                </span>
                                            </div>
                                            {note && <span className="ranking-note">{note}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full d-group list-card">
                            <p className="c-tit03"><span className="c-txt-point">RMSE 상위</span> 관측소 Top 5</p>
                            <ul className="ranking-list ranking-list-compact">
                                {rmseTop5.map(({ rank, name, metricLabel, metricValue }) => (
                                    <li key={`rmse-${rank}`} className="ranking-item">
                                        <span className={`ranking-rank${rank <= 3 ? ' ranking-rank-top' : ''}`}>{rank.toString().padStart(2, '0')}</span>
                                        <div className="ranking-content">
                                            <div className="ranking-header">
                                                <span className="ranking-name">{name}</span>
                                                <span className="ranking-metric">
                                                    <span className="ranking-metric-label">{metricLabel}</span>
                                                    <span className="ranking-metric-value">{metricValue}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
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
                                    <CustomButton handler={() => setIsAsc(!isAsc)} caption={isAsc ? '최신순' : '과거순'} bType="button" bStyle="btn-style-4" />
                                    <CustomButton handler={handleDownloadCSV} caption="csv 다운로드" bType="button" bStyle="btn-style-4" />
                                </p>
                                <CustomButton handler={() => {setIsModalOpen(false);}} caption="닫기" bStyle="donut-modal-close" bType="button" />
                            </div>
                            <div className="donut-modal-body">
                                <p className="gray-92 text-right">일평균 수위(m), 전일 대비 증감(m)</p>
                                {/* <CustomTable data={sortedTable && sortedTable.length > 0 ? sortedTable : []} columns={tableColumns} /> */}
                                <CustomTable data={sortedTable  && sortedTable.length > 0 ? sortedTable : []} columns={tableColumns} emphasis={station} />
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
