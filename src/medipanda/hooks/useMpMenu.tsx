import { MenuOrientation } from 'config';
import { createContext, ReactNode, useContext, useState } from 'react';
import { NavItemType } from 'types/menu';

const initialState = {
  menuItems: [] as NavItemType[],
  menuOrientation: MenuOrientation.VERTICAL,
  setMenuItems: (_: NavItemType[]) => {},
  setMenuOrientation: (_: MenuOrientation) => {},
};

export const MpMenuContext = createContext(initialState);

type MpMenuProviderProps = {
  children: ReactNode;
};

export function MpMenuProvider({ children }: MpMenuProviderProps) {
  const [menuItems, setMenuItems] = useState(initialState.menuItems);
  const [menuOrientation, setMenuOrientation] = useState(initialState.menuOrientation);

  return (
    <MpMenuContext.Provider
      value={{
        menuItems,
        menuOrientation,
        setMenuItems,
        setMenuOrientation,
      }}
    >
      {children}
    </MpMenuContext.Provider>
  );
}

export function useMpMenu() {
  return useContext(MpMenuContext);
}
