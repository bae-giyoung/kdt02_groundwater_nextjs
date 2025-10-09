'use client';
import { useCallback, useEffect, useRef, useState } from "react";
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
const CAPTURE_TARGET_NOT_FOUND = 'CAPTURE_TARGET_NOT_FOUND';

const rainSensitiveTop5 = [
    { rank: 1, name: '남원도통 관측소', metricLabel: '강수 민감도', metricValue: '0.92', note: '짧은 시간 강수에 즉시 반응' },
    { rank: 2, name: '거창거창 관측소', metricLabel: '강수 민감도', metricValue: '0.89', note: '장마철 대응 관측 지점' },
    { rank: 3, name: '원주문막 관측소', metricLabel: '강수 민감도', metricValue: '0.86', note: '내수 침수 위험 지역' },
    { rank: 4, name: '곡성입면 관측소', metricLabel: '강수 민감도', metricValue: '0.82', note: '태풍 여름철 모니터링' },
    { rank: 5, name: '순창순창 관측소', metricLabel: '강수 민감도', metricValue: '0.79', note: '난류 영향 해안 관측소' },
];

const droughtStableTop5 = [
    { rank: 1, name: '금산금산 관측소', metricLabel: '지하수 변동폭', metricValue: '±0.07m', note: '평년 대비 안정 유지' },
    { rank: 2, name: '안동길안 관측소', metricLabel: '지하수 변동폭', metricValue: '±0.09m', note: '대체 수자원 확보 지점' },
    { rank: 3, name: '순창쌍치 관측소', metricLabel: '지하수 변동폭', metricValue: '±0.11m', note: '산간 지역 기저 유량 유지' },
    { rank: 4, name: '함양병곡 관측소', metricLabel: '지하수 변동폭', metricValue: '±0.13m', note: '생활·농업용 안정 공급' },
    { rank: 5, name: '화성팔탄 관측소', metricLabel: '지하수 변동폭', metricValue: '±0.15m', note: '도시 가뭄 대응 관측소' },
];

const rmseTop5 = [
    { rank: 1, name: '영암영암 관측소', metricLabel: 'RMSE', metricValue: '0.68 m' },
    { rank: 2, name: '순창쌍치 관측소', metricLabel: 'RMSE', metricValue: '0.74 m' },
    { rank: 3, name: '남원도통 관측소', metricLabel: 'RMSE', metricValue: '0.77 m' },
    { rank: 4, name: '곡성입면 관측소', metricLabel: 'RMSE', metricValue: '0.81 m' },
    { rank: 5, name: '임실오수 관측소', metricLabel: 'RMSE', metricValue: '0.84 m' },
];

export default function DashBoardContents() {
    const [station, setStation] = useState<string>("5724");
    const [period, setPeriod] = useState<string>("1");
    const [currElevDatas, setCurrElevDatas] = useState<Record<string, string>[]>([]);
    const [currMapDatas, setCurrMapDatas] = useState<Record<string, number>>({});
    const contentRef = useRef<HTMLDivElement | null>(null);

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
        } catch (error) {
            if (error instanceof Error && error.message === CAPTURE_TARGET_NOT_FOUND) {
                window.alert('저장할 대상을 찾을 수 없습니다.');
                return;
            }

            console.error('PNG export failed', error);
            window.alert('PNG 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }, [captureContentImage]);

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
            <div ref={contentRef} className="section d-section flex flex-col lg:flex-row gap-8 mb-12">
                <DashboardNavi
                    className="relative dash-navi-container d-group m-0 w-full lg:w-36 lg:shrink-0 flex flex-col gap-5 lg:justify-between"
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
                            </div>

                            <div className="btn-box max-w-1/4 lg:max-w-none shrink-0 flex items-center lg:items-start flex-col md:flex-row lg:flex-col">
                                <p className="c-stit01 hidden lg:block">다운로드</p>
                                <CustomButton caption="PNG로 저장" bType="button" bStyle="btn-style-3 h-full max-h-12 mr-0 lg:w-full lg:mb-4 lg:mr-0 md:mr-4 text-xl" handler={handleSavePng} />
                                <CustomButton caption="PDF로 저장" bType="button" bStyle="btn-style-3 h-full max-h-12 mr-0 lg:w-full lg:mb-4 lg:mr-0 md:mr-4 text-xl" handler={handleSavePdf} />
                            </div>
                        </div>
                    }
                    footer={
                        <div className="info-bar flex justify-center">
                            <Image src="assets/icon_exclamation.svg" width={40} height={40} alt="" />
                        </div>
                    }
                />
                <div className="w-full">
                    <div className="mb-12 d-group">
                        <p className="flex justify-between gap-2">
                            <span className="c-tit03">전국 대표 관측망 지하수위 현황</span>
                            <span>({period}일 평균)</span>
                        </p>
                        <CustomTable data={currElevDatas} columns={options.map(header => ({ "key": header.key, "label": header.label }))} emphasis={station} />
                    </div>
                    <div className="flex gap-8 mb-12">
                        <div className="w-full d-group">
                            <p className="c-tit03">전국 대표 관측망 지도</p>
                            <GeoMap mapData={currMapDatas} handleClick={setStation} mappointDesc={`${period}일 평균 지하수위`} />
                        </div>
                        <div className="w-full d-group">
                            <div>
                                <StationInfoBox stationCode={station} />
                                <PerformanceIndicators stationCode={station} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full d-group mb-12">
                        <p className="c-tit03">장기 추세 그래프 (2014 ~ 2023)</p>
                        <LineChartZoom />
                    </div>
                    <div className="flex gap-8 flex-col lg:flex-row w-full mb-12">
                        <div className="lg:w-2/3 d-group">
                            <p className="c-tit03">기상-수위 상관관계 그래프 (3년, 데이터 미정)</p>
                            <LineChartShade />
                        </div>
                        <div className="lg:w-1/3 d-group">
                            <FeatureImportancePage />
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
        </>
    );
}
