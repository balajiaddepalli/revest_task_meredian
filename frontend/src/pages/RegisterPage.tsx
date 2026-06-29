import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Alert, Box, Link, Paper } from '@mui/material';
import { DynamicForm } from '@/components/DynamicForm';
import { authApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { PageTitle } from '@/components/PageTitle';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (data: Record<string, string>) => {
    setError('');
    setSubmitting(true);
    try {
      await authApi.registerAccount({
        fullName: data.full_name?.trim(),
        email: data.email?.trim(),
        password: data.password,
        gender: data.gender || undefined,
      });
      showToast('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const raw = axiosErr?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(', ') : raw;
      setError(msg || 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <PageTitle title="Register" />
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          Create Your Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Join Meridian and start shopping today.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>{error}</Alert>
        )}
        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <DynamicForm
            onSubmit={handleRegister}
            submitLabel={submitting ? 'Creating Account…' : 'Create Account'}
            title="Registration Form"
          />
        </Paper>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
