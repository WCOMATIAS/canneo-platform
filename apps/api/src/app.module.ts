import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Prisma
import { PrismaModule } from './prisma/prisma.module';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { BillingModule } from './modules/billing/billing.module';

// Sprint 2: Telemedicina
import { PatientsModule } from './modules/patients/patients.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { VideoModule } from './modules/video/video.module';

// Sprint 3: Valor Clinico
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { StorageModule } from './modules/storage/storage.module';

// Sprint 4: Diferencial
import { AnvisaReportsModule } from './modules/anvisa-reports/anvisa-reports.module';

// Super Admin
import { SuperAdminModule } from './modules/super-admin/super-admin.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// Interceptors
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    PrismaModule,

    // Core Modules
    AuthModule,
    OrganizationsModule,
    UsersModule,
    BillingModule,

    // Sprint 2: Telemedicina
    PatientsModule,
    AvailabilityModule,
    ConsultationsModule,
    VideoModule,

    // Sprint 3: Valor Clinico
    MedicalRecordsModule,
    PrescriptionsModule,
    PdfModule,
    StorageModule,

    // Sprint 4: Diferencial
    AnvisaReportsModule,

    // Super Admin
    SuperAdminModule,
  ],
  providers: [
    // Global JWT Guard (pode ser desabilitado por rota com @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Audit Log
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
