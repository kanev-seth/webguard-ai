import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col bg-slate-950 h-screen w-full overflow-hidden text-slate-100">
            {/* Persistent top bar */}
            <TopBar />

            <div className="flex flex-1 min-h-0">
                <Sidebar />

                <main className="flex-1 relative overflow-hidden">
                    {/* Ambient mesh blobs */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-lavender/4 blur-[100px] animate-slow-spin" />
                        <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-emerald/3 blur-[90px] animate-float" />
                    </div>

                    <div className="relative z-10 h-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="h-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
