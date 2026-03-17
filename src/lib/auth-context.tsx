"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  avatarUrl?: string | null;
  company?: {
    id: string;
    name: string;
    logo?: string | null;
    isVerified?: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 401) {
        setUser(null);
      }
      // On 500/other errors, keep existing user state (don't logout)
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Network error — keep existing user state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (data: any) => {
    setLoading(true);
    try {
      setUser(data);
      if (data.role === "ADMIN") {
        router.push("/admin");
      } else if (data.role === "EMPLOYER") {
        router.push("/employer");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
