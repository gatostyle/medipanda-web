import * as React from 'react';
import { TableChart } from '@mui/icons-material';

// --- Icons ---
import { ChevronDownIcon } from '../../tiptap-icons/chevron-down-icon';

// --- Hooks ---
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';

// --- Tiptap UI ---
import type { UseTableDropdownMenuConfig } from '../../tiptap-ui/table-dropdown-menu';
import { useTableDropdownMenu } from '../../tiptap-ui/table-dropdown-menu';

// --- UI Primitives ---
import type { ButtonProps } from '../../tiptap-ui-primitive/button';
import { Button, ButtonGroup } from '../../tiptap-ui-primitive/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../tiptap-ui-primitive/dropdown-menu';
import { Card, CardBody } from '../../tiptap-ui-primitive/card';

export interface TableDropdownMenuProps extends Omit<ButtonProps, 'type'>, UseTableDropdownMenuConfig {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dropdown menu component for selecting table actions in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useTableDropdownMenu` hook instead.
 */
export const TableDropdownMenu = React.forwardRef<HTMLButtonElement, TableDropdownMenuProps>(
  ({ editor: providedEditor, portal = false, onOpenChange, ...buttonProps }, ref) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);
    const { isVisible, isActive, canToggle } = useTableDropdownMenu({
      editor,
    });

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!editor || !canToggle) return;
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [canToggle, editor, onOpenChange],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            data-style='ghost'
            data-active-state={isActive ? 'on' : 'off'}
            role='button'
            tabIndex={-1}
            disabled={!canToggle}
            data-disabled={!canToggle}
            aria-label='Insert table'
            aria-pressed={isActive}
            tooltip='Table'
            {...buttonProps}
            ref={ref}
          >
            <TableChart sx={{ fontSize: '16px' }} />
            <ChevronDownIcon className='tiptap-button-dropdown-small' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  >
                    테이블 삽입
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().addColumnBefore().run()}
                  >
                    이전 열 추가
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().addColumnAfter().run()}
                  >
                    다음 열 추가
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().deleteColumn().run()}
                  >
                    열 삭제
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().addRowBefore().run()}
                  >
                    이전 행 추가
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().addRowAfter().run()}
                  >
                    다음 행 추가
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().deleteRow().run()}
                  >
                    행 삭제
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().deleteTable().run()}
                  >
                    테이블 삭제
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().toggleHeaderCell().run()}
                  >
                    헤더색상 토글
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    type='button'
                    data-style='ghost'
                    role='button'
                    tabIndex={-1}
                    disabled={!canToggle}
                    data-disabled={!canToggle}
                    onClick={() => editor?.chain().focus().mergeOrSplit().run()}
                  >
                    셀 합치기/분리
                  </Button>
                </DropdownMenuItem>
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

TableDropdownMenu.displayName = 'TableDropdownMenu';

export default TableDropdownMenu;
