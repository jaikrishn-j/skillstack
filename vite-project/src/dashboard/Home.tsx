import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { getUserData, logout as authLogout } from "@/utils/auth"
import { getAllResources, getAllResourceTypes, getAllResourcePlatforms, getResourceStats, type ResourceStats } from "@/utils/resourceApi"
import { BookOpen, FolderKanban, Globe, Clock, CheckCircle2, Circle } from "lucide-react"

interface UserData {
    name: string
    email: string
}

const Home = () => {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [resourceCount, setResourceCount] = useState(0)
    const [typeCount, setTypeCount] = useState(0)
    const [platformCount, setPlatformCount] = useState(0)
    const [stats, setStats] = useState<ResourceStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [user, resources, types, platforms, statsData] = await Promise.all([
                    getUserData(),
                    getAllResources(),
                    getAllResourceTypes(),
                    getAllResourcePlatforms(),
                    getResourceStats(),
                ])

                if (user) {
                    setUserData(user)
                    setResourceCount(resources.length)
                    setTypeCount(types.length)
                    setPlatformCount(platforms.length)
                    setStats(statsData)
                } else {
                    navigate("/signin")
                }
            } catch (err: any) {
                setError("Failed to load dashboard data")
                console.error("Error fetching data:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    const handleLogout = async () => {
        await authLogout()
        navigate("/signin")
    }

    if (isLoading) {
        return <LoadingScreen message="Loading your dashboard..." />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back, {userData?.name || "User"}!
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
                        {error}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/resources")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                View All Resources
                            </CardTitle>
                            <CardDescription>Manage your learning materials</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/settings/types")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderKanban className="h-5 w-5 text-primary" />
                                Resource Types
                            </CardTitle>
                            <CardDescription>Manage categories</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/settings/platforms")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                Platforms
                            </CardTitle>
                            <CardDescription>Manage learning platforms</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Learning Progress Section */}
                {stats && (
                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                        <Card className="border-2 hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Overall Progress
                                </CardTitle>
                                <CardDescription>Your learning journey completion</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Completion Rate</span>
                                            <span className="text-sm font-bold text-primary">{Math.round(stats.completion_rate)}%</span>
                                        </div>
                                        <Progress value={stats.completion_rate} className="h-3" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-2">
                                        <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <Circle className="h-4 w-4 text-slate-400 mb-2" />
                                            <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.not_started_resources}</div>
                                            <div className="text-xs font-medium text-muted-foreground">To Do</div>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                            <Clock className="h-4 w-4 text-blue-500 mb-2" />
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.in_progress_resources}</div>
                                            <div className="text-xs font-medium text-muted-foreground">In Progress</div>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mb-2" />
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed_resources}</div>
                                            <div className="text-xs font-medium text-muted-foreground">Completed</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Time Investment
                                </CardTitle>
                                <CardDescription>Hours spent vs estimated</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Hours Tracked</span>
                                            <span className="text-sm font-bold text-primary">{stats.total_hours_spent} / {stats.total_estimated_hours} hrs</span>
                                        </div>
                                        <Progress value={Math.min((stats.total_hours_spent / (stats.total_estimated_hours || 1)) * 100, 100)} className="h-3" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="text-sm text-muted-foreground mb-1">Total Estimated</div>
                                            <div className="text-2xl font-bold">{stats.total_estimated_hours}h</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="text-sm text-muted-foreground mb-1">Actual Spent</div>
                                            <div className="text-2xl font-bold text-primary">{stats.total_hours_spent}h</div>
                                        </div>
                                    </div>

                                    <p className="text-xs text-center text-muted-foreground">
                                        {stats.total_estimated_hours > 0
                                            ? `You've completed ${Math.round((stats.total_hours_spent / stats.total_estimated_hours) * 100)}% of your estimated learning time.`
                                            : "Add estimated hours to your resources to track time progress."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* User Info Card */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Name
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {userData?.name || "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Email
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {userData?.email || "N/A"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Cards */}
                    <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Learning Resources</CardTitle>
                            <CardDescription>Your saved content</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{resourceCount}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Resource{resourceCount !== 1 ? "s" : ""} saved
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Resource Types</CardTitle>
                            <CardDescription>Categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{typeCount}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Type{typeCount !== 1 ? "s" : ""} created
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Platforms</CardTitle>
                            <CardDescription>Learning platforms</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{platformCount}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Platform{platformCount !== 1 ? "s" : ""} added
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Home
