import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PeopleIcon from '@mui/icons-material/People';
import { productApi, orderApi, userApi } from '@/lib/api';
import { PageTitle } from '@/components/PageTitle';

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, users] = await Promise.all([
          productApi.listProducts({ includeDeleted: 'true' }),
          orderApi.listOrders(),
          userApi.listUsers(),
        ]);
        setStats({
          products: products.data.total ?? products.data.data?.length ?? 0,
          orders: orders.data.total ?? orders.data.data?.length ?? 0,
          users: users.data.total ?? users.data.data?.length ?? 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Skeleton variant="rectangular" width="100%" height={120} />;

  const cards = [
    { label: 'Products', value: stats.products, icon: <InventoryIcon sx={{ fontSize: 48 }} />, color: '#1976d2' },
    { label: 'Orders', value: stats.orders, icon: <LocalMallIcon sx={{ fontSize: 48 }} />, color: '#388e3c' },
    { label: 'Users', value: stats.users, icon: <PeopleIcon sx={{ fontSize: 48 }} />, color: '#f57c00' },
  ];

  return (
    <>
      <PageTitle title="Dashboard" />
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Overview of your store
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={4} key={card.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color={card.color}>{card.icon}</Typography>
                <Typography variant="h3">{card.value}</Typography>
                <Typography variant="body1" color="text.secondary">{card.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
