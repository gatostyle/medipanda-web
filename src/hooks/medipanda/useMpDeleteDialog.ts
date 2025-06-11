import { useContext } from 'react';
import { MpDeleteDialogContext } from 'contexts/medipanda/MpDeleteDialogContext';

export function useMpDeleteDialog() {
  return useContext(MpDeleteDialogContext);
}
