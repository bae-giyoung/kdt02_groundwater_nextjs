'use client';
export default function UseOfTermsText() {
    return (
        <div id="privacy-policy">
            <p className="c-tit03">이용 약관</p>
            <p className="c-txt01">
                본 이용약관은 사용자가 본 웹서비스(이하 “서비스”)를 이용함에 있어 지켜야 할 사항과 서비스 제공자의 책임 및 권리를 규정합니다.
            </p>
            <p className="c-txt03">제1조 (목적)</p>
            <p className="c-txt04">이 약관은 본 서비스의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            <p className="c-txt03">제2조 (서비스의 제공)</p>
            <ul className="c-list01 black">
                <li>본 서비스는 기상데이터 기반 LSTM+Transformer 모델을 이용한 지하수위 예측 및 시각화 기능을 제공합니다.</li>
                <li>본 서비스는 포트폴리오 및 연구 시연 목적으로 운영됩니다.</li>
            </ul>
            <p className="c-txt03">제3조 (회원가입 및 계정)</p>
            <ul className="c-list01 black">
                <li>회원가입 시 이메일, 사용자명, 비밀번호를 필수적으로 입력해야 합니다.</li>
                <li>비밀번호는 Bcrypt 방식으로 암호화되어 저장됩니다.</li>
                <li>회원은 계정 정보를 타인에게 양도하거나 공유할 수 없습니다.</li>
            </ul>
            <p className="c-txt03">제4조 (이용자의 의무)</p>
            <ul className="c-list01 black">
                <li>타인의 정보 도용, 허위 정보 입력, 서비스 운영 방해 행위를 해서는 안 됩니다.</li>
                <li>서비스의 목적(연구 및 시연)을 벗어난 불법적 사용은 금지됩니다.</li>
            </ul>
            <p className="c-txt03">제5조 (서비스의 제한 및 중단)</p>
            <ul className="c-list01 black">
                <li>서비스 제공자는 운영상, 기술상의 필요에 따라 서비스 제공을 일시적 또는 영구적으로 중단할 수 있습니다.</li>
                <li>무료 제공 서비스의 특성상, 예측 결과의 정확성이나 서비스 가용성에 대해 보증하지 않습니다.</li>
            </ul>
            <p className="c-txt03">제6조 (면책조항)</p>
            <ul className="c-list01 black">
                <li>본 서비스에서 제공하는 예측 결과는 연구 및 시연 목적의 참고용일 뿐, 실제 정책 결정이나 상업적 활용을 보장하지 않습니다.</li>
                <li>예측 결과를 활용한 의사결정에 대한 책임은 전적으로 이용자에게 있습니다.</li>
            </ul>
            <p className="c-txt03">제7조 (약관의 개정)</p>
            <ul className="c-list01 black">
                <li>본 약관은 필요 시 개정될 수 있으며, 개정 시 서비스 내 공지사항을 통해 사전 공지합니다.</li>
            </ul>
        </div>
    );
}