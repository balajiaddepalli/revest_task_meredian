import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: any;

  const mockPrisma = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should filter deletedAt null by default', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      await service.findAll({});
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should include deleted when includeDeleted is true', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      await service.findAll({ includeDeleted: true });
      const where = mockPrisma.product.findMany.mock.calls[0][0].where;
      expect(where.deletedAt).toBeUndefined();
    });

    it('should search by name', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      await service.findAll({ search: 'widget' });
      const where = mockPrisma.product.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeDefined();
      expect(where.OR[0].name.contains).toBe('widget');
    });

    it('should filter by categoryId', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      await service.findAll({ categoryId: 'cat-1' });
      const where = mockPrisma.product.findMany.mock.calls[0][0].where;
      expect(where.categoryId).toBe('cat-1');
    });

    it('should support pagination', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      await service.findAll({ skip: 5, take: 10 });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 10 }),
      );
    });

    it('should return data and total', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.product.count.mockResolvedValue(1);
      const result = await service.findAll({});
      expect(result).toEqual({ data: [{ id: 'p1' }], total: 1 });
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when product is archived', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', deletedAt: new Date() });
      await expect(service.findById('p1')).rejects.toThrow(NotFoundException);
    });

    it('returns product when active', async () => {
      const product = { id: 'p1', deletedAt: null, name: 'Widget' };
      mockPrisma.product.findUnique.mockResolvedValue(product);
      await expect(service.findById('p1')).resolves.toEqual(product);
    });
  });
});
