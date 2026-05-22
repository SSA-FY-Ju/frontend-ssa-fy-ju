'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * 로그인 후 프로필 메뉴
 */
export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/');
  };

  // next/image는 remotePatterns에 없는 도메인을 렌더 시점에 throw함
  // 허용된 도메인(Google, Kakao)이 아니면 이니셜 아바타로 폴백
  const ALLOWED_HOSTS = ['lh3.googleusercontent.com', 'k.kakaocdn.net'];
  const isAllowedHost = (url: string) => {
    try {
      return ALLOWED_HOSTS.includes(new URL(url).hostname);
    } catch {
      return false;
    }
  };
  const showAvatar =
    !user.profileImage || imgError || !isAllowedHost(user.profileImage);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-night-700"
        aria-expanded={isOpen}
        aria-label="프로필 메뉴"
      >
        {showAvatar ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-star-500 text-sm font-bold text-night-900">
            {user.name.charAt(0)}
          </div>
        ) : (
          <Image
            src={user.profileImage!}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full object-cover"
            onError={handleImgError}
          />
        )}
        <span className="text-sm text-white">{user.name}</span>
        <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-night-700 bg-night-800 py-1 shadow-xl">
          <div className="border-b border-night-700 px-4 py-2">
            <p className="text-sm font-medium text-white">{user.name}</p>
            {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-night-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
