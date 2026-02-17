import { Navigate } from "react-router-dom";
import { getAuthUser, roleHomePath } from "../../utils/auth";

type Props = {
  children: React.ReactNode;
};

export default function PublicOnlyRoute({ children }: Props) {
  const user = getAuthUser();

  // if already logged in, send to their role home
  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  // otherwise, render children
  return <>{children}</>;
}
