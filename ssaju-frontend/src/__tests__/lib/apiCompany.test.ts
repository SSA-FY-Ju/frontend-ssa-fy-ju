/**
 * lib/api/company.ts 단위 테스트
 */

import { fetchCompatibility, fetchCompanyAutocomplete } from '@/lib/api/company';

jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/lib/api/client';
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockReq = {
  userBirthDate: '1990-10-10',
  userBirthTime: '14:30',
  targetRole: { category: 'TECH_BACKEND' as const, detailName: '백엔드 개발자' },
  companyName: '삼성전자',
};

describe('fetchCompatibility', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/company/compatibility 호출', async () => {
    mockApiFetch.mockResolvedValueOnce({ potentialSynergy: 85, longTermStability: 80, actionableStrategy: { interviewKeywords: [], weaknessDefense: '', bestTiming: { luckyDays: [] } } } as never);
    await fetchCompatibility(mockReq);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/company/compatibility', {
      method: 'POST',
      body: mockReq,
      timeout: 10000,
    });
  });

  it('apiFetch 결과를 그대로 반환함', async () => {
    const mockResult = { potentialSynergy: 78, longTermStability: 82, actionableStrategy: { interviewKeywords: ['협업'], weaknessDefense: '전략적으로 어필', bestTiming: { luckyDays: ['2월'] } } };
    mockApiFetch.mockResolvedValueOnce(mockResult as never);
    const result = await fetchCompatibility({ ...mockReq, companyName: '카카오' });
    expect(result).toEqual(mockResult);
  });

  it('apiFetch가 에러를 던지면 에러를 전파함', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('API 오류'));
    await expect(fetchCompatibility({ ...mockReq, companyName: '네이버' })).rejects.toThrow('API 오류');
  });
});

describe('fetchCompanyAutocomplete', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/company/autocomplete 호출', async () => {
    mockApiFetch.mockResolvedValueOnce({ suggestions: ['삼성전자', '삼성SDS'] } as never);
    await fetchCompanyAutocomplete({ query: '삼성' });
    expect(mockApiFetch).toHaveBeenCalledWith('/api/company/autocomplete', {
      method: 'POST',
      body: { query: '삼성' },
      timeout: 5000,
    });
  });

  it('suggestions 배열을 반환함', async () => {
    const mockResponse = { suggestions: ['카카오', '카카오뱅크'] };
    mockApiFetch.mockResolvedValueOnce(mockResponse as never);
    const result = await fetchCompanyAutocomplete({ query: '카카오' });
    expect(result.suggestions).toHaveLength(2);
  });
});
