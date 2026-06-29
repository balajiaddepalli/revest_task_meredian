import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CartModule, PrismaModule],
})
export class AppModule {}
