import { motion } from 'framer-motion';
import { useAuth, type UserRole } from '../context/AuthContext';
import { ContributorView } from '../components/dashboard/ContributorView';
import { AnalystView } from '../components/dashboard/AnalystView';
import { ManagerView } from '../components/dashboard/ManagerView';

export default function Dashboard() {
    const { user } = useAuth();

    // If technically impossible state of no user on protected route, return null
    if (!user) return null;

    return (
        <div className="w-full h-full pb-20"> {/* pb-20 for scroll space */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span className="capitalize">{user.role} Workspace</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-primary">Live</span>
                </div>
            </motion.div>

            {/* Role-Based View Switcher */}
            {user.role === 'contributor' && <ContributorView />}
            {user.role === 'analyst' && <AnalystView />}
            {user.role === 'manager' && <ManagerView />}
        </div>
    );
}
