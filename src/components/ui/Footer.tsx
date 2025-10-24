import Link from "next/link";

export default async function Footer () {
  return (
    <footer>
      <div className="inner-footer flex flex-col justify-between content-between">
        <ul className="flex gap-4 md:gap-7 text-xs md:text-sm font-bold">
          <Link href="/privacy"><li>개인정보 처리 방침</li></Link>
          <Link href="/terms"><li>이용 약관</li></Link>
          <Link href="https://www.awesomescreenshot.com/video/45335614?key=22b6bf02e01734f2ad832fc28d025077" target="_blank"><li>대시보드 시연 동영상</li></Link>
        </ul>
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-center items-center gap-2.5 font-medium text-lg lg:text-xl tracking-tighter">MulAlim Lab 2025</div>
          <span className="text-xs lg:text-lg">All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}