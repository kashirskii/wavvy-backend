import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'alex.moreno93@examplemail.com',
    description: 'Email пользователя. Должен быть валидным email-адресом.',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'T9v!pX2@rL#8kSeWqY',
    description: 'Надёжный пароль пользователя. Минимум 8 символов.',
    required: true,
  })
  @IsString()
  password: string;
}
