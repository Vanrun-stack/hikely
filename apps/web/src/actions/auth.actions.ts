'use server';

/**
 * Auth Server Actions
 * Registration, login via NextAuth, and profile management.
 */
import { signIn, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// ─── Validation Schemas ──────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(50, 'Maximum 50 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Caractères alphanumériques, tirets et underscores uniquement'),
  displayName: z.string().min(2, 'Minimum 2 caractères').max(100).optional(),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// ─── Types ───────────────────────────────────────────────────────

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ─── Register ────────────────────────────────────────────────────

export async function registerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    username: formData.get('username'),
    displayName: formData.get('displayName') || undefined,
    password: formData.get('password'),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, username, displayName, password } = parsed.data;

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return {
      success: false,
      error:
        existing.email === email
          ? 'Cet email est déjà utilisé'
          : 'Ce nom d\'utilisateur est déjà pris',
    };
  }

  // Hash password (12 rounds)
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      username,
      displayName: displayName ?? username,
      passwordHash,
    },
  });

  // Auto-login after register
  await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  redirect('/dashboard');
}

// ─── Login ───────────────────────────────────────────────────────

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return {
      success: false,
      error: 'Email ou mot de passe incorrect',
    };
  }

  redirect('/dashboard');
}

// ─── Logout ──────────────────────────────────────────────────────

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect('/');
}

// ─── OAuth ───────────────────────────────────────────────────────

export async function oauthAction(provider: 'google' | 'github') {
  await signIn(provider, { redirectTo: '/dashboard' });
}
