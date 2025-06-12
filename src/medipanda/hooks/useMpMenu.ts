import { useContext } from 'react';
import { MpMenuContext } from 'medipanda/contexts/MpMenuContext';

export function useMpMenu() {
  return useContext(MpMenuContext);
}
