import { useContext } from 'react';
import { MpMenuContext } from 'contexts/medipanda/MpMenuContext';

export function useMpMenu() {
  return useContext(MpMenuContext);
}
