import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private getAdminEmail(): string {
    return process.env.ADMIN_EMAIL || 'admin@meridian.com';
  }

  private signToken(user: { id: string; email: string; role: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: params?.skip || 0,
        take: params?.take || 100,
      }),
      this.prisma.user.count(),
    ]);
    return { data: users.map((u) => this.excludePassword(u)), total };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const role = dto.email === this.getAdminEmail() ? 'ADMIN' : 'CUSTOMER';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        gender: dto.gender,
        role,
      },
    });

    const token = this.signToken(user);

    return { access_token: token, user: this.excludePassword(user) };
  }

  async login(dto: LoginDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.email === this.getAdminEmail() && user.role !== 'ADMIN') {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }

    const token = this.signToken(user);

    return { access_token: token, user: this.excludePassword(user) };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  async update(id: string, data: { fullName?: string; gender?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.excludePassword(user);
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private excludePassword(user: any) {
    const { password, ...result } = user;
    return result;
  }
}
