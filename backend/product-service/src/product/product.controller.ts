import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidateProductsDto } from './dto/validate-products.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('create_product')
  create(@Payload() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @MessagePattern('find_all_products')
  findAll(@Payload() payload?: { search?: string; categoryId?: string; includeDeleted?: boolean; skip?: number; take?: number }) {
    return this.productService.findAll(payload);
  }

  @MessagePattern('find_product_by_id')
  findById(@Payload() payload: { id: string }) {
    return this.productService.findById(payload.id);
  }

  @MessagePattern('update_product')
  update(@Payload() payload: { id: string } & UpdateProductDto) {
    const { id, ...data } = payload;
    return this.productService.update(id, data);
  }

  @MessagePattern('delete_product')
  delete(@Payload() payload: { id: string }) {
    return this.productService.delete(payload.id);
  }

  @MessagePattern('restore_product')
  restore(@Payload() payload: { id: string }) {
    return this.productService.restore(payload.id);
  }

  @MessagePattern('validate_products')
  validateProducts(@Payload() dto: ValidateProductsDto) {
    return this.productService.validateProducts(dto);
  }

  @MessagePattern('get_products')
  getProducts(@Payload() payload: { ids: string[] }) {
    return this.productService.findByIds(payload.ids);
  }

  @MessagePattern('deduct_stock')
  deductStock(@Payload() payload: { items: { id: string; quantity: number }[] }) {
    return this.productService.deductStock(payload.items);
  }

  @MessagePattern('create_category')
  createCategory(@Payload() data: { name: string }) {
    return this.productService.createCategory(data);
  }

  @MessagePattern('find_all_categories')
  findAllCategories() {
    return this.productService.findAllCategories();
  }

  @MessagePattern('find_category_by_id')
  findCategoryById(@Payload() payload: { id: string }) {
    return this.productService.findCategoryById(payload.id);
  }

  @MessagePattern('update_category')
  updateCategory(@Payload() payload: { id: string; name: string }) {
    const { id, ...data } = payload;
    return this.productService.updateCategory(id, data);
  }

  @MessagePattern('delete_category')
  deleteCategory(@Payload() payload: { id: string }) {
    return this.productService.deleteCategory(payload.id);
  }
}
