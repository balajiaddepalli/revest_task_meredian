import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/products' },
    { label: 'Featured', to: '/#featured' },
  ],
  Account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Create Account', to: '/register' },
    { label: 'My Orders', to: '/dashboard/my-orders' },
  ],
  Support: [
    { label: 'Contact Us', to: '/products' },
    { label: 'Shipping Info', to: '/products' },
    { label: 'Returns', to: '/products' },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: '#141820',
        color: 'grey.400',
        pt: { xs: 5, md: 7 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ShoppingBagIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 700, letterSpacing: 2 }}>
                MERIDIAN
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ maxWidth: 280, lineHeight: 1.7 }}>
              Curated premium products with fast shipping and secure checkout. Quality you can trust.
            </Typography>
          </Grid>
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} sm={4} md={2.5} key={title}>
              <Typography variant="subtitle2" sx={{ color: 'common.white', mb: 1.5, fontWeight: 600 }}>
                {title}
              </Typography>
              {links.map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  underline="hover"
                  display="block"
                  sx={{ color: 'grey.500', fontSize: '0.875rem', mb: 1, '&:hover': { color: 'secondary.main' } }}
                >
                  {link.label}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 4 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">&copy; {year} Meridian. All rights reserved.</Typography>
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            Privacy · Terms · Cookies
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
