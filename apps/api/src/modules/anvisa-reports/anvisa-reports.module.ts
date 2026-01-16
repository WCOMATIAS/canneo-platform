import { Module } from '@nestjs/common';
import { AnvisaReportsController } from './anvisa-reports.controller';
import { AnvisaReportsService } from './anvisa-reports.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Module({
  controllers: [AnvisaReportsController],
  providers: [AnvisaReportsService, CryptoUtil],
  exports: [AnvisaReportsService],
})
export class AnvisaReportsModule {}
