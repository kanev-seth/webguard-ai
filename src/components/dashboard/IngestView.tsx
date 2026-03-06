import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, FileText, Clock, Inbox } from 'lucide-react';
import { useSecurity, type PendingLog } from '../../context/SecurityContext';

interface UploadRecord {
    id: string;
    name: string;
    size: string;
    time: string;
    lines: number;
}

function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function IngestView() {
    const { addPendingLog } = useSecurity();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [history, setHistory] = useState<UploadRecord[]>([
        { id: 'h1', name: 'access_2026-03-05.log', size: '2.4 MB', time: '2:14 AM', lines: 18240 },
        { id: 'h2', name: 'nginx_error.log',        size: '412 KB', time: '11:30 PM', lines: 3201 },
    ]);

    const processFile = useCallback((file: File) => {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(Boolean).length;
            setTimeout(() => {
                const record: UploadRecord = {
                    id: crypto.randomUUID(),
                    name: file.name,
                    size: formatBytes(file.size),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    lines,
                };
                setHistory((prev) => [record, ...prev]);

                // ── Push into the Analyst's pending queue ──
                const pending: PendingLog = {
                    id: crypto.randomUUID(),
                    filename: file.name,
                    uploadTime: new Date().toISOString(),
                    size: formatBytes(file.size),
                    lines,
                    status: 'pending',
                    file, // keep File ref so Analyst can POST it
                };
                addPendingLog(pending);

                setIsUploading(false);
            }, 1200);
        };
        reader.readAsText(file);
    }, [addPendingLog]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-6 p-8 overflow-auto scrollbar-hide">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-white mb-1">Data Ingestion</h1>
                <p className="text-sm text-slate-500">Upload server log files — they will appear in the Security Analyst's queue automatically.</p>
            </motion.div>

            {/* Drop zone */}
            <motion.label
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`
                    relative flex flex-col items-center justify-center gap-5 p-14 rounded-2xl border-2 border-dashed cursor-pointer
                    transition-all duration-300
                    ${isDragging
                        ? 'border-lavender bg-lavender/10 scale-[1.01]'
                        : 'border-white/15 bg-white/3 hover:border-lavender/40 hover:bg-lavender/5'
                    }
                `}
            >
                <input type="file" accept=".log,.txt,.csv" className="sr-only" onChange={onFileChange} />
                <motion.div
                    animate={{ scale: isDragging ? 1.12 : 1 }}
                    className="w-20 h-20 rounded-2xl bg-lavender/10 border border-lavender/20 flex items-center justify-center"
                >
                    {isUploading
                        ? <motion.div
                            className="w-8 h-8 rounded-full border-2 border-lavender border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        : <UploadCloud className="w-9 h-9 text-lavender" />
                    }
                </motion.div>
                <div className="text-center">
                    <p className="text-base font-semibold text-white mb-1">
                        {isUploading ? 'Processing file…' : isDragging ? 'Release to upload' : 'Drag & drop log file here'}
                    </p>
                    <p className="text-sm text-slate-500">or click to browse · Supports .log, .txt, .csv</p>
                </div>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-2xl border-2 border-lavender pointer-events-none"
                    />
                )}
            </motion.label>

            {/* Handshake notice */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald/8 border border-emerald/20 text-xs text-emerald"
            >
                <Inbox className="w-4 h-4 shrink-0" />
                Uploaded files are forwarded to the <strong>Security Analyst's queue</strong> automatically. No action required after upload.
            </motion.div>

            {/* Upload history */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Session Upload History
                </h2>
                <div className="space-y-2">
                    <AnimatePresence initial={false}>
                        {history.map((rec) => (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-4 rounded-xl glass-panel"
                            >
                                <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{rec.name}</p>
                                    <p className="text-xs text-slate-500">{rec.lines.toLocaleString()} lines · {rec.size}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-emerald/15 text-emerald px-2 py-0.5 rounded-full font-semibold">Forwarded to Analyst</span>
                                    <span className="text-xs text-slate-500 font-mono shrink-0">{rec.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
