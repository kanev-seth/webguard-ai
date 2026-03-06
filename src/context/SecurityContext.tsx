import { createContext, useContext, useState, type ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface AnalystRow {
    ip: string;
    timestamp: string;
    method: string;
    url: string;
    status: number;
    bytes: number;
    is_anomaly: boolean;
    anomaly_score: number;
    reasons: string[];
}

export interface PendingLog {
    id: string;
    filename: string;
    uploadTime: string;
    size: string;
    lines: number;
    status: 'pending' | 'analyzing' | 'done';
    // raw file blob stored so Analyst can re-POST it
    file?: File;
}

export interface Escalation {
    id: string;
    threat: AnalystRow;
    analystComment: string;
    analystName: string;
    submittedAt: string;
    status: 'pending' | 'resolved';
}

export interface AuditEntry {
    id: string;
    escalationId: string;
    ip: string;
    action: string;
    resolvedAt: string;
    resolvedBy: string;
}

interface SecurityContextType {
    // Contributor → Analyst queue
    pendingLogs: PendingLog[];
    addPendingLog:    (log: PendingLog) => void;
    setPendingLogStatus: (id: string, status: PendingLog['status']) => void;
    removePendingLog: (id: string) => void;

    // Analyst → Manager escalation queue
    escalations: Escalation[];
    auditTrail:  AuditEntry[];
    addEscalation:    (threat: AnalystRow, comment: string, analystName: string) => void;
    resolveEscalation:(escalationId: string, action: string, managerName: string)  => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_PENDING: PendingLog[] = [
    {
        id: 'plog-001',
        filename: 'access_2026-03-07.log',
        uploadTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        size: '3.1 MB',
        lines: 24108,
        status: 'pending',
    },
    {
        id: 'plog-002',
        filename: 'nginx_combined.log',
        uploadTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        size: '890 KB',
        lines: 7342,
        status: 'pending',
    },
];

const SEED_ESCALATIONS: Escalation[] = [
    {
        id: 'seed-001',
        threat: {
            ip: '45.33.32.156',
            timestamp: '07/Mar/2026:00:12:44 +0000',
            method: 'GET',
            url: '/etc/passwd',
            status: 403,
            bytes: 287,
            is_anomaly: true,
            anomaly_score: -0.312,
            reasons: ["URL contains suspicious keyword: '/etc/passwd'", 'HTTP 403 response'],
        },
        analystComment: 'Classic path traversal probe. Recommend immediate IP block at edge firewall.',
        analystName: 'Analyst',
        submittedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        status: 'pending',
    },
    {
        id: 'seed-002',
        threat: {
            ip: '198.51.100.73',
            timestamp: '07/Mar/2026:00:08:11 +0000',
            method: 'POST',
            url: '/wp-login.php',
            status: 200,
            bytes: 14320,
            is_anomaly: true,
            anomaly_score: -0.248,
            reasons: ['Non-browser traffic at 00:xx (night-time script activity)', 'User-agent looks like a script/tool'],
        },
        analystComment: 'Automated WordPress credential stuffing attempt. Rate-limit this endpoint.',
        analystName: 'Analyst',
        submittedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        status: 'pending',
    },
];

const SEED_AUDIT: AuditEntry[] = [
    {
        id: 'audit-000',
        escalationId: 'hist-001',
        ip: '103.21.244.0',
        action: 'Block IP at Edge Firewall',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        resolvedBy: 'Manager',
    },
];

// ─── Provider ────────────────────────────────────────────────────────────────
export function SecurityProvider({ children }: { children: ReactNode }) {
    const [pendingLogs,   setPendingLogs]   = useState<PendingLog[]>(SEED_PENDING);
    const [escalations,   setEscalations]   = useState<Escalation[]>(SEED_ESCALATIONS);
    const [auditTrail,    setAuditTrail]    = useState<AuditEntry[]>(SEED_AUDIT);

    // ── Pending log helpers ──────────────────────────────────────────────────
    const addPendingLog = (log: PendingLog) =>
        setPendingLogs((prev) => [log, ...prev]);

    const setPendingLogStatus = (id: string, status: PendingLog['status']) =>
        setPendingLogs((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));

    const removePendingLog = (id: string) =>
        setPendingLogs((prev) => prev.filter((l) => l.id !== id));

    // ── Escalation helpers ───────────────────────────────────────────────────
    const addEscalation = (threat: AnalystRow, comment: string, analystName: string) => {
        setEscalations((prev) => [
            {
                id: crypto.randomUUID(),
                threat,
                analystComment: comment,
                analystName,
                submittedAt: new Date().toISOString(),
                status: 'pending',
            },
            ...prev,
        ]);
    };

    const resolveEscalation = (escalationId: string, action: string, managerName: string) => {
        const target = escalations.find((e) => e.id === escalationId);
        setEscalations((prev) =>
            prev.map((e) => e.id === escalationId ? { ...e, status: 'resolved' } : e)
        );
        setAuditTrail((prev) => [
            {
                id: crypto.randomUUID(),
                escalationId,
                ip: target?.threat.ip ?? '—',
                action,
                resolvedAt: new Date().toISOString(),
                resolvedBy: managerName,
            },
            ...prev,
        ]);
    };

    return (
        <SecurityContext.Provider value={{
            pendingLogs, addPendingLog, setPendingLogStatus, removePendingLog,
            escalations, auditTrail, addEscalation, resolveEscalation,
        }}>
            {children}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const ctx = useContext(SecurityContext);
    if (!ctx) throw new Error('useSecurity must be used inside <SecurityProvider>');
    return ctx;
}
