import { unstable_cache } from 'next/cache';
import { aliasTermsFor, parseCorpItems, rankCompanies, type CorpItem } from './company-search-parse';

/**
 * 기업명 검색 — 금융위원회 기업기본정보 API (XML 응답 파싱)
 *
 * 검색 API 와 캐시 미리 채우기 API 가 같은 캐시를 쓰도록 서버 로직을 한곳에 둔다.
 */

// 장애 주입 테스트에서 로컬 대역 서버로 바꿔 끼울 수 있도록 환경 변수로 덮어쓸 수 있게 둔다
const FSC_BASE_URL =
  process.env.FSC_BASE_URL ??
  'https://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getCorpOutline_V2';

// 한 법인이 시점별로 여러 줄 오고 큰 회사가 앞쪽에 있다는 보장도 없어서, 20줄로는 중복을 빼면 4~6개만
// 남고 현대자동차·LG전자 같은 대표 기업이 빠졌다. 100줄을 받아 정렬한다.
const FETCH_ROWS = 100;

// 외부 API 대기 상한 - 관측한 정상 응답 최댓값의 1.5배로 정한다. 20줄일 때는 최댓값 2.6초로 4초였는데,
// 100줄로 바꾸자 응답이 느려져 47건 중 최댓값이 3.9초가 됐다. 4초면 정상 요청이 잘릴 수 있어 같은
// 기준으로 다시 정했다. 16초대로 관측된 이상 지연은 여전히 끊는다.
const UPSTREAM_TIMEOUT_MS = 6000;

// 기업명은 자주 바뀌지 않는다. 캐시 미리 채우기가 하루 한 번 돌기 때문에 만료도 하루로 맞춘다 -
// 만료가 더 짧으면 미리 채운 뒤 그 시간이 지나면 첫 검색이 다시 외부 API 를 기다린다.
// 데이터 캐시는 서버 인스턴스끼리 공유되고, 만료된 검색어는 갱신을 시도하되 외부 API 가 느리거나
// 실패하면 대기 상한까지 기다린 뒤 예전 결과를 그대로 돌려준다.
const CACHE_REVALIDATE_SECONDS = 24 * 60 * 60;

// 외부 API 장애가 이어지면 검색마다 대기 상한만큼 기다리며 외부 호출을 계속하게 된다. 연속으로 실패하면
// 잠시 호출을 멈추고 바로 실패를 알린다. 서버 인스턴스마다 따로 동작하는 단순한 형태다.
const BREAKER_FAILURE_THRESHOLD = 3;
const BREAKER_OPEN_MS = 30_000;
const breaker = { failures: 0, openUntil: 0 };

/**
 * 사람들이 자주 찾는 기업 — 데이터 캐시를 미리 채워 첫 검색부터 외부 API 를 기다리지 않게 한다.
 * 브랜드명은 별칭표로 법인명 검색까지 함께 채워진다. 실제 API 로 모두 결과가 나오는 것을 확인했다.
 */
export const POPULAR_COMPANY_QUERIES = [
  '삼성', '삼성전자', '현대', '현대자동차', 'LG', 'LG전자', 'SK', 'SK하이닉스', '카카오', '네이버',
  '쿠팡', '신한', '국민', '우리', '하나', '농협', '토스', '배달의민족', '셀트리온', '한화',
  '롯데', '포스코', 'CJ', 'KT', '두산', '기아', '현대모비스', '삼성SDI', '삼성바이오로직스', '삼성생명',
  '삼성화재', 'LG화학', 'LG에너지솔루션', 'LG유플러스', 'SK텔레콤', 'SK이노베이션', '카카오뱅크', '케이뱅크', '기업은행', '미래에셋',
  '한국투자', 'NH투자증권', 'KB', '하이브', '엔씨소프트', '넷마블', '대한항공', '한국전력', '아모레퍼시픽', 'HD현대',
];

/** 'UNAVAILABLE' 은 연속 장애로 외부 호출을 잠시 멈춘 상태 */
export type CompanySearchErrorCode = 'TIMEOUT' | 'UPSTREAM_ERROR' | 'UNAVAILABLE';

export class CompanySearchError extends Error {
  constructor(public readonly code: CompanySearchErrorCode) {
    super(code);
    this.name = 'CompanySearchError';
  }
}

async function withBreaker<T>(call: () => Promise<T>): Promise<T> {
  if (Date.now() < breaker.openUntil) throw new CompanySearchError('UNAVAILABLE');
  // 멈춘 시간이 지난 뒤의 첫 시도 - 실패하면 바로 다시 멈춘다
  const isTrial = breaker.openUntil !== 0;
  try {
    const result = await call();
    breaker.failures = 0;
    breaker.openUntil = 0;
    return result;
  } catch (e) {
    if (isTrial || ++breaker.failures >= BREAKER_FAILURE_THRESHOLD) {
      breaker.openUntil = Date.now() + BREAKER_OPEN_MS;
      breaker.failures = 0;
    }
    throw e;
  }
}

async function requestCorpItems(term: string): Promise<CorpItem[]> {
  const url = new URL(FSC_BASE_URL);
  url.searchParams.set('serviceKey', process.env.FSC_API_KEY ?? '');
  url.searchParams.set('corpNm', term);
  url.searchParams.set('numOfRows', String(FETCH_ROWS));
  url.searchParams.set('pageNo', '1');

  let xml: string;
  try {
    // 응답 헤더가 오는 시점이 아니라 본문을 다 받을 때까지를 한 신호로 묶어야 본문이 느린 경우도 끊긴다
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) throw new CompanySearchError('UPSTREAM_ERROR');
    xml = await res.text();
  } catch (e) {
    if (e instanceof CompanySearchError) throw e;
    throw new CompanySearchError(e instanceof Error && e.name === 'TimeoutError' ? 'TIMEOUT' : 'UPSTREAM_ERROR');
  }

  // 외부 API 가 HTTP 200 에 오류 코드를 담아 보내는 경우 - 정상 0건과 구분해 오류로 다룬다.
  // 공공데이터 API 는 결과가 없을 때 03(NODATA)을 쓰기도 하므로 그건 빈 결과로 본다 -
  // 오류로 보면 결과 없는 정상 검색이 장애로 안내되고 서킷 브레이커까지 열린다.
  const resultCode = xml.match(/<resultCode>([^<]*)<\/resultCode>/)?.[1];
  if (resultCode === '03') return [];
  if (resultCode && resultCode !== '00') throw new CompanySearchError('UPSTREAM_ERROR');

  return parseCorpItems(xml);
}

/** 검색어 하나의 결과를 캐시를 거쳐 가져온다. 실패는 예외로 던지므로 캐시에 남지 않는다. */
const cachedCorpItems = unstable_cache(
  (term: string) => withBreaker(() => requestCorpItems(term)),
  ['company-search-items'],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

/**
 * 검색어와 그 별칭을 함께 찾아 자동완성 순서로 정렬해 돌려준다.
 * 별칭 쪽만 성공해도 결과를 보여주고, 모두 실패했을 때만 실패로 본다.
 */
export async function searchCorpNames(query: string): Promise<{ corpName: string }[]> {
  const aliases = aliasTermsFor(query);
  const settled = await Promise.allSettled([query, ...aliases].map((term) => cachedCorpItems(term)));
  const fulfilled = settled.filter((r): r is PromiseFulfilledResult<CorpItem[]> => r.status === 'fulfilled');
  if (fulfilled.length === 0) throw (settled[0] as PromiseRejectedResult).reason;
  return rankCompanies(fulfilled.flatMap((r) => r.value), query, aliases).map((corpName) => ({ corpName }));
}
