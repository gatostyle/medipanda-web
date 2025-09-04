import { MenuOrientation } from 'config';
import { getPermissions, login as apiLogin, MemberDetailsResponse, refreshToken as apiRefreshToken, whoAmI } from '@/medipanda/backend';
import { filterMenuByPermissions, mpAdminMenu, mpMemberMenu } from '@/medipanda/menu-items';
import { encryptRSA } from '@/medipanda/utils/rsa';
import { createContext, useContext, useEffect, useState } from 'react';
import { useMpMenu } from './useMpMenu';

declare global {
  interface Window {
    refreshTokenRotateInterval: ReturnType<typeof setInterval>;
  }
}

const initialState = {
  session: null as MemberDetailsResponse | null,
  isLoading: true,
  login: (userId: string, password: string) => Promise.resolve(),
};

export const MpSessionContext = createContext(initialState);

export function MpSessionProvider({ children }: { children: React.ReactNode }) {
  const { setMenuItems, setMenuOrientation } = useMpMenu();
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    const member = await whoAmI();

    if (isMpAdmin(member)) {
      if (!isMpSuperAdmin(member)) {
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
          if ((e as any)?.response?.status === 401) {
            clearInterval(window.refreshTokenRotateInterval);
            localStorage.removeItem('refreshToken');
            const currentUrl = window.location.pathname + window.location.search;
            window.location.replace(`/logout?authError=true&redirectTo=${encodeURIComponent(currentUrl)}`);
          } else {
            console.error(e);
          }
        }
      },
      import.meta.env.VITE_APP_TOKEN_ROTATE_INTERVAL,
    );

    return member;
  };

  const login = async (userId: string, password: string) => {
    const encryptedPassword = import.meta.env.VITE_SKIP_PASSWORD_ENCRYPTION === 'true' ? password : await encryptRSA(password);
    const { refreshToken } = await apiLogin({
      userId,
      password: encryptedPassword,
      device: null,
    });
    localStorage.setItem('refreshToken', refreshToken);

    setSession(await getSession());
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
    <MpSessionContext.Provider
      value={{
        session,
        isLoading,
        login,
      }}
    >
      {children}
    </MpSessionContext.Provider>
  );
}

export function useMpSession() {
  return useContext(MpSessionContext);
}

export function isMpAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN' || member.role === 'ADMIN';
}

export function isMpSuperAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN';
}
