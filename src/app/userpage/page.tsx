'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubVisual from "@/components/ui/SubVisual";
import SubNav from "@/components/ui/SubNav";
import Image from "next/image";
import { toast } from "react-toastify";
import useSession from "@/hooks/useSession";
import UserInfoBox from "@/components/userpage/UserInfoBox";
import UserEditBox from "@/components/userpage/UserEditBox";
import UserDeleteBox from "@/components/userpage/UserDeleteBox";

export default function UserPage() {
    const {session, isAuthenticated} = useSession(false);
    const [tab, setTab] = useState<string>('user-info');
    const router = useRouter();
    
    useEffect(() => {
        if(session.status === "unauthenticated") {
            toast("로그인 후 이용이 가능합니다.", {
                position: "top-center",
                autoClose: 2000,
            });
            router.push("/login");
            return;
        }
    }, [session.status, router]);

    if(!session.user || !isAuthenticated) {
        return null;
    }

    const handleChangeTab = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setTab(e.currentTarget.dataset.tab ?? 'user-info');
    }
    
    const { username, email, roles } = session.user;

    return (
        <div id="contents" className="">
            <SubVisual 
            tit1="마이 페이지" 
            tit2="나의 정보 확인 및 변경" 
            tit3="회원 정보를 확인하세요." 
            />
            <SubNav />
            <div className="section flex flex-col sm:flex-row lg:gap-48 gap-20">
                <div className="sm:max-w-3xs">
                    <div className="flex justify-start items-start gap-3.5 mb-9">
                        <div className="h-24 relative flex justify-start items-center gap-2.5">
                            <div className="flex justify-center items-center w-24 h-24 left-0 top-0 bg-neutral-200 rounded-full">
                                <Image src={"/assets/icon_user.png"} width={60} height={60} alt="" />
                            </div>
                            <div className="w-7 h-7 p-1.5 left-[65px] top-[62px] absolute bg-white rounded-[20px] outline outline-1 outline-offset-[-1px] inline-flex flex-col justify-center items-center gap-2.5">
                                <Image src={"/assets/icon_settings.png"} width={20} height={23} alt="" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-start gap-1">
                            <div className="inline-flex justify-center items-center gap-2.5 p-1 bg-neutral-800">
                                <div className="justify-center text-white text-xs font-medium font-['Inter'] leading-none">{roles == "USER" ? "MEMBER" : roles}</div>
                            </div>
                            <div className="justify-center">
                                <span className="text-neutral-800 text-xl font-semibold font-['Inter'] leading-relaxed">{username}</span>
                                <span className="text-neutral-800 text-xl font-normal font-['Inter'] leading-relaxed">님</span>
                            </div>
                        </div>
                    </div>
                    <div className="self-stretch w-full inline-flex flex-col justify-center items-start gap-7 py-10 border-t border-b border-neutral-200">
                        <div className="flex flex-col justify-start items-start gap-3.5">
                            <div className="justify-center text-neutral-400 text-xl font-medium font-['Inter'] leading-normal">정보 관리</div>
                            <div className="pl-2.5 inline-flex sm:flex-col justify-start items-start gap-4">
                                <div data-tab="user-info" onClick={handleChangeTab} className="nav-hover-item justify-center text-neutral-800 text-lg font-medium font-['Inter'] leading-snug cursor-pointer">
                                    <span>회원 정보 확인</span>
                                </div>
                                <div data-tab="user-edit" onClick={handleChangeTab} className="nav-hover-item justify-center text-neutral-800 text-lg font-medium font-['Inter'] leading-snug cursor-pointer">
                                    <span>회원 정보 변경</span>
                                </div>
                                <div data-tab="user-delete" onClick={handleChangeTab} className="nav-hover-item justify-center text-neutral-800 text-lg font-medium font-['Inter'] leading-snug cursor-pointer">
                                    <span>회원 탈퇴</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    tab === 'user-info' ?
                    <UserInfoBox username={username} email={email} />
                    : tab === 'user-edit' ?
                    <UserEditBox email={email} />
                    : tab === 'user-delete' ?
                    <UserDeleteBox />
                    : null
                }
            </div>
        </div>
    );
}