import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Button, TextField, Card, CardContent,
  CardActions, Grid, Skeleton, Alert, InputAdornment,
  Select, MenuItem, InputLabel, FormControl,
} from '@mui/material';
import { Search, AddShoppingCart } from '@mui/icons-material';
import { productApi, cartApi, categoryApi } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PageTitle } from '@/components/PageTitle';
import { ProductImage } from '@/components/ProductImage';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      const res = await productApi.listProducts(params);
      setProducts(res.data.data || res.data);
      setError('');
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    categoryApi.listCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    try {
      await cartApi.addToCart(productId, 1);
      showToast('Added to cart!', 'success', {
        label: 'View Cart',
        onClick: () => navigate('/dashboard/cart'),
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Failed to add to cart', 'error');
    }
  };

  return (
    <Box>
      <PageTitle title="Shop" />
      <Box sx={{ bgcolor: 'primary.dark', color: 'common.white', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography variant="h3" align="center" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Shop All Products
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 1, opacity: 0.8 }}>
            Browse our curated collection
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Search products"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 320px' } }}
          />
          <FormControl sx={{ flex: { xs: '1 1 100%', sm: '0 1 220px' }, minWidth: 180 }}>
            <InputLabel id="public-category-label">Category</InputLabel>
            <Select
              labelId="public-category-label"
              id="public-category-select"
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ py: 8 }}>
            No products found
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <ProductImage product={product} alt={product.name} height={200} />
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">SKU: {product.sku}</Typography>
                    <Typography variant="h6" color="secondary.dark" sx={{ mt: 1.5, fontWeight: 700 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color={product.stockQuantity > 0 ? 'text.secondary' : 'error'} sx={{ mt: 0.5 }}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="medium"
                      variant="contained"
                      color="primary"
                      startIcon={<AddShoppingCart />}
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stockQuantity <= 0}
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
