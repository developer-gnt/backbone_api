import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReferenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string;
}
