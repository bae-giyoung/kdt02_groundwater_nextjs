'use client';
import type { FormEvent } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { refreshSessionAtom, sessionAtom } from "@/atoms/atoms";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import FormField from "./FormField";
import Link from "next/link";
import safeParseResponseToJson from "./utils/safeParseResponseToJson";
import { useRouter } from "next/navigation";
import { UserType, UserErrorType } from "@/types/uiTypes";
import { toast } from "react-toastify";

type LoginSuccessResponse = {
    user: UserType,
    sessionExpiresIn: number
}

export default function LoginForm() {
    const router = useRouter();
    const refreshSession = useSetAtom(refreshSessionAtom);
    const session = useAtomValue(sessionAtom);

    // 성공시 핸들러
    const handleSuccess = async (message: string) => {
        const duration = 1500;
        toast.success(message, {
            position: "top-center",
            autoClose: duration,
        });

        // 로그인 직후 /api/v1/auth/me 호출 로직
        await refreshSession();
    };

    // 실패시 핸들러
    const handleFailure = (message: string) => {
        toast.error(message, {
            position: "top-center",
            autoClose: 2000,
        });
    };

    const handleLogin = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const usernameValue = (formData.get("username") ?? "").toString().trim();
        const passwordValue = (formData.get("password") ?? "").toString().trim();

        const username = form.elements.namedItem("username") as HTMLInputElement | null;
        const password = form.elements.namedItem("password") as HTMLInputElement | null;

        if(!usernameValue) {
            toast.info("아이디를 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            username?.focus();
            username?.reportValidity(); // 호환성 체크!!!!!
            return;
        }

        if(!passwordValue) {
            toast.info("비밀번호를 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            password?.focus();
            password?.reportValidity();
            return;
        }

        // 로그인 요청
        try {
            const response = await fetch('/java/api/v1/auth/login', {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json",
                },
                body: JSON.stringify({
                    "username": usernameValue, 
                    "password": passwordValue
                })
            });

            const result = await safeParseResponseToJson<LoginSuccessResponse | UserErrorType>(response);

            switch (response.status) {
                case 200: {
                    let message = "로그인 성공";
                    handleSuccess(message);
                    break;
                }
                case 401: {
                    let message = result && "message" in result
                    ? result.message
                    : "로그인에 실패했습니다. 입력 정보를 다시 확인해주세요."
                    handleFailure(message); // result.message: 이메일이나 비밀번호가 올바르지 않습니다.
                    break;
                }
                default: {
                    let message = result && "message" in result
                    ? result.message
                    : "로그인에 실패했습니다. 관리자에게 문의하세요.";
                    handleFailure(message); // result.message: 내부 서버 오류
                    console.log(response.status);
                    break;
                }
            }

        } catch (error) {
            console.error("로그인 시도 중 오류 발생: ", error);
            handleFailure("로그인 시도 중 오류 발생");
        }
    }

    return (
        session.user?.username ? (
            <div className="min-h-96 flex flex-col justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide">Welcome</p>
                    <p className="mt-2 text-2xl font-semibold">
                        {session.user?.username}님, 환영합니다!
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-sky-800/80">
                        물알림단의 다양한 서비스를 이용해주세요.
                    </p>
                </div>
                <div className="mt-6 flex flex-col flex-wrap gap-3">
                    <Link href={"/userpage"} className="btn-style-2">마이 페이지</Link>
                    <CustomButton handler={()=> router.back()} caption="이전 페이지로" bStyle="btn-style-1" bType="button" />
                </div>
            </div>
        ) : (
            <form onSubmit={handleLogin} id="login-form">
                <div className="mb-5 md:mb-7 lg:mb-14">
                    <p className="flex gap-2.5 items-baseline mb-3 md:mb-8 font-bold">
                        <span className="text-3xl black-t1">로그인</span>
                        <span className="text-2xl gray-a1">Login</span>
                    </p>
                    <p className="gray-92 font-medium text-lg">더 많은 서비스 이용을 위해 로그인을 진행해주세요.</p>
                </div>
                <div className="mb-3 md:mb-5 lg:mb-10">
                    <FormField label="Username" htmlFor="username" >
                        <CustomInput type="text" name="username" id="username" placeholder="아이디를 입력하세요" required />
                    </FormField>
                    <FormField label="Password" htmlFor="password" >
                        <CustomInput type="password" name="password" id="password" placeholder="비밀번호를 입력하세요" required />
                    </FormField>
                </div>
                <div className="flex flex-col gap-2.5">
                    <CustomButton caption="로그인하기" bType="submit" bStyle="btn-style-1" />
                    <Link href={"/register"} className="btn-style-2">회원가입</Link>
                </div>
            </form>
        )
    );
}