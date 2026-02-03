import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService, MelhorEnvioService } from './services';
import { PrismaModule } from '../prisma';
import { AuditModule } from '../audit';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ShippingController],
  providers: [ShippingService, MelhorEnvioService],
  exports: [ShippingService, MelhorEnvioService],
})
export class ShippingModule {}
