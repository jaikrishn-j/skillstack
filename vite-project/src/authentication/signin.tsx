import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { API_ENDPOINTS } from "@/config/api"
import { checkAuth, saveTokens } from "@/utils/auth"
import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"



const Signin = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    // Check if user is already authenticated
    useEffect(() => {
        const verifyAuth = async () => {
            const authenticated = await checkAuth()
            if (authenticated) {
                navigate("/home", { replace: true })
            } else {
                setIsLoading(false)
            }
        }

        verifyAuth()
    }, [navigate])

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setIsSigningIn(true)

        try {
            const response = await axios.post(API_ENDPOINTS.auth.signin, {
                email,
                password,
            })

            // Store tokens using utility
            saveTokens(response.data.access_token, response.data.refresh_token)

            // Navigate to home or dashboard
            navigate("/home")
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                "Failed to sign in. Please check your credentials."
            )
        } finally {
            setIsSigningIn(false)
        }
    }

    if (isLoading) {
        return <LoadingScreen message="Checking authentication..." />
    }

    if (isSigningIn) {
        return <LoadingScreen message="Signing in..." />
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignin}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </Field>

                                    <Field>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </Field>

                                    {error && (
                                        <div className="text-sm text-destructive text-center">
                                            {error}
                                        </div>
                                    )}

                                    <Field>
                                        <Button type="submit" disabled={isLoading}>
                                            Sign In
                                        </Button>

                                        <FieldDescription className="text-center">
                                            Dont have an account? <a href="/signup">Sign up</a>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Signin