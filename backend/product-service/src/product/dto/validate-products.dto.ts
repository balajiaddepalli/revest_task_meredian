import { IsString, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductValidationItem {
  @IsString()
  id!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class ValidateProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductValidationItem)
  items!: ProductValidationItem[];
}
