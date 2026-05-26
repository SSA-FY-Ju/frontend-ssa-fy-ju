'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useHistoryDetail } from '@/hooks/useHistoryDetail';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import type {
  AnalysisRecord,
  CareerTimingResult as CareerTimingResultType,
  ConsultationData,
  CompatibilityResult,
} from '@/types/api';

const FullPageConsultation = dynamic(
  () => import('@/components/consultation/FullPageConsultation').then((m) => ({ default: m.FullPageConsultation })),
  { ssr: false }
);
const FullPageCompatibility = dynamic(
  () => import('@/components/compatibility/FullPageCompatibility').then((m) => ({ default: m.FullPageCompatibility })),
  { ssr: false }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractData(rec: AnalysisRecord): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = rec as unknown as Record<string, any>;
  return raw.careerFortuneDetail ?? raw.consultationDetail ?? raw.compatibilityDetail ?? raw.data ?? null;
}

function DetailNav({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed z-50 flex items-center gap-1.5 transition-all active:scale-95"
      style={{
        top: '1.25rem',
        left: '1.25rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        padding: '0.5rem 0.875rem 0.5rem 0.625rem',
        color: 'rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.07) 100%)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      기록으로
    </button>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">

      {/* 궤도 애니메이션 */}
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* 바깥 궤도 링 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.18)',
        }} />
        {/* 바깥 궤도 도는 점 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          animation: 'sk-rotate 3.5s linear infinite',
        }}>
          <span style={{
            position: 'absolute',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'rgba(196,181,253,0.9)',
            boxShadow: '0 0 12px rgba(167,139,250,0.9), 0 0 24px rgba(139,92,246,0.5)',
            display: 'block',
          }} />
        </div>

        {/* 안쪽 궤도 링 */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 28,
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.13)',
        }} />
        {/* 안쪽 궤도 도는 점 (역방향) */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          inset: 28,
          borderRadius: '50%',
          animation: 'sk-rotate 2.2s linear infinite reverse',
        }}>
          <span style={{
            position: 'absolute',
            top: -3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(167,139,250,0.75)',
            boxShadow: '0 0 8px rgba(139,92,246,0.7)',
            display: 'block',
          }} />
        </div>

        {/* 중앙 성운 글로우 + 심볼 */}
        <div aria-hidden="true" style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(109,40,217,0.1) 55%, transparent 75%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'sk-nebula 3s ease-in-out infinite',
        }}>
          <span style={{
            fontSize: 16,
            color: 'rgba(196,181,253,0.95)',
            textShadow: '0 0 14px rgba(167,139,250,0.9), 0 0 28px rgba(139,92,246,0.4)',
            animation: 'sk-star 3s ease-in-out infinite',
          }}>✦</span>
        </div>
      </div>

      {/* 텍스트 */}
      <p style={{ fontSize: 14, color: 'rgba(196,181,253,0.55)', letterSpacing: '0.06em', fontWeight: 500 }}>
        기록을 불러오는 중
      </p>

      <style>{`
        @keyframes sk-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sk-nebula {
          0%, 100% { transform: scale(0.92); opacity: 0.7; }
          50%       { transform: scale(1.12); opacity: 1; }
        }
        @keyframes sk-star {
          0%, 100% { opacity: 0.6; transform: scale(0.9) rotate(0deg); }
          50%       { opacity: 1;   transform: scale(1.1) rotate(20deg); }
        }
      `}</style>
    </div>
  );
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const type = searchParams.get('type') ?? '';

  const { record, isLoading, error } = useHistoryDetail(id, type);
  const [consultSectionIndex, setConsultSectionIndex] = useState(0);

  const goBack = () => router.push('/my-page');

  if (isLoading) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'rgba(4,2,18,1)' }}>
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'rgba(4,2,18,1)' }}>
        <DetailNav onClick={goBack} />
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-4" style={{ paddingTop: '5rem' }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}
          >✕</div>
          <p style={{ fontSize: 14, color: 'rgba(248,113,113,0.8)', textAlign: 'center' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!record) return null;

  const analysisData = extractData(record);

  if (!analysisData) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'rgba(4,2,18,1)' }}>
        <DetailNav onClick={goBack} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 120 }}>
          분석 데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  if (type === 'TIMING') {
    return (
      <main className="relative z-10 min-h-screen text-white">
        <DetailNav onClick={goBack} />
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-lg">
            <CareerTimingResult result={analysisData as CareerTimingResultType} />
          </div>
        </div>
      </main>
    );
  }

  if (type === 'CONSULTATION') {
    return (
      <main className="relative z-10 min-h-screen text-white">
        <DetailNav onClick={goBack} />
        <FullPageConsultation
          data={analysisData as ConsultationData}
          currentSectionIndex={consultSectionIndex}
          onSectionChange={setConsultSectionIndex}
        />
      </main>
    );
  }

  if (type === 'COMPATIBILITY') {
    const companyName = (analysisData as CompatibilityResult).requestContext?.companyName ?? '';
    return (
      <main className="relative z-10 text-white" style={{ height: '100vh', overflow: 'hidden' }}>
        <DetailNav onClick={goBack} />
        <FullPageCompatibility
          result={analysisData as CompatibilityResult}
          companyName={companyName}
          hasFeedback={true}
          onFeedbackOpen={() => {}}
        />
      </main>
    );
  }

  return null;
}
