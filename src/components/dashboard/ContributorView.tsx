import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function ContributorView() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [history, setHistory] = useState<Array<{ id: string; name: string; status: 'success' | 'error' }>>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            simulateUpload(files[0]);
        }
    };

    const simulateUpload = (file: File) => {
        setUploadStatus('uploading');

        // Cinematic delay for "Encryption & Upload"
        setTimeout(() => {
            const isSuccess = Math.random() > 0.1; // 90% success rate
            setUploadStatus(isSuccess ? 'success' : 'error');

            setHistory(prev => [{
                id: crypto.randomUUID(),
                name: file.name,
                status: isSuccess ? 'success' : 'error'
            }, ...prev]);

            // Reset after showing result
            setTimeout(() => setUploadStatus('idle'), 2000);
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl"
            >
                {/* Upload Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative h-96 rounded-3xl border-2 border-dashed transition-all duration-500 ease-out flex flex-col items-center justify-center overflow-hidden
                        ${isDragging
                            ? 'border-terracotta bg-terracotta/5 scale-102 shadow-[0_0_50px_rgba(226,114,91,0.2)]'
                            : 'border-white/10 bg-white/5 hover:border-lavender/30 hover:bg-white/10'
                        }
                    `}
                >
                    <AnimatePresence mode="wait">
                        {uploadStatus === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center p-8"
                            >
                                <div className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 ${isDragging ? 'animate-bounce text-terracotta' : 'text-slate-400'}`}>
                                    <Upload className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Secure Log Ingestion</h3>
                                <p className="text-slate-400">Drag & drop encrypted log files (.log, .csv, .txt)</p>
                            </motion.div>
                        )}

                        {uploadStatus === 'uploading' && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 relative mb-6">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-full h-full rounded-full border-4 border-white/10 border-t-lavender"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-lavender animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-mono text-lavender animate-pulse">ENCRYPTING & UPLOADING...</h3>
                            </motion.div>
                        )}

                        {uploadStatus === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Upload Complete</h3>
                                <p className="text-green-400/80">Hash verified successfully.</p>
                            </motion.div>
                        )}

                        {uploadStatus === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="w-10 h-10 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Upload Failed</h3>
                                <p className="text-red-400/80">Corrupted signature detected.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status History */}
                <div className="mt-8">
                    <h4 className="text-sm font-mono text-slate-500 mb-4 uppercase tracking-wider">Session History</h4>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                                >
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300 font-mono">{item.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {item.status === 'success' ? (
                                            <>
                                                <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs text-red-400 font-mono">REJECTED</span>
                                                <XCircle className="w-4 h-4 text-red-400" />
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {history.length === 0 && (
                                <p className="text-center text-slate-600 text-sm py-4">No uploads this session.</p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
