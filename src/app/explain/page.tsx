import SubVisual from "@/components/ui/SubVisual";

export default async function ExplainPage () {
    // 모두가 접근 가능한 페이지
    return (
        <div id="contents" className="">
            <SubVisual 
            tit1="지하 수위 현황 및 예측" 
            tit2="AI 기반 지하 수위 예측 모델 설명 및 해석" 
            tit3="기상 요인을 통해 지하 수위 예측" 
            />
        </div>
    );
}