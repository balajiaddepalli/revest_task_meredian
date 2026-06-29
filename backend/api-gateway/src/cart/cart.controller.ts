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
  Req,
  ForbiddenException,
  ParseUUIDPipe,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UpdateCartItemBodyDto } from './dto/update-cart-item-body.dto';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private assertCartOwnership(req: any, userId: string) {
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      throw new ForbiddenException('You can only access your own cart');
    }
  }

  // ── Current user cart (/cart, /cart/items, …) ─────────────────────────────

  @Get()
  @ApiOperation({ operationId: 'getCart', summary: 'Get my shopping cart' })
  @ApiResponse({ status: 200, description: 'Cart with line items' })
  getMyCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ operationId: 'addToCart', summary: 'Add product to my cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Product added to cart' })
  addToMyCart(@Body() dto: AddToCartDto, @Req() req: any) {
    return this.cartService.addToCart(req.user.id, dto.productId, dto.quantity);
  }

  @Patch('items')
  @ApiOperation({ operationId: 'updateCartItem', summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemBodyDto })
  @ApiResponse({ status: 200, description: 'Cart item quantity updated' })
  updateMyCartItem(@Body() body: UpdateCartItemBodyDto, @Req() req: any) {
    return this.cartService.updateCartItem(req.user.id, body.productId, body.quantity);
  }

  @Delete('items/clear')
  @ApiOperation({ operationId: 'clearCart', summary: 'Clear all items from my cart' })
  @ApiResponse({ status: 200, description: 'All cart items removed' })
  clearMyCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }

  @Delete('items')
  @ApiOperation({ operationId: 'removeFromCart', summary: 'Remove product from my cart' })
  @ApiQuery({ name: 'productId', required: true, description: 'Product UUID to remove' })
  @ApiResponse({ status: 200, description: 'Product removed from cart' })
  removeFromMyCart(@Query('productId') productId: string, @Req() req: any) {
    return this.cartService.removeFromCart(req.user.id, productId);
  }

  @Post('checkout')
  @ApiOperation({ operationId: 'checkoutCart', summary: 'Checkout my cart and place order' })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 201, description: 'Order created from cart' })
  checkoutMyCart(@Body() dto: CheckoutDto, @Req() req: any) {
    return this.cartService.checkout(
      req.user.id,
      dto.customerName,
      dto.customerEmail,
      dto.paymentMethod,
    );
  }

  // ── Admin cart by user ID (/cart/users/:userId/*) ────────────────────────

  @Get('users/:userId')
  @ApiOperation({ operationId: 'getCartByUserId', summary: 'Get cart by user ID (admin)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  getCartByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: any,
  ) {
    this.assertCartOwnership(req, userId);
    return this.cartService.getCart(userId);
  }

  @Post('users/:userId/items')
  @ApiOperation({ operationId: 'addToCartByUserId', summary: 'Add product to cart by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiBody({ type: AddToCartDto })
  addToCartByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AddToCartDto,
    @Req() req: any,
  ) {
    this.assertCartOwnership(req, userId);
    return this.cartService.addToCart(userId, dto.productId, dto.quantity);
  }

  @Post('users/:userId/checkout')
  @ApiOperation({ operationId: 'checkoutCartByUserId', summary: 'Checkout cart by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiBody({ type: CheckoutDto })
  checkoutByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CheckoutDto,
    @Req() req: any,
  ) {
    this.assertCartOwnership(req, userId);
    return this.cartService.checkout(userId, dto.customerName, dto.customerEmail, dto.paymentMethod);
  }

  @Put('users/:userId/items/:productId')
  @ApiOperation({ operationId: 'updateCartItemByUserId', summary: 'Update cart item by user ID' })
  updateCartItemByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
  ) {
    this.assertCartOwnership(req, userId);
    return this.cartService.updateCartItem(userId, productId, dto.quantity);
  }

  @Delete('users/:userId/items/:productId')
  @ApiOperation({ operationId: 'removeFromCartByUserId', summary: 'Remove item by user ID' })
  removeFromCartByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: any,
  ) {
    this.assertCartOwnership(req, userId);
    return this.cartService.removeFromCart(userId, productId);
  }

  @Delete('users/:userId/items')
  @ApiOperation({ operationId: 'clearCartByUserId', summary: 'Clear cart by user ID' })
  clearCartByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: any,
  ) {
    this.assertCartOwnership(req, userId);
    return this.cartService.clearCart(userId);
  }

  // ── Legacy aliases (deprecated) ───────────────────────────────────────────

  /** @deprecated Use GET /cart */
  @Get('me')
  getMyCartLegacy(@Req() req: any) {
    return this.getMyCart(req);
  }

  /** @deprecated Use POST /cart/items */
  @Post('me/items')
  addToMyCartLegacy(@Body() dto: AddToCartDto, @Req() req: any) {
    return this.addToMyCart(dto, req);
  }

  /** @deprecated Use PATCH /cart/items */
  @Patch('me/items')
  updateMyCartItemLegacy(@Body() body: UpdateCartItemBodyDto, @Req() req: any) {
    return this.updateMyCartItem(body, req);
  }

  /** @deprecated Use DELETE /cart/items/clear */
  @Delete('me/items/all')
  clearMyCartLegacy(@Req() req: any) {
    return this.clearMyCart(req);
  }

  /** @deprecated Use DELETE /cart/items?productId= */
  @Delete('me/items')
  removeFromMyCartLegacy(@Query('productId') productId: string, @Req() req: any) {
    return this.removeFromMyCart(productId, req);
  }

  /** @deprecated Use POST /cart/checkout */
  @Post('me/checkout')
  checkoutMyCartLegacy(@Body() dto: CheckoutDto, @Req() req: any) {
    return this.checkoutMyCart(dto, req);
  }

  /** @deprecated Use GET /cart/users/:userId */
  @Get(':userId')
  getCartLegacy(@Param('userId', ParseUUIDPipe) userId: string, @Req() req: any) {
    return this.getCartByUserId(userId, req);
  }

  /** @deprecated Use POST /cart/users/:userId/items */
  @Post(':userId/items')
  addToCartLegacy(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AddToCartDto,
    @Req() req: any,
  ) {
    return this.addToCartByUserId(userId, dto, req);
  }

  /** @deprecated Use POST /cart/users/:userId/items */
  @Post(':userId')
  addToCartLegacyRoot(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AddToCartDto,
    @Req() req: any,
  ) {
    return this.addToCartByUserId(userId, dto, req);
  }

  /** @deprecated Use POST /cart/users/:userId/checkout */
  @Post(':userId/checkout')
  checkoutLegacy(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CheckoutDto,
    @Req() req: any,
  ) {
    return this.checkoutByUserId(userId, dto, req);
  }

  /** @deprecated Use PUT /cart/users/:userId/items/:productId */
  @Put(':userId/items/:productId')
  updateCartItemLegacy(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
  ) {
    return this.updateCartItemByUserId(userId, productId, dto, req);
  }

  /** @deprecated Use PUT /cart/users/:userId/items/:productId */
  @Put(':userId/:productId')
  updateCartItemLegacyRoot(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
  ) {
    return this.updateCartItemByUserId(userId, productId, dto, req);
  }

  /** @deprecated Use DELETE /cart/users/:userId/items/:productId */
  @Delete(':userId/items/:productId')
  removeFromCartLegacy(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: any,
  ) {
    return this.removeFromCartByUserId(userId, productId, req);
  }

  /** @deprecated Use DELETE /cart/users/:userId/items/:productId */
  @Delete(':userId/:productId')
  removeFromCartLegacyRoot(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: any,
  ) {
    return this.removeFromCartByUserId(userId, productId, req);
  }

  /** @deprecated Use DELETE /cart/users/:userId/items */
  @Delete(':userId/items')
  clearCartItemsLegacy(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: any,
  ) {
    return this.clearCartByUserId(userId, req);
  }

  /** @deprecated Use DELETE /cart/users/:userId/items */
  @Delete(':userId')
  clearCartLegacy(@Param('userId', ParseUUIDPipe) userId: string, @Req() req: any) {
    return this.clearCartByUserId(userId, req);
  }
}
