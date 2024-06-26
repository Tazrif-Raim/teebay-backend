import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSessionGuard } from './guards/user-session.guard';

@Module({
  providers: [AuthService, AuthResolver, PrismaService, UserSessionGuard],
})
export class AuthModule {}