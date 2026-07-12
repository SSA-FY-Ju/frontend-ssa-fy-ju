/**
 * DeleteConfirmModal Props (T106)
 *
 * - recordId: 삭제 대상 ID (null이면 렌더링 안 함)
 * - onConfirm: 삭제 확인
 * - onClose: 모달 닫기
 * - isDeleting: 삭제 진행 중 여부
 */
export interface DeleteConfirmModalProps {
  recordId: string | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
  isDeleting: boolean;
}
