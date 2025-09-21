'use client';
import Link from "next/link";

export default function Nav () {
  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center justify-center gap-10 text-xl font-bold">
          <Link href={"/predict"}>
            <li>예측 서비스</li>
          </Link>
          <Link href={"/"}>
            <li>모델 설명</li>
          </Link>
          <Link href={"/"}>
            <li>예측 내역 확인</li>
          </Link>
          <Link href={"/"}>
            <li>메뉴얼 다운로드</li>
          </Link>
      </ul>
    </nav>
  );
}