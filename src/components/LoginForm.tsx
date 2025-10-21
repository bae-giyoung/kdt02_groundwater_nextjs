'use client';
import { FormEvent, useRef } from "react";
import { useSetAtom } from "jotai";
import { isLoginAtom } from "@/atoms/atoms";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserType, LoginErrorType } from "@/types/uiTypes";

export default function LoginForm() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const setLoginAtom = useSetAtom(isLoginAtom);

    const handleLogin = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!formRef.current) return;

        if(formRef.current.username.value == "") {
            alert("아이디를 입력하세요");
            formRef.current.username.focus();
            return;
        }

        if(formRef.current.password.value == "") {
            alert("비밀번호를 입력하세요");
            formRef.current.password.focus();
            return;
        }

        // 로그인 요청
        const baseUrl = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
        const loginURL = `${baseUrl}/api/v1/auth/login`;
        try {
            const response = await fetch(loginURL, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json",
                },
                body: JSON.stringify({"username": formRef.current.username.value, "password": formRef.current.password.value})
            });
            console.log(response);

            if(response.ok) {
                const data = await response.json(); // UserType | UserErrorType 타입 정의주려면 더 생각
                console.log(data);
                console.log(data.user.username);
                if(response.status == 200) {
                    setLoginAtom(true);
                    sessionStorage.setItem("user", JSON.stringify(data));
                    alert("로그인 성공");
                    router.push("/userpage");
                } else {
                    alert("로그인 실패");
                }
            } else {
                alert("로그인 실패");
            }
        } catch (error) {
            console.error("로그인 시도 중 오류 발생: ", error);
        }
    }

    return (
        <form ref={formRef} onSubmit={handleLogin} id="login-form">
            <div className="mb-5 md:mb-7 lg:mb-14">
                <p className="flex gap-2.5 items-baseline mb-3 md:mb-8 font-bold">
                    <span className="text-3xl black-t1">로그인</span>
                    <span className="text-2xl gray-a1">Login</span>
                </p>
                <p className="gray-92 font-medium text-lg">더 많은 서비스 이용을 위해 로그인을 진행해주세요.</p>
            </div>
            <div className="mb-3 md:mb-5 lg:mb-10">
                <div className="mb-5 md:mb-8 lg:mb-12">
                    <label htmlFor="username" className="block mb-2 gray-6a text-2xl font-bold">Username</label>
                    <CustomInput ipType="text" ipName="username" caption="아이디를 입력하세요" />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 gray-6a text-2xl font-bold">Password</label>
                    <CustomInput ipType="password" ipName="password" caption="비밀번호를 입력하세요" />
                </div>
            </div>
            <div className="flex flex-col gap-2.5">
                <CustomButton caption="로그인하기" bType="submit" bStyle="btn-style-1" />
                <Link href={"/register"} className="btn-style-2">회원가입</Link>
            </div>
        </form>
    );
}