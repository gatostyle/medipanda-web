import { useContext } from 'react';
import { CsoMenuContext } from 'contexts/cso-link/CsoMenuContext';

export function useCsoMenu() {
  return useContext(CsoMenuContext);
}
