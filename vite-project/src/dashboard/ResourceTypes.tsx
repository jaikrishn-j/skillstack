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
import type { ResourceType } from "@/types/resource"
import {
    getAllResourceTypes,
    createResourceType,
    updateResourceType,
    deleteResourceType,
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

const ResourceTypesPage = () => {
    const [types, setTypes] = useState<ResourceType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingType, setEditingType] = useState<ResourceType | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const [formData, setFormData] = useState({ name: "" })
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const data = await getAllResourceTypes()
            setTypes(data)
        } catch (error) {
            console.error("Error fetching resource types:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        try {
            await createResourceType(formData.name)
            setIsCreateDialogOpen(false)
            setFormData({ name: "" })
            fetchData()
        } catch (error) {
            console.error("Error creating resource type:", error)
        }
    }

    const handleEdit = (type: ResourceType) => {
        setEditingType(type)
        setFormData({ name: type.name })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingType) return
        try {
            await updateResourceType(editingType.id, formData.name)
            setIsEditDialogOpen(false)
            setEditingType(null)
            setFormData({ name: "" })
            fetchData()
        } catch (error) {
            console.error("Error updating resource type:", error)
        }
    }

    const handleDeleteClick = (id: number) => {
        setDeletingId(id)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingId) return
        try {
            await deleteResourceType(deletingId)
            setIsDeleteDialogOpen(false)
            setDeletingId(null)
            fetchData()
        } catch (error) {
            console.error("Error deleting resource type:", error)
            // Ideally show a toast here if it fails due to being in use
            alert("Failed to delete. It might be in use by some resources.")
        }
    }

    if (isLoading) {
        return <LoadingScreen message="Loading resource types..." />
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
                            Resource Types
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage categories for your learning resources
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Resource Type</DialogTitle>
                                <DialogDescription>
                                    Add a new category like "Course", "Book", or "Video".
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    placeholder="e.g. Course"
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

                {/* Types Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Types</CardTitle>
                        <CardDescription>
                            {types.length} type{types.length !== 1 ? "s" : ""} defined
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {types.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No resource types defined yet.</p>
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
                                    {types.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(type)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(type.id)}
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
                            <DialogTitle>Edit Resource Type</DialogTitle>
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
                                This action cannot be undone. This will permanently delete the resource type.
                                If any resources are using this type, the deletion might fail.
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

export default ResourceTypesPage
