import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { checkAuth } from "@/utils/auth"

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const verifyAuth = async () => {
            const authenticated = await checkAuth()
            setIsAuthenticated(authenticated)
            setIsLoading(false)
        }

        verifyAuth()
    }, [])

    if (isLoading) {
        return <LoadingScreen message="Verifying authentication..." />
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />
    }

    return <>{children}</>
}
