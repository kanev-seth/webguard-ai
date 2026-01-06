import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout() {
    const location = useLocation();

    return (
        <div className="flex bg-slate-950 h-screen w-full overflow-hidden text-slate-100 selection:bg-primary/20 selection:text-primary">
            <Sidebar />
            <main className="flex-1 relative overflow-hidden">
                {/* Background Ambient Mesh */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px] animate-slow-spin" />
                    <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[100px] animate-float" />
                </div>

                <div className="relative z-10 h-full overflow-auto p-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.99 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
