import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && status !== "loading") {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
