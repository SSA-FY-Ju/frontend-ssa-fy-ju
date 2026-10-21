/**
 * 금융위 기업기본정보 API 응답을 해석하고 자동완성에 맞게 정렬하는 순수 함수 모음.
 * Next.js 런타임에 의존하지 않아 단위 테스트할 수 있다.
 */

export interface CorpItem {
  corpName: string;
  /** 유가증권·코스닥 등에 상장된 법인인지 */
  listed: boolean;
}

/**
 * 사람들이 흔히 쓰는 이름 → 금융위 등기상 법인명 검색어.
 *
 * 금융위 API 는 법인명으로만 검색되어 "SK하이닉스"처럼 브랜드명이나 영문 약칭으로 찾으면 결과가 없다.
 * 검색어만 바꿔서 묻기 때문에 화면에 보이는 이름은 여전히 금융위 법인명이고, 백엔드와 기업명이
 * 어긋나지 않는다. 실제 API 로 대상 법인이 나오는 것을 확인한 항목만 둔다.
 */
export const COMPANY_ALIASES: Record<string, string[]> = {
  SK하이닉스: ['에스케이하이닉스'],
  하이닉스: ['에스케이하이닉스'],
  배달의민족: ['우아한형제들'],
  배민: ['우아한형제들'],
  NH투자증권: ['엔에이치투자증권'],
  HD현대: ['에이치디현대'],
  KT: ['케이티'],
  토스: ['비바리퍼블리카'],
};

export function aliasTermsFor(query: string): string[] {
  return COMPANY_ALIASES[query.trim()] ?? [];
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** XML 특수문자 표기를 원래 문자로 되돌린다. 그대로 두면 "A&amp;B"가 화면에 노출되고 백엔드 기업명과도 어긋난다. */
export function decodeXmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (match, entity: string) => {
    if (entity[0] !== '#') return NAMED_ENTITIES[entity];
    const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

function tagValue(block: string, tag: string): string {
  return block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1]?.trim() ?? '';
}

/** 시장 구분이 비어 있거나 "기타"면 비상장으로 본다 */
function isListedMarket(market: string): boolean {
  return market !== '' && market !== '기타';
}

export function parseCorpItems(xml: string): CorpItem[] {
  return xml
    .split('<item>')
    .slice(1)
    .map((block) => ({
      corpName: decodeXmlEntities(tagValue(block, 'corpNm')),
      listed: isListedMarket(tagValue(block, 'corpRegMrktDcdNm')),
    }))
    .filter((item) => item.corpName);
}

/** 정렬 비교용 - 법인 형태 표기와 공백을 빼서 "(주)카카오"와 "카카오"를 같은 이름으로 본다 */
function normalizeName(name: string): string {
  return name.replace(/\(주\)|㈜|주식회사|\(유\)|유한회사|\s/g, '');
}

/**
 * 자동완성에 보여줄 순서로 정렬한다.
 *
 * 금융위 API 는 이름에 검색어가 들어간 모든 법인을 규모와 무관한 순서로 돌려준다. 그래서 "삼성금은"이
 * 삼성전자보다 앞에 오고, "KT"로 찾으면 이름에 KT 가 들어간 외국 펀드가 1위가 된다. 별칭으로 찾은
 * 법인 → 상장사 → 검색어와 같은 이름 → 검색어로 시작하는 이름 → 짧은 이름 순으로 올린다.
 */
export function rankCompanies(items: CorpItem[], query: string, aliasTerms: string[] = [], limit = 10): string[] {
  // 같은 법인이 시점별로 여러 줄 오므로 이름으로 합치고, 한 줄이라도 상장이면 상장으로 본다
  const byName = new Map<string, CorpItem & { order: number }>();
  items.forEach((item, order) => {
    const prev = byName.get(item.corpName);
    if (!prev) byName.set(item.corpName, { ...item, order });
    else if (item.listed) prev.listed = true;
  });

  const q = normalizeName(query);
  const aliases = aliasTerms.map(normalizeName);
  const score = (item: CorpItem): number => {
    const name = normalizeName(item.corpName);
    let s = 0;
    if (aliases.some((a) => name === a)) s += 1000;
    else if (aliases.some((a) => name.startsWith(a))) s += 400;
    if (item.listed) s += 100;
    if (name === q) s += 50;
    else if (name.startsWith(q)) s += 20;
    return s;
  };

  return [...byName.values()]
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        normalizeName(a.corpName).length - normalizeName(b.corpName).length ||
        a.order - b.order,
    )
    .slice(0, limit)
    .map((item) => item.corpName);
}
