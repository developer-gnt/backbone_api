import { PartialType } from '@nestjs/mapped-types';
import { CreatePointsDto } from './create-points.dto';

export class UpdatePointsDto extends PartialType(CreatePointsDto) {}
