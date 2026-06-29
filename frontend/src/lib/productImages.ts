const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop',
];

export function getProductImageUrl(product: { imageUrl?: string | null; id?: string; name?: string }): string {
  if (product.imageUrl?.trim()) return product.imageUrl.trim();
  const key = product.id || product.name || 'default';
  const idx = key.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PLACEHOLDERS.length;
  return PLACEHOLDERS[idx];
}
