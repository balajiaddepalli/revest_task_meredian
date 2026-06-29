import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, Alert, Chip,
} from '@mui/material';
import { userApi } from '@/lib/api';
import { User } from '@/lib/types';
import { PageTitle } from '@/components/PageTitle';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi.listUsers()
      .then((res) => setUsers(res.data.data || res.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />;

  return (
    <Box>
      <PageTitle title="Users" />
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Users</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registered customer and admin accounts
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {users.length === 0 ? (
        <Typography color="text.secondary">No users found.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role || 'CUSTOMER'}
                      size="small"
                      color={u.role === 'ADMIN' ? 'primary' : 'default'}
                      variant={u.role === 'ADMIN' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{u.gender || '—'}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
