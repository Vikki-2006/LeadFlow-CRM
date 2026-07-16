import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useToast } from "./ToastContext";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: "Admin" | "Sales Executive";
  is_active: boolean;
  profile_picture: string | null;
  created_at: string;
}

interface AuthContextProps {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: UserProfile) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("leadflow_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem("leadflow_token");
    localStorage.removeItem("leadflow_user");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<UserProfile>("/auth/me");
      setUser(response.data);
      localStorage.setItem("leadflow_user", JSON.stringify(response.data));
    } catch (err) {
      // If fetching fails, token might be invalid or expired
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    fetchCurrentUser();
  }, [token, refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const response = await api.post<{ access_token: string; token_type: string; role: string; name: string }>(
        "/auth/login",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = response.data.access_token;
      localStorage.setItem("leadflow_token", accessToken);
      setToken(accessToken);
      
      // Wait for user details
      const userResponse = await api.get<UserProfile>("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setUser(userResponse.data);
      localStorage.setItem("leadflow_user", JSON.stringify(userResponse.data));
      success(`Welcome back, ${userResponse.data.name}!`, "Login Successful");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Invalid email or password";
      error(errMsg, "Authentication Failed");
      setIsLoading(false);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = useCallback((updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem("leadflow_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
