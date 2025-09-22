import Link from "next/link";

export default function Nav () {
  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center justify-center gap-10 text-xl font-bold">
          <li><Link href={"/predict"}><span>예측 서비스</span></Link></li>
          <li><Link href={"/"}><span>모델 설명</span></Link></li>
          <li><Link href={"/"}><span>예측 내역 확인</span></Link></li>
          <li><Link href={"/"}><span>메뉴얼 다운로드</span></Link></li>
      </ul>
    </nav>
  );
}