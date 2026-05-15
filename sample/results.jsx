/* global React */
const { useState, useEffect, useRef } = React;

/* ============== Generic helpers ============== */

function ScoreRing({ value, label, size = 180 }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`ring-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc"/>
            <stop offset="100%" stopColor="#fcd34d"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(244,236,216,0.1)" strokeWidth="6"/>
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={`url(#ring-${size})`} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="score-ring-value">
        {value}
        <small>{label || '/ 100'}</small>
      </div>
    </div>
  );
}

const MONTH_NAME_TO_NUM = {
  january:1, february:2, march:3, april:4, may:5, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12,
  jan:1, feb:2, mar:3, apr:4, jun:6, jul:7, aug:8, sep:9, sept:9, oct:10, nov:11, dec:12
};
function monthToNum(m) {
  if (m == null) return null;
  if (typeof m === 'number') return m;
  const s = String(m).trim().toLowerCase();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const ko = s.match(/^(\d{1,2})월$/);
  if (ko) return parseInt(ko[1], 10);
  return MONTH_NAME_TO_NUM[s] ?? null;
}
function normalizeMonths(months) {
  if (!months) return [];
  if (Array.isArray(months)) {
    return months.map(m => ({
      month: monthToNum(m.month),
      type: m.type,
      score: m.score,
      advice: m.advice || m.description
    })).filter(m => m.month);
  }
  // Object form: {"January": {type, description}, ...}
  return Object.entries(months).map(([k, v]) => ({
    month: monthToNum(k),
    type: v.type,
    score: v.score,
    advice: v.advice || v.description
  })).filter(m => m.month);
}
function classifyType(type) {
  if (!type) return 'normal';
  const s = String(type).toLowerCase();
  if (s === 'lucky' || /적극|기회|성장|좋음|행운/.test(type)) return 'lucky';
  if (s === 'caution' || /주의|위험|조심/.test(type)) return 'caution';
  return 'normal';
}
function MonthGrid({ months }) {
  const arr = normalizeMonths(months);
  const map = {};
  arr.forEach(m => { map[m.month] = m; });
  const KOREAN_MONTH = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  return (
    <div className="month-grid">
      {Array.from({ length: 12 }).map((_, i) => {
        const m = map[i + 1];
        const cls = m ? classifyType(m.type) : 'caution';
        return (
          <div key={i} className={`month-cell ${cls}`}>
            {KOREAN_MONTH[i]}
            {m && (
              <div className="month-tooltip">
                {m.month}월{m.score != null ? ` · ${m.score}점` : ''}{m.type ? ` · ${m.type}` : ''} — {m.advice || ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div style={{ padding: 14, background: 'rgba(244,236,216,0.04)', borderRadius: 10, border: '1px solid rgba(244,236,216,0.08)' }}>
      <div style={{ fontSize: 11, color: 'rgba(244,236,216,0.55)', marginBottom: 6, letterSpacing: '0.05em' }}>{k}</div>
      <div style={{ fontSize: 14, color: 'var(--paint-cream)', lineHeight: 1.5 }}>{v}</div>
    </div>
  );
}

/* ============== 01 Career Timing Result ============== */
window.TimingResult = function TimingResult({ data, onFeedback }) {
  const d = data || window.MOCK.timing;
  return (
    <div className="result-stage fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span className="label">관운 분석 결과 · CAREER TIMING</span>
        <h1 className="headline headline-md" style={{ marginTop: 12 }}>당신의 채용 운, <em>이 시기에 빛납니다</em></h1>
      </div>

      <div className="result-card" style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ScoreRing value={d.confidenceScore} label="신뢰도 / 100"/>
        <div style={{ flex: 1, minWidth: 240 }}>
          <span className="label-en">FAVORED PERIOD</span>
          <div className="period-pill" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>{d.favoredPeriod === 'H1' ? '🌅' : '🌙'}</span>
            {d.favoredPeriod === 'H1' ? '상반기 (1-6월)' : '하반기 (7-12월)'} 추천
          </div>
          <p className="body-text" style={{ fontSize: 15 }}>{d.reasoning}</p>
        </div>
      </div>

      <div className="result-card">
        <span className="label-en">WHAT THIS MEANS</span>
        <h3>이 결과를 어떻게 활용하나요?</h3>
        <ul className="bullet">
          <li>{d.favoredPeriod === 'H1' ? '상반기' : '하반기'} 공채 일정에 더 많은 비중을 두고 지원 전략을 짜보세요.</li>
          <li>면접 일정을 잡을 때 추천 시기에 가까운 날짜를 우선해보세요.</li>
          <li>비추천 시기에는 자기소개서 다듬기와 역량 정비에 집중하세요.</li>
        </ul>
      </div>

      <FeedbackBlock onFeedback={onFeedback} type="CAREER_TIMING" />
    </div>
  );
};

/* ============== 02 Consultation Result — Page-flip with ALL 19 fields ============== */
window.ConsultationResult = function ConsultationResult({ data, onFeedback }) {
  const d = data || window.MOCK.consultation;
  const [page, setPage] = useState(0);

  const pages = [
    { id: 'overview', title: '오늘의 별, 한눈에 보기', em: '오늘의 별', label: '00 OVERVIEW' },
    { id: 'industries', title: '추천 산업과 직무', em: '추천 산업', label: '01 INDUSTRIES' },
    { id: 'strengths', title: '당신이 가진 강점', em: '당신의 강점', label: '02 STRENGTHS' },
    { id: 'interview', title: '면접에서 빛나는 법', em: '면접에서', label: '03 INTERVIEW TIPS' },
    { id: 'cautions', title: '주의해야 할 별의 흐름', em: '주의 사항', label: '04 CAUTIONS' },
    { id: 'profile', title: '당신의 사주 프로필', em: '사주 프로필', label: '05 SAJU PROFILE' },
    { id: 'powerKeywords', title: '무기가 될 키워드', em: '파워 키워드', label: '06 POWER KEYWORDS' },
    { id: 'branding', title: '나만의 브랜딩 가이드', em: '퍼스널 브랜딩', label: '07 PERSONAL BRANDING' },
    { id: 'wealth', title: '재물·재정의 별빛', em: '재물 스타일', label: '08 WEALTH STYLE' },
    { id: 'roadmap', title: '커리어 항해도', em: '장기 로드맵', label: '09 LONG-TERM ROADMAP' },
    { id: 'workStyle', title: '나의 일하는 방식', em: '일 스타일', label: '10 WORK STYLE' },
    { id: 'environment', title: '맞는 직장 환경', em: '환경 적합성', label: '11 ENVIRONMENT FIT' },
    { id: 'relationship', title: '인간관계 전략', em: '관계 전략', label: '12 RELATIONSHIP STRATEGY' },
    { id: 'mental', title: '마음의 별을 지키는 법', em: '멘탈 케어', label: '13 MENTAL CARE' },
    { id: 'timeline', title: '월별 별의 흐름', em: '커리어 타임라인', label: '14 CAREER TIMELINE' },
    { id: 'final', title: '별이 보낸 마지막 메시지', em: '마지막 별빛', label: '15 FINAL' }
  ];

  const total = pages.length;
  const cur = pages[page];

  return (
    <div className="consult-stage fade-in-up">
      <div className="consult-page-title" style={{ paddingTop: '2vh' }}>
        <span className="label">{cur.label} · {String(page + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <h2>
          {cur.title.replace(cur.em, '')}<em>{cur.em}</em>
        </h2>
      </div>

      <div className="consult-pages" style={{ marginTop: 16 }}>
        {pages.map((p, i) => (
          <div key={p.id} className={`consult-page ${page === i ? 'active' : ''}`}>
            {p.id === 'overview' && <PageOverview d={d}/>}
            {p.id === 'industries' && <PageIndustries d={d}/>}
            {p.id === 'strengths' && <PageStrengths d={d}/>}
            {p.id === 'interview' && <PageInterview d={d}/>}
            {p.id === 'cautions' && <PageCautions d={d}/>}
            {p.id === 'profile' && <PageProfile d={d}/>}
            {p.id === 'powerKeywords' && <PagePowerKeywords d={d}/>}
            {p.id === 'branding' && <PageBranding d={d}/>}
            {p.id === 'wealth' && <PageWealth d={d}/>}
            {p.id === 'roadmap' && <PageRoadmap d={d}/>}
            {p.id === 'workStyle' && <PageWorkStyle d={d}/>}
            {p.id === 'environment' && <PageEnvironment d={d}/>}
            {p.id === 'relationship' && <PageRelationship d={d}/>}
            {p.id === 'mental' && <PageMental d={d}/>}
            {p.id === 'timeline' && <PageTimeline d={d}/>}
            {p.id === 'final' && <PageFinal d={d} onFeedback={onFeedback}/>}
          </div>
        ))}
      </div>

      <div className="consult-nav">
        <button className="consult-nav-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          이전
        </button>
        <div className="consult-progress">
          {pages.map((_, i) => (
            <button
              key={i}
              className={`consult-dot ${page === i ? 'active' : (page > i ? 'done' : '')}`}
              onClick={() => setPage(i)}
              aria-label={`페이지 ${i + 1}`}
            />
          ))}
        </div>
        <button
          className={`consult-nav-btn ${page < total - 1 ? 'primary' : ''}`}
          disabled={page === total - 1}
          onClick={() => setPage(p => Math.min(total - 1, p + 1))}
        >
          다음
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ===== Each consultation page ===== */

function PageOverview({ d }) {
  return (
    <>
      <div className="result-card" style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <ScoreRing value={d.confidenceScore} label="신뢰도"/>
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="label-en">FAVORED PERIOD</span>
          <div className="period-pill" style={{ marginBottom: 12 }}>
            {d.favoredPeriod === 'H1' ? '🌅 상반기 추천' : '🌙 하반기 추천'}
          </div>
          <p className="body-text" style={{ fontSize: 14 }}>{d.reasoning}</p>
        </div>
      </div>
      {d.analysisSummary && (
        <div className="result-card" style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.08), rgba(165,180,252,0.04))', borderColor: 'rgba(252,211,77,0.25)' }}>
          <span className="label-en">ANALYSIS SUMMARY · 한 줄 요약</span>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--paint-cream)', lineHeight: 1.6, marginTop: 12 }}>{d.analysisSummary}</p>
        </div>
      )}
      <div className="result-card">
        <span className="label-en">YOUR JOURNEY · 16개의 별 페이지</span>
        <h3>이 컨설팅에 담긴 내용</h3>
        <p style={{ fontSize: 14, color: 'rgba(244,236,216,0.7)', marginTop: 8, lineHeight: 1.7 }}>
          추천 산업·직무 → 강점 → 면접 팁 → 주의 사항 → 사주 프로필(일주·오행·십신) → 파워 키워드 → 퍼스널 브랜딩 → 재물 스타일 → 장기 로드맵 → 일 스타일 → 환경 적합성 → 관계 전략 → 멘탈 케어 → 월별 타임라인까지, 별이 풀어내는 16장의 이야기예요.
        </p>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--moon-glow)', fontFamily: 'var(--serif-en)', fontStyle: 'italic' }}>
          {d.openaiModelVersion ? `Powered by ${d.openaiModelVersion}` : ''}
        </p>
      </div>
    </>
  );
}

function PageIndustries({ d }) {
  return (
    <div className="result-card">
      <span className="label-en">RECOMMENDED INDUSTRIES & ROLES</span>
      <h3>당신의 별이 가리키는 길</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 16 }}>
        {d.industries.map((ind, i) => (
          <div key={i} style={{ padding: 20, background: 'rgba(244,236,216,0.04)', borderRadius: 14, border: '1px solid rgba(244,236,216,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className="headline" style={{ fontSize: 19, fontWeight: 600 }}>{ind.name}</span>
              <span style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 14, color: 'rgba(252,211,77,0.5)' }}>0{i + 1}</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.7)', marginBottom: 14, lineHeight: 1.6 }}>{ind.reason}</p>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(244,236,216,0.5)', marginBottom: 8, letterSpacing: '0.05em' }}>RECOMMENDED ROLES</div>
              {ind.recommendedRoles.map(r => <span key={r} className="tag">{r}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageStrengths({ d }) {
  return (
    <div className="result-card">
      <span className="label-en">YOUR STRENGTHS</span>
      <h3>당신이 가진 별빛</h3>
      <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.6)', marginTop: 6 }}>
        면접·자기소개서에서 자신 있게 내세울 수 있는 강점들이에요.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
        {d.strengths.map((s, i) => (
          <div key={i} style={{
            padding: '16px 22px', borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(165,180,252,0.1))',
            border: '1px solid rgba(252,211,77,0.3)',
            fontSize: 15, fontFamily: 'var(--serif)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ color: 'var(--moon-glow)' }}>✦</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageInterview({ d }) {
  return (
    <div className="result-card">
      <span className="label-en">INTERVIEW TIPS</span>
      <h3>면접관의 마음을 여는 별빛</h3>
      <div style={{ marginTop: 18 }}>
        {d.interviewTips.map((t, i) => (
          <div key={i} style={{
            display: 'flex', gap: 16, padding: '16px 0',
            borderBottom: i < d.interviewTips.length - 1 ? '1px solid rgba(244,236,216,0.08)' : 'none'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif-en)', fontStyle: 'italic', color: 'var(--moon-glow)',
              flexShrink: 0
            }}>{i + 1}</div>
            <p style={{ flex: 1, fontSize: 15, lineHeight: 1.6, paddingTop: 7 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageCautions({ d }) {
  return (
    <div className="result-card" style={{ background: 'rgba(252, 100, 100, 0.04)', borderColor: 'rgba(252, 100, 100, 0.2)' }}>
      <span className="label-en" style={{ color: '#fca5a5' }}>CAUTIONS</span>
      <h3>주의해야 할 별의 흐름</h3>
      <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.65)', marginTop: 6 }}>
        피하면 더 멀리 갈 수 있는 흐름들이에요.
      </p>
      <ul className="bullet" style={{ marginTop: 18 }}>
        {d.cautions.map((c, i) => <li key={i} style={{ fontSize: 15 }}>{c}</li>)}
      </ul>
    </div>
  );
}

function PageProfile({ d }) {
  const sp = d.sajuProfile;
  return (
    <>
      <div className="result-card" style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: 130, height: 130, borderRadius: '50%',
          background: 'radial-gradient(circle, #fcd34d 0%, #16306b 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 50px rgba(252,211,77,0.4)',
          flexShrink: 0
        }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 60, color: 'var(--night-deep)', fontWeight: 700 }}>{sp.dayMaster}</span>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="label-en">DAY MASTER · 일주(日柱)</span>
          <h3 style={{ marginBottom: 8 }}>{sp.dayMaster} — 당신의 본질</h3>
          <p className="body-text" style={{ fontSize: 14 }}>{sp.dayMasterDescription}</p>
        </div>
      </div>

      <div className="result-card">
        <span className="label-en">FIVE ELEMENTS · 오행 분포</span>
        <h3>당신의 오행 균형</h3>
        <div className="five-elements-row">
          {Object.entries(sp.fiveElements).map(([k, v]) => (
            <div key={k} className="element-pill" data-el={k}>
              <span className="ch">{k}</span>
              <span className="num">{v}</span>
            </div>
          ))}
        </div>
        <p className="body-text" style={{ marginTop: 16, fontSize: 14 }}>{sp.fiveElementsAnalysis}</p>
      </div>

      <div className="result-card">
        <span className="label-en">TEN GODS · 십신 분포</span>
        <h3>당신의 별자리 별 기운</h3>
        <div style={{ marginTop: 12 }}>
          {Object.entries(sp.tenGodDistribution).map(([k, v]) => {
            const max = Math.max(...Object.values(sp.tenGodDistribution));
            const pct = (v / max) * 100;
            return (
              <div key={k} className="bar-row">
                <div className="bar-label" style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{k}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }}/></div>
                <div className="bar-val">{v}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(244,236,216,0.6)' }}>핵심 기운: </span>
          {sp.keyTenGods.map(k => <span key={k} className="tag" style={{ fontFamily: 'var(--serif)', fontSize: 13 }}>{k}</span>)}
        </div>
      </div>
    </>
  );
}

function PagePowerKeywords({ d }) {
  return (
    <>
      <div className="result-card">
        <span className="label-en">POWER KEYWORDS</span>
        <h3>자기소개서·면접에서 쓸 키워드</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 14 }}>
          {d.powerKeywords.keywords.map((k, i) => (
            <div key={i} style={{ padding: 20, background: 'rgba(244,236,216,0.04)', borderRadius: 14, border: '1px solid rgba(244,236,216,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="headline" style={{ fontSize: 19, fontWeight: 600 }}>{k.keyword}</span>
                <span className="tag" style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{k.element}</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.75)', marginBottom: 12, lineHeight: 1.5 }}>{k.description}</p>
              <div style={{ padding: 12, background: 'rgba(252,211,77,0.06)', borderRadius: 10, border: '1px solid rgba(252,211,77,0.18)', marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--moon-glow)', letterSpacing: '0.1em', marginBottom: 4 }}>USAGE EXAMPLE</div>
                <p style={{ fontSize: 13, color: 'var(--paint-cream)', fontStyle: 'italic', lineHeight: 1.5 }}>{k.usageExample}</p>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(244,236,216,0.55)' }}>
                <span style={{ color: 'rgba(165,180,252,0.8)' }}>📍 활용 컨텍스트:</span> {k.context}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="result-card">
        <span className="label-en">SELECTION GUIDE</span>
        <h3>키워드, 어떻게 고르고 활용할까?</h3>
        <p style={{ fontSize: 14, color: 'var(--moon-glow)', marginTop: 10, fontStyle: 'italic' }}>💡 {d.powerKeywords.selectionGuide}</p>
        <div style={{ marginTop: 16 }}>
          <span className="label-en">활용 팁</span>
          <ul className="bullet" style={{ marginTop: 8 }}>{d.powerKeywords.usageTips.map((t, i) => <li key={i} style={{ fontSize: 14 }}>{t}</li>)}</ul>
        </div>
        <div style={{ marginTop: 18, padding: 14, background: 'rgba(252, 100, 100, 0.06)', borderRadius: 10, border: '1px solid rgba(252, 100, 100, 0.2)' }}>
          <span className="label-en" style={{ color: '#fca5a5', marginBottom: 6 }}>⚠ 피해야 할 점</span>
          <p style={{ fontSize: 14, color: 'rgba(244,236,216,0.85)' }}>{d.powerKeywords.avoidanceTip}</p>
        </div>
      </div>
    </>
  );
}

function PageBranding({ d }) {
  const b = d.personalBranding;
  return (
    <>
      <div className="result-card">
        <span className="label-en">PERSONAL BRANDING</span>
        <h3>당신의 첫인상을 디자인하기</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 16 }}>
          <KV k="추천 정장 색" v={b.suitColor}/>
          <KV k="첫인상" v={b.impression}/>
          <KV k="헤어·메이크업" v={b.hairAndMakeup}/>
          <KV k="브랜딩 키워드" v={b.brandingKeyword}/>
        </div>
      </div>

      <div className="result-card" style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.1), rgba(165,180,252,0.05))', borderColor: 'rgba(252,211,77,0.3)' }}>
        <span className="label-en">RESUME TAGLINE · 이력서용 한 줄</span>
        <h3>당신의 슬로건</h3>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--moon-glow)', fontStyle: 'italic', marginTop: 14, lineHeight: 1.5 }}>{b.taglineForResume}</p>
      </div>
    </>
  );
}

function PageWealth({ d }) {
  const w = d.wealthStyle;
  return (
    <div className="result-card">
      <span className="label-en">WEALTH STYLE</span>
      <h3>재물·재정의 별빛</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
        <KV k="수입원 (Income Source)" v={w.incomeSource}/>
        <KV k="재정 조언 (Financial Advice)" v={w.financialAdvice}/>
        <KV k="투자 성향 (Investment Tendency)" v={w.investmentTendency}/>
        <KV k="추가 수입 가능성 (Additional Income)" v={w.additionalIncome}/>
      </div>
    </div>
  );
}

function PageRoadmap({ d }) {
  const r = d.longTermRoadmap;
  return (
    <div className="result-card">
      <span className="label-en">LONG-TERM ROADMAP</span>
      <h3>당신의 커리어 항해도</h3>
      <div style={{ position: 'relative', padding: '24px 0', marginTop: 12 }}>
        <div style={{ position: 'absolute', left: 14, top: 24, bottom: 24, width: 2, background: 'linear-gradient(to bottom, var(--star-blue), var(--moon-glow))', opacity: 0.4 }}/>

        <div style={{ position: 'relative', paddingLeft: 44, marginBottom: 28 }}>
          <div style={{ position: 'absolute', left: 6, top: 6, width: 18, height: 18, borderRadius: '50%', background: 'var(--star-blue)', boxShadow: '0 0 12px var(--star-blue)', border: '2px solid var(--night-deep)' }}/>
          <div className="label-en" style={{ marginBottom: 4 }}>0-2 YEARS</div>
          <div className="headline" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{r.phase0to2years.goal}</div>
          <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.75)', marginBottom: 4 }}><strong style={{ color: 'var(--moon-glow)' }}>Focus.</strong> {r.phase0to2years.focus}</p>
          <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.75)' }}><strong style={{ color: 'var(--moon-glow)' }}>Action.</strong> {r.phase0to2years.action}</p>
        </div>

        <div style={{ position: 'relative', paddingLeft: 44, marginBottom: 28 }}>
          <div style={{ position: 'absolute', left: 6, top: 6, width: 18, height: 18, borderRadius: '50%', background: 'var(--star-blue)', boxShadow: '0 0 12px var(--star-blue)', border: '2px solid var(--night-deep)' }}/>
          <div className="label-en" style={{ marginBottom: 4 }}>3-5 YEARS</div>
          <div className="headline" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{r.phase3to5years.goal}</div>
          <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.75)', marginBottom: 4 }}><strong style={{ color: 'var(--moon-glow)' }}>Focus.</strong> {r.phase3to5years.focus}</p>
          <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.75)' }}><strong style={{ color: 'var(--moon-glow)' }}>Action.</strong> {r.phase3to5years.action}</p>
        </div>

        <div style={{ position: 'relative', paddingLeft: 44 }}>
          <div style={{ position: 'absolute', left: 4, top: 6, width: 22, height: 22, borderRadius: '50%', background: 'var(--moon)', boxShadow: '0 0 24px var(--moon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--night-deep)', fontSize: 11 }}>★</span>
          </div>
          <div className="label-en" style={{ marginBottom: 4 }}>ULTIMATE GOAL · 최종 목표</div>
          <div className="headline" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: 'var(--moon-glow)' }}>{r.ultimateGoal}</div>
          <p className="body-text" style={{ fontSize: 14 }}>{r.goalDescription}</p>
        </div>
      </div>
    </div>
  );
}

function PageWorkStyle({ d }) {
  const w = d.workStyle;
  return (
    <div className="result-card">
      <span className="label-en">WORK STYLE</span>
      <h3>당신이 일하는 방식</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
        <KV k="선호 회사 유형 (Preferred Company)" v={w.preferredCompanyType}/>
        <KV k="리더십 스타일 (Leadership)" v={w.leadershipType}/>
        <KV k="의사결정 (Decision Making)" v={w.decisionMaking}/>
        <KV k="갈등 해결 (Conflict Resolution)" v={w.conflictResolution}/>
      </div>
    </div>
  );
}

function PageEnvironment({ d }) {
  const e = d.environmentFit;
  return (
    <div className="result-card">
      <span className="label-en">ENVIRONMENT FIT</span>
      <h3>당신과 맞는 직장 환경</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 16 }}>
        <KV k="업무 분위기 (Work Vibe)" v={e.workVibe}/>
        <KV k="회사 규모 (Company Size)" v={e.companySize}/>
        <KV k="동료 유형 (Colleague Type)" v={e.colleagueType}/>
        <KV k="갈등 접근 (Conflict Approach)" v={e.conflictApproach}/>
        <KV k="물리적 환경 (Physical Env)" v={e.physicalEnv}/>
        <KV k="문화적 적합성 (Cultural Fit)" v={e.culturalFit}/>
      </div>
    </div>
  );
}

function PageRelationship({ d }) {
  const r = d.relationshipStrategy;
  return (
    <div className="result-card">
      <span className="label-en">RELATIONSHIP STRATEGY</span>
      <h3>인간관계의 별자리</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
        <KV k="사교 스타일 (Social Style)" v={r.socialStyle}/>
        <KV k="네트워킹 (Networking)" v={r.networkingApproach}/>
        <KV k="팀 내 위치 (Team Position)" v={r.teamPosition}/>
        <KV k="갈등 해결 (Conflict Resolution)" v={r.conflictResolution}/>
        <KV k="커리어 네트워킹 (Career Networking)" v={r.careerNetworking}/>
      </div>
    </div>
  );
}

function PageMental({ d }) {
  const m = d.mentalCare;
  return (
    <>
      <div className="result-card" style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.1), rgba(165,180,252,0.05))', borderColor: 'rgba(252,211,77,0.3)' }}>
        <span className="label-en">MINDSET MANTRA · 당신의 만트라</span>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--moon-glow)', fontStyle: 'italic', lineHeight: 1.5, marginTop: 14 }}>{m.mindsetMantra}</p>
      </div>

      <div className="result-card">
        <span className="label-en">STRESS VULNERABILITY · 스트레스 취약점</span>
        <h3>조심해야 할 마음의 결</h3>
        <ul className="bullet" style={{ marginTop: 10 }}>{m.stressVulnerability.map((s, i) => <li key={i} style={{ fontSize: 14 }}>{s}</li>)}</ul>
      </div>

      <div className="result-card">
        <span className="label-en">RECHARGE METHOD · 충전 방법</span>
        <h3>마음의 별을 다시 켜는 법</h3>
        <ul className="bullet" style={{ marginTop: 10 }}>{m.rechargeMethod.map((s, i) => <li key={i} style={{ fontSize: 14 }}>{s}</li>)}</ul>
      </div>

      <div className="result-card" style={{ background: 'rgba(165,180,252,0.06)', borderColor: 'rgba(165,180,252,0.25)' }}>
        <span className="label-en" style={{ color: 'var(--star-blue)' }}>EMERGENCY TACTIC · 긴급 처방</span>
        <h3>위기의 순간엔</h3>
        <p style={{ fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>{m.emergencyTactic}</p>
      </div>
    </>
  );
}

function PageTimeline({ d }) {
  const t = d.careerTimeline || {};
  const monthArr = normalizeMonths(t.months);
  const pivots = (t.pivotPoints || []).map(p => ({
    month: monthToNum(p.month),
    description: p.description,
    type: p.type,
    score: p.score
  })).filter(p => p.month);
  const warnings = (t.warningMonths || []).map(w => {
    if (typeof w === 'string' || typeof w === 'number') {
      return { month: monthToNum(w), description: '' };
    }
    return { month: monthToNum(w.month), description: w.description || '' };
  }).filter(w => w.month);

  return (
    <>
      <div className="result-card">
        <span className="label-en">CAREER TIMELINE · {t.year}</span>
        <h3>{t.year}년 별의 흐름</h3>
        <MonthGrid months={t.months}/>
        <div style={{ display: 'flex', gap: 18, marginTop: 20, flexWrap: 'wrap', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 4, background: 'linear-gradient(135deg, rgba(252,211,77,0.4), rgba(252,211,77,0.15))', border: '1px solid var(--moon-glow)' }}/>행운/기회</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.3)' }}/>보통</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 4, background: 'rgba(244,236,216,0.04)', border: '1px solid rgba(244,236,216,0.15)' }}/>주의</span>
        </div>
      </div>

      {pivots.length > 0 && (
        <div className="result-card">
          <span className="label-en">PIVOT POINTS · 전환점</span>
          <h3>전환점이 되는 달</h3>
          <ul className="bullet" style={{ marginTop: 10 }}>
            {pivots.map((p, i) => (
              <li key={i} style={{ fontSize: 14 }}>
                <strong style={{ color: 'var(--moon-glow)' }}>{p.month}월</strong>
                {p.type ? ` · ${p.type}` : ''}{p.score != null ? ` (${p.score}점)` : ''} — {p.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(warnings.length > 0 || t.warningDescription) && (
        <div className="result-card" style={{ background: 'rgba(252, 100, 100, 0.04)', borderColor: 'rgba(252, 100, 100, 0.2)' }}>
          <span className="label-en" style={{ color: '#fca5a5' }}>WARNING MONTHS · 조심해야 할 달</span>
          <h3>주의가 필요한 시기</h3>
          {warnings.length > 0 && (
            <ul className="bullet" style={{ marginTop: 10 }}>
              {warnings.map((p, i) => (
                <li key={i} style={{ fontSize: 14 }}>
                  <strong style={{ color: '#fca5a5' }}>{p.month}월</strong>{p.description ? ` — ${p.description}` : ''}
                </li>
              ))}
            </ul>
          )}
          {t.warningDescription && (
            <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.7)', marginTop: 12, padding: 12, background: 'rgba(244,236,216,0.04)', borderRadius: 8 }}>{t.warningDescription}</p>
          )}
        </div>
      )}

      {monthArr.length > 0 && (
        <div className="result-card">
          <span className="label-en">DETAILED MONTHS · 상세 월별 조언</span>
          <h3>월별 상세 분석</h3>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {monthArr.map(m => {
              const c = classifyType(m.type);
              const bg = c === 'lucky' ? 'rgba(252,211,77,0.08)' : c === 'caution' ? 'rgba(252,100,100,0.06)' : 'rgba(165,180,252,0.06)';
              const bd = c === 'lucky' ? 'rgba(252,211,77,0.25)' : c === 'caution' ? 'rgba(252,100,100,0.2)' : 'rgba(165,180,252,0.2)';
              return (
                <div key={m.month} style={{ padding: 12, background: bg, borderRadius: 10, border: `1px solid ${bd}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600 }}>{m.month}월{m.type ? ` · ${m.type}` : ''}</span>
                    {m.score != null && <span style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', color: 'var(--moon-glow)' }}>{m.score}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(244,236,216,0.75)', lineHeight: 1.5 }}>{m.advice}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function PageFinal({ d, onFeedback }) {
  return (
    <>
      <div className="result-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(252,211,77,0.08), rgba(165,180,252,0.04))', borderColor: 'rgba(252,211,77,0.3)' }}>
        <p style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 16, color: 'var(--moon-glow)', marginBottom: 16 }}>The stars have spoken.</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, lineHeight: 1.4, marginBottom: 14 }}>
          당신의 별자리는<br/>
          <span style={{ color: 'var(--moon-glow)', fontStyle: 'italic' }}>이미 빛나고 있어요.</span>
        </h2>
        <p className="body-text" style={{ fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
          오늘 받은 16장의 별빛이, 당신이 다음 발걸음을 옮길 때 작은 등불이 되길 바랍니다.
        </p>
        {d.openaiModelVersion && (
          <p style={{ marginTop: 20, fontSize: 11, color: 'rgba(244,236,216,0.4)', letterSpacing: '0.1em' }}>
            ANALYSIS POWERED BY {d.openaiModelVersion.toUpperCase()}
          </p>
        )}
      </div>

      <FeedbackBlock onFeedback={onFeedback} type="CONSULTATION" />
    </>
  );
}

/* ============== 03 Compatibility Result ============== */
window.CompatibilityResult = function CompatibilityResult({ data, companyName, onFeedback }) {
  const d = data || window.MOCK.compatibility;
  const conf = d.confidenceLevel === 'HIGH' ? '높음' : d.confidenceLevel === 'MEDIUM' ? '보통' : '낮음';
  return (
    <div className="result-stage fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span className="label">기업 궁합 분석 · COMPATIBILITY</span>
        <h1 className="headline headline-md" style={{ marginTop: 12 }}>
          <em>{companyName || '해당 기업'}</em>과의 별빛 궁합
        </h1>
      </div>

      <div className="result-card" style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ScoreRing value={d.compatibilityScore} label="궁합 점수"/>
        <div style={{ flex: 1, minWidth: 240 }}>
          <span className="label-en">CONFIDENCE</span>
          <div className="period-pill" style={{ marginBottom: 14 }}>신뢰도 {conf}</div>
          <p className="body-text" style={{ fontSize: 15 }}>{d.reasoning}</p>
        </div>
      </div>

      <div className="result-card">
        <span className="label-en">SCORE BREAKDOWN</span>
        <h3>점수의 별별 분석</h3>
        <div style={{ marginTop: 12 }}>
          {[
            { k: '십신 궁합', v: d.scoreBreakdown.tenGodCompatibility },
            { k: '오행 매칭', v: d.scoreBreakdown.fiveElementsMatch },
            { k: '지장간 정렬', v: d.scoreBreakdown.hiddenStemAlignment },
            { k: '리더십 적합', v: d.scoreBreakdown.leadershipFit }
          ].map(b => (
            <div key={b.k} className="bar-row">
              <div className="bar-label">{b.k}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${b.v}%` }}/></div>
              <div className="bar-val">{b.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="result-card">
        <span className="label-en">ROLE COMPATIBILITY</span>
        <h3>직무별 매칭도</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 12 }}>
          {d.roleCompatibility.map((r, i) => (
            <div key={i} style={{ padding: 18, background: 'rgba(244,236,216,0.04)', borderRadius: 12, border: '1px solid rgba(244,236,216,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="headline" style={{ fontSize: 16, fontWeight: 600 }}>{r.roleName}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--moon-glow)', fontWeight: 700 }}>{r.score}</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(244,236,216,0.7)', marginBottom: 8 }}>{r.reason}</p>
              <span className="tag" style={{ fontSize: 11 }}>💡 {r.recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div className="result-card">
          <span className="label-en">SYNERGIES</span>
          <h3>시너지 포인트</h3>
          <ul className="bullet">{d.synergies.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="result-card" style={{ background: 'rgba(252, 100, 100, 0.05)', borderColor: 'rgba(252, 100, 100, 0.2)' }}>
          <span className="label-en" style={{ color: '#fca5a5' }}>CAUTIONS</span>
          <h3>주의 사항</h3>
          <ul className="bullet">{d.cautions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>

      <div className="result-card">
        <span className="label-en">MONTHLY FORECAST</span>
        <h3>지원 시점 추천</h3>
        <MonthGrid months={d.monthlyForecast}/>
      </div>

      <div className="result-card">
        <span className="label-en">CAREER MILESTONES</span>
        <h3>입사 후 마일스톤</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 12 }}>
          <Milestone t="즉시" m={d.careerMilestones.immediate}/>
          <Milestone t="단기" m={d.careerMilestones.shortTerm}/>
          <Milestone t="중기" m={d.careerMilestones.mediumTerm}/>
        </div>
      </div>

      <FeedbackBlock onFeedback={onFeedback} type="COMPATIBILITY" />
    </div>
  );
};

function Milestone({ t, m }) {
  return (
    <div style={{ padding: 18, background: 'rgba(244,236,216,0.04)', borderRadius: 12, border: '1px solid rgba(244,236,216,0.1)' }}>
      <span className="label-en" style={{ marginBottom: 4 }}>{t} · {m.period}</span>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{m.action}</p>
      <p style={{ fontSize: 12, color: 'rgba(244,236,216,0.65)', lineHeight: 1.5 }}>예상 결과: {m.expectedOutcome}</p>
    </div>
  );
}

/* ============== Compatibility input prompt ============== */
window.CompatibilityInput = function CompatibilityInput({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [foundDate, setFoundDate] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  return (
    <div className="chat-stage" style={{ maxWidth: 560 }}>
      <div className="chat-flow">
        <div className="chat-bubble bot">
          <div className="bot-avatar">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="3" fill="#fcd34d"/>
            </svg>
            SSAju
          </div>
          어떤 기업과의 궁합을 보고 싶으신가요?
        </div>
        <div className="chat-bubble bot">
          <div className="bot-avatar"><svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="#fcd34d"/></svg>SSAju</div>
          기업명을 알려주세요. 설립일은 자동으로 찾아볼게요.
          <div style={{ marginTop: 14 }}>
            <input className="chat-input" placeholder="예: 삼성전자, 카카오, 토스..." value={name} onChange={e => setName(e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button className="chip" onClick={() => setShowOptional(s => !s)}>
                {showOptional ? '— 설립일 직접 입력 닫기' : '+ 설립일을 알고 있어요 (선택)'}
              </button>
            </div>
            {showOptional && (
              <div style={{ marginTop: 12 }}>
                <input type="date" className="date-picker" value={foundDate} onChange={e => setFoundDate(e.target.value)} style={{ width: '100%' }}/>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={onCancel}>← 뒤로</button>
              <button className="btn btn-primary" disabled={!name && !foundDate} onClick={() => onSubmit({ name, foundDate })}>분석 시작 →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============== Feedback block ============== */
function FeedbackBlock({ onFeedback, type }) {
  const [submitted, setSubmitted] = useState(false);
  const [satisfaction, setSatisfaction] = useState(null);
  const [content, setContent] = useState('');

  if (submitted) {
    return (
      <div className="result-card" style={{ textAlign: 'center', background: 'rgba(252,211,77,0.06)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--moon-glow)' }}>
          ✦ 별이 더 또렷해졌어요. 고마워요. ✦
        </p>
      </div>
    );
  }

  return (
    <div className="result-card">
      <span className="label-en">FEEDBACK</span>
      <h3>오늘의 별빛, 마음에 드셨나요?</h3>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          className="chip"
          onClick={() => setSatisfaction('SATISFIED')}
          style={satisfaction === 'SATISFIED' ? { background: 'var(--moon-glow)', color: 'var(--night-deep)', borderColor: 'var(--moon-glow)' } : {}}
        >
          ✦ 좋았어요
        </button>
        <button
          className="chip"
          onClick={() => setSatisfaction('DISSATISFIED')}
          style={satisfaction === 'DISSATISFIED' ? { background: 'var(--star-blue)', color: 'var(--night-deep)', borderColor: 'var(--star-blue)' } : {}}
        >
          ✧ 아쉬워요
        </button>
      </div>
      {satisfaction && (
        <div style={{ marginTop: 14 }}>
          <textarea
            className="chat-input"
            style={{ width: '100%', borderRadius: 14, padding: 14, minHeight: 80, resize: 'vertical' }}
            placeholder="더 자세한 의견을 남겨주세요 (선택, 최대 500자)"
            maxLength={500}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button className="btn btn-primary" style={{ marginTop: 12, fontSize: 14, padding: '10px 22px' }} onClick={() => {
            onFeedback && onFeedback({ type, satisfaction, content });
            setSubmitted(true);
          }}>피드백 보내기</button>
        </div>
      )}
    </div>
  );
}

/* ============== Standalone Feedback page (when picked from menu) ============== */
window.FeedbackStandalone = function FeedbackStandalone({ onFeedback }) {
  return (
    <div className="result-stage fade-in-up" style={{ maxWidth: 720 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span className="label">만족도 피드백 · FEEDBACK</span>
        <h1 className="headline headline-md" style={{ marginTop: 12 }}>
          별빛이 마음에 닿았는지 <em>들려주세요</em>
        </h1>
        <p className="body-text" style={{ marginTop: 14, color: 'rgba(244,236,216,0.7)' }}>
          여러분의 한 마디가 별을 더 또렷하게 만듭니다.
        </p>
      </div>
      <div className="result-card">
        <span className="label-en">WHICH ANALYSIS?</span>
        <h3>어떤 분석에 대한 피드백인가요?</h3>
        <FeedbackForm onFeedback={onFeedback}/>
      </div>
    </div>
  );
};

function FeedbackForm({ onFeedback }) {
  const [type, setType] = useState('CAREER_TIMING');
  const [satisfaction, setSatisfaction] = useState(null);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--moon-glow)' }}>
          ✦ 별이 더 또렷해졌어요. 고마워요. ✦
        </p>
      </div>
    );
  }

  const types = [
    { k: 'CAREER_TIMING', n: '관운 분석' },
    { k: 'CONSULTATION', n: 'AI 컨설팅' },
    { k: 'COMPATIBILITY', n: '기업 궁합' }
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {types.map(t => (
          <button key={t.k} className="chip" onClick={() => setType(t.k)}
            style={type === t.k ? { background: 'var(--moon-glow)', color: 'var(--night-deep)', borderColor: 'var(--moon-glow)' } : {}}>
            {t.n}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 22 }}>
        <span className="label-en">SATISFACTION</span>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="chip" onClick={() => setSatisfaction('SATISFIED')}
            style={satisfaction === 'SATISFIED' ? { background: 'var(--moon-glow)', color: 'var(--night-deep)', borderColor: 'var(--moon-glow)' } : {}}>
            ✦ 만족해요
          </button>
          <button className="chip" onClick={() => setSatisfaction('DISSATISFIED')}
            style={satisfaction === 'DISSATISFIED' ? { background: 'var(--star-blue)', color: 'var(--night-deep)', borderColor: 'var(--star-blue)' } : {}}>
            ✧ 아쉬워요
          </button>
        </div>
      </div>
      {satisfaction && (
        <div style={{ marginTop: 22 }}>
          <span className="label-en">YOUR THOUGHTS</span>
          <textarea
            className="chat-input"
            style={{ width: '100%', borderRadius: 14, padding: 14, minHeight: 100, resize: 'vertical', marginTop: 8 }}
            placeholder="더 자세한 의견을 들려주세요 (선택, 최대 500자)"
            maxLength={500}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button className="btn btn-primary" style={{ marginTop: 14, fontSize: 14 }} onClick={() => {
            onFeedback && onFeedback({ type, satisfaction, content });
            setSubmitted(true);
          }}>피드백 보내기 →</button>
        </div>
      )}
    </>
  );
}

Object.assign(window, {
  TimingResult: window.TimingResult,
  ConsultationResult: window.ConsultationResult,
  CompatibilityResult: window.CompatibilityResult,
  CompatibilityInput: window.CompatibilityInput,
  FeedbackStandalone: window.FeedbackStandalone
});
