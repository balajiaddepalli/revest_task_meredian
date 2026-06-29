import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('add_to_cart')
  addToCart(@Payload() data: { userId: string; productId: string; quantity: number }) {
    return this.cartService.addToCart(data);
  }

  @MessagePattern('remove_from_cart')
  removeFromCart(@Payload() data: { userId: string; productId: string }) {
    return this.cartService.removeFromCart(data);
  }

  @MessagePattern('get_cart')
  getCart(@Payload() data: { userId: string }) {
    return this.cartService.getCart(data);
  }

  @MessagePattern('clear_cart')
  clearCart(@Payload() data: { userId: string }) {
    return this.cartService.clearCart(data);
  }

  @MessagePattern('update_cart_item')
  updateCartItem(@Payload() data: { userId: string; productId: string; quantity: number }) {
    return this.cartService.updateCartItem(data);
  }
}
