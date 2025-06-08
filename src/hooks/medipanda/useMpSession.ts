import { useContext } from 'react';
import { MpSessionContext } from 'contexts/medipanda/MpSessionContext';

export function useMpSession() {
  return useContext(MpSessionContext);
}
