'use client';

interface VidSrcRecord {
  src: string;
  type: string;
}
interface MainVideoProps {
  videoSources?: VidSrcRecord[];
  poster?: string;
  className?: string;
}

export default function MainVideo(
    {
      videoSources = [], 
      poster = "/assets/main/herovideo_placeholder.webp", 
      className = "w-full max-w-none h-full max-h-svh object-cover"
    } : MainVideoProps
) {
  const hasSources = videoSources.length > 0;

  return (
    <video 
    autoPlay playsInline muted loop preload="none" 
    poster={poster} className={className}
    onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {console.log("비디오 자동재생 실패")})}
    >
      {
        hasSources &&
        videoSources.map((record) => (
          <source key={`${record.src}-${record.type}`} src={record.src} type={record.type} />
        ))
      }
      {
        hasSources
        ? "이 브라우저는 HTML5 Video를 지원하지 않습니다."
        : "동영상이 존재하지 않습니다."
      }
    </video>
  );
}