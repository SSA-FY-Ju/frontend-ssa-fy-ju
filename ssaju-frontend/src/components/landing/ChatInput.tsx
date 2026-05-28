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

/* ─────────────────────────────────────────
   커스텀 피커 셀렉트
───────────────────────────────────────── */
interface PickerOption {
  value: string;
  label: string;
}

function PickerSelect({
  value,
  options,
  onChange,
  flex = 1,
}: {
  value: string;
  options: PickerOption[];
  onChange: (v: string) => void;
  flex?: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // 열릴 때 선택된 항목으로 스크롤
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLButtonElement>('[data-selected="true"]');
    el?.scrollIntoView({ block: 'center' });
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={rootRef} style={{ flex, position: 'relative', minWidth: 0 }}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: open ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.15)'}`,
          color: '#f4ecd8',
          padding: '9px 20px',
          borderRadius: 12,
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'background 0.15s, border-color 0.15s',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span>{selectedLabel}</span>
        <span style={{ fontSize: 8, color: 'rgba(244,236,216,0.3)', lineHeight: 1 }}>▼</span>
      </button>

      {/* 드롭다운 목록 */}
      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            maxHeight: 180,
            overflowY: 'auto',
            background: 'rgba(10,6,28,0.99)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 12,
            zIndex: 300,
            boxShadow: '0 -4px 28px rgba(0,0,0,0.7)',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                data-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: isSelected ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.02)',
                  border: 'none',
                  borderBottom: '1px solid rgba(139,92,246,0.08)',
                  color: isSelected ? '#e9d5ff' : 'rgba(244,236,216,0.65)',
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   옵션 상수 (컴포넌트 외부 — 재생성 방지)
───────────────────────────────────────── */
const CURRENT_YEAR = new Date().getFullYear();

const yearOpts: PickerOption[] = Array.from({ length: CURRENT_YEAR - 1924 + 1 }, (_, i) => ({
  value: String(CURRENT_YEAR - i),
  label: `${CURRENT_YEAR - i}년`,
}));

const monthOpts: PickerOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: `${i + 1}월`,
}));

const hourOpts: PickerOption[] = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: `${i}시`,
}));

const minuteOpts: PickerOption[] = Array.from({ length: 60 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: `${i}분`,
}));

function getDaysInMonth(year: string, month: string) {
  return new Date(parseInt(year), parseInt(month), 0).getDate();
}

/* ─────────────────────────────────────────
   ArrowIcon
───────────────────────────────────────── */
const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

/* ─────────────────────────────────────────
   ChatInput
───────────────────────────────────────── */
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
  const {
    setBirthDate: storeSetBirthDate,
    setBirthTime: storeSetBirthTime,
    selectedService,
  } = useSessionStore();

  useEffect(() => {
    const seq = [
      { delay: 400, msg: { who: 'bot' as const, text: '안녕하세요. 저는 SSAju예요. ✨' } },
      { delay: 1100, msg: { who: 'bot' as const, text: '당신의 별자리를 함께 읽어보고 싶어요.' } },
      {
        delay: 1100,
        msg: {
          who: 'bot' as const,
          text: '먼저, 태어나신 날짜를 알려주실래요?',
          input: 'date' as const,
        },
      },
    ];
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    seq.forEach((s, i) => {
      cumulative += s.delay;
      timers.push(
        setTimeout(() => {
          setMessages((prev) => [...prev, s.msg]);
          if (i === seq.length - 1) setStep(1);
        }, cumulative),
      );
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
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.scrollTop = start + change * easeOut(progress);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [messages]);

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

  const dayOpts: PickerOption[] = Array.from(
    { length: getDaysInMonth(draftYear, draftMonth) },
    (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: `${i + 1}일` }),
  );

  const submitDate = () => {
    const dateStr = `${draftYear}-${draftMonth}-${draftDay}`;
    const display = `${draftYear}년 ${parseInt(draftMonth)}월 ${parseInt(draftDay)}일`;
    setBirthDate(dateStr);
    setMessages((prev) => [...prev, { who: 'user' as const, text: display }]);
    setStep(0);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { who: 'bot' as const, text: '좋아요. 이제 태어난 시간도 알려주세요.' },
      ]);
    }, 600);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          who: 'bot' as const,
          text: '한 시간 차이로도 별이 달라져요.\n모르시면 정오(12시)로 두셔도 괜찮아요.',
          input: 'time' as const,
        },
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
      setMessages((prev) => [
        ...prev,
        { who: 'bot' as const, text: '고마워요. 별을 펼쳐드릴게요. 🌌' },
      ]);
    }, 600);
    setTimeout(() => {
      storeSetBirthDate(birthDate);
      storeSetBirthTime(time);
      setMessages((prev) => [
        ...prev,
        {
          who: 'bot' as const,
          text: '준비됐어요. 바로 분석을 시작할게요!',
          input: 'confirm' as const,
        },
      ]);
      setStep(3);
    }, 1700);
  };

  const quickTimes = [
    { label: '자정 0시', h: '00', m: '00' },
    { label: '새벽 6시', h: '06', m: '00' },
    { label: '정오 12시', h: '12', m: '00' },
    { label: '저녁 6시', h: '18', m: '00' },
  ];

  return (
    <div className="relative z-10 w-screen h-screen flex items-center justify-center px-4">
      <div className="w-full flex flex-col" style={{ maxWidth: 720, height: 'min(80vh, 720px)' }}>
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
                maxWidth: '97%',
              }}
            >
              {/* 봇 이름 레이블 */}
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
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderLeft: '2px solid rgba(139,92,246,0.5)',
                        borderRadius: '18px 18px 18px 18px',
                        padding: '13px 16px',
                        color: 'rgba(255,255,255,0.88)',
                        fontSize: 14,
                        lineHeight: 1.65,
                      }
                    : {
                        background: 'linear-gradient(135deg, #fcd34d, #f9c846)',
                        borderRadius: '18px 18px 18px 18px',
                        padding: '13px 16px',
                        color: '#0a1230',
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.55,
                        boxShadow:
                          '0 4px 20px rgba(252,211,77,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                      }
                }
              >
                <span className="whitespace-pre-line">{m.text}</span>

                {/* 날짜 입력 */}
                {m.input === 'date' && (
                  <div style={{ paddingTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <PickerSelect
                      value={draftYear}
                      options={yearOpts}
                      onChange={handleYearChange}
                      flex={5}
                    />
                    <PickerSelect
                      value={draftMonth}
                      options={monthOpts}
                      onChange={handleMonthChange}
                      flex={4}
                    />
                    <PickerSelect
                      value={draftDay}
                      options={dayOpts}
                      onChange={setDraftDay}
                      flex={4}
                    />
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
                )}

                {/* 시간 입력 */}
                {m.input === 'time' && (
                  <div
                    style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <PickerSelect
                        value={draftHour}
                        options={hourOpts}
                        onChange={setDraftHour}
                        flex={1}
                      />
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 16,
                          fontWeight: 300,
                          flexShrink: 0,
                        }}
                      >
                        :
                      </span>
                      <PickerSelect
                        value={draftMinute}
                        options={minuteOpts}
                        onChange={setDraftMinute}
                        flex={1}
                      />
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
                          onClick={() => {
                            setDraftHour(h);
                            setDraftMinute(min);
                          }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 999,
                            background:
                              draftHour === h && draftMinute === min
                                ? 'rgba(139,92,246,0.25)'
                                : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${draftHour === h && draftMinute === min ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.12)'}`,
                            color:
                              draftHour === h && draftMinute === min
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
                        router.push(
                          selectedService ? (routes[selectedService] ?? '/select') : '/select',
                        );
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
                  background: 'rgba(20,12,45,0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: '2px solid rgba(139,92,246,0.5)',
                  borderRadius: '18px 18px 18px 18px',
                  padding: '14px 18px',
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
