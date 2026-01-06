import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to a default dashboard if role is unauthorized for specific route
        // Or could show a 403 Forbidden page. For now, just stay on dashboard or go to login.
        // Ideally, we shouldn't even link to restricted routes.
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
