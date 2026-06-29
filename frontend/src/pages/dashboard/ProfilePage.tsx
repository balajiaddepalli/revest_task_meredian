import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Skeleton, Alert, Avatar,
  FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PageTitle } from '@/components/PageTitle';

const GENDER_OPTIONS = ['Male', 'Female', 'Others'];

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', gender: '' });

  useEffect(() => {
    if (!userId) return;
    userApi.getMyProfile().then((res) => {
      setForm({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
        gender: res.data.gender || '',
      });
    }).catch(() => setError('Failed to load profile')).finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await userApi.updateMyProfile({ fullName: form.fullName, gender: form.gender });
      showToast('Profile updated');
    } catch {
      setError('Failed to update profile');
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <PageTitle title="Profile" />
      <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>My Profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your personal information
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'secondary.main', color: 'primary.dark', fontSize: '1.75rem', fontWeight: 700 }}>
            {form.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{form.fullName || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">{form.email}</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} fullWidth />
          <TextField label="Email" value={form.email} disabled fullWidth helperText="Email cannot be changed" />
          <FormControl fullWidth>
            <InputLabel id="profile-gender-label">Gender</InputLabel>
            <Select
              labelId="profile-gender-label"
              id="profile-gender-select"
              value={form.gender}
              label="Gender"
              inputProps={{ 'aria-labelledby': 'profile-gender-label' }}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              {GENDER_OPTIONS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving} sx={{ alignSelf: 'flex-start', px: 4 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
