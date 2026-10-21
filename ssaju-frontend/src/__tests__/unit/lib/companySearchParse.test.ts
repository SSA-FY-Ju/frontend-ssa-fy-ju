/**
 * 금융위 기업기본정보 응답 해석·정렬 순수 함수 테스트
 */
import {
  aliasTermsFor,
  decodeXmlEntities,
  parseCorpItems,
  rankCompanies,
} from '@/lib/server/company-search-parse';

function item(corpName: string, listed = false) {
  return { corpName, listed };
}

describe('decodeXmlEntities', () => {
  it('XML 특수문자 표기를 원래 문자로 되돌린다', () => {
    expect(decodeXmlEntities('HAGSTROMER &amp; QVIBERG')).toBe('HAGSTROMER & QVIBERG');
    expect(decodeXmlEntities('A&lt;B&gt;C &quot;D&quot; &apos;E&apos;')).toBe('A<B>C "D" \'E\'');
  });

  it('숫자 표기도 되돌린다', () => {
    expect(decodeXmlEntities('&#38;&#x26;')).toBe('&&');
  });

  it('모르는 표기와 범위를 벗어난 숫자는 그대로 둔다', () => {
    expect(decodeXmlEntities('&foo; &#99999999;')).toBe('&foo; &#99999999;');
  });
});

describe('parseCorpItems', () => {
  it('법인명과 상장 여부를 꺼내고 특수문자를 되돌린다', () => {
    const xml =
      '<items>' +
      '<item><corpNm>LG전자(주)</corpNm><corpRegMrktDcdNm>유가</corpRegMrktDcdNm></item>' +
      '<item><corpNm>A&amp;B(주)</corpNm><corpRegMrktDcdNm>기타</corpRegMrktDcdNm></item>' +
      '<item><corpNm>상장정보없음(주)</corpNm></item>' +
      '<item><corpNm></corpNm></item>' +
      '</items>';

    expect(parseCorpItems(xml)).toEqual([
      item('LG전자(주)', true),
      item('A&B(주)', false),
      item('상장정보없음(주)', false),
    ]);
  });
});

describe('rankCompanies', () => {
  it('같은 법인이 여러 줄 와도 하나로 합치고, 한 줄이라도 상장이면 상장으로 본다', () => {
    const ranked = rankCompanies([item('현대건설(주)'), item('현대교역(주)'), item('현대건설(주)', true)], '현대');
    expect(ranked).toEqual(['현대건설(주)', '현대교역(주)']);
  });

  it('상장사를 비상장사보다 먼저 보여준다', () => {
    const ranked = rankCompanies([item('삼성금은 주식회사'), item('삼성전자(주)', true)], '삼성');
    expect(ranked[0]).toBe('삼성전자(주)');
  });

  it('별칭으로 찾은 법인은 상장사보다도 먼저 보여준다', () => {
    const ranked = rankCompanies(
      [item('주식회사 비스토스', true), item('(주)비바리퍼블리카')],
      '토스',
      ['비바리퍼블리카'],
    );
    expect(ranked[0]).toBe('(주)비바리퍼블리카');
  });

  it('검색어와 같은 이름, 검색어로 시작하는 이름, 포함만 하는 이름 순으로 보여준다', () => {
    const ranked = rankCompanies([item('주식회사 파낙카카오'), item('카카오모빌리티'), item('(주)카카오')], '카카오');
    expect(ranked).toEqual(['(주)카카오', '카카오모빌리티', '주식회사 파낙카카오']);
  });

  it('최대 개수까지만 돌려준다', () => {
    const items = Array.from({ length: 15 }, (_, i) => item(`회사${i}`));
    expect(rankCompanies(items, '회사')).toHaveLength(10);
  });
});

describe('aliasTermsFor', () => {
  it('브랜드명을 법인명 검색어로 바꿔준다', () => {
    expect(aliasTermsFor('SK하이닉스')).toEqual(['에스케이하이닉스']);
    expect(aliasTermsFor(' KT ')).toEqual(['케이티']);
  });

  it('별칭이 없으면 빈 목록을 돌려준다', () => {
    expect(aliasTermsFor('카카오')).toEqual([]);
  });
});
