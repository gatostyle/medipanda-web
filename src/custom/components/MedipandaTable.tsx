import { colors, typography } from '@/themes';
import { Table, TableBody, TableCell, TableHead, type TableProps, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { flexRender, useReactTable } from '@tanstack/react-table';

export const MedipandaTableRow = styled(TableRow)({
  '.MuiTableHead-root &': {
    borderWidth: '1px 0px',
    borderStyle: 'solid',
    borderColor: colors.gray50,
  },
  '.MuiTableBody-root &': {
    borderBottom: `1px solid ${colors.gray30}`,
  },
}) as typeof TableRow;

export const MedipandaTableCell = styled(TableCell)({
  border: 'none',
  textAlign: 'center',
  '.MuiTableHead-root &': {
    ...typography.largeTextM,
    color: colors.gray80,
  },
  '.MuiTableBody-root &': {
    ...typography.smallTextR,
    color: colors.gray70,
  },
}) as typeof TableCell;

export function MedipandaTable<T>({ table, ...props }: TableProps & { table: ReturnType<typeof useReactTable<T>> }) {
  return (
    <Table {...props}>
      <TableHead>
        {table.getHeaderGroups().map(headerGroup => (
          <MedipandaTableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <MedipandaTableCell key={header.id} style={{ width: header.getSize() }}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </MedipandaTableCell>
            ))}
          </MedipandaTableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <MedipandaTableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <MedipandaTableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</MedipandaTableCell>
            ))}
          </MedipandaTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
