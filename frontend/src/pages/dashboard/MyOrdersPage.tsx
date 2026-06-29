import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, Alert, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Visibility, Cancel as CancelIcon, Storefront, ReceiptLong } from '@mui/icons-material';
import { orderApi, productApi } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { PageTitle } from '@/components/PageTitle';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const statusColor: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  DELIVERED: 'success',
  CANCELLED: 'error',
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'info',
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderApi.listMyOrders(),
        productApi.listProducts(),
      ]);
      setOrders(ordersRes.data.data || ordersRes.data);
      setProducts(productsRes.data.data || productsRes.data);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getProductName = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    return p?.name || productId;
  };

  const handleCancel = async (orderId: string) => {
    try {
      await orderApi.cancelOrder(orderId);
      showToast('Order cancelled');
      setCancelId(null);
      fetchOrders();
    } catch {
      setError('Failed to cancel order');
      showToast('Failed to cancel order', 'error');
    }
  };

  if (loading) return <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <PageTitle title="My Orders" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>My Orders</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Storefront />} onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {orders.length === 0 ? (
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <ReceiptLong sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No orders yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
            When you place an order, it will appear here.
          </Typography>
          <Button variant="contained" color="secondary" startIcon={<Storefront />} onClick={() => navigate('/products')}>
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Order #</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell><Chip label={order.status} color={statusColor[order.status] || 'default'} size="small" /></TableCell>
                  <TableCell><Chip label={order.paymentMethod} variant="outlined" size="small" /></TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" aria-label="View order details" onClick={() => setSelectedOrder(order)}><Visibility fontSize="small" /></IconButton>
                    {order.status === 'PENDING' && (
                      <IconButton size="small" color="error" aria-label="Cancel order" onClick={() => setCancelId(order.id)}><CancelIcon fontSize="small" /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><strong>Order #:</strong> {selectedOrder.orderNumber}</Typography>
              <Typography><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</Typography>
              <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
              <Typography><strong>Payment:</strong> {selectedOrder.paymentMethod}</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
              <Typography sx={{ mt: 2, fontWeight: 600 }}>Items</Typography>
              {selectedOrder.items?.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', ml: 1, py: 0.5 }}>
                  <Typography variant="body2">{getProductName(item.productId)} × {item.quantity}</Typography>
                  <Typography variant="body2">${(item.unitPrice * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedOrder(null)}>Close</Button></DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel order?"
        message="This order will be cancelled. This action cannot be undone."
        confirmLabel="Cancel Order"
        onConfirm={() => cancelId && handleCancel(cancelId)}
        onCancel={() => setCancelId(null)}
      />
    </Box>
  );
}
