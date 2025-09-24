import SubVisual from "@/components/ui/SubVisual";
import WhetherAuthorized from "@/components/utils/WhetherAuthorized";

export default async function ExplainPage () {
    // WhetherAuthorized : 서버의 인가 설정에 따를 것이므로 임시 코드임. 추후 백엔드와 합치고 지울것
    return (
        <div id="contents" className="">
            <WhetherAuthorized />
            <SubVisual 
            tit1="모델 설명" 
            tit2="AI 기반 지하 수위 예측 모델 설명 및 해석" 
            tit3="기상 요인을 통해 지하 수위 예측" 
            />
        </div>
    );
}