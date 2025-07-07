import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegistrationDto } from './dto/registration.dto';
import argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { SessionService } from 'src/session/session.service';
import { LoginDto } from './dto/login.dto';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

type JwtPayload = {
  sub: number;
  email: string;
};

type SignedJwtPayload = JwtPayload & { iat: number; exp: number };

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  public async registration(registrationDto: RegistrationDto): Promise<Tokens> {
    const hashedPassword = await argon2.hash(registrationDto.password);
    console.log(hashedPassword);

    const { id, email } = await this.userService.createOne({
      email: registrationDto.email,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens({
      sub: id,
      email,
    });

    const expiresAt = this.getTokenExpiry(tokens.refreshToken);

    await this.sessionService.createOne({
      refreshToken: tokens.refreshToken,
      expiresAt,
      userId: id,
    });

    return tokens;
  }

  public async login(loginDto: LoginDto): Promise<Tokens> {
    const user = await this.userService.findByEmailOrThrow(loginDto.email);

    await this.validatePasswordOrFail(user.password, loginDto.password);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    const expiresAt = this.getTokenExpiry(tokens.refreshToken);

    await this.sessionService.createOne({
      refreshToken: tokens.refreshToken,
      expiresAt,
      userId: user.id,
    });

    return tokens;
  }

  public async refresh(oldRefreshToken?: string): Promise<Tokens> {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const payload = await this.verifyRefreshToken(oldRefreshToken);

    const session = await this.sessionService.findValidByRefreshToken(
      payload.sub,
      oldRefreshToken,
    );

    const tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
    });

    const expiresAt = this.getTokenExpiry(tokens.refreshToken);

    await this.sessionService.updateOne(session.id, {
      expiresAt,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  private async generateTokens(jwtPayload: JwtPayload): Promise<Tokens> {
    const accessTokenPromise = this.jwtService.signAsync(jwtPayload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshTokenPromise = this.jwtService.signAsync(jwtPayload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]).catch(() => {
      throw new InternalServerErrorException('Генерация токена не удалась');
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<SignedJwtPayload> {
    return this.jwtService
      .verifyAsync<SignedJwtPayload>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      .catch(() => {
        throw new UnauthorizedException('Недействительный refresh token');
      });
  }

  private async validatePasswordOrFail(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<void> {
    const valid = await argon2.verify(hashedPassword, plainPassword);
    if (!valid) {
      throw new UnauthorizedException('Неверный пароль');
    }
  }

  private getTokenExpiry(token: string): Date {
    const decoded = this.jwtService.decode(token) as SignedJwtPayload;

    return new Date(decoded.exp * 1000);
  }
}
