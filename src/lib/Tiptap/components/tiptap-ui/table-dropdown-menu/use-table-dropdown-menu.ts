'use client';

import { findNodePosition, isNodeInSchema, isNodeTypeSelected, isValidPosition } from '../../../lib/tiptap-utils';
import { TextSelection } from '@tiptap/pm/state';
import * as React from 'react';
import type { Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';

/**
 * Configuration for the table dropdown menu functionality
 */
export interface UseTableDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
}

/**
 * Checks if table is currently active
 */
export function isTableActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;

  return editor.isActive('table');
}

/**
 * Checks if table can be toggled in the current editor state
 */
export function canToggle(editor: Editor | null, turnInto = true): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema('table', editor) || isNodeTypeSelected(editor, ['image'])) return false;

  if (!turnInto) {
    return editor.can().insertTable();
  }

  try {
    const view = editor.view;
    const state = view.state;
    const selection = state.selection;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Custom hook that provides table dropdown menu functionality for Tiptap editor
 */
export function useTableDropdownMenu(config?: UseTableDropdownMenuConfig) {
  const { editor: providedEditor } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(true);

  const isActive = isTableActive(editor);
  const canToggleState = canToggle(editor);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(canToggle(editor));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  return {
    isVisible,
    isActive,
    canToggle: canToggleState,
    label: 'Table',
  };
}
