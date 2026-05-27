import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  private convertToSeconds(timeStr: string): number {
    const units: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    return value * (units[unit] || 0);
  }

  async generateTokens(userId: string, username: string, role: string) {
    const payload = { sub: userId, username, role };
    const accessTokenExpires =
      this.configService.get<string>('JWT_ACCESS_EXPIRES') || '15m';
    const refreshTokenExpires =
      this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: accessTokenExpires as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpires as any,
      }),
    ]);

    const hashedRt = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: hashedRt,
      },
    });

    const expiresInSeconds = this.convertToSeconds(accessTokenExpires);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresInSeconds,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Access denied');
    }

    await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!isMatch) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refresh_token: null },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user.id, user.username, user.role!);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { email: dto.username },
        ],
        is_active: true,
        deleted_at: null,
      },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.username,
      user.role!,
    );

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: null,
      },
    });

    return { message: 'Logged out' };
  }
}
