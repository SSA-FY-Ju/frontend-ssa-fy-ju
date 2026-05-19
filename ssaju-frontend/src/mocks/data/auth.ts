/**
 * 인증 목업 데이터
 */

import type { User } from '@/types/api';

export const mockUser: User = {
  userId: 'mock-user-001',
  email: 'test@example.com',
  name: '테스트 사용자',
  profileImage: 'https://example.com/profile.jpg',
  createdAt: Date.now(),
};

export const mockAuthStatus = {
  isLoggedIn: true,
  user: mockUser,
};
