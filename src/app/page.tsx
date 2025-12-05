"use client";
import MainVideo from "@/components/MainVideo";
import Link from "next/link";
import Image from "next/image";
import arrowWh from "../../public/assets/arrow_link_wh.png";

export default function Home() {

  return (
    <main>
      <div id="smooth-wrapper" className="min-h-screen">
        <div id="smooth-content" className="pb-[250px]">
          <section id="hero-visual" className="relative min-h-svh overflow-hidden">
            <div className="absolute h-full w-full left-1/2 top-1/2 -translate-1/2">
              <MainVideo videoSources={[{src: "/assets/main/herovideo.webm", type: "video/webm"}, {src: "/assets/main/herovideo.mp4", type: "video/mp4"}]} />
            </div>
            <div className="absolute w-full px-8 left-1/2 top-1/2 -translate-1/2 text-center text-white text-shadow-(--text-main-shadow)">
              <span className="block leading-none font-bold text-xl mb-5 lg:text-3xl lg:mb-8">
                Groundwater Prediction
              </span>
              <p className="max-w-[400px] md:max-w-none text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[130%] mx-auto mb-7 lg:mb-10">
                AI 지하수위 예측 모델로 <br className="hidden md:block lg:block" />미래 수자원 관리에 기여합니다.
              </p>
              <Link href="/explain" className="inline-flex gap-2.5 justify-center items-center border-2 rounded-4xl bg-[#ffffff22] hover:backdrop-blur-sm transition-all duration-300 
                px-4 py-2 lg:px-7 lg:py-4 group">
                <span className="text-lg md:text-xl lg:text-2xl font-bold">대시 보드 바로가기</span>
                <i className="w-5 lg:w-7 shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <Image src={arrowWh} alt="화살표" className="w-full h-full" />
                </i>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}