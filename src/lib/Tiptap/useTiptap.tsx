import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { Dropcursor, Placeholder, UndoRedo } from '@tiptap/extensions';
import { FileHandler } from '@tiptap/extension-file-handler';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Highlight } from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { BulletList, ListItem, OrderedList, TaskItem, TaskList } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Youtube } from '@tiptap/extension-youtube';
import { Editor, useEditor, type UseEditorOptions } from '@tiptap/react';
import { useRef } from 'react';
import { ResizableImage } from 'tiptap-extension-resizable-image';
import { type ExtendedUseEditorOptions } from './Tiptap';

export interface UseTiptapOptions extends UseEditorOptions {
  placeholder?: string;
  imageMimeTypes: ExtendedUseEditorOptions['imageMimeTypes'];
  onImageInsert: ExtendedUseEditorOptions['onImageInsert'];
  onImageDelete: (fileUrl: string) => void;
}

export function useTiptap({ placeholder, imageMimeTypes, onImageInsert, onImageDelete, ...props }: UseTiptapOptions): {
  editor: Editor;
} {
  const placeholderRef = useRef(placeholder);
  const imageMimeTypesRef = useRef(imageMimeTypes);
  const onImageInsertRef = useRef(onImageInsert);
  const onImageDeleteRef = useRef(onImageDelete);

  const editor = useEditor({
    ...props,
    editorProps: {
      ...props.editorProps,
      transformPastedHTML(html) {
        return html.replace(/<img.*?>/g, '');
      },
    },
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
      Highlight,
      ListItem,
      BulletList,
      OrderedList,
      TaskList,
      TaskItem,
      Code,
      CodeBlock,
      Blockquote,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      Color,
      Placeholder.configure({
        placeholder: placeholderRef.current,
      }),
      ResizableImage.configure({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultHeight: '' as any,
      }),
      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
      UndoRedo,
      Dropcursor,
      FileHandler.configure({
        allowedMimeTypes: imageMimeTypesRef.current,
        onDrop: async (currentEditor, files, pos) => {
          for (const file of files) {
            const fileSrc = await onImageInsertRef.current?.(file);

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
            const fileSrc = await onImageInsertRef.current?.(file);

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
      Youtube,
      HorizontalRule,
      HardBreak,
    ],
    onDelete: props => {
      if (props.type === 'node' && props.node.type.name === 'image') {
        onImageDeleteRef.current?.(props.node.attrs.src);
      }
    },
    imageMimeTypes: imageMimeTypesRef.current,
    onImageInsert: onImageInsertRef.current,
  } as ExtendedUseEditorOptions);

  return { editor };
}
