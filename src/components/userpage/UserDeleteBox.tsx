'use client';
import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";
import FormField from "@/components/FormField";
import CustomInput from "@/components/CustomInput";
import CustomButton from "../CustomButton";
import { toast } from "react-toastify";
import safeParseResponseToJson from "@/components/utils/safeParseResponseToJson";
import { UserErrorType } from "@/types/uiTypes";
import { useSetAtom } from "jotai";
import { sessionAtom } from "@/atoms/atoms";
import { useRouter } from "next/navigation";

type DeletePayload = {
    currentPassword: string;
}

type PatchSuccessResponse = {
    username: string;
    email: string;
}

export default function UserDeleteBox() {
    const router = useRouter();
    const setSession = useSetAtom(sessionAtom);
    const [formValues, setFormValues] = useState<DeletePayload>({
        currentPassword: "",
    });

    // 폼 값 onChange 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof DeletePayload;
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // 성공시 핸들러
    const handleSuccess = async (message: string) => {
        const duration = 1500;
        toast.success(message, {
            position: "top-center",
            autoClose: duration,
        });

        setSession({ status: "unauthenticated", user: null });
        router.push("/login");
    };

    // 실패시 핸들러
    const handleFailure = (message: string) => {
        toast.error(message, {
            position: "top-center",
            autoClose: 2000,
        });
    };

    // 회원탈퇴 핸들러
    const handleDelete = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const currentPasswordValue = (formData.get("currentPassword") ?? "").toString().trim();
        
        if(!currentPasswordValue) {
            toast.info("비밀번호를 입력해주세요", {
                position: "top-center",
                autoClose: 1000,
            });
            return;
        }

        const confirmed = confirm('정말로 탈퇴하시겠습니까?');
        if(!confirmed) return;

        try {
            const response = await fetch('/java/api/v1/auth/me', {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json",
                },
                body: JSON.stringify({
                    "currentPassword": currentPasswordValue,
                })
            });

            const result = await safeParseResponseToJson<PatchSuccessResponse | UserErrorType>(response);

            switch (response.status) {
                case 200: {
                    let message = "회원탈퇴 성공";
                    handleSuccess(message);
                    break;
                }
                case 401:
                case 422: {
                    let message = result && "message" in result
                    ? result.message
                    : "회원탈퇴에 실패했습니다. 입력 정보를 다시 확인해주세요."
                    handleFailure(message); // result.message: 이메일이나 비밀번호가 올바르지 않습니다.
                    break;
                }
                default: {
                    let message = result && "message" in result
                    ? result.message
                    : "회원탈퇴에 실패했습니다. 관리자에게 문의하세요.";
                    handleFailure(message); // result.message: 내부 서버 오류
                    console.log(response.status);
                    break;
                }
            };

        } catch (error) {
            console.error("회원탈퇴 시도 중 오류 발생: ", error);
            handleFailure("회원탈퇴 시도 중 오류 발생");
        }
    }

    return (
        <form onSubmit={handleDelete} className="w-full">
            <p className="cp-tit01">회원 탈퇴</p>
            <p>탈퇴 시 모든 서비스 이용 기록이 삭제되며 복구할 수 없습니다. 계속 진행하시려면 비밀번호 입력 후 탈퇴 버튼을 눌러주세요.</p>
            <div className="flex flex-col max-w-2xl mt-9">
                <FormField label="현재 비밀번호" htmlFor="currentPassword" >
                    <CustomInput type="password" onChange={handleChange} value={formValues.currentPassword} name="currentPassword" id="currentPassword" placeholder="현재 비밀번호를 입력하세요" required />
                </FormField>
                <CustomButton caption="탈퇴하기" bType="submit" bStyle="btn-style-1 w-full" />
            </div>
        </form>
    );
}