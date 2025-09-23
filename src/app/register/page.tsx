import RegisterForm from "@/components/RegisterForm";
import SubVisual from "@/components/ui/SubVisual";

export default async function LoginPage () {

  return (
    <div id="contents" className="bg-custom-gradient h-full">
      <SubVisual  
        tit1="회원가입" 
        tit2="회원가입 후 블라블라블라 뭐시기뭐시기뭐시기" 
        tit3="회원가입을 하시면 개인화 서비스 무슨 무슨 블라블라 서비스를 이용하실 수 있습니다." 
      ></SubVisual>
      <div className="section">
        <div className="register-form-group w-full mt-8 md:mt-0 bg-[#ffffffcc] backdrop-blur-xl px-10 py-10 rounded-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}