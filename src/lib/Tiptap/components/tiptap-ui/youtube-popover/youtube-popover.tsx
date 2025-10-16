'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { YouTube } from '@mui/icons-material';

// --- Hooks ---
import { useIsMobile } from '../../../hooks/use-mobile';
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';

// --- Icons ---
import { CornerDownLeftIcon } from '../../tiptap-icons/corner-down-left-icon';
import { ExternalLinkIcon } from '../../tiptap-icons/external-link-icon';
import { LinkIcon } from '../../tiptap-icons/link-icon';

// --- Tiptap UI ---
import type { UseYoutubePopoverConfig } from './use-youtube-popover';
import { useYoutubePopover } from './use-youtube-popover';

// --- UI Primitives ---
import type { ButtonProps } from '../../tiptap-ui-primitive/button';
import { Button, ButtonGroup } from '../../tiptap-ui-primitive/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../tiptap-ui-primitive/popover';
import { Separator } from '../../tiptap-ui-primitive/separator';
import { Card, CardBody, CardItemGroup } from '../../tiptap-ui-primitive/card';
import { Input, InputGroup } from '../../tiptap-ui-primitive/input';

export interface LinkMainProps {
  /**
   * The URL to set for the link.
   */
  url: string;
  /**
   * Function to update the URL state.
   */
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  /**
   * Function to set the link in the editor.
   */
  setLink: () => void;
  /**
   * Function to open the link.
   */
  openLink: () => void;
  /**
   * Whether the link is currently active in the editor.
   */
  isActive: boolean;
}

export interface YoutubePopoverProps extends Omit<ButtonProps, 'type'>, UseYoutubePopoverConfig {
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean;
}

/**
 * Link button component for triggering the youtube popover
 */
export const YoutubeButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  return (
    <Button
      type='button'
      className={className}
      data-style='ghost'
      role='button'
      tabIndex={-1}
      aria-label='Youtube'
      tooltip='Youtube'
      ref={ref}
      {...props}
    >
      {children || <LinkIcon className='tiptap-button-icon' />}
    </Button>
  );
});

YoutubeButton.displayName = 'YoutubeButton';

/**
 * Main content component for the youtube popover
 */
const YoutubeMain: React.FC<LinkMainProps> = ({ url, setUrl, setLink, openLink, isActive }) => {
  const isMobile = useIsMobile();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <Card
      style={{
        ...(isMobile ? { boxShadow: 'none', border: 0 } : {}),
      }}
    >
      <CardBody
        style={{
          ...(isMobile ? { padding: 0 } : {}),
        }}
      >
        <CardItemGroup orientation='horizontal'>
          <InputGroup>
            <Input
              type='url'
              placeholder='Paste a link...'
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
            />
          </InputGroup>

          <ButtonGroup orientation='horizontal'>
            <Button type='button' onClick={setLink} title='Apply link' disabled={!url && !isActive} data-style='ghost'>
              <CornerDownLeftIcon className='tiptap-button-icon' />
            </Button>
          </ButtonGroup>

          <Separator />

          <ButtonGroup orientation='horizontal'>
            <Button type='button' onClick={openLink} title='Open in new window' disabled={!url && !isActive} data-style='ghost'>
              <ExternalLinkIcon className='tiptap-button-icon' />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  );
};

/**
 * Link content component for standalone use
 */
export const YoutubeContent: React.FC<{
  editor?: Editor | null;
}> = ({ editor }) => {
  const youtubePopover = useYoutubePopover({
    editor,
  });

  return <YoutubeMain {...youtubePopover} />;
};

/**
 * youtube popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
export const YoutubePopover = React.forwardRef<HTMLButtonElement, YoutubePopoverProps>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      onSetLink,
      onOpenChange,
      autoOpenOnLinkActive = true,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);

    const { isVisible, canSet, isActive, url, setUrl, setLink, openLink, label } = useYoutubePopover({
      editor,
      hideWhenUnavailable,
      onSetLink,
    });

    const handleOnOpenChange = React.useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen);
        onOpenChange?.(nextIsOpen);
      },
      [onOpenChange],
    );

    const handleSetLink = React.useCallback(() => {
      setLink();
      setIsOpen(false);
    }, [setLink]);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setIsOpen(!isOpen);
      },
      [onClick, isOpen],
    );

    React.useEffect(() => {
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(true);
      }
    }, [autoOpenOnLinkActive, isActive]);

    if (!isVisible) {
      return null;
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <YoutubeButton
            disabled={!canSet}
            data-active-state={isActive ? 'on' : 'off'}
            data-disabled={!canSet}
            aria-label={label}
            aria-pressed={isActive}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? <YouTube />}
          </YoutubeButton>
        </PopoverTrigger>

        <PopoverContent>
          <YoutubeMain url={url} setUrl={setUrl} setLink={handleSetLink} openLink={openLink} isActive={isActive} />
        </PopoverContent>
      </Popover>
    );
  },
);

YoutubePopover.displayName = 'YoutubePopover';

export default YoutubePopover;
