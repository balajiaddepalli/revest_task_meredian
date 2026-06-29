import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, getJwtRole, getJwtUserId, getJwtEmail, setUnauthorizedHandler } from '@/lib/api';
import { AuthUser } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUserFromToken(): AuthUser | null {
  const id = getJwtUserId();
  if (!id) return null;
  return {
    id,
    email: getJwtEmail(),
    role: getJwtRole(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    setUser(buildUserFromToken());
  }, []);

  useEffect(() => {
    refreshUser();
    setLoading(false);
    setUnauthorizedHandler(() => {
      setUser(null);
      navigate('/login');
    });
  }, [refreshUser, navigate]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('accessToken', res.data.access_token || res.data.accessToken);
    const apiUser = res.data.user;
    if (apiUser?.id) {
      setUser({
        id: apiUser.id,
        email: apiUser.email,
        fullName: apiUser.fullName,
        role: apiUser.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
      });
    } else {
      refreshUser();
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
