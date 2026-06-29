import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@ApiTags('products')
@Controller()
export class PublicProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('products')
  @ApiOperation({ operationId: 'listProducts', summary: 'List active products (public)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated active products' })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    return lastValueFrom(this.client.send('find_all_products', params));
  }

  @Get('categories')
  @ApiTags('categories')
  @ApiOperation({ operationId: 'listCategories', summary: 'List all categories (public)' })
  @ApiResponse({ status: 200, description: 'Category list' })
  async findAllCategories() {
    return lastValueFrom(this.client.send('find_all_categories', {}));
  }

  @Get('products/:id')
  @ApiOperation({ operationId: 'getProduct', summary: 'Get product by ID (public)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found or archived' })
  async findOne(@Param('id') id: string) {
    return lastValueFrom(this.client.send('find_product_by_id', { id }));
  }

  @Get('categories/:id')
  @ApiTags('categories')
  @ApiOperation({ operationId: 'getCategory', summary: 'Get category by ID (public)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category with products' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOneCategory(@Param('id') id: string) {
    return lastValueFrom(this.client.send('find_category_by_id', { id }));
  }
}
