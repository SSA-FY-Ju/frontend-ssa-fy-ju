/* global React, ReactDOM */
const { useState, useEffect, useCallback } = React;

function App() {
  // screens: 'landing' | 'input' | 'select' | 'compat-input' | 'result-timing' | 'result-consultation' | 'result-compatibility' | 'result-feedback' | 'loading'
  const [screen, setScreen] = useState('landing');
  const [pageIndex, setPageIndex] = useState(0);
  const [birth, setBirth] = useState({ birthDate: '', birthTime: '' });
  const [companyName, setCompanyName] = useState('');
  const [resultData, setResultData] = useState(null);
  const TOTAL_PAGES = 5;

  // expose nav for landing CTA
  useEffect(() => {
    window.__navigateTo = (s) => setScreen(s);
  }, []);

  // Wheel / touch / keyboard navigation for landing
  useEffect(() => {
    if (screen !== 'landing') return;

    let lock = false;
    const advance = (dir) => {
      if (lock) return;
      lock = true;
      setPageIndex(p => Math.max(0, Math.min(TOTAL_PAGES - 1, p + dir)));
      setTimeout(() => { lock = false; }, 900);
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 6) return;
      advance(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); advance(1); }
      if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); advance(-1); }
    };
    let touchY = 0;
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
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
  }, [screen]);

  /* -- Service flow -- */
  const handleChatComplete = useCallback((b) => {
    setBirth(b);
    setScreen('select');
  }, []);

  const handleServiceSelect = useCallback((id) => {
    if (id === 'feedback') {
      setScreen('result-feedback');
      return;
    }
    if (id === 'compatibility') {
      setScreen('compat-input');
      return;
    }
    // For timing & consultation, simulate API call with loader then mock data
    setScreen('loading');
    const delay = id === 'consultation' ? 3500 : 1800;
    setTimeout(() => {
      if (id === 'timing') {
        setResultData(window.MOCK.timing);
        setScreen('result-timing');
      } else if (id === 'consultation') {
        setResultData(window.MOCK.consultation);
        setScreen('result-consultation');
      }
    }, delay);
  }, []);

  const handleCompatSubmit = useCallback(({ name, foundDate }) => {
    setCompanyName(name || '해당 기업');
    setScreen('loading');
    setTimeout(() => {
      setResultData(window.MOCK.compatibility);
      setScreen('result-compatibility');
    }, 2200);
  }, []);

  const handleFeedback = useCallback((fb) => {
    // In real app: POST /api/feedback/satisfaction
    console.log('feedback', fb);
  }, []);

  const goHome = () => {
    setScreen('landing');
    setPageIndex(0);
  };
  const goSelect = () => setScreen('select');

  return (
    <>
      <window.StarryBackground />
      <window.Brand onClick={goHome} />

      {/* Page dots — only on landing */}
      {screen === 'landing' && (
        <div className="page-dots">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button key={i} className={`page-dot ${pageIndex === i ? 'active' : ''}`} onClick={() => setPageIndex(i)} aria-label={`페이지 ${i+1}`}/>
          ))}
        </div>
      )}

      {/* Back button — on result/select screens */}
      {(screen.startsWith('result') || screen === 'compat-input') && (
        <button className="back-btn" onClick={goSelect}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          서비스 선택으로
        </button>
      )}
      {screen === 'select' && (
        <button className="back-btn" onClick={goHome}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          처음으로
        </button>
      )}

      <div className="pages">
        {/* Landing pages */}
        {screen === 'landing' && <window.LandingPages pageIndex={pageIndex} totalPages={TOTAL_PAGES} />}

        {/* Input */}
        {screen === 'input' && (
          <div className="page active">
            <window.ChatInput onComplete={handleChatComplete} />
          </div>
        )}

        {/* Service selection */}
        {screen === 'select' && (
          <div className="page active" style={{ alignItems: 'flex-start', paddingTop: '12vh' }}>
            <window.ServiceSelect onSelect={handleServiceSelect} birthDate={birth.birthDate} birthTime={birth.birthTime}/>
          </div>
        )}

        {/* Compatibility input */}
        {screen === 'compat-input' && (
          <div className="page active">
            <window.CompatibilityInput onSubmit={handleCompatSubmit} onCancel={goSelect} />
          </div>
        )}

        {/* Loading */}
        {screen === 'loading' && (
          <div className="page active">
            <window.CosmosLoader message="별을 펼치는 중이에요..." sub="READING THE STARS"/>
          </div>
        )}

        {/* Results */}
        {screen === 'result-timing' && (
          <div className="page active" style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
            <window.TimingResult data={resultData} onFeedback={handleFeedback}/>
          </div>
        )}
        {screen === 'result-consultation' && (
          <div className="page active" style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
            <window.ConsultationResult data={resultData} onFeedback={handleFeedback}/>
          </div>
        )}
        {screen === 'result-compatibility' && (
          <div className="page active" style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
            <window.CompatibilityResult data={resultData} companyName={companyName} onFeedback={handleFeedback}/>
          </div>
        )}
        {screen === 'result-feedback' && (
          <div className="page active" style={{ alignItems: 'flex-start', paddingTop: '12vh' }}>
            <window.FeedbackStandalone onFeedback={handleFeedback}/>
          </div>
        )}
      </div>

      {/* Screen labels for comment context */}
      <div data-screen-label={screenLabel(screen, pageIndex)} style={{ display: 'none' }} />
    </>
  );
}

function screenLabel(screen, pageIndex) {
  if (screen === 'landing') return `01 Landing - page ${pageIndex + 1}`;
  if (screen === 'input') return '02 Input - chat';
  if (screen === 'select') return '03 Service Select';
  if (screen === 'compat-input') return '04 Compatibility Input';
  if (screen === 'loading') return '05 Loading';
  if (screen === 'result-timing') return '06 Result - Career Timing';
  if (screen === 'result-consultation') return '07 Result - Consultation';
  if (screen === 'result-compatibility') return '08 Result - Compatibility';
  if (screen === 'result-feedback') return '09 Feedback';
  return screen;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
