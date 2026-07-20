import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID:     config.getOrThrow('GITHUB_CLIENT_ID'),
      clientSecret: config.getOrThrow('GITHUB_CLIENT_SECRET'),
      callbackURL:  `${config.get('API_URL')}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void) {
    const { id, displayName, emails, photos } = profile;
    done(null, {
      provider:    'github',
      providerId:  String(id),
      email:       emails?.[0]?.value,
      displayName: displayName || profile.username,
      avatarUrl:   photos?.[0]?.value,
    });
  }
}
