// Resource Types
export interface Resource {
    id: number
    name: string
    user_id: number
    resource_type_id?: number
    resource_platform_id?: number
    description?: string
    notes?: string
    rating?: number

    // Progress tracking
    progress_status?: string // "not_started" | "in_progress" | "completed"
    estimated_hours?: number
    hours_spent?: number
    completion_date?: string
    started_date?: string

    // AI-generated fields
    ai_summary?: string
    ai_tags?: string
    ai_category?: string
    ai_mastery_date?: string

    created_at?: string
    updated_at?: string
}

export interface ResourceType {
    id: number
    name: string
    user_id?: number
    created_at: string
}

export interface ResourcePlatform {
    id: number
    name: string
    user_id?: number
    created_at: string
}

export interface ResourceCreate {
    name: string
    resourceTypeId?: number
    resourcePlatformId?: number
    description?: string
    notes?: string
    rating?: number
    progress_status?: string
    estimated_hours?: number
    hours_spent?: number
}

export interface ResourceUpdate {
    name?: string
    resourceTypeId?: number
    resourcePlatformId?: number
    description?: string
    notes?: string
    rating?: number
    progress_status?: string
    estimated_hours?: number
    hours_spent?: number
}
