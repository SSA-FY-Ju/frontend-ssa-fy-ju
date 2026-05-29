'use client';

/**\n * 파일 역할: 스토리형 랜딩 경험(페이지 전환, 도트 네비, CTA 후 서비스 이동)을 구성합니다.\n */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const TOTAL_PAGES = 5;

const worries = [
  { title: '“언제 지원하면 될까요?”', sub: '상반기? 하반기?' },
  { title: '“저는 어떤 직무가 맞을까요?”', sub: '자기소개서 앞에서 멈춰버린 마음' },
  { title: '“이 회사, 정말 저랑 맞나요?”', sub: '면접 합격 후에도 드는 의문' },
  { title: '“나는 무엇으로 어필해야 하죠?”', sub: '강점 한 줄이 떠오르지 않는 밤' },
];

const services = [
  { number: '01', title: '관운 분석', sub: '상반기·하반기, 언제가 좋을까?', en: 'Career Timing', href: '/career-timing' },
  {
    number: '02',
    title: 'AI 커리어 컨설팅',
    sub: '19개 항목으로 풀어내는 나만의 지도',
    en: 'Consultation',
    href: '/consultation',
  },
  { number: '03', title: '기업 궁합 분석', sub: '저 회사, 정말 나랑 맞을까?', en: 'Compatibility', href: '/compatibility' },
];

type Stage = 'landing' | 'select';

export function StoryLandingExperience() {
  const [stage, setStage] = useState<Stage>('landing');
  const [pageIndex, setPageIndex] = useState(0);
  const pageIndexRef = useRef(0);
  const landingPagesRef = useRef<HTMLElement | null>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!landingPagesRef.current) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        const next = Math.min(pageIndexRef.current + 1, TOTAL_PAGES - 1);
        pageRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        const prev = Math.max(pageIndexRef.current - 1, 0);
        pageRefs.current[prev]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'landing') return;

    const onScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      pageRefs.current.forEach((pageEl, idx) => {
        if (!pageEl) return;
        const rect = pageEl.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });

      setPageIndex((prev) => (prev !== closestIndex ? closestIndex : prev));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [stage]);

  const handleDotClick = (index: number) => {
    pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="landing-root relative bg-night-900 text-white">
      <LandingStars />
      <div className="landing-bg-drift pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(41,82,163,0.35),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(59,109,184,0.30),transparent_60%),radial-gradient(ellipse_at_50%_80%,rgba(26,47,94,0.45),transparent_55%),linear-gradient(180deg,#0a1230_0%,#16306b_40%,#1e4490_70%,#0d1b3d_100%)]" />

      {stage === 'landing' && (
        <aside className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`landing-dot ${pageIndex === i ? 'active' : ''}`}
              aria-label={`페이지 ${i + 1}`}
            />
          ))}
        </aside>
      )}

      {stage === 'landing' && (
        <section ref={landingPagesRef} className="landing-pages">
          <div ref={(el) => { pageRefs.current[0] = el; }} className={`page ${pageIndex === 0 ? 'active' : ''}`}>
            <div style={{ textAlign: 'center', maxWidth: 900 }}>
              <div className="label fade-in-up" style={{ marginBottom: 24 }}>
                SSAju · 별이 빛나는 밤, 당신의 길을 묻다
              </div>
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
                <div className="arrow" />
              </div>
            </div>
          </div>

          <div ref={(el) => { pageRefs.current[1] = el; }} className={`page ${pageIndex === 1 ? 'active' : ''}`}>
            <div style={{ width: '100%', maxWidth: 880 }}>
              <h2 className="headline headline-lg fade-in-up" style={{ textAlign: 'center', marginBottom: 8 }}>
                누구나 한 번쯤<br />
                <em>물어봤던 질문들</em>
              </h2>
              <p className="body-text fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(244,236,216,0.65)' }}>
                취준생 10명 중 9명이 같은 고민을 합니다.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {worries.map((w, i) => (
                  <div key={w.title} className={`fade-in-up delay-${i + 1}`} style={{ padding: '24px 26px', borderRadius: 16, background: 'rgba(13, 27, 61, 0.72)', border: '1px solid rgba(244, 236, 216, 0.12)' }}>
                    <div className="headline" style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}>{w.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(244,236,216,0.55)' }}>{w.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={(el) => { pageRefs.current[2] = el; }} className={`page ${pageIndex === 2 ? 'active' : ''}`}>
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
              <p className="fade-in-up delay-3" style={{ marginTop: 36, fontStyle: 'italic', fontSize: 16, color: 'var(--moon-glow)' }}>
                “별을 보지 않고 길을 떠나지 마세요.”
              </p>
            </div>
          </div>

          <div ref={(el) => { pageRefs.current[3] = el; }} className={`page ${pageIndex === 3 ? 'active' : ''}`}>
            <div style={{ width: '100%', maxWidth: 920 }}>
              <h2 className="headline headline-lg fade-in-up" style={{ textAlign: 'center', marginBottom: 12 }}>
                네 가지 별자리,<br />
                <em>네 가지 답</em>
              </h2>
              <p className="body-text fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 44, color: 'rgba(244,236,216,0.65)' }}>
                취준생·이직자에게 꼭 필요한 네 개의 분석.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {services.map((s, i) => (
                  <div key={s.number} className={`fade-in-up delay-${i + 1}`} style={{ padding: '24px 22px', borderRadius: 14, background: 'rgba(13, 27, 61, 0.72)', border: '1px solid rgba(244, 236, 216, 0.1)', minHeight: 170, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontStyle: 'italic', fontSize: 22, color: 'var(--moon-glow)' }}>{s.number}</div>
                    <div className="headline" style={{ fontSize: 19, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(244,236,216,0.65)', flex: 1 }}>{s.sub}</div>
                    <div style={{ fontStyle: 'italic', fontSize: 12, color: 'rgba(165,180,252,0.7)' }}>{s.en}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={(el) => { pageRefs.current[4] = el; }} className={`page ${pageIndex === 4 ? 'active' : ''}`}>
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
              <button className="fade-in-up delay-3 mt-10 rounded-full bg-star-500 px-8 py-3 text-sm font-semibold text-night-950 transition hover:bg-star-400" onClick={() => setStage('select')}>
                내 별자리 보러 가기 →
              </button>
            </div>
          </div>
        </section>
      )}

      {stage === 'select' && (
        <section className="page-enter relative z-20 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-col justify-center px-4 py-12">
          <div className="mb-10 text-center">
            <p className="animate-fade-in mb-3 text-xs tracking-[0.2em] text-star-300">STEP 02 · 서비스 선택</p>
            <h2 className="animate-fade-in delay-1 text-3xl font-bold text-star-100 md:text-5xl">
              어떤 별자리부터{'\n'}보여드릴까요?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {services.map((s, i) => (
              <Link
                key={s.href}
                href={s.href}
                className={`landing-service-card animate-fade-in delay-${Math.min(i + 1, 4)}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs italic tracking-widest text-star-300/90">{s.en}</span>
                  <span className="text-2xl italic text-star-400/75">{s.number}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-star-100">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-300/85">{s.sub}</p>
                <p className="mt-6 text-xs tracking-[0.14em] text-star-300">START ANALYSIS →</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setStage('landing');
                setPageIndex(0);
              }}
              className="text-sm text-gray-300 transition hover:text-star-300"
            >
              ← 처음으로
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function LandingStars() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <span className="landing-star gold" style={{ left: '10%', top: '15%', animationDelay: '0s' }} />
      <span className="landing-star" style={{ left: '22%', top: '30%', animationDelay: '.5s' }} />
      <span className="landing-star blue" style={{ left: '35%', top: '12%', animationDelay: '.9s' }} />
      <span className="landing-star" style={{ left: '50%', top: '20%', animationDelay: '1.2s' }} />
      <span className="landing-star gold" style={{ left: '64%', top: '10%', animationDelay: '1.6s' }} />
      <span className="landing-star blue" style={{ left: '72%', top: '26%', animationDelay: '2s' }} />
      <span className="landing-star" style={{ left: '84%', top: '16%', animationDelay: '2.4s' }} />
      <span className="landing-star" style={{ left: '14%', top: '58%', animationDelay: '2.8s' }} />
      <span className="landing-star gold" style={{ left: '28%', top: '72%', animationDelay: '3.1s' }} />
      <span className="landing-star blue" style={{ left: '44%', top: '65%', animationDelay: '3.6s' }} />
      <span className="landing-star" style={{ left: '58%', top: '76%', animationDelay: '4s' }} />
      <span className="landing-star gold" style={{ left: '78%', top: '62%', animationDelay: '4.3s' }} />
    </div>
  );
}
