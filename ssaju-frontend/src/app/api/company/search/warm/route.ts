import { NextRequest, NextResponse } from 'next/server';
import { POPULAR_COMPANY_QUERIES, searchCorpNames } from '@/lib/server/company-search';

// 외부 API 를 여러 번 부르므로 기본 실행 제한보다 넉넉하게 둔다
export const maxDuration = 60;

/** 한 번에 외부 API 로 보내는 요청 수 — 공공 API 에 몰아서 부담을 주지 않을 만큼만 묶는다 */
const BATCH_SIZE = 5;

/**
 * 자주 찾는 기업의 검색 결과를 데이터 캐시에 미리 채운다. Vercel Cron 이 하루 한 번 호출한다.
 * Vercel 은 CRON_SECRET 환경 변수가 있으면 cron 요청에 그 값을 Bearer 토큰으로 실어 보낸다.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let warmed = 0;
  let failed = 0;
  for (let i = 0; i < POPULAR_COMPANY_QUERIES.length; i += BATCH_SIZE) {
    const batch = POPULAR_COMPANY_QUERIES.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((q) => searchCorpNames(q)));
    warmed += results.filter((r) => r.status === 'fulfilled').length;
    failed += results.filter((r) => r.status === 'rejected').length;
  }

  return NextResponse.json({ warmed, failed });
}
