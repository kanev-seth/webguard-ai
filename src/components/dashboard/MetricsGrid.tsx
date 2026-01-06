import { Card, CardContent } from "../ui/Card"
import { Activity, ShieldAlert, Globe, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "../../lib/utils"

export function MetricsGrid() {
    const metrics = [
        {
            label: "Total Requests",
            value: "84,392",
            icon: Globe,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Suspicious",
            value: "142",
            icon: ShieldAlert,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            label: "Blocked IPs",
            value: "28",
            icon: AlertTriangle,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
        {
            label: "Alerts Generated",
            value: "12",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            label: "System Status",
            value: "Normal",
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className={cn("p-3 rounded-full", metric.bg, metric.color)}>
                            <metric.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
                            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                                {metric.label}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
