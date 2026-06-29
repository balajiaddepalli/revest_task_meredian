import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

export interface CartItem {
  productId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('PRODUCT_SERVICE') private readonly productService: ClientProxy,
  ) {}

  async addToCart(data: { userId: string; productId: string; quantity: number }) {
    const { userId, productId, quantity } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const product = await firstValueFrom(
      this.productService.send('find_product_by_id', { id: productId }),
    );

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    let cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      if (quantity > product.stockQuantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}: requested ${quantity}, available ${product.stockQuantity}`,
        );
      }
      const items: CartItem[] = [{ productId, quantity }];
      cart = await this.prisma.cart.create({
        data: { userId, items: JSON.stringify(items) },
      });
      return { ...cart, items: JSON.parse(cart.items) };
    }

    const items: CartItem[] = JSON.parse(cart.items);
    const existingIndex = items.findIndex((item) => item.productId === productId);

    const newQuantity =
      existingIndex >= 0 ? items[existingIndex].quantity + quantity : quantity;
    if (newQuantity > product.stockQuantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}: requested ${newQuantity}, available ${product.stockQuantity}`,
      );
    }

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }

    cart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: { items: JSON.stringify(items) },
    });

    return { ...cart, items: JSON.parse(cart.items) };
  }

  async removeFromCart(data: { userId: string; productId: string }) {
    const { userId, productId } = data;

    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const items: CartItem[] = JSON.parse(cart.items);
    const filtered = items.filter((item) => item.productId !== productId);

    if (filtered.length === items.length) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    const updated = await this.prisma.cart.update({
      where: { id: cart.id },
      data: { items: JSON.stringify(filtered) },
    });

    return { ...updated, items: JSON.parse(updated.items) };
  }

  async getCart(data: { userId: string }) {
    const { userId } = data;

    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      return { userId, items: [] };
    }

    const items: CartItem[] = JSON.parse(cart.items);

    if (items.length === 0) {
      return { ...cart, items: [] };
    }

    const productIds = items.map((item) => item.productId);
    let products: any[] = [];

    try {
      products = await firstValueFrom(
        this.productService.send('get_products', { ids: productIds }),
      );
    } catch {
      return { ...cart, items };
    }

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    const enrichedItems = items.map((item) => ({
      ...item,
      product: productMap.get(item.productId) || null,
    }));

    return { ...cart, items: enrichedItems };
  }

  async updateCartItem(data: { userId: string; productId: string; quantity: number }) {
    const { userId, productId, quantity } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const product = await firstValueFrom(
      this.productService.send('find_product_by_id', { id: productId }),
    );

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (quantity > product.stockQuantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}: requested ${quantity}, available ${product.stockQuantity}`,
      );
    }

    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const items: CartItem[] = JSON.parse(cart.items);
    const existingIndex = items.findIndex((item) => item.productId === productId);

    if (existingIndex < 0) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    items[existingIndex].quantity = quantity;

    const updated = await this.prisma.cart.update({
      where: { id: cart.id },
      data: { items: JSON.stringify(items) },
    });

    return { ...updated, items: JSON.parse(updated.items) };
  }

  async clearCart(data: { userId: string }) {
    const { userId } = data;

    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      return { userId, items: [] };
    }

    const updated = await this.prisma.cart.update({
      where: { id: cart.id },
      data: { items: '[]' },
    });

    return { ...updated, items: [] };
  }
}
