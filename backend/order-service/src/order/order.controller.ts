import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  items: { productId: string; quantity: number }[];
}

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('create_order')
  createOrder(@Payload() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @MessagePattern('find_all_orders')
  findAll(@Payload() payload?: { skip?: number; take?: number }) {
    return this.orderService.findAll(payload);
  }

  @MessagePattern('find_order_by_id')
  findOne(@Payload() payload: { id: string }) {
    return this.orderService.findOne(payload.id);
  }

  @MessagePattern('update_order_status')
  updateStatus(@Payload() payload: { id: string; status: string }) {
    return this.orderService.updateStatus(payload.id, payload.status);
  }

  @MessagePattern('delete_order')
  remove(@Payload() payload: { id: string }) {
    return this.orderService.remove(payload.id);
  }

  @MessagePattern('find_orders_by_email')
  findByEmail(@Payload() payload: { email: string }) {
    return this.orderService.findByEmail(payload.email);
  }

  @MessagePattern('find_orders_by_user_id')
  findByUserId(@Payload() payload: { userId: string }) {
    return this.orderService.findByUserId(payload.userId);
  }
}
