'use client';

/**
 * 삭제 확인 모달 컴포넌트 (T106)
 *
 * Props:
 * - recordId: 삭제 대상 ID (null이면 렌더링 안 함)
 * - onConfirm: 삭제 확인
 * - onClose: 모달 닫기
 * - isDeleting: 삭제 진행 중 여부
 */

interface DeleteConfirmModalProps {
  recordId: string | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  recordId,
  onConfirm,
  onClose,
  isDeleting,
}: DeleteConfirmModalProps) {
  // recordId가 null이면 렌더링 안 함
  if (!recordId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="삭제 확인"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 본체 */}
      <div className="relative bg-night-800 border border-night-700 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl">
        <h2 className="text-white text-lg font-bold mb-3 text-center">기록 삭제</h2>
        <p className="text-night-600 text-sm text-center mb-8 leading-relaxed">
          정말 삭제하시겠습니까?
          <br />
          삭제된 기록은 복구할 수 없습니다.
        </p>

        <div className="flex gap-3">
          {/* 취소 */}
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 border border-night-600 text-gray-300 text-sm rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50"
          >
            취소
          </button>

          {/* 삭제 확인 */}
          <button
            type="button"
            onClick={() => onConfirm(recordId)}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
