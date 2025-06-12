import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack
} from '@mui/material';
import { SearchNormal1 } from 'iconsax-react';
import CloseIcon from '@mui/icons-material/Close';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { getPartners, PartnerResponse } from 'medipanda/backend';

interface MpPartnerSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (partner: PartnerResponse) => void;
}

export function MpPartnerSearchModal({ open, onClose, onSelect }: MpPartnerSearchModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const errorDialog = useMpErrorDialog();

  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim() && hasSearched) {
      return;
    }

    try {
      setLoading(true);
      const results = await getPartners({
        institutionName: searchKeyword
      });

      setPartners(results.content);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to search partners:', error);
      errorDialog.showError('거래처 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, hasSearched, errorDialog]);

  const handleSelectPartner = useCallback(
    (partner: PartnerResponse) => {
      onSelect(partner);
      onClose();
    },
    [onSelect, onClose]
  );

  const handleClose = useCallback(() => {
    setSearchKeyword('');
    setPartners([]);
    setHasSearched(false);
    onClose();
  }, [onClose]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  React.useEffect(() => {
    if (open && !hasSearched) {
      handleSearch();
    }
  }, [open, hasSearched, handleSearch]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">거래처명 조회</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="거래처명, 제약사명, 회사명, 거래처코드로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" size="small" onClick={handleSearch} disabled={loading}>
                      <SearchNormal1 size={16} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch} disabled={loading} sx={{ minWidth: 80 }}>
              검색
            </Button>
          </Stack>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && hasSearched && (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>제약사명</TableCell>
                  <TableCell>회사명</TableCell>
                  <TableCell>거래처코드</TableCell>
                  <TableCell>거래처명</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    선택
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        검색 결과가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id} hover>
                      <TableCell>{partner.drugCompany}</TableCell>
                      <TableCell>{partner.companyName}</TableCell>
                      <TableCell>{partner.institutionCode}</TableCell>
                      <TableCell>{partner.institutionName}</TableCell>
                      <TableCell align="center">
                        <Button variant="contained" color="success" size="small" onClick={() => handleSelectPartner(partner)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}
