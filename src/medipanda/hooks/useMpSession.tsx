import { MenuOrientation } from 'config';
import { getPermissions, login as apiLogin, MemberDetailsResponse, refreshToken as apiRefreshToken, whoAmI } from 'medipanda/backend';
import { filterMenuByPermissions, mpAdminMenu, mpMemberMenu } from 'medipanda/menu-items';
import { encryptRSA } from 'medipanda/utils/rsa';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'utils/axios';
import { useMpMenu } from './useMpMenu';

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

  const rotateRefreshToken = async (userId: string) => {
    const savedRefreshToken = localStorage.getItem('refreshToken');
    console.log(`Using refresh token ends with: ${savedRefreshToken?.slice(-4)}`);

    const { refreshToken } = await apiRefreshToken({
      userId: userId,
      refreshToken: savedRefreshToken ?? ''
    });
    localStorage.setItem('refreshToken', refreshToken);
    console.log(`Saved refresh token ends with: ${refreshToken?.slice(-4)}`);
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

    (window as any).refreshTokenRotateInterval = setInterval(() => rotateRefreshToken(member.userId), 60 * 1000);

    return member;
  };

  const login = async (userId: string, password: string) => {
    const encryptedPassword = import.meta.env.VITE_SKIP_PASSWORD_ENCRYPTION === 'true' ? password : await encryptRSA(password);
    const { refreshToken } = await apiLogin({
      userId,
      password: encryptedPassword
    });
    localStorage.setItem('refreshToken', refreshToken);
    console.log(`Saved refresh token ends with: ${refreshToken?.slice(-4)}`);

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

export function useMpSession() {
  return useContext(MpSessionContext);
}

export function isMpAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN' || member.role === 'ADMIN';
}

export function isMpSuperAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN';
}
