import SubVisual from "@/components/ui/SubVisual";

export default async function LoginPage () {

  return (
    <div id="contents" className="bg-custom-gradient min-h-svh h-full flex gap-10">
      <SubVisual 
        position="relative" 
        tit1="로그인" 
        tit2="로그인 후 지하수위 예측 서비스를 이용해 보세요." 
        tit3="로그인 인증을 하시면 개인화 서비스 무슨 무슨 블라블라 서비스를 이용하실 수 있습니다." 
      />
    </div>
  );
}