import type { FormikProps } from 'formik';
import React from 'react';
import MpDatePicker, { type MpDatePickerProps } from './MpDatePicker';

export interface MpFormikDatePickerProps extends Omit<MpDatePickerProps, 'value' | 'onChange' | 'error' | 'helperText'> {
  name: string;
  formik: FormikProps<any>;
  helperText?: string;
}

export const MpFormikDatePicker: React.FC<MpFormikDatePickerProps> = ({ name, formik, helperText, ...rest }) => {
  const field = formik.getFieldProps(name);
  const meta = formik.getFieldMeta(name);

  const hasError = meta.touched && meta.error;

  return (
    <MpDatePicker
      value={field.value || null}
      onChange={newValue => {
        formik.setFieldValue(name, newValue);
        formik.setFieldTouched(name, true);
      }}
      textFieldProps={{
        ...rest.textFieldProps,
        error: !!hasError,
        helperText: hasError ? meta.error : helperText,
      }}
      {...rest}
    />
  );
};

export default MpFormikDatePicker;
