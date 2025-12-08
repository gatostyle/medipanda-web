'use client';

import { IS_ADMIN_MODE } from '@/constants';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import * as React from 'react';
import { EditorContent, EditorContext } from '@tiptap/react';

// --- UI Primitives ---
import { Button } from '../../tiptap-ui-primitive/button';
import { Spacer } from '../../tiptap-ui-primitive/spacer';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '../../tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import '../../tiptap-node/blockquote-node/blockquote-node.scss';
import '../../tiptap-node/code-block-node/code-block-node.scss';
import '../../tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '../../tiptap-node/list-node/list-node.scss';
import '../../tiptap-node/image-node/image-node.scss';
import '../../tiptap-node/heading-node/heading-node.scss';
import '../../tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '../../tiptap-ui/heading-dropdown-menu';
import { ListDropdownMenu } from '../../tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '../../tiptap-ui/blockquote-button';
import { CodeBlockButton } from '../../tiptap-ui/code-block-button';
import { ColorHighlightPopover, ColorHighlightPopoverContent, ColorHighlightPopoverButton } from '../../tiptap-ui/color-highlight-popover';
import { ImageUploadButton } from '../../tiptap-ui/image-upload-button';
import { LinkPopover, LinkContent, LinkButton } from '../../tiptap-ui/link-popover';
import { MarkButton } from '../../tiptap-ui/mark-button';
import { TextAlignButton } from '../../tiptap-ui/text-align-button';
import { UndoRedoButton } from '../../tiptap-ui/undo-redo-button';
import { TableDropdownMenu } from '../../tiptap-ui/table-dropdown-menu';
import { YoutubePopover, YoutubeContent, YoutubeButton } from '../../tiptap-ui/youtube-popover';

// --- Icons ---
import { ArrowLeftIcon } from '../../tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '../../tiptap-icons/highlighter-icon';
import { LinkIcon } from '../../tiptap-icons/link-icon';

// --- Hooks ---
import { useIsMobile } from '../../../hooks/use-mobile';
import { useWindowSize } from '../../../hooks/use-window-size';
import { useCursorVisibility } from '../../../hooks/use-cursor-visibility';

// --- Styles ---
import '../../tiptap-templates/simple/simple-editor.scss';

import content from '../../tiptap-templates/simple/data/content.json';

export const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onYoutubeClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onYoutubeClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} portal={isMobile} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='bold' />
        <MarkButton type='italic' />
        <MarkButton type='strike' />
        <MarkButton type='code' />
        <MarkButton type='underline' />
        {!isMobile ? <ColorHighlightPopover /> : <ColorHighlightPopoverButton onClick={onHighlighterClick} />}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        {!isMobile ? <YoutubePopover /> : <YoutubeButton onClick={onYoutubeClick} />}
        <TableDropdownMenu portal={isMobile} />
      </ToolbarGroup>

      {/*<ToolbarSeparator />*/}

      {/*<ToolbarGroup>*/}
      {/*  <MarkButton type='superscript' />*/}
      {/*  <MarkButton type='subscript' />*/}
      {/*</ToolbarGroup>*/}

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align='left' />
        <TextAlignButton align='center' />
        <TextAlignButton align='right' />
        <TextAlignButton align='justify' />
      </ToolbarGroup>

      <ToolbarSeparator />

      {IS_ADMIN_MODE && (
        <ToolbarGroup>
          <ImageUploadButton />
        </ToolbarGroup>
      )}

      <Spacer />

      {/*{isMobile && <ToolbarSeparator />}*/}

      {/*<ToolbarGroup>*/}
      {/*  <ThemeToggle />*/}
      {/*</ToolbarGroup>*/}
    </>
  );
};

export const MobileToolbarContent = ({ type, onBack }: { type: 'highlighter' | 'link' | 'youtube'; onBack: () => void }) => (
  <>
    <ToolbarGroup>
      <Button data-style='ghost' onClick={onBack}>
        <ArrowLeftIcon className='tiptap-button-icon' />
        {type === 'highlighter' ? <HighlighterIcon className='tiptap-button-icon' /> : <LinkIcon className='tiptap-button-icon' />}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : type === 'link' ? <LinkContent /> : <YoutubeContent />}
  </>
);

export function SimpleEditor() {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link' | 'youtube'>('main');
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const { editor } = useMedipandaEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    content,
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <Toolbar
        ref={toolbarRef}
        style={{
          ...(isMobile
            ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
            : {}),
        }}
      >
        {mobileView === 'main' ? (
          <MainToolbarContent
            onHighlighterClick={() => setMobileView('highlighter')}
            onLinkClick={() => setMobileView('link')}
            onYoutubeClick={() => setMobileView('youtube')}
            isMobile={isMobile}
          />
        ) : (
          <MobileToolbarContent type={mobileView === 'highlighter' ? 'highlighter' : 'link'} onBack={() => setMobileView('main')} />
        )}
      </Toolbar>

      <EditorContent editor={editor} role='presentation' className='simple-editor-content' />
    </EditorContext.Provider>
  );
}
