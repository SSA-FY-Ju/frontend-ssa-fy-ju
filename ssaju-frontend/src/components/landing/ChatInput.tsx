'use client';

/**\n * 파일 역할: 채팅형 입력 플로우에서 생년월일/시간을 수집하고 다음 단계(서비스 선택)로 전환합니다.\n */

import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import DatePickerField from './DatePickerField';
import TimePickerField from './TimePickerField';
import TypingIndicator from './TypingIndicator';
import ServiceSelect from './ServiceSelect';
import type { PageState } from './types';

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatInputProps {
  onStateChange: (state: PageState) => void;
}

export default function ChatInput({ onStateChange }: ChatInputProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [step, setStep] = useState<'initial' | 'date' | 'time' | 'complete' | 'service'>(
    'initial'
  );
  const [showTyping, setShowTyping] = useState(false);
  const [showServiceButton, setShowServiceButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setBirthDate: storeSetBirthDate, setBirthTime: storeSetBirthTime } = useSessionStore();

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showTyping]);

  // Initial bot messages sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // First message at 400ms
    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: '안녕하세요. 저는 SSAju예요. ✨',
            timestamp: new Date(),
          },
        ]);
      }, 400)
    );

    // Second message at 900ms
    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: '당신의 별자리를 함께 읽어보고 싶어요.',
            timestamp: new Date(),
          },
        ]);
      }, 900)
    );

    // Third message with date picker at 1400ms
    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: '먼저, 태어나신 날짜를 알려주실래요?',
            timestamp: new Date(),
          },
        ]);
        setStep('date');
      }, 1400)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const handleDateSubmit = (date: string) => {
    setBirthDate(date);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: formatDateKorean(date),
        timestamp: new Date(),
      },
    ]);

    // Show typing indicator
    setShowTyping(true);
    setTimeout(() => setShowTyping(false), 600);

    // Bot message after typing indicator
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: '좋아요. 이제 태어난 시간도 알려주세요.',
          timestamp: new Date(),
        },
      ]);
      setStep('time');
    }, 1500);
  };

  const handleTimeSubmit = (time: string) => {
    setBirthTime(time);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: time,
        timestamp: new Date(),
      },
    ]);

    // Show typing indicator
    setShowTyping(true);
    setTimeout(() => setShowTyping(false), 600);

    // Save to store
    setTimeout(() => {
      storeSetBirthDate(birthDate);
      storeSetBirthTime(time);

      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: '고마워요. 별을 펼쳐드릴게요. 🌌',
          timestamp: new Date(),
        },
      ]);

      // Show service button after 1.7s
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: '어떤 별자리부터 보여드릴까요?',
            timestamp: new Date(),
          },
        ]);
        setShowServiceButton(true);
        setStep('complete');
      }, 1700);
    }, 1500);
  };

  const handleGoToServices = () => {
    setStep('service');
  };

  const handleGoBack = () => {
    setMessages([]);
    setBirthDate('');
    setBirthTime('12:00');
    setShowTyping(false);
    setShowServiceButton(false);
    setStep('initial');
    onStateChange('landing');
  };

  if (step === 'service') {
    return <ServiceSelect birthDate={birthDate} birthTime={birthTime} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          ← 처음으로
        </button>
        <h1 className="text-white font-bold">SSAju 챗봇</h1>
        <div className="w-20" />
      </div>

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 message-container"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-sm px-4 py-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-gray-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {showTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-3 rounded-lg rounded-bl-none">
              <TypingIndicator />
            </div>
          </div>
        )}

        {showServiceButton && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleGoToServices}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              서비스 고르러 가기 →
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      {step === 'date' && <DatePickerField onSubmit={handleDateSubmit} />}
      {step === 'time' && <TimePickerField birthTime={birthTime} onChange={setBirthTime} onSubmit={handleTimeSubmit} />}
    </div>
  );
}

function formatDateKorean(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}
