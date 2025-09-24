import SubVisual from "@/components/ui/SubVisual";
import WhetherAuthorized from "@/components/utils/WhetherAuthorized";

export default async function PredictPage() {
  // WhetherAuthorized : 서버의 인가 설정에 따를 것이므로 임시 코드임. 추후 백엔드와 합치고 지울것
  
  return (
    <div id="contents" className="">
        <WhetherAuthorized />
        <SubVisual 
          tit1="예측 서비스" 
          tit2="예측 서비스에 대한 서브타이틀 서브타이틀" 
          tit3="예측 서비스에 대한 설명문구 집어넣기 설명 문구 집어넣기 그냥 그냥 그냥 집어넣기 생각하기" 
        />
    </div>
  );
}