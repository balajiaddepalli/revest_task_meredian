import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'prod-uuid' })
  @IsString()
  productId!: string;

  @ApiProperty({ minimum: 1, example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}
