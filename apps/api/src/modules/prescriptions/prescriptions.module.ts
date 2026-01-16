import { Module } from '@nestjs/common';
import {
  PrescriptionsController,
  ProductsController,
} from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Module({
  controllers: [PrescriptionsController, ProductsController],
  providers: [PrescriptionsService, CryptoUtil],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
