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
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldLabel } from "@/components/ui/field"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Resource, ResourceType, ResourcePlatform, ResourceCreate } from "@/types/resource"
import {
    getAllResources,
    createResource,
    deleteResource,
    getAllResourceTypes,
    getAllResourcePlatforms,
    createResourceType,
    createResourcePlatform,
} from "@/utils/resourceApi"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { StarRating } from "@/components/ui/star-rating"

const ResourcesPage = () => {
    const [resources, setResources] = useState<Resource[]>([])
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([])
    const [resourcePlatforms, setResourcePlatforms] = useState<ResourcePlatform[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState<ResourceCreate>({
        name: "",
        resourceTypeId: undefined,
        resourcePlatformId: undefined,
        description: "",
        notes: "",
        rating: undefined,
        progress_status: "not_started",
        estimated_hours: undefined,
        hours_spent: 0,
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [resourcesData, typesData, platformsData] = await Promise.all([
                getAllResources(),
                getAllResourceTypes(),
                getAllResourcePlatforms(),
            ])
            setResources(resourcesData)
            setResourceTypes(typesData)
            setResourcePlatforms(platformsData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // In your frontend, when creating a resource
    const handleCreateResource = async () => {
        try {
            // Make sure to only send valid IDs or null/undefined
            const payload: ResourceCreate = {
                name: formData.name,
                resourceTypeId: formData.resourceTypeId,
                resourcePlatformId: formData.resourcePlatformId,
                description: formData.description,
                notes: formData.notes,
                rating: formData.rating,
                progress_status: formData.progress_status,
                estimated_hours: formData.estimated_hours,
                hours_spent: formData.hours_spent || 0,
            };

            await createResource(payload);
            setIsDialogOpen(false);
            setFormData({
                name: "",
                resourceTypeId: undefined,
                resourcePlatformId: undefined,
                description: "",
                notes: "",
                rating: undefined,
                progress_status: "not_started",
                estimated_hours: undefined,
                hours_spent: 0,
            });
            fetchData();
        } catch (error) {
            console.error("Error creating resource:", error);
        }
    };

    const handleDeleteResource = async (id: number) => {
        setIsDeleting(id)
        try {
            await deleteResource(id)
            fetchData()
        } catch (error) {
            console.error("Error deleting resource:", error)
        } finally {
            setIsDeleting(null)
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

    const getTypeName = (typeId?: number) => {
        return resourceTypes.find(t => t.id === typeId)?.name || "N/A"
    }

    const getProgressBadge = (status?: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
            case "in_progress":
                return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
            case "not_started":
            default:
                return <Badge variant="secondary">Not Started</Badge>
        }
    }

    const getPlatformName = (platformId?: number) => {
        return resourcePlatforms.find(p => p.id === platformId)?.name || "N/A"
    }

    if (isLoading) {
        return <LoadingScreen message="Loading resources..." />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Learning Resources
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your learning materials
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => navigate("/home")} variant="outline">
                            ← Dashboard
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Resource
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Resource</DialogTitle>
                                    <DialogDescription>
                                        Add a new learning resource to your collection.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <FieldLabel htmlFor="name">Name *</FieldLabel>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Resource name"
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
                                        <FieldLabel htmlFor="description">Description</FieldLabel>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description"
                                            rows={3}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <FieldLabel htmlFor="progress">Progress Status</FieldLabel>
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
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateResource} disabled={!formData.name}>
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Resources Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Resources</CardTitle>
                        <CardDescription>
                            {resources.length} resource{resources.length !== 1 ? "s" : ""} in your collection
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resources.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg">No resources yet</p>
                                <p className="text-sm mt-2">
                                    Click "Add Resource" to create your first learning resource!
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableCaption>Your learning resources</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resources.map((resource) => (
                                        <TableRow key={resource.id}>
                                            <TableCell className="font-medium">{resource.name}</TableCell>
                                            <TableCell>{getTypeName(resource.resource_type_id)}</TableCell>
                                            <TableCell>{getPlatformName(resource.resource_platform_id)}</TableCell>
                                            <TableCell>{getProgressBadge(resource.progress_status)}</TableCell>
                                            <TableCell>
                                                {resource.rating ? `⭐ ${resource.rating}/5` : "Not rated"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/resources/${resource.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/resources/${resource.id}/edit`)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteResource(resource.id)}
                                                        disabled={isDeleting === resource.id}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ResourcesPage
