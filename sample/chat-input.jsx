/* global React */
const { useState, useEffect, useRef } = React;

/* ============== Conversational input (chatbot style) ============== */

window.ChatInput = function ChatInput({ onComplete }) {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0); // 0: greet, 1: ask year, 2: ask date, 3: ask time, 4: confirm
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('12:00');
  const flowRef = useRef(null);

  // initial bot messages
  useEffect(() => {
    const seq = [
      { delay: 400, msg: { who: 'bot', text: '안녕하세요. 저는 SSAju예요. ✨' } },
      { delay: 1100, msg: { who: 'bot', text: '당신의 별자리를 함께 읽어보고 싶어요.' } },
      { delay: 1100, msg: { who: 'bot', text: '먼저, 태어나신 날짜를 알려주실래요?', input: 'date' } }
    ];
    let cumulative = 0;
    seq.forEach((s, i) => {
      cumulative += s.delay;
      setTimeout(() => {
        setMessages(prev => [...prev, s.msg]);
        if (i === seq.length - 1) setStep(1);
      }, cumulative);
    });
  }, []);

  // auto-scroll
  useEffect(() => {
    if (flowRef.current) {
      flowRef.current.scrollTop = flowRef.current.scrollHeight;
    }
  }, [messages]);

  function submitDate() {
    if (!draftDate) return;
    const d = new Date(draftDate);
    const display = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    setBirthDate(draftDate);
    setMessages(prev => [...prev, { who: 'user', text: display }]);
    setStep(0); // typing
    setTimeout(() => {
      setMessages(prev => [...prev, { who: 'bot', text: '좋아요. 이제 태어난 시간도 알려주세요.' }]);
    }, 600);
    setTimeout(() => {
      setMessages(prev => [...prev, { who: 'bot', text: '한 시간 차이로도 별이 달라져요. 모르시면 정오(12:00)로 두셔도 괜찮아요.', input: 'time' }]);
      setStep(2);
    }, 1500);
  }

  function submitTime() {
    if (!draftTime) return;
    setBirthTime(draftTime);
    setMessages(prev => [...prev, { who: 'user', text: draftTime }]);
    setStep(0);
    setTimeout(() => {
      setMessages(prev => [...prev, { who: 'bot', text: '고마워요. 별을 펼쳐드릴게요. 🌌' }]);
    }, 600);
    setTimeout(() => {
      setMessages(prev => [...prev, { who: 'bot', text: '어떤 별자리부터 보여드릴까요?', input: 'confirm' }]);
      setStep(3);
    }, 1700);
  }

  return (
    <div className="chat-stage">
      <div className="chat-flow" ref={flowRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.who}`} style={{ animationDelay: '0s' }}>
            {m.who === 'bot' && (
              <div className="bot-avatar">
                <svg width="14" height="14" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="3" fill="#fcd34d"/>
                  <circle cx="8" cy="8" r="6" fill="none" stroke="#fcd34d" strokeWidth="0.4" opacity="0.5"/>
                </svg>
                SSAju
              </div>
            )}
            {m.text}
            {m.input === 'date' && (
              <div className="chat-input-row" style={{ padding: '12px 0 0' }}>
                <input
                  type="date"
                  className="date-picker"
                  value={draftDate}
                  onChange={e => setDraftDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  style={{ flex: 1 }}
                />
                <button className="chat-send" onClick={submitDate} disabled={!draftDate} aria-label="확인">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            )}
            {m.input === 'time' && (
              <div style={{ padding: '12px 0 0' }}>
                <div className="chat-input-row" style={{ padding: 0 }}>
                  <input
                    type="time"
                    className="time-picker"
                    value={draftTime}
                    onChange={e => setDraftTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button className="chat-send" onClick={submitTime} disabled={!draftTime} aria-label="확인">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                <div className="chip-row">
                  {['00:00', '06:00', '12:00', '18:00'].map(t => (
                    <button key={t} className="chip" onClick={() => setDraftTime(t)}>{t}</button>
                  ))}
                </div>
              </div>
            )}
            {m.input === 'confirm' && (
              <div className="chip-row" style={{ marginTop: 14 }}>
                <button className="btn btn-primary" style={{ fontSize: 14, padding: '12px 24px' }} onClick={() => onComplete({ birthDate, birthTime })}>
                  서비스 고르러 가기 →
                </button>
              </div>
            )}
          </div>
        ))}
        {step === 0 && messages.length > 0 && messages[messages.length - 1].who === 'user' && (
          <div className="chat-bubble bot">
            <div className="typing-dots"><span></span><span></span><span></span></div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ChatInput: window.ChatInput });
