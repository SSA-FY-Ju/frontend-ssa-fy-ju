'use client';

const worries = [
  { t: '"언제 지원하면 될까요?"', s: '상반기? 하반기?' },
  { t: '"저는 어떤 직무가 맞을까요?"', s: '자기소개서 앞에서 멈춰버린 마음' },
  { t: '"이 회사, 정말 저랑 맞나요?"', s: '면접 합격 후에도 드는 의문' },
  { t: '"나는 무엇으로 어필해야 하죠?"', s: '강점 한 줄이 떠오르지 않는 밤' },
];

export default function Page2() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <h2 className="text-4xl font-bold text-white text-center mb-2 animate-fade-in">
          누구나 한 번쯤
          <br />
          <em className="not-italic">물어봤던 질문들</em>
        </h2>
        <p
          className="text-center mb-12 animate-fade-in text-gray-400"
          style={{ animationDelay: '0.1s', fontSize: '16px', color: 'rgba(244,236,216,0.65)' }}
        >
          취준생 10명 중 9명이 같은 고민을 합니다.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-5">
          {worries.map((w, i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{
                animationDelay: `${0.1 + i * 0.1}s`,
                padding: '24px 26px',
                borderRadius: '16px',
                background: 'rgba(13, 27, 61, 0.45)',
                border: '1px solid rgba(244, 236, 216, 0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  marginBottom: '10px',
                  lineHeight: 1.5,
                  color: 'white',
                }}
              >
                {w.t}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(244,236,216,0.55)' }}>{w.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
