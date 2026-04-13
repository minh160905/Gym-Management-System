import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "owner" | "manager" | "trainer" | "customer";

interface AuthContextType {
  role: Role | null;
  setRole: (role: Role | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    const saved = localStorage.getItem("gym_role");
    return (saved as Role) || null;
  });

  const setRole = (newRole: Role | null) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("gym_role", newRole);
    } else {
      localStorage.removeItem("gym_role");
    }
  };

  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, setRole, logout }}>
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
