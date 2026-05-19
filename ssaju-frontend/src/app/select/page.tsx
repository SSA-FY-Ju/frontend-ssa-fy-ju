'use client';

import ServiceSelect from '@/components/landing/ServiceSelect';
import { useSessionStore } from '@/stores/sessionStore';
import { useRouteGuard } from '@/hooks/useRouteGuard';

export default function SelectPage() {
  useRouteGuard(true);

  const birthDate = useSessionStore((s) => s.birthDate) ?? '';
  const birthTime = useSessionStore((s) => s.birthTime) ?? '';

  return <ServiceSelect birthDate={birthDate} birthTime={birthTime} />;
}
