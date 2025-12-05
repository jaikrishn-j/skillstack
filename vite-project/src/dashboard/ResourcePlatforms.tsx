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
import { FieldLabel } from "@/components/ui/field"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import type { ResourcePlatform } from "@/types/resource"
import {
    getAllResourcePlatforms,
    createResourcePlatform,
    updateResourcePlatform,
    deleteResourcePlatform,
} from "@/utils/resourceApi"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ResourcePlatformsPage = () => {
    const [platforms, setPlatforms] = useState<ResourcePlatform[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingPlatform, setEditingPlatform] = useState<ResourcePlatform | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const [formData, setFormData] = useState({ name: "" })
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const data = await getAllResourcePlatforms()
            setPlatforms(data)
        } catch (error) {
            console.error("Error fetching resource platforms:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        try {
            await createResourcePlatform(formData.name)
            setIsCreateDialogOpen(false)
            setFormData({ name: "" })
            fetchData()
        } catch (error) {
            console.error("Error creating resource platform:", error)
        }
    }

    const handleEdit = (platform: ResourcePlatform) => {
        setEditingPlatform(platform)
        setFormData({ name: platform.name })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingPlatform) return
        try {
            await updateResourcePlatform(editingPlatform.id, formData.name)
            setIsEditDialogOpen(false)
            setEditingPlatform(null)
            setFormData({ name: "" })
            fetchData()
        } catch (error) {
            console.error("Error updating resource platform:", error)
        }
    }

    const handleDeleteClick = (id: number) => {
        setDeletingId(id)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingId) return
        try {
            await deleteResourcePlatform(deletingId)
            setIsDeleteDialogOpen(false)
            setDeletingId(null)
            fetchData()
        } catch (error) {
            console.error("Error deleting resource platform:", error)
            alert("Failed to delete. It might be in use by some resources.")
        }
    }

    if (isLoading) {
        return <LoadingScreen message="Loading resource platforms..." />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-6 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/home")}
                            className="mb-2 pl-0 hover:pl-2 transition-all"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Resource Platforms
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage platforms like "Udemy", "YouTube", etc.
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Platform
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Resource Platform</DialogTitle>
                                <DialogDescription>
                                    Add a new platform where you find your learning resources.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    placeholder="e.g. Udemy"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate} disabled={!formData.name}>
                                    Create
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Platforms Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Platforms</CardTitle>
                        <CardDescription>
                            {platforms.length} platform{platforms.length !== 1 ? "s" : ""} defined
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {platforms.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No resource platforms defined yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {platforms.map((platform) => (
                                        <TableRow key={platform.id}>
                                            <TableCell className="font-medium">{platform.name}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(platform)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(platform.id)}
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

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Resource Platform</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={!formData.name}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Alert */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the resource platform.
                                If any resources are using this platform, the deletion might fail.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

export default ResourcePlatformsPage
