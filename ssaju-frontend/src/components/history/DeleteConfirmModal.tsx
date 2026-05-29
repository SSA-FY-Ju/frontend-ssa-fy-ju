'use client';

import { BaseModal } from '@/components/common/BaseModal';

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
    <BaseModal
      onClose={onClose}
      maxWidth={320}
      accentBar={false}
      backdropStyle={{ background: 'rgba(4,2,18,0.78)' }}
      containerStyle={{
        background: 'linear-gradient(135deg, rgba(30,20,60,0.85) 0%, rgba(15,10,35,0.9) 100%)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        padding: '28px',
      }}
      containerClassName="mx-4"
    >
        <h2 className="text-white text-base font-bold mb-2 text-center">기록 삭제</h2>
        <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: 'rgba(148,163,184,0.6)' }}>
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
            className="flex-1 py-2.5 text-sm rounded-xl transition-all disabled:opacity-50"
            style={{
              border: '1px solid rgba(139,92,246,0.25)',
              color: 'rgba(196,181,253,0.7)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            취소
          </button>

          {/* 삭제 확인 */}
          <button
            type="button"
            onClick={() => onConfirm(recordId)}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
    </BaseModal>
  );
}
