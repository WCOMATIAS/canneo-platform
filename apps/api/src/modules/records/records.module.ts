import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { MedicalRecordService } from './services/medical-record.service';
import { DocumentService } from './services/document.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [RecordsController],
  providers: [MedicalRecordService, DocumentService],
  exports: [MedicalRecordService, DocumentService],
})
export class RecordsModule {}
