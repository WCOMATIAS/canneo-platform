import { Module } from '@nestjs/common';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './services/pharmacy.service';
import { ProximitySearchService } from './services/proximity-search.service';
import { InventoryService } from './services/inventory.service';
import { OrderService } from './services/order.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PharmacyController],
  providers: [
    PharmacyService,
    ProximitySearchService,
    InventoryService,
    OrderService,
  ],
  exports: [
    PharmacyService,
    ProximitySearchService,
    InventoryService,
    OrderService,
  ],
})
export class PharmacyModule {}
