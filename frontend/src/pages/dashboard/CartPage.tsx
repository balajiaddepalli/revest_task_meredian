import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, Alert, Button, IconButton, TextField, Radio,
  RadioGroup, FormControlLabel, FormLabel, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Delete, ShoppingCartCheckout, Remove, Add as AddIcon, Storefront } from '@mui/icons-material';
import { cartApi, productApi } from '@/lib/api';
import { Product, CartItem } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageTitle } from '@/components/PageTitle';
import { ProductImage } from '@/components/ProductImage';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearOpen, setClearOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const defaultCustomerName = user?.fullName || user?.email?.split('@')[0] || '';
  const [checkoutForm, setCheckoutForm] = useState({ customerName: defaultCustomerName, customerEmail: user?.email || '', paymentMethod: 'COD' });

  const fetchCart = async () => {
    if (!user) return;
    try {
      const [cartRes, productsRes] = await Promise.all([cartApi.getCart(), productApi.listProducts()]);
      const cartData = cartRes.data;
      const items = cartData?.items ? typeof cartData.items === 'string' ? JSON.parse(cartData.items) : cartData.items : [];
      setCartItems(items);
      setProducts(productsRes.data.data || productsRes.data);
    } catch {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [user?.id]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await cartApi.checkout(checkoutForm.customerName, checkoutForm.customerEmail, checkoutForm.paymentMethod);
      setCheckoutOpen(false);
      showToast('Order placed successfully!');
      navigate('/dashboard/my-orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Checkout failed');
      showToast(msg || 'Checkout failed', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    try {
      await cartApi.updateCartItem(productId, qty);
      fetchCart();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Could not update quantity', 'error');
    }
  };

  const getProductDetail = (productId: string) =>
    products.find((p) => p.id === productId) || cartItems.find((i) => i.productId === productId)?.product;

  if (loading) return <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />;

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProductDetail(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <PageTitle title="Cart" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Shopping Cart</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Storefront />} onClick={() => navigate('/products')}>
            Browse Products
          </Button>
          {cartItems.length > 0 && (
            <>
              <Button variant="contained" color="secondary" startIcon={<ShoppingCartCheckout />} onClick={() => { setCheckoutForm((f) => ({ ...f, customerName: defaultCustomerName || f.customerName, customerEmail: user?.email || f.customerEmail })); setCheckoutOpen(true); }}>
                Checkout
              </Button>
              <Button variant="outlined" color="error" onClick={() => setClearOpen(true)}>Clear Cart</Button>
            </>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {cartItems.length === 0 ? (
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <ShoppingCartCheckout sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
            Browse our collection and add items to your cart to checkout.
          </Typography>
          <Button variant="contained" color="secondary" size="large" startIcon={<Storefront />} onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => {
                  const product = getProductDetail(item.productId);
                  return (
                    <TableRow key={item.productId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {product && (
                            <Box sx={{ width: 56, height: 56, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                              <ProductImage product={product} alt={product.name} height={56} />
                            </Box>
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{product?.name || item.productId}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>${product?.price?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" disabled={item.quantity <= 1} aria-label="Decrease quantity"
                            onClick={() => updateQty(item.productId, item.quantity - 1)}><Remove fontSize="small" /></IconButton>
                          <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" aria-label="Increase quantity"
                            onClick={() => updateQty(item.productId, item.quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${((product?.price ?? 0) * item.quantity).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton aria-label="Remove item" onClick={async () => { await cartApi.removeFromCart(item.productId); fetchCart(); }} color="error" size="small"><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Paper elevation={0} sx={{ p: 2.5, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body1" color="text.secondary">Subtotal</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.dark' }}>${subtotal.toFixed(2)}</Typography>
          </Paper>
        </>
      )}

      <ConfirmDialog open={clearOpen} title="Clear cart?" message="Remove all items from your cart?" confirmLabel="Clear"
        onCancel={() => setClearOpen(false)} onConfirm={async () => { await cartApi.clearCart(); setClearOpen(false); fetchCart(); showToast('Cart cleared'); }} />

      <Dialog open={checkoutOpen} onClose={() => !checkoutLoading && setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Checkout</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Customer Name" value={checkoutForm.customerName} onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })} required fullWidth />
            <TextField label="Customer Email" type="email" value={checkoutForm.customerEmail} onChange={(e) => setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })} required fullWidth />
            <FormLabel sx={{ mt: 1 }}>Payment Method</FormLabel>
            <RadioGroup value={checkoutForm.paymentMethod} onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}>
              <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery (COD)" />
            </RadioGroup>
            <Typography variant="body2" color="text.secondary">{cartItems.length} item(s) — Subtotal: ${subtotal.toFixed(2)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCheckoutOpen(false)} disabled={checkoutLoading}>Cancel</Button>
          <Button onClick={handleCheckout} variant="contained" color="secondary" disabled={checkoutLoading || !checkoutForm.customerName || !checkoutForm.customerEmail}>
            {checkoutLoading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
