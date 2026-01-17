import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('availability')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ============================================================================
  // CREATE AVAILABILITY (Doctor configures their schedule)
  // ============================================================================

  @Post()
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async create(@Req() req: any, @Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(
      req.organizationId,
      req.user.doctorProfile?.id,
      dto,
    );
  }

  // ============================================================================
  // GET DOCTOR'S AVAILABILITY CONFIGURATION
  // ============================================================================

  @Get('config')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async getMyConfig(@Req() req: any) {
    return this.availabilityService.findByDoctor(req.user.doctorProfile?.id);
  }

  @Get('config/:doctorId')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY')
  async getDoctorConfig(@Param('doctorId') doctorId: string) {
    return this.availabilityService.findByDoctor(doctorId);
  }

  // ============================================================================
  // GET AVAILABLE SLOTS FOR BOOKING
  // ============================================================================

  @Get('slots/:doctorId')
  @Roles('OWNER', 'ADMIN', 'DOCTOR', 'SECRETARY', 'VIEWER')
  async getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Limit to 30 days max
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 30);
    const effectiveEnd = end > maxEnd ? maxEnd : end;

    return this.availabilityService.getAvailableSlots(
      doctorId,
      start,
      effectiveEnd,
    );
  }

  // ============================================================================
  // UPDATE AVAILABILITY
  // ============================================================================

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(
      id,
      req.user.doctorProfile?.id,
      dto,
    );
  }

  // ============================================================================
  // DELETE AVAILABILITY
  // ============================================================================

  @Delete(':id')
  @Roles('OWNER', 'ADMIN', 'DOCTOR')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.availabilityService.delete(id, req.user.doctorProfile?.id);
  }

}
