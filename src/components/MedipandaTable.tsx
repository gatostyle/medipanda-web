import { TableCell, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors, typography } from '../globalStyles.ts';

export const MedipandaTableRow = styled(TableRow)({
  '.MuiTableHead-root &': {
    borderWidth: '1px 0px',
    borderStyle: 'solid',
    borderColor: colors.gray50,
  },
  '.MuiTableBody-root &': {
    borderBottom: `1px solid ${colors.gray30}`,
  },
});

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
});
