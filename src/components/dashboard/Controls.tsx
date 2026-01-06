import { Button } from "../ui/Button"
import { Play } from "lucide-react"

interface ControlsProps {
    onAnalyze: () => void
    disabled?: boolean
}

export function Controls({ onAnalyze, disabled }: ControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Log Duration</label>
                    <select className="h-9 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Log Type</label>
                    <select className="h-9 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>Web Access Logs</option>
                        <option>Authentication Logs</option>
                        <option>Mixed Traffic</option>
                    </select>
                </div>
            </div>

            <Button
                onClick={onAnalyze}
                disabled={disabled}
                className="w-full sm:w-auto gap-2 min-w-[140px]"
            >
                <Play className="h-4 w-4" />
                Analyze Logs
            </Button>
        </div>
    )
}
