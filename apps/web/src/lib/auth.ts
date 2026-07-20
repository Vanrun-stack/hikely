/**
 * NextAuth.js v5 Configuration
 * Handles credentials + OAuth (Google, GitHub) authentication.
 * Uses Prisma adapter for session/user persistence in PostgreSQL.
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            level: true,
            isActive: true,
            passwordHash: true,
          },
        });

        if (!user || !user.passwordHash || !user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username,
          image: user.avatarUrl,
          username: user.username,
          role: user.role,
          level: user.level,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.level = (user as any).level;
      }
      // Handle session updates (e.g., profile edit)
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.image = session.image;
        token.username = session.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).level = token.level;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth, create or link user
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Auto-create user for OAuth
          const username =
            user.email!.split('@')[0] +
            Math.random().toString(36).substring(2, 6);

          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              username,
              displayName: user.name,
              avatarUrl: user.image,
              isVerified: true,
              emailVerifiedAt: new Date(),
            },
          });

          // Create OAuth account link
          await prisma.oAuthAccount.create({
            data: {
              userId: newUser.id,
              provider: account!.provider,
              providerId: account!.providerAccountId,
              accessToken: account!.access_token,
            },
          });

          user.id = newUser.id;
        } else {
          // Link OAuth if not already linked
          const existing = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerId: {
                provider: account!.provider,
                providerId: account!.providerAccountId,
              },
            },
          });

          if (!existing) {
            await prisma.oAuthAccount.create({
              data: {
                userId: existingUser.id,
                provider: account!.provider,
                providerId: account!.providerAccountId,
                accessToken: account!.access_token,
              },
            });
          }

          user.id = existingUser.id;
        }
      }
      return true;
    },
  },
});
