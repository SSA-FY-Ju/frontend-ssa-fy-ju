'use client';

interface Page5Props {
  onStart: () => void;
}

export default function Page5({ onStart }: Page5Props) {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="text-sm text-blue-300 mb-6 tracking-widest animate-fade-in">이제, 시작합니다</div>
        <h2 className="text-5xl font-bold text-white mb-7 animate-fade-in" style={{animationDelay: '0.1s'}}>
          당신의 별,<br/>
          <em className="not-italic">읽어드릴게요.</em>
        </h2>
        <p className="text-lg animate-fade-in mb-12" style={{animationDelay: '0.2s', fontSize: '17px', marginBottom: '48px', color: 'rgba(244,236,216,0.75)'}}>
          생년월일과 태어난 시간만 알려주세요.<br/>
          나머지는 별이 말해줄 거예요.
        </p>
        <button
          onClick={onStart}
          className="px-9 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 animate-fade-in"
          style={{animationDelay: '0.3s', fontSize: '16px', padding: '16px 36px'}}
        >
          내 별자리 보러 가기 →
        </button>
        <p className="animate-fade-in mt-5" style={{animationDelay: '0.4s', fontSize: '12px', color: 'rgba(244,236,216,0.4)', letterSpacing: '0.1em'}}>
          평균 소요 시간 약 3분 · 입력값은 저장되지 않아요
        </p>
      </div>
    </div>
  );
}
