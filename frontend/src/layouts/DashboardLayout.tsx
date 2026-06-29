import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Box, Button, IconButton, useMediaQuery, useTheme, CircularProgress,
  Avatar, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'My Orders', icon: <ReceiptIcon />, path: '/dashboard/my-orders' },
  { label: 'Cart', icon: <ShoppingCartIcon />, path: '/dashboard/cart' },
  { label: 'Profile', icon: <AccountCircleIcon />, path: '/dashboard/profile' },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Account';
  const isSelected = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, minHeight: { xs: 64, sm: 72 } }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: 2, color: 'primary.dark' }}>
          MERIDIAN
        </Typography>
      </Toolbar>
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main', color: 'primary.dark', fontSize: '1rem' }}>
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{displayName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{user?.email}</Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={isSelected(item.path)}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.dark',
                  color: 'common.white',
                  '& .MuiListItemIcon-root': { color: 'secondary.main' },
                  '&:hover': { bgcolor: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isSelected(item.path) ? 'secondary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isSelected(item.path) ? 600 : 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<StorefrontIcon />}
          onClick={() => { navigate('/products'); setMobileOpen(false); }}
          sx={{ mb: 1 }}
        >
          Browse Products
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'primary.dark' }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" aria-label="Open navigation menu" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            My Account
          </Typography>
          <Button color="inherit" startIcon={<StorefrontIcon />} onClick={() => navigate('/products')} sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}>
            Shop
          </Button>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, width: '100%', ml: isMobile ? 0 : `${drawerWidth}px` }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
}
