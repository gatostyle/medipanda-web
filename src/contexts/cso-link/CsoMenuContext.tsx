import { createContext, ReactNode, useState } from 'react';
import { NavItemType } from 'types/menu';
import { MenuOrientation } from 'config';

const initialState = {
  menuItems: [] as NavItemType[],
  menuOrientation: MenuOrientation.VERTICAL,
  setMenuItems: (menuItems: NavItemType[]) => {},
  setMenuOrientation: (menuOrientation: MenuOrientation) => {}
};

export const CsoMenuContext = createContext(initialState);

type CsoMenuProviderProps = {
  children: ReactNode;
};

export function CsoMenuProvider({ children }: CsoMenuProviderProps) {
  const [menuItems, setMenuItems] = useState(initialState.menuItems);
  const [menuOrientation, setMenuOrientation] = useState(initialState.menuOrientation);

  return (
    <CsoMenuContext.Provider
      value={{
        menuItems,
        menuOrientation,
        setMenuItems,
        setMenuOrientation
      }}
    >
      {children}
    </CsoMenuContext.Provider>
  );
}
