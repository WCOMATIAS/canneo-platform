import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Module({
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, CryptoUtil],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
