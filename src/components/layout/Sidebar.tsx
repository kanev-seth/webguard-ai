import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, ShieldAlert, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth, type UserRole } from '../../context/AuthContext';

const NAV_ITEMS = {
    contributor: [], // No navigation for contributors
    analyst: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Workbench' },
        { path: '/reports', icon: FileText, label: 'My Reports' },
    ],
    manager: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
        { path: '/reports', icon: FileText, label: 'Archive' },
        { path: '/solutions', icon: Shield, label: 'Solutions' },
    ],
};

export function Sidebar() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();

    if (!user) return null;

    // Contributors have no sidebar navigation as per "Restricted View"
    if (user.role === 'contributor') {
        return (
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={logout}
                    className="flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>
        );
    }

    const items = NAV_ITEMS[user.role as keyof typeof NAV_ITEMS] || [];

    return (
        <div className="h-screen w-20 flex flex-col items-center bg-obsidian border-r border-white/5 py-8 z-50 fixed left-0 top-0">
            <div className="mb-12">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="font-bold text-obsidian text-xl">W</span>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-6 w-full px-4">
                {items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex items-center justify-center p-3 rounded-xl transition-colors duration-300 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(189,178,255,0.1)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon
                                className={`w-6 h-6 z-10 transition-colors duration-300 ${isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                                    }`}
                            />
                        </Link>
                    );
                })}
            </nav>

            <div className="w-full px-4 mt-auto">
                <button
                    onClick={logout}
                    className="flex items-center justify-center p-3 w-full rounded-xl text-slate-500 hover:text-secondary hover:bg-secondary/10 transition-colors duration-300"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
