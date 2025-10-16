import { runCatchingOrNull } from '../../../../utils/runCatching';
import * as React from 'react';
import type { Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';

// --- Icons ---
import { LinkIcon } from '../../tiptap-icons/link-icon';

// --- Lib ---
import { isMarkInSchema, sanitizeUrl } from '../../../lib//tiptap-utils';

/**
 * Configuration for the youtube popover functionality
 */
export interface UseYoutubePopoverConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Whether to hide the youtube popover when not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Configuration for the link handler functionality
 */
export interface LinkHandlerProps {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null;
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void;
}

/**
 * Checks if a link can be set in the current editor state
 */
export function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return runCatchingOrNull(() => editor.can().setMark('link')) ?? false;
}

/**
 * Checks if a link is currently active in the editor
 */
export function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('link');
}

/**
 * Determines if the link button should be shown
 */
export function shouldShowLinkButton(props: { editor: Editor | null; hideWhenUnavailable: boolean }): boolean {
  const { editor, hideWhenUnavailable } = props;

  const linkInSchema = isMarkInSchema('link', editor);

  if (!linkInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canSetLink(editor);
  }

  return true;
}

/**
 * Custom hook for handling link operations in a Tiptap editor
 */
export function useLinkHandler(props: LinkHandlerProps) {
  const { editor, onSetLink } = props;
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!editor) return;

    // Get URL immediately on mount
    const { href } = editor.getAttributes('link');

    if (isLinkActive(editor) && url === null) {
      setUrl(href || '');
    }
  }, [editor, url]);

  React.useEffect(() => {
    if (!editor) return;

    const updateLinkState = () => {
      const { href } = editor.getAttributes('link');
      setUrl(href || '');
    };

    editor.on('selectionUpdate', updateLinkState);
    return () => {
      editor.off('selectionUpdate', updateLinkState);
    };
  }, [editor]);

  const setLink = React.useCallback(() => {
    if (!url || !editor) return;

    let chain = editor.chain().focus();

    chain = chain.setYoutubeVideo({ src: url, width: 720, height: 480 });

    chain.run();

    setUrl(null);

    onSetLink?.();
  }, [editor, onSetLink, url]);

  const openLink = React.useCallback(
    (target = '_blank', features = 'noopener,noreferrer') => {
      if (!url) return;

      const safeUrl = sanitizeUrl(url, window.location.href);
      if (safeUrl !== '#') {
        window.open(safeUrl, target, features);
      }
    },
    [url],
  );

  return {
    url: url || '',
    setUrl,
    setLink,
    openLink,
  };
}

/**
 * Custom hook for youtube popover state management
 */
export function useLinkState(props: { editor: Editor | null; hideWhenUnavailable: boolean }) {
  const { editor, hideWhenUnavailable = false } = props;

  const canSet = canSetLink(editor);
  const isActive = isLinkActive(editor);

  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowLinkButton({
          editor,
          hideWhenUnavailable,
        }),
      );
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  return {
    isVisible,
    canSet,
    isActive,
  };
}

/**
 * Main hook that provides youtube popover functionality for Tiptap editor
 */
export function useYoutubePopover(config?: UseYoutubePopoverConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onSetLink } = config || {};

  const { editor } = useTiptapEditor(providedEditor);

  const { isVisible, canSet, isActive } = useLinkState({
    editor,
    hideWhenUnavailable,
  });

  const linkHandler = useLinkHandler({
    editor,
    onSetLink,
  });

  return {
    isVisible,
    canSet,
    isActive,
    label: 'Youtube',
    Icon: LinkIcon,
    ...linkHandler,
  };
}
