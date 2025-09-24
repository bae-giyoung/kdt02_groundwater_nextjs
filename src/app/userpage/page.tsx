import SubVisual from "@/components/ui/SubVisual";
import WhetherAuthorized from "@/components/utils/WhetherAuthorized";

export default async function UserPage() {
    // WhetherAuthorized : 서버의 인가 설정에 따를 것이므로 임시 코드임. 추후 백엔드와 합치고 지울것

    return (
        <div id="contents" className="">
            <WhetherAuthorized />
            <SubVisual 
            tit1="마이 페이지" 
            tit2="나의 예측 서비스 이용 내역 확인" 
            tit3="이전 서비스 이용 내역 상세보기와 원본 파일 다운로드를 제공합니다." 
            />
        </div>
    );
}