import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  name!: string;

  @ApiProperty({ minimum: 0, example: 99.99 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ minimum: 0, example: 50 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @ApiPropertyOptional({ example: 'Premium noise-cancelling headphones' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
