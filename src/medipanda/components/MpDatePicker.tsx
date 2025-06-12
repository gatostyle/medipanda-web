import React from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { TextFieldProps } from '@mui/material/TextField';

export type MpDatePickerView = 'day' | 'month' | 'year';

export interface MpDatePickerProps extends Omit<DatePickerProps<Date>, 'value' | 'onChange' | 'slotProps'> {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  format?: string;
  views?: MpDatePickerView[];
  endAdornment?: React.ReactNode;
  textFieldProps?: Partial<TextFieldProps>;
  slotProps?: DatePickerProps<Date>['slotProps'];
}

export const MpDatePicker: React.FC<MpDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder,
  format = 'yyyy-MM-dd',
  views = ['year', 'month', 'day'],
  endAdornment,
  textFieldProps,
  slotProps,
  ...rest
}) => {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      label={label}
      format={format}
      views={views}
      slotProps={{
        ...slotProps,
        textField: {
          size: 'small',
          fullWidth: true,
          placeholder: placeholder || label,
          ...slotProps?.textField,
          ...textFieldProps,
          InputProps: {
            ...(slotProps?.textField && typeof slotProps.textField === 'object' && 'InputProps' in slotProps.textField
              ? slotProps.textField.InputProps
              : {}),
            ...textFieldProps?.InputProps,
            ...(endAdornment !== undefined && { endAdornment })
          }
        }
      }}
      {...rest}
    />
  );
};

export default MpDatePicker;
