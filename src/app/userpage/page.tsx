'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubVisual from "@/components/ui/SubVisual";
import SubNav from "@/components/ui/SubNav";
import WhetherAuthorized from "@/components/utils/WhetherAuthorized";
import FormField from "@/components/FormField";
import CustomInput from "@/components/CustomInput";
import Link from "next/link";
import safeParseResponseToJson from "@/components/utils/safeParseResponseToJson";
import type { UserErrorType } from "@/types/uiTypes";
import { toast } from "react-toastify";
import Image from "next/image";

export default function UserPage() {
    // WhetherAuthorized : 서버의 인가 설정에 따를 것이므로 임시 코드임. 추후 백엔드와 합치고 지울것

    const DEFAULT_USER_INFO = {
        username: "방문자",
        email: "",
        roles: "GUEST",
    }

    const [userInfo, setUserInfo] = useState(DEFAULT_USER_INFO); // 타입 지정!!!!!!
    const router = useRouter();
    

    const getUserInfo = async (): Promise<(typeof DEFAULT_USER_INFO) | UserErrorType | null> => {
        const response = await fetch('/java/api/v1/auth/me', {
            method: "GET",
            credentials: "include",
        });

        return await safeParseResponseToJson(response);
    }


    useEffect(() => {
        if(!sessionStorage.getItem("user")) {
            alert("로그인 후 이용이 가능합니다.");
            router.push("/login");
            return;
        }

        getUserInfo().then((res) => {
            if(res && "username" in res) {
                console.log(res);
                setUserInfo((prev) => ({...prev, ...res}));
                return;
            }

            let message = "회원 정보를 찾을 수 없습니다. 관리자에게 문의하세요";
            if(res && "message" in res) {
                message = res.message;
            }

            toast(message, {
                position: "top-center",
                autoClose: 2000,
            });
        });
    }, []);

    const { username, email, roles } = userInfo;


    return (
        <div id="contents" className="">
            <WhetherAuthorized />
            <SubVisual 
            tit1="마이 페이지" 
            tit2="나의 정보 확인" 
            tit3="회원 정보를 확인하세요." 
            />
            <SubNav />
            <div className="section flex gap-20">
                <div className="max-w-3xs">
                    <div className="flex justify-start items-start gap-3.5 mb-9">
                        <div className="h-24 relative flex justify-start items-center gap-2.5">
                            <div className="flex justify-center items-center w-24 h-24 left-0 top-0 bg-neutral-200 rounded-full">
                                <Image src={"/assets/icon_user.png"} width={20} height={23} alt="" />
                            </div>
                            <div className="w-7 h-7 p-1.5 left-[65px] top-[62px] absolute bg-white rounded-[20px] outline outline-1 outline-offset-[-1px] inline-flex flex-col justify-center items-center gap-2.5">
                                <Image src={"/assets/icon_settings.png"} width={20} height={23} alt="" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-start gap-1">
                            <div className="p-[3px] bg-neutral-800 inline-flex justify-center items-center gap-2.5">
                                <div className="justify-center text-white text-xs font-medium font-['Inter'] leading-none">{roles == "USER" ? "MEMBER" : roles}</div>
                            </div>
                            <div className="justify-center">
                                <span className="text-neutral-800 text-xl font-semibold font-['Inter'] leading-relaxed">{username}</span>
                                <span className="text-neutral-800 text-xl font-normal font-['Inter'] leading-relaxed">님</span>
                            </div>
                        </div>
                    </div>
                    <div className="self-stretch py-10 border-t border-b border-neutral-200 inline-flex flex-col justify-start items-start gap-7">
                        <div className="flex flex-col justify-start items-start gap-3.5">
                            <div className="justify-center text-neutral-400 text-xl font-medium font-['Inter'] leading-normal">정보 관리</div>
                            <div className="pl-2.5 inline-flex justify-center items-center gap-2.5">
                                <div className="justify-center text-neutral-800 text-lg font-medium font-['Inter'] leading-snug">
                                    <Link href="/userpage">개인 정보 확인</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <p className="cp-tit01">개인 정보 확인</p>
                    <p className="c-txt01">소제목 소제목 설명 설명 설명 설명 설명</p>
                    <div className="flex flex-col max-w-2xl mt-9">
                        <FormField label="아이디" htmlFor="username">
                            <CustomInput type="text" name="username" id="username" placeholder="" value={username !== "방문자" ? username : ""} disabled />
                        </FormField>
                        <FormField label="이메일" htmlFor="email">
                            <CustomInput type="text" name="email" id="email" placeholder={email} value="" disabled />
                        </FormField>
                    </div>
                </div>
            </div>
        </div>
    );
}