import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { FileHandler } from '@tiptap/extension-file-handler';
import { Image as ImageExtension } from '@tiptap/extension-image';
import { BulletList, ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor, Placeholder } from '@tiptap/extensions';
import { Editor, useEditor } from '@tiptap/react';
import { useRef } from 'react';
import type { ExtendedUseEditorOptions } from './Tiptap';

export interface UseTiptapOptions {
  placeholder?: string;
  imageMimeTypes: ExtendedUseEditorOptions['imageMimeTypes'];
  onImageInsert: ExtendedUseEditorOptions['onImageInsert'];
  onImageDelete: (fileUrl: string) => void;
}

export function useTiptap(props: UseTiptapOptions): {
  editor: Editor;
} {
  const placeholder = useRef(props.placeholder);
  const imageMimeTypes = useRef(props.imageMimeTypes);
  const onImageInsert = useRef(props.onImageInsert);
  const onImageDelete = useRef(props.onImageDelete);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: placeholder.current
      }),
      Bold,
      ListItem,
      BulletList,
      ImageExtension,
      Dropcursor,
      FileHandler.configure({
        allowedMimeTypes: imageMimeTypes.current,
        onDrop: async (currentEditor, files, pos) => {
          for (const file of files) {
            const fileSrc = await onImageInsert.current?.(file);

            if (!fileSrc) {
              continue;
            }

            currentEditor
              .chain()
              .insertContentAt(pos, {
                type: 'image',
                attrs: {
                  src: fileSrc
                }
              })
              .focus()
              .run();
          }
        },
        onPaste: async (currentEditor, files) => {
          for (const file of files) {
            const fileSrc = await onImageInsert.current?.(file);

            if (!fileSrc) {
              continue;
            }

            currentEditor
              .chain()
              .insertContentAt(currentEditor.state.selection.anchor, {
                type: 'image',
                attrs: {
                  src: fileSrc
                }
              })
              .focus()
              .run();
          }
        }
      })
    ],
    onDelete: (props) => {
      if (props.type === 'node' && props.node.type.name === 'image') {
        onImageDelete.current?.(props.node.attrs.src);
      }
    },
    imageMimeTypes: imageMimeTypes.current,
    onImageInsert: onImageInsert.current
  } as ExtendedUseEditorOptions);

  return { editor };
}
