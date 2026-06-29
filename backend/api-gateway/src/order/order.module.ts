import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { OrderController } from './order.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_SERVICE_HOST || 'localhost',
          port: Number(process.env.ORDER_SERVICE_PORT) || 3002,
        },
      },
    ]),
  ],
  controllers: [OrderController],
})
export class OrderModule {}
