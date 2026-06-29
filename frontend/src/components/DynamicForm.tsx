import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Paper, Typography } from '@mui/material';
import { FormField } from './FormField';
import { FormFieldConfig, FormConfig } from '@/lib/types';
import formConfigJson from '@/config/form-config.json';

const defaultFormConfig = formConfigJson as FormConfig;

function fieldKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/\?/g, '');
}

function buildSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    const key = fieldKey(field.name);
    if (field.fieldType === 'TEXT') {
      let v = z.string();
      if (field.required) {
        v = v.min(1, `${field.name} is required`);
      }
      if (field.inputType === 'email') {
        v = v.email('Please enter a valid email address');
      }
      if (field.inputType === 'password') {
        v = v.min(field.minLength || 6, `Password must be at least ${field.minLength || 6} characters`);
      }
      if (field.minLength && field.inputType !== 'password') {
        v = v.min(field.minLength, `Minimum ${field.minLength} characters`);
      }
      if (field.maxLength) {
        v = v.max(field.maxLength, `Maximum ${field.maxLength} characters`);
      }
      shape[key] = v;
    } else if (field.fieldType === 'LIST' || field.fieldType === 'RADIO') {
      shape[key] = field.required
        ? z.string().min(1, `${field.name} is required`)
        : z.string().optional();
    }
  }
  return z.object(shape);
}

function getDefaultValues(fields: FormFieldConfig[]) {
  const values: Record<string, string> = {};
  for (const field of fields) {
    const key = fieldKey(field.name);
    values[key] = field.defaultValue ?? '';
  }
  return values;
}

interface Props {
  config?: FormConfig;
  onSubmit?: (data: Record<string, string>) => void;
  submitLabel?: string;
  title?: string;
}

export function DynamicForm({
  config = defaultFormConfig,
  onSubmit,
  submitLabel = 'Submit',
  title = 'Sign Up',
}: Props) {
  const fields = config.data;
  const schema = buildSchema(fields);
  const defaultValues = getDefaultValues(fields);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        {title}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit?.(data))}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}
      >
        {fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            control={control}
            errors={errors as Record<string, { message?: string }>}
            name={fieldKey(field.name)}
          />
        ))}
        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitLabel.endsWith('…')}>
          {submitLabel}
        </Button>
      </Box>
    </Paper>
  );
}
