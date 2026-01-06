import { Upload, FileText } from "lucide-react"
import { Card } from "../ui/Card"
import { cn } from "../../lib/utils"
import { useState } from "react"

interface LogUploadProps {
    onUpload?: () => void
}

export function LogUpload({ onUpload }: LogUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [hasFile, setHasFile] = useState(false)

    // Mock handle drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        setHasFile(true)
        if (onUpload) onUpload()
    }

    return (
        <Card
            className={cn(
                "border-2 border-dashed p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center cursor-pointer min-h-[200px]",
                isDragOver ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                hasFile ? "bg-emerald-500/5 border-emerald-500/50" : ""
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => { setHasFile(true); if (onUpload) onUpload() }}
        >
            <div className={cn(
                "p-4 rounded-full transition-colors",
                hasFile ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
            )}>
                {hasFile ? <FileText className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">
                    {hasFile ? "Log File Uploaded" : "Drag & drop raw log files here"}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {hasFile ? "example_access.log (2.4 MB)" : "Supported formats: .log .txt .csv .json"}
                </p>
            </div>
        </Card>
    )
}
