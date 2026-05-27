import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayloadUser {
  userId: string;
  username?: string;
  role?: string;
}

interface JwtPayload {
  sub: string;
  username: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayloadUser> {
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }
    console.log('1. Payload from Token:', payload);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { refresh_token: true },
    });

    console.log('2. User from DB:', user);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException(
        'User has been logged out or token is invalid',
      );
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
