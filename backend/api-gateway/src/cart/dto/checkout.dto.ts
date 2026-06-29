import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(1)
  customerName!: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsString()
  customerEmail!: string;

  @ApiPropertyOptional({ example: 'COD', default: 'COD' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
