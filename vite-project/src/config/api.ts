// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export const API_ENDPOINTS = {
    auth: {
        signin: `${API_BASE_URL}/auth/signin`,
        signup: `${API_BASE_URL}/auth/signup`,
        refresh: `${API_BASE_URL}/auth/refresh`,
        getSession: `${API_BASE_URL}/auth/get_session`,
        logout: `${API_BASE_URL}/auth/logout`,
    },
    resources: {
        getAll: `${API_BASE_URL}/api/resources`,
        getOne: (id: number) => `${API_BASE_URL}/api/resources/${id}`,
        create: `${API_BASE_URL}/api/resources`,
        update: (id: number) => `${API_BASE_URL}/api/resources/${id}`,
        delete: (id: number) => `${API_BASE_URL}/api/resources/${id}`,
        stats: `${API_BASE_URL}/api/resources/stats/overview`,
    },
    resourceTypes: {
        getAll: `${API_BASE_URL}/api/resource-types`,
        create: `${API_BASE_URL}/api/resource-types`,
        update: (id: number) => `${API_BASE_URL}/api/resource-types/${id}`,
        delete: (id: number) => `${API_BASE_URL}/api/resource-types/${id}`,
    },
    resourcePlatforms: {
        getAll: `${API_BASE_URL}/api/resource-platforms`,
        create: `${API_BASE_URL}/api/resource-platforms`,
        update: (id: number) => `${API_BASE_URL}/api/resource-platforms/${id}`,
        delete: (id: number) => `${API_BASE_URL}/api/resource-platforms/${id}`,
    },
    ai: {
        recommendations: `${API_BASE_URL}/api/ai/recommendations`,
        summarizeNotes: `${API_BASE_URL}/api/ai/summarize-notes`,
        predictMastery: `${API_BASE_URL}/api/ai/predict-mastery`,
        categorize: `${API_BASE_URL}/api/ai/categorize`,
        insights: (id: number) => `${API_BASE_URL}/api/ai/insights/${id}`,
    }
}
