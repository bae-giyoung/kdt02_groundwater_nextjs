import LoginForm from "@/components/LoginForm";
import SubVisual from "@/components/ui/SubVisual";

export default async function LoginPage () {

  return (
    <div id="contents" className="bg-custom-gradient h-full">
      <SubVisual  
        tit1="로그인" 
        tit2="로그인 후 지하수위 예측 서비스를 이용해 보세요." 
        tit3="로그인 인증을 하시면 개인화 서비스 무슨 무슨 블라블라 서비스를 이용하실 수 있습니다." 
      >
        <div className="login-form-group w-full max-w-2xl mt-8 md:mt-0 bg-[#ffffffcc] backdrop-blur-xl px-10 py-10 border-radius-15">
          <LoginForm />
        </div>
      </SubVisual>
    </div>
  );
}