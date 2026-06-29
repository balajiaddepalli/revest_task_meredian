import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Alert, Link, Chip } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '@/contexts/AuthContext';
import { PageTitle } from '@/components/PageTitle';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Invalid email or password');
    }
  };

  return (
    <Box>
      <PageTitle title="Sign In" />

      <Box
        sx={{
          background: 'linear-gradient(135deg, #141820 0%, #1B2838 45%, #2D3E50 100%)',
          color: 'common.white',
          py: { xs: 5, md: 6 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 70% 20%, rgba(196,165,116,0.15) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', textAlign: 'center' }}>
          <Chip
            label="Meridian"
            size="small"
            sx={{ mb: 2, bgcolor: 'rgba(196,165,116,0.2)', color: 'secondary.light', border: '1px solid rgba(196,165,116,0.35)' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Sign in to manage your orders, cart, and profile.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xs" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 4, md: 5 }, mt: { xs: -3, md: -4 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" color="secondary" size="large" fullWidth startIcon={<LoginIcon />} sx={{ py: 1.25 }}>
              Sign In
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>Create one</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
