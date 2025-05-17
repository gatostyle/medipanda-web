import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project import
import Loader from 'components/Loader';
import axios from 'utils/axios';
import { AuthProps, JWTContextType } from 'types/auth';
import { useMpMenu } from 'hooks/medipanda/useMpMenu';
import { MenuOrientation } from 'config';
import { isAdmin } from 'api-definitions/MpMemberRole';
import { mpAdminMenu, mpMemberMenu } from 'menu-items/medipanda';

const chance = new Chance();

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

declare global {
  interface Window {
    sessionRefreshIntervalId: NodeJS.Timeout | null;
  }
}

async function setSessionRefreshInterval() {
  const clear = () => {
    if (window.sessionRefreshIntervalId) {
      clearInterval(window.sessionRefreshIntervalId);
      window.sessionRefreshIntervalId = null;
    }
  };

  const refresh = async () => {
    const response = await axios.request({
      url: '/v1/auth/refresh',
      method: 'POST',
      validateStatus: () => true
    });

    if (response.status !== 204) {
      clear();
      return false;
    }

    return true;
  };

  clear();

  if (await refresh()) {
    window.sessionRefreshIntervalId = setInterval(() => refresh(), 5 * 60 * 1_000);
  }
}

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { setMenuOrientation, setMenuItems } = useMpMenu();

  useEffect(() => {
    const init = async () => {
      try {
        const response = await axios.get('/v1/auth/me');
        const user = response.data;

        if (isAdmin(user)) {
          setMenuOrientation(MenuOrientation.VERTICAL);
          setMenuItems(mpAdminMenu);
        } else {
          setMenuOrientation(MenuOrientation.HORIZONTAL);
          setMenuItems(mpMemberMenu);
        }

        setSessionRefreshInterval();

        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user
          }
        });
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (account: string, password: string) => {
    const response = await axios.post('/v1/auth/login', { account, password });
    const user = response.data;

    if (isAdmin(user)) {
      setMenuOrientation(MenuOrientation.VERTICAL);
      setMenuItems(mpAdminMenu);
    } else {
      setMenuOrientation(MenuOrientation.HORIZONTAL);
      setMenuItems(mpMemberMenu);
    }

    setSessionRefreshInterval();

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/account/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers!),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const logout = () => {
    setMenuItems([]);
    axios.post('/v1/auth/logout').catch();
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email: string) => {
    console.log('email - ', email);
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
