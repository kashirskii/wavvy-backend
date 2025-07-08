import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SignedJwtPayload } from '../types/jwt';

export const JwtPayload = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SignedJwtPayload => {
    const payload = ctx.switchToHttp().getRequest().jwtPayload;

    if (!payload) {
      throw new Error(
        'JwtPayload not found. Did you forget to apply the AuthGuard?',
      );
    }
    return payload;
  },
);
