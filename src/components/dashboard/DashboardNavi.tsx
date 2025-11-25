'use client';
import { ReactElement, ReactNode, cloneElement, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let scrollTriggerRegistered = false;

if (typeof window !== 'undefined' && !scrollTriggerRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

interface DashboardNaviProps {
  className?: string;
  pinned: ReactElement;
  footer?: ReactNode;
  headerSelector?: string;
  breakpoint?: number;
}

const DEFAULT_BREAKPOINT = 1024;

export default function DashboardNavi({
  className,
  pinned,
  footer,
  headerSelector = 'header',
  breakpoint = DEFAULT_BREAKPOINT,
}: DashboardNaviProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  const currentModeRef = useRef<'desktop' | 'mobile' | null>(null);

  // GSAP ScrollTrigger PIN
  const pinnedWithRef = useMemo(
    () => cloneElement(pinned, { ref: pinnedRef } as React.RefAttributes<HTMLElement>),
    [pinned]
  );

  // 레이아웃 별 ScrollTrigger
  useLayoutEffect(() => {   
    const container = containerRef.current;
    const pinnedElement = pinnedRef.current;

    if (!container || !pinnedElement) {
      return;
    }

    const killScrollTrigger = () => {
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
      contextRef.current?.revert();
      contextRef.current = null;
    };

    // 테스크탑
    const setupDesktop = () => {
      killScrollTrigger();
      currentModeRef.current = 'desktop';

      const footer = document.querySelector<HTMLElement>('#navi-footer');

      contextRef.current = gsap.context(() => {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          endTrigger: footer,
          end: 'bottom bottom',
          pin: pinnedElement,
          pinType: 'transform',
          pinSpacing: false,
          scrub: true,
          markers: false,
          invalidateOnRefresh: true,
        });
      }, container);
    };

    // 모바일
    const setupMobile = () => {
      killScrollTrigger();
      currentModeRef.current = 'mobile';

      const centents = document.querySelector<HTMLElement>('#contents');

      contextRef.current = gsap.context(() => {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          endTrigger: centents,
          end: 'bottom bottom',
          pin: container,
          pinType: 'transform',
          pinSpacing: false,
          scrub: true,
          markers: false,
          invalidateOnRefresh: true,
          onEnter: () => {
            container.classList.add('onEnter');
          },
          onLeaveBack: () => {
            container.classList.remove('onEnter');
          },
        })
      }, container);
    };

    // 화면 너비별 적용
    const applyLayout = () => {
      const isDesktop = window.innerWidth > breakpoint;

      if (isDesktop) {
        if (currentModeRef.current !== 'desktop') {
          setupDesktop();
        } else {
          scrollTriggerRef.current?.refresh();
        }
      } else {
        if (currentModeRef.current !== 'mobile') {
          setupMobile();
        } else {
          scrollTriggerRef.current?.refresh();
        }
      }
    };

    // 리사이즈 적용
    const handleResize = () => {
      applyLayout();
    };

    // 초기 설정과 이벤트 등록
    applyLayout();
    window.addEventListener('resize', handleResize);

    // 클리닝
    return () => {
      window.removeEventListener('resize', handleResize);
      killScrollTrigger();
      currentModeRef.current = null;
    };
  }, [breakpoint, headerSelector]);

  return (
    <div ref={containerRef} className={className}>
      {pinnedWithRef}
      <div id='navi-footer'>
        {footer}
      </div>
      <div className="desc info-box">
        <p>
          이 대시보드는 <b>딥러닝 지하수 수위 예측 모델을 활용한 웹서비스 프로토타입</b>으로,
          기상 요인(강수량, 기온, 습도, 기압)에 따른 지하수 변동을
          <b> 시각적으로 탐색하고 분석</b>하기 위해 제작되었습니다.
        </p>
        <div className='inner-box'>
          <p className='c-exc01'>데이터 설명</p>
          <ul className='c-list01'>
            <li>데이터 출처
              <br />- 국가지하수정보센터, 「국가지하수측정자료조회서비스 (일자료)」
              <br />- DATA・AI 분석 경진대회, 「지속가능한 수자원을 위한 지하수 함양 특성 분석 및 AI 기반 지하수위 변동 예측」
            </li>
            <li><b>본 페이지에서는 대표 12개 관측소의 지하수위 장기 변동 추세(2014~2023)</b>와 AI 모델의 예측 성능(NSE, KGE)을 함께 확인할 수 있습니다.</li>
            <li>데이터 출처 및 집계 기준에 따라 분석결과의 차이가 존재할 수 있으므로 참고용 분석 결과로만 활용 하시기 바랍니다.</li>
            <li style={{color: "#7b72d0"}}>
              <b>관측소별 지하수위 ‘경고/위험/정상’ 구분 기준</b>은  
              각 관측소의 <b>최근 10년간 월평균 수위 분포를 기반으로</b> 설정됩니다.  
              - 상위/하위 <b>10% 구간은 ‘위험’</b>,  
              - <b>10~25% 구간은 ‘경고’</b>,  
              - <b>25~75% 구간은 ‘정상 범위’</b>로 분류됩니다.
            </li>
            <li style={{color: "#7b72d0"}}>
              <b>관측소별 민감도</b>는 기상 변화(강우/가뭄)에 따라 지하수위가 변동하는 법위를 나타냅니다.  
              민갑도(버블의 크기)가 높을 수록 외부 요인에 의해 수위가 크게 변동할 수 있음을 의미합니다.
              - <b>강수민감형/가뭄취약형/복합형</b>으로 분류되어 색으로 표시됩니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
