import { useContext } from 'react';
import { MpNotImplementedDialogContext } from 'medipanda/contexts/MpNotImplementedDialogContext';

export function useMpNotImplementedDialog() {
  return useContext(MpNotImplementedDialogContext);
}
