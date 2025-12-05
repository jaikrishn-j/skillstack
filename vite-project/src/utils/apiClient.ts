import axios from "axios"
import { getTokens, refreshAccessToken } from "./auth"
import { API_BASE_URL } from "@/config/api"

const apiClient = axios.create({
    baseURL: API_BASE_URL,
})

// Request interceptor to add the access token to headers
apiClient.interceptors.request.use(
    (config) => {
        const { accessToken } = getTokens()
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle 401 errors and token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshed = await refreshAccessToken()
                if (refreshed) {
                    // Get the new token
                    const { accessToken } = getTokens()

                    // Update the header for the retry
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`

                    // Retry the original request
                    return apiClient(originalRequest)
                }
            } catch (refreshError) {
                // Refresh failed, let the original error propagate
                // The app should redirect to login if needed
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export { apiClient }
export default apiClient
