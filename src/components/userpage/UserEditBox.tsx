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
import { refreshSessionAtom } from "@/atoms/atoms";

type PatchPayload = {
    email?: string;
    currentPassword: string;
    newPassword?: string;
}

type PatchSuccessResponse = {
    username: string;
    email: string;
}

export default function UserEditBox(
    {email}
    : {email: string}
) {
    const refreshSession = useSetAtom(refreshSessionAtom);
    const [changePassword, setChangePassword] = useState(false);
    const [formValues, setFormValues] = useState<PatchPayload>({
        email: email,
        currentPassword: "",
        newPassword: "",
    });

    // 폼 값 onChange 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof PatchPayload;
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
        
        await refreshSession();
    };

    // 실패시 핸들러
    const handleFailure = (message: string) => {
        toast.error(message, {
            position: "top-center",
            autoClose: 2000,
        });
    };

    // 회원정보 수정 핸들러: 백엔드 로직에서 currentPassword는 필수요건으로 변경해야함! 현재 이메일만 변경시에는 현재비밀번호 검증 안되고 있음.
    const handleUpdate = async (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const emailValue = (formData.get("email") ?? "").toString().trim();
        const currentPasswordValue = (formData.get("currentPassword") ?? "").toString().trim();
        const newPasswordValue = (formData.get("newPassword") ?? "").toString().trim();

        if(!currentPasswordValue) {
            toast.info("현재 비밀번호를 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            return;
        }

        if(changePassword && !newPasswordValue) {
            toast.info("새 비밀번호를 입력하세요", {
                position: "top-center",
                autoClose: 1000,
            });
            return;
        }

        const payload : PatchPayload = { currentPassword: currentPasswordValue };
        if(emailValue !== email) payload.email = emailValue;
        if(changePassword) payload.newPassword = newPasswordValue;

        if(!payload.email && !payload.newPassword) {
            toast.info("변경된 내용이 없습니다.", {
                position: "top-center",
                autoClose: 1000,
            });
            return;
        }

        if(newPasswordValue === currentPasswordValue) {
            toast.info("현재 비밀번호와 동일합니다.", {
                position: "top-center",
                autoClose: 1000,
            });
            return;
        }

        try {
            const response = await fetch('/java/api/v1/auth/me', {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-type" : "application/json",
                },
                body: JSON.stringify(payload)
            });

            const result = await safeParseResponseToJson<PatchSuccessResponse | UserErrorType>(response);

            switch (response.status) {
                case 200: {
                    let message = "회원정보 변경 성공";
                    handleSuccess(message);
                    break;
                }
                case 400:
                case 401:
                case 409:
                case 422: {
                    let message = result && "message" in result
                    ? result.message
                    : "회원정보 변경에 실패했습니다. 입력 정보를 다시 확인해주세요."
                    handleFailure(message);
                    break;
                }
                default: {
                    let message = result && "message" in result
                    ? result.message
                    : "회원정보 변경에 실패했습니다. 관리자에게 문의하세요.";
                    handleFailure(message); // result.message: 내부 서버 오류
                    console.log(response.status);
                    break;
                }
            }

        } catch (error) {
            console.error("회원정보 변경 시도 중 오류 발생: ", error);
            handleFailure("회원정보 변경 시도 중 오류 발생");
        }
    }

    return (
        <form onSubmit={handleUpdate} className="w-full">
            <p className="cp-tit01">회원 정보 수정</p>
            <div className="flex flex-col max-w-2xl mt-9">
                <FormField label="이메일" htmlFor="email" >
                    <CustomInput type="text" onChange={handleChange} value={formValues.email} name="email" id="email" placeholder="이메일을 입력하세요" />
                </FormField>
                <FormField label="현재 비밀번호" htmlFor="currentPassword" >
                    <CustomInput type="password" onChange={handleChange} value={formValues.currentPassword} name="currentPassword" id="currentPassword" placeholder="현재 비밀번호를 입력하세요" />
                    <div className="checkbox-group">
                        <input type="checkbox" checked={changePassword} onChange={() => setChangePassword(!changePassword)} id="changePassword"/>
                        <label htmlFor="changePassword" className="select-none mt-2 md:mt-3">비밀번호 변경</label>
                    </div>
                </FormField>
                {changePassword && (
                    <FormField label="새 비밀번호" htmlFor="newPassword" >
                        <CustomInput type="password" onChange={handleChange} value={formValues.newPassword} name="newPassword" id="newPassword" placeholder="새 비밀번호를 입력하세요" />
                    </FormField>
                )}
                <CustomButton caption="변경하기" bType="submit" bStyle="btn-style-1 w-full" />
            </div>
        </form>
    );
}