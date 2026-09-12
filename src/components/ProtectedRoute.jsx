import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="h-8 w-8 rounded-full border-2 border-rust border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
