import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  public async createOne(
    session: Prisma.SessionUncheckedCreateInput,
  ): Promise<Session> {
    const hashedRefreshToken = await argon2.hash(session.refreshToken);

    return await this.prisma.session.create({
      data: {
        userId: session.userId,
        refreshToken: hashedRefreshToken,
        expiresAt: session.expiresAt,
      },
    });
  }

  public async updateOne(
    sessionId: number,
    data: { refreshToken: string; expiresAt: Date },
  ): Promise<Session> {
    const hashedRefreshToken = await argon2.hash(data.refreshToken);

    return await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: hashedRefreshToken,
        expiresAt: data.expiresAt,
      },
    });
  }

  public async findAllByUserId(userId: number): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId },
    });
  }

  public async findValidByRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<Session> {
    const sessions = await this.findAllByUserId(userId);

    for (const session of sessions) {
      const isMatch = await argon2.verify(session.refreshToken, refreshToken);
      if (isMatch) return session;
    }

    throw new UnauthorizedException(
      'Refresh token не найден или недействителен',
    );
  }
}
