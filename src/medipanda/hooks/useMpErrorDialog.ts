import { useContext } from 'react';
import { MpErrorDialogContext } from 'medipanda/contexts/MpErrorDialogContext';

export function useMpErrorDialog() {
  const context = useContext(MpErrorDialogContext);

  if (context === undefined) {
    throw new Error('useMpErrorDialog must be used within a MpErrorDialogProvider');
  }

  return context;
}
