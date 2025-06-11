import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import { styled, alpha } from '@mui/material/styles';

interface TiptapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  readOnly?: boolean;
}

const StyledPaper = styled(Paper)<{ error?: boolean; readOnly?: boolean }>(({ theme, error, readOnly }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
  transition: 'all 0.2s ease',
  backgroundColor: readOnly ? theme.palette.grey[50] : theme.palette.background.paper,
  '&:hover': {
    borderColor: readOnly ? theme.palette.divider : error ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.3)
  },
  '&:focus-within': {
    borderColor: readOnly ? theme.palette.divider : error ? theme.palette.error.main : theme.palette.primary.main,
    boxShadow: readOnly ? 'none' : `0 0 0 3px ${error ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1)}`
  }
}));

const Toolbar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
  backgroundColor: theme.palette.background.default
}));

const ToolbarIconButton = styled(IconButton)<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.75),
  transition: 'all 0.2s ease',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.action.hover, 0.08),
    color: active ? theme.palette.primary.main : theme.palette.text.primary
  },
  '&:disabled': {
    opacity: 0.5
  }
}));

const EditorContent2 = styled(EditorContent)<{ readOnly?: boolean }>(({ theme, readOnly }) => ({
  '& .tiptap': {
    padding: theme.spacing(2),
    minHeight: readOnly ? 'auto' : 200,
    outline: 'none',
    cursor: readOnly ? 'default' : 'text',
    position: 'relative',
    '&.tiptap-empty:before': {
      content: 'attr(data-placeholder)',
      position: 'absolute',
      color: theme.palette.text.disabled,
      pointerEvents: 'none'
    },
    '& p': {
      margin: 0,
      marginBottom: theme.spacing(1),
      '&:last-child': {
        marginBottom: 0
      }
    },
    '& h1, & h2, & h3': {
      margin: 0,
      marginBottom: theme.spacing(1.5),
      fontWeight: 600
    },
    '& h1': {
      fontSize: '2rem'
    },
    '& h2': {
      fontSize: '1.5rem'
    },
    '& h3': {
      fontSize: '1.25rem'
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(3),
      marginBottom: theme.spacing(1)
    },
    '& li': {
      marginBottom: theme.spacing(0.5)
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: theme.shape.borderRadius,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    '& code': {
      backgroundColor: alpha(theme.palette.grey[500], 0.1),
      borderRadius: 4,
      padding: '2px 4px',
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: '0.875em'
    },
    '& pre': {
      backgroundColor: alpha(theme.palette.grey[900], 0.05),
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      overflow: 'auto',
      marginBottom: theme.spacing(1)
    }
  }
}));

const VerticalDivider = styled(Divider)(({ theme }) => ({
  height: 24,
  margin: theme.spacing(0, 0.5),
  backgroundColor: theme.palette.divider
}));

export function TiptapEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요',
  error = false,
  helperText,
  readOnly = false
}: TiptapEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: readOnly,
        HTMLAttributes: {
          class: 'tiptap-link',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image'
        },
        allowBase64: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (!readOnly && onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        'data-placeholder': readOnly ? '' : placeholder
      },
      handlePaste: (view, event) => {
        if (readOnly) return false;

        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.indexOf('image') !== -1);

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              const { state, dispatch } = view;
              const node = state.schema.nodes.image.create({ src });
              const transaction = state.tr.replaceSelectionWith(node);
              dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }

        const html = event.clipboardData?.getData('text/html');
        if (html) {
          event.preventDefault();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const images = doc.querySelectorAll('img');
          images.forEach((img) => {
            const src = img.src;
            if (src && !src.startsWith('data:')) {
              img.setAttribute('src', src);
            }
          });

          view.pasteHTML(doc.body.innerHTML);
          return true;
        }

        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (readOnly || moved) return false;

        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (!coordinates) return false;

        const items = Array.from(event.dataTransfer?.items || []);
        const imageItem = items.find((item) => item.type.indexOf('image') !== -1);

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              const { state, dispatch } = view;
              const node = state.schema.nodes.image.create({ src });
              const transaction = state.tr.insert(coordinates.pos, node);
              dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }

        return false;
      }
    }
  });

  React.useEffect(() => {
    if (editor) {
      const updateClass = () => {
        const element = editor.view.dom;
        if (editor.isEmpty) {
          element.classList.add('tiptap-empty');
        } else {
          element.classList.remove('tiptap-empty');
        }
      };
      updateClass();
      editor.on('update', updateClass);
      return () => {
        editor.off('update', updateClass);
      };
    }
  }, [editor]);

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      const element = editor.view.dom;
      if (editor.isEmpty) {
        element.classList.add('tiptap-empty');
      } else {
        element.classList.remove('tiptap-empty');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('이미지 URL을 입력하세요:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  const handleLinkSave = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    closeLinkDialog();
  };

  const handleLinkRemove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    closeLinkDialog();
  };

  return (
    <Box>
      <StyledPaper error={error} elevation={0} readOnly={readOnly}>
        {!readOnly && (
          <>
            <Toolbar>
              <Tooltip title="굵게">
                <ToolbarIconButton
                  active={editor.isActive('bold')}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  size="small"
                >
                  <FormatBoldIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="기울임">
                <ToolbarIconButton
                  active={editor.isActive('italic')}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  size="small"
                >
                  <FormatItalicIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="취소선">
                <ToolbarIconButton
                  active={editor.isActive('strike')}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  size="small"
                >
                  <FormatStrikethroughIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="코드">
                <ToolbarIconButton
                  active={editor.isActive('code')}
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  disabled={!editor.can().chain().focus().toggleCode().run()}
                  size="small"
                >
                  <CodeIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <VerticalDivider orientation="vertical" flexItem />

              <Tooltip title="제목 1">
                <ToolbarIconButton
                  active={editor.isActive('heading', { level: 1 })}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  size="small"
                >
                  <FormatSizeIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="제목 2">
                <ToolbarIconButton
                  active={editor.isActive('heading', { level: 2 })}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  size="small"
                  sx={{ fontSize: '0.9rem' }}
                >
                  H2
                </ToolbarIconButton>
              </Tooltip>

              <VerticalDivider orientation="vertical" flexItem />

              <Tooltip title="글머리 기호">
                <ToolbarIconButton
                  active={editor.isActive('bulletList')}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  size="small"
                >
                  <FormatListBulletedIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="번호 목록">
                <ToolbarIconButton
                  active={editor.isActive('orderedList')}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  size="small"
                >
                  <FormatListNumberedIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <VerticalDivider orientation="vertical" flexItem />

              <Tooltip title="왼쪽 정렬">
                <ToolbarIconButton
                  active={editor.isActive({ textAlign: 'left' })}
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  size="small"
                >
                  <FormatAlignLeftIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="가운데 정렬">
                <ToolbarIconButton
                  active={editor.isActive({ textAlign: 'center' })}
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  size="small"
                >
                  <FormatAlignCenterIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="오른쪽 정렬">
                <ToolbarIconButton
                  active={editor.isActive({ textAlign: 'right' })}
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  size="small"
                >
                  <FormatAlignRightIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <VerticalDivider orientation="vertical" flexItem />

              <Tooltip title="링크">
                <ToolbarIconButton active={editor.isActive('link')} onClick={openLinkDialog} size="small">
                  <LinkIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="이미지">
                <ToolbarIconButton onClick={addImage} size="small">
                  <ImageIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <VerticalDivider orientation="vertical" flexItem />

              <Tooltip title="실행 취소">
                <ToolbarIconButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  size="small"
                >
                  <UndoIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>

              <Tooltip title="다시 실행">
                <ToolbarIconButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  size="small"
                >
                  <RedoIcon fontSize="small" />
                </ToolbarIconButton>
              </Tooltip>
            </Toolbar>

            <Divider />
          </>
        )}

        <EditorContent2 editor={editor} readOnly={readOnly} />
      </StyledPaper>

      {!readOnly && helperText && (
        <Box sx={{ mt: 1 }}>
          <FormHelperText error={error}>{helperText}</FormHelperText>
        </Box>
      )}

      <Dialog open={linkDialogOpen} onClose={closeLinkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>링크 설정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            type="url"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            {editor.isActive('link') && (
              <Button onClick={handleLinkRemove} color="error">
                링크 제거
              </Button>
            )}
          </Box>
          <Box>
            <Button onClick={closeLinkDialog}>취소</Button>
            <Button onClick={handleLinkSave} variant="contained">
              저장
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
