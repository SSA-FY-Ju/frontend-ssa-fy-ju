'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';
import type { PageState } from './types';

interface Message {
  who: 'bot' | 'user';
  text: string;
  input?: 'date' | 'time' | 'confirm';
}

interface ChatInputProps {
  onStateChange?: (state: PageState) => void;
}

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export default function ChatInput({ onStateChange: _onStateChange }: ChatInputProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [draftYear, setDraftYear] = useState('2000');
  const [draftMonth, setDraftMonth] = useState('01');
  const [draftDay, setDraftDay] = useState('01');
  const [draftHour, setDraftHour] = useState('12');
  const [draftMinute, setDraftMinute] = useState('00');
  const flowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setBirthDate: storeSetBirthDate, setBirthTime: storeSetBirthTime, selectedService } = useSessionStore();

  useEffect(() => {
    const seq = [
      { delay: 400,  msg: { who: 'bot' as const, text: '안녕하세요. 저는 SSAju예요. ✨' } },
      { delay: 1100, msg: { who: 'bot' as const, text: '당신의 별자리를 함께 읽어보고 싶어요.' } },
      { delay: 1100, msg: { who: 'bot' as const, text: '먼저, 태어나신 날짜를 알려주실래요?', input: 'date' as const } },
    ];
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    seq.forEach((s, i) => {
      cumulative += s.delay;
      timers.push(setTimeout(() => {
        setMessages((prev) => [...prev, s.msg]);
        if (i === seq.length - 1) setStep(1);
      }, cumulative));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = flowRef.current;
    if (!el) return;
    const start = el.scrollTop;
    const end = el.scrollHeight - el.clientHeight;
    const change = end - start;
    if (change <= 0) return;
    const duration = 1400;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const startTime = performance.now();
    let rafId: number;
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.scrollTop = start + change * easeOut(progress);
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [messages]);

  const submitDate = () => {
    const dateStr = `${draftYear}-${draftMonth}-${draftDay}`;
    const display = `${draftYear}년 ${parseInt(draftMonth)}월 ${parseInt(draftDay)}일`;
    setBirthDate(dateStr);
    setMessages((prev) => [...prev, { who: 'user' as const, text: display }]);
    setStep(0);
    setTimeout(() => {
      setMessages((prev) => [...prev, { who: 'bot' as const, text: '좋아요. 이제 태어난 시간도 알려주세요.' }]);
    }, 600);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { who: 'bot' as const, text: '한 시간 차이로도 별이 달라져요.\n모르시면 정오(12시)로 두셔도 괜찮아요.', input: 'time' as const },
      ]);
      setStep(2);
    }, 1500);
  };

  const submitTime = () => {
    const time = `${draftHour.padStart(2, '0')}:${draftMinute.padStart(2, '0')}`;
    const displayTime = `${parseInt(draftHour)}시 ${parseInt(draftMinute)}분`;
    setMessages((prev) => [...prev, { who: 'user' as const, text: displayTime }]);
    setStep(0);
    setTimeout(() => {
      setMessages((prev) => [...prev, { who: 'bot' as const, text: '고마워요. 별을 펼쳐드릴게요. 🌌' }]);
    }, 600);
    setTimeout(() => {
      storeSetBirthDate(birthDate);
      storeSetBirthTime(time);
      setMessages((prev) => [
        ...prev,
        { who: 'bot' as const, text: '준비됐어요. 바로 분석을 시작할게요!', input: 'confirm' as const },
      ]);
      setStep(3);
    }, 1700);
  };

  const CURRENT_YEAR = new Date().getFullYear();
  const yearOptions = Array.from({ length: CURRENT_YEAR - 1924 + 1 }, (_, i) =>
    String(CURRENT_YEAR - i),
  );

  const getDaysInMonth = (year: string, month: string) =>
    new Date(parseInt(year), parseInt(month), 0).getDate();

  const handleYearChange = (y: string) => {
    setDraftYear(y);
    const maxDay = getDaysInMonth(y, draftMonth);
    if (parseInt(draftDay) > maxDay) setDraftDay(String(maxDay).padStart(2, '0'));
  };

  const handleMonthChange = (m: string) => {
    setDraftMonth(m);
    const maxDay = getDaysInMonth(draftYear, m);
    if (parseInt(draftDay) > maxDay) setDraftDay(String(maxDay).padStart(2, '0'));
  };

  const quickTimes = [
    { label: '자정 0시', h: '00', m: '00' },
    { label: '새벽 6시', h: '06', m: '00' },
    { label: '정오 12시', h: '12', m: '00' },
    { label: '저녁 6시', h: '18', m: '00' },
  ];

  return (
    <div className="relative z-10 w-screen h-screen flex items-center justify-center px-4">
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: 600, height: 'min(80vh, 720px)' }}
      >
        <div
          ref={flowRef}
          className="chat-flow-no-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '20px 20px 24px',
          }}
        >
            {messages.map((m, i) => (
              <div
                key={i}
                className="animate-bubble-in"
                style={{
                  alignSelf: m.who === 'bot' ? 'flex-start' : 'flex-end',
                  maxWidth: '92%',
                }}
              >
                {/* 봇 이름 레이블 (첫 번째 봇 메시지 또는 이전이 유저인 경우) */}
                {m.who === 'bot' && (i === 0 || messages[i - 1]?.who === 'user') && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginBottom: 5,
                      paddingLeft: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.55)', fontWeight: 600 }}>
                      SSAju
                    </span>
                  </div>
                )}

                {/* 버블 */}
                <div
                  style={
                    m.who === 'bot'
                      ? {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderLeft: '2px solid rgba(139,92,246,0.5)',
                          borderRadius: '18px 18px 18px 18px',
                          padding: '13px 16px',
                          color: 'rgba(255,255,255,0.88)',
                          fontSize: 14,
                          lineHeight: 1.65,
                          backdropFilter: 'blur(8px)',
                        }
                      : {
                          background: 'linear-gradient(135deg, #fcd34d, #f9c846)',
                          borderRadius: '18px 18px 18px 18px',
                          padding: '13px 16px',
                          color: '#0a1230',
                          fontSize: 14,
                          fontWeight: 600,
                          lineHeight: 1.55,
                          boxShadow: '0 4px 20px rgba(252,211,77,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                        }
                  }
                >
                  <span className="whitespace-pre-line">{m.text}</span>

                  {/* 날짜 입력 */}
                  {m.input === 'date' && (
                    <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* 년 */}
                        <select
                          value={draftYear}
                          onChange={(e) => handleYearChange(e.target.value)}
                          style={{
                            flex: 2.5,
                            appearance: 'none',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#f4ecd8',
                            padding: '9px 14px',
                            borderRadius: 12,
                            fontSize: 13,
                            outline: 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            colorScheme: 'dark',
                          }}
                        >
                          {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}년</option>
                          ))}
                        </select>
                        {/* 월 */}
                        <select
                          value={draftMonth}
                          onChange={(e) => handleMonthChange(e.target.value)}
                          style={{
                            flex: 1.5,
                            appearance: 'none',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#f4ecd8',
                            padding: '9px 14px',
                            borderRadius: 12,
                            fontSize: 13,
                            outline: 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            colorScheme: 'dark',
                          }}
                        >
                          {Array.from({ length: 12 }, (_, idx) => {
                            const val = String(idx + 1).padStart(2, '0');
                            return <option key={val} value={val}>{idx + 1}월</option>;
                          })}
                        </select>
                        {/* 일 */}
                        <select
                          value={draftDay}
                          onChange={(e) => setDraftDay(e.target.value)}
                          style={{
                            flex: 1.5,
                            appearance: 'none',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#f4ecd8',
                            padding: '9px 14px',
                            borderRadius: 12,
                            fontSize: 13,
                            outline: 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            colorScheme: 'dark',
                          }}
                        >
                          {Array.from({ length: getDaysInMonth(draftYear, draftMonth) }, (_, idx) => {
                            const val = String(idx + 1).padStart(2, '0');
                            return <option key={val} value={val}>{idx + 1}일</option>;
                          })}
                        </select>
                        {/* 제출 */}
                        <button
                          onClick={submitDate}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fcd34d, #f9c846)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0a1230',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 4px 16px rgba(252,211,77,0.4)',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <ArrowIcon />
                        </button>
                      </div>

                    </div>
                  )}

                  {/* 시간 입력 */}
                  {m.input === 'time' && (
                    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* 시/분 셀렉트 */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          value={draftHour}
                          onChange={(e) => setDraftHour(e.target.value)}
                          style={{
                            flex: 1,
                            appearance: 'none',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#f4ecd8',
                            padding: '9px 12px',
                            borderRadius: 12,
                            fontSize: 13,
                            outline: 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            colorScheme: 'dark',
                          }}
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={String(i).padStart(2, '0')}>{i}시</option>
                          ))}
                        </select>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 300 }}>:</span>
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={parseInt(draftMinute)}
                            onChange={(e) => {
                              const v = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                              setDraftMinute(String(v).padStart(2, '0'));
                            }}
                            className="no-spinner"
                            style={{
                              width: '100%',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#f4ecd8',
                              padding: '9px 28px 9px 12px',
                              borderRadius: 12,
                              fontSize: 13,
                              outline: 'none',
                              textAlign: 'center',
                              colorScheme: 'dark',
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            right: 10,
                            fontSize: 12,
                            color: 'rgba(244,236,216,0.45)',
                            pointerEvents: 'none',
                          }}>분</span>
                        </div>
                        <button
                          onClick={submitTime}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fcd34d, #f9c846)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0a1230',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 4px 16px rgba(252,211,77,0.4)',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <ArrowIcon />
                        </button>
                      </div>

                      {/* 빠른 선택 */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {quickTimes.map(({ label, h, m: min }) => (
                          <button
                            key={label}
                            onClick={() => { setDraftHour(h); setDraftMinute(min); }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 999,
                              background: draftHour === h && draftMinute === min
                                ? 'rgba(139,92,246,0.25)'
                                : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${draftHour === h && draftMinute === min ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.12)'}`,
                              color: draftHour === h && draftMinute === min
                                ? '#c4b5fd'
                                : 'rgba(255,255,255,0.55)',
                              fontSize: 12,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 확인 버튼 */}
                  {m.input === 'confirm' && (
                    <div style={{ paddingTop: 14 }}>
                      <button
                        onClick={() => {
                          const routes: Record<string, string> = {
                            CAREER_TIMING: '/career-timing',
                            CONSULTATION: '/consultation',
                            COMPATIBILITY: '/compatibility',
                          };
                          router.push(selectedService ? (routes[selectedService] ?? '/select') : '/select');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          borderRadius: 14,
                          background: 'linear-gradient(135deg, #fcd34d, #f9c846)',
                          border: 'none',
                          color: '#0a1230',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 24px rgba(252,211,77,0.45)',
                          letterSpacing: '0.01em',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(252,211,77,0.55)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 24px rgba(252,211,77,0.45)';
                        }}
                      >
                        분석 시작하기 →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {step === 0 && messages.length > 0 && messages[messages.length - 1].who === 'user' && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: '2px solid rgba(139,92,246,0.5)',
                    borderRadius: '18px 18px 18px 18px',
                    padding: '14px 18px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="chat-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
