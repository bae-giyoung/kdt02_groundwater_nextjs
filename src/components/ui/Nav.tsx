'use client';
import Link from "next/link";

export default function Nav () {
  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center justify-center gap-10 text-xl font-bold">
          <li><Link href={"/explain"}><span>대시 보드</span></Link></li>
          {/* <li><Link href={"/explainold"}><span>대시 보드 Old</span></Link></li> */}
          <li><Link href={"https://www.awesomescreenshot.com/video/46379582?key=841a26872d250d5c3c5fcddca08a67d5"} target="_blank"><span>시연 동영상</span></Link></li>
      </ul>
    </nav>
  );
}