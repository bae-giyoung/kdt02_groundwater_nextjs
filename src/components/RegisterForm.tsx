'use client';
import { FormEvent, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import CustomAccordian from "./CustomAccordian";
import FormField from "./FormField";
import { UserErrorType } from "@/types/uiTypes";
import { toast } from "react-toastify";

type RegisterPayload = {
    username: string;
    email: string;
    password: string;
    agreePolicy: boolean;
    agreeTerms: boolean;
}

export default function RegisterForm() {
    const router = useRouter();
    const [formValues, setFormValues] = useState<RegisterPayload>({
        username: "",
        email: "",
        password: "",
        agreePolicy: false,
        agreeTerms: false,
    });

    // 회원가입 URL 검증
    const baseUrl = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
    
    useEffect(() => {
        if(!baseUrl) {
            alert("회원가입 서버 연결 정보를 찾을 수 없습니다. 관리자에게 문의하세요.");
            router.push("/login");
        }
    }, [baseUrl, router]);

    if(!baseUrl) {
        return null; // 대체 UI 시간 되면 하고
    }

    
    // 폼 값 onChange 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof RegisterPayload;
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        })); // 변경한 필드 덮어쓴 새 객체로 변경
    };

    // 체크박스 onChange 핸들러
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        const field = name as keyof RegisterPayload;
        setFormValues((prev) => ({
            ...prev,
            [field]: checked,
        }));
    }
    
    // 전체 동의
    const handleAgreeAllChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFormValues((prev) => ({
            ...prev,
            agreePolicy: checked,
            agreeTerms: checked,
        }));
    }

    // 응담 JSON 파싱 유틸함수
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
    const handleSuccess = (message: string) => {
        toast.success(message, {
            position: "top-center",
            autoClose: 2000,
        });
        setTimeout(() => {
            router.push("/login");
        }, 2000);
    };

    // 실패시 핸들러
    const handleFailure = (message: string) => {
        toast.error(message, {
            position: "top-center",
            autoClose: 2000,
        });
    };

    // Submit 핸들러
    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const username = form.elements.namedItem("username") as HTMLInputElement | null;
        const email = form.elements.namedItem("email") as HTMLInputElement | null;
        const password = form.elements.namedItem("password") as HTMLInputElement | null;
        const agreeAll = form.elements.namedItem("agreeAll") as HTMLInputElement | null;

        // 공백문자 입력의 경우 required를 통과하므로, 추가 검증
        if(!formValues.username.trim()) {
            toast.info("아이디를 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            username?.focus();
            return;
        }

        if(!formValues.email.trim()) {
            toast.info("이메일을 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            email?.focus();
            return;
        }

        if(!formValues.password.trim()) {
            toast.info("비밀번호를 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            password?.focus();
            return;
        }

        if(!formValues.agreePolicy || !formValues.agreeTerms) {
            alert("약관 동의를 완료해주세요.");
            agreeAll?.focus();
            return;
        }
        
        // 성공하면 toast창 띄우고 로그인 페이지로
        try {
            const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-type" : "application/json",
                },
                body: JSON.stringify({
                    username: formValues.username, 
                    email: formValues.email, 
                    password: formValues.password
                })
            });
            //console.log(response);

            const payload = await safeParseResponseToJson<{username: string} | UserErrorType>(response);

            switch (response.status) {
                case 201: {
                    let message = payload && "username" in payload
                    ? `${payload.username}님, 회원 가입 되셨습니다. 로그인 페이지로 이동합니다.`
                    : "회원가입 성공. 로그인 페이지로 이동합니다.";
                    handleSuccess(message);
                    break;
                }
                case 400:
                case 409: {
                    let message = payload && "message" in payload
                    ? payload.message
                    : "회원가입에 실패했습니다. 입력 정보를 다시 확인해주세요."
                    handleFailure(message);
                    break;
                }
                default: {
                    let message = payload && "message" in payload
                    ? payload.message
                    : "회원가입에 실패했습니다. 관리자에게 문의하세요.";
                    handleFailure(message);
                    console.log(response.status);
                    break;
                }
            }
            
        } catch (error) {
            console.error("회원가입 시도 중 오류 발생: ", error);
            handleFailure("회원가입 시도 중 오류 발생");
        }
    }


    return (
        <form onSubmit={handleRegister} id="register-form" className="relative flex flex-col gap-12 xl:flex-row xl:gap-0 w-full">
            <div className="flex-1 w-full xl:border-r-2 pr-0 xl:pr-[8%]">
                <div className="mb-5 md:mb-7 lg:mb-14">
                    <p className="flex gap-2.5 items-end mb-3 md:mb-5 font-bold">
                        <span className="text-3xl black-t1">회원가입</span>
                        <span className="text-2xl gray-a1 align-baseline">Sign Up</span>
                    </p>
                    <p className="gray-92 font-medium text-lg">더 많은 서비스 이용을 위해 회원가입을 진행해주세요.</p>
                </div>
                <div className="mb-3 md:mb-5 lg:mb-10">
                    <FormField label="Username" htmlFor="username" required >
                        <CustomInput onChange={handleChange} value={formValues.username} type="text" name="username" id="username" placeholder="아이디를 입력하세요" required />
                    </FormField>
                    <FormField label="Email" htmlFor="email" required >
                        <CustomInput onChange={handleChange} value={formValues.email} type="email" name="email" id="email" placeholder="이메일을 입력하세요" required />
                    </FormField>
                    <FormField label="Password" htmlFor="password" required >
                        <CustomInput onChange={handleChange} value={formValues.password} type="password" name="password" id="password" placeholder="비밀번호를 입력하세요" required />
                    </FormField>
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
                                <input onChange={handleCheckboxChange} id="agreePolicy" name="agreePolicy" type="checkbox" checked={formValues.agreePolicy} required />
                                <label htmlFor="agreePolicy" className="select-none mt-2 md:mt-3">[개인정보 처리방침]에 동의합니다.</label>
                            </div>
                        </div>
                        <div className="mb-5 md:mb-8 lg:mb-12">
                            <CustomAccordian head="이용 약관" content="텍스트 크므로 import?" />
                            <div className="checkbox-group">
                                <input onChange={handleCheckboxChange} id="agreeTerms" name="agreeTerms" type="checkbox" checked={formValues.agreeTerms} required />
                                <label htmlFor="agreeTerms" className="select-none mt-2 md:mt-3">[이용 약관]에 동의합니다.</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="checkbox-group black font-bold pt-5 pb-2.5 border-t-style-1">
                    <input id="agreeAll" name="agreeAll" type="checkbox" onChange={handleAgreeAllChange} checked={formValues.agreePolicy && formValues.agreeTerms} />
                    <label htmlFor="agreeAll" className="select-none">개인정보 처리방침 및 이용약관에 모두 동의합니다.</label>
                </div>
            </div>
        </form>
    );
}