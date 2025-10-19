import {
  getPermissions,
  getPublicKey,
  login as apiLogin,
  logout as apiLogout,
  type MemberDetailsResponse,
  refreshToken as apiRefreshToken,
  whoAmI,
  Role,
} from '@/backend';
import { encryptRSA } from '@/lib/utils/rsa';
import { type MenuItem, filterMenuByPermissions, menuItems } from '@/menus';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    refreshTokenRotateInterval: ReturnType<typeof setInterval>;
  }
}

const initialState = {
  session: null as MemberDetailsResponse | null,
  menus: [] as MenuItem[],
  isLoading: true,
  login: Promise.resolve as (userId: string, password: string) => Promise<void>,
  logout: Promise.resolve as () => Promise<void>,
};

const SessionContext = createContext(initialState);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  const getSession = async () => {
    const member = await whoAmI();

    if (!isAdmin(member)) {
      await apiLogout();
      throw new NotAdminError();
    }

    if (!isSuperAdmin(member)) {
      const permissions = (await getPermissions(member.userId)).permissions;

      setMenus(filterMenuByPermissions(menuItems, permissions));
    } else {
      setMenus(menuItems);
    }

    clearInterval(window.refreshTokenRotateInterval);
    window.refreshTokenRotateInterval = setInterval(
      async () => {
        const savedRefreshToken = localStorage.getItem('refreshToken');

        if (savedRefreshToken === null) {
          clearInterval(window.refreshTokenRotateInterval);
          await logout();
          return;
        }

        try {
          const { refreshToken } = await apiRefreshToken({
            userId: member.userId,
            refreshToken: savedRefreshToken,
          });
          localStorage.setItem('refreshToken', refreshToken);
        } catch (e) {
          console.error(e);
          clearInterval(window.refreshTokenRotateInterval);
          localStorage.removeItem('refreshToken');

          await logout();
        }
      },
      import.meta.env.VITE_APP_TOKEN_ROTATE_INTERVAL ?? 60 * 1_000,
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
        menus,
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
  return member.role === Role.SUPER_ADMIN || member.role === Role.ADMIN;
}

export function isSuperAdmin(member: MemberDetailsResponse) {
  return member.role === Role.SUPER_ADMIN;
}

export class NotAdminError extends Error {
  constructor() {
    super('Access denied. Admins only.');
    this.name = 'NotAdminError';
  }
}
