'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SurveyPage() {
  const router = useRouter();
  const [satisfaction, setSatisfaction] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // POST to API
    console.log('Feedback submitted:', { satisfaction, feedback });
    setSubmitted(true);

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-4xl font-bold text-white mb-4">감사합니다!</h1>
          <p className="text-lg text-gray-300">
            소중한 피드백이 SSAju를 더 좋게 만드는데 도움이 됩니다.
          </p>
          <p className="text-sm text-gray-500 mt-6">
            곧 홈으로 돌아갑니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3 animate-fade-in">
            분석 결과는 만족하셨나요?
          </h1>
          <p className="text-gray-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            더 나은 서비스를 위한 피드백을 남겨주세요.
          </p>
        </div>

        {/* Satisfaction Score */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-center text-white font-semibold mb-6">
            만족도: <span className="text-blue-400 text-2xl">{satisfaction}/10</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={satisfaction}
            onChange={(e) => setSatisfaction(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{ accentColor: '#3b82f6' }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>매우 불만족</span>
            <span>매우 만족</span>
          </div>
        </div>

        {/* Feedback Text */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <label className="block text-white font-semibold mb-3">
            개선할 점이나 추가 의견
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="분석 결과가 어떤 점이 도움이 되었는지, 어떤 부분을 개선하면 좋을지 알려주세요."
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:outline-none resize-none"
            rows={5}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          피드백 제출하기
        </button>

        {/* Skip Button */}
        <button
          onClick={() => router.push('/')}
          className="w-full px-6 py-2 mt-3 text-gray-400 hover:text-gray-300 transition-colors"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
