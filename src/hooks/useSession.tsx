import axios from 'axios';
import { login as apiLogin, type MemberDetailsResponse, refreshToken as apiRefreshToken, whoAmI } from 'backend';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { encryptRSA } from 'utils/rsa';

declare global {
  interface Window {
    tokenRefreshInterval?: ReturnType<typeof setInterval>;
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

  const refreshToken = async (userId: string) => {
    const { refreshToken } = await apiRefreshToken({
      userId: userId,
      refreshToken: localStorage.getItem('refreshToken') ?? '',
    });
    localStorage.setItem('refreshToken', refreshToken);
  };

  const getSession = async () => {
    const member = await whoAmI();

    await refreshToken(member.userId);
    window.tokenRefreshInterval = setInterval(() => refreshToken(member.userId), 60 * 1000);

    return member;
  };

  const login = async (userId: string, password: string) => {
    const encryptedPassword = import.meta.env.VITE_SKIP_PASSWORD_ENCRYPTION === 'true' ? password : await encryptRSA(password);
    const { refreshToken } = await apiLogin({
      userId,
      password: encryptedPassword,
    });
    localStorage.setItem('refreshToken', refreshToken);

    setSession(await getSession());
  };

  const logout = async () => {
    try {
      await axios.get('/v1/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      setSession(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setSession(await getSession());
      } catch (error) {
        console.error(error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
