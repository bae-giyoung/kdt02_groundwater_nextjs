'use client';
import FormField from "@/components/FormField";
import CustomInput from "@/components/CustomInput";

export default function UserInfoBox(
    {username, email}
    : {username: string, email: string}
) {
    return (
        <div className="w-full">
            <p className="cp-tit01">회원 정보 확인</p>
            <div className="flex flex-col max-w-2xl mt-9">
                <FormField label="아이디" htmlFor="username">
                    <CustomInput type="text" name="username" id="username" placeholder="" value={username !== "방문자" ? username : ""} disabled />
                </FormField>
                <FormField label="이메일" htmlFor="email">
                    <CustomInput type="text" name="email" id="email" placeholder={email} value="" disabled />
                </FormField>
            </div>
        </div>
    );
}