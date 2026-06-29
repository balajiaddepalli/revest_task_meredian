import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, CardActionArea, Button, Paper, Avatar,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageTitle } from '@/components/PageTitle';
import { useAuth } from '@/contexts/AuthContext';

const actions = [
  {
    title: 'My Orders',
    desc: 'Track and manage your orders',
    icon: ReceiptIcon,
    path: '/dashboard/my-orders',
    color: 'secondary.main',
  },
  {
    title: 'Cart',
    desc: 'Review items and checkout',
    icon: ShoppingCartIcon,
    path: '/dashboard/cart',
    color: 'primary.main',
  },
  {
    title: 'Profile',
    desc: 'Update your account details',
    icon: AccountCircleIcon,
    path: '/dashboard/profile',
    color: 'secondary.dark',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'there';

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <PageTitle title="My Account" />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #141820 0%, #1B2838 100%)',
          color: 'common.white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'secondary.main',
              color: 'primary.dark',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Welcome back, {displayName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              {user?.email}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<StorefrontIcon />}
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/products')}
            sx={{ px: 3 }}
          >
            Browse Products
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
        Quick access
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your orders, cart, and profile
      </Typography>

      <Grid container spacing={3}>
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Grid item xs={12} sm={4} key={a.path}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate(a.path)} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4, px: 2 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'grey.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: a.color,
                      }}
                    >
                      <Icon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{a.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                      {a.desc}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
