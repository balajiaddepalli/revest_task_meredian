import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormHelperText,
  InputLabel,
} from '@mui/material';
import { FormFieldConfig } from '@/lib/types';

interface Props<T extends FieldValues> {
  field: FormFieldConfig;
  control: Control<T>;
  errors: Record<string, { message?: string }>;
  name: Path<T>;
}

export function FormField<T extends FieldValues>({ field, control, errors, name }: Props<T>) {
  const error = errors[name];

  if (field.fieldType === 'TEXT') {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: controllerField }) => (
          <TextField
            {...controllerField}
            label={field.name}
            type={field.inputType || 'text'}
            fullWidth
            error={!!error}
            helperText={error?.message || ''}
            required={field.required}
            inputProps={{
              minLength: field.minLength,
              maxLength: field.maxLength,
            }}
          />
        )}
      />
    );
  }

  if (field.fieldType === 'LIST') {
    const labelId = `${String(name)}-label`;
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: controllerField }) => (
          <FormControl fullWidth error={!!error} required={field.required}>
            <InputLabel id={labelId}>{field.name}</InputLabel>
            <Select
              {...controllerField}
              labelId={labelId}
              label={field.name}
            >
              {field.listOfValues1?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

  if (field.fieldType === 'RADIO') {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: controllerField }) => (
          <FormControl fullWidth error={!!error} required={field.required}>
            <FormLabel>{field.name}</FormLabel>
            <RadioGroup {...controllerField} row>
              {field.listOfValues1?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

  return null;
}
