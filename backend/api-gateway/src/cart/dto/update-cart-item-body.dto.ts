import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class UpdateCartItemBodyDto {
  @ApiProperty({ example: 'prod-uuid' })
  @IsString()
  productId!: string;

  @ApiProperty({ minimum: 1, example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}
