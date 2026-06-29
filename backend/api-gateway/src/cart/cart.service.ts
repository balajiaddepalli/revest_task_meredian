import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CartService {
  constructor(
    @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  async getCart(userId: string) {
    return lastValueFrom(this.cartClient.send('get_cart', { userId }));
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    return lastValueFrom(
      this.cartClient.send('add_to_cart', { userId, productId, quantity }),
    );
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    return lastValueFrom(
      this.cartClient.send('update_cart_item', { userId, productId, quantity }),
    );
  }

  async removeFromCart(userId: string, productId: string) {
    return lastValueFrom(
      this.cartClient.send('remove_from_cart', { userId, productId }),
    );
  }

  async clearCart(userId: string) {
    return lastValueFrom(this.cartClient.send('clear_cart', { userId }));
  }

  async checkout(userId: string, customerName: string, customerEmail: string, paymentMethod?: string) {
    const cart = await lastValueFrom(
      this.cartClient.send('get_cart', { userId }),
    );

    const items = cart?.items || [];
    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderItems = items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const order = await lastValueFrom(
      this.orderClient.send('create_order', {
        customerName,
        customerEmail,
        userId,
        paymentMethod: paymentMethod || 'COD',
        items: orderItems,
      }),
    );

    await lastValueFrom(this.cartClient.send('clear_cart', { userId }));

    return order;
  }
}
