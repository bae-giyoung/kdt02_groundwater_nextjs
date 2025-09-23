'use client';
import { isLoginAtom } from "@/atoms/atoms";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserButton({targetPath} : {targetPath: string}) {  
  const [isLogin, setLogin] = useAtom(isLoginAtom);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
    sessionStorage.removeItem("user");
    setLogin(false);
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