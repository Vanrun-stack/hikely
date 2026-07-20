import { getHikes, getHikeBySlug } from '@/actions/hike.actions';
import { auth } from '@/lib/auth';

// Server-side API helper (for RSC / generateMetadata)
export const apiServer = {
  hikes: {
    getAll: (params: Record<string, any>) => getHikes(params),
    getBySlug: (slug: string) => getHikeBySlug(slug),
  },
};

// Server-side current user (reads from cookies in RSC)
export async function currentUser() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

