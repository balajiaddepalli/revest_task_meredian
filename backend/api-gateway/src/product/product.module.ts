import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { ProductController } from './product.controller';
import { PublicProductController } from './public-product.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
          port: Number(process.env.PRODUCT_SERVICE_PORT) || 3001,
        },
      },
    ]),
  ],
  controllers: [ProductController, PublicProductController],
})
export class ProductModule {}
