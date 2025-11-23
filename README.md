# 물알림단 지하수 예측 대시보드 (Frontend · Next.js)

> 지하수 수위 예측 결과를 시각화하는 **대시보드 Frontend** 레포입니다.  
> Next.js + React 기반으로 지도, 차트, 카드형 위젯 등을 구현했습니다.
> 웹 시연 동영상 URL: https://www.awesomescreenshot.com/video/46379582?key=841a26872d250d5c3c5fcddca08a67d5

---

## 🧩 Overview

- **역할**: 분리형 3계층 아키텍처에서 **프론트엔드(View + BFF 역할)** 담당
- **백엔드 연동**: Spring Boot API 서버, FastAPI AI 서버와 연동
- **주요 기능**
  - 전국 관측소 GeoMap + 버블 시각화
  - 관측소 상세 모달 (실측 vs 예측)
  - 경고/위험/정상 구간 시각화
  - 로그인/회원가입/사용자 정보 수정
  - 대시보드 데이터 Export (CSV, XLSX)

---

## 🛠 Tech Stack

- **Framework**: Next.js (App Router) + React
- **Styling**: Tailwind CSS, PostCSS, CSS
- **Charts & Map**: Highcharts.js
- **State Management**: Jotai
- **Build & Tooling**: TypeScript, ESLint, Prettier

---

## 📁 Project Structure

```text
c:.
├───public/                     # 정적 에셋 (이미지, 폰트 등)
│   └───assets/
└───src/
    ├───app/                    # 페이지 및 라우팅 (App Router)
    │   ├───api/v1/             # BFF: 백엔드 서버와 통신하는 API Routes
    │   ├───login/              # 로그인 페이지
    │   ├───register/           # 회원가입 페이지
    │   ├───userpage/           # 사용자 정보 페이지
    │   ├───explain/            # 서비스 소개 페이지
    │   ├───privacy/            # 개인정보처리방침
    │   ├───terms/              # 이용약관
    │   ├───layout.tsx          # 공통 레이아웃
    │   └───page.tsx            # 메인 페이지 (랜딩)
    ├───atoms/                  # Jotai 상태 관리
    ├───components/
    │   ├───dashboard/          # 대시보드 관련 컴포넌트 (차트, 맵, 테이블 등)
    │   ├───ui/                 # 공통 UI 컴포넌트 (Header, Footer, Nav 등)
    │   ├───userpage/           # 사용자 페이지 관련 컴포넌트
    │   └───*.tsx               # 그 외 단일 목적 공통 컴포넌트
    ├───data/                   # GeoMap 등에서 사용하는 정적 데이터
    ├───hooks/                  # 커스텀 훅
    ├───lib/                    # API 경로, 유틸리티 함수
    ├───styles/                 # 전역 CSS 스타일
    └───types/                  # 공통 타입 정의
```

---

## 🚀 Getting Started

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 열기
http://localhost:3000
```

---

## 🔐 Environment Variables

#### .env.local

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 환경변수를 설정해야 합니다.

```text
# Open API 서버와 통신하기 위한 키
GROUNDWATER_API_KEY=
```

---

## 📌 Notes

- 이 레포지토리는 **Frontend** 전용입니다. 백엔드/AI 서버는 별도 레포지토리에서 관리됩니다.
- 일부 실험적인 기능(`src/experiments`, `src/app/monitoring` 등)은 프로덕션 빌드에 포함되지 않으며, 문서에서도 제외했습니다.

---

## 🖼 Preview

<p align="center">
  <img src="./docs/presentation/dashboard_preview.png" width="80%" alt="Dashboard Preview" />
</p>

---

### 🎥 Demo Video

<a href="https://www.awesomescreenshot.com/video/46379582?key=841a26872d250d5c3c5fcddca08a67d5" target="_blank" rel="noopener noreferrer">
  🔗 https://www.awesomescreenshot.com/video/46379582?key=841a26872d250d5c3c5fcddca08a67d5
</a>

---

### 🏗 System Architecture

<p align="center">
  <img src="./docs/presentation/architecture.png" width="80%" alt="System Architecture Diagram" />
</p>

---