import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { PageTitle } from '@/components/PageTitle';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Admin access only') {
        setError('Admin access only');
        return;
      }
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Invalid email or password');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <PageTitle title="Admin Sign In" />
      <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 1 }}>Meridian Admin Portal</Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Administrator access only
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" size="large" fullWidth>Sign In</Button>
        </Box>
      </Paper>
    </Container>
  );
}
