'use client';
import { FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import CustomAccordian from "./CustomAccordian";

export default function RegisterForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const baseUrl = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
    const registerURL = `${baseUrl}/api/v1/auth/register`;
    // 회원가입 보안 관련 고민 URL 노출이 괜찮은지?

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!formRef.current) return;

        if(formRef.current.username.value == "") {
            alert("아이디를 입력하세요");
            formRef.current.username.focus();
            return;
        }

        if(formRef.current.email.value == "") {
            alert("이메일을 입력하세요");
            formRef.current.email.focus();
            return;
        }

        if(formRef.current.password.value == "") {
            alert("비밀번호를 입력하세요");
            formRef.current.password.focus();
            return;
        }

        if(!formRef.current.privacyPolicy.checked) {
            alert("개인정보 처리방침에 동의해주세요");
            formRef.current.privacyPolicy.focus();
            return;
        }

        if(!formRef.current.termsOfUse.checked) {
            alert("이용약관에 동의해주세요");
            formRef.current.termsOfUse.focus();
            return;
        }
        
        // 성공하면 toast창 띄우고 로그인 페이지로
        try {
            const response = await fetch(registerURL, {
                method: "POST",
                headers: {
                    "Content-type" : "application/json",
                },
                credentials: "include", // 쿠키 포함, Cross-site도 되나?
                body: JSON.stringify({
                    username: formRef.current.username.value, 
                    email: formRef.current.email.value, 
                    password: formRef.current.password.value
                })
            });
            console.log(response);

            if(response.ok) {
                if(response.status == 201) {
                    const data = await response.json();
                    console.log(data);
                    alert(data.username + "님, 회원 가입 되셨습니다. 로그인을 진행해 주세요.");
                    router.push("/login");
                } else if(response.status == 409) {
                    alert("이미 존재하는 아이디입니다.");
                    formRef.current.username.focus();
                } else {
                    alert("회원가입 실패: 서버 오류");
                }
            } else {
                alert("회원가입 실패: 서버 오류");
                console.log(response.status);
            }
        } catch (error) {
            console.error("회원가입 시도 중 오류 발생: ", error);
            alert("회원가입 실패");
        }
    }

    const handleAgreeAll = () => {
        if(!formRef.current) return;
        if(!formRef.current.privacyPolicy || !formRef.current.termsOfUse) return;

        if(formRef.current.agreeAll.checked) {
            formRef.current.privacyPolicy.checked = true;
            formRef.current.termsOfUse.checked = true;
        } else {
            formRef.current.privacyPolicy.checked = false;
            formRef.current.termsOfUse.checked = false;
        }
    }

    return (
        <form ref={formRef} onSubmit={handleRegister} id="register-form" className="relative flex flex-col gap-12 xl:flex-row xl:gap-0 w-full">
            <div className="flex-1 w-full xl:border-r-2 pr-0 xl:pr-[8%]">
                <div className="mb-5 md:mb-7 lg:mb-14">
                    <p className="flex gap-2.5 items-end mb-3 md:mb-5 font-bold">
                        <span className="text-3xl black-t1">회원가입</span>
                        <span className="text-2xl gray-a1 align-baseline">Sign Up</span>
                    </p>
                    <p className="gray-92 font-medium text-lg">더 많은 서비스 이용을 위해 회원가입을 진행해주세요.</p>
                </div>
                <div className="mb-3 md:mb-5 lg:mb-10">
                    <div className="mb-5 md:mb-8 lg:mb-12">
                        <label htmlFor="username" className="block mb-2 gray-6a text-2xl font-bold">Username <span className="required">*</span></label>
                        <CustomInput ipType="text" ipName="username" caption="아이디를 입력하세요" />
                    </div>
                    <div className="mb-5 md:mb-8 lg:mb-12">
                        <label htmlFor="email" className="block mb-2 gray-6a text-2xl font-bold">Email <span className="required">*</span></label>
                        <CustomInput ipType="email" ipName="email" caption="이메일을 입력하세요" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 gray-6a text-2xl font-bold">Password <span className="required">*</span></label>
                        <CustomInput ipType="password" ipName="password" caption="비밀번호를 입력하세요" />
                    </div>
                </div>
                <CustomButton caption="회원가입하기" bType="submit" bStyle="btn-style-1 w-full" />
            </div>
            <div className="flex-1 flex flex-col w-full pl-0 xl:pl-[8%] justify-between">
                <div>
                    <div className="mb-5 md:mb-7 lg:mb-14">
                        <p className="flex gap-2.5 items-end mb-3 md:mb-5 font-bold">
                            <span className="text-3xl black-t1">약관 동의</span>
                            <span className="text-2xl gray-a1 align-baseline">Policy Agreement</span>
                        </p>
                        <p className="gray-92 font-medium text-lg">아래에서 약관 상세 내용을 확인하실 수 있습니다.</p>
                    </div>
                    <div className="mb-3 md:mb-5 lg:mb-10">
                        <div className="mb-5 md:mb-8 lg:mb-12">
                            <CustomAccordian head="개인정보 처리 방침" content="텍스트 크므로 import?" />
                            <div className="checkbox-group">
                                <input id="privacyPolicy" name="privacyPolicy" type="checkbox" required />
                                <label htmlFor="privacyPolicy" className="select-none mt-2 md:mt-3">[개인정보 처리방침]에 동의합니다.</label>
                            </div>
                        </div>
                        <div className="mb-5 md:mb-8 lg:mb-12">
                            <CustomAccordian head="이용 약관" content="텍스트 크므로 import?" />
                            <div className="checkbox-group">
                                <input id="termsOfUse" name="termsOfUse" type="checkbox" required />
                                <label htmlFor="termsOfUse" className="select-none mt-2 md:mt-3">[이용 약관]에 동의합니다.</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="checkbox-group black font-bold pt-5 pb-2.5 border-t-style-1">
                    <input id="agreeAll" name="agreeAll" type="checkbox" onClick={handleAgreeAll} />
                    <label htmlFor="agreeAll" className="select-none">개인정보 처리방침 및 이용약관에 모두 동의합니다.</label>
                </div>
            </div>
        </form>
    );
}