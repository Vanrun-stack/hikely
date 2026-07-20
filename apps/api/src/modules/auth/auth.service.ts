import {
  Injectable, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register ────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) throw new ConflictException('Email or username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        displayName: dto.displayName ?? dto.username,
        passwordHash,
      },
    });

    return this.generateTokens(user);
  }

  // ─── Login ───────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  // ─── OAuth Login ─────────────────────────────────────────────────
  async oauthLogin(profile: { provider: string; providerId: string; email: string; displayName: string; avatarUrl?: string }) {
    // Find or create user via OAuth
    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: profile.provider, providerId: profile.providerId } },
      include: { user: true },
    });

    if (!oauthAccount) {
      // Try to link to existing email account
      let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

      if (!user) {
        // Create new user
        const baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        const username = `${baseUsername}_${uuidv4().slice(0, 6)}`;
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            username,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            isVerified: true,
            emailVerifiedAt: new Date(),
          },
        });
      }

      oauthAccount = await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: profile.provider,
          providerId: profile.providerId,
        },
        include: { user: true },
      });
    }

    return this.generateTokens(oauthAccount.user);
  }

  // ─── Refresh Tokens ──────────────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(stored.user);
  }

  // ─── Logout ──────────────────────────────────────────────────────
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { revokedAt: new Date() },
      });
    }
  }

  // ─── Validate JWT Payload ────────────────────────────────────────
  async validateJwtPayload(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, email: true, username: true, displayName: true,
        avatarUrl: true, role: true, level: true, xpPoints: true,
        isActive: true, isVerified: true,
      },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;
  }

  // ─── Private Helpers ─────────────────────────────────────────────
  private async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwt.sign(payload);
    const rawRefreshToken = uuidv4();
    const tokenHash = this.hashToken(rawRefreshToken);

    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const days = parseInt(refreshExpiresIn) || 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const userDetails = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true, email: true, username: true, displayName: true,
        avatarUrl: true, role: true, level: true, isVerified: true,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken, user: userDetails };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
