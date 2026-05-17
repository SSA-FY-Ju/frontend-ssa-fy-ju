'use client';

import { useState, useEffect, useRef } from 'react';
import '@/styles/landing.css';
import StarryBackground from './StarryBackground';
import Brand from './Brand';

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

const SERVICES = [
  { num: '01', title: '관운 분석', subtitle: '상반기·하반기, 언제가 좋을까?', desc: 'Career Timing' },
  { num: '02', title: 'AI 커리어 컨설팅', subtitle: '19개 항목으로 풀어내는 나만의 지도', desc: 'Consultation' },
  { num: '03', title: '기업 궁합 분석', subtitle: '저 회사, 정말 나랑 맞을까?', desc: 'Compatibility' },
  { num: '04', title: '만족도 피드백', subtitle: '결과를 더 정교하게 다듬어요', desc: 'Feedback' },
] as const;

export default function LandingPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [state, setState] = useState<PageState>('landing');
  const [isLocked, setIsLocked] = useState(false);
  const totalPages = PAGES.length;
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard events
  useEffect(() => {
    if (state !== 'landing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        setPageIndex((p) => Math.max(0, Math.min(totalPages - 1, p + 1)));
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 900);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        setPageIndex((p) => Math.max(0, Math.min(totalPages - 1, p - 1)));
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 900);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, state, totalPages]);

  // Wheel events
  useEffect(() => {
    if (state !== 'landing') return;

    let lock = false;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (lock) return;
      lock = true;
      setPageIndex((p) => Math.max(0, Math.min(totalPages - 1, p + (e.deltaY > 0 ? 1 : -1))));
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        lock = false;
      }, 900);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isLocked, state, totalPages]);

  // Touch events
  useEffect(() => {
    if (state !== 'landing') return;

    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) {
        setPageIndex((p) => Math.max(0, Math.min(totalPages - 1, p + (dy > 0 ? 1 : -1))));
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 900);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isLocked, state, totalPages]);

  return (
    <div ref={containerRef} className="landing-no-drag relative w-screen h-screen overflow-hidden">
      <StarryBackground />
      <Brand onClick={() => { setPageIndex(0); setState('landing'); }} />

      {/* Page dots */}
      <div className="page-dots">
        {PAGES.map((_, i) => (
          <button
            key={i}
            className={`page-dot ${pageIndex === i ? 'active' : ''}`}
            onClick={() => setPageIndex(i)}
            aria-label={`페이지 ${i + 1}`}
          />
        ))}
      </div>

      {/* Pages */}
      <div className="pages">
        {/* Page 1 */}
        <div className={`page ${pageIndex === 0 ? 'active' : ''}`}>
          <div style={{ textAlign: 'center', maxWidth: 900 }}>
            <div className="label fade-in-up" style={{ marginBottom: 24 }}>{PAGES[0].kicker}</div>
            <h1 className="headline headline-xl fade-in-up delay-1" style={{ marginBottom: 28 }}>
              취업 고민,<br />
              <em>많으시죠?</em>
            </h1>
            <p className="body-text fade-in-up delay-2" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto', color: 'rgba(244,236,216,0.75)' }}>
              이력서를 다섯 번째 고치고,<br />
              밤하늘을 올려다본 적 있으신가요.
            </p>
            <div className="scroll-hint">
              <span>다음 페이지</span>
              <div className="arrow"></div>
            </div>
          </div>
        </div>

        {/* Page 2 */}
        <div className={`page ${pageIndex === 1 ? 'active' : ''}`}>
          <div style={{ width: '100%', maxWidth: 880 }}>
            <h2 className="headline headline-lg fade-in-up" style={{ textAlign: 'center', marginBottom: 8 }}>
              누구나 한 번쯤<br />
              <em>물어봤던 질문들</em>
            </h2>
            <p className="body-text fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(244,236,216,0.65)' }}>
              취준생 10명 중 9명이 같은 고민을 합니다.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { t: '"언제 지원하면 될까요?"', s: '상반기? 하반기?' },
                { t: '"저는 어떤 직무가 맞을까요?"', s: '자기소개서 앞에서 멈춰버린 마음' },
                { t: '"이 회사, 정말 저랑 맞나요?"', s: '면접 합격 후에도 드는 의문' },
                { t: '"나는 무엇으로 어필해야 하죠?"', s: '강점 한 줄이 떠오르지 않는 밤' },
              ].map((w, i) => (
                <div key={i} className={`fade-in-up delay-${i + 1}`} style={{
                  padding: '24px 26px',
                  borderRadius: 16,
                  background: 'rgba(13, 27, 61, 0.45)',
                  border: '1px solid rgba(244, 236, 216, 0.12)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div className="headline" style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}>{w.t}</div>
                  <div style={{ fontSize: 13, color: 'rgba(244,236,216,0.55)', fontFamily: 'var(--sans)' }}>{w.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 3 */}
        <div className={`page ${pageIndex === 2 ? 'active' : ''}`}>
          <div style={{ textAlign: 'center', maxWidth: 820 }}>
            <div className="label fade-in-up" style={{ marginBottom: 28 }}>저희의 약속</div>
            <h2 className="headline headline-lg fade-in-up delay-1" style={{ marginBottom: 36 }}>
              저희가<br />
              <em>풀어드릴게요.</em>
            </h2>
            <p className="body-text fade-in-up delay-2" style={{ fontSize: 19, lineHeight: 1.8, color: 'rgba(244,236,216,0.85)' }}>
              천 년 동안 별을 읽어온 사주 명리학과<br />
              오늘의 AI가 당신의 커리어 지도를 함께 그립니다.
            </p>
            <p className="fade-in-up delay-3" style={{ marginTop: 36, fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 16, color: 'var(--moon-glow)' }}>
              "별을 보지 않고 길을 떠나지 마세요."
            </p>
          </div>
        </div>

        {/* Page 4 */}
        <div className={`page ${pageIndex === 3 ? 'active' : ''}`}>
          <div style={{ width: '100%', maxWidth: 920 }}>
            <h2 className="headline headline-lg fade-in-up" style={{ textAlign: 'center', marginBottom: 12 }}>
              네 가지 별자리,<br />
              <em>네 가지 답</em>
            </h2>
            <p className="body-text fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 44, color: 'rgba(244,236,216,0.65)' }}>
              취준생·이직자에게 꼭 필요한 네 개의 분석.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {SERVICES.map((s, i) => (
                <div key={i} className={`fade-in-up delay-${i + 1}`} style={{
                  padding: '24px 22px',
                  borderRadius: 14,
                  background: 'rgba(13, 27, 61, 0.4)',
                  border: '1px solid rgba(244, 236, 216, 0.1)',
                  backdropFilter: 'blur(8px)',
                  minHeight: 170,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 22, color: 'var(--moon-glow)' }}>{s.num}</div>
                  <div className="headline" style={{ fontSize: 19, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(244,236,216,0.65)', flex: 1 }}>{s.subtitle}</div>
                  <div style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 12, color: 'rgba(165,180,252,0.7)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 5 */}
        <div className={`page ${pageIndex === 4 ? 'active' : ''}`}>
          <div style={{ textAlign: 'center', maxWidth: 720 }}>
            <div className="label fade-in-up" style={{ marginBottom: 24 }}>이제, 시작합니다</div>
            <h2 className="headline headline-xl fade-in-up delay-1" style={{ marginBottom: 28 }}>
              당신의 별,<br />
              <em>읽어드릴게요.</em>
            </h2>
            <p className="body-text fade-in-up delay-2" style={{ fontSize: 17, marginBottom: 48, color: 'rgba(244,236,216,0.75)' }}>
              생년월일과 태어난 시간만 알려주세요.<br />
              나머지는 별이 말해줄 거예요.
            </p>
            <button className="btn btn-primary fade-in-up delay-3" onClick={() => setState('chat')} style={{ fontSize: 16, padding: '16px 36px' }}>
              내 별자리 보러 가기 →
            </button>
            <p className="fade-in-up delay-4" style={{ marginTop: 20, fontSize: 12, color: 'rgba(244,236,216,0.4)', letterSpacing: '0.1em' }}>
              평균 소요 시간 약 3분 · 입력값은 저장되지 않아요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
