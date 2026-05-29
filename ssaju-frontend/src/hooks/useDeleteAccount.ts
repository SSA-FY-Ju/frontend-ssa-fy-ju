'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccount as deleteAccountApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { ApiError } from '@/lib/api/client';

interface UseDeleteAccountReturn {
  password: string;
  setPassword: (v: string) => void;
  isDeleting: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

export function useDeleteAccount(): UseDeleteAccountReturn {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAccountApi(password);

      // 모든 클라이언트 상태 초기화
      useAuthStore.getState().reset();
      useAnalysisStore.getState().reset();
      useConsultationStore.getState().clearData();
      useSessionStore.getState().reset();

      router.push('/');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setError('비밀번호가 올바르지 않습니다.');
      } else {
        setError('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return { password, setPassword, isDeleting, error, submit };
}
