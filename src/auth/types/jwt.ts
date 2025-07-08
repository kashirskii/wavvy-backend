export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export type JwtPayload = {
  sub: number;
  email: string;
};

export type SignedJwtPayload = JwtPayload & { iat: number; exp: number };
