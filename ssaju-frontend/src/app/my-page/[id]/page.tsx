'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fetchAnalysisRecord } from '@/lib/api/mypage';
import { CareerTimingResult } from '@/components/results/CareerTimingResult';
import type {
  AnalysisRecord,
  CareerTimingResult as CareerTimingResultType,
  ConsultationData,
  CompatibilityResult,
} from '@/types/api';

// Swiper 컴포넌트 — SSR 비활성화 (브라우저 전용)
const FullPageConsultation = dynamic(
  () => import('@/components/consultation/FullPageConsultation').then((m) => ({ default: m.FullPageConsultation })),
  { ssr: false }
);
const FullPageCompatibility = dynamic(
  () => import('@/components/compatibility/FullPageCompatibility').then((m) => ({ default: m.FullPageCompatibility })),
  { ssr: false }
);

/* ──────────────────────────────────────────────
   실제 API 응답 필드 추출
   SAJU                  → careerFortuneDetail
   CAREER_CONSULTATION   → consultationDetail
   COMPANY_COMPATIBILITY → compatibilityDetail
────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractData(rec: AnalysisRecord): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = rec as unknown as Record<string, any>;
  return raw.careerFortuneDetail ?? raw.consultationDetail ?? raw.compatibilityDetail ?? raw.data ?? null;
}

/* ──────────────────────────────────────────────
   상단 네비바
   헤더가 숨겨진 페이지이므로 화면 최상단에 배치
────────────────────────────────────────────── */
function DetailNav({ type: _type, onClick }: { type: string; onClick: () => void }) {
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

/* ──────────────────────────────────────────────
   로딩 스켈레톤
────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto px-4" style={{ paddingTop: '6rem' }}>
      <div className="h-52 rounded-2xl animate-pulse" style={{ background: 'rgba(139,92,246,0.08)' }} />
      <div className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   메인 페이지
────────────────────────────────────────────── */
export default function AnalysisDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const type = searchParams.get('type') ?? '';

  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultSectionIndex, setConsultSectionIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id || !type) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAnalysisRecord(id, type);
      console.log('[AnalysisDetail] raw record:', JSON.stringify(data, null, 2));
      setRecord(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '기록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id, type]);

  useEffect(() => { load(); }, [load]);

  const goBack = useCallback(() => router.push('/my-page'), [router]);

  /* ── 로딩 ── */
  if (isLoading) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'rgba(4,2,18,1)' }}>
        <Skeleton />
      </div>
    );
  }

  /* ── 에러 ── */
  if (error) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'rgba(4,2,18,1)' }}>
        <DetailNav type={type} onClick={goBack} />
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
          <button
            onClick={load}
            className="text-sm px-5 py-2 rounded-xl"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#a78bfa',
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!record) return null;

  const analysisData = extractData(record);

  if (!analysisData) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'rgba(4,2,18,1)' }}>
        <DetailNav type={type} onClick={goBack} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 120 }}>
          분석 데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  /* ── 관운 분석 — career-timing 페이지와 동일 ── */
  if (type === 'TIMING') {
    return (
      <main className="relative z-10 min-h-screen text-white">
        <DetailNav type={type} onClick={goBack} />
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-lg">
            <CareerTimingResult result={analysisData as CareerTimingResultType} />
          </div>
        </div>
      </main>
    );
  }

  /* ── AI 커리어 컨설팅 — consultation 페이지와 동일 ── */
  if (type === 'CONSULTATION') {
    return (
      <main className="relative z-10 min-h-screen text-white">
        <DetailNav type={type} onClick={goBack} />
        <FullPageConsultation
          data={analysisData as ConsultationData}
          currentSectionIndex={consultSectionIndex}
          onSectionChange={setConsultSectionIndex}
        />
      </main>
    );
  }

  /* ── 기업 궁합 — compatibility 페이지와 동일 ── */
  if (type === 'COMPATIBILITY') {
    const companyName = (analysisData as CompatibilityResult).requestContext?.companyName ?? '';
    return (
      <main className="relative z-10 text-white" style={{ height: '100vh', overflow: 'hidden' }}>
        <DetailNav type={type} onClick={goBack} />
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
