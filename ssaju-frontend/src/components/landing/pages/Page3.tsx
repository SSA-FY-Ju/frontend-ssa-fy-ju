'use client';

/**\n * 파일 역할: 랜딩 스토리 3페이지(브랜드 약속/가치 제안)를 렌더합니다.\n */

export default function Page3() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="text-sm text-blue-300 mb-7 tracking-widest animate-fade-in">저희의 약속</div>
        <h2 className="text-5xl font-bold text-white mb-9 animate-fade-in" style={{animationDelay: '0.1s'}}>
          저희가<br/>
          <em className="not-italic">풀어드릴게요.</em>
        </h2>
        <p className="text-lg leading-relaxed animate-fade-in text-white" style={{animationDelay: '0.2s', fontSize: '19px', lineHeight: '1.8', color: 'rgba(244,236,216,0.85)'}}>
          천 년 동안 별을 읽어온 사주 명리학과<br/>
          오늘의 AI가 당신의 커리어 지도를 함께 그립니다.
        </p>
        <p className="animate-fade-in mt-9" style={{animationDelay: '0.3s', fontStyle: 'italic', fontSize: '16px', color: '#a5b4fc'}}>
          "별을 보지 않고 길을 떠나지 마세요."
        </p>
      </div>
    </div>
  );
}
