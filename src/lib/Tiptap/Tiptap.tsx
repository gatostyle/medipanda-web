/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  HorizontalRule,
  Image as ImageIcon,
  KeyboardReturn,
  Redo,
  Title,
  Undo,
} from '@mui/icons-material';
import './Tiptap.scss';
import { IconButton, Stack, type StackProps } from '@mui/material';
import { type Editor, EditorContent, type UseEditorOptions, useEditorState } from '@tiptap/react';

export interface ExtendedUseEditorOptions extends UseEditorOptions {
  imageMimeTypes: string[];
  onImageInsert: (file: File) => Promise<string | ArrayBuffer | null>;
}

export function TiptapMenuBar({ editor }: { editor: Editor }) {
  const { imageMimeTypes, onImageInsert } = editor.options as ExtendedUseEditorOptions;

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: (ctx.editor.can().chain() as any).toggleBold ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: (ctx.editor.can().chain() as any).toggleItalic ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: (ctx.editor.can().chain() as any).toggleStrike ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        canUnderline: (ctx.editor.can().chain() as any).toggleUnderline ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: (ctx.editor.can().chain() as any).toggleCode ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        canHeading1: (ctx.editor.can().chain() as any).toggleHeading ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        canBulletList: (ctx.editor.can().chain() as any).toggleBulletList ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        canOrderedList: (ctx.editor.can().chain() as any).toggleOrderedList ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        canCodeBlock: (ctx.editor.can().chain() as any).toggleCodeBlock ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canBlockquote: (ctx.editor.can().chain() as any).toggleBlockquote ?? false,
        canHorizontalRule: (ctx.editor.can().chain() as any).setHorizontalRule ?? false,
        canHardBreak: (ctx.editor.can().chain() as any).setHardBreak ?? false,
        canUndo: (ctx.editor.can().chain() as any).undo ?? false,
        canRedo: (ctx.editor.can().chain() as any).redo ?? false,
        canInsertImage: (ctx.editor.can().chain() as any).setImage ?? false,
      };
    },
  });

  const handleImageInsert = () => {
    if (editor) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = imageMimeTypes.join(',') ?? 'image/*';
      input.multiple = true;
      input.onchange = () => {
        Array.from(input.files ?? []).forEach(handleImageUpload);
      };
      input.click();
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileSrc = await onImageInsert(file);

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

  return (
    <Stack gap={1}>
      <Stack direction='row' gap={0.5}>
        {editorState.canBold && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleBold().run()}
            size='small'
            color={editorState.isBold ? 'primary' : undefined}
          >
            <FormatBold />
          </IconButton>
        )}
        {editorState.canItalic && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleItalic().run()}
            size='small'
            color={editorState.isItalic ? 'primary' : undefined}
          >
            <FormatItalic />
          </IconButton>
        )}
        {editorState.canStrike && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleStrike().run()}
            size='small'
            color={editorState.isStrike ? 'primary' : undefined}
          >
            <FormatStrikethrough />
          </IconButton>
        )}
        {editorState.canUnderline() && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}
            size='small'
            color={editorState.isUnderline ? 'primary' : undefined}
          >
            <FormatUnderlined />
          </IconButton>
        )}
        {editorState.canCode && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleCode().run()}
            size='small'
            color={editorState.isCode ? 'primary' : undefined}
          >
            <Code />
          </IconButton>
        )}
        {editorState.canHeading1 && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 1 }).run()}
            size='small'
            color={editorState.isHeading1 ? 'primary' : undefined}
          >
            <Title />
          </IconButton>
        )}
        {editorState.canBulletList && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleBulletList().run()}
            size='small'
            color={editorState.isBulletList ? 'primary' : undefined}
          >
            <FormatListBulleted />
          </IconButton>
        )}
        {editorState.canOrderedList && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()}
            size='small'
            color={editorState.isOrderedList ? 'primary' : undefined}
          >
            <FormatListNumbered />
          </IconButton>
        )}
        {editorState.canCodeBlock && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleCodeBlock().run()}
            size='small'
            color={editorState.isCodeBlock ? 'primary' : undefined}
          >
            <Code />
          </IconButton>
        )}
        {editorState.canBlockquote && (
          <IconButton
            onClick={() => (editor.chain().focus() as any).toggleBlockquote().run()}
            size='small'
            color={editorState.isBlockquote ? 'primary' : undefined}
          >
            <FormatQuote />
          </IconButton>
        )}
        {editorState.canHorizontalRule && (
          <IconButton onClick={() => (editor.chain().focus() as any).setHorizontalRule().run()} size='small'>
            <HorizontalRule />
          </IconButton>
        )}
        {editorState.canHardBreak && (
          <IconButton onClick={() => (editor.chain().focus() as any).setHardBreak().run()} size='small'>
            <KeyboardReturn />
          </IconButton>
        )}
        {editorState.canUndo && (
          <IconButton onClick={() => (editor.chain().focus() as any).undo().run()} size='small'>
            <Undo />
          </IconButton>
        )}
        {editorState.canRedo && (
          <IconButton onClick={() => (editor.chain().focus() as any).redo().run()} size='small'>
            <Redo />
          </IconButton>
        )}
        {editorState.canInsertImage && (
          <IconButton onClick={handleImageInsert} size='small'>
            <ImageIcon />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
}

export function Tiptap({
  editor,
  sx,
}: {
  editor: Editor;
} & Pick<StackProps, 'sx'>) {
  const editorState = useEditorState({
    editor,
    selector: context => ({
      isEditable: context.editor.isEditable,
    }),
  });

  return (
    <Stack
      gap='10px'
      sx={{
        ...sx,
        '.tiptap[contenteditable=true]': {
          border: `1px solid #cccccc`,
          padding: '12px 15px',
        },
      }}
    >
      {editorState.isEditable && <TiptapMenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </Stack>
  );
}
