'use client';
import { useSetAtom, useAtom } from "jotai";
import { sessionAtom, userInfoAtom } from "@/atoms/atoms";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

export default function UserButton() {
  const setSession = useSetAtom(sessionAtom);
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/java/api/v1/auth/logout', {
        method: "POST",
        credentials: "include",
      });

      switch(response.status) {
        case 200: {
          toast("로그아웃 성공", {
            position: "top-center",
            autoClose: 1000,
          });
          setUserInfo(null);
          setSession({ status: "unauthenticated", user: null });
          break;
        }
        default: {
          toast("로그아웃에 실패했습니다. 관리자에게 문의하세요.", {
            position: "top-center",
            autoClose: 2000,
          });
          break;
        }
      }
    } catch(error) {
      console.error("로그아웃 시도 중 오류 발생: ", error);
    }
  }

  return (
    <div className="user-btn-group flex invisible opacity-0 lg:visible lg:opacity-100 justify-center items-center">
      {
        userInfo?.username ? (
          <div id="user-util-btns" className="flex lg:gap-4 gap-2 items-end text-center">
            <Link href="/userpage" id="user-page" className="relative group">
              <Image src={"/assets/icon_user.svg"} width={40} height={40} alt="" />
              <p className="hidden group-hover:block absolute left-1/2 -bottom-4/5 -translate-x-1/2 
              text-white bg-black text-xs w-16 p-1">
                마이 페이지
              </p>
            </Link>
            <div id="logout-btn"
                onClick={handleLogout}
                className="user-btn group flex items-center gap-1.5 px-2.5 py-1 lg:gap-2.5 lg:px-3.5 lg:py-2 border-b-[3px] border-radius-15">
                <span className="shrink-0 text-lg sm:text-xl lg:text-2xl font-bold">Logout</span>
                <i className="arr w-4 h-4 lg:w-[22px] lg:h-[22px] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300"></i>
            </div>
          </div>
        ) : (
          <Link href="/login" id="login-btn"
              className="user-btn group flex items-center gap-1.5 px-2.5 py-1 lg:gap-2.5 lg:px-3.5 lg:py-2 border-b-[3px] border-radius-15 cursor-pointer">
              <span className="shrink-0 text-lg sm:text-xl lg:text-2xl font-bold">Login</span>
              <i className="arr w-4 h-4 lg:w-[22px] lg:h-[22px] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300"></i>
          </Link>
        )
      }
    </div>
  );
}