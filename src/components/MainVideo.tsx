// 비디오 소스 포맷 바꿔야 함!!!!!!
'use client';

export default function MainVideo(
    {vidSrc} : {vidSrc: string}
) {
  return (
    <video autoPlay playsInline muted>
      <source src={vidSrc} type="video/mp4" />
      이 브라우저는 HTML5 Video를 지원하지 않습니다.
    </video>
  );
}