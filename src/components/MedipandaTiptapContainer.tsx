import { colors } from '@/themes';
import { Stack, type StackProps } from '@mui/material';
import { type Editor, EditorContent } from '@tiptap/react';

export const MedipandaEditorContent = ({ editor, ...props }: StackProps & { editor: Editor }) => (
  <Stack
    {...props}
    sx={{
      ...props.sx,
      overflow: 'auto',

      '&:has(.tiptap[contenteditable="true"])': {
        border: `1px solid ${colors.gray30}`,
        boxSizing: 'border-box',
      },

      '.tiptap': {
        padding: '12px 15px',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(props.sx as any)?.['.tiptap'],
        boxSizing: 'border-box',

        '&[contenteditable="true"]': {
          minHeight: '300px',
        },
      },

      '.ProseMirror': {
        'p.is-editor-empty:first-child::before': {
          whiteSpace: 'pre-line',
        },
      },
    }}
    component={EditorContent}
    editor={editor}
  />
);
