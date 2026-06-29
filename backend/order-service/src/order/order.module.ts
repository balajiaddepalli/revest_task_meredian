import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.PRODUCT_SERVICE_PORT || '3001', 10),
          },
        }),
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
