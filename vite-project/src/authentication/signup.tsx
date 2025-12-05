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
import { checkAuth } from "@/utils/auth"
import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

type Props = {}

const Signup = (props: Props) => {
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    // Check if user is already authenticated
    useEffect(() => {
        const verifyAuth = async () => {
            const authenticated = await checkAuth()
            if (authenticated) {
                navigate("/home", { replace: true })
            } else {
                setIsCheckingAuth(false)
            }
        }

        verifyAuth()
    }, [navigate])

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await axios.post(API_ENDPOINTS.auth.signup, {
                name,
                email,
                password,
            })

            setSuccess(true)
            // Redirect to signin after 2 seconds
            setTimeout(() => {
                navigate("/signin")
            }, 2000)
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                "Failed to create account. Please try again."
            )
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingAuth) {
        return <LoadingScreen message="Checking authentication..." />
    }

    if (isLoading) {
        return <LoadingScreen message="Creating your account..." />
    }

    if (success) {
        return <LoadingScreen message="Account created! Redirecting to signin..." />
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>
                                Enter your information to create an account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignup}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="name">Name</FieldLabel>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </Field>

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
                                            minLength={6}
                                        />
                                        <FieldDescription className="text-xs text-muted-foreground">
                                            Must be at least 6 characters
                                        </FieldDescription>
                                    </Field>

                                    {error && (
                                        <div className="text-sm text-destructive text-center">
                                            {error}
                                        </div>
                                    )}

                                    <Field>
                                        <Button type="submit" disabled={isLoading}>
                                            Sign Up
                                        </Button>

                                        <FieldDescription className="text-center">
                                            Already have an account? <a href="/signin">Sign in</a>
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

export default Signup