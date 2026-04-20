import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'Username or email of the user.',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'ChangeMe@123',
    description: 'Password of the user.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
