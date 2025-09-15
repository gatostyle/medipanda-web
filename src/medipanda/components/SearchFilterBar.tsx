import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { ReactNode } from 'react';

interface SearchFilterItemProps {
  children: ReactNode;
  flexGrow?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface SearchFilterActionsProps {
  children: ReactNode;
}

export const SearchFilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1.5),
    '& > *': {
      minWidth: 'auto',
      maxWidth: 'none',
      width: '100%',
    },
  },
})) as typeof Box;

const FilterItem = styled(Box)<{ flexGrow?: number; minWidth?: number; maxWidth?: number }>(({ theme, flexGrow, minWidth, maxWidth }) => ({
  flexGrow: flexGrow || 0,
  flexShrink: 0,
  minWidth: minWidth || 'auto',
  maxWidth: maxWidth || 'none',

  [theme.breakpoints.up('md')]: {
    minWidth: minWidth || 'auto',
    maxWidth: maxWidth || 'none',
  },
}));

const FilterActions = styled(Stack)(({ theme }) => ({
  flexShrink: 0,
  marginLeft: 'auto',

  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    justifyContent: 'center',
  },
}));

export function SearchFilterItem({ children, flexGrow, minWidth, maxWidth }: SearchFilterItemProps) {
  return (
    <FilterItem flexGrow={flexGrow} minWidth={minWidth} maxWidth={maxWidth}>
      {children}
    </FilterItem>
  );
}

export function SearchFilterActions({ children }: SearchFilterActionsProps) {
  return (
    <FilterActions direction='row' spacing={1}>
      {children}
    </FilterActions>
  );
}
