import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Container, Grid, Card,
  CardContent, CardActions, Skeleton, Chip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import { productApi } from '@/lib/api';
import { Product } from '@/lib/types';
import { PageTitle } from '@/components/PageTitle';
import { ProductImage } from '@/components/ProductImage';

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.listProducts({ take: 3 }).then((res) => {
      setFeatured(res.data.data || res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageTitle title="Home" />

      {/* Hero — full bleed */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #141820 0%, #1B2838 45%, #2D3E50 100%)',
          color: 'common.white',
          py: { xs: 8, sm: 10, md: 14 },
          px: 2,
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
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Chip
            label="Premium Collection"
            size="small"
            sx={{ mb: 3, bgcolor: 'rgba(196,165,116,0.2)', color: 'secondary.light', border: '1px solid rgba(196,165,116,0.35)' }}
          />
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' }, mb: 2, lineHeight: 1.15 }}
          >
            Modern Commerce, Simplified.
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.85, mb: 4, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 520, mx: 'auto', lineHeight: 1.6 }}
          >
            Discover a curated collection of premium products. Fast shipping, secure checkout.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/products')}
              sx={{ px: 4, py: 1.25 }}
            >
              Browse Products
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'common.white',
                px: 4,
                py: 1.25,
                '&:hover': { borderColor: 'secondary.main', bgcolor: 'rgba(196,165,116,0.1)' },
              }}
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Featured products */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 }, px: { xs: 2, sm: 3 } }} id="featured">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 3, fontWeight: 600 }}>
            Featured
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
            Featured Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Handpicked just for you
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : featured.length === 0 ? (
          <Typography align="center" color="text.secondary">No products yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {featured.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Box sx={{ overflow: 'hidden' }}>
                    <ProductImage product={p} alt={p.name} height={220} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 2.5, pb: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, minHeight: 40 }}>
                      {p.description?.slice(0, 90)}{(p.description?.length || 0) > 90 ? '…' : ''}
                    </Typography>
                    <Typography variant="h5" color="secondary.dark" sx={{ fontWeight: 700 }}>
                      ${p.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="medium"
                      fullWidth
                      onClick={() => navigate(`/products/${p.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button variant="contained" color="primary" size="large" onClick={() => navigate('/products')}>
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Value props */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 }, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={4}>
            {[
              { icon: <InventoryIcon sx={{ fontSize: 40 }} />, title: 'Curated Collection', desc: 'Every product is hand-selected for quality and value.' },
              { icon: <LocalShippingIcon sx={{ fontSize: 40 }} />, title: 'Fast Shipping', desc: 'Free delivery on orders over $50.' },
              { icon: <SecurityIcon sx={{ fontSize: 40 }} />, title: 'Secure Checkout', desc: 'Your payment information is always protected.' },
            ].map((f) => (
              <Grid item xs={12} md={4} key={f.title}>
                <Box sx={{ textAlign: 'center', px: { xs: 1, md: 2 } }}>
                  <Box sx={{ color: 'secondary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>{f.icon}</Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
