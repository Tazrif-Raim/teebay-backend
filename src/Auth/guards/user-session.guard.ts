import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserSessionGuard implements CanActivate {
  constructor(private readonly db: PrismaService, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = await GqlExecutionContext.create(context);
    const request = await ctx.getContext().req;

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const rawToken = authHeader.split(' ')[1];
    if (!rawToken) {
      throw new UnauthorizedException('No token provided');
    }

    const token = await this.authService.hashToken(rawToken);

    const tokenEntry = await this.db.session.findUnique({
      where: { token },
    });

    if (!tokenEntry) {
      throw new UnauthorizedException('Invalid token');
    }

    if(tokenEntry.expiry < new Date()) {
        await this.authService.deleteSession(token);
        throw new UnauthorizedException('Session expired');
    }

    const user = await this.db.user.findUnique({
      where: { id: tokenEntry.userId },
    });

    //might be subject to change
    if (!user || user.access !== Role.USER) {
      throw new UnauthorizedException('Access denied');
    }

    request.user = user; // Attach user to request object for further use

    return true;
  }
}
