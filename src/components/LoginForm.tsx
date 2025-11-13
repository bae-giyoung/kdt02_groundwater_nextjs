'use client';
import type { FormEvent } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { loginAtom, sessionAtom } from "@/atoms/atoms";
import CustomButton from "@/components/CustomButton";
import CustomInput from "./CustomInput";
import FormField from "./FormField";
import Link from "next/link";
import { useRouter } from "next/navigation";
import showToast from "./utils/showToast";

export default function LoginForm() {
    const router = useRouter();
    const login = useSetAtom(loginAtom);
    const session = useAtomValue(sessionAtom);

    const handleLogin = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const username = (formData.get("username") ?? "").toString().trim();
        const password = (formData.get("password") ?? "").toString().trim();

        if(!username) {
            showToast("아이디를 입력하세요", 'info', 1000);
            (form.elements.namedItem("username") as HTMLInputElement | null)?.focus();
            return;
        }

        if(!password) {
            showToast("비밀번호를 입력하세요", 'info', 1000);
            (form.elements.namedItem("password") as HTMLInputElement | null)?.focus();
            return;
        }

        // 로그인 요청 (loginAtom 사용)
        try {
            await login({ username, password });
            // 성공 시 atom 내부에서 toast와 상태 변경 처리
        } catch (error) {
            // 실패 시 atom 내부에서 toast와 상태 변경 처리
            console.log("로그인 에러: ", error);
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