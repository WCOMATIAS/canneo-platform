import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('consultations/:consultationId/video')
@UseGuards(JwtAuthGuard, TenantGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // ============================================================================
  // GET VIDEO TOKEN FOR CONSULTATION
  // ============================================================================

  @Post('token')
  async getVideoToken(
    @Req() req: any,
    @Param('consultationId') consultationId: string,
  ) {
    return this.videoService.getVideoToken(
      consultationId,
      req.user.id,
      req.organizationId,
    );
  }

  // ============================================================================
  // GET ROOM INFO
  // ============================================================================

  @Get('room-info')
  async getRoomInfo(
    @Req() req: any,
    @Param('consultationId') consultationId: string,
  ) {
    // First get the consultation to find room name
    const { roomUrl } = await this.videoService.getVideoToken(
      consultationId,
      req.user.id,
      req.organizationId,
    );

    // Extract room name from URL
    const roomName = roomUrl.split('/').pop();
    if (!roomName) {
      return { active: false };
    }

    const roomInfo = await this.videoService.getRoomInfo(roomName);
    return {
      active: !!roomInfo,
      roomInfo,
    };
  }
}
