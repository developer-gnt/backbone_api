import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PackageService } from './package.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { Users } from 'src/user/entities/user.entity';
import { CreateClientPackagePricingDto } from './dto/create-client-package-pricing.dto';
import { UpdateClientPackagePricingDto } from './dto/update-client-package-pricing.dto';

@ApiTags('Master Packages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/package')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  create(@CurrentUser() user: Users, @Body() dto: CreatePackageDto) {
    return this.packageService.create(dto, user);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('username') username?: string,
  ) {
    return this.packageService.findAll({ userId, username });
  }

  @Get('pricing-overrides')
  getPricingOverrides(
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.packageService.getPricingOverrides({
      userId,
      username,
      activeOnly,
    });
  }

  @Post('pricing-overrides')
  createPricingOverride(@Body() dto: CreateClientPackagePricingDto) {
    return this.packageService.upsertPricingOverride(dto);
  }

  @Patch('pricing-overrides/:id')
  updatePricingOverride(
    @Param('id') id: string,
    @Body() dto: UpdateClientPackagePricingDto,
  ) {
    return this.packageService.updatePricingOverride(id, dto);
  }

  @Delete('pricing-overrides/:id')
  removePricingOverride(@Param('id') id: string) {
    return this.packageService.removePricingOverride(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Users,
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.packageService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packageService.remove(id);
  }
}
