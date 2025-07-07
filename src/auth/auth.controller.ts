import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/registration')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description:
      'Пользователь успешно зарегистрирован. Возвращается accessToken.',
  })
  @ApiResponse({ status: 400, description: 'Неверные данные запроса' })
  async registration(
    @Body() registrationDto: RegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.registration(registrationDto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return tokens.accessToken;
  }

  @Post('/login')
  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход. Возвращается accessToken.',
  })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginDto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return tokens.accessToken;
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Обновление accessToken по refreshToken из cookie' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'AccessToken успешно обновлён' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token недействителен или отсутствует',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return tokens.accessToken;
  }
}
