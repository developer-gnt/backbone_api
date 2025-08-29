import { PartialType } from '@nestjs/mapped-types';
import { CreateFormsDto } from './create-forms.dto';

export class UpdateFormsDto extends PartialType(CreateFormsDto) {}
