'use client';
export default function Nav () {
  return (
    <nav>
        <ul className="flex items-center justify-center gap-10 text-xl font-bold">
            <li>모델 설명</li>
            <li>예측 서비스</li>
            <li>예측 내역 확인</li>
            <li>메뉴얼 다운로드</li>
        </ul>
    </nav>
  );
}