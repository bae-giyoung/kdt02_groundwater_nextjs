'use client';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

//* == 현재 페이지
export const pathnameAtom = atom<string>("/");

//* == 인증/인가
type SessionStatus = 'unknown' | 'checking' | 'authenticated' | 'unauthenticated';

interface SessionSnapshot {
    status: SessionStatus;
    user: { username: string; roles: string, email: string} | null;
    error?: string;
}

// sessionStorage를 백엔드 쿠키와 1:1로 사용
const storage = createJSONStorage<{ username: string; roles: string, email: string} | null>(() => {
    if(typeof window === 'undefined') return undefined as any;
    return sessionStorage;
});

// SessionStorage - user 동기화: 헤더 UI 렌더링 깜박임 방지용
export const userInfoAtom = atomWithStorage(
    'user',
    null,
    storage,
);

// React 메모리상의 세션 스냅샷 - UI 렌더링용
export const sessionAtom = atom<SessionSnapshot>({
    status: 'unknown',
    user: null,
});

// 인가: 로그인 성공 후 호출 또는 인가 필요 페이지에서 호출, userInfoAtom, sessionAtom 동기화
export const refreshSessionAtom = atom(
    (get) => get(sessionAtom),
    async (_, set) => {
        set(sessionAtom, { status: 'checking', user: null });
        try {
            const response = await fetch('/java/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                },
                cache: 'no-store',
            });

            if(!response.ok) {
                set(userInfoAtom, null);
                set(sessionAtom, { 
                    status: 'unauthenticated', 
                    user: null,
                });
                return;
            };
            console.log("호출함");
            const user = await response.json();
            set(userInfoAtom, user);
            set(sessionAtom, { status: 'authenticated', user });

        } catch(error) {
            set(userInfoAtom, null);
            set(sessionAtom, { 
                status: 'unauthenticated', 
                user: null,
                error: (error as Error).message,
            });
        };
    }
);

// 다음번엔 login/logout로직도 이리로 빼기