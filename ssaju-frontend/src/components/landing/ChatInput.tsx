'use client';

/**
 * 채팅형 입력 플로우에서 생년월일/시간을 수집하고 다음 단계(서비스 선택)로 전환합니다.
 * 기반: /sample/chat-input.jsx
 */

import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import ServiceSelect from './ServiceSelect';
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const selectClass =
  'flex-1 appearance-none bg-[rgba(244,236,216,0.06)] border border-[rgba(244,236,216,0.2)] text-[#f4ecd8] px-5 py-[14px] rounded-xl text-sm outline-none [color-scheme:dark] cursor-pointer text-center';

export default function ChatInput({ onStateChange: _onStateChange }: ChatInputProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftHour, setDraftHour] = useState('12');
  const [draftMinute, setDraftMinute] = useState('00');
  const [showService, setShowService] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);
  const { setBirthDate: storeSetBirthDate, setBirthTime: storeSetBirthTime } = useSessionStore();

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
    if (flowRef.current) {
      flowRef.current.scrollTo({ top: flowRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const submitDate = () => {
    if (!draftDate) return;
    const d = new Date(draftDate);
    const display = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    setBirthDate(draftDate);
    setMessages((prev) => [...prev, { who: 'user' as const, text: display }]);
    setStep(0);

    setTimeout(() => {
      setMessages((prev) => [...prev, { who: 'bot' as const, text: '좋아요. 이제 태어난 시간도 알려주세요.' }]);
    }, 600);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { who: 'bot' as const, text: '한 시간 차이로도 별이 달라져요. 모르시면 정오(12시)로 두셔도 괜찮아요.', input: 'time' as const },
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
        { who: 'bot' as const, text: '어떤 별자리부터 보여드릴까요?', input: 'confirm' as const },
      ]);
      setStep(3);
    }, 1700);
  };

  if (showService) {
    return (
      <ServiceSelect
        birthDate={birthDate}
        birthTime={`${draftHour.padStart(2, '0')}:${draftMinute.padStart(2, '0')}`}
      />
    );
  }

  const quickTimes = [
    { label: '자정', h: '00', m: '00' },
    { label: '새벽 6시', h: '06', m: '00' },
    { label: '정오', h: '12', m: '00' },
    { label: '저녁 6시', h: '18', m: '00' },
  ];

  return (
    <div className="relative z-10 w-screen h-screen flex items-center justify-center">
      <div className="w-full max-w-[640px] h-full max-h-[80vh] flex flex-col py-[4vh]">
        <div
          ref={flowRef}
          className="chat-flow-no-scroll flex-1 flex flex-col gap-[18px] px-1 py-5 overflow-y-auto"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`animate-bubble-in max-w-[85%] px-5 py-[14px] rounded-[22px] text-[15px] leading-[1.55] ${
                m.who === 'bot'
                  ? 'self-start bg-[rgba(244,236,216,0.08)] border border-[rgba(244,236,216,0.15)] text-[#f4ecd8] backdrop-blur-md'
                  : 'self-end bg-gradient-to-br from-[#fcd34d] to-[#f9d976] font-medium text-[#0a1230] shadow-[0_4px_20px_rgba(252,211,77,0.25)]'
              }`}
            >
              {m.who === 'bot' && (
                <div
                  className="flex items-center gap-2 mb-[6px] italic text-[12px] text-[#f9d976] tracking-[0.05em]"
                  style={{ fontFamily: 'var(--serif-en)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" className="flex-shrink-0">
                    <circle cx="8" cy="8" r="3" fill="#fcd34d" />
                    <circle cx="8" cy="8" r="6" fill="none" stroke="#fcd34d" strokeWidth="0.4" opacity="0.5" />
                  </svg>
                  SSAju
                </div>
              )}

              {m.text}

              {m.input === 'date' && (
                <div className="flex gap-[10px] pt-3 items-center">
                  <input
                    type="date"
                    className="flex-1 bg-[rgba(244,236,216,0.06)] border border-[rgba(244,236,216,0.2)] text-[#f4ecd8] px-[14px] py-[14px] rounded-xl text-sm outline-none [color-scheme:dark] hover:border-[rgba(244,236,216,0.45)] transition-colors"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                  />
                  <button
                    onClick={submitDate}
                    disabled={!draftDate}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#fcd34d] to-[#f9d976] flex items-center justify-center text-[#0a1230] shadow-[0_4px_20px_rgba(252,211,77,0.35)] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    <ArrowIcon />
                  </button>
                </div>
              )}

              {m.input === 'time' && (
                <div className="pt-3 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={draftHour}
                      onChange={(e) => setDraftHour(e.target.value)}
                      className={selectClass}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={String(i).padStart(2, '0')}>{i}시</option>
                      ))}
                    </select>
                    <select
                      value={draftMinute}
                      onChange={(e) => setDraftMinute(e.target.value)}
                      className={selectClass}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i * 5).padStart(2, '0')}>{i * 5}분</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={submitTime}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fcd34d] to-[#f9d976] flex items-center justify-center text-[#0a1230] shadow-[0_4px_20px_rgba(252,211,77,0.35)] hover:scale-105 transition-transform"
                    >
                      <ArrowIcon />
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {quickTimes.map(({ label, h, m: min }) => (
                      <button
                        key={label}
                        onClick={() => { setDraftHour(h); setDraftMinute(min); }}
                        className="px-[14px] py-2 rounded-full bg-[rgba(244,236,216,0.06)] border border-[rgba(244,236,216,0.2)] text-[#f4ecd8] text-[13px] hover:border-[#f9d976] hover:bg-[rgba(252,211,77,0.1)] transition-all"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {m.input === 'confirm' && (
                <div className="flex flex-wrap gap-2 mt-[14px]">
                  <button
                    onClick={() => setShowService(true)}
                    className="bg-gradient-to-br from-[#fcd34d] to-[#f9d976] text-[#0a1230] font-medium text-[14px] py-3 px-6 rounded-full border-0 cursor-pointer hover:-translate-y-0.5 transition-transform shadow-[0_4px_30px_rgba(252,211,77,0.4)]"
                  >
                    서비스 고르러 가기 →
                  </button>
                </div>
              )}
            </div>
          ))}

          {step === 0 && messages.length > 0 && messages[messages.length - 1].who === 'user' && (
            <div className="self-start max-w-[85%] px-5 py-[14px] rounded-[22px] bg-[rgba(244,236,216,0.08)] border border-[rgba(244,236,216,0.15)] backdrop-blur-md">
              <div className="chat-typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
