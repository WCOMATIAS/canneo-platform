import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, CryptoUtil],
  exports: [PatientsService],
})
export class PatientsModule {}
