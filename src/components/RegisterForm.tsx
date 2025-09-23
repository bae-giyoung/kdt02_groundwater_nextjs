'use client';
import { FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import CustomAccordian from "./CustomAccordian";

export default function RegisterForm() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleRegister = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 성공하면 toast창 띄우고 로그인 페이지로
        alert("회원 가입 되셨습니다. 로그인을 진행해 주세요.")
        router.push("/login");
    }

    return (
        <form onSubmit={handleRegister} id="register-form" className="relative flex flex-col gap-12 xl:flex-row xl:gap-0 w-full">
            <div className="flex-1 w-full xl:border-r-2 pr-0 xl:pr-[8%]">
                <div className="mb-5 md:mb-7 lg:mb-14">
                    <p className="flex gap-2.5 items-end mb-3 md:mb-8 font-bold">
                        <span className="text-3xl black-t1">회원가입</span>
                        <span className="text-2xl gray-a1 align-baseline">Sign Up</span>
                    </p>
                    <p className="gray-92 font-medium text-lg">더 많은 서비스 이용을 위해 회원가입을 진행해주세요.</p>
                </div>
                <div className="mb-3 md:mb-5 lg:mb-10">
                    <div className="mb-5 md:mb-8 lg:mb-12">
                        <label htmlFor="username" className="block mb-2 gray-6a text-2xl font-bold">Username</label>
                        <CustomInput ipRef={usernameRef} ipType="text" ipName="username" caption="아이디를 입력하세요" />
                    </div>
                    <div className="mb-5 md:mb-8 lg:mb-12">
                        <label htmlFor="email" className="block mb-2 gray-6a text-2xl font-bold">Email</label>
                        <CustomInput ipRef={emailRef} ipType="email" ipName="email" caption="이메일을 입력하세요" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 gray-6a text-2xl font-bold">Password</label>
                        <CustomInput ipRef={passwordRef} ipType="password" ipName="password" caption="비밀번호를 입력하세요" />
                    </div>
                </div>
                <CustomButton caption="회원가입하기" bType="submit" bStyle="btn-style-1 w-full" />
            </div>
            <div className="flex-1 w-full pl-0 xl:pl-[8%]">
                <div className="mb-5 md:mb-7 lg:mb-14">
                    <p className="flex gap-2.5 items-end mb-3 md:mb-8 font-bold">
                        <span className="text-3xl black-t1">약관 동의</span>
                        <span className="text-2xl gray-a1 align-baseline">Policy Agreement</span>
                    </p>
                    <p className="gray-92 font-medium text-lg">아래에서 약관 상세 내용을 확인하실 수 있습니다.</p>
                </div>
                <div className="mb-3 md:mb-5 lg:mb-10">
                    <div className="mb-5 md:mb-8 lg:mb-12">
                        <CustomAccordian head="개인정보 처리 방침" content="텍스트 매우 크므로 import?" />
                    </div>
                    <div className="mb-5 md:mb-8 lg:mb-12">
                        <CustomAccordian head="이용 약관" content="텍스트 매우 크므로 import?" />
                    </div>
                </div>
                <div>
                    
                </div>
            </div>
        </form>
    );
}