/* global React */
const { useState } = React;

/* ============== Service selection (4 APIs) ============== */

window.ServiceSelect = function ServiceSelect({ onSelect, birthDate, birthTime }) {
  const services = [
    {
      id: 'timing',
      num: '01',
      name: '관운 분석',
      en: 'Career Timing',
      desc: '상반기 vs 하반기 — 별이 가리키는 채용 시즌을 알려드려요.',
      time: '약 3-5초',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      )
    },
    {
      id: 'consultation',
      num: '02',
      name: 'AI 커리어 컨설팅',
      en: 'Consultation',
      desc: '사주와 AI가 함께 그리는 19개 항목의 커리어 지도.',
      time: '약 15-20초',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.3L12 16.7l-6.2 4.5 2.4-7.3L2 9.4h7.6z"/>
        </svg>
      )
    },
    {
      id: 'compatibility',
      num: '03',
      name: '기업 궁합 분석',
      en: 'Compatibility',
      desc: '저 회사, 저 직무 — 정말 나와 맞는지 별의 균형으로 풀어드려요.',
      time: '약 5-8초',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="12" r="5"/>
          <circle cx="16" cy="12" r="5"/>
        </svg>
      )
    },
    {
      id: 'feedback',
      num: '04',
      name: '만족도 피드백',
      en: 'Feedback',
      desc: '결과가 마음에 드셨는지 알려주세요. 별을 더 정교하게 다듬을게요.',
      time: '약 1-2초',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    }
  ];

  function handleMouse(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  }

  return (
    <div style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div className="label fade-in-up" style={{ marginBottom: 12 }}>STEP 02 · 서비스 선택</div>
        <h2 className="headline headline-lg fade-in-up delay-1" style={{ marginBottom: 10 }}>
          어떤 별자리부터<br/>
          <em>보여드릴까요?</em>
        </h2>
        <p className="body-text fade-in-up delay-2" style={{ color: 'rgba(244,236,216,0.6)', fontSize: 14 }}>
          {birthDate && birthTime && (
            <>
              <span style={{ color: 'var(--moon-glow)' }}>{birthDate}</span> · <span style={{ color: 'var(--moon-glow)' }}>{birthTime}</span> 로 분석합니다
            </>
          )}
        </p>
      </div>
      <div className="service-grid">
        {services.map((s, i) => (
          <div
            key={s.id}
            className={`service-card fade-in-up delay-${i+1}`}
            onMouseMove={handleMouse}
            onClick={() => onSelect(s.id)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <span className="service-icon">{s.icon}</span>
                <span style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 28, color: 'rgba(252,211,77,0.5)' }}>{s.num}</span>
              </div>
              <span className="service-en">{s.en}</span>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'rgba(244,236,216,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.time}</span>
              <span className="arrow-go">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { ServiceSelect: window.ServiceSelect });
