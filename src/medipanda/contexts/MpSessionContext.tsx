import { createContext, useEffect, useState } from 'react';
import { encryptRSA } from 'medipanda/utils/rsa';
import axios from 'utils/axios';
import { isMpAdmin, isMpSuperAdmin } from 'medipanda/utils/MpMemberRole';
import { filterMenuByPermissions, mpAdminMenu, mpMemberMenu } from 'medipanda/menu-items';
import { MenuOrientation } from 'config';
import { useMpMenu } from 'medipanda/hooks/useMpMenu';
import { login as apiLogin, refreshToken as apiRefreshToken, whoAmI, getPermissions, MemberDetailsResponse } from 'medipanda/backend';

const initialState = {
  session: null as MemberDetailsResponse | null,
  isLoading: true,
  login: (userId: string, password: string) => Promise.resolve(),
  logout: () => Promise.resolve()
};

export const MpSessionContext = createContext(initialState);

export function MpSessionProvider({ children }: { children: React.ReactNode }) {
  const { setMenuItems, setMenuOrientation } = useMpMenu();
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = async (userId: string) => {
    const { refreshToken } = await apiRefreshToken({
      userId: userId,
      refreshToken: localStorage.getItem('refreshToken') ?? ''
    });
    localStorage.setItem('refreshToken', refreshToken);
  };

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

    await refreshToken(member.userId);
    (window as any).tokenRefreshInterval = setInterval(() => refreshToken(member.userId), 60 * 1000);

    return member;
  };

  const login = async (userId: string, password: string) => {
    const encryptedPassword = import.meta.env.VITE_SKIP_PASSWORD_ENCRYPTION === 'true' ? password : await encryptRSA(password);
    const { refreshToken } = await apiLogin({
      userId,
      password: encryptedPassword
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
    <MpSessionContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </MpSessionContext.Provider>
  );
}
