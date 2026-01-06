import { Button } from "../ui/Button"
import { FileDown } from "lucide-react"

export function ReportExport() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-semibold">Export Analysis Report</h4>
                <p className="text-sm text-muted-foreground">Download the full security analysis report in your preferred format.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    PDF
                </Button>
                <Button variant="outline" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    DOCX
                </Button>
            </div>
        </div>
    )
}
