import {
  getPermissions,
  getPublicKey,
  login as apiLogin,
  logout as apiLogout,
  type MemberDetailsResponse,
  refreshToken as apiRefreshToken,
  whoAmI,
} from '@/backend';
import { MenuOrientation } from '@/config';
import { encryptRSA } from '@/lib/rsa';
import { useMpMenu } from '@/medipanda/hooks/useMpMenu';
import { filterMenuByPermissions, mpAdminMenu, mpMemberMenu } from '@/medipanda/menu-items';
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
};

const SessionContext = createContext(initialState);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { setMenuItems, setMenuOrientation } = useMpMenu();
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    const member = await whoAmI();

    if (isAdmin(member)) {
      if (!isSuperAdmin(member)) {
        const permissions = (await getPermissions(member.userId)).permissions;

        const filteredMenu = filterMenuByPermissions(mpAdminMenu, permissions);
        setMenuItems(filteredMenu);
      } else {
        setMenuItems(mpAdminMenu);
      }

      setMenuOrientation(MenuOrientation.VERTICAL);
    } else {
      setMenuItems(mpMemberMenu);
      setMenuOrientation(MenuOrientation.VERTICAL);
    }

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
    const { publicKey } = await getPublicKey();
    const encryptedPassword = import.meta.env.VITE_APP_ENCRYPT_PASSWORD === 'true' ? password : await encryptRSA(publicKey, password);
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

export function isAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN' || member.role === 'ADMIN';
}

export function isSuperAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN';
}
