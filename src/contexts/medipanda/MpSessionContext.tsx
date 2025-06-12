import { createContext, useEffect, useState } from 'react';
import { MpSession } from 'api-definitions/MpSession';
import { encryptRSA } from 'utils/medipanda/rsa';
import axios from 'utils/axios';
import { isMpAdmin, isMpSuperAdmin } from 'api-definitions/MpMemberRole';
import { filterMenuByPermissions, mpAdminMenu, mpMemberMenu } from 'menu-items/medipanda';
import { MenuOrientation } from 'config';
import { mpFetchCurrentUserPermissions } from 'api-definitions/MpAdmin';
import { useMpMenu } from 'hooks/medipanda/useMpMenu';

const initialState = {
  session: null as MpSession | null,
  isLoading: true,
  login: (userId: string, password: string) => Promise.resolve(),
  logout: () => Promise.resolve()
};

export const MpSessionContext = createContext(initialState);

export function MpSessionProvider({ children }: { children: React.ReactNode }) {
  const { setMenuItems, setMenuOrientation } = useMpMenu();
  const [session, setSession] = useState(initialState.session);
  const [isLoading, setIsLoading] = useState(true);

  const getSession = async () => {
    const response = await axios.request<MpSession>({
      method: 'GET',
      url: '/v1/auth/me'
    });
    const session = response.data;

    if (isMpAdmin(session)) {
      if (!isMpSuperAdmin(session)) {
        session.permissions = await mpFetchCurrentUserPermissions(session.userId);

        const filteredMenu = filterMenuByPermissions(mpAdminMenu, session.permissions);
        setMenuItems(filteredMenu);
      } else {
        setMenuItems(mpAdminMenu);
      }

      setMenuOrientation(MenuOrientation.VERTICAL);
    } else {
      setMenuItems(mpMemberMenu);
      setMenuOrientation(MenuOrientation.VERTICAL);
    }

    return session;
  };

  const login = async (userId: string, password: string) => {
    const encryptedPassword = await encryptRSA(password);
    await axios.post('/v1/auth/login', {
      userId,
      password: encryptedPassword
    });
    setSession(await getSession());
  };

  const logout = async () => {
    try {
      await axios.post('/v1/auth/logout');
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
