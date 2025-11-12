import RegisterForm from "@/components/RegisterForm";
import SubVisual from "@/components/ui/SubVisual";

export default async function LoginPage () {

  return (
    <div id="contents" className="bg-custom-gradient h-full">
      <SubVisual  
        tit1="회원가입" 
        tit2="회원가입 후 물알림단의 다양한 서비스를 이용해 보세요" 
        tit3="회원가입을 하시면 물알림단의 향후 7일 예측 서비스를 이용하실 수 있습니다." 
      ></SubVisual>
      <div className="section">
        <div className="register-form-group w-full mt-8 md:mt-0 bg-[#ffffffcc] backdrop-blur-xl px-10 py-10 rounded-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}