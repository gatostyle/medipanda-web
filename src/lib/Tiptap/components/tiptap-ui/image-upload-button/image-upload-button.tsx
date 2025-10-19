import type { ExtendedUseEditorOptions } from '@/lib/Tiptap';
import * as React from 'react';

// --- Lib ---
import { parseShortcutKeys } from '../../../lib//tiptap-utils';

// --- Hooks ---
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';

// --- Tiptap UI ---
import type { UseImageUploadConfig } from '../../tiptap-ui/image-upload-button';
import { IMAGE_UPLOAD_SHORTCUT_KEY, useImageUpload } from '../../tiptap-ui/image-upload-button';

// --- UI Primitives ---
import type { ButtonProps } from '../../tiptap-ui-primitive/button';
import { Button } from '../../tiptap-ui-primitive/button';
import { Badge } from '../../tiptap-ui-primitive/badge';

export interface ImageUploadButtonProps extends Omit<ButtonProps, 'type'>, UseImageUploadConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
}

export function ImageShortcutBadge({ shortcutKeys = IMAGE_UPLOAD_SHORTCUT_KEY }: { shortcutKeys?: string }) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
export const ImageUploadButton = React.forwardRef<HTMLButtonElement, ImageUploadButtonProps>(
  (
    { editor: providedEditor, text, hideWhenUnavailable = false, onInserted, showShortcut = false, onClick, children, ...buttonProps },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canInsert, handleImage, label, isActive, shortcutKeys, Icon } = useImageUpload({
      editor,
      hideWhenUnavailable,
      onInserted,
    });

    const handleImageUpload = async (file: File) => {
      if (!editor || !editor.isEditable) return;

      try {
        const fileSrc = await (editor.options as ExtendedUseEditorOptions).onImageInsert(file);

        editor
          .chain()
          .insertContentAt(editor.state.selection.anchor, {
            type: 'image',
            attrs: {
              src: fileSrc,
            },
          })
          .focus()
          .run();
      } catch (e) {
        console.error('Error uploading image:', e);
        alert('잘못된 이미지 파일입니다.');
      }
    };

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = (editor?.options as ExtendedUseEditorOptions | undefined)?.imageMimeTypes?.join(',') ?? 'image/*';
        input.style.display = 'none';

        input.onchange = () => {
          Array.from(input.files ?? []).forEach(handleImageUpload);
        };
        input.click();
      },
      [editor, handleImage, onClick, handleImageUpload],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type='button'
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className='tiptap-button-icon' />
            {text && <span className='tiptap-button-text'>{text}</span>}
            {showShortcut && <ImageShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  },
);

ImageUploadButton.displayName = 'ImageUploadButton';
