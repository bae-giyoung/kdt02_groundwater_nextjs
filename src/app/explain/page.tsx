import DashBoardContents from "@/components/dashboard/DashBoardContents";
import SubVisual from "@/components/ui/SubVisual";

export default async function ExplainPage () {
    // 모두가 접근 가능한 페이지
    // 대시보드 페이지
    return (
        <div id="contents" className="bg-custom-gradient d-gradient">
            <SubVisual 
            tit1="지하 수위 현황 대시보드" 
            tit2="전국 지하수위 현황과 AI 기반 지하 수위 예측 모델 분석 결과 시각화" 
            tit3="이 대시보드는 2014~2023년 가상지표를 기반으로 AI 모델이 예측한 지하수위 변동을 시각화합니다. 관측소별 단위 분석을 통해 주요 기상 요인과 수위 변화를 함께 탐색할 수 있습니다." 
            />
            <DashBoardContents />
        </div>
    );
}