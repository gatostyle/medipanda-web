import { login as apiLogin, logout as apiLogout, type MemberDetailsResponse, refreshToken as apiRefreshToken, whoAmI } from '@/backend';
import { encryptRSA } from '@/lib/rsa';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    refreshTokenRotateInterval: ReturnType<typeof setInterval>;
  }
}

interface SessionState {
  session: MemberDetailsResponse | null;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const initialState: SessionState = {
  session: null,
  isLoading: true,
  login: Promise.resolve,
  logout: Promise.resolve,
};

const SessionContext = createContext(initialState);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    const member = await whoAmI();

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
      import.meta.env.VITE_APP_TOKEN_ROTATE_INTERVAL,
    );

    return member;
  };

  const login = async (userId: string, password: string) => {
    const encryptedPassword = import.meta.env.VITE_APP_ENCRYPT_PASSWORD === 'true' ? password : await encryptRSA(password);
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
    refreshSession();
  }, []);

  const refreshSession = async () => {
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
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
