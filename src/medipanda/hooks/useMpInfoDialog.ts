import { useContext } from 'react';
import { MpInfoDialogContext } from 'medipanda/contexts/MpInfoDialogContext';

export function useMpInfoDialog() {
  const context = useContext(MpInfoDialogContext);

  if (context === undefined) {
    throw new Error('useMpInfoDialog must be used within a MpInfoDialogProvider');
  }

  return context;
}
