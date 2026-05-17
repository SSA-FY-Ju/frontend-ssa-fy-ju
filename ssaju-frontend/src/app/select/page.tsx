'use client';

import { useRouter } from 'next/navigation';
import ServiceSelect from '@/components/landing/ServiceSelect';

export default function SelectPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <ServiceSelect
      birthDate=""
      birthTime=""
      onGoBack={handleGoBack}
    />
  );
}
