import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
    message?: string
    fullScreen?: boolean
    className?: string
}

export function LoadingScreen({
    message = "Loading...",
    fullScreen = true,
    className
}: LoadingScreenProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm",
                fullScreen && "fixed inset-0 z-50",
                !fullScreen && "h-full w-full",
                className
            )}
        >
            <Spinner className="size-12 text-primary" />
            {message && (
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}
