
export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    source: string;
    message: string;
    hash: string;
}

export interface Anomaly {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
}

export interface Report {
    id: string;
    title: string;
    analyst: string;
    date: string;
    status: 'pending' | 'resolved' | 'archived';
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export const MOCK_LOGS: LogEntry[] = [
    { id: '1', timestamp: '2024-03-10 14:23:01', level: 'INFO', source: 'AuthService', message: 'User login successful: admin_user', hash: 'e4d909c290d0fb1ca068ffaddf22cbd0' },
    { id: '2', timestamp: '2024-03-10 14:24:12', level: 'WARN', source: 'Firewall', message: 'Port scan detected from 192.168.1.105', hash: '88d6d6e033f920256860032b8429712a' },
    { id: '3', timestamp: '2024-03-10 14:25:45', level: 'ERROR', source: 'Database', message: 'Connection timeout: DB_SHARD_04', hash: '6594229415844857b27521199320146f' },
    { id: '4', timestamp: '2024-03-10 14:26:30', level: 'INFO', source: 'API Gateway', message: 'Rate limit threshold approaching (85%)', hash: 'b6d36e25547038e2142277836858546f' },
    { id: '5', timestamp: '2024-03-10 14:28:11', level: 'WARN', source: 'AuthService', message: 'Multiple failed login attempts: user_test', hash: '7c8d9d0e1f2a3b4c5d6e7f8a9b0c1d2e' },
    { id: '6', timestamp: '2024-03-10 14:30:05', level: 'INFO', source: 'System', message: 'Scheduled backup completed successfully', hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' },
    { id: '7', timestamp: '2024-03-10 14:31:22', level: 'ERROR', source: 'Payment', message: 'Transaction failure: ID-99821 (Gateway Timeout)', hash: 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6' },
    { id: '8', timestamp: '2024-03-10 14:33:45', level: 'INFO', source: 'LoadBalancer', message: 'Traffic routed to Region-US-East', hash: 'z1x2c3v4b5n6m7l8k9j0h1g2f3d4s5a6' },
    { id: '9', timestamp: '2024-03-10 14:35:10', level: 'WARN', source: 'IDS', message: 'Signature match: SQL Injection attempt', hash: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p' },
    { id: '10', timestamp: '2024-03-10 14:36:55', level: 'INFO', source: 'Audit', message: 'Config change detected: allow_ssh = false', hash: '7q8w9e0r1t2y3u4i5o6p7a8s9d0f1g2h' },
];

export const MOCK_ANOMALIES: Anomaly[] = [
    { id: 'a1', type: 'SQL Injection', severity: 'critical', confidence: 0.98, description: 'Detected UNION SELECT in query parameters.' },
    { id: 'a2', type: 'DDoS Attempt', severity: 'high', confidence: 0.85, description: 'Traffic spike > 5000 req/sec from single subnet.' },
    { id: 'a3', type: 'Privilege Escalation', severity: 'medium', confidence: 0.72, description: 'User modifying protected role attributes.' },
];

export const MOCK_REPORTS: Report[] = [
    { id: 'r1', title: 'Unauthorized Access Attempt - Finance DB', analyst: 'J. Doe', date: '2024-02-28', status: 'resolved', severity: 'high' },
    { id: 'r2', title: 'API Latency Spike', analyst: 'A. Smith', date: '2024-03-01', status: 'archived', severity: 'low' },
    { id: 'r3', title: 'Suspicious Outbound Traffic', analyst: 'K. Lee', date: '2024-03-05', status: 'pending', severity: 'critical' },
    { id: 'r4', title: 'SSL Certificate Expiry Warning', analyst: 'System', date: '2024-03-08', status: 'pending', severity: 'medium' },
    { id: 'r5', title: 'Datacenter Temperature Alert', analyst: 'Ops Team', date: '2024-03-09', status: 'resolved', severity: 'high' },
];
