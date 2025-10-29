# MulAlim Lab: AI 기반 지하수위 예측 대시보드 프로젝트 보고서

## 1. 프로젝트 개요

본 프로젝트 **"MulAlim Lab"**은 딥러닝 모델을 활용하여 전국 주요 관측소의 지하수위를 예측하고, 그 결과를 효과적으로 시각화하여 제공하는 웹 대시보드입니다. 사용자는 이 서비스를 통해 다음과 같은 기능을 이용할 수 있습니다.

*   **전국 관측소 현황 파악**: 지도와 테이블, 차트를 통해 전국 12개 대표 관측소의 현재 및 과거 지하수위 데이터를 직관적으로 파악할 수 있습니다.
*   **AI 예측 데이터 확인**: 향후 7일간의 지하수위 예측치와 신뢰구간, 장기(10년) 변동 추세 및 모델의 예측 성능 지표(NSE, KGE 등)를 확인할 수 있습니다.
*   **상관관계 분석**: 기상 데이터(강수량, 기온, 습도)와 지하수위 예측치의 상관관계를 시각적으로 분석할 수 있습니다.
*   **사용자 맞춤 기능**: 사용자 인증(로그인/회원가입)을 통해 개인화된 서비스를 제공받고, 대시보드 데이터를 이미지(PNG, PDF)나 CSV 파일로 다운로드할 수 있습니다.

## 2. 핵심 기술 스택

본 프로젝트는 최신 웹 기술을 기반으로 사용자 경험과 개발 효율성을 극대화했습니다.

*   **프레임워크**: Next.js (App Router), React
*   **언어**: TypeScript
*   **상태 관리**: Jotai
*   **데이터 시각화**: Highcharts, Highcharts/Highmaps
*   **스타일링**: Tailwind CSS
*   **애니메이션**: GSAP (ScrollTrigger)
*   **UI/UX**: react-toastify (알림)

## 3. 프로젝트 아키텍처 및 주요 구조

프로젝트는 기능별 모듈화와 재사용성을 고려하여 다음과 같이 구조화되었습니다.

*   **`src/app`**: Next.js의 App Router 기반 라우팅 구조. 각 폴더가 URL 경로에 해당하며, `page.tsx`가 해당 경로의 UI를 정의합니다.
    *   `/`: 대시보드 메인 페이지
    *   `/login`, `/register`: 사용자 인증 페이지
    *   `/userpage`: 마이페이지
    *   `/api`: 프록시 및 목업 API 라우트 핸들러
*   **`src/components`**: 재사용 가능한 UI 컴포넌트 집합
    *   `dashboard/`: 대시보드를 구성하는 핵심 컴포넌트 (차트, 테이블, 지도 등)
    *   `ui/`: `Header`, `Footer`, `Button` 등 범용 UI 컴포넌트
    *   `utils/`: `AuthProvider`, `SetHeaderStyle` 등 전역 유틸리티 컴포넌트
    *   `userpage/`: 마이페이지 관련 컴포넌트
*   **`src/atoms`**: Jotai를 사용한 전역 상태(atom) 관리. 사용자 세션, 페이지 경로 등의 상태를 정의합니다.
*   **`src/hooks`**: `useSession`과 같은 커스텀 훅을 통해 반복적인 로직을 추상화합니다.
*   **`src/data`**: 관측소 정보 등 정적 JSON 데이터를 관리합니다.

## 4. 주요 기능 및 구현 상세

### 가. 사용자 인증 및 세션 관리 (`atoms/atoms.tsx`, `AuthProvider.tsx`)

*   **상태 관리**: Jotai의 `atom`과 `atomWithStorage`를 사용하여 사용자 세션 상태를 관리합니다.
    *   `userInfoAtom`: `sessionStorage`와 동기화되어 로그인 상태를 브라우저 세션 간에 유지하고, UI 깜박임을 방지합니다.
    *   `sessionAtom`: 메모리 상에서 현재 세션의 상세 상태('authenticated', 'unauthenticated' 등)를 관리합니다.
    *   `refreshSessionAtom`: `/api/v1/auth/me` API를 호출하여 현재 로그인된 사용자 정보를 갱신하고, `userInfoAtom`과 `sessionAtom`을 동기화하는 비동기 로직을 포함합니다.
*   **인증 흐름**:
    1.  `AuthProvider` 컴포넌트가 페이지 이동 시마다 `refreshSessionAtom`을 호출하여 사용자 인증 상태를 확인합니다.
    2.  `UserButton`, `userpage` 등 인증이 필요한 컴포넌트는 `sessionAtom` 또는 `userInfoAtom`의 상태에 따라 분기 처리됩니다. (예: 로그인/로그아웃 버튼 표시, 접근 제한)
    3.  로그인/로그아웃 시 `react-toastify`를 통해 사용자에게 피드백을 제공합니다.

### 나. 대시보드 (`DashBoardContents.tsx`)

대시보드는 다양한 데이터 시각화 컴포넌트를 조합하여 구성된 핵심 페이지입니다.

*   **데이터 Fetching**: `useEffect`와 `fetch` API를 사용하여 `/api/v1/dashboard/currentElev` 엔드포인트에서 대시보드 구성에 필요한 모든 데이터를 비동기적으로 가져옵니다.
*   **컴포넌트 구성**:
    *   `DashboardNavi`: 관측소 및 조회 기간 선택 UI. GSAP의 `ScrollTrigger`를 사용하여 스크롤에 따라 고정되는 인터랙션을 구현했습니다.
    *   `GeoMap`: Highcharts/Highmaps를 사용하여 전국 관측소의 위치와 평균 지하수위를 버블 크기로 시각화합니다.
    *   `CurrentTable`: 선택된 기간의 일별 지하수위 및 전일 대비 증감량을 테이블 형태로 제공합니다.
    *   `ForecastNext7Days`: 향후 7일간의 지하수위 예측치와 신뢰구간을 `arearange` 차트로 시각화합니다.
    *   `LineChartShadeZoom`: 10년간의 장기 추세를 보여주는 차트로, Highcharts Stock 모듈을 활용하여 확대/축소 기능을 제공합니다.
    *   `ForecastSummaryPanel`: 연도별/계절별 모델 예측 성능 지표(RMSE, NSE 등)를 상세 테이블과 스파크라인으로 제공합니다.
*   **사용자 인터랙션**: 관측소 선택, 기간 변경, 차트 데이터 다운로드(PNG, PDF, CSV) 등 다양한 상호작용을 지원합니다.

### 다. 데이터 시각화 (Highcharts)

*   프로젝트 전반에 걸쳐 **Highcharts** 라이브러리를 사용하여 전문적이고 인터랙티브한 차트를 구현했습니다.
*   각 차트(`BarChart`, `LineChartShadeZoom`, `WeatherGroundwaterTrendChart`, `DonutGauge` 등)는 독립된 컴포넌트로 분리되어 재사용성을 높였습니다.
*   `useMemo` 훅을 적극적으로 활용하여 `options` 객체를 캐싱함으로써, 불필요한 리렌더링 시 차트가 다시 그려지는 것을 방지하고 성능을 최적화했습니다.
*   `exporting` 모듈을 활성화하여 모든 차트에서 이미지 및 데이터 다운로드 기능을 기본적으로 제공합니다.

## 5. 코드 품질 및 개선 제안

현재 코드는 기능별로 잘 모듈화되어 있으며, React Hooks와 Jotai를 효과적으로 사용하고 있습니다. 몇 가지 개선점을 제안합니다.

1.  **API 호출 로직 추상화**:
    현재 여러 컴포넌트에서 `fetch` API를 직접 사용하고 있습니다. 이를 `useSWR`이나 `React Query` 같은 데이터 페칭 라이브러리를 도입하거나, 커스텀 훅으로 추상화하면 캐싱, 재시도, 상태 관리 로직을 더욱 간결하고 선언적으로 관리할 수 있습니다.

    ```typescript
    // 예시: React Query를 사용한 데이터 페칭 훅
    import { useQuery } from '@tanstack/react-query';

    const fetchDashboardData = async (days: number) => {
      const resp = await fetch(`/api/v1/dashboard/currentElev?days=${days}`);
      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }
      return resp.json();
    };

    export function useDashboardData(days: number) {
      return useQuery({
        queryKey: ['dashboardData', days],
        queryFn: () => fetchDashboardData(days),
      });
    }
    ```

2.  **전역 상태 관리 고도화**:
    `atoms/atoms.tsx` 파일에 인증 관련 로직이 집중되어 있습니다. 로그인, 로그아웃과 같은 액션 로직을 `refreshSessionAtom`처럼 별도의 `write-only atom`으로 분리하면 컴포넌트의 책임이 줄어들고 코드의 응집도가 높아집니다.

    ```typescript
    // 예시: atoms/authActions.ts
    import { atom } from 'jotai';
    import { sessionAtom, userInfoAtom } from './atoms';

    export const loginAtom = atom(null, async (get, set, credentials) => {
      // 로그인 API 호출 로직
      // 성공 시
      set(refreshSessionAtom);
    });

    export const logoutAtom = atom(null, async (get, set) => {
      // 로그아웃 API 호출 로직
      // 성공 시
      set(userInfoAtom, null);
      set(sessionAtom, { status: 'unauthenticated', user: null });
    });
    ```

3.  **타입 정의 강화**:
    `any` 타입을 사용하는 부분이 일부 존재합니다 (`ForecastNext7Days.tsx`의 초기 상태 등). API 응답에 대한 명확한 타입을 정의하고 적용하면 타입 안정성을 더욱 높일 수 있습니다.

    ```typescript
    // d:/_workspace_projects/kdt02_groundwater_nextjs/src/components/dashboard/ForecastNext7Days.tsx
    // 개선 전
    const [forecastData, setForecastData] = useState<Next7Forecast>({} as any);

    // 개선 후
    const [forecastData, setForecastData] = useState<Next7Forecast | null>(null);
    ```

4.  **환경 변수 관리**:
    API 기본 URL이 코드에 하드코딩된 부분이 있습니다. 이를 `.env` 파일로 분리하고 `process.env.NEXT_PUBLIC_API_BASE_URL`을 일관되게 사용하면 개발, 스테이징, 프로덕션 환경 간 전환이 용이해집니다.

## 6. 결론

"MulAlim Lab" 프로젝트는 Next.js와 최신 프론트엔드 기술을 활용하여 복잡한 시계열 데이터를 효과적으로 시각화하고, 사용자 인증 기능을 안정적으로 구현한 우수한 웹 애플리케이션입니다. 특히 Jotai를 통한 상태 관리와 Highcharts를 이용한 데이터 시각화 부분은 높은 수준의 완성도를 보여줍니다. 제안된 개선 사항들을 반영한다면 더욱 견고하고 확장성 있는 프로젝트로 발전할 수 있을 것입니다.
