import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '@/components/PageTitle';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <PageTitle title="Page Not Found" />
      <Typography variant="h3" gutterBottom>404</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Page not found
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
        <Button variant="outlined" onClick={() => navigate('/products')}>Browse Products</Button>
      </Box>
    </Container>
  );
}
