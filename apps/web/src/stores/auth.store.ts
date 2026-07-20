import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  level: number;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      setAccessToken: (token) => {
        if (token) {
          Cookies.set('access_token', token, { secure: true, sameSite: 'strict' });
        } else {
          Cookies.remove('access_token');
        }
        set({ accessToken: token });
      },

      logout: () => {
        Cookies.remove('access_token');
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'hikely-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
