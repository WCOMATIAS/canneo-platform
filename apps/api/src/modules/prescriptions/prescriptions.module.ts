import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionService } from './services/prescription.service';
import { SignatureService } from './services/signature.service';
import { SncrAdapterService } from './services/sncr-adapter.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ConfigModule, PrismaModule, StorageModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionService, SignatureService, SncrAdapterService],
  exports: [PrescriptionService, SignatureService, SncrAdapterService],
})
export class PrescriptionsModule {}
