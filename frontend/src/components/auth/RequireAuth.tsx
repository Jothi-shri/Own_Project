import { Navigate } from "react-router-dom";
import { useSaaSStore } from "../../store";

interface RequireAuthProps {
  protectedContent: React.ReactNode;
}

export default function RequireAuth({ protectedContent }: RequireAuthProps) {
  const authenticatedUser = useSaaSStore((s) => s.user);
  if (!authenticatedUser) return <Navigate to="/login" replace />;
  return <>{protectedContent}</>;
}
