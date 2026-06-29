import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { of } from 'rxjs';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: any;
  let productClient: any;

  const mockPrisma = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockProductClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'PRODUCT_SERVICE', useValue: mockProductClient },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get(PrismaService);
    productClient = module.get('PRODUCT_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw when product validation fails', async () => {
      mockProductClient.send.mockReturnValue(of([]));
      await expect(service.createOrder({
        customerName: 'Test',
        customerEmail: 'test@test.com',
        items: [{ productId: 'p1', quantity: 1 }],
      })).rejects.toThrow(HttpException);
    });

    it('should create order with correct total price', async () => {
      const validated = [{ id: 'p1', name: 'Product', price: 10, stockQuantity: 5 }];
      mockProductClient.send.mockReturnValue(of(validated));
      mockPrisma.order.create.mockResolvedValue({
        id: 'o1', orderNumber: 'ORD-123', totalPrice: 20, status: 'PENDING',
        paymentMethod: 'COD', customerName: 'Test', customerEmail: 'test@test.com',
        items: [{ id: 'i1', orderId: 'o1', productId: 'p1', quantity: 2, unitPrice: 10 }],
      });

      const result = await service.createOrder({
        customerName: 'Test', customerEmail: 'test@test.com',
        items: [{ productId: 'p1', quantity: 2 }],
      });

      expect(result.totalPrice).toBe(20);
      expect(result.items).toHaveLength(1);
      expect(result.paymentMethod).toBe('COD');
      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(mockProductClient.send).toHaveBeenCalledWith('deduct_stock', expect.any(Object));
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 'o1' }]);
      mockPrisma.order.count.mockResolvedValue(1);
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toEqual({ data: [{ id: 'o1' }], total: 1 });
    });
  });

  describe('findOne', () => {
    it('should throw when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(HttpException);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'o1' });
      mockPrisma.order.update.mockResolvedValue({ id: 'o1', status: 'CONFIRMED' });
      const result = await service.updateStatus('o1', 'CONFIRMED');
      expect(result.status).toBe('CONFIRMED');
    });
  });

  describe('remove', () => {
    it('should delete order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'o1' });
      mockPrisma.order.delete.mockResolvedValue({ id: 'o1' });
      await expect(service.remove('o1')).resolves.toEqual({ id: 'o1' });
    });
  });

  describe('findByEmail', () => {
    it('should return orders for email', async () => {
      const orders = [{ id: 'o1', customerEmail: 'test@test.com', items: [] }];
      mockPrisma.order.findMany.mockResolvedValue(orders);
      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(orders);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { customerEmail: 'test@test.com' },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return orders for userId', async () => {
      const orders = [{ id: 'o1', userId: 'user-1', items: [] }];
      mockPrisma.order.findMany.mockResolvedValue(orders);
      const result = await service.findByUserId('user-1');
      expect(result).toEqual(orders);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
    });
  });
});
