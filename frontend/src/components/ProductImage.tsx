import { Box, BoxProps } from '@mui/material';
import { getProductImageUrl } from '@/lib/productImages';

interface ProductImageProps extends Omit<BoxProps, 'component'> {
  product: { imageUrl?: string | null; id?: string; name?: string };
  alt: string;
  height?: number | string | Record<string, number | string>;
}

export function ProductImage({ product, alt, height = 220, sx, ...rest }: ProductImageProps) {
  return (
    <Box
      component="img"
      src={getProductImageUrl(product)}
      alt={alt}
      loading="lazy"
      sx={{
        width: '100%',
        height,
        objectFit: 'cover',
        display: 'block',
        bgcolor: 'grey.100',
        ...sx,
      }}
      {...rest}
    />
  );
}
