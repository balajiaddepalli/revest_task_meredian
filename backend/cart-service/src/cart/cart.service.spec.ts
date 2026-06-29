import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const mockPrisma = {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProductService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'PRODUCT_SERVICE', useValue: mockProductService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('rejects when requested quantity exceeds stock', async () => {
      mockProductService.send.mockReturnValue(
        of({ id: 'product-1', name: 'Widget', stockQuantity: 2 }),
      );
      mockPrisma.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.addToCart({
          userId: 'user-1',
          productId: 'product-1',
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when total cart quantity exceeds stock', async () => {
      mockProductService.send.mockReturnValue(
        of({ id: 'product-1', name: 'Widget', stockQuantity: 3 }),
      );
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: JSON.stringify([{ productId: 'product-1', quantity: 2 }]),
      });

      await expect(
        service.addToCart({
          userId: 'user-1',
          productId: 'product-1',
          quantity: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('adds item when stock is sufficient', async () => {
      mockProductService.send.mockReturnValue(
        of({ id: 'product-1', name: 'Widget', stockQuantity: 10 }),
      );
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      mockPrisma.cart.create.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: JSON.stringify([{ productId: 'product-1', quantity: 2 }]),
      });

      const result = await service.addToCart({
        userId: 'user-1',
        productId: 'product-1',
        quantity: 2,
      });

      expect(mockProductService.send).toHaveBeenCalledWith('find_product_by_id', {
        id: 'product-1',
      });
      expect(result.items).toEqual([{ productId: 'product-1', quantity: 2 }]);
    });
  });

  describe('updateCartItem', () => {
    it('rejects when updated quantity exceeds stock', async () => {
      mockProductService.send.mockReturnValue(
        of({ id: 'product-1', name: 'Widget', stockQuantity: 1 }),
      );
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: JSON.stringify([{ productId: 'product-1', quantity: 1 }]),
      });

      await expect(
        service.updateCartItem({
          userId: 'user-1',
          productId: 'product-1',
          quantity: 3,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when product is missing from cart', async () => {
      mockProductService.send.mockReturnValue(
        of({ id: 'product-1', name: 'Widget', stockQuantity: 10 }),
      );
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: JSON.stringify([]),
      });

      await expect(
        service.updateCartItem({
          userId: 'user-1',
          productId: 'product-1',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
