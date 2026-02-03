import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, MfaGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import { VideoSessionService } from './services/video-session.service';
import {
  CreateVideoSessionDto,
  VideoSessionResponseDto,
  MeetingTokenResponseDto,
  ConsentRecordingDto,
  EndSessionResponseDto,
} from './dto';

@ApiTags('Telehealth')
@Controller('telehealth')
@UseGuards(JwtAuthGuard, RolesGuard, MfaGuard)
@ApiBearerAuth()
export class TelehealthController {
  constructor(private readonly videoSessionService: VideoSessionService) {}

  @Post('sessions')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar sessão de vídeo para uma consulta' })
  @ApiResponse({ status: 201, type: VideoSessionResponseDto })
  async createSession(
    @Body() dto: CreateVideoSessionDto,
  ): Promise<VideoSessionResponseDto> {
    return this.videoSessionService.createSession(dto.appointmentId, {
      enableRecording: dto.enableRecording,
      enableTranscription: dto.enableTranscription,
    });
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Obter sessão de vídeo por ID' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, type: VideoSessionResponseDto })
  async getSession(
    @Param('id') id: string,
  ): Promise<VideoSessionResponseDto> {
    return this.videoSessionService.getSessionById(id);
  }

  @Get('appointments/:appointmentId/session')
  @ApiOperation({ summary: 'Obter sessão de vídeo por ID do agendamento' })
  @ApiParam({ name: 'appointmentId', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, type: VideoSessionResponseDto })
  async getSessionByAppointment(
    @Param('appointmentId') appointmentId: string,
  ): Promise<VideoSessionResponseDto | null> {
    return this.videoSessionService.getSessionByAppointmentId(appointmentId);
  }

  @Post('sessions/:id/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter token de acesso para a sessão (TTL 1h)' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, type: MeetingTokenResponseDto })
  async getMeetingToken(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MeetingTokenResponseDto> {
    return this.videoSessionService.getMeetingToken(id, user.id, user.role);
  }

  @Post('sessions/:id/end')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar sessão de vídeo' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  @ApiResponse({ status: 200, type: EndSessionResponseDto })
  async endSession(
    @Param('id') id: string,
  ): Promise<EndSessionResponseDto> {
    await this.videoSessionService.endSession(id);
    return {
      success: true,
      sessionId: id,
    };
  }

  @Post('sessions/:id/consent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar consentimento para gravação/transcrição' })
  @ApiParam({ name: 'id', description: 'ID da sessão' })
  async recordConsent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConsentRecordingDto,
  ): Promise<{ success: boolean }> {
    await this.videoSessionService.recordConsents(
      user.id,
      id,
      dto.consentRecording,
      dto.consentTranscription,
    );
    return { success: true };
  }
}
