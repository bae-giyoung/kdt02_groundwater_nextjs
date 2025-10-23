'use client';
import Link from "next/link";
import { isLoginAtom } from "@/atoms/atoms";
import { useAtomValue } from "jotai";

export default function Nav () {
  const isLogin = useAtomValue(isLoginAtom);
  
  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center justify-center gap-10 text-xl font-bold">
          <li><Link href={"/explain"}><span>대시 보드</span></Link></li>
          {isLogin && <li><Link href={"/userpage"}><span>마이 페이지</span></Link></li>}
          <li><Link href={"#none"}><span>시연 동영상</span></Link></li>
      </ul>
    </nav>
  );
}