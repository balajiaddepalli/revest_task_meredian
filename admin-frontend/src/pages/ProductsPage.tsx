import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, IconButton, Skeleton, Alert, Select, MenuItem,
  InputLabel, FormControl, Chip,
} from '@mui/material';
import { Delete, Edit, RestoreFromTrash } from '@mui/icons-material';
import { productApi, categoryApi } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageTitle } from '@/components/PageTitle';

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
};

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', price: '', stockQuantity: '', description: '', categoryId: '', imageUrl: '' });
  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const fetchProducts = async () => {
    try {
      const params: Record<string, string | number> = { skip: page * rowsPerPage, take: rowsPerPage };
      if (search) params.search = search;
      if (showArchived) params.includeDeleted = 'true';
      const res = await productApi.listProducts(params);
      setProducts(res.data.data || res.data);
      if (res.data.total !== undefined) setTotal(res.data.total);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [showArchived, page, rowsPerPage]);
  useEffect(() => { categoryApi.listCategories().then((r) => setCategories(r.data)).catch(() => {}); }, []);

  const handleSave = async () => {
    try {
      const data: Record<string, unknown> = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity, 10),
        description: form.description,
      };
      if (form.categoryId) data.categoryId = form.categoryId;
      if (form.imageUrl) data.imageUrl = form.imageUrl;
      if (editProduct) {
        await productApi.updateProduct(editProduct.id, data);
        showToast('Product updated');
      } else {
        await productApi.createProduct(data);
        showToast('Product created');
      }
      setOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to save product');
    }
  };

  const openDeleteProductConfirm = (product: Product) => {
    setConfirm({
      title: 'Archive Product',
      message: `Archive "${product.name}"? It can be restored later.`,
      confirmLabel: 'Archive',
      onConfirm: async () => {
        await productApi.archiveProduct(product.id);
        fetchProducts();
        showToast('Product archived');
      },
    });
  };

  const openDeleteCategoryConfirm = (cat: Category) => {
    setConfirm({
      title: 'Delete Category',
      message: `Delete category "${cat.name}"?`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await categoryApi.deleteCategory(cat.id);
        categoryApi.listCategories().then((r) => setCategories(r.data));
        showToast('Category deleted');
      },
    });
  };

  if (loading) return <Skeleton variant="rectangular" width="100%" height={400} />;

  return (
    <Box>
      <PageTitle title="Products" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4">Products</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            label="Search products"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchProducts(); }}
            inputProps={{ 'aria-label': 'Search products' }}
          />
          <Button variant="contained" onClick={() => { setEditProduct(null); setForm({ name: '', sku: '', price: '', stockQuantity: '', description: '', categoryId: '', imageUrl: '' }); setOpen(true); }}>Add Product</Button>
          <Button variant="outlined" onClick={() => setCatOpen(true)}>Manage Categories</Button>
          <Button variant={showArchived ? 'contained' : 'outlined'} color={showArchived ? 'warning' : 'inherit'} onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category ? <Chip label={product.category.name} size="small" /> : '-'}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  {product.deletedAt ? (
                    <IconButton
                      color="success"
                      aria-label="Restore product"
                      onClick={async () => { await productApi.restoreProduct(product.id); fetchProducts(); showToast('Product restored'); }}
                    >
                      <RestoreFromTrash />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton
                        aria-label="Edit product"
                        onClick={() => { setEditProduct(product); setForm({ name: product.name, sku: product.sku, price: String(product.price), stockQuantity: String(product.stockQuantity), description: product.description || '', categoryId: product.categoryId || '', imageUrl: product.imageUrl || '' }); setOpen(true); }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="error" aria-label="Delete product" onClick={() => openDeleteProductConfirm(product)}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required fullWidth />
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
            <TextField label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required fullWidth />
            <TextField label="Stock Quantity" type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} fullWidth />
            <TextField label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.categoryId} label="Category" onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <MenuItem value=""><em>None</em></MenuItem>
                {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={catOpen} onClose={() => setCatOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Manage Categories</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Category name" size="small" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} fullWidth />
              <Button variant="contained" onClick={async () => { await categoryApi.createCategory({ name: newCategoryName }); setNewCategoryName(''); categoryApi.listCategories().then((r) => setCategories(r.data)); showToast('Category added'); }}>Add</Button>
            </Box>
            {categories.map((cat) => (
              <Box key={cat.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{cat.name}</Typography>
                <IconButton size="small" color="error" aria-label="Delete category" onClick={() => openDeleteCategoryConfirm(cat)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setCatOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmLabel={confirm?.confirmLabel}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm) {
            await confirm.onConfirm();
            setConfirm(null);
          }
        }}
      />
    </Box>
  );
}
