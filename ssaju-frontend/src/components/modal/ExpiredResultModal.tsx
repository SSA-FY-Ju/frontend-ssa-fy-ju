'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * 분석 결과 만료 모달
 *
 * 용도:
 * - 복사해둔 /result/* URL이 백엔드에서 만료된 경우 표시
 * - 사용자에게 친화적인 UI로 새 분석 시작 유도
 *
 * 동작:
 * - isOpen=true일 때 모달 표시
 * - "새 분석 시작" 버튼 클릭 시 /survey로 이동
 *
 * 사용 예:
 * ```typescript
 * const [showExpired, setShowExpired] = useState(false);
 *
 * useEffect(() => {
 *   fetchResult().catch((err) => {
 *     if (err.status === 404) {
 *       setShowExpired(true);
 *     }
 *   });
 * }, []);
 *
 * return (
 *   <>
 *     <YourContent />
 *     <ExpiredResultModal isOpen={showExpired} onClose={() => setShowExpired(false)} />
 *   </>
 * );
 * ```
 */
export function ExpiredResultModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Hydration 오류 방지: 클라이언트 마운트 후에만 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartNew = () => {
    router.push('/survey');
    onClose();
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <>
      {/* 백그라운드 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* 모달 콘텐츠 */}
        <div
          className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 경고 아이콘 */}
          <div className="text-5xl text-yellow-500 mb-4 text-center">⚠️</div>

          {/* 제목 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            분석 결과가 만료되었습니다
          </h2>

          {/* 설명 */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            24시간 후 자동 삭제되는 임시 결과입니다. 새로운 분석을 시작해주세요.
          </p>

          {/* 버튼 */}
          <button
            onClick={handleStartNew}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            새 분석 시작
          </button>

          {/* 선택적: 닫기 링크 */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 모달 페이드인 애니메이션 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
