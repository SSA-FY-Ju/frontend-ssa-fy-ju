'use client';

/**\n * 파일 역할: 랜딩 5페이지 전환, 입력 진입 상태, 페이지 네비게이션을 총괄하는 메인 컨테이너입니다.\n */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Brand from './Brand';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page5 from './pages/Page5';

type PageState = 'landing' | 'chat';

const PAGES = [
  {
    kicker: 'SSAju · 별이 빛나는 밤, 당신의 길을 묻다',
    title: '취업 고민,\n많으시죠?',
    body: '이력서를 다섯 번째 고치고,\n밤하늘을 올려다본 적 있으신가요.',
  },
  {
    kicker: '누구나 한 번쯤 물어본 질문',
    title: '언제, 어디에,\n어떻게 지원할까?',
    body: '지원 시기, 직무 선택, 기업 적합성까지\n같은 고민을 반복하고 있습니다.',
  },
  {
    kicker: '저희의 약속',
    title: '저희가\n풀어드릴게요.',
    body: '사주 명리학의 흐름과 AI 분석을 결합해\n당신의 커리어 지도를 만들어드립니다.',
  },
  {
    kicker: '네 가지 분석',
    title: '네 가지 별자리,\n네 가지 답',
    body: '관운 분석 · AI 컨설팅 · 기업 궁합 · 만족도 피드백',
  },
  {
    kicker: '이제 시작합니다',
    title: '당신의 별,\n읽어드릴게요.',
    body: '생년월일과 시간을 알려주시면\n바로 분석을 시작할 수 있습니다.',
  },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [state, setState] = useState<PageState>('landing');
  const totalPages = PAGES.length;
  const containerRef = useRef<HTMLDivElement>(null);

  // Wheel / Touch / Keyboard navigation
  useEffect(() => {
    if (state !== 'landing') return;

    let lock = false;
    const advance = (dir: number) => {
      if (lock) return;
      lock = true;
      setPageIndex((p) => Math.max(0, Math.min(totalPages - 1, p + dir)));
      setTimeout(() => {
        lock = false;
      }, 900);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 6) return;
      advance(e.deltaY > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        advance(1);
      }
      if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        advance(-1);
      }
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) advance(dy > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [state, totalPages]);

  return (
    <div ref={containerRef} className="landing-no-drag relative w-screen h-screen overflow-hidden">
      <Brand
        onClick={() => {
          setPageIndex(0);
          setState('landing');
        }}
      />

      {/* Page dots */}
      <div className="page-dots">
        {PAGES.map((_, i) => (
          <button
            key={i}
            className={`page-dot ${pageIndex === i ? 'active' : ''}`}
            onClick={() => setPageIndex(i)}
            aria-label={`페이지 ${i + 1}`}
          >
            {pageIndex === i ? '🌕' : '🌙'}
          </button>
        ))}
      </div>

      {/* Pages */}
      <div className="pages">
        <div className={`page ${pageIndex === 0 ? 'active' : ''}`}>
          <Page1 />
        </div>

        <div className={`page ${pageIndex === 1 ? 'active' : ''}`}>
          <Page2 />
        </div>

        <div className={`page ${pageIndex === 2 ? 'active' : ''}`}>
          <Page3 />
        </div>

        <div className={`page ${pageIndex === 3 ? 'active' : ''}`}>
          <Page4 />
        </div>

        <div className={`page ${pageIndex === 4 ? 'active' : ''}`}>
          <Page5 onStart={() => router.push('/chat')} />
        </div>
      </div>
    </div>
  );
}
