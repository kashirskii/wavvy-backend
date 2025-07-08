import { IsEmail, IsNumber } from 'class-validator';

export class SignedJwtPayloadDto {
  @IsNumber()
  sub: number;

  @IsEmail()
  email: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}
