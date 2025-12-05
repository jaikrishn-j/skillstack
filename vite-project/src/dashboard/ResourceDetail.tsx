import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ArrowLeft, Pencil, Trash2, Sparkles, Target, Tags } from "lucide-react"
import type { Resource, ResourceType, ResourcePlatform } from "@/types/resource"
import {
    getResource,
    deleteResource,
    getAllResourceTypes,
    getAllResourcePlatforms,
} from "@/utils/resourceApi"
import {
    summarizeNotes,
    predictMastery,
    categorizeResource,
    type NoteSummary,
    type MasteryPrediction,
    type ResourceCategorization,
} from "@/utils/aiApi"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ResourceDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [resource, setResource] = useState<Resource | null>(null)
    const [resourceType, setResourceType] = useState<ResourceType | null>(null)
    const [resourcePlatform, setResourcePlatform] = useState<ResourcePlatform | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)

    // AI features state
    const [aiSummary, setAiSummary] = useState<NoteSummary | null>(null)
    const [aiPrediction, setAiPrediction] = useState<MasteryPrediction | null>(null)
    const [aiCategorization, setAiCategorization] = useState<ResourceCategorization | null>(null)
    const [isProcessingAI, setIsProcessingAI] = useState<string | null>(null)

    useEffect(() => {
        fetchResourceData()
    }, [id])

    const fetchResourceData = async () => {
        if (!id) return

        try {
            const [resourceData, types, platforms] = await Promise.all([
                getResource(parseInt(id)),
                getAllResourceTypes(),
                getAllResourcePlatforms(),
            ])

            setResource(resourceData)

            if (resourceData.resource_type_id) {
                const type = types.find((t) => t.id === resourceData.resource_type_id)
                setResourceType(type || null)
            }

            if (resourceData.resource_platform_id) {
                const platform = platforms.find((p) => p.id === resourceData.resource_platform_id)
                setResourcePlatform(platform || null)
            }
        } catch (error) {
            console.error("Error fetching resource:", error)
            navigate("/resources")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!id) return

        setIsDeleting(true)
        try {
            await deleteResource(parseInt(id))
            navigate("/resources")
        } catch (error) {
            console.error("Error deleting resource:", error)
            setIsDeleting(false)
        }
    }

    const handleSummarizeNotes = async () => {
        if (!id) return
        setIsProcessingAI("summary")
        try {
            console.log('📝 Starting note summarization...')
            const summary = await summarizeNotes(parseInt(id), true)
            setAiSummary(summary)
            // Refresh resource to get updated AI data
            await fetchResourceData()
            console.log('✅ Summarization complete!')
        } catch (error: any) {
            console.error("Error summarizing notes:", error)
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to summarize notes'
            alert(`❌ Error: ${errorMessage}`)
        } finally {
            setIsProcessingAI(null)
        }
    }

    const handlePredictMastery = async () => {
        if (!id) return
        setIsProcessingAI("prediction")
        try {
            console.log('🎯 Starting mastery prediction...')
            const prediction = await predictMastery(parseInt(id), true)
            setAiPrediction(prediction)
            // Refresh resource to get updated AI data
            await fetchResourceData()
            console.log('✅ Prediction complete!')
        } catch (error: any) {
            console.error("Error predicting mastery:", error)
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to predict mastery'
            alert(`❌ Error: ${errorMessage}`)
        } finally {
            setIsProcessingAI(null)
        }
    }

    const handleCategorize = async () => {
        if (!id) return
        setIsProcessingAI("categorization")
        try {
            console.log('🏷️ Starting auto-categorization...')
            const categorization = await categorizeResource(parseInt(id), true)
            setAiCategorization(categorization)
            // Refresh resource to get updated AI data
            await fetchResourceData()
            console.log('✅ Categorization complete!')
        } catch (error: any) {
            console.error("Error categorizing resource:", error)
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to categorize resource'
            alert(`❌ Error: ${errorMessage}`)
        } finally {
            setIsProcessingAI(null)
        }
    }

    const getProgressBadge = (status?: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-500 hover:bg-green-600">✓ Completed</Badge>
            case "in_progress":
                return <Badge className="bg-blue-500 hover:bg-blue-600">→ In Progress</Badge>
            case "not_started":
            default:
                return <Badge variant="secondary">○ Not Started</Badge>
        }
    }

    if (isLoading) {
        return <LoadingScreen message="Loading resource details..." />
    }

    if (!resource) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="p-6">
                        <p>Resource not found</p>
                        <Button onClick={() => navigate("/resources")} className="mt-4">
                            Back to Resources
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/resources")}
                            className="mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Resources
                        </Button>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            {resource.name}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => navigate(`/resources/${id}/edit`)}
                            variant="outline"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this
                                        resource.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Resource Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>General details about this resource</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Resource Name
                                </label>
                                <p className="text-lg font-semibold mt-1">{resource.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Resource Type
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {resourceType?.name || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Platform
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {resourcePlatform?.name || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Rating
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {resource.rating ? `⭐ ${resource.rating}/5` : "Not rated"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description & Notes</CardTitle>
                            <CardDescription>Additional information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Description
                                </label>
                                <p className="text-base mt-1">
                                    {resource.description || "No description provided"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Notes
                                </label>
                                <p className="text-base mt-1 whitespace-pre-wrap">
                                    {resource.notes || "No notes added"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Section */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Learning Progress</CardTitle>
                        <CardDescription>Track your progress on this resource</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-2">{getProgressBadge(resource.progress_status)}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Estimated Hours</label>
                                <p className="text-2xl font-bold mt-1">{resource.estimated_hours || "—"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Hours Spent</label>
                                <p className="text-2xl font-bold mt-1">{resource.hours_spent || 0}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Progress</label>
                                <p className="text-2xl font-bold mt-1">
                                    {resource.estimated_hours && resource.hours_spent
                                        ? `${Math.min(Math.round((resource.hours_spent / resource.estimated_hours) * 100), 100)}%`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Features */}
                <div className="grid gap-6 md:grid-cols-2 mt-6">
                    {/* AI Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                AI Summary & Insights
                            </CardTitle>
                            <CardDescription>Generate intelligent summary from your notes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handleSummarizeNotes}
                                disabled={isProcessingAI === "summary" || !resource.notes}
                                className="w-full"
                            >
                                {isProcessingAI === "summary" ? "Processing..." : "Summarize Notes"}
                            </Button>

                            {(resource.ai_summary || aiSummary) && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Summary</label>
                                        <p className="text-sm mt-1">{resource.ai_summary || aiSummary?.summary}</p>
                                    </div>
                                    {aiSummary?.key_concepts && aiSummary.key_concepts.length > 0 && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Key Concepts</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {aiSummary.key_concepts.map((concept, i) => (
                                                    <Badge key={i} variant="secondary">{concept}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mastery Prediction */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                Mastery Prediction
                            </CardTitle>
                            <CardDescription>AI-powered completion date forecast</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handlePredictMastery}
                                disabled={isProcessingAI === "prediction"}
                                className="w-full"
                            >
                                {isProcessingAI === "prediction" ? "Predicting..." : "Predict Completion"}
                            </Button>

                            {(resource.ai_mastery_date || aiPrediction) && (
                                <div className="space-y-3">
                                    {aiPrediction && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Predicted Date</label>
                                                <p className="text-lg font-bold mt-1">{aiPrediction.predicted_date}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Days Remaining</label>
                                                <p className="text-2xl font-bold text-blue-600 mt-1">{aiPrediction.days_remaining}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Recommendation</label>
                                                <p className="text-sm mt-1">{aiPrediction.recommendation}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Auto-Categorization */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tags className="h-5 w-5 text-green-500" />
                                AI Categorization & Tagging
                            </CardTitle>
                            <CardDescription>Automatic skill categorization and tagging</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handleCategorize}
                                disabled={isProcessingAI === "categorization"}
                                className="w-full md:w-auto"
                            >
                                {isProcessingAI === "categorization" ? "Analyzing..." : "Auto-Categorize"}
                            </Button>

                            {(resource.ai_category || aiCategorization) && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Category</label>
                                        <p className="text-lg font-bold mt-1">
                                            {resource.ai_category || aiCategorization?.category}
                                        </p>
                                    </div>
                                    {aiCategorization && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                                                <p className="text-lg font-bold mt-1">{aiCategorization.subcategory}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Difficulty Level</label>
                                                <Badge className="mt-2">{aiCategorization.difficulty_level}</Badge>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Skill Tags</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {aiCategorization.skill_tags.map((tag, i) => (
                                                        <Badge key={i} variant="outline">{tag}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {resource.ai_tags && !aiCategorization && (
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-muted-foreground">Tags</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {resource.ai_tags.split(", ").map((tag, i) => (
                                                    <Badge key={i} variant="outline">{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ResourceDetailPage
