'use client';

import ServiceSelect from '@/components/landing/ServiceSelect';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function SelectPage() {
  const { isAllowed } = useAuthGuard(true);

  if (!isAllowed) return null;
  return <ServiceSelect />;
}
