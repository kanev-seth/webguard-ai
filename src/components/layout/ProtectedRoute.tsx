import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';

// Role → first console route they should land on after login
const ROLE_HOME: Record<UserRole, string> = {
    contributor: '/console/ingest',
    analyst:     '/console/analyze',
    manager:     '/console/command',
};

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-lavender border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// Separate helper used by Login to know where to send the user
export function getRoleHome(role: UserRole): string {
    return ROLE_HOME[role];
}
