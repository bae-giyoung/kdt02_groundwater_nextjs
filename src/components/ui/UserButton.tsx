'use client';
import { isLoginAtom } from "@/atoms/atoms";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function UserButton({targetPath} : {targetPath: string}) {  
  const [isLogin, setLogin] = useAtom(isLoginAtom);
  const router = useRouter();
  
  
  const handleLogout = async () => {
    // 로그아웃 URL 검증
    const baseUrl = process.env.NEXT_PUBLIC_API_SPRING_BASE_URL;
    if(!baseUrl) {
      toast("로그아웃 서버 연결 정보를 찾을 수 없습니다. 관리자에게 문의하세요.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      switch(response.status) {
        case 200: {
          toast("로그아웃 성공", {
            position: "top-center",
            autoClose: 1000,
          });
          setLogin(false);
          sessionStorage.removeItem("user");
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
    <div className="user-btn-group flex justify-center items-center">
      {
        isLogin ? (
          <div id="login-btn"
              onClick={handleLogout}
              className="user-btn group hidden lg:flex items-center gap-1.5 px-2.5 py-1 lg:gap-2.5 lg:px-3.5 lg:py-2 border-b-[3px] border-radius-15">
              <span className="shrink-0 text-lg sm:text-xl lg:text-2xl font-bold">Logout</span>
              <i className="arr w-4 h-4 lg:w-[22px] lg:h-[22px] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300"></i>
          </div>
        ) : (
          <Link href={targetPath} id="logout-btn"
              className="user-btn group hidden lg:flex items-center gap-1.5 px-2.5 py-1 lg:gap-2.5 lg:px-3.5 lg:py-2 border-b-[3px] border-radius-15 cursor-pointer">
              <span className="shrink-0 text-lg sm:text-xl lg:text-2xl font-bold">Login</span>
              <i className="arr w-4 h-4 lg:w-[22px] lg:h-[22px] shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300"></i>
          </Link>
        )
      }
    </div>
  );
}