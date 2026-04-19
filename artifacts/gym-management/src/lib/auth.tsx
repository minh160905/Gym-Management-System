import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { SystemUser } from "@workspace/api-client-react";

export type Role = "owner" | "manager" | "trainer" | "customer" | string;

interface AuthContextType {
  role: Role | null;
  userId: number | null;
  fullName: string | null;
  memberId: number | null;
  staffId: number | null;
  setAuth: (user: SystemUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => localStorage.getItem("gym_role"));
  const [userId, setUserId] = useState<number | null>(() => {
    const val = localStorage.getItem("gym_userId");
    return val ? parseInt(val, 10) : null;
  });
  const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem("gym_fullName"));
  const [memberId, setMemberId] = useState<number | null>(() => {
    const val = localStorage.getItem("gym_memberId");
    return val ? parseInt(val, 10) : null;
  });
  const [staffId, setStaffId] = useState<number | null>(() => {
    const val = localStorage.getItem("gym_staffId");
    return val ? parseInt(val, 10) : null;
  });

  const setAuth = (user: SystemUser | null) => {
    if (user) {
      setRole(user.role);
      setUserId(user.id);
      setFullName(user.fullName);
      setMemberId(user.memberId || null);
      setStaffId(user.staffId || null);

      localStorage.setItem("gym_role", user.role);
      localStorage.setItem("gym_userId", user.id.toString());
      localStorage.setItem("gym_fullName", user.fullName);
      if (user.memberId) localStorage.setItem("gym_memberId", user.memberId.toString());
      else localStorage.removeItem("gym_memberId");
      if (user.staffId) localStorage.setItem("gym_staffId", user.staffId.toString());
      else localStorage.removeItem("gym_staffId");
    } else {
      setRole(null);
      setUserId(null);
      setFullName(null);
      setMemberId(null);
      setStaffId(null);

      localStorage.removeItem("gym_role");
      localStorage.removeItem("gym_userId");
      localStorage.removeItem("gym_fullName");
      localStorage.removeItem("gym_memberId");
      localStorage.removeItem("gym_staffId");
    }
  };

  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ role, userId, fullName, memberId, staffId, setAuth, logout }}>
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
