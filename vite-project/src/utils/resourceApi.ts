import { API_ENDPOINTS } from "@/config/api"
import type { Resource, ResourceCreate, ResourceType, ResourcePlatform } from "@/types/resource"
import apiClient from "./apiClient"

// Resources
export const getAllResources = async (): Promise<Resource[]> => {
    const response = await apiClient.get(API_ENDPOINTS.resources.getAll)
    return response.data
}

export const getResource = async (id: number): Promise<Resource> => {
    const response = await apiClient.get(API_ENDPOINTS.resources.getOne(id))
    return response.data
}

export const createResource = async (resource: ResourceCreate): Promise<Resource> => {
    // Send snake_case to the backend
    const response = await apiClient.post(API_ENDPOINTS.resources.create, {
        name: resource.name,
        resource_type_id: resource.resourceTypeId,
        resource_platform_id: resource.resourcePlatformId,
        description: resource.description,
        notes: resource.notes,
        rating: resource.rating,
        progress_status: resource.progress_status,
        estimated_hours: resource.estimated_hours,
        hours_spent: resource.hours_spent,
    })
    return response.data
}

export const updateResource = async (id: number, resource: any): Promise<Resource> => {
    const response = await apiClient.put(API_ENDPOINTS.resources.update(id), resource)
    return response.data
}

export const deleteResource = async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.resources.delete(id))
}

export interface ResourceStats {
    total_resources: number
    completed_resources: number
    in_progress_resources: number
    not_started_resources: number
    completion_rate: number
    total_estimated_hours: number
    total_hours_spent: number
}

export const getResourceStats = async (): Promise<ResourceStats> => {
    const response = await apiClient.get(API_ENDPOINTS.resources.stats)
    return response.data
}

// Resource Types
export const getAllResourceTypes = async (): Promise<ResourceType[]> => {
    const response = await apiClient.get(API_ENDPOINTS.resourceTypes.getAll)
    return response.data
}

export const createResourceType = async (name: string): Promise<ResourceType> => {
    const response = await apiClient.post(API_ENDPOINTS.resourceTypes.create, { name })
    return response.data
}

export const updateResourceType = async (id: number, name: string): Promise<ResourceType> => {
    const response = await apiClient.put(API_ENDPOINTS.resourceTypes.update(id), { name })
    return response.data
}

export const deleteResourceType = async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.resourceTypes.delete(id))
}

// Resource Platforms
export const getAllResourcePlatforms = async (): Promise<ResourcePlatform[]> => {
    const response = await apiClient.get(API_ENDPOINTS.resourcePlatforms.getAll)
    return response.data
}

export const createResourcePlatform = async (name: string): Promise<ResourcePlatform> => {
    const response = await apiClient.post(API_ENDPOINTS.resourcePlatforms.create, { name })
    return response.data
}

export const updateResourcePlatform = async (id: number, name: string): Promise<ResourcePlatform> => {
    const response = await apiClient.put(API_ENDPOINTS.resourcePlatforms.update(id), { name })
    return response.data
}

export const deleteResourcePlatform = async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.resourcePlatforms.delete(id))
}
// In your existing resourceApi.ts file, add:
// export const getRecentActivities = async (limit = 5): Promise<Activity[]> => {
//     try {
//         // This is a mock implementation - replace with actual API call
//         const response = await fetch('/api/activities/recent', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch activities');
//         }

//         const data = await response.json();
//         return data.activities;


//     } catch (error) {
//         console.error('Error fetching recent activities:', error);
//         return [];
//     }
// };

// Also add this Activity interface if not already defined
export interface Activity {
    id: string
    type: 'resource_added' | 'resource_viewed' | 'resource_updated' | 'resource_completed' | 'progress_updated'
    title: string
    description: string
    timestamp: Date
    resourceId: number
    resourceName: string
    metadata?: {
        resourceType?: string
        platform?: string
        progress?: number
        hoursSpent?: number
        previousProgress?: number
    }
}

