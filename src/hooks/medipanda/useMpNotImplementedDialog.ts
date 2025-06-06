import { useContext } from 'react';
import { MpNotImplementedDialogContext } from 'contexts/medipanda/MpNotImplementedDialogContext';

export function useMpNotImplementedDialog() {
  return useContext(MpNotImplementedDialogContext);
}
