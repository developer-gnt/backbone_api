import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Authorize } from 'src/packages/authorization/roles.decorator';
import { PermissionKey } from 'src/packages/authorization/permission-key.enum';
import { TatPricingService } from './tat-pricing.service';
import { UpsertClientTatPricingDto } from './dto/upsert-client-tat-pricing.dto';
import { UpdateClientTatPricingDto } from './dto/update-client-tat-pricing.dto';

@ApiTags('TAT Pricing')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TatPricingController {
  constructor(private readonly tatPricingService: TatPricingService) {}

  @Get('tat-packages')
  getTatPackages(@Query('username') username?: string) {
    return this.tatPricingService.getTatPackages(username);
  }

  @Get('admin/client-tat-pricing/:username')
  @Authorize([PermissionKey.GetUser])
  getAdminClientTatPricing(@Param('username') username: string) {
    return this.tatPricingService.getAdminClientTatPricing(username);
  }

  @Post('admin/client-tat-pricing')
  @Authorize([PermissionKey.EditUser])
  upsertClientTatPricing(@Body() dto: UpsertClientTatPricingDto) {
    return this.tatPricingService.upsertClientTatPricing(dto);
  }

  @Patch('admin/client-tat-pricing/:id')
  @Authorize([PermissionKey.EditUser])
  updateClientTatPricing(
    @Param('id') id: string,
    @Body() dto: UpdateClientTatPricingDto,
  ) {
    return this.tatPricingService.updateClientTatPricing(id, dto);
  }

  @Delete('admin/client-tat-pricing/:id')
  @Authorize([PermissionKey.EditUser])
  disableClientTatPricing(@Param('id') id: string) {
    return this.tatPricingService.disableClientTatPricing(id);
  }
}