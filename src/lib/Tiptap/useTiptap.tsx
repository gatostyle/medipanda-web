import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { Document } from '@tiptap/extension-document';
import { FileHandler } from '@tiptap/extension-file-handler';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image as ImageExtension } from '@tiptap/extension-image';
import { Italic } from '@tiptap/extension-italic';
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Dropcursor, Placeholder } from '@tiptap/extensions';
import { Editor, useEditor } from '@tiptap/react';
import { useRef } from 'react';
import { type ExtendedUseEditorOptions } from './Tiptap';

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
      TextStyle,
      Heading,
      Bold,
      Italic,
      Strike,
      Underline,
      ListItem,
      BulletList,
      OrderedList,
      Code,
      Blockquote,
      Color,
      Placeholder.configure({
        placeholder: placeholder.current,
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          style: 'width: 100%',
        },
      }),
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
                  src: fileSrc,
                },
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
                  src: fileSrc,
                },
              })
              .focus()
              .run();
          }
        },
      }),
      HorizontalRule,
      HardBreak,
    ],
    onDelete: props => {
      if (props.type === 'node' && props.node.type.name === 'image') {
        onImageDelete.current?.(props.node.attrs.src);
      }
    },
    imageMimeTypes: imageMimeTypes.current,
    onImageInsert: onImageInsert.current,
  } as ExtendedUseEditorOptions);

  return { editor };
}
