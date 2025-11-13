import showToast from '@/components/utils/showToast';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

//* == 현재 페이지
export const pathnameAtom = atom<string>("/");

//* == 인증/인가 type
type SessionStatus = 'unknown' | 'checking' | 'authenticated' | 'unauthenticated';

type LoginCredentials = {
    username: string;
    password: string;
}

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

// toastAtom - 인증/인가 상태 알림 toast에서 사용
// export const toastAtom = atom<ToastInfo>(null);

// 인증: 로그인 성공 후 호출 또는 인가 필요 페이지에서 호출, userInfoAtom, sessionAtom 동기화
export const refreshSessionAtom = atom(
    (get) => get(sessionAtom),
    (get, set) => {
        // 미인증 상태라면, 불필요한 확인 생략('unkown'일때는 세션 체크 해야함)
        const currentSession = get(sessionAtom);
        if(currentSession.status === 'unauthenticated') return;

        // 인증 상태일 경우 세션 체크 시작
        set(sessionAtom, { status: 'checking', user: null });

        fetch('/java/api/v1/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        })
        .then(response => {
            // 성공시
            if(response.ok) {
                return response.json();
            }

            // 실패시
            return Promise.reject(response);
        })
        .then(user => {
            set(userInfoAtom, user);
            set(sessionAtom, { status: 'authenticated', user });
        })
        .catch(error => {
            if(error && error.status !== 401) {
                console.log('세션 갱신 중 에러 발생: ', error);
            }

            // 실패 공통 처리
            set(userInfoAtom, null);
            set(sessionAtom, { 
                status: 'unauthenticated', 
                user: null,
                error: error.message || error.statusText || '인증 시도 중 에러 발생',
            });
        });
    }
);

// 로그인 atom
export const loginAtom = atom(
    null, // 쓰기 전용 atom
    async (get, set, credentials: LoginCredentials) => { // get 언제 쓰지?
        // 로그인 시작
        set(sessionAtom, { status: 'checking', user: null });

        try{
            const response = await fetch('/java/api/v1/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                cache: 'no-store',
            });
            
            const json = await response.json();
            
            // 로그인 실패 - catch문으로 보내기
            if(!response.ok) {
                throw { status: response.status, message: json.message || '로그인 실패' };
            }

            // 사용자 정보
            const user = json.user; // 응답이 /me와 다름

            // 로그인 성공
            set(userInfoAtom, user);
            set(sessionAtom, { status: 'authenticated', user });
            showToast('로그인에 성공했습니다.', 'success');

        } catch(error: any) {
            const status = error.status;
            let message = '알 수 없는 에러가 발생했습니다.';

            if(status === 401) {
                message = '아이디 또는 비밀번호가 일치하지 않습니다.';
            } else {
                message = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }
            
            set(userInfoAtom, null);
            set(sessionAtom, {
                status: 'unauthenticated',
                user: null,
                error: error.message || '로그인 중 에러 발생',
            });
            showToast(message, 'error');
            
            console.log('로그인 중 에러 발생: ', error);

            throw error;
        };
    }
)

// 로그아웃 atom
export const logoutAtom = atom(
    null, // 쓰기 전용
    async (get, set) => {
        try {
            // 서버에 로그아웃 요청 보내기(세션/쿠키 무효화)
            const response =await fetch('/java/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store',
            });

            if(!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                throw { status: response.status, message: errorBody.message || '로그아웃 실패' };
            }

            set(userInfoAtom, null);
            set(sessionAtom, { status: 'unauthenticated', user: null });
            showToast('로그아웃 되었습니다.', 'success');

        } catch(error: any) {
            const status = error.status;
            let message = '알 수 없는 에러가 발생했습니다.';

            if(status === 401) {
                message = '권한이 없어 로그아웃에 실패했습니다.';
            } else {
                message = error.message || '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }

            showToast(message, 'error');
            console.log('로그아웃 중 에러 발생: ', error);
            
            throw error;
        }
    }
);

//* == 모달 Modal
// 타입 정의
interface ModalState {
    isOpen: boolean;
    header: React.ReactNode | null;
    content: React.ReactNode | null;
}

// 모달 atom
export const modalStateAtom = atom<ModalState>({
    isOpen: false,
    header: null,
    content: null,
});

// 파생 - 모달 열고 내용 설정
export const openModalAtom = atom(
    null,
    (get, set, header?: React.ReactNode, content?: React.ReactNode) => {
        set(modalStateAtom, { isOpen: true, header, content });
    }
);

// 파생 - 모달 닫고 내용설정
export const closeModalAtom = atom(
    null,
    (get, set) => {
        set(modalStateAtom, { isOpen: false, header: null, content: null });
    }
);