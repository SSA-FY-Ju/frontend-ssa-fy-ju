'use client';

const services = [
  { num: '01', t: '관운 분석', s: '상반기·하반기, 언제가 좋을까?', d: 'Career Timing' },
  { num: '02', t: 'AI 커리어 컨설팅', s: '19개 항목으로 풀어내는 나만의 지도', d: 'Consultation' },
  { num: '03', t: '기업 궁합 분석', s: '저 회사, 정말 나랑 맞을까?', d: 'Compatibility' },
  { num: '04', t: '만족도 피드백', s: '결과를 더 정교하게 다듬어요', d: 'Feedback' }
];

export default function Page4() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <h2 className="text-4xl font-bold text-white text-center mb-3 animate-fade-in">
          네 가지 별자리,<br/>
          <em className="not-italic">네 가지 답</em>
        </h2>
        <p className="text-center mb-11 animate-fade-in text-gray-400" style={{animationDelay: '0.1s', fontSize: '16px', color: 'rgba(244,236,216,0.65)'}}>
          취준생·이직자에게 꼭 필요한 네 개의 분석.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <div key={i} className="animate-fade-in" style={{animationDelay: `${0.1 + i*0.1}s`, padding: '24px 22px', borderRadius: '14px', background: 'rgba(13, 27, 61, 0.4)', border: '1px solid rgba(244, 236, 216, 0.1)', backdropFilter: 'blur(8px)', minHeight: '170px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{ fontStyle: 'italic', fontSize: '22px', color: '#a5b4fc' }}>{s.num}</div>
              <div style={{ fontSize: '19px', fontWeight: 600, color: 'white' }}>{s.t}</div>
              <div style={{ fontSize: '13px', color: 'rgba(244,236,216,0.65)', flex: 1 }}>{s.s}</div>
              <div style={{ fontStyle: 'italic', fontSize: '12px', color: 'rgba(165,180,252,0.7)' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
