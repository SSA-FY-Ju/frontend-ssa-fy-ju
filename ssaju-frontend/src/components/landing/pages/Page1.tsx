'use client';

export default function Page1() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <div className="text-sm text-blue-300 mb-6 tracking-widest animate-fade-in">
          SSAju · 별이 빛나는 밤, 당신의 길을 묻다
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in" style={{animationDelay: '0.1s'}}>
          취업 고민,<br />
          <em className="not-italic">많으시죠?</em>
        </h1>

        <p className="text-lg text-gray-300 mb-16 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s', fontSize: '18px', color: 'rgba(244,236,216,0.75)'}}>
          이력서를 다섯 번째 고치고,<br />
          밤하늘을 올려다본 적 있으신가요.
        </p>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
        <p className="mb-2">다음 페이지</p>
        <div className="arrow animate-bounce"></div>
      </div>
    </div>
  );
}
