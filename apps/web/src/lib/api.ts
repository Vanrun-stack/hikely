import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach JWT ────────────────────────────
api.interceptors.request.use(config => {
  const token = Cookies.get('access_token') ?? sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — token refresh ────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        Cookies.set('access_token', data.accessToken, { secure: true, sameSite: 'strict' });
        failedQueue.forEach(p => p.resolve(data.accessToken));
        failedQueue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        failedQueue.forEach(p => p.reject(refreshError));
        failedQueue = [];
        Cookies.remove('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Typed API client ────────────────────────────────────────────
export const apiClient = {
  hikes: {
    getAll: (params: Record<string, any>) =>
      api.get('/hikes', { params }).then(r => r.data),
    getBySlug: (slug: string) =>
      api.get(`/hikes/${slug}`).then(r => r.data),
    create: (data: any) =>
      api.post('/hikes', data).then(r => r.data),
    update: (id: string, data: any) =>
      api.patch(`/hikes/${id}`, data).then(r => r.data),
    delete: (id: string) =>
      api.delete(`/hikes/${id}`).then(r => r.data),
    getNearby: (id: string, params?: any) =>
      api.get(`/hikes/${id}/nearby`, { params }).then(r => r.data),
    getGpxDownload: (id: string) =>
      api.get(`/hikes/${id}/gpx/download`).then(r => r.data),
  },

  auth: {
    login: (data: { email: string; password: string }) =>
      api.post('/auth/login', data).then(r => r.data),
    register: (data: any) =>
      api.post('/auth/register', data).then(r => r.data),
    logout: () =>
      api.post('/auth/logout').then(r => r.data),
    me: () =>
      api.get('/auth/me').then(r => r.data),
  },

  reviews: {
    getForHike: (hikeId: string, params?: any) =>
      api.get(`/reviews/hike/${hikeId}`, { params }).then(r => r.data),
    create: (data: any) =>
      api.post('/reviews', data).then(r => r.data),
    update: (id: string, data: any) =>
      api.patch(`/reviews/${id}`, data).then(r => r.data),
    delete: (id: string) =>
      api.delete(`/reviews/${id}`).then(r => r.data),
  },

  favorites: {
    add: (hikeId: string) =>
      api.post(`/favorites/${hikeId}`).then(r => r.data),
    remove: (hikeId: string) =>
      api.delete(`/favorites/${hikeId}`).then(r => r.data),
    getAll: () =>
      api.get('/favorites').then(r => r.data),
  },

  search: {
    query: (params: any) =>
      api.get('/search', { params }).then(r => r.data),
  },

  users: {
    getProfile: (username: string) =>
      api.get(`/users/${username}`).then(r => r.data),
    updateProfile: (data: any) =>
      api.patch('/users/me', data).then(r => r.data),
  },
};
