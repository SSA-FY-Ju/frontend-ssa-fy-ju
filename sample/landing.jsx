/* global React */
const { useState, useEffect, useRef } = React;

/* ============== Landing pages (5 page-flip stories) ============== */

window.LandingPages = function LandingPages({ pageIndex, totalPages }) {
  return (
    <>
      <Page1 active={pageIndex === 0} />
      <Page2 active={pageIndex === 1} />
      <Page3 active={pageIndex === 2} />
      <Page4 active={pageIndex === 3} />
      <Page5 active={pageIndex === 4} onStart={() => window.__navigateTo('input')} />
    </>
  );
};

function Page1({ active }) {
  return (
    <div className={`page ${active ? 'active' : ''}`}>
      <div style={{ textAlign: 'center', maxWidth: 900 }}>
        <div className="label fade-in-up" style={{ marginBottom: 24 }}>SSAju · 별이 빛나는 밤, 당신의 길을 묻다</div>
        <h1 className="headline headline-xl fade-in-up delay-1" style={{ marginBottom: 28 }}>
          취업 고민,<br/>
          <em>많으시죠?</em>
        </h1>
        <p className="body-text fade-in-up delay-2" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto', color: 'rgba(244,236,216,0.75)' }}>
          이력서를 다섯 번째 고치고,<br/>
          밤하늘을 올려다본 적 있으신가요.
        </p>
        <div className="scroll-hint">
          <span>다음 페이지</span>
          <div className="arrow"></div>
        </div>
      </div>
    </div>
  );
}

function Page2({ active }) {
  const worries = [
    { t: '“언제 지원하면 될까요?”', s: '상반기? 하반기?' },
    { t: '“저는 어떤 직무가 맞을까요?”', s: '자기소개서 앞에서 멈춰버린 마음' },
    { t: '“이 회사, 정말 저랑 맞나요?”', s: '면접 합격 후에도 드는 의문' },
    { t: '“나는 무엇으로 어필해야 하죠?”', s: '강점 한 줄이 떠오르지 않는 밤' }
  ];
  return (
    <div className={`page ${active ? 'active' : ''}`}>
      <div style={{ width: '100%', maxWidth: 880 }}>
        <h2 className="headline headline-lg fade-in-up" style={{ textAlign: 'center', marginBottom: 8 }}>
          누구나 한 번쯤<br/>
          <em>물어봤던 질문들</em>
        </h2>
        <p className="body-text fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(244,236,216,0.65)' }}>
          취준생 10명 중 9명이 같은 고민을 합니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {worries.map((w, i) => (
            <div key={i} className={`fade-in-up delay-${i+1}`} style={{
              padding: '24px 26px',
              borderRadius: 16,
              background: 'rgba(13, 27, 61, 0.45)',
              border: '1px solid rgba(244, 236, 216, 0.12)',
              backdropFilter: 'blur(8px)'
            }}>
              <div className="headline" style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}>{w.t}</div>
              <div style={{ fontSize: 13, color: 'rgba(244,236,216,0.55)', fontFamily: 'var(--sans)' }}>{w.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Page3({ active }) {
  return (
    <div className={`page ${active ? 'active' : ''}`}>
      <div style={{ textAlign: 'center', maxWidth: 820 }}>
        <div className="label fade-in-up" style={{ marginBottom: 28 }}>저희의 약속</div>
        <h2 className="headline headline-lg fade-in-up delay-1" style={{ marginBottom: 36 }}>
          저희가<br/>
          <em>풀어드릴게요.</em>
        </h2>
        <p className="body-text fade-in-up delay-2" style={{ fontSize: 19, lineHeight: 1.8, color: 'rgba(244,236,216,0.85)' }}>
          천 년 동안 별을 읽어온 사주 명리학과<br/>
          오늘의 AI가 당신의 커리어 지도를 함께 그립니다.
        </p>
        <p className="fade-in-up delay-3" style={{ marginTop: 36, fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 16, color: 'var(--moon-glow)' }}>
          “별을 보지 않고 길을 떠나지 마세요.”
        </p>
      </div>
    </div>
  );
}

function Page4({ active }) {
  const services = [
    { num: '01', t: '관운 분석', s: '상반기·하반기, 언제가 좋을까?', d: 'Career Timing' },
    { num: '02', t: 'AI 커리어 컨설팅', s: '19개 항목으로 풀어내는 나만의 지도', d: 'Consultation' },
    { num: '03', t: '기업 궁합 분석', s: '저 회사, 정말 나랑 맞을까?', d: 'Compatibility' },
    { num: '04', t: '만족도 피드백', s: '결과를 더 정교하게 다듬어요', d: 'Feedback' }
  ];
  return (
    <div className={`page ${active ? 'active' : ''}`}>
      <div style={{ width: '100%', maxWidth: 920 }}>
        <h2 className="headline headline-lg fade-in-up" style={{ textAlign: 'center', marginBottom: 12 }}>
          네 가지 별자리,<br/>
          <em>네 가지 답</em>
        </h2>
        <p className="body-text fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 44, color: 'rgba(244,236,216,0.65)' }}>
          취준생·이직자에게 꼭 필요한 네 개의 분석.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {services.map((s, i) => (
            <div key={i} className={`fade-in-up delay-${i+1}`} style={{
              padding: '24px 22px',
              borderRadius: 14,
              background: 'rgba(13, 27, 61, 0.4)',
              border: '1px solid rgba(244, 236, 216, 0.1)',
              backdropFilter: 'blur(8px)',
              minHeight: 170,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 22, color: 'var(--moon-glow)' }}>{s.num}</div>
              <div className="headline" style={{ fontSize: 19, fontWeight: 600 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: 'rgba(244,236,216,0.65)', flex: 1 }}>{s.s}</div>
              <div style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 12, color: 'rgba(165,180,252,0.7)' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Page5({ active, onStart }) {
  return (
    <div className={`page ${active ? 'active' : ''}`}>
      <div style={{ textAlign: 'center', maxWidth: 720 }}>
        <div className="label fade-in-up" style={{ marginBottom: 24 }}>이제, 시작합니다</div>
        <h2 className="headline headline-xl fade-in-up delay-1" style={{ marginBottom: 28 }}>
          당신의 별,<br/>
          <em>읽어드릴게요.</em>
        </h2>
        <p className="body-text fade-in-up delay-2" style={{ fontSize: 17, marginBottom: 48, color: 'rgba(244,236,216,0.75)' }}>
          생년월일과 태어난 시간만 알려주세요.<br/>
          나머지는 별이 말해줄 거예요.
        </p>
        <button className="btn btn-primary fade-in-up delay-3" onClick={onStart} style={{ fontSize: 16, padding: '16px 36px' }}>
          내 별자리 보러 가기 →
        </button>
        <p className="fade-in-up delay-4" style={{ marginTop: 20, fontSize: 12, color: 'rgba(244,236,216,0.4)', letterSpacing: '0.1em' }}>
          평균 소요 시간 약 3분 · 입력값은 저장되지 않아요
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPages: window.LandingPages });
