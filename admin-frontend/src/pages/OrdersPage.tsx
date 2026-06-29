import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Skeleton, Alert, Select, MenuItem, InputLabel, FormControl,
  TablePagination,
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { orderApi, productApi } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageTitle } from '@/components/PageTitle';

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({ customerName: '', customerEmail: '', productId: '', quantity: '1' });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderApi.listOrders({ skip: page * rowsPerPage, take: rowsPerPage }),
        productApi.listProducts(),
      ]);
      setOrders(ordersRes.data.data || ordersRes.data);
      setTotal(ordersRes.data.total ?? ordersRes.data.data?.length ?? 0);
      setProducts(productsRes.data.data || productsRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, rowsPerPage]);

  const getProductName = (productId: string) => products.find((p) => p.id === productId)?.name || productId;

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    await orderApi.deleteOrder(deleteOrderId);
    setDeleteOrderId(null);
    fetchData();
    showToast('Order deleted');
  };

  if (loading) return <Skeleton variant="rectangular" width="100%" height={400} />;

  return (
    <Box>
      <PageTitle title="Orders" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Orders</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Create Order</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>
                  <Select value={order.status} size="small" onChange={async (e) => {
                    await orderApi.updateOrderStatus(order.id, e.target.value);
                    fetchData();
                    showToast('Status updated');
                  }} sx={{ minWidth: 120 }}>
                    {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton aria-label="View order details" onClick={() => setSelectedOrder(order)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="error" aria-label="Delete order" onClick={() => setDeleteOrderId(order.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Customer Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required fullWidth />
            <TextField label="Customer Email" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required fullWidth />
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select value={form.productId} label="Product" onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} - ${p.price}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            await orderApi.createOrder({
              customerName: form.customerName,
              customerEmail: form.customerEmail,
              items: [{ productId: form.productId, quantity: parseInt(form.quantity, 10) }],
            });
            setOpen(false);
            setForm({ customerName: '', customerEmail: '', productId: '', quantity: '1' });
            fetchData();
            showToast('Order created');
          }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 1 }}>
              <Typography><strong>Order #:</strong> {selectedOrder.orderNumber}</Typography>
              <Typography><strong>Customer:</strong> {selectedOrder.customerName}</Typography>
              <Typography><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Items:</strong></Typography>
              {selectedOrder.items?.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                  <Typography>{getProductName(item.productId)} x{item.quantity}</Typography>
                  <Typography>${(item.unitPrice * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedOrder(null)}>Close</Button></DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteOrderId}
        title="Delete Order"
        message="Delete this order permanently?"
        confirmLabel="Delete"
        onCancel={() => setDeleteOrderId(null)}
        onConfirm={handleDeleteOrder}
      />
    </Box>
  );
}
