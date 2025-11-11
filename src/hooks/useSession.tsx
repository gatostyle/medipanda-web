import {
  getPublicKey,
  login as apiLogin,
  logout as apiLogout,
  type MemberDetailsResponse,
  MemberType,
  refreshToken as apiRefreshToken,
  whoAmI,
} from '@/backend';
import { encryptRSA } from '@/lib/utils/rsa';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    refreshTokenRotateInterval: ReturnType<typeof setInterval>;
  }
}

const initialState = {
  session: null as MemberDetailsResponse | null,
  isLoading: true,
  login: Promise.resolve as (userId: string, password: string) => Promise<void>,
  logout: Promise.resolve as () => Promise<void>,
  refresh: Promise.resolve as () => Promise<void>,
};

const SessionContext = createContext(initialState);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    const member = await whoAmI();

    clearInterval(window.refreshTokenRotateInterval);
    window.refreshTokenRotateInterval = setInterval(
      async () => {
        const savedRefreshToken = localStorage.getItem('refreshToken');

        try {
          const { refreshToken } = await apiRefreshToken({
            userId: member.userId,
            refreshToken: savedRefreshToken ?? '',
          });
          localStorage.setItem('refreshToken', refreshToken);
        } catch (e) {
          console.error(e);
          clearInterval(window.refreshTokenRotateInterval);
          localStorage.removeItem('refreshToken');

          setSession(null);
        }
      },
      import.meta.env.VITE_APP_TOKEN_ROTATE_INTERVAL ?? 60 * 1_000,
    );

    return member;
  };

  const login = async (userId: string, password: string) => {
    const { publicKey } = await getPublicKey();
    const encryptedPassword = import.meta.env.VITE_APP_ENCRYPT_PASSWORD === 'true' ? await encryptRSA(publicKey, password) : password;
    const { refreshToken } = await apiLogin({
      userId,
      password: encryptedPassword,
      device: null,
    });
    localStorage.setItem('refreshToken', refreshToken);

    setSession(await getSession());
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setSession(await getSession());
    } catch (error) {
      console.error(error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function hasContractMemberPermission(member: MemberDetailsResponse) {
  return member.partnerContractStatus === MemberType.INDIVIDUAL || member.partnerContractStatus === MemberType.ORGANIZATION;
}

export function hasCsoMemberPermission(member: MemberDetailsResponse) {
  return member.partnerContractStatus === MemberType.CSO || hasContractMemberPermission(member);
}
