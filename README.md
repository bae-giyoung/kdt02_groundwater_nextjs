# 물알림단 지하수 예측 대시보드 (Frontend · Next.js)

> 지하수 수위 예측 결과를 시각화하는 **대시보드 Frontend** 레포입니다.  
> Next.js + React 기반으로 지도, 차트, 카드형 위젯 등을 구현했습니다.

---

## 📌 Notes

- 이 레포지토리는 **Frontend** 전용입니다. 백엔드/AI 서버는 별도 레포지토리에서 관리됩니다.
- 일부 실험적인 기능(`src/experiments`, `src/app/monitoring` 등)은 프로덕션 빌드에 포함되지 않으며, 문서에서도 제외했습니다.

---

## 📖 Table of Contents

> 목차의 항목을 클릭하면 해당 섹션으로 바로 이동할 수 있습니다.

- [개요](#-개요-overview)
- [기술 스택](#-기술-스택-tech-stack)
- [프로젝트 구조](#-프로젝트-구조-project-structure)
- [Setup & Run](#-getting-started)
- [환경변수 설정](#-환경변수-설정-environment-variables)
- [프리뷰 및 웹 시연 동영상](#-프리뷰-preview)
- [시스템 아키텍쳐](#-시스템-아키텍쳐-system-architecture)
- [기술적 문제 해결 과정](#-기술적-문제-해결-과정-troubleshooting--key-decisions)
- [문서 모음](#-문서-모음-docs)
- [Release Notes](#-release-notes)

---

## 🧩 개요 (Overview)

- **역할**: 분리형 3계층 아키텍처에서 **프론트엔드(View + BFF 역할)** 담당
- **백엔드 연동**: Spring Boot API 서버, FastAPI AI 서버와 연동
- **주요 기능**
  - 전국 관측소 GeoMap + 버블 시각화
  - 관측소 상세 모달 (실측 vs 예측)
  - 경고/위험/정상 구간 시각화
  - 로그인/회원가입/사용자 정보 수정
  - 대시보드 데이터 Export (CSV, XLSX)

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 | 선택 이유 |
| :--- | :--- | :--- |
| **코어 프레임워크** | [Next.js] (v15) | SEO 최적화와 초기 로딩 속도 개선을 위해 서버 사이드 렌더링(SSR)과 정적 사이트 생성(SSG)을 활용합니다. App Router는 라우팅 및 레이아웃 관리를 위한 강력한 기반을 제공합니다. |
| **UI 라이브러리** | [React] (v19) | 선언적이고 컴포넌트 기반의 접근 방식을 통해 복잡한 사용자 인터페이스를 효율적으로 구축합니다. |
| **언어** | [TypeScript] | JavaScript에 정적 타이핑을 추가하여 코드 품질, 개발자 생산성, 장기적인 유지보수성을 향상시킵니다. |
| **스타일링** | [Tailwind CSS] | 유틸리티 우선 CSS 프레임워크로, HTML을 벗어나지 않고도 빠르고 일관된 UI 개발이 가능합니다. `clsx`와 `tailwind-merge`를 함께 사용하여 조건부 클래스를 깔끔하게 관리합니다. |
| **상태 관리** | [Jotai] | React를 위한 원자적(atomic)이고 유연한 상태 관리 라이브러리입니다. 불필요한 리렌더링을 최소화하고 애플리케이션 전반의 상태 로직을 단순화합니다. |
| **차트 & 지도** | [Highcharts] | Highcharts는 다양한 종류의 인터랙티브 차트를 위해 사용했습니다. |
| **애니메이션** | [Framer Motion], [GSAP] | 부드럽고 복잡한 애니메이션을 구현하여 대시보드의 사용자 경험과 시각적 매력을 향상시킵니다. |
| **데이터 핸들링** | [Papa Parse], [jsPDF], [html-to-image] | Papa Parse는 클라이언트 측 CSV 파싱을 담당합니다. jsPDF와 html-to-image는 데이터 및 시각화 결과(PDF, 이미지 등)를 내보내는 기능을 제공합니다. |
| **린팅 & 포맷팅**| [ESLint] | 일관된 코드 스타일을 강제하고 잠재적 오류를 식별하여 프로젝트 전반의 코드 품질과 유지보수성을 보장합니다. |

---

## 📁 프로젝트 구조 (Project Structure)

```text
c:.
├───public/                     # 정적 에셋 (이미지, 동영상 등)
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

## 🔐 환경변수 설정 (Environment Variables)

#### .env.local

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 환경변수를 설정해야 합니다.

```text
# Open API 서버와 통신하기 위한 키
GROUNDWATER_API_KEY=
```

---

## 🖼 프리뷰 (Preview)

<p align="center">
  <img src="./docs/presentation/dashboard_preview.png" width="80%" alt="Dashboard Preview" />
</p>

---

### 🎥 시연 동영상 (Demo Video)

<a href="https://www.awesomescreenshot.com/video/46379582?key=841a26872d250d5c3c5fcddca08a67d5" target="_blank" rel="noopener noreferrer">
  🔗 https://www.awesomescreenshot.com/video/46379582?key=841a26872d250d5c3c5fcddca08a67d5
</a>

---

### 🏗 시스템 아키텍쳐 (System Architecture)

<p align="center">
  <img src="./docs/presentation/architecture.png" width="80%" alt="System Architecture Diagram" />
</p>

---

## 🤔 기술적 문제 해결 과정 (Troubleshooting & Key Decisions)

이 프로젝트를 진행하며 마주했던 주요 기술적 고민과 해결 과정을 공유합니다.

### 1. 다중서버 CORS 문제: 세션 로그인

- **문제점**: 
  Next.js, Spring Boot, FastAPI가 서로 다른 Origin에서 동작하면서 브라우저가 Cross-Origin으로 판단 → **CORS 에러 발생 + 세션 쿠키 전달 실패(JSESSIONID)**

- **검토한 방법**:
  | 검토한 방법 | 결과 | 비고 |
  |------------|------|------|
  | SameSite=None + Secure + HTTPS | 해결 but 향후 문제발생 가능 | Chrome의 3rd-Party Cookie 정책으로 인증 안정성 부족 |
  | Nginx Reverse Proxy 구성 | 가능 | 운영 환경에 가장 적합하다고 판단되어 이후 **배포 시 작업 예정** |
  | **Next.js `rewrites` 프록시 활용** | 최종 선택 | 개발 환경 즉시 대응 가능 + 구조 단순 |

- **해결 과정**:
  Next.js rewrites 설정으로 프론트 서버를 중계 서버로 사용하여, 모든 요청 경로가 동일 Origin으로 처리되도록 구성

- **결과**
  - CORS 문제 해결
  - JSESSIONID HttpOnly 쿠키의 경우 프론트 서버의 도메인으로 저장 & 이후 인증 시, 쿠키가 백엔드 서버로 정상적으로 전달

### 2. 프론트 측의 Login 세션 유지 및 페이지 로딩 시 UI 깜빡임 해결

- **문제점**: 
- **검토한 방법**: 
- **해결 과정**:

### 3. Open API 일부 실패 시 전체 요청 실패

- **문제점**: 
- **검토한 방법**: 
- **해결 과정**:

---

## 📚 문서 모음 (Docs)

> *문서들은 프로젝트 진행 및 개선에 따라 업데이트됩니다.*

[![프로젝트 보고서](https://img.shields.io/badge/Project_Report-.docx-blue?style=flat&logo=microsoftword)](./docs/project-report-v1.docx)
[![프로젝트 발표용 자료](https://img.shields.io/badge/Presentation-PDF-red?style=flat&logo=adobeacrobatreader)](./docs/presentation/presentation.pdf)

---

## 📝 Release Notes

| 버전 | 날짜 | 주요 변경 내용 |
|-------|------|----------------|
| v1.0.0 | 2025-11-09 | 로컬 통합 |
| v1.1.0 | 예정 | UX 개선, 에러 핸들링 강화 |
| v2.0.0 | 예정 | 운영 환경 배포 (Nginx + HTTPS) |