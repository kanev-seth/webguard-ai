import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Lightbulb, ArrowRight } from "lucide-react"

export function Recommendations() {
    const recommendations = [
        {
            id: 1,
            text: "Enable rate limiting on authentication endpoints",
            priority: "High",
        },
        {
            id: 2,
            text: "Temporarily block IP range 192.168.x.x due to high failure rate",
            priority: "Medium",
        },
        {
            id: 3,
            text: "Review access logs for user 'admin' in the last hour",
            priority: "Low",
        },
    ]

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-all cursor-pointer">
                            <span className="text-sm font-medium">{rec.text}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
