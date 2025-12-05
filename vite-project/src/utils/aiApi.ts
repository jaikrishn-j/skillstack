/**
 * AI Features API Client
 * Handles all AI-powered features
 */
import { apiClient } from "./apiClient"

export interface AIRecommendation {
    resource_id: number
    resource_name: string
    resource_type?: string
    platform?: string
    reason: string
    priority: number
}

export interface NoteSummary {
    resource_id: number
    resource_name: string
    summary: string
    key_concepts: string[]
    technical_terms: Record<string, string>
    main_topics: string[]
}

export interface MasteryPrediction {
    resource_id: number
    predicted_date: string
    confidence: number
    days_remaining: number
    hours_remaining?: number
    recommendation: string
}

export interface ResourceCategorization {
    resource_id: number
    resource_name: string
    category: string
    subcategory: string
    skill_tags: string[]
    difficulty_level: string
    related_skills: string[]
}

export interface ResourceInsights {
    resource_id: number
    resource_name: string
    ai_summary?: string
    ai_tags: string[]
    ai_category?: string
    ai_mastery_date?: string
}

/**
 * Get personalized resource recommendations
 */
export async function getRecommendations(limit: number = 5): Promise<AIRecommendation[]> {
    const response = await apiClient.get(`/api/ai/recommendations?limit=${limit}`)
    return response.data.recommendations
}

/**
 * Summarize notes for a resource
 */
export async function summarizeNotes(
    resourceId: number,
    saveToResource: boolean = true
): Promise<NoteSummary> {
    console.log('🤖 [AI API] Summarizing notes for resource:', resourceId)
    try {
        const response = await apiClient.post("/api/ai/summarize-notes", {
            resource_id: resourceId,
            save_to_resource: saveToResource,
        })
        console.log('✅ [AI API] Summarize notes response:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [AI API] Summarize notes error:', error)
        throw error
    }
}

/**
 * Predict mastery/completion date for a resource
 */
export async function predictMastery(
    resourceId: number,
    saveToResource: boolean = true
): Promise<MasteryPrediction> {
    console.log('🎯 [AI API] Predicting mastery for resource:', resourceId)
    try {
        const response = await apiClient.post("/api/ai/predict-mastery", {
            resource_id: resourceId,
            save_to_resource: saveToResource,
        })
        console.log('✅ [AI API] Predict mastery response:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [AI API] Predict mastery error:', error)
        throw error
    }
}

/**
 * Auto-categorize a resource
 */
export async function categorizeResource(
    resourceId: number,
    saveToResource: boolean = true
): Promise<ResourceCategorization> {
    console.log('🏷️ [AI API] Categorizing resource:', resourceId)
    try {
        const response = await apiClient.post("/api/ai/categorize", {
            resource_id: resourceId,
            save_to_resource: saveToResource,
        })
        console.log('✅ [AI API] Categorize response:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [AI API] Categorize error:', error)
        throw error
    }
}

/**
 * Get all AI insights for a resource
 */
export async function getResourceInsights(resourceId: number): Promise<ResourceInsights> {
    const response = await apiClient.get(`/api/ai/insights/${resourceId}`)
    return response.data
}
