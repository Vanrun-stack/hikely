// ─── Hikely Shared Types ────────────────────────────────────────────────────

// User
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface UserPublic {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  level: number;
  xpPoints: number;
  role: UserRole;
  createdAt: string;
}

export interface UserAuth extends UserPublic {
  email: string;
  isActive: boolean;
  isVerified: boolean;
}

// Hike
export type DifficultyLevel = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'expert';
export type HikeType = 'loop' | 'out_and_back' | 'point_to_point';
export type TerrainType = 'trail' | 'rocky' | 'snow' | 'mixed' | 'via_ferrata';
export type PracticeType = 'hiking' | 'trail_running' | 'snowshoeing' | 'mountain_biking' | 'cycling';
export type HikeStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';

export interface HikeSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  difficulty: DifficultyLevel;
  hikeType: HikeType;
  terrainType: TerrainType;
  practiceType: PracticeType;
  distanceKm?: string | null;
  elevationGainM?: number | null;
  durationMin?: number | null;
  avgRating: string;
  reviewCount: number;
  photoCount: number;
  favoriteCount: number;
  featuredImageUrl?: string | null;
  region?: { id: string; name: string; slug: string } | null;
  author?: UserPublic | null;
  createdAt: string;
}

export interface HikeDetail extends HikeSummary {
  elevationLossM?: number | null;
  altitudeMinM?: number | null;
  altitudeMaxM?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  gpxFile?: {
    id: string;
    storageKey: string;
    elevationProfile?: unknown;
    waypoints?: unknown;
    processingStatus: string;
  } | null;
}

// Review
export interface Review {
  id: string;
  hikeId: string;
  authorId: string;
  author: UserPublic;
  rating: number;
  content?: string | null;
  visitedAt?: string | null;
  conditions?: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
}

// Pagination
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserAuth;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Region
export interface Region {
  id: string;
  name: string;
  slug: string;
  country: string;
  countryCode: string;
  description?: string | null;
  coverUrl?: string | null;
}
