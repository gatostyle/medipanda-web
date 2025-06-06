import { useContext } from 'react';
import { MpErrorDialogContext } from 'contexts/medipanda/MpErrorDialogContext';

export function useMpErrorDialog() {
  const context = useContext(MpErrorDialogContext);

  if (context === undefined) {
    throw new Error('useMpErrorDialog must be used within a MpErrorDialogProvider');
  }

  return context;
}
