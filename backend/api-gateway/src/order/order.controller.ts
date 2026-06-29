import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
  Req,
  ForbiddenException,
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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ operationId: 'listOrders', summary: 'List all orders (admin)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  async listOrders(@Query('skip') skip?: string, @Query('take') take?: string) {
    const params: any = {};
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    return lastValueFrom(this.client.send('find_all_orders', params));
  }

  @Get(['my-orders', 'me', 'my'])
  @ApiOperation({ operationId: 'listMyOrders', summary: 'List authenticated user orders' })
  @ApiResponse({ status: 200, description: 'Current user orders' })
  async listMyOrders(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    return lastValueFrom(this.client.send('find_orders_by_user_id', { userId }));
  }

  @Get(':id/items')
  @ApiOperation({ operationId: 'listOrderItems', summary: 'List order line items' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order line items' })
  async listOrderItems(@Param('id') id: string, @Req() req: any) {
    return this.fetchOrderItems(id, req);
  }

  /** @deprecated Use GET /orders/:id/items */
  @Get(':id/products')
  @ApiOperation({ operationId: 'listOrderItemsLegacy', summary: 'List order items (deprecated alias)' })
  async listOrderItemsLegacy(@Param('id') id: string, @Req() req: any) {
    return this.fetchOrderItems(id, req);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getOrder', summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order with line items' })
  async getOrder(@Param('id') id: string, @Req() req: any) {
    const order = await lastValueFrom(this.client.send('find_order_by_id', { id }));
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ operationId: 'createOrder', summary: 'Create order (admin)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created' })
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    return lastValueFrom(
      this.client.send('create_order', { ...dto, userId: req.user.id }),
    );
  }

  @Patch(':id/status')
  @ApiOperation({ operationId: 'updateOrderStatus', summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.applyStatusUpdate(id, dto, req);
  }

  /** @deprecated Use PATCH /orders/:id/status */
  @Put(':id')
  @ApiOperation({ operationId: 'updateOrderStatusLegacy', summary: 'Update order status (deprecated alias)' })
  async updateOrderStatusLegacy(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.applyStatusUpdate(id, dto, req);
  }

  @Post(':id/cancel')
  @ApiOperation({ operationId: 'cancelOrder', summary: 'Cancel a pending order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  async cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.applyStatusUpdate(id, { status: 'CANCELLED' }, req);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ operationId: 'deleteOrder', summary: 'Delete order (admin)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order deleted' })
  async deleteOrder(@Param('id') id: string) {
    return lastValueFrom(this.client.send('delete_order', { id }));
  }

  private async applyStatusUpdate(id: string, dto: UpdateOrderStatusDto, req: any) {
    const order = await lastValueFrom(this.client.send('find_order_by_id', { id }));

    if (req.user.role !== 'ADMIN') {
      if (order.userId !== req.user.id) {
        throw new ForbiddenException('You can only update your own orders');
      }
      if (dto.status !== 'CANCELLED' || order.status !== 'PENDING') {
        throw new ForbiddenException('You can only cancel your own pending orders');
      }
    }

    return lastValueFrom(
      this.client.send('update_order_status', { id, status: dto.status }),
    );
  }

  private async fetchOrderItems(id: string, req: any) {
    const order = await lastValueFrom(this.client.send('find_order_by_id', { id }));
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order.items ?? [];
  }
}
