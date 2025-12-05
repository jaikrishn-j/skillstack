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
import { Input } from "@/components/ui/input"
import { FieldLabel } from "@/components/ui/field"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Resource, ResourceType, ResourcePlatform, ResourceUpdate } from "@/types/resource"
import {
    getResource,
    updateResource,
    getAllResourceTypes,
    getAllResourcePlatforms,
    createResourceType,
    createResourcePlatform,
} from "@/utils/resourceApi"
import { Textarea } from "@/components/ui/textarea"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { StarRating } from "@/components/ui/star-rating"

const ResourceEditPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [resource, setResource] = useState<Resource | null>(null)
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([])
    const [resourcePlatforms, setResourcePlatforms] = useState<ResourcePlatform[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState<ResourceUpdate>({
        name: "",
        resourceTypeId: undefined,
        resourcePlatformId: undefined,
        description: "",
        notes: "",
        rating: undefined,
        progress_status: "not_started",
        estimated_hours: undefined,
        hours_spent: undefined,
    })

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        if (!id) return

        try {
            const [resourceData, types, platforms] = await Promise.all([
                getResource(parseInt(id)),
                getAllResourceTypes(),
                getAllResourcePlatforms(),
            ])

            setResource(resourceData)
            setResourceTypes(types)
            setResourcePlatforms(platforms)

            // Populate form with existing data
            setFormData({
                name: resourceData.name,
                resourceTypeId: resourceData.resource_type_id,
                resourcePlatformId: resourceData.resource_platform_id,
                description: resourceData.description || "",
                notes: resourceData.notes || "",
                rating: resourceData.rating,
                progress_status: resourceData.progress_status || "not_started",
                estimated_hours: resourceData.estimated_hours,
                hours_spent: resourceData.hours_spent,
            })
        } catch (error) {
            console.error("Error fetching resource:", error)
            navigate("/resources")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateType = async (name: string) => {
        try {
            const newType = await createResourceType(name)
            setResourceTypes([...resourceTypes, newType])
            setFormData({ ...formData, resourceTypeId: newType.id })
        } catch (error) {
            console.error("Error creating resource type:", error)
        }
    }

    const handleCreatePlatform = async (name: string) => {
        try {
            const newPlatform = await createResourcePlatform(name)
            setResourcePlatforms([...resourcePlatforms, newPlatform])
            setFormData({ ...formData, resourcePlatformId: newPlatform.id })
        } catch (error) {
            console.error("Error creating resource platform:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return

        setIsSaving(true)
        try {
            const payload = {
                name: formData.name,
                resource_type_id: formData.resourceTypeId,
                resource_platform_id: formData.resourcePlatformId,
                description: formData.description,
                notes: formData.notes,
                rating: formData.rating,
                progress_status: formData.progress_status,
                estimated_hours: formData.estimated_hours,
                hours_spent: formData.hours_spent,
            }
            await updateResource(parseInt(id), payload)
            navigate(`/resources/${id}`)
        } catch (error) {
            console.error("Error updating resource:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <LoadingScreen message="Loading resource..." />
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
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/resources/${id}`)}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Resource
                    </Button>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Edit Resource
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Update resource information
                    </p>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Update general details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <FieldLabel htmlFor="name">Resource Name *</FieldLabel>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Resource name"
                                        required
                                    />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="type">Resource Type</FieldLabel>
                                    <CreatableSelect
                                        options={resourceTypes}
                                        value={formData.resourceTypeId}
                                        onChange={(value) => setFormData({ ...formData, resourceTypeId: value })}
                                        onCreate={handleCreateType}
                                        placeholder="Select or create type..."
                                    />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="platform">Resource Platform</FieldLabel>
                                    <CreatableSelect
                                        options={resourcePlatforms}
                                        value={formData.resourcePlatformId}
                                        onChange={(value) => setFormData({ ...formData, resourcePlatformId: value })}
                                        onCreate={handleCreatePlatform}
                                        placeholder="Select or create platform..."
                                    />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="rating">Rating</FieldLabel>
                                    <div className="pt-1">
                                        <StarRating
                                            rating={formData.rating}
                                            onRatingChange={(rating) => setFormData({ ...formData, rating })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <FieldLabel htmlFor="progress_status">Progress Status</FieldLabel>
                                    <Select
                                        value={formData.progress_status}
                                        onValueChange={(value) => setFormData({ ...formData, progress_status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="not_started">Not Started</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <FieldLabel htmlFor="estimated_hours">Estimated Hours</FieldLabel>
                                        <Input
                                            id="estimated_hours"
                                            type="number"
                                            value={formData.estimated_hours || ''}
                                            onChange={(e) => setFormData({ ...formData, estimated_hours: parseInt(e.target.value) || undefined })}
                                            placeholder="e.g., 40"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="hours_spent">Hours Spent</FieldLabel>
                                        <Input
                                            id="hours_spent"
                                            type="number"
                                            value={formData.hours_spent || ''}
                                            onChange={(e) => setFormData({ ...formData, hours_spent: parseInt(e.target.value) || undefined })}
                                            placeholder="e.g., 10"
                                        />
                                    </div>
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
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the resource"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <FieldLabel htmlFor="notes">Notes</FieldLabel>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Personal notes about this resource"
                                        rows={6}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/resources/${id}`)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || !formData.name}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResourceEditPage
