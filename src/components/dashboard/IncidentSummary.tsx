import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { AlertCircle, AlertTriangle } from "lucide-react"

export function IncidentSummary() {
    const incidents = [
        {
            id: 1,
            title: "Multiple failed login attempts detected",
            source: "IP 192.168.1.105",
            time: "10 mins ago",
            severity: "high",
        },
        {
            id: 2,
            title: "Unusual request spike on login endpoint",
            source: "/api/auth/login",
            time: "45 mins ago",
            severity: "medium",
        },
        {
            id: 3,
            title: "SQL Injection attempt blocked",
            source: "IP 10.0.0.42",
            time: "2 hours ago",
            severity: "high",
        },
    ]

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Incident Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {incidents.map((incident) => (
                        <div key={incident.id} className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                            <div className={`mt-0.5 p-1.5 rounded-full ${incident.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <p className="text-sm font-medium leading-none">{incident.title}</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>{incident.source}</span>
                                    <span>{incident.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
