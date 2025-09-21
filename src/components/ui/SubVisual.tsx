export default async function SubVisual ({position="relative"}: {position: string}) {
  return (
    <div id="subvis" className={position}>
      <div className="pb-14 font-bold">
        <h2 className="c-tit01">로그인</h2>
        <p className="mb-6 text-[#444444] text-2xl">로그인 후 지하수위 예측 서비스를 이용해 보세요.</p>
        <p className="text-[#929292] text-lg">로그인 인증을 하시면 개인화 서비스 무슨 무슨 블라블라 서비스를 이용하실 수 있습니다.</p>
      </div>
    </div>
  );
}