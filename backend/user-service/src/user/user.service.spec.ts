import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('assigns CUSTOMER role for regular email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
        fullName: 'Test User',
        role: 'CUSTOMER',
      });

      const result = await service.register({
        email: 'user@example.com',
        password: 'password123',
        fullName: 'Test User',
        gender: 'Male',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'user@example.com',
          role: 'CUSTOMER',
          gender: 'Male',
        }),
      });
      expect(result.access_token).toBe('signed-token');
      expect(result.user.role).toBe('CUSTOMER');
    });

    it('assigns ADMIN role for admin email', async () => {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@meridian.com';
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'admin-1',
        email: adminEmail,
        password: 'hashed-password',
        fullName: 'Admin User',
        role: 'ADMIN',
      });

      const result = await service.register({
        email: adminEmail,
        password: 'password123',
        fullName: 'Admin User',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'ADMIN',
        }),
      });
      expect(result.user.role).toBe('ADMIN');
    });

    it('throws ConflictException when email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
        fullName: 'Test User',
        role: 'CUSTOMER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('signed-token');
      expect(result.user.email).toBe('user@example.com');
    });

    it('throws UnauthorizedException for invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
