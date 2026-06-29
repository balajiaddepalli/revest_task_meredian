import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { lastValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('admin/products')
  @ApiOperation({ operationId: 'listProductsAdmin', summary: 'List products including archived (admin only)' })
  @ApiQuery({ name: 'includeDeleted', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  async findAllAdmin(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const params: any = {};
    if (includeDeleted === 'true') params.includeDeleted = true;
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    return lastValueFrom(this.client.send('find_all_products', params));
  }

  @Post('products')
  @ApiOperation({ operationId: 'createProduct', summary: 'Create product (admin only)' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  async create(@Body() dto: CreateProductDto) {
    return lastValueFrom(this.client.send('create_product', dto));
  }

  @Put('products/:id')
  @ApiOperation({ operationId: 'updateProduct', summary: 'Update product (admin only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return lastValueFrom(
      this.client.send('update_product', { id, ...dto }),
    );
  }

  @Delete('products/:id')
  @ApiOperation({ operationId: 'archiveProduct', summary: 'Soft-delete product (admin only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product archived' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    return lastValueFrom(this.client.send('delete_product', { id }));
  }

  @Post('products/:id/restore')
  @ApiOperation({ operationId: 'restoreProduct', summary: 'Restore archived product (admin only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product restored' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async restore(@Param('id') id: string) {
    return lastValueFrom(this.client.send('restore_product', { id }));
  }

  @Post('categories')
  @ApiTags('categories')
  @ApiOperation({ operationId: 'createCategory', summary: 'Create category (admin only)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return lastValueFrom(this.client.send('create_category', dto));
  }

  @Put('categories/:id')
  @ApiTags('categories')
  @ApiOperation({ operationId: 'updateCategory', summary: 'Update category (admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return lastValueFrom(
      this.client.send('update_category', { id, ...dto }),
    );
  }

  @Delete('categories/:id')
  @ApiTags('categories')
  @ApiOperation({ operationId: 'deleteCategory', summary: 'Delete category (admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async removeCategory(@Param('id') id: string) {
    return lastValueFrom(this.client.send('delete_category', { id }));
  }
}
