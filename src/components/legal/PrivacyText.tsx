'use client';
export default function PrivacyText() {
    return (
        <div id="privacy-policy">
            <p className="c-tit03">개인정보 처리방침</p>
            <p className="c-txt01">
                본 웹서비스(이하 “서비스”)는 사용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
            </p>
            <p className="c-txt03">1. 수집하는 개인정보 항목</p>
            <ul className="c-list01 black">
                <li>
                    필수항목: 이메일, 사용자 이름(username), 비밀번호(암호화 저장: Bcrypt 방식)
                </li>
                <li>선택항목: 없음</li>
                <li>서비스 이용 과정에서 자동으로 생성·수집되는 정보: 접속 로그, 쿠키, 접속 IP 정보 등</li>
            </ul>
            <p className="c-txt03">2. 개인정보의 수집 및 이용 목적</p>
            <ul className="c-list01 black">
                <li>회원 가입 및 로그인 기능 제공</li>
                <li>기상 데이터를 기반으로 한 지하수위 예측 서비스 제공</li>
                <li>회원 식별 및 부정이용 방지</li>
            </ul>
            <p className="c-txt03">3. 개인정보 보관 및 이용 기간</p>
            <ul className="c-list01 black">
                <li>회원 계정 정보: 회원 탈퇴 시 즉시 파기</li>
                <li>로그 기록: 보안 및 운영상의 필요에 따라 최대 1년 보관 후 삭제</li>
            </ul>
            <p className="c-txt03">4. 개인정보의 제3자 제공 및 위탁</p>
            <ul className="c-list01 black">
                <li>본 서비스는 이용자의 동의 없이는 개인정보를 제3자에게 제공하지 않음</li>
            </ul>
            <p className="c-txt03">5. 개인정보 보호를 위한 기술적/관리적 조치</p>
            <ul className="c-list01 black">
                <li>비밀번호는 Bcrypt 암호화 방식으로 안전하게 저장</li>
                <li>개인정보 접근 권한 최소화</li>
            </ul>
            <p className="c-txt03">6. 이용자의 권리</p>
            <ul className="c-list01 black">
                <li>언제든지 본인의 개인정보 열람, 수정, 삭제, 처리 정지를 요청할 수 있음</li>
                <li>회원 탈퇴 시 모든 개인정보는 지체 없이 파기</li>
            </ul>
            <p className="c-txt03">7. 개인정보 보호 책임자</p>
            <ul className="c-list01 black">
                <li>담당자: 배기영</li>
                <li>이메일: giyoung101@naver.com</li>
            </ul>
        </div>
    );
} 