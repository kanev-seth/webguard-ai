import { Shield, User, LogOut } from "lucide-react"
import { Button } from "../ui/Button"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
    username?: string
}

export function Header({ username = "Admin Observer" }: HeaderProps) {
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate("/login")
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Shield className="h-6 w-6" />
                    <span>WebGuard AI</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/50">
                    <User className="h-4 w-4" />
                    <span>Hi, {username}</span>
                </div>

                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </header>
    )
}
