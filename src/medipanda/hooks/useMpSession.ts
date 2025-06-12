import { useContext } from 'react';
import { MpSessionContext } from 'medipanda/contexts/MpSessionContext';

export function useMpSession() {
  return useContext(MpSessionContext);
}
