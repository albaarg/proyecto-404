import * as yup from 'yup';

type FormikValue = string | Date | number | null;
type FormikError = string;

const searchSchema = yup.string()
  .min(3, 'Text must be at least 3 characters')
  .matches(/^[A-Za-z0-9!@#\$%\^\&*\)\(+=._-]+$/, {
    message: 'The text contains illegal characters.',
  })
  .required('Please enter your search');

export const isValid = (value: FormikValue): FormikError | null => {
  try {
    searchSchema.validateSync(value);
    return null;
  } catch (error) {
    return (error as yup.ValidationError).message;
  }
};