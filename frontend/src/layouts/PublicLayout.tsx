import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, Badge, useMediaQuery, useTheme, Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '@/contexts/AuthContext';
import { cartApi } from '@/lib/api';
import { SiteFooter } from '@/components/SiteFooter';

export function PublicLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!user?.id) {
      setCartCount(0);
      return;
    }
    cartApi.getCart().then((res) => {
      const items = res.data?.items;
      const parsed = typeof items === 'string' ? JSON.parse(items) : items || [];
      setCartCount(Array.isArray(parsed) ? parsed.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) : 0);
    }).catch(() => setCartCount(0));
  }, [user?.id, location.pathname]);

  const navLinks = isAuthenticated
    ? [
        { label: 'Shop', path: '/products' },
        { label: 'Cart', path: '/dashboard/cart', icon: 'cart' as const },
        { label: 'My Orders', path: '/dashboard/my-orders' },
        { label: 'Account', path: '/dashboard' },
      ]
    : [
        { label: 'Shop', path: '/products' },
        { label: 'Sign In', path: '/login' },
      ];

  const renderNavButton = (item: { label: string; path: string; icon?: 'cart' }) => (
    <Button
      key={item.path}
      color="inherit"
      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
      sx={{ color: 'grey.300', '&:hover': { color: 'secondary.main', bgcolor: 'transparent' } }}
      startIcon={item.icon === 'cart' ? (
        <Badge badgeContent={cartCount} color="secondary">
          <ShoppingCartIcon />
        </Badge>
      ) : undefined}
    >
      {item.icon === 'cart' ? 'Cart' : item.label}
    </Button>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.dark' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
            <ShoppingBagIcon
              sx={{ mr: 1, cursor: 'pointer', color: 'secondary.main' }}
              onClick={() => navigate('/')}
            />
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', color: 'common.white' }}
              onClick={() => navigate('/')}
            >
              MERIDIAN
            </Typography>
            {isMobile ? (
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>{navLinks.map(renderNavButton)}</Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 260, pt: 2 }}>
          {navLinks.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton onClick={() => { navigate(item.path); setDrawerOpen(false); }}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flex: 1 }} className="fade-in">
        <Outlet />
      </Box>

      <SiteFooter />
    </Box>
  );
}
