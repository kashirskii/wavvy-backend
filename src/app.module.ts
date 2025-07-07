import { Module } from '@nestjs/common';
import { ChannelModule } from './channel/channel.module';
import { PrismaModule } from './prisma/prisma.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ChannelModule,
    PrismaModule,
    FileModule,
    UserModule,
    AuthModule,
    SessionModule,
  ],
})
export class AppModule {}
