import { Navigate } from "react-router-dom";
import { getAuthUser, roleHomePath, type Role } from "../../utils/auth";

type Props = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const user = getAuthUser();

  // if not logged in, send to login
  if (!user) return <Navigate to="/login" replace />;

  // if logged in but role not allowed, send to their dashboard
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  // otherwise, render children
  return <>{children}</>;
}
