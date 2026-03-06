import { motion } from 'framer-motion';

interface MetricWidgetProps {
    label: string;
    value: string | number;
    sub?: string;
    variant?: 'emerald' | 'crimson' | 'lavender';
    ring?: boolean;         // show SVG progress ring (emerald variant)
    ringProgress?: number;  // 0-100
}

const VARIANT_STYLES = {
    emerald:  { text: 'text-emerald',   glow: 'text-glow-emerald',  border: 'border-emerald/20',  bg: 'bg-emerald/5'  },
    crimson:  { text: 'text-crimson',   glow: 'text-glow-crimson',  border: 'border-crimson/20',  bg: 'bg-crimson/5'  },
    lavender: { text: 'text-lavender',  glow: 'text-glow-primary',  border: 'border-lavender/20', bg: 'bg-lavender/5' },
};

export function MetricWidget({ label, value, sub, variant = 'lavender', ring = false, ringProgress = 98 }: MetricWidgetProps) {
    const s = VARIANT_STYLES[variant];

    // SVG ring math
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${s.border} ${s.bg} backdrop-blur-sm`}
        >
            {ring && (
                <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                        {/* Track */}
                        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        {/* Progress */}
                        <motion.circle
                            cx="28" cy="28" r={radius}
                            fill="none"
                            stroke={variant === 'emerald' ? '#10B981' : variant === 'crimson' ? '#DC2626' : '#BDB2FF'}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                        />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center font-bold text-xs ${s.text}`}>
                        {ringProgress}%
                    </div>
                </div>
            )}

            {!ring && (
                <motion.div
                    className={`text-2xl font-bold font-mono leading-none ${s.text} ${s.glow}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {value}
                </motion.div>
            )}

            <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-300 leading-tight truncate">{label}</div>
                {sub && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</div>}
            </div>
        </motion.div>
    );
}
