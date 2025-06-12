import { useContext } from 'react';
import { MpDeleteDialogContext } from 'medipanda/contexts/MpDeleteDialogContext';

export function useMpDeleteDialog() {
  return useContext(MpDeleteDialogContext);
}
