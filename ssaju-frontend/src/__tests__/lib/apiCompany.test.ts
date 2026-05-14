/**
 * lib/api/company.ts 단위 테스트
 */

import { fetchCompatibility, fetchCompanyAutocomplete } from '@/lib/api/company';

jest.mock('@/lib/api/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/lib/api/client';
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('fetchCompatibility', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/company/compatibility 호출', async () => {
    mockApiFetch.mockResolvedValueOnce({ compatibilityScore: 85 } as never);
    const req = { sajuResultId: 'saju-001', companyName: '삼성전자' };
    await fetchCompatibility(req);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/company/compatibility', {
      method: 'POST',
      body: req,
      timeout: 10000,
    });
  });

  it('apiFetch 결과를 그대로 반환함', async () => {
    const mockResult = { compatibilityScore: 78, companyName: '카카오' };
    mockApiFetch.mockResolvedValueOnce(mockResult as never);
    const result = await fetchCompatibility({ sajuResultId: 'saju-001', companyName: '카카오' });
    expect(result).toEqual(mockResult);
  });

  it('apiFetch가 에러를 던지면 에러를 전파함', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('API 오류'));
    await expect(
      fetchCompatibility({ sajuResultId: 'saju-001', companyName: '네이버' }),
    ).rejects.toThrow('API 오류');
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
