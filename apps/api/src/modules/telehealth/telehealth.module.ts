import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TelehealthController } from './telehealth.controller';
import { DailyService } from './services/daily.service';
import { VideoSessionService } from './services/video-session.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TelehealthController],
  providers: [DailyService, VideoSessionService],
  exports: [DailyService, VideoSessionService],
})
export class TelehealthModule {}
