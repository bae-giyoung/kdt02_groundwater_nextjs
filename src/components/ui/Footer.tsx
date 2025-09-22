import Link from "next/link";
import WaveLogo from "../deco/WaveLogo";

export default async function Footer () {
  return (
    <footer>
      <div className="inner-footer flex flex-col justify-between content-between">
        <ul className="flex gap-4 md:gap-7 text-xs md:text-sm font-bold">
          <Link href="/"><li>개인정보 처리 방침</li></Link>
          <Link href="/"><li>이용 약관</li></Link>
          <Link href="/"><li>메뉴얼 다운로드</li></Link>
        </ul>
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-center items-center gap-2.5 font-medium text-lg lg:text-xl tracking-tighter">MulAlim Lab 2025 {/* <WaveLogo h={15} /> */}</div>
          <span className="text-xs lg:text-lg">All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}