import { Navigate } from "react-router";
import { ReactNode } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
  return children;
};
