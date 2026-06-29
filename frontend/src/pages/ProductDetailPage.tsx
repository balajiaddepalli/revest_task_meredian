import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Container, Button, Skeleton, Alert, Chip, Grid, Paper,
  Breadcrumbs, Link, TextField, IconButton, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { productApi, cartApi } from '@/lib/api';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PageTitle } from '@/components/PageTitle';
import { ProductImage } from '@/components/ProductImage';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    productApi.getProduct(id).then((res) => setProduct(res.data)).catch(() => setError('Product not found')).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated || !user) { navigate('/login'); return; }
    try {
      await cartApi.addToCart(product.id, quantity);
      showToast(`Added ${quantity} item(s) to cart!`, 'success', {
        label: 'View Cart',
        onClick: () => navigate('/dashboard/cart'),
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
      <PageTitle title={product.name} />
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">Home</Link>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">Shop</Link>
        <Typography color="text.primary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'grey.50',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <ProductImage product={product} alt={product.name} height={{ xs: 280, sm: 360, md: 420 }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              SKU: {product.sku}
            </Typography>
            {product.category && (
              <Chip label={product.category.name} size="small" sx={{ mb: 2, bgcolor: 'secondary.light', color: 'primary.dark' }} />
            )}
            <Typography variant="h4" color="secondary.dark" sx={{ fontWeight: 700, mb: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
              {product.description || 'No description available.'}
            </Typography>
            <Typography variant="body2" color={product.stockQuantity > 0 ? 'success.main' : 'error'} sx={{ mb: 3, fontWeight: 600 }}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Quantity:</Typography>
              <IconButton aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)} size="small">
                <RemoveIcon />
              </IconButton>
              <TextField size="small" value={quantity} sx={{ width: 56 }} inputProps={{ readOnly: true, style: { textAlign: 'center' } }} />
              <IconButton aria-label="Increase quantity" disabled={quantity >= product.stockQuantity} onClick={() => setQuantity((q) => q + 1)} size="small">
                <AddIcon />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              sx={{ px: 4 }}
            >
              Add to Cart
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
