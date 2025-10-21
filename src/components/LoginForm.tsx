'use client';
import { useEffect } from "react";
import type { FormEvent } from "react";
import { useSetAtom } from "jotai";
import { isLoginAtom } from "@/atoms/atoms";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import FormField from "./FormField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserType, UserErrorType } from "@/types/uiTypes";
import { toast } from "react-toastify";

type LoginSuccessPayload = {
    user: UserType,
    sessionExpiresIn: number
}

export default function LoginForm() {
    const router = useRouter();
    const setLoginAtom = useSetAtom(isLoginAtom);

    // 로그인 URL 검증
    const baseUrl = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
    
    useEffect(() => {
        if(!baseUrl) {
            alert("로그인 서버 연결 정보를 찾을 수 없습니다. 관리자에게 문의하세요.");
            router.push("/");
        }
    }, [baseUrl, router]);

    if(!baseUrl) {
        return null;
    }

    // 응담 JSON 파싱 유틸함수: 유틸 함수는 나중에 따로 빼자!
    async function safeParseResponseToJson<T>(response: Response): Promise<T | null> {
        const contentType = response.headers.get("content-type") ?? "";
        
        if(!contentType || !contentType.includes("application/json"))  {
            return null;
        }

        try {
            return (await response.clone().json()) as T; // stream이므로 유틸 함수에서는 clone하는 걸로
        } catch (error) {
            console.error("JSON 파싱 실패: ", error);
            return null;
        }
    }

    // 성공시 핸들러
    const handleSuccess = (message: string, payload?: LoginSuccessPayload) => {
        toast.success(message, {
            position: "top-center",
            autoClose: 2000,
        });

        // 여기 로직 손봐야함!
        setLoginAtom(true);
        sessionStorage.setItem("user", JSON.stringify(payload));

        setTimeout(() => {
            router.push("/mypage");
        }, 2000);
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
            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
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
            //console.log(response);

            const payload = await safeParseResponseToJson<LoginSuccessPayload | UserErrorType>(response);

            switch (response.status) {
                case 200: {
                    if(payload && "user" in payload) {
                        let message = `${payload.user.username}님, 환영합니다. 마이 페이지로 이동합니다.`;
                        handleSuccess(message, payload);
                    } else {
                        let message = "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
                        handleFailure(message);
                    }
                    break;
                }
                case 401: {
                    let message = payload && "message" in payload
                    ? payload.message
                    : "로그인에 실패했습니다. 입력 정보를 다시 확인해주세요."
                    handleFailure(message);
                    break;
                }
                default: {
                    let message = payload && "message" in payload
                    ? payload.message
                    : "로그인에 실패했습니다. 관리자에게 문의하세요.";
                    handleFailure(message);
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
        <form onSubmit={handleLogin} id="login-form">
            <div className="mb-5 md:mb-7 lg:mb-14">
                <p className="flex gap-2.5 items-baseline mb-3 md:mb-8 font-bold">
                    <span className="text-3xl black-t1">로그인</span>
                    <span className="text-2xl gray-a1">Login</span>
                </p>
                <p className="gray-92 font-medium text-lg">더 많은 서비스 이용을 위해 로그인을 진행해주세요.</p>
            </div>
            <div className="mb-3 md:mb-5 lg:mb-10">
                <FormField label="Username" htmlFor="username" required >
                    <CustomInput type="text" name="username" id="username" placeholder="아이디를 입력하세요" required />
                </FormField>
                <FormField label="Password" htmlFor="password" required >
                    <CustomInput type="password" name="password" id="password" placeholder="비밀번호를 입력하세요" required />
                </FormField>
            </div>
            <div className="flex flex-col gap-2.5">
                <CustomButton caption="로그인하기" bType="submit" bStyle="btn-style-1" />
                <Link href={"/register"} className="btn-style-2">회원가입</Link>
            </div>
        </form>
    );
}