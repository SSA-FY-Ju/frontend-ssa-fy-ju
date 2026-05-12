/**
 * errorStore 테스트
 *
 * 커버리지 대상: src/stores/errorStore.ts (0% → 100%)
 */

import { useErrorStore } from '@/stores/errorStore';
import type { GlobalError, Toast } from '@/stores/errorStore';

describe('errorStore', () => {
  beforeEach(() => {
    useErrorStore.getState().reset();
  });

  // ─── 초기 상태 ───────────────────────────────────────────────

  it('초기 상태: globalError null, toastQueue 빈 배열, isLoading false', () => {
    const state = useErrorStore.getState();
    expect(state.globalError).toBeNull();
    expect(state.toastQueue).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  // ─── setGlobalError ───────────────────────────────────────────

  it('setGlobalError로 에러 설정', () => {
    const error: GlobalError = {
      code: 'FASTAPI_TIMEOUT',
      message: '타임아웃 오류',
      timestamp: Date.now(),
    };

    useErrorStore.getState().setGlobalError(error);

    expect(useErrorStore.getState().globalError).toEqual(error);
  });

  it('setGlobalError(null)로 에러 초기화', () => {
    useErrorStore.getState().setGlobalError({
      code: 'ERR',
      message: '오류',
      timestamp: Date.now(),
    });
    useErrorStore.getState().setGlobalError(null);

    expect(useErrorStore.getState().globalError).toBeNull();
  });

  it('context 포함한 GlobalError 설정', () => {
    const error: GlobalError = {
      code: 'API_ERROR',
      message: '서버 오류',
      timestamp: 1700000000000,
      context: { endpoint: '/api/career/timing', attempt: 3 },
    };

    useErrorStore.getState().setGlobalError(error);

    expect(useErrorStore.getState().globalError?.context).toEqual({
      endpoint: '/api/career/timing',
      attempt: 3,
    });
  });

  // ─── clearGlobalError ────────────────────────────────────────

  it('clearGlobalError로 에러 삭제', () => {
    useErrorStore.getState().setGlobalError({
      code: 'ERR',
      message: '오류',
      timestamp: Date.now(),
    });

    useErrorStore.getState().clearGlobalError();

    expect(useErrorStore.getState().globalError).toBeNull();
  });

  // ─── addToast ─────────────────────────────────────────────────

  it('addToast로 토스트 추가', () => {
    const toast: Toast = {
      id: 'toast-001',
      type: 'success',
      message: '저장 완료',
      timestamp: Date.now(),
    };

    useErrorStore.getState().addToast(toast);

    const queue = useErrorStore.getState().toastQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual(toast);
  });

  it('여러 토스트 순서대로 추가', () => {
    const toasts: Toast[] = [
      { id: 't1', type: 'success', message: '성공', timestamp: 1 },
      { id: 't2', type: 'error', message: '실패', timestamp: 2 },
      { id: 't3', type: 'warning', message: '경고', timestamp: 3 },
    ];

    toasts.forEach((t) => useErrorStore.getState().addToast(t));

    const queue = useErrorStore.getState().toastQueue;
    expect(queue).toHaveLength(3);
    expect(queue.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });

  // ─── removeToast ─────────────────────────────────────────────

  it('removeToast로 특정 id 토스트 제거', () => {
    useErrorStore.getState().addToast({ id: 't1', type: 'info', message: '1', timestamp: 1 });
    useErrorStore.getState().addToast({ id: 't2', type: 'info', message: '2', timestamp: 2 });

    useErrorStore.getState().removeToast('t1');

    const queue = useErrorStore.getState().toastQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('t2');
  });

  it('존재하지 않는 id 제거 시 기존 토스트 유지', () => {
    useErrorStore.getState().addToast({ id: 't1', type: 'info', message: '1', timestamp: 1 });

    useErrorStore.getState().removeToast('non-existent');

    expect(useErrorStore.getState().toastQueue).toHaveLength(1);
  });

  // ─── clearToasts ─────────────────────────────────────────────

  it('clearToasts로 모든 토스트 제거', () => {
    useErrorStore.getState().addToast({ id: 't1', type: 'success', message: '1', timestamp: 1 });
    useErrorStore.getState().addToast({ id: 't2', type: 'error', message: '2', timestamp: 2 });

    useErrorStore.getState().clearToasts();

    expect(useErrorStore.getState().toastQueue).toEqual([]);
  });

  // ─── setIsLoading ─────────────────────────────────────────────

  it('setIsLoading(true)로 로딩 상태 설정', () => {
    useErrorStore.getState().setIsLoading(true);
    expect(useErrorStore.getState().isLoading).toBe(true);
  });

  it('setIsLoading(false)로 로딩 상태 해제', () => {
    useErrorStore.getState().setIsLoading(true);
    useErrorStore.getState().setIsLoading(false);
    expect(useErrorStore.getState().isLoading).toBe(false);
  });

  // ─── reset ───────────────────────────────────────────────────

  it('reset으로 전체 상태 초기화', () => {
    useErrorStore.getState().setGlobalError({ code: 'ERR', message: '오류', timestamp: 1 });
    useErrorStore.getState().addToast({ id: 't1', type: 'error', message: '1', timestamp: 1 });
    useErrorStore.getState().setIsLoading(true);

    useErrorStore.getState().reset();

    const state = useErrorStore.getState();
    expect(state.globalError).toBeNull();
    expect(state.toastQueue).toEqual([]);
    expect(state.isLoading).toBe(false);
  });
});
