import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [AuthModule, ProductModule, OrderModule, UserModule, CartModule],
  controllers: [HealthController],
})
export class AppModule {}
