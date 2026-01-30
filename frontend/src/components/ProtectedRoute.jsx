import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  // TEMPORAIRE : Authentification désactivée pour tests
  return children;
  
  /* AUTHENTIFICATION DÉSACTIVÉE TEMPORAIREMENT
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  return children;
  */
};

export default ProtectedRoute;
