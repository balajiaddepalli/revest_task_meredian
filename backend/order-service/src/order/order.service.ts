import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  userId?: string;
  paymentMethod?: string;
  items: OrderItem[];
}

interface ValidatedProduct {
  id: string;
  price: number;
  name: string;
}

interface ValidateProductsResponse {
  valid: boolean;
  products: ValidatedProduct[];
  totalPrice: number;
}

interface ValidatedProductRaw {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const validated = await firstValueFrom<ValidatedProductRaw[]>(
      this.productClient.send('validate_products', {
        items: dto.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
        })),
      }),
    );

    if (!validated || validated.length === 0) {
      throw new HttpException(
        'Product validation failed. One or more products are invalid or out of stock.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalPrice = validated.reduce(
      (sum, p) => sum + p.price * dto.items.find((i) => i.productId === p.id)!.quantity,
      0,
    );

    const orderNumber = `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        totalPrice,
        status: 'PENDING',
        paymentMethod: dto.paymentMethod || 'COD',
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        userId: dto.userId,
        items: {
          create: dto.items.map((item) => {
            const product = validated.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
      include: { items: true },
    });

    await firstValueFrom(
      this.productClient.send('deduct_stock', {
        items: dto.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
        })),
      }),
    );

    return order;
  }

  async findAll(params?: { skip?: number; take?: number }) {
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
        skip: params?.skip || 0,
        take: params?.take || 100,
      }),
      this.prisma.order.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return this.prisma.order.delete({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }
}
