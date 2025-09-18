import MainVideo from "@/components/MainVideo";

export default function Home() {
  return (
    <div id="contents">
      <main>
        <section id="hero-visual" className="">
          <MainVideo vidSrc="assets/main/herovideo.mp4" />
        </section>
        <section id="msection-1" className="">섹션1</section>
        <section id="msection-2" className="">섹션2</section>
        <section id="msection-3" className="">섹션3</section>
        <section id="msection-4" className="">섹션4</section>
      </main>
    </div>
  );
}
