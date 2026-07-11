'use client';

import ServiceSelect from '@/components/landing/ServiceSelect';

// 로그인 여부는 미들웨어(src/middleware.ts)가 서버에서 먼저 걸러낸다.
export default function SelectPage() {
  return <ServiceSelect />;
}
