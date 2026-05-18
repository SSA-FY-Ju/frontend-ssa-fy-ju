'use client';

import ServiceSelect from '@/components/landing/ServiceSelect';
import { useSessionStore } from '@/stores/sessionStore';

export default function SelectPage() {
  const birthDate = useSessionStore((s) => s.birthDate) ?? '';
  const birthTime = useSessionStore((s) => s.birthTime) ?? '';

  return <ServiceSelect birthDate={birthDate} birthTime={birthTime} />;
}
