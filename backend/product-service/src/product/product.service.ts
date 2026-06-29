import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidateProductsDto } from './dto/validate-products.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data, include: { category: true } });
  }

  async findAll(params?: { search?: string; categoryId?: string; includeDeleted?: boolean; skip?: number; take?: number }) {
    const where: any = {};
    if (!params?.includeDeleted) {
      where.deletedAt = null;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip: params?.skip || 0,
        take: params?.take || 100,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      include: { category: true },
    });
  }

  async createCategory(data: { name: string }) {
    return this.prisma.category.create({ data });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: string, data: { name: string }) {
    await this.findCategoryById(id);
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    await this.findCategoryById(id);
    await this.prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    return this.prisma.category.delete({ where: { id } });
  }

  async deductStock(items: { id: string; quantity: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.id,
            stockQuantity: { gte: item.quantity },
          },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.id}`,
          );
        }
      }
      return { success: true };
    });
  }

  async findByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
  }

  async validateProducts(dto: ValidateProductsDto) {
    const results: { id: string; name: string; price: number; stockQuantity: number }[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.id } });
      if (!product) {
        throw new NotFoundException(`Product with id ${item.id} not found`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}: requested ${item.quantity}, available ${product.stockQuantity}`,
        );
      }
      results.push({
        id: product.id,
        name: product.name,
        price: product.price,
        stockQuantity: product.stockQuantity,
      });
    }

    return results;
  }
}
