import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class RegistrationDto {
  @ApiProperty({
    example: 'alex.moreno93@examplemail.com',
    description: 'Email пользователя. Должен быть валидным email-адресом.',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'S3cuRe!Passw0rd#2025',
    description: `Надёжный пароль. Должен содержать:
    - минимум 8 символов,
    - хотя бы одну заглавную букву,
    - хотя бы одну строчную букву,
    - хотя бы одну цифру,
    - хотя бы один специальный символ.`,
    required: true,
  })
  @IsStrongPassword()
  password: string;
}
