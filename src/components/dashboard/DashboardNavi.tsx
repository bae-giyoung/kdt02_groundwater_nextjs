'use client';
import { ReactElement, ReactNode, cloneElement, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap} from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let scrollTriggerRegistered = false;

if (typeof window !== 'undefined' && !scrollTriggerRegistered) {
  console.log("ScroppTrigger 한번만 임포트 되고 있나? 체크");
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

interface DashboardNaviProps {
  className?: string;
  pinned: ReactElement;
  footer?: ReactNode;
  headerSelector?: string;
  breakpoint?: number;
  zIndex?: number;
}

const DEFAULT_BREAKPOINT = 1024;
const DEFAULT_Z_INDEX = 1000;

export default function DashboardNavi({
  className,
  pinned,
  footer,
  headerSelector = 'header',
  breakpoint = DEFAULT_BREAKPOINT,
  zIndex = DEFAULT_Z_INDEX,
}: DashboardNaviProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  const currentModeRef = useRef<'desktop' | 'mobile' | null>(null);

  const pinnedWithRef = useMemo(
    () => cloneElement(pinned, { ref: pinnedRef } as React.RefAttributes<HTMLElement>),
    [pinned]
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    const pinnedElement = pinnedRef.current;

    if (!container || !pinnedElement) {
      return;
    }

    const killScrollTrigger = () => {
      // ScrollTrigger 클리어
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;

      // gsap 컨텍스트 클리어
      contextRef.current?.revert();
      contextRef.current = null;
    };

    const setupDesktop = () => {
      killScrollTrigger();
      currentModeRef.current = 'desktop';

      contextRef.current = gsap.context(() => {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: () => {
            const distance = container.offsetHeight - pinnedElement.offsetHeight;
            return `+=${Math.max(distance, 0)}`;
          },
          scrub: true,
          pinType: 'transform',
          pin: pinnedElement,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      }, container);
    };

    const setupMobile = () => {
      killScrollTrigger();
      currentModeRef.current = 'mobile';

      const centents = document.querySelector<HTMLElement>('#contents');
      container.style.zIndex = String(zIndex);

      contextRef.current = gsap.context(() => {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          endTrigger: centents,
          end: 'bottom bottom',
          scrub: true,
          markers: false,
          pinType: 'transform',
          pin: container,
          pinSpacing: false,
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

    const applyLayout = () => {
      const isDesktop = window.innerWidth > breakpoint;

      if (isDesktop) {
        if (currentModeRef.current !== 'desktop') {
          setupDesktop();
          console.log('첫 로딩시 작동하는가');
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

    const handleResize = () => {
      applyLayout();
    };

    applyLayout();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      killScrollTrigger();
      currentModeRef.current = null;
    };
  }, [breakpoint, headerSelector, zIndex]);

  return (
    <div ref={containerRef} className={className}>
      {pinnedWithRef}
      {footer}
    </div>
  );
}
